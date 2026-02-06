import { describe, expect, it } from "vitest";
import { formatSeconds } from "@/lib/timer";

describe("formatSeconds", () => {
  it("formats values as mm:ss", () => {
    expect(formatSeconds(0)).toBe("00:00");
    expect(formatSeconds(65)).toBe("01:05");
    expect(formatSeconds(600)).toBe("10:00");
  });
});
