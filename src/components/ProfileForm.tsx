"use client";

import { useId, useState } from "react";
import {
  INPUT_LIMITS,
  RISK_TOLERANCE_VALUES,
  profileSchema,
  type Profile,
  type RiskTolerance,
} from "@/lib/evaluation";
import { Panel } from "./Panel";

interface ProfileFormProps {
  initial: Profile;
  onSave: (profile: Profile) => void;
  onCancel?: () => void;
}

// List fields are edited as one-item-per-line text and split on save.
function linesToList(value: string): string[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .slice(0, INPUT_LIMITS.maxListItems);
}

export function ProfileForm({ initial, onSave, onCancel }: ProfileFormProps) {
  const [goals, setGoals] = useState(initial.goals.join("\n"));
  const [priorities, setPriorities] = useState(initial.priorities.join("\n"));
  const [strengths, setStrengths] = useState(initial.strengths.join("\n"));
  const [constraints, setConstraints] = useState(
    initial.constraints.join("\n"),
  );
  const [riskTolerance, setRiskTolerance] = useState<RiskTolerance>(
    initial.riskTolerance,
  );
  const [timeAvailable, setTimeAvailable] = useState(initial.timeAvailable);
  const [notes, setNotes] = useState(initial.notes);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const ids = {
    goals: useId(),
    priorities: useId(),
    strengths: useId(),
    constraints: useId(),
    risk: useId(),
    time: useId(),
    notes: useId(),
  };

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaved(false);
    const candidate = {
      goals: linesToList(goals),
      priorities: linesToList(priorities),
      strengths: linesToList(strengths),
      constraints: linesToList(constraints),
      riskTolerance,
      timeAvailable: timeAvailable.trim(),
      notes: notes.trim(),
    };
    const result = profileSchema.safeParse(candidate);
    if (!result.success) {
      setError(
        "Please check your entries — some fields are too long or invalid.",
      );
      return;
    }
    if (result.data.goals.length === 0 && result.data.priorities.length === 0) {
      setError("Add at least one goal or priority so North Star can help.");
      return;
    }
    setError(null);
    setSaved(true);
    onSave(result.data);
  }

  return (
    <Panel ariaLabelledby="profile-form-heading">
      <h3 id="profile-form-heading" className="mb-4 text-2xl">
        Your Personal Decision Profile
      </h3>
      <p className="mb-5 text-sm text-paper-dim">
        Stored only in your browser (localStorage). Nothing here is sent to a
        server until you evaluate a decision.
      </p>

      <form onSubmit={handleSubmit} noValidate>
        <label className="ns-label" htmlFor={ids.goals}>
          Primary Goals (one per line)
        </label>
        <textarea
          id={ids.goals}
          className="ns-textarea"
          value={goals}
          maxLength={INPUT_LIMITS.maxListItems * (INPUT_LIMITS.listItem + 1)}
          onChange={(e) => setGoals(e.target.value)}
          placeholder={"Learn AWS in depth\nBuild a public portfolio"}
        />

        <label className="ns-label" htmlFor={ids.priorities}>
          Current Priorities (one per line)
        </label>
        <textarea
          id={ids.priorities}
          className="ns-textarea"
          value={priorities}
          onChange={(e) => setPriorities(e.target.value)}
          placeholder={"Learning\nCareer growth\nProtecting my time"}
        />

        <label className="ns-label" htmlFor={ids.strengths}>
          Existing Strengths (one per line)
        </label>
        <textarea
          id={ids.strengths}
          className="ns-textarea"
          value={strengths}
          onChange={(e) => setStrengths(e.target.value)}
          placeholder={"Lambda\nTechnical writing"}
        />

        <label className="ns-label" htmlFor={ids.constraints}>
          Constraints (one per line)
        </label>
        <textarea
          id={ids.constraints}
          className="ns-textarea"
          value={constraints}
          onChange={(e) => setConstraints(e.target.value)}
          placeholder={"About 8 hours per weekend\nLow budget"}
        />

        <div className="grid gap-x-4 sm:grid-cols-2">
          <div>
            <label className="ns-label" htmlFor={ids.risk}>
              Risk Tolerance
            </label>
            <select
              id={ids.risk}
              className="ns-select"
              value={riskTolerance}
              onChange={(e) =>
                setRiskTolerance(e.target.value as RiskTolerance)
              }
            >
              {RISK_TOLERANCE_VALUES.map((value) => (
                <option key={value} value={value}>
                  {value.charAt(0).toUpperCase() + value.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="ns-label" htmlFor={ids.time}>
              Time Available
            </label>
            <input
              id={ids.time}
              className="ns-input"
              value={timeAvailable}
              maxLength={INPUT_LIMITS.shortField}
              onChange={(e) => setTimeAvailable(e.target.value)}
              placeholder="Up to 8 hours this weekend"
            />
          </div>
        </div>

        <label className="ns-label" htmlFor={ids.notes}>
          Additional Notes
        </label>
        <textarea
          id={ids.notes}
          className="ns-textarea"
          value={notes}
          maxLength={INPUT_LIMITS.profileNotes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Anything else that shapes your decisions"
        />
        <p className="mb-4 text-right text-xs text-paper-dim">
          {notes.length}/{INPUT_LIMITS.profileNotes}
        </p>

        {error && (
          <p role="alert" className="mb-4 text-sm font-bold text-danger">
            {error}
          </p>
        )}
        {saved && !error && (
          <p role="status" className="mb-4 text-sm font-bold text-signal">
            Profile saved to this browser.
          </p>
        )}

        <div className="flex flex-wrap gap-3">
          <button type="submit" className="ns-btn">
            Save Profile
          </button>
          {onCancel && (
            <button
              type="button"
              className="ns-btn ns-btn-ghost"
              onClick={onCancel}
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </Panel>
  );
}
