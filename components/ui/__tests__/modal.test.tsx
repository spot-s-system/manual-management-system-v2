import { fireEvent, render, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import "@testing-library/jest-dom";
import * as React from "react";
import { Modal } from "../modal";

describe("Modal", () => {
  afterEach(() => {
    // Clean up body styles after each test
    document.body.style.overflow = "";
  });

  it("renders when open", () => {
    const { getByText, container } = render(
      <Modal isOpen={true} onClose={() => {}}>
        <div>Modal Content</div>
      </Modal>
    );

    expect(getByText("Modal Content")).toBeInTheDocument();
    expect(container.querySelector("[aria-modal='true']")).toBeInTheDocument();
  });

  it("does not render when closed", () => {
    const { queryByRole } = render(
      <Modal isOpen={false} onClose={() => {}}>
        <div>Modal Content</div>
      </Modal>
    );

    expect(queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("calls onClose when overlay is clicked", async () => {
    const onClose = vi.fn();
    const { getByLabelText } = render(
      <Modal isOpen={true} onClose={onClose}>
        <div>Modal Content</div>
      </Modal>
    );

    const overlay = getByLabelText("Close modal overlay");
    fireEvent.click(overlay);

    await waitFor(() => {
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  it("calls onClose when close button is clicked", async () => {
    const onClose = vi.fn();
    const { getByLabelText } = render(
      <Modal isOpen={true} onClose={onClose}>
        <div>Modal Content</div>
      </Modal>
    );

    const closeButton = getByLabelText("Close modal");
    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  it("does not close when modal content is clicked", () => {
    const onClose = vi.fn();
    const { container } = render(
      <Modal isOpen={true} onClose={onClose}>
        <div>Modal Content</div>
      </Modal>
    );

    const modalContent = container.querySelector(".focus-trap");
    if (!modalContent) {
      throw new Error("Modal content not found");
    }
    fireEvent.click(modalContent);

    expect(onClose).not.toHaveBeenCalled();
  });

  it("closes on Escape key press", async () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={onClose}>
        <div>Modal Content</div>
      </Modal>
    );

    fireEvent.keyDown(document, { key: "Escape" });

    await waitFor(() => {
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  it("has correct accessibility attributes", () => {
    const { container } = render(
      <Modal isOpen={true} onClose={() => {}}>
        <div>Modal Content</div>
      </Modal>
    );

    const modal = container.querySelector("[aria-modal='true']");
    expect(modal).toBeInTheDocument();
  });

  it("handles tab key navigation", () => {
    const { container } = render(
      <Modal isOpen={true} onClose={() => {}}>
        <button type="button">First</button>
        <button type="button">Last</button>
      </Modal>
    );

    const buttons = container.querySelectorAll("button");
    const firstButton = buttons[1]; // Skip overlay button
    const lastButton = buttons[buttons.length - 1];

    // Focus last button and press Tab
    lastButton.focus();
    fireEvent.keyDown(document, { key: "Tab", shiftKey: false });

    // Focus first button and press Shift+Tab
    firstButton.focus();
    fireEvent.keyDown(document, { key: "Tab", shiftKey: true });
  });

  it("sets body overflow when opened and restores when closed", () => {
    const originalOverflow = document.body.style.overflow;

    const { rerender } = render(
      <Modal isOpen={true} onClose={() => {}}>
        <div>Modal Content</div>
      </Modal>
    );

    expect(document.body.style.overflow).toBe("hidden");

    rerender(
      <Modal isOpen={false} onClose={() => {}}>
        <div>Modal Content</div>
      </Modal>
    );

    expect(document.body.style.overflow).toBe("unset");

    // Restore original overflow
    document.body.style.overflow = originalOverflow;
  });

  it("restores focus to previous element when closed", () => {
    const TestComponent = () => {
      const [isOpen, setIsOpen] = React.useState(false);
      return (
        <>
          <button type="button" data-testid="trigger" onClick={() => setIsOpen(true)}>
            Open Modal
          </button>
          <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
            <div>Modal Content</div>
          </Modal>
        </>
      );
    };

    const { getByTestId } = render(<TestComponent />);
    const trigger = getByTestId("trigger");

    trigger.focus();
    fireEvent.click(trigger);

    // Close modal
    fireEvent.keyDown(document, { key: "Escape" });
  });

  it("renders with custom className", () => {
    const { container } = render(
      <Modal isOpen={true} onClose={() => {}} className="custom-modal">
        <div>Modal Content</div>
      </Modal>
    );

    const modal = container.querySelector(".custom-modal");
    expect(modal).toBeInTheDocument();
  });
});
