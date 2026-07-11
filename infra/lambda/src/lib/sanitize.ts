// Text hygiene — mirror of src/lib/evaluation/sanitize.ts.
// Strips control chars (except \n, \t) and trims. Applied before validation
// and before the model sees any user-supplied content.
const CONTROL_CHARS = new RegExp(
  "[\\u0000-\\u0008\\u000B\\u000C\\u000E-\\u001F\\u007F-\\u009F]",
  "g",
);

export function sanitizeText(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.replace(CONTROL_CHARS, "").trim();
}

export function sanitizeList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => sanitizeText(item))
    .filter((item) => item.length > 0);
}
