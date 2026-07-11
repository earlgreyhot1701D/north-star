// Central input limits shared by the client, the Next.js proxy, and the Lambda.
// Keeping them in one module guarantees the browser and server agree.
export const INPUT_LIMITS = {
  decisionTitle: 200,
  opportunityDescription: 8000,
  desiredOutcome: 1500,
  profileNotes: 2000,
  // Free-form list/short-text fields.
  shortField: 500,
  listItem: 200,
  maxListItems: 25,
  // Full request body ceiling (bytes).
  maxRequestBytes: 16 * 1024,
} as const;

export const RISK_TOLERANCE_VALUES = ["low", "moderate", "high"] as const;
export type RiskTolerance = (typeof RISK_TOLERANCE_VALUES)[number];

export const RECOMMENDATION_VALUES = [
  "Strong Yes",
  "Yes",
  "Maybe",
  "Lean No",
  "No",
] as const;
export type Recommendation = (typeof RECOMMENDATION_VALUES)[number];
