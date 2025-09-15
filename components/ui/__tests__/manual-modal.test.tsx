import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import "@testing-library/jest-dom";
import { ManualModal } from "../modal";

describe("ManualModal", () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    url: "https://example.com/manual.pdf",
    title: "Test Manual",
  };

  it("renders manual modal with title", () => {
    const { getByText } = render(<ManualModal {...defaultProps} />);

    expect(getByText("Test Manual")).toBeInTheDocument();
  });

  it("renders iframe with correct attributes", () => {
    const { container } = render(<ManualModal {...defaultProps} />);

    const iframe = container.querySelector("iframe");
    expect(iframe).toBeInTheDocument();
    expect(iframe).toHaveAttribute("src", "https://example.com/manual.pdf");
    expect(iframe).toHaveAttribute("title", "Test Manual");
    expect(iframe).toHaveAttribute(
      "sandbox",
      "allow-same-origin allow-scripts allow-popups allow-forms"
    );
  });

  it("does not render when closed", () => {
    const { queryByText } = render(<ManualModal {...defaultProps} isOpen={false} />);

    expect(queryByText("Test Manual")).not.toBeInTheDocument();
  });

  it("applies correct modal class", () => {
    const { container } = render(<ManualModal {...defaultProps} />);

    const modal = container.querySelector(".h-\\[90vh\\]");
    expect(modal).toBeInTheDocument();
    expect(modal).toHaveClass("flex", "flex-col");
  });

  it("renders header with correct styles", () => {
    const { container } = render(<ManualModal {...defaultProps} />);

    const header = container.querySelector(".p-4.border-b");
    expect(header).toBeInTheDocument();
    expect(header).toHaveClass("bg-gray-50");
  });

  it("renders content area with correct styles", () => {
    const { container } = render(<ManualModal {...defaultProps} />);

    const content = container.querySelector(".flex-1.overflow-hidden");
    expect(content).toBeInTheDocument();
  });
});
