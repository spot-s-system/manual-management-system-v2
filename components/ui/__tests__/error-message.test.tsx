import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import "@testing-library/jest-dom";
import { ErrorMessage } from "../error-message";

describe("ErrorMessage", () => {
  it("renders default error message", () => {
    const { getByText, getByRole } = render(<ErrorMessage />);

    expect(getByText("エラーが発生しました")).toBeInTheDocument();
    expect(
      getByText("データの取得中にエラーが発生しました。時間をおいて再度お試しください。")
    ).toBeInTheDocument();
    expect(getByRole("alert")).toBeInTheDocument();
  });

  it("renders custom title and message", () => {
    const { getByText } = render(
      <ErrorMessage title="Custom Error" message="Custom error message" />
    );

    expect(getByText("Custom Error")).toBeInTheDocument();
    expect(getByText("Custom error message")).toBeInTheDocument();
  });

  it("has correct accessibility attributes", () => {
    const { getByRole } = render(<ErrorMessage />);

    const alert = getByRole("alert");
    expect(alert).toHaveAttribute("aria-live", "assertive");
  });

  it("applies correct styles", () => {
    const { getByRole } = render(<ErrorMessage />);

    const alert = getByRole("alert");
    expect(alert).toHaveClass("border-destructive");
  });

  it("renders with icon", () => {
    const { container } = render(<ErrorMessage />);

    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveClass("h-8", "w-8", "text-destructive");
  });

  it("renders retry button when retry function is provided", () => {
    const retryFn = vi.fn();
    const { getByLabelText } = render(<ErrorMessage retry={retryFn} />);

    const retryButton = getByLabelText("エラーを再試行");
    expect(retryButton).toBeInTheDocument();

    fireEvent.click(retryButton);
    expect(retryFn).toHaveBeenCalledTimes(1);
  });

  it("does not render retry button when retry function is not provided", () => {
    const { queryByLabelText } = render(<ErrorMessage />);

    expect(queryByLabelText("エラーを再試行")).not.toBeInTheDocument();
  });
});
