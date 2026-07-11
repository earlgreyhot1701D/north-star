"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  EMPTY_PROFILE,
  loadProfile,
  saveProfile,
} from "@/lib/storage/profile";
import {
  addRecentDecision,
  clearRecentDecisions,
  loadRecentDecisions,
  type RecentDecision,
} from "@/lib/storage/recent";
import { requestEvaluation, EvaluationError } from "@/lib/api/client";
import type {
  Decision,
  EvaluationResponse,
  Profile,
} from "@/lib/evaluation";
import { AppShell } from "./AppShell";
import { HeroPanel } from "./HeroPanel";
import { ProfileForm } from "./ProfileForm";
import { ProfileSummary } from "./ProfileSummary";
import { DecisionForm } from "./DecisionForm";
import { DecisionReport } from "./DecisionReport";
import { RecentDecisions } from "./RecentDecisions";
import { LoadingState } from "./LoadingState";
import { ErrorNotice } from "./ErrorNotice";
import type { View } from "./views";

type Status = "idle" | "loading" | "error";

function newId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `d_${Date.now().toString(36)}`;
  }
}

export function NorthStarApp() {
  const [hydrated, setHydrated] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [recent, setRecent] = useState<RecentDecision[]>([]);
  const [view, setView] = useState<View>("dashboard");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<EvaluationResponse | null>(null);
  const [currentTitle, setCurrentTitle] = useState("");
  const lastDecision = useRef<Decision | null>(null);

  // Hydrate from localStorage after mount (avoids SSR/client mismatch).
  useEffect(() => {
    setProfile(loadProfile());
    setRecent(loadRecentDecisions());
    setHydrated(true);
  }, []);

  const runEvaluation = useCallback(
    async (decision: Decision) => {
      lastDecision.current = decision;
      setCurrentTitle(decision.title);
      setStatus("loading");
      setError(null);
      setResult(null);
      setView("report");
      try {
        const evaluation = await requestEvaluation(
          profile ?? EMPTY_PROFILE,
          decision,
        );
        setResult(evaluation);
        setStatus("idle");
        const entry: RecentDecision = {
          id: newId(),
          title: decision.title,
          createdAt: new Date().toISOString(),
          alignmentScore: evaluation.alignmentScore,
          alignmentLabel: evaluation.alignmentLabel,
          recommendation: evaluation.recommendation,
          result: evaluation,
        };
        setRecent(addRecentDecision(entry));
      } catch (err) {
        const message =
          err instanceof EvaluationError
            ? err.message
            : "We could not evaluate this decision right now. Please try again.";
        setError(message);
        setStatus("error");
      }
    },
    [profile],
  );

  const handleSaveProfile = useCallback((next: Profile) => {
    const saved = saveProfile(next);
    setProfile(saved);
    setEditingProfile(false);
    setView("dashboard");
  }, []);

  const handleSelectRecent = useCallback((decision: RecentDecision) => {
    setResult(decision.result);
    setCurrentTitle(decision.title);
    setStatus("idle");
    setError(null);
    setView("report");
  }, []);

  const handleClearRecent = useCallback(() => {
    clearRecentDecisions();
    setRecent([]);
  }, []);

  const goToDecision = useCallback(() => {
    setView("decision");
    setEditingProfile(false);
  }, []);

  const startProfile = useCallback(() => {
    setEditingProfile(true);
    setView("profile");
  }, []);

  const profileActive = profile !== null;

  // Avoid rendering localStorage-dependent UI until hydrated.
  const content = !hydrated ? (
    <LoadingState message="Loading North Star…" />
  ) : view === "profile" || editingProfile ? (
    <ProfileForm
      initial={profile ?? EMPTY_PROFILE}
      onSave={handleSaveProfile}
      onCancel={
        profileActive
          ? () => {
              setEditingProfile(false);
              setView("dashboard");
            }
          : undefined
      }
    />
  ) : view === "decision" ? (
    <>
      <DecisionForm
        disabled={status === "loading"}
        hasProfile={profileActive}
        onEvaluate={runEvaluation}
        onCreateProfile={startProfile}
      />
      {status === "loading" && <LoadingState />}
      {status === "error" && error && (
        <ErrorNotice
          message={error}
          onRetry={
            lastDecision.current
              ? () => runEvaluation(lastDecision.current as Decision)
              : undefined
          }
          onDismiss={() => setStatus("idle")}
        />
      )}
    </>
  ) : view === "report" ? (
    <>
      {status === "loading" && <LoadingState />}
      {status === "error" && error && (
        <ErrorNotice
          message={error}
          onRetry={
            lastDecision.current
              ? () => runEvaluation(lastDecision.current as Decision)
              : undefined
          }
          onDismiss={() => setView("decision")}
        />
      )}
      {status === "idle" && result && (
        <DecisionReport title={currentTitle} result={result} />
      )}
      {status === "idle" && !result && (
        <RecentDecisions
          decisions={recent}
          onSelect={handleSelectRecent}
          onClear={handleClearRecent}
        />
      )}
      <div className="flex">
        <button type="button" className="ns-btn" onClick={goToDecision}>
          ＋ New Decision
        </button>
      </div>
    </>
  ) : (
    // dashboard
    <>
      <HeroPanel
        profileActive={profileActive}
        onPrimary={profileActive ? goToDecision : startProfile}
      />
      <div className="grid gap-3.5 lg:grid-cols-[0.94fr_1.26fr]">
        <ProfileSummary profile={profile} onEdit={startProfile} />
        <DecisionForm
          disabled={status === "loading"}
          hasProfile={profileActive}
          onEvaluate={runEvaluation}
          onCreateProfile={startProfile}
        />
      </div>
      <div className="grid gap-3.5 lg:grid-cols-[1fr_1.25fr]">
        <RecentDecisions
          decisions={recent}
          onSelect={handleSelectRecent}
          onClear={handleClearRecent}
        />
        {status === "loading" ? (
          <LoadingState />
        ) : status === "error" && error ? (
          <ErrorNotice
            message={error}
            onRetry={
              lastDecision.current
                ? () => runEvaluation(lastDecision.current as Decision)
                : undefined
            }
            onDismiss={() => setStatus("idle")}
          />
        ) : result ? (
          <DecisionReport title={currentTitle} result={result} />
        ) : (
          <LatestEmpty onStart={profileActive ? goToDecision : startProfile} />
        )}
      </div>
    </>
  );

  return (
    <AppShell active={view} onNavigate={setView} profileActive={profileActive}>
      {content}
    </AppShell>
  );
}

function LatestEmpty({ onStart }: { onStart: () => void }) {
  return (
    <section className="ns-panel relative flex flex-col items-center justify-center gap-3 rounded-xl p-8 text-center">
      <h3 className="text-2xl">Latest Evaluation</h3>
      <p className="max-w-sm text-paper-dim">
        No evaluation yet. Describe an opportunity and North Star will score its
        fit against your profile.
      </p>
      <button type="button" className="ns-btn" onClick={onStart}>
        Start a Decision
      </button>
    </section>
  );
}
