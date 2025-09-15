import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import "@testing-library/jest-dom";
import { Skeleton } from "../skeleton";

describe("Skeleton", () => {
  it("renders skeleton component", () => {
    const { container } = render(<Skeleton />);
    const skeleton = container.firstChild;
    expect(skeleton).toHaveClass("relative", "overflow-hidden", "rounded-md", "bg-slate-200");
  });

  it("accepts custom className", () => {
    const { container } = render(<Skeleton className="custom-class" />);
    const skeleton = container.firstChild;
    expect(skeleton).toHaveClass(
      "custom-class",
      "relative",
      "overflow-hidden",
      "rounded-md",
      "bg-slate-200"
    );
  });

  it("renders with correct default styles", () => {
    const { container } = render(<Skeleton />);
    const skeleton = container.firstChild;
    expect(skeleton).toBeInTheDocument();
    expect(skeleton).toHaveClass("relative", "overflow-hidden", "rounded-md", "bg-slate-200");
  });

  it("has default aria-label", () => {
    const { container } = render(<Skeleton />);
    const skeleton = container.firstChild;
    expect(skeleton).toHaveAttribute("aria-label", "読み込み中...");
  });

  it("accepts custom aria-label", () => {
    const { container } = render(<Skeleton aria-label="Loading..." />);
    const skeleton = container.firstChild;
    expect(skeleton).toHaveAttribute("aria-label", "Loading...");
  });
});
