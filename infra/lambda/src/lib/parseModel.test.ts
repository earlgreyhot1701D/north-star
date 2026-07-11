import { describe, expect, it } from "vitest";
import {
  extractJsonObject,
  parseEvaluation,
  ModelResponseError,
} from "./parseModel";

const valid = {
  alignmentScore: 82,
  alignmentLabel: "Poor Match", // deliberately wrong; should be reconciled
  confidence: 70,
  recommendation: "Yes",
  summary: "Fits reasonably.",
  fits: ["a"],
  risks: ["b"],
  tradeoffs: ["c"],
  assumptions: ["d"],
  questions: ["e"],
  nextStep: "Do it.",
};

describe("extractJsonObject", () => {
  it("extracts a bare JSON object", () => {
    expect(extractJsonObject('{"a":1}')).toBe('{"a":1}');
  });

  it("strips code fences", () => {
    expect(extractJsonObject('```json\n{"a":1}\n```')).toBe('{"a":1}');
  });

  it("ignores prose before and after", () => {
    expect(extractJsonObject('Here you go: {"a":1} thanks')).toBe('{"a":1}');
  });

  it("handles braces inside strings", () => {
    expect(extractJsonObject('{"a":"}{"}')).toBe('{"a":"}{"}');
  });

  it("returns null when there is no object", () => {
    expect(extractJsonObject("no json here")).toBeNull();
  });
});

describe("parseEvaluation", () => {
  it("parses valid model output", () => {
    const result = parseEvaluation(JSON.stringify(valid));
    expect(result.alignmentScore).toBe(82);
  });

  it("reconciles the label with the score band", () => {
    // 82 -> Strong Match, overriding the model's wrong "Poor Match".
    const result = parseEvaluation(JSON.stringify(valid));
    expect(result.alignmentLabel).toBe("Strong Match");
  });

  it("throws ModelResponseError on invalid JSON", () => {
    expect(() => parseEvaluation("not json")).toThrow(ModelResponseError);
  });

  it("throws ModelResponseError when schema validation fails", () => {
    expect(() =>
      parseEvaluation(JSON.stringify({ ...valid, alignmentScore: 999 })),
    ).toThrow(ModelResponseError);
  });

  it("throws ModelResponseError on empty output", () => {
    expect(() => parseEvaluation("")).toThrow(ModelResponseError);
  });
});
