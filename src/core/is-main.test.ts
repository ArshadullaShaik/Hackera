import { describe, it, expect } from "vitest";
import { isMainModule } from "./is-main.js";

describe("isMainModule", () => {
  it("returns false for imported modules when process.argv[1] does not match", () => {
    // Current test runner process.argv[1] points to vitest, not this test file URL
    const result = isMainModule(import.meta.url);
    // Vitest runs test in worker/pool, so process.argv[1] is vitest CLI
    expect(result).toBe(false);
  });

  it("returns false when process.argv[1] is empty", () => {
    const original = process.argv[1];
    try {
      process.argv[1] = "";
      expect(isMainModule(import.meta.url)).toBe(false);
    } finally {
      process.argv[1] = original;
    }
  });
});
