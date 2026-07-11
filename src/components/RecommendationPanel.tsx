"use client";

import type { EvaluationResponse } from "@/lib/evaluation";
import { AlignmentGauge } from "./AlignmentGauge";

interface RecommendationPanelProps {
  result: EvaluationResponse;
}

// The headline block: gauge + recommendation + summary. Note the fixed
// disclaimer that the score is personal fit, not objective quality.
export function RecommendationPanel({ result }: RecommendationPanelProps) {
  return (
    <div className="grid items-center gap-6 sm:grid-cols-[200px_1fr]">
      <div className="justify-self-center">
        <AlignmentGauge
          score={result.alignmentScore}
          label={result.alignmentLabel}
        />
      </div>

      <div className="border border-line/70 bg-black/20 p-5">
        <div className="text-xs font-extrabold uppercase tracking-wide text-paper-dim">
          Recommendation
        </div>
        <h4 className="my-2 text-3xl text-signal">{result.recommendation}</h4>
        <p className="leading-relaxed text-paper-dim">{result.summary}</p>
        <p className="mt-4 text-xs uppercase tracking-wide text-brass">
          Confidence {result.confidence}% · Personal fit, not objective quality
        </p>
      </div>
    </div>
  );
}
