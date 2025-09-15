import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import "@testing-library/jest-dom";
import { Label } from "../label";

describe("Label", () => {
  it("renders label element", () => {
    const { getByText } = render(<Label>Test Label</Label>);
    expect(getByText("Test Label")).toBeInTheDocument();
  });

  it("forwards ref correctly", () => {
    let ref: HTMLLabelElement | null = null;
    const setRef = (el: HTMLLabelElement | null) => {
      ref = el;
    };
    render(<Label ref={setRef}>Test</Label>);
    expect(ref).toBeInstanceOf(HTMLLabelElement);
  });

  it("accepts htmlFor prop", () => {
    const { getByText } = render(<Label htmlFor="test-input">Test Label</Label>);
    const label = getByText("Test Label");
    expect(label).toHaveAttribute("for", "test-input");
  });

  it("applies custom className", () => {
    const { getByText } = render(<Label className="custom-class">Test Label</Label>);
    const label = getByText("Test Label");
    expect(label).toHaveClass("custom-class");
    expect(label).toHaveClass("text-sm", "font-medium");
  });

  it("applies base styles", () => {
    const { getByText } = render(<Label>Test Label</Label>);
    const label = getByText("Test Label");
    expect(label).toHaveClass("text-sm", "font-medium", "leading-none");
  });
});
