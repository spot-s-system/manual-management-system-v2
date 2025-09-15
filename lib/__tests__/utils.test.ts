import { describe, expect, it } from "vitest";
import { cn } from "../utils";

describe("cn utility", () => {
  it("merges class names", () => {
    expect(cn("text-red-500", "bg-blue-500")).toBe("text-red-500 bg-blue-500");
  });

  it("handles conditional classes", () => {
    const isActive = true;
    expect(cn("base", isActive && "active")).toBe("base active");
  });

  it("filters falsy values", () => {
    expect(cn("base", false, null, undefined, "", "end")).toBe("base end");
  });

  it("handles empty input", () => {
    expect(cn()).toBe("");
  });

  it("merges tailwind classes correctly", () => {
    // tailwind-mergeが重複するクラスを適切にマージすることを確認
    const result = cn("px-2", "px-4");
    expect(result).toContain("px-4");
    expect(result).not.toContain("px-2");
  });
});
