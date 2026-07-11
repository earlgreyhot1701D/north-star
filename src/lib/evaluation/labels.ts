// Alignment score → label mapping. The score represents PERSONAL FIT,
// not objective quality. Bands are defined by the PRD and task spec.
export const ALIGNMENT_LABELS = [
  { min: 90, max: 100, label: "Excellent Match" },
  { min: 75, max: 89, label: "Strong Match" },
  { min: 60, max: 74, label: "Moderate Match" },
  { min: 40, max: 59, label: "Weak Match" },
  { min: 0, max: 39, label: "Poor Match" },
] as const;

export type AlignmentLabel = (typeof ALIGNMENT_LABELS)[number]["label"];

export function labelForScore(score: number): AlignmentLabel {
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  const band = ALIGNMENT_LABELS.find(
    (b) => clamped >= b.min && clamped <= b.max,
  );
  // The bands cover 0..100 exhaustively, so this fallback is unreachable
  // in practice but keeps the return type honest.
  return band ? band.label : "Poor Match";
}
