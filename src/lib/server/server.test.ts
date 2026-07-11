import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { isOriginAllowed, corsHeaders, allowedOrigins } from "./cors";

const ORIGINAL = { ...process.env };

describe("cors", () => {
  beforeEach(() => {
    process.env.ALLOWED_ORIGIN = "https://north-star.vercel.app";
    process.env.LOCAL_ORIGIN = "http://localhost:3000";
  });
  afterEach(() => {
    process.env = { ...ORIGINAL };
  });

  it("allows configured production and local origins", () => {
    expect(isOriginAllowed("https://north-star.vercel.app")).toBe(true);
    expect(isOriginAllowed("http://localhost:3000")).toBe(true);
  });

  it("rejects an unauthorized origin", () => {
    expect(isOriginAllowed("https://evil.example.com")).toBe(false);
  });

  it("allows requests with no Origin header (same-origin / server)", () => {
    expect(isOriginAllowed(null)).toBe(true);
  });

  it("never emits a wildcard Access-Control-Allow-Origin", () => {
    const headers = corsHeaders("https://north-star.vercel.app");
    expect(headers["Access-Control-Allow-Origin"]).toBe(
      "https://north-star.vercel.app",
    );
    expect(Object.values(headers)).not.toContain("*");
  });

  it("omits the allow-origin header for a rejected origin", () => {
    const headers = corsHeaders("https://evil.example.com");
    expect(headers["Access-Control-Allow-Origin"]).toBeUndefined();
  });

  it("dedupes and trims configured origins", () => {
    process.env.ALLOWED_ORIGIN = "https://north-star.vercel.app/";
    expect(allowedOrigins()).toContain("https://north-star.vercel.app");
  });
});
