import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { POST, OPTIONS } from "./route";
import { INPUT_LIMITS } from "@/lib/evaluation";

const ORIGINAL = { ...process.env };

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

const validUpstream = {
  alignmentScore: 92,
  alignmentLabel: "Excellent Match",
  confidence: 87,
  recommendation: "Strong Yes",
  summary: "Good fit.",
  fits: ["a"],
  risks: ["b"],
  tradeoffs: ["c"],
  assumptions: ["d"],
  questions: ["e"],
  nextStep: "Go.",
};

function makeRequest(body: string, origin?: string): NextRequest {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (origin) headers.origin = origin;
  headers["content-length"] = String(Buffer.byteLength(body, "utf8"));
  return new NextRequest("https://north-star.vercel.app/api/evaluate", {
    method: "POST",
    headers,
    body,
  });
}

beforeEach(() => {
  process.env.ALLOWED_ORIGIN = "https://north-star.vercel.app";
  process.env.LOCAL_ORIGIN = "http://localhost:3000";
  process.env.EVALUATION_API_URL = "https://api.example.com/prod/evaluate";
});
afterEach(() => {
  process.env = { ...ORIGINAL };
  vi.restoreAllMocks();
});

describe("POST /api/evaluate", () => {
  it("rejects an unauthorized origin with 403", async () => {
    const res = await POST(
      makeRequest(JSON.stringify(validBody), "https://evil.example.com"),
    );
    expect(res.status).toBe(403);
  });

  it("rejects oversized payloads with 413", async () => {
    const big = JSON.stringify({
      ...validBody,
      decision: {
        ...validBody.decision,
        description: "x".repeat(INPUT_LIMITS.maxRequestBytes + 100),
      },
    });
    const res = await POST(makeRequest(big));
    expect(res.status).toBe(413);
  });

  it("rejects invalid JSON with 400", async () => {
    const res = await POST(makeRequest("{not json"));
    expect(res.status).toBe(400);
  });

  it("rejects missing required fields with 400", async () => {
    const bad = JSON.stringify({
      ...validBody,
      decision: { ...validBody.decision, title: "", description: "" },
    });
    const res = await POST(makeRequest(bad));
    expect(res.status).toBe(400);
  });

  it("returns 503 when EVALUATION_API_URL is not configured", async () => {
    delete process.env.EVALUATION_API_URL;
    const res = await POST(makeRequest(JSON.stringify(validBody)));
    expect(res.status).toBe(503);
  });

  it("forwards to the Lambda and returns a validated 200 result", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => validUpstream,
      } as Response),
    );
    const res = await POST(
      makeRequest(JSON.stringify(validBody), "https://north-star.vercel.app"),
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.alignmentScore).toBe(92);
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe(
      "https://north-star.vercel.app",
    );
  });

  it("returns 502 when the upstream response fails validation", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ alignmentScore: 999 }),
      } as Response),
    );
    const res = await POST(makeRequest(JSON.stringify(validBody)));
    expect(res.status).toBe(502);
  });

  it("returns 504 when the upstream times out", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(
        Object.assign(new DOMException("aborted", "AbortError")),
      ),
    );
    const res = await POST(makeRequest(JSON.stringify(validBody)));
    expect(res.status).toBe(504);
  });

  it("does not leak internal details in error responses", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("secret stack trace")),
    );
    const res = await POST(makeRequest(JSON.stringify(validBody)));
    const json = await res.json();
    expect(JSON.stringify(json)).not.toContain("secret stack trace");
  });
});

describe("OPTIONS /api/evaluate", () => {
  it("allows a configured origin", () => {
    const req = new NextRequest("https://north-star.vercel.app/api/evaluate", {
      method: "OPTIONS",
      headers: { origin: "https://north-star.vercel.app" },
    });
    expect(OPTIONS(req).status).toBe(204);
  });

  it("rejects an unauthorized origin", () => {
    const req = new NextRequest("https://north-star.vercel.app/api/evaluate", {
      method: "OPTIONS",
      headers: { origin: "https://evil.example.com" },
    });
    expect(OPTIONS(req).status).toBe(403);
  });
});
