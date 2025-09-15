import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import "@testing-library/jest-dom";
import { ManualCardSkeleton } from "../manual-card-skeleton";

describe("ManualCardSkeleton", () => {
  it("renders skeleton elements", () => {
    const { container } = render(<ManualCardSkeleton />);

    // All skeleton elements have the bg-slate-200 class from Skeleton component
    const skeletons = container.querySelectorAll(".bg-slate-200");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("renders card with correct structure", () => {
    const { container } = render(<ManualCardSkeleton />);

    const card = container.querySelector(".rounded-xl");
    expect(card).toBeInTheDocument();
    expect(card).toHaveClass("shadow-md");
  });

  it("renders header skeleton", () => {
    const { container } = render(<ManualCardSkeleton />);

    const headerSkeleton = container.querySelector(".h-6.w-3\\/4");
    expect(headerSkeleton).toBeInTheDocument();
    expect(headerSkeleton).toHaveClass("bg-slate-200");
  });

  it("renders content skeletons", () => {
    const { container } = render(<ManualCardSkeleton />);

    const contentSkeletons = container.querySelectorAll(".h-4");
    expect(contentSkeletons.length).toBeGreaterThan(0);

    expect(contentSkeletons[0]).toHaveClass("w-full");
  });

  it("renders footer skeleton", () => {
    const { container } = render(<ManualCardSkeleton />);

    const footerSkeleton = container.querySelector(".h-6.w-16");
    expect(footerSkeleton).toBeInTheDocument();
    expect(footerSkeleton).toHaveClass("bg-slate-200");
  });

  it("has correct spacing", () => {
    const { container } = render(<ManualCardSkeleton />);

    const cardBody = container.querySelector(".p-5");
    expect(cardBody).toBeInTheDocument();
  });
});
