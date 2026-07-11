// Text hygiene applied on the server before validation and before the model sees
// the content. We trim whitespace and strip unsupported control characters while
// preserving newlines (\n) and tabs (\t), which are meaningful in free-form text.
//
// Removed: C0 controls except \n (0x0A) and \t (0x09); the DEL char (0x7F);
// and C1 controls (0x80-0x9F). This defends against payloads that try to smuggle
// invisible instructions or terminal escape sequences.
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
