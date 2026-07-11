import { NextRequest, NextResponse } from "next/server";
import {
  evaluateRequestSchema,
  evaluationResponseSchema,
  INPUT_LIMITS,
  normalizeEvaluateRequest,
} from "@/lib/evaluation";
import { corsHeaders, isOriginAllowed } from "@/lib/server/cors";
import { logMeta } from "@/lib/server/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BODY_LIMIT = INPUT_LIMITS.maxRequestBytes;
// Give the upstream Lambda + Bedrock enough time, but fail friendly if it hangs.
const UPSTREAM_TIMEOUT_MS = 25_000;

function json(
  body: unknown,
  status: number,
  origin: string | null,
): NextResponse {
  return NextResponse.json(body, {
    status,
    headers: corsHeaders(origin),
  });
}

// Short, non-sensitive request id for correlating logs. Not user data.
function newRequestId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `req_${Date.now().toString(36)}`;
  }
}

export function OPTIONS(request: NextRequest): NextResponse {
  const origin = request.headers.get("origin");
  if (!isOriginAllowed(origin)) {
    return new NextResponse(null, { status: 403 });
  }
  return new NextResponse(null, { status: 204, headers: corsHeaders(origin) });
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const requestId = newRequestId();
  const startedAt = Date.now();
  const origin = request.headers.get("origin");
  const timestamp = new Date().toISOString();

  // 1. CORS: reject unknown browser origins.
  if (!isOriginAllowed(origin)) {
    logMeta("warn", {
      requestId,
      timestamp,
      outcome: "failure",
      reason: "origin_rejected",
    });
    return json({ error: "Origin not allowed." }, 403, null);
  }

  // 2. Reject oversized payloads via Content-Length (fast path).
  const declaredLength = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(declaredLength) && declaredLength > BODY_LIMIT) {
    return json(
      { error: "That request is too large. Please shorten your input." },
      413,
      origin,
    );
  }

  // 3. Read the body with a hard byte ceiling (defends against missing/lying
  //    Content-Length).
  let rawText: string;
  try {
    rawText = await request.text();
  } catch {
    return json({ error: "Could not read the request." }, 400, origin);
  }
  if (Buffer.byteLength(rawText, "utf8") > BODY_LIMIT) {
    return json(
      { error: "That request is too large. Please shorten your input." },
      413,
      origin,
    );
  }

  // 4. Parse + normalize + validate.
  let parsedBody: unknown;
  try {
    parsedBody = JSON.parse(rawText);
  } catch {
    return json({ error: "Invalid request format." }, 400, origin);
  }

  const normalized = normalizeEvaluateRequest(parsedBody);
  const validation = evaluateRequestSchema.safeParse(normalized);
  if (!validation.success) {
    logMeta("warn", {
      requestId,
      timestamp,
      outcome: "failure",
      reason: "validation_failed",
    });
    return json(
      {
        error:
          "Some fields are missing or invalid. Please complete the required fields and try again.",
      },
      400,
      origin,
    );
  }

  // 5. Forward to the AWS Lambda endpoint (via API Gateway).
  const upstream = process.env.EVALUATION_API_URL?.trim();
  if (!upstream) {
    logMeta("error", {
      requestId,
      timestamp,
      outcome: "failure",
      reason: "evaluation_api_url_not_configured",
    });
    return json(
      {
        error:
          "The evaluation service is not configured yet. Set EVALUATION_API_URL and try again.",
      },
      503,
      origin,
    );
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);
  let upstreamResponse: Response;
  try {
    upstreamResponse = await fetch(upstream, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-request-id": requestId,
      },
      body: JSON.stringify(validation.data),
      signal: controller.signal,
    });
  } catch (err) {
    clearTimeout(timer);
    const aborted = err instanceof DOMException && err.name === "AbortError";
    logMeta("error", {
      requestId,
      timestamp,
      durationMs: Date.now() - startedAt,
      outcome: "failure",
      reason: aborted ? "upstream_timeout" : "upstream_unreachable",
    });
    return json(
      {
        error: aborted
          ? "The evaluation took too long. Please try again."
          : "We could not reach the evaluation service. Please try again shortly.",
      },
      aborted ? 504 : 502,
      origin,
    );
  }
  clearTimeout(timer);

  let upstreamBody: unknown = null;
  try {
    upstreamBody = await upstreamResponse.json();
  } catch {
    upstreamBody = null;
  }

  if (!upstreamResponse.ok) {
    logMeta("error", {
      requestId,
      timestamp,
      durationMs: Date.now() - startedAt,
      outcome: "failure",
      reason: `upstream_status_${upstreamResponse.status}`,
    });
    return json(
      { error: "The evaluation service returned an error. Please try again." },
      502,
      origin,
    );
  }

  // 6. Validate the model/Lambda response before returning it to the browser.
  const responseValidation = evaluationResponseSchema.safeParse(upstreamBody);
  if (!responseValidation.success) {
    logMeta("error", {
      requestId,
      timestamp,
      durationMs: Date.now() - startedAt,
      outcome: "failure",
      reason: "invalid_upstream_response",
    });
    return json(
      { error: "The evaluation service returned an unexpected result." },
      502,
      origin,
    );
  }

  logMeta("info", {
    requestId,
    timestamp,
    durationMs: Date.now() - startedAt,
    outcome: "success",
  });
  return json(responseValidation.data, 200, origin);
}
