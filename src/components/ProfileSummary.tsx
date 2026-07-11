"use client";

import type { Profile } from "@/lib/evaluation";
import { Panel } from "./Panel";

interface ProfileSummaryProps {
  profile: Profile | null;
  onEdit: () => void;
}

function Row({ badge, label, value }: { badge: string; label: string; value: string }) {
  return (
    <div className="grid grid-cols-[42px_1fr] items-start gap-3 border border-line/70 bg-black/20 p-3">
      <div
        className="grid h-9 w-9 place-items-center rounded-full border border-brass-dim text-brass"
        aria-hidden
      >
        {badge}
      </div>
      <div>
        <strong className="mb-0.5 block text-xs uppercase tracking-wide text-paper-dim">
          {label}
        </strong>
        <span className="text-paper">{value}</span>
      </div>
    </div>
  );
}

function preview(list: string[], fallback: string): string {
  return list.length > 0 ? list.join(" · ") : fallback;
}

export function ProfileSummary({ profile, onEdit }: ProfileSummaryProps) {
  return (
    <Panel ariaLabelledby="profile-summary-heading">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 id="profile-summary-heading" className="text-2xl">
          Your Profile Summary
        </h3>
        <button type="button" className="ns-btn ns-btn-ghost" onClick={onEdit}>
          {profile ? "Edit" : "Create"}
        </button>
      </div>

      {!profile ? (
        <p className="text-paper-dim">
          No profile yet. Create one so evaluations reflect your goals,
          strengths, and constraints.
        </p>
      ) : (
        <div className="grid gap-2">
          <Row badge="✥" label="Primary Goals" value={preview(profile.goals, "—")} />
          <Row
            badge="★"
            label="Priorities"
            value={preview(profile.priorities, "—")}
          />
          <Row
            badge="⚙"
            label="Strengths"
            value={preview(profile.strengths, "—")}
          />
          <Row
            badge="✎"
            label="Constraints"
            value={preview(profile.constraints, "—")}
          />
          <Row
            badge="◒"
            label="Risk Tolerance"
            value={
              profile.riskTolerance.charAt(0).toUpperCase() +
              profile.riskTolerance.slice(1)
            }
          />
          <Row
            badge="◴"
            label="Time Available"
            value={profile.timeAvailable || "—"}
          />
        </div>
      )}
    </Panel>
  );
}
