import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../card";

describe("Card Components", () => {
  it("renders a complete card", () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Test Title</CardTitle>
          <CardDescription>Test Description</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Test Content</p>
        </CardContent>
        <CardFooter>
          <button type="button">Test Button</button>
        </CardFooter>
      </Card>
    );

    expect(screen.getByText("Test Title")).toBeInTheDocument();
    expect(screen.getByText("Test Description")).toBeInTheDocument();
    expect(screen.getByText("Test Content")).toBeInTheDocument();
    expect(screen.getByText("Test Button")).toBeInTheDocument();
  });

  it("renders card with content", () => {
    render(
      <Card>
        <CardContent>Test Content</CardContent>
      </Card>
    );

    expect(screen.getByText("Test Content")).toBeInTheDocument();
  });
});
