import { describe, expect, test } from "bun:test";
import { formatRao, raoToTao, taoToRao } from "@/core/utils";

describe("Utility Functions", () => {
  describe("formatRao", () => {
    test("should format number with commas", () => {
      expect(formatRao(1000000000, false)).toBe("1,000,000,000");
    });

    test("should format bigint with commas", () => {
      expect(formatRao(1000000000n, false)).toBe("1,000,000,000");
    });

    test("should include RAO symbol by default", () => {
      expect(formatRao(1000000000)).toBe("1,000,000,000 RAO");
    });

    test("should handle zero value", () => {
      expect(formatRao(0)).toBe("0 RAO");
    });
  });

  describe("raoToTao", () => {
    test("should convert 1 billion RAO to 1 TAO", () => {
      expect(raoToTao(1000000000)).toBe(1);
    });

    test("should convert bigint RAO value to TAO", () => {
      expect(raoToTao(1000000000n)).toBe(1);
    });

    test("should convert string RAO value to TAO", () => {
      expect(raoToTao("1000000000")).toBe(1);
    });

    test("should handle zero", () => {
      expect(raoToTao(0)).toBe(0);
    });

    test("should handle fractional amounts", () => {
      expect(raoToTao(500000000)).toBe(0.5);
    });
  });

  describe("taoToRao", () => {
    test("should convert 1 TAO to 1 billion RAO", () => {
      expect(taoToRao(1)).toBe(1000000000n);
    });

    test("should handle zero", () => {
      expect(taoToRao(0)).toBe(0n);
    });

    test("should handle fractional amounts", () => {
      expect(taoToRao(0.5)).toBe(500000000n);
    });

    test("should truncate excess decimal places", () => {
      expect(taoToRao(1.123456789)).toBe(1123456789n);
    });
  });
}); 