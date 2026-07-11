import type {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
} from "aws-lambda";
import { randomUUID } from "node:crypto";
import { INPUT_LIMITS } from "./lib/limits";
import { evaluateRequestSchema } from "./lib/schemas";
import { normalizeEvaluateRequest } from "./lib/normalize";
import { invokeModel, DEFAULT_MODEL_ID } from "./lib/bedrock";
import { parseEvaluation, ModelResponseError } from "./lib/parseModel";
import { logMeta } from "./lib/logger";

function allowedOrigins(): string[] {
  return [process.env.ALLOWED_ORIGIN, process.env.LOCAL_ORIGIN]
    .filter((o): o is string => typeof o === "string" && o.trim().length > 0)
    .map((o) => o.trim().replace(/\/$/, ""));
}

function corsHeaders(origin: string | undefined): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Vary: "Origin",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, x-request-id",
  };
  const allowlist = allowedOrigins();
  const normalized = origin?.replace(/\/$/, "");
  if (normalized && allowlist.includes(normalized)) {
    headers["Access-Control-Allow-Origin"] = normalized;
  }
  return headers;
}

function respond(
  statusCode: number,
  body: unknown,
  origin: string | undefined,
): APIGatewayProxyResult {
  return {
    statusCode,
    headers: corsHeaders(origin),
    body: JSON.stringify(body),
  };
}

export const handler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  const startedAt = Date.now();
  const timestamp = new Date().toISOString();
  const headers = event.headers ?? {};
  const origin = headers.origin ?? headers.Origin;
  const requestId =
    headers["x-request-id"] ?? headers["X-Request-Id"] ?? randomUUID();
  const modelId = process.env.BEDROCK_MODEL_ID?.trim() || DEFAULT_MODEL_ID;

  // CORS preflight.
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: corsHeaders(origin), body: "" };
  }

  if (event.httpMethod && event.httpMethod !== "POST") {
    return respond(405, { error: "Method not allowed." }, origin);
  }

  // Oversized payload guard.
  const rawBody = event.body ?? "";
  if (Buffer.byteLength(rawBody, "utf8") > INPUT_LIMITS.maxRequestBytes) {
    return respond(
      413,
      { error: "That request is too large. Please shorten your input." },
      origin,
    );
  }

  // Parse JSON.
  let parsedBody: unknown;
  try {
    parsedBody = rawBody ? JSON.parse(rawBody) : {};
  } catch {
    logMeta("warn", {
      requestId,
      timestamp,
      outcome: "failure",
      reason: "invalid_json",
    });
    return respond(400, { error: "Invalid request format." }, origin);
  }

  // Sanitize + validate.
  const normalized = normalizeEvaluateRequest(parsedBody);
  const validation = evaluateRequestSchema.safeParse(normalized);
  if (!validation.success) {
    logMeta("warn", {
      requestId,
      timestamp,
      outcome: "failure",
      reason: "validation_failed",
    });
    return respond(
      400,
      {
        error:
          "Some fields are missing or invalid. Please complete the required fields and try again.",
      },
      origin,
    );
  }

  // Invoke Bedrock and validate the model response.
  try {
    const { profile, decision } = validation.data;
    const result = await invokeModel(profile, decision);
    const evaluation = parseEvaluation(result.text);

    logMeta("info", {
      requestId,
      timestamp,
      durationMs: Date.now() - startedAt,
      outcome: "success",
      modelId: result.modelId,
      inputTokens: result.inputTokens,
      outputTokens: result.outputTokens,
    });
    return respond(200, evaluation, origin);
  } catch (err) {
    const isModelError = err instanceof ModelResponseError;
    logMeta("error", {
      requestId,
      timestamp,
      durationMs: Date.now() - startedAt,
      outcome: "failure",
      modelId,
      // Reason is a short, non-sensitive code — never the raw error or content.
      reason: isModelError ? "model_response_invalid" : "bedrock_invoke_failed",
    });
    // Never expose stack traces or AWS error details to the caller.
    return respond(
      502,
      {
        error:
          "We could not complete this evaluation right now. Please try again shortly.",
      },
      origin,
    );
  }
};
