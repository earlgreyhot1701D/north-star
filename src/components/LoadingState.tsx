"use client";

import { Panel } from "./Panel";

export function LoadingState({
  message = "Evaluating your decision…",
}: {
  message?: string;
}) {
  return (
    <Panel>
      <div
        className="flex flex-col items-center gap-4 py-8 text-center"
        role="status"
        aria-live="polite"
      >
        <span
          className="h-12 w-12 rounded-full border-4 border-line border-t-signal motion-safe:animate-spin"
          aria-hidden
        />
        <p className="text-lg font-bold uppercase tracking-wide text-signal">
          {message}
        </p>
        <p className="text-sm text-paper-dim">
          Weighing the opportunity against your profile.
        </p>
      </div>
    </Panel>
  );
}
