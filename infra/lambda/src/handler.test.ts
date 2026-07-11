import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import type { APIGatewayProxyEvent } from "aws-lambda";
import { handler } from "./handler";
import { __setClientForTests } from "./lib/bedrock";
import { INPUT_LIMITS } from "./lib/limits";

const validBody = {
  profile: {
    goals: ["Learn AWS"],
    priorities: ["Learning"],
    strengths: ["Lambda"],
    constraints: ["8 hours"],
    riskTolerance: "moderate",
    timeAvailable: "8 hours",
    notes: "",
  },
  decision: {
    title: "Enter hackathon",
    description: "Build an app this weekend.",
    url: "",
    desiredOutcome: "Portfolio",
  },
};

const modelJson = {
  alignmentScore: 88,
  alignmentLabel: "Excellent Match", // wrong; handler reconciles to Strong Match
  confidence: 80,
  recommendation: "Strong Yes",
  summary: "Strong personal fit.",
  fits: ["Aligns with goals"],
  risks: ["Time pressure"],
  tradeoffs: ["Less rest"],
  assumptions: ["You have the weekend free"],
  questions: ["Is the deadline firm?"],
  nextStep: "Register now.",
};

function event(
  body: unknown,
  method = "POST",
  headers: Record<string, string> = {},
): APIGatewayProxyEvent {
  return {
    httpMethod: method,
    body: typeof body === "string" ? body : JSON.stringify(body),
    headers: { origin: "https://north-star.vercel.app", ...headers },
  } as unknown as APIGatewayProxyEvent;
}

function stubClient(textOrError: string | Error) {
  __setClientForTests({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    send: async () => {
      if (textOrError instanceof Error) throw textOrError;
      return {
        output: { message: { content: [{ text: textOrError }] } },
        usage: { inputTokens: 100, outputTokens: 200 },
      };
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any);
}

beforeEach(() => {
  process.env.ALLOWED_ORIGIN = "https://north-star.vercel.app";
  process.env.LOCAL_ORIGIN = "http://localhost:3000";
  process.env.BEDROCK_MODEL_ID = "amazon.nova-lite-v1:0";
});
afterEach(() => {
  __setClientForTests(null);
  vi.restoreAllMocks();
});

describe("lambda handler", () => {
  it("returns 204 for CORS preflight", async () => {
    const res = await handler(event("", "OPTIONS"));
    expect(res.statusCode).toBe(204);
  });

  it("rejects non-POST methods with 405", async () => {
    const res = await handler(event(validBody, "GET"));
    expect(res.statusCode).toBe(405);
  });

  it("rejects oversized payloads with 413", async () => {
    const big = {
      ...validBody,
      decision: {
        ...validBody.decision,
        description: "x".repeat(INPUT_LIMITS.maxRequestBytes + 100),
      },
    };
    const res = await handler(event(big));
    expect(res.statusCode).toBe(413);
  });

  it("rejects invalid JSON with 400", async () => {
    const res = await handler(event("{not json"));
    expect(res.statusCode).toBe(400);
  });

  it("rejects missing required fields with 400", async () => {
    const res = await handler(
      event({ ...validBody, decision: { title: "", description: "" } }),
    );
    expect(res.statusCode).toBe(400);
  });

  it("returns 200 with a reconciled result on success", async () => {
    stubClient(JSON.stringify(modelJson));
    const res = await handler(event(validBody));
    expect(res.statusCode).toBe(200);
    const parsed = JSON.parse(res.body);
    expect(parsed.alignmentScore).toBe(88);
    // 88 -> Strong Match band, overriding the model's "Excellent Match".
    expect(parsed.alignmentLabel).toBe("Strong Match");
    expect(res.headers?.["Access-Control-Allow-Origin"]).toBe(
      "https://north-star.vercel.app",
    );
  });

  it("returns 502 when the model returns invalid JSON", async () => {
    stubClient("I cannot help with that.");
    const res = await handler(event(validBody));
    expect(res.statusCode).toBe(502);
  });

  it("returns 502 and hides details when Bedrock throws", async () => {
    stubClient(new Error("AccessDeniedException: secret detail"));
    const res = await handler(event(validBody));
    expect(res.statusCode).toBe(502);
    expect(res.body).not.toContain("secret detail");
    expect(res.body).not.toContain("AccessDenied");
  });

  it("omits the allow-origin header for an unauthorized origin", async () => {
    stubClient(JSON.stringify(modelJson));
    const res = await handler(
      event(validBody, "POST", { origin: "https://evil.example.com" }),
    );
    expect(res.headers?.["Access-Control-Allow-Origin"]).toBeUndefined();
  });
});
