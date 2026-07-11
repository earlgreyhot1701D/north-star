import { describe, expect, it, beforeEach } from "vitest";
import {
  EMPTY_PROFILE,
  PROFILE_STORAGE_KEY,
  loadProfile,
  saveProfile,
  clearProfile,
  hasProfile,
} from "./profile";
import {
  addRecentDecision,
  clearRecentDecisions,
  loadRecentDecisions,
  RECENT_STORAGE_KEY,
  type RecentDecision,
} from "./recent";

const sampleProfile = {
  ...EMPTY_PROFILE,
  goals: ["Learn AWS"],
  riskTolerance: "high" as const,
  timeAvailable: "8 hours",
};

const sampleResult = {
  alignmentScore: 80,
  alignmentLabel: "Strong Match",
  confidence: 70,
  recommendation: "Yes" as const,
  summary: "Fits well.",
  fits: ["a"],
  risks: ["b"],
  tradeoffs: ["c"],
  assumptions: ["d"],
  questions: ["e"],
  nextStep: "Do it.",
};

describe("profile storage", () => {
  beforeEach(() => window.localStorage.clear());

  it("saves and loads a profile under the versioned key", () => {
    saveProfile(sampleProfile);
    expect(window.localStorage.getItem(PROFILE_STORAGE_KEY)).not.toBeNull();
    const loaded = loadProfile();
    expect(loaded?.goals).toEqual(["Learn AWS"]);
    expect(loaded?.riskTolerance).toBe("high");
    expect(hasProfile()).toBe(true);
  });

  it("returns null when nothing is stored", () => {
    expect(loadProfile()).toBeNull();
    expect(hasProfile()).toBe(false);
  });

  it("returns null for corrupt stored data", () => {
    window.localStorage.setItem(PROFILE_STORAGE_KEY, "{not json");
    expect(loadProfile()).toBeNull();
  });

  it("returns null when stored data fails schema validation", () => {
    window.localStorage.setItem(
      PROFILE_STORAGE_KEY,
      JSON.stringify({ riskTolerance: "extreme" }),
    );
    expect(loadProfile()).toBeNull();
  });

  it("clears the profile", () => {
    saveProfile(sampleProfile);
    clearProfile();
    expect(loadProfile()).toBeNull();
  });

  it("throws when saving an invalid profile", () => {
    expect(() =>
      // @ts-expect-error deliberately invalid
      saveProfile({ ...sampleProfile, riskTolerance: "extreme" }),
    ).toThrow();
  });
});

describe("recent decisions storage", () => {
  beforeEach(() => window.localStorage.clear());

  const entry = (id: string): RecentDecision => ({
    id,
    title: `Decision ${id}`,
    createdAt: new Date("2026-07-10T00:00:00Z").toISOString(),
    alignmentScore: 80,
    alignmentLabel: "Strong Match",
    recommendation: "Yes",
    result: sampleResult,
  });

  it("adds newest-first and persists", () => {
    addRecentDecision(entry("1"));
    const list = addRecentDecision(entry("2"));
    expect(list[0]?.id).toBe("2");
    expect(window.localStorage.getItem(RECENT_STORAGE_KEY)).not.toBeNull();
    expect(loadRecentDecisions()).toHaveLength(2);
  });

  it("caps the list at 10 entries", () => {
    for (let i = 0; i < 15; i += 1) addRecentDecision(entry(String(i)));
    expect(loadRecentDecisions()).toHaveLength(10);
  });

  it("clears recent decisions", () => {
    addRecentDecision(entry("1"));
    clearRecentDecisions();
    expect(loadRecentDecisions()).toEqual([]);
  });
});
