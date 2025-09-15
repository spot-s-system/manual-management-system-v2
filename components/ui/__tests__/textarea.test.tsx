import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import "@testing-library/jest-dom";
import { Textarea } from "../textarea";

describe("Textarea", () => {
  it("renders textarea element", () => {
    const { container } = render(<Textarea />);
    const textarea = container.querySelector("textarea");
    expect(textarea).toBeInTheDocument();
  });

  it("forwards ref correctly", () => {
    let ref: HTMLTextAreaElement | null = null;
    const setRef = (el: HTMLTextAreaElement | null) => {
      ref = el;
    };
    render(<Textarea ref={setRef} />);
    expect(ref).toBeInstanceOf(HTMLTextAreaElement);
  });

  it("applies default styles", () => {
    const { container } = render(<Textarea />);
    const textarea = container.querySelector("textarea");
    expect(textarea).toHaveClass(
      "flex",
      "min-h-[80px]",
      "w-full",
      "rounded-md",
      "border",
      "border-input",
      "bg-background",
      "px-3",
      "py-2",
      "text-sm"
    );
  });

  it("accepts custom className", () => {
    const { container } = render(<Textarea className="custom-class" />);
    const textarea = container.querySelector("textarea");
    expect(textarea).toHaveClass("custom-class");
  });

  it("accepts placeholder prop", () => {
    const { container } = render(<Textarea placeholder="Enter text..." />);
    const textarea = container.querySelector("textarea");
    expect(textarea).toHaveAttribute("placeholder", "Enter text...");
  });

  it("accepts value prop", () => {
    const { container } = render(<Textarea value="Test value" readOnly />);
    const textarea = container.querySelector("textarea");
    expect(textarea).toHaveValue("Test value");
  });
});
