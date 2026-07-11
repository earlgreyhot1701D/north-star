"use client";

import type { RecentDecision } from "@/lib/storage/recent";
import { Panel } from "./Panel";

interface RecentDecisionsProps {
  decisions: RecentDecision[];
  onSelect: (decision: RecentDecision) => void;
  onClear: () => void;
}

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function RecentDecisions({
  decisions,
  onSelect,
  onClear,
}: RecentDecisionsProps) {
  return (
    <Panel ariaLabelledby="recent-heading">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 id="recent-heading" className="text-2xl">
          Recent Decisions
        </h3>
        {decisions.length > 0 && (
          <button type="button" className="ns-btn ns-btn-ghost" onClick={onClear}>
            Clear
          </button>
        )}
      </div>

      {decisions.length === 0 ? (
        <p className="text-paper-dim">
          Your evaluated decisions will appear here. They are stored only in this
          browser.
        </p>
      ) : (
        <ul className="grid list-none gap-2 p-0">
          {decisions.map((decision) => (
            <li key={decision.id}>
              <button
                type="button"
                onClick={() => onSelect(decision)}
                className="grid w-full grid-cols-[1fr_auto] items-center gap-3 border border-line/70 bg-black/20 p-3 text-left transition-colors hover:border-signal"
              >
                <span>
                  <strong className="block text-paper">{decision.title}</strong>
                  <small className="text-paper-dim">
                    {formatDate(decision.createdAt)} · {decision.alignmentLabel}
                  </small>
                </span>
                <span
                  className="grid h-12 w-12 place-items-center rounded-full border-2 border-signal text-xl font-black text-signal"
                  aria-label={`Score ${decision.alignmentScore}`}
                >
                  {decision.alignmentScore}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
