import { fireEvent, render, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import "@testing-library/jest-dom";
import { T } from "vitest/dist/chunks/reporters.d.DL9pg5DB.js";
import { ManualCardWithModal } from "../manual-card-with-modal";

const mockManual = {
  id: "1",
  title: "Test Manual",
  url: "https://example.com/manual.pdf",
  main_category: "基本操作",
  sub_category: "初期設定",
  tags: ["tag1", "tag2"],
};

interface MockManualCardProps {
  manual: {
    title: string;
  };
}

vi.mock("../manual-card", () => ({
  ManualCard: ({ manual }: MockManualCardProps) => (
    <div data-testid="manual-card">{manual.title}</div>
  ),
}));

interface MockManualModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  title: string;
}

vi.mock("../ui/modal", () => ({
  ManualModal: ({ isOpen, onClose, url, title }: MockManualModalProps) =>
    isOpen ? (
      <div data-testid="modal">
        <button type="button" onClick={onClose} data-testid="close-modal">
          Close
        </button>
        <h2>{title}</h2>
        <a href={url}>View Manual</a>
      </div>
    ) : null,
}));

describe("ManualCardWithModal", () => {
  it("renders ManualCard component", () => {
    const { getByTestId, getByText } = render(<ManualCardWithModal manual={mockManual} />);

    expect(getByTestId("manual-card")).toBeInTheDocument();
    expect(getByText("Test Manual")).toBeInTheDocument();
  });

  it("opens modal when button is clicked", async () => {
    const { container, queryByTestId } = render(<ManualCardWithModal manual={mockManual} />);

    expect(queryByTestId("modal")).not.toBeInTheDocument();

    const button = container.querySelector("button");
    if (!button) {
      throw new Error("Button not found");
    }
    fireEvent.click(button);

    await waitFor(() => {
      expect(queryByTestId("modal")).toBeInTheDocument();
    });
  });

  it("displays manual details in modal", async () => {
    const { container, getByText, getByTestId } = render(
      <ManualCardWithModal manual={mockManual} />
    );

    const button = container.querySelector("button");
    if (!button) {
      throw new Error("Button not found");
    }
    fireEvent.click(button);

    await waitFor(() => {
      expect(getByTestId("modal")).toBeInTheDocument();
      expect(getByText("View Manual")).toBeInTheDocument();
    });
  });

  it("closes modal when close button is clicked", async () => {
    const { container, queryByTestId, getByTestId } = render(
      <ManualCardWithModal manual={mockManual} />
    );

    const button = container.querySelector("button");
    if (!button) {
      throw new Error("Button not found");
    }
    fireEvent.click(button);

    await waitFor(() => {
      expect(queryByTestId("modal")).toBeInTheDocument();
    });

    fireEvent.click(getByTestId("close-modal"));

    await waitFor(() => {
      expect(queryByTestId("modal")).not.toBeInTheDocument();
    });
  });

  it("renders with categories", () => {
    const { container } = render(<ManualCardWithModal manual={mockManual} />);

    expect(container).toBeInTheDocument();
  });

  it("renders without sub_category", () => {
    const manualWithoutSubCategory = { ...mockManual, sub_category: null };
    const { container } = render(<ManualCardWithModal manual={manualWithoutSubCategory} />);

    expect(container).toBeInTheDocument();
  });

  it("opens modal when Enter key is pressed", async () => {
    const { container, queryByTestId } = render(<ManualCardWithModal manual={mockManual} />);

    expect(queryByTestId("modal")).not.toBeInTheDocument();

    const button = container.querySelector("button");
    if (!button) {
      throw new Error("Button not found");
    }
    fireEvent.keyDown(button, { key: "Enter" });

    await waitFor(() => {
      expect(queryByTestId("modal")).toBeInTheDocument();
    });
  });

  it("opens modal when Space key is pressed", async () => {
    const { container, queryByTestId } = render(<ManualCardWithModal manual={mockManual} />);

    expect(queryByTestId("modal")).not.toBeInTheDocument();

    const button = container.querySelector("button");
    if (!button) {
      throw new Error("Button not found");
    }
    fireEvent.keyDown(button, { key: " " });

    await waitFor(() => {
      expect(queryByTestId("modal")).toBeInTheDocument();
    });
  });

  it("does not open modal for other keys", async () => {
    const { container, queryByTestId } = render(<ManualCardWithModal manual={mockManual} />);

    const button = container.querySelector("button");
    if (!button) {
      throw new Error("Button not found");
    }
    fireEvent.keyDown(button, { key: "Tab" });

    await waitFor(() => {
      expect(queryByTestId("modal")).not.toBeInTheDocument();
    });
  });
});
