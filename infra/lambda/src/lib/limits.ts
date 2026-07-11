// Input limits — mirror of src/lib/evaluation/limits.ts in the web app.
// Kept self-contained so the Lambda deploys independently.
export const INPUT_LIMITS = {
  decisionTitle: 200,
  opportunityDescription: 8000,
  desiredOutcome: 1500,
  profileNotes: 2000,
  shortField: 500,
  listItem: 200,
  maxListItems: 25,
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
