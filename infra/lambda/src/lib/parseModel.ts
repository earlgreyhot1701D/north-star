import { evaluationResponseSchema, type EvaluationResponse } from "./schemas";
import { labelForScore } from "./labels";

/**
 * Extract the first balanced JSON object from a model completion. Nova Lite is
 * instructed to return raw JSON, but we defensively strip code fences and any
 * leading/trailing prose.
 */
export function extractJsonObject(text: string): string | null {
  if (!text) return null;
  let cleaned = text.trim();
  // Strip ```json ... ``` or ``` ... ``` fences.
  const fence = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence && fence[1]) cleaned = fence[1].trim();

  const start = cleaned.indexOf("{");
  if (start === -1) return null;

  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let i = start; i < cleaned.length; i += 1) {
    const ch = cleaned[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (ch === "\\") escaped = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') inString = true;
    else if (ch === "{") depth += 1;
    else if (ch === "}") {
      depth -= 1;
      if (depth === 0) return cleaned.slice(start, i + 1);
    }
  }
  return null;
}

export class ModelResponseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ModelResponseError";
  }
}

/**
 * Parse + validate a model completion into a strict EvaluationResponse.
 * Reconciles the alignment label with the score band so the two never disagree.
 * Throws ModelResponseError on any failure.
 */
export function parseEvaluation(text: string): EvaluationResponse {
  const jsonText = extractJsonObject(text);
  if (!jsonText) {
    throw new ModelResponseError("No JSON object found in model output.");
  }

  let raw: unknown;
  try {
    raw = JSON.parse(jsonText);
  } catch {
    throw new ModelResponseError("Model output was not valid JSON.");
  }

  // Force the label to match the numeric score band before validation, so a
  // mismatched label from the model cannot leak to the client.
  if (raw && typeof raw === "object") {
    const obj = raw as Record<string, unknown>;
    if (typeof obj.alignmentScore === "number") {
      obj.alignmentLabel = labelForScore(obj.alignmentScore);
    }
  }

  const parsed = evaluationResponseSchema.safeParse(raw);
  if (!parsed.success) {
    throw new ModelResponseError("Model output failed schema validation.");
  }
  return parsed.data;
}
