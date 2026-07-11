import { sanitizeList, sanitizeText } from "./sanitize";
import { RISK_TOLERANCE_VALUES, type RiskTolerance } from "./limits";

// Sanitize an untrusted request payload (strip control chars, trim) BEFORE it is
// handed to Zod for validation. Shape mistakes are left for Zod to reject.
export function normalizeEvaluateRequest(raw: unknown): unknown {
  if (typeof raw !== "object" || raw === null) return raw;
  const input = raw as Record<string, unknown>;
  const profile = (input.profile ?? {}) as Record<string, unknown>;
  const decision = (input.decision ?? {}) as Record<string, unknown>;

  const rt = sanitizeText(profile.riskTolerance).toLowerCase();
  const riskTolerance: RiskTolerance = (
    RISK_TOLERANCE_VALUES as readonly string[]
  ).includes(rt)
    ? (rt as RiskTolerance)
    : "moderate";

  return {
    profile: {
      goals: sanitizeList(profile.goals),
      priorities: sanitizeList(profile.priorities),
      strengths: sanitizeList(profile.strengths),
      constraints: sanitizeList(profile.constraints),
      riskTolerance,
      timeAvailable: sanitizeText(profile.timeAvailable),
      notes: sanitizeText(profile.notes),
    },
    decision: {
      title: sanitizeText(decision.title),
      description: sanitizeText(decision.description),
      url: sanitizeText(decision.url),
      desiredOutcome: sanitizeText(decision.desiredOutcome),
    },
  };
}
