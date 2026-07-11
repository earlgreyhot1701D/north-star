import { z } from "zod";
import { INPUT_LIMITS, RECOMMENDATION_VALUES, RISK_TOLERANCE_VALUES } from "./limits";
import { ALIGNMENT_LABELS } from "./labels";

const { listItem, maxListItems, shortField } = INPUT_LIMITS;

const listField = z
  .array(z.string().trim().min(1).max(listItem))
  .max(maxListItems)
  .default([]);

// ---------------------------------------------------------------------------
// Profile — the personal decision context. Stored only in browser localStorage.
// ---------------------------------------------------------------------------
export const profileSchema = z.object({
  goals: listField,
  priorities: listField,
  strengths: listField,
  constraints: listField,
  riskTolerance: z.enum(RISK_TOLERANCE_VALUES).default("moderate"),
  timeAvailable: z.string().trim().max(shortField).default(""),
  notes: z.string().trim().max(INPUT_LIMITS.profileNotes).default(""),
});

export type Profile = z.infer<typeof profileSchema>;

// ---------------------------------------------------------------------------
// Decision — the opportunity being evaluated.
// ---------------------------------------------------------------------------
export const decisionSchema = z.object({
  title: z.string().trim().min(1).max(INPUT_LIMITS.decisionTitle),
  description: z.string().trim().min(1).max(INPUT_LIMITS.opportunityDescription),
  url: z
    .string()
    .trim()
    .max(shortField)
    .url()
    .or(z.literal(""))
    .default(""),
  desiredOutcome: z
    .string()
    .trim()
    .max(INPUT_LIMITS.desiredOutcome)
    .default(""),
});

export type Decision = z.infer<typeof decisionSchema>;

// ---------------------------------------------------------------------------
// Full evaluate request.
// ---------------------------------------------------------------------------
export const evaluateRequestSchema = z.object({
  profile: profileSchema,
  decision: decisionSchema,
});

export type EvaluateRequest = z.infer<typeof evaluateRequestSchema>;

// ---------------------------------------------------------------------------
// Model / evaluation response.
// ---------------------------------------------------------------------------
const ALIGNMENT_LABEL_VALUES = ALIGNMENT_LABELS.map((b) => b.label) as [
  string,
  ...string[],
];

const bulletList = z.array(z.string().trim().min(1).max(1000)).max(20);

export const evaluationResponseSchema = z.object({
  alignmentScore: z.number().int().min(0).max(100),
  alignmentLabel: z.enum(ALIGNMENT_LABEL_VALUES as [string, ...string[]]),
  confidence: z.number().int().min(0).max(100),
  recommendation: z.enum(RECOMMENDATION_VALUES),
  summary: z.string().trim().min(1).max(2000),
  fits: bulletList,
  risks: bulletList,
  tradeoffs: bulletList,
  assumptions: bulletList,
  questions: bulletList,
  nextStep: z.string().trim().min(1).max(1000),
});

export type EvaluationResponse = z.infer<typeof evaluationResponseSchema>;
