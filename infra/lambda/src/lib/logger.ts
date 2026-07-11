// Metadata-only logger. NEVER log profile, decision, opportunity, notes, or
// model output. Only operational metadata is permitted.
type Level = "debug" | "info" | "warn" | "error";
const LEVELS: Record<Level, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

function threshold(): number {
  const configured = (process.env.LOG_LEVEL ?? "info").toLowerCase();
  return LEVELS[configured as Level] ?? LEVELS.info;
}

export interface RequestMeta {
  requestId: string;
  timestamp: string;
  durationMs?: number;
  outcome: "success" | "failure";
  modelId?: string;
  inputTokens?: number;
  outputTokens?: number;
  reason?: string;
}

export function logMeta(level: Level, meta: RequestMeta): void {
  if (LEVELS[level] < threshold()) return;
  const line = JSON.stringify({ level, ...meta });
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}
