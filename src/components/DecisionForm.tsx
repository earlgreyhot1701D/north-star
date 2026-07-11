"use client";

import { useId, useState } from "react";
import { INPUT_LIMITS, decisionSchema, type Decision } from "@/lib/evaluation";
import { Panel } from "./Panel";

interface DecisionFormProps {
  disabled: boolean;
  hasProfile: boolean;
  onEvaluate: (decision: Decision) => void;
  onCreateProfile: () => void;
}

export function DecisionForm({
  disabled,
  hasProfile,
  onEvaluate,
  onCreateProfile,
}: DecisionFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [desiredOutcome, setDesiredOutcome] = useState("");
  const [error, setError] = useState<string | null>(null);

  const ids = {
    title: useId(),
    description: useId(),
    url: useId(),
    outcome: useId(),
  };

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const candidate = {
      title: title.trim(),
      description: description.trim(),
      url: url.trim(),
      desiredOutcome: desiredOutcome.trim(),
    };
    const result = decisionSchema.safeParse(candidate);
    if (!result.success) {
      const first = result.error.issues[0];
      if (first?.path[0] === "title") {
        setError("Please add a decision title.");
      } else if (first?.path[0] === "description") {
        setError("Please describe the opportunity.");
      } else if (first?.path[0] === "url") {
        setError("The URL doesn't look valid. Leave it blank or fix it.");
      } else {
        setError("Please check the form and try again.");
      }
      return;
    }
    setError(null);
    onEvaluate(result.data);
  }

  return (
    <Panel ariaLabelledby="decision-form-heading">
      <h3 id="decision-form-heading" className="mb-4 text-2xl">
        Start a New Decision
      </h3>

      {!hasProfile && (
        <div
          role="note"
          className="mb-4 border border-brass-dim/60 bg-black/20 p-3 text-sm text-paper-dim"
        >
          You can evaluate without a profile, but results are far more useful
          with one.{" "}
          <button
            type="button"
            onClick={onCreateProfile}
            className="font-bold text-signal underline"
          >
            Create your profile
          </button>
          .
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <label className="ns-label" htmlFor={ids.title}>
          What are you deciding?
        </label>
        <input
          id={ids.title}
          className="ns-input"
          value={title}
          maxLength={INPUT_LIMITS.decisionTitle}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Should I enter this hackathon?"
          required
        />

        <label className="ns-label" htmlFor={ids.description}>
          Opportunity details
        </label>
        <textarea
          id={ids.description}
          className="ns-textarea"
          value={description}
          maxLength={INPUT_LIMITS.opportunityDescription}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the opportunity, requirements, timeline, and any rewards."
          required
        />
        <p className="mb-3 text-right text-xs text-paper-dim">
          {description.length}/{INPUT_LIMITS.opportunityDescription}
        </p>

        <label className="ns-label" htmlFor={ids.url}>
          Reference URL (optional)
        </label>
        <input
          id={ids.url}
          className="ns-input"
          type="url"
          value={url}
          maxLength={INPUT_LIMITS.shortField}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com/opportunity"
        />

        <label className="ns-label" htmlFor={ids.outcome}>
          Desired outcome
        </label>
        <input
          id={ids.outcome}
          className="ns-input"
          value={desiredOutcome}
          maxLength={INPUT_LIMITS.desiredOutcome}
          onChange={(e) => setDesiredOutcome(e.target.value)}
          placeholder="Ship quickly and strengthen my portfolio."
        />

        {error && (
          <p role="alert" className="mb-4 text-sm font-bold text-danger">
            {error}
          </p>
        )}

        <button type="submit" className="ns-btn w-full" disabled={disabled}>
          {disabled ? "Evaluating…" : "Evaluate This Decision →"}
        </button>
      </form>
    </Panel>
  );
}
