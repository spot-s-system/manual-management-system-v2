import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Input } from "../input";

describe("Input", () => {
  it("renders input field", () => {
    render(<Input placeholder="Enter text" />);
    expect(screen.getByPlaceholderText("Enter text")).toBeInTheDocument();
  });

  it("accepts user input", async () => {
    const user = userEvent.setup();
    render(<Input placeholder="Enter text" />);

    const input = screen.getByPlaceholderText("Enter text");
    await user.type(input, "Hello World");

    expect(input).toHaveValue("Hello World");
  });

  it("calls onChange handler", async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(<Input placeholder="Enter text" onChange={handleChange} />);
    const input = screen.getByPlaceholderText("Enter text");

    await user.type(input, "Test");
    expect(handleChange).toHaveBeenCalled();
  });

  it("can be disabled", () => {
    render(<Input placeholder="Enter text" disabled />);
    expect(screen.getByPlaceholderText("Enter text")).toBeDisabled();
  });
});
