"use client";

import { z } from "zod";
import { evaluationResponseSchema } from "@/lib/evaluation";

// Recent decisions live ONLY in the browser. No decision content is ever
// persisted in AWS (privacy requirement).
export const RECENT_STORAGE_KEY = "northstar.recent.v1";
const MAX_RECENT = 10;

export const recentDecisionSchema = z.object({
  id: z.string(),
  title: z.string(),
  createdAt: z.string(),
  alignmentScore: z.number().int().min(0).max(100),
  alignmentLabel: z.string(),
  recommendation: z.string(),
  result: evaluationResponseSchema,
});

export type RecentDecision = z.infer<typeof recentDecisionSchema>;

const recentListSchema = z.array(recentDecisionSchema);

function hasStorage(): boolean {
  return typeof window !== "undefined" && !!window.localStorage;
}

export function loadRecentDecisions(): RecentDecision[] {
  if (!hasStorage()) return [];
  const raw = window.localStorage.getItem(RECENT_STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = recentListSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : [];
  } catch {
    return [];
  }
}

export function addRecentDecision(entry: RecentDecision): RecentDecision[] {
  const existing = loadRecentDecisions();
  const next = [entry, ...existing].slice(0, MAX_RECENT);
  if (hasStorage()) {
    window.localStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(next));
  }
  return next;
}

export function clearRecentDecisions(): void {
  if (hasStorage()) {
    window.localStorage.removeItem(RECENT_STORAGE_KEY);
  }
}
