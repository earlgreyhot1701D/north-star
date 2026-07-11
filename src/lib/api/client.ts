"use client";

import {
  evaluationResponseSchema,
  type Decision,
  type EvaluationResponse,
  type Profile,
} from "@/lib/evaluation";

export class EvaluationError extends Error {
  readonly status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "EvaluationError";
    this.status = status;
  }
}

const DEFAULT_MESSAGE =
  "We could not evaluate this decision right now. Please try again in a moment.";

/**
 * Calls the same-origin Next.js proxy (/api/evaluate), which forwards to the
 * AWS Lambda endpoint. The browser never talks to AWS or Bedrock directly.
 */
export async function requestEvaluation(
  profile: Profile,
  decision: Decision,
  signal?: AbortSignal,
): Promise<EvaluationResponse> {
  let response: Response;
  try {
    response = await fetch("/api/evaluate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profile, decision }),
      signal,
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new EvaluationError("The request was cancelled.", 0);
    }
    throw new EvaluationError(
      "We could not reach the evaluation service. Check your connection and try again.",
      0,
    );
  }

  let body: unknown = null;
  try {
    body = await response.json();
  } catch {
    body = null;
  }

  if (!response.ok) {
    let message = DEFAULT_MESSAGE;
    if (body && typeof body === "object" && "error" in body) {
      const candidate = (body as { error: unknown }).error;
      if (typeof candidate === "string" && candidate.length > 0) {
        message = candidate;
      }
    }
    throw new EvaluationError(message, response.status);
  }

  const parsed = evaluationResponseSchema.safeParse(body);
  if (!parsed.success) {
    throw new EvaluationError(
      "The evaluation service returned an unexpected result. Please try again.",
      502,
    );
  }
  return parsed.data;
}
