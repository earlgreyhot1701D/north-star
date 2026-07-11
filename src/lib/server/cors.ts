// CORS policy for the Next.js proxy. Only explicitly configured origins are
// allowed — no wildcard in production. Same-origin requests (no Origin header)
// are always permitted so the app's own frontend keeps working.
export function allowedOrigins(): string[] {
  const origins = [
    process.env.ALLOWED_ORIGIN,
    process.env.LOCAL_ORIGIN ?? "http://localhost:3000",
  ]
    .filter((o): o is string => typeof o === "string" && o.trim().length > 0)
    .map((o) => o.trim().replace(/\/$/, ""));
  return Array.from(new Set(origins));
}

export function isOriginAllowed(origin: string | null): boolean {
  // No Origin header => same-origin / non-browser client. Allow.
  if (!origin) return true;
  return allowedOrigins().includes(origin.replace(/\/$/, ""));
}

export function corsHeaders(origin: string | null): Record<string, string> {
  const headers: Record<string, string> = {
    Vary: "Origin",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "600",
  };
  if (origin && isOriginAllowed(origin)) {
    headers["Access-Control-Allow-Origin"] = origin.replace(/\/$/, "");
  }
  return headers;
}
