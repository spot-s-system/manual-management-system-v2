import { render, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import "@testing-library/jest-dom";
import { LiveRegion } from "../live-region";

describe("LiveRegion", () => {
  it("renders with message", async () => {
    const { container } = render(<LiveRegion message="Test announcement" />);

    // Wait for the timeout to set the message
    await waitFor(() => {
      const liveRegion = container.querySelector("[role='status']");
      expect(liveRegion).toHaveTextContent("Test announcement");
    });
  });

  it("has correct accessibility attributes", () => {
    const { container } = render(<LiveRegion message="Test announcement" />);

    const liveRegion = container.querySelector("[role='status']");
    expect(liveRegion).toHaveAttribute("aria-live", "polite");
    expect(liveRegion).toHaveAttribute("aria-atomic", "true");
    expect(liveRegion).toHaveAttribute("role", "status");
  });

  it("is visually hidden", () => {
    const { container } = render(<LiveRegion message="Test announcement" />);

    const liveRegion = container.querySelector("[role='status']");
    expect(liveRegion).toHaveClass("sr-only");
  });

  it("updates message when prop changes", async () => {
    const { rerender, container } = render(<LiveRegion message="First message" />);

    await waitFor(() => {
      const liveRegion = container.querySelector("[role='status']");
      expect(liveRegion).toHaveTextContent("First message");
    });

    rerender(<LiveRegion message="Second message" />);

    await waitFor(() => {
      const liveRegion = container.querySelector("[role='status']");
      expect(liveRegion).toHaveTextContent("Second message");
    });
  });

  it("renders empty when no message", () => {
    const { container } = render(<LiveRegion message="" />);

    const liveRegion = container.querySelector("[role='status']");
    expect(liveRegion).toBeEmptyDOMElement();
  });
});
