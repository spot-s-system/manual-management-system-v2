import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SearchBox } from "../search-box";

// Mock next/navigation
const mockPush = vi.fn();
const mockSearchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => mockSearchParams,
}));

describe("SearchBox", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams.delete("q");
  });

  it("renders search input", () => {
    render(<SearchBox />);
    const input = screen.getByPlaceholderText("キーワードで探す...");
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("type", "search");
  });

  it("handles search input", async () => {
    const user = userEvent.setup();
    render(<SearchBox />);

    const input = screen.getByPlaceholderText("キーワードで探す...");
    await user.type(input, "Next.js");

    expect(input).toHaveValue("Next.js");
  });

  it("submits search on Enter key", async () => {
    const user = userEvent.setup();
    render(<SearchBox />);

    const input = screen.getByPlaceholderText("キーワードで探す...");
    await user.type(input, "React{Enter}");

    expect(mockPush).toHaveBeenCalledWith("/search?q=React");
  });

  it("debounces search navigation", async () => {
    const user = userEvent.setup();
    render(<SearchBox />);

    const input = screen.getByPlaceholderText("キーワードで探す...");
    await user.type(input, "test");

    // 即座には遷移しない
    expect(mockPush).not.toHaveBeenCalled();

    // デバウンス後に遷移
    await waitFor(
      () => {
        expect(mockPush).toHaveBeenCalledWith("/search?q=test");
      },
      { timeout: 600 }
    );
  });

  it("renders search icon", () => {
    render(<SearchBox />);
    const icon = document.querySelector(".lucide-search");
    expect(icon).toBeInTheDocument();
  });
});
