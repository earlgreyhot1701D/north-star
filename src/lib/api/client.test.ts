import { describe, expect, it, vi, afterEach } from "vitest";
import { requestEvaluation, EvaluationError } from "./client";
import { EMPTY_PROFILE } from "@/lib/storage/profile";

const decision = {
  title: "Enter hackathon",
  description: "Build an app.",
  url: "",
  desiredOutcome: "",
};

const validResult = {
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

function mockFetch(body: unknown, ok = true, status = 200) {
  return vi.fn().mockResolvedValue({
    ok,
    status,
    json: async () => body,
  } as Response);
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("requestEvaluation", () => {
  it("returns a validated result on success", async () => {
    vi.stubGlobal("fetch", mockFetch(validResult));
    const result = await requestEvaluation(EMPTY_PROFILE, decision);
    expect(result.alignmentScore).toBe(92);
  });

  it("throws a friendly error with the server message on failure", async () => {
    vi.stubGlobal(
      "fetch",
      mockFetch({ error: "Origin not allowed." }, false, 403),
    );
    await expect(requestEvaluation(EMPTY_PROFILE, decision)).rejects.toThrow(
      "Origin not allowed.",
    );
  });

  it("throws when the response fails schema validation", async () => {
    vi.stubGlobal("fetch", mockFetch({ alignmentScore: 999 }));
    await expect(
      requestEvaluation(EMPTY_PROFILE, decision),
    ).rejects.toBeInstanceOf(EvaluationError);
  });

  it("throws a network error when fetch rejects", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("boom")));
    await expect(requestEvaluation(EMPTY_PROFILE, decision)).rejects.toThrow(
      /could not reach/i,
    );
  });
});
