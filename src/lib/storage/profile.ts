"use client";

import { profileSchema, type Profile } from "@/lib/evaluation";

// Versioned localStorage key required by the spec.
export const PROFILE_STORAGE_KEY = "northstar.profile.v1";

export const EMPTY_PROFILE: Profile = {
  goals: [],
  priorities: [],
  strengths: [],
  constraints: [],
  riskTolerance: "moderate",
  timeAvailable: "",
  notes: "",
};

function hasStorage(): boolean {
  return typeof window !== "undefined" && !!window.localStorage;
}

/**
 * Load and validate the stored profile. Returns null when nothing is stored or
 * when the stored payload fails validation (corrupt / outdated shape).
 */
export function loadProfile(): Profile | null {
  if (!hasStorage()) return null;
  const raw = window.localStorage.getItem(PROFILE_STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = profileSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

/**
 * Validate and persist the profile. Throws a ZodError when the profile is
 * invalid so callers can surface field errors.
 */
export function saveProfile(profile: Profile): Profile {
  const validated = profileSchema.parse(profile);
  if (hasStorage()) {
    window.localStorage.setItem(
      PROFILE_STORAGE_KEY,
      JSON.stringify(validated),
    );
  }
  return validated;
}

export function clearProfile(): void {
  if (hasStorage()) {
    window.localStorage.removeItem(PROFILE_STORAGE_KEY);
  }
}

export function hasProfile(): boolean {
  return loadProfile() !== null;
}
