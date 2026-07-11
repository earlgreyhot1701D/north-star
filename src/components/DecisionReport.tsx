"use client";

import type { EvaluationResponse } from "@/lib/evaluation";
import { Panel } from "./Panel";
import { RecommendationPanel } from "./RecommendationPanel";

interface DecisionReportProps {
  title: string;
  result: EvaluationResponse;
}

function ReportList({
  heading,
  icon,
  items,
}: {
  heading: string;
  icon: string;
  items: string[];
}) {
  if (items.length === 0) return null;
  return (
    <section className="border border-line/70 bg-black/20 p-4">
      <h4 className="mb-3 flex items-center gap-2 text-lg text-paper">
        <span className="text-brass" aria-hidden>
          {icon}
        </span>
        {heading}
      </h4>
      <ul className="grid list-none gap-2 p-0">
        {items.map((item, index) => (
          <li
            key={`${heading}-${index}`}
            className="border-l-2 border-brass-dim pl-3 text-paper-dim"
          >
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}

export function DecisionReport({ title, result }: DecisionReportProps) {
  return (
    <Panel ariaLabelledby="report-heading">
      <h3 id="report-heading" className="mb-1 text-2xl">
        Decision Report
      </h3>
      <p className="mb-5 text-paper-dim">{title}</p>

      <RecommendationPanel result={result} />

      <div className="mt-6 grid gap-3 md:grid-cols-2">
        <ReportList heading="Why This Fits" icon="✓" items={result.fits} />
        <ReportList heading="Potential Risks" icon="⚠" items={result.risks} />
        <ReportList heading="Tradeoffs" icon="⇄" items={result.tradeoffs} />
        <ReportList
          heading="Hidden Assumptions"
          icon="◔"
          items={result.assumptions}
        />
        <ReportList
          heading="Questions to Consider"
          icon="?"
          items={result.questions}
        />
      </div>

      <section className="mt-4 border border-signal/40 bg-signal/10 p-4">
        <h4 className="mb-2 flex items-center gap-2 text-lg text-signal">
          <span aria-hidden>➜</span> Practical Next Step
        </h4>
        <p className="text-paper">{result.nextStep}</p>
      </section>
    </Panel>
  );
}
