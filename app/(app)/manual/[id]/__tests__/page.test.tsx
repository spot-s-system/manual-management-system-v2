import { render } from "@testing-library/react";
import {
  type Mock,
  type MockInstance,
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import "@testing-library/jest-dom";
import type { ReactNode } from "react";
import ManualDetailPage from "../page";

// Mock Supabase server client
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

// Mock Next.js navigation
vi.mock("next/navigation", () => ({
  notFound: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
}));

// Mock Next.js Link component
interface MockLinkProps {
  children: ReactNode;
  href: string;
  target?: string;
  rel?: string;
}

vi.mock("next/link", () => ({
  default: ({ children, href, target, rel }: MockLinkProps) => (
    <a href={href} target={target} rel={rel}>
      {children}
    </a>
  ),
}));

// Mock components
interface MockButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  className?: string;
  size?: string;
  variant?: string;
}

vi.mock("@/components/ui/button", () => ({
  Button: ({ children, className, size, variant, ...props }: MockButtonProps) => (
    <button className={className} data-size={size} data-variant={variant} {...props}>
      {children}
    </button>
  ),
}));

interface MockErrorMessageProps {
  title?: string;
  message?: string;
}

vi.mock("@/components/ui/error-message", () => ({
  ErrorMessage: ({ title, message }: MockErrorMessageProps) => (
    <div data-testid="error-message">
      <h1>{title}</h1>
      <p>{message}</p>
    </div>
  ),
}));

type MockSupabaseClient = {
  from: Mock;
  select: Mock;
  eq: Mock;
  single: Mock;
};

describe("ManualDetailPage", () => {
  let mockSupabaseClient: MockSupabaseClient;
  let consoleErrorSpy: MockInstance;

  beforeEach(() => {
    vi.clearAllMocks();
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    mockSupabaseClient = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockReturnThis(),
    };
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  const createParams = (id: string) => Promise.resolve({ id });

  it("renders manual details successfully", async () => {
    const mockManual = {
      id: "123",
      title: "操作ガイド",
      url: "https://example.com/manual.pdf",
      category: "基本操作",
      tags: ["初心者向け", "クイックスタート"],
      is_published: true,
      updated_at: "2024-01-15T10:00:00Z",
    };

    mockSupabaseClient.single.mockResolvedValue({
      data: mockManual,
      error: null,
    });

    const { createClient } = await import("@/lib/supabase/server");
    (createClient as Mock).mockResolvedValue(mockSupabaseClient);

    const { getByText, container } = render(
      await ManualDetailPage({ params: createParams("123") })
    );

    expect(getByText("操作ガイド")).toBeInTheDocument();
    expect(getByText("カテゴリ: 基本操作")).toBeInTheDocument();
    expect(getByText("最終更新: 2024/1/15")).toBeInTheDocument();
    expect(getByText("初心者向け")).toBeInTheDocument();
    expect(getByText("クイックスタート")).toBeInTheDocument();
    expect(getByText("マニュアルを開く →")).toBeInTheDocument();

    const manualLink = container.querySelector('a[href="https://example.com/manual.pdf"]');
    expect(manualLink).toBeInTheDocument();
    expect(manualLink).toHaveAttribute("target", "_blank");
    expect(manualLink).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("renders manual without tags", async () => {
    const mockManual = {
      id: "123",
      title: "シンプルマニュアル",
      url: "https://example.com/simple.pdf",
      category: "その他",
      tags: [],
      is_published: true,
      updated_at: "2024-01-01T00:00:00Z",
    };

    mockSupabaseClient.single.mockResolvedValue({
      data: mockManual,
      error: null,
    });

    const { createClient } = await import("@/lib/supabase/server");
    (createClient as Mock).mockResolvedValue(mockSupabaseClient);

    const { getByText, queryByText } = render(
      await ManualDetailPage({ params: createParams("123") })
    );

    expect(getByText("シンプルマニュアル")).toBeInTheDocument();
    expect(queryByText("初心者向け")).not.toBeInTheDocument();
  });

  it("calls notFound when manual does not exist", async () => {
    mockSupabaseClient.single.mockResolvedValue({
      data: null,
      error: { code: "PGRST116", message: "Row not found" },
    });

    const { createClient } = await import("@/lib/supabase/server");
    (createClient as Mock).mockResolvedValue(mockSupabaseClient);

    try {
      await ManualDetailPage({ params: createParams("non-existent") });
    } catch (error) {
      // Expected to throw
    }

    const { notFound } = await import("next/navigation");
    expect(notFound).toHaveBeenCalled();
  });

  it("handles database error", async () => {
    const mockError = new Error("Database connection failed");
    mockSupabaseClient.single.mockResolvedValue({
      data: null,
      error: mockError,
    });

    const { createClient } = await import("@/lib/supabase/server");
    (createClient as Mock).mockResolvedValue(mockSupabaseClient);

    const { getByTestId, getByText } = render(
      await ManualDetailPage({ params: createParams("123") })
    );

    expect(getByTestId("error-message")).toBeInTheDocument();
    expect(getByText("マニュアルの取得に失敗しました")).toBeInTheDocument();
    expect(getByText("Database connection failed")).toBeInTheDocument();
    expect(consoleErrorSpy).toHaveBeenCalledWith("Failed to fetch manual:", mockError);
  });

  it("handles unexpected error", async () => {
    const { createClient } = await import("@/lib/supabase/server");
    (createClient as Mock).mockRejectedValue(new Error("Unexpected error"));

    const { getByTestId, getByText } = render(
      await ManualDetailPage({ params: createParams("123") })
    );

    expect(getByTestId("error-message")).toBeInTheDocument();
    expect(getByText("予期しないエラーが発生しました")).toBeInTheDocument();
    expect(getByText("ページの読み込み中にエラーが発生しました。")).toBeInTheDocument();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Unexpected error in ManualDetailPage:",
      expect.any(Error)
    );
  });

  it("queries database with correct parameters", async () => {
    mockSupabaseClient.single.mockResolvedValue({
      data: null,
      error: { code: "PGRST116", message: "Not found" },
    });

    const { createClient } = await import("@/lib/supabase/server");
    (createClient as Mock).mockResolvedValue(mockSupabaseClient);

    try {
      await ManualDetailPage({ params: createParams("test-id") });
    } catch {
      // Expected to throw
    }

    expect(mockSupabaseClient.from).toHaveBeenCalledWith("manuals");
    expect(mockSupabaseClient.select).toHaveBeenCalledWith("*");
    expect(mockSupabaseClient.eq).toHaveBeenCalledWith("id", "test-id");
    expect(mockSupabaseClient.eq).toHaveBeenCalledWith("is_published", true);
    expect(mockSupabaseClient.single).toHaveBeenCalled();
  });

  it("renders back button with correct link", async () => {
    const mockManual = {
      id: "123",
      title: "テスト",
      url: "https://example.com/test.pdf",
      category: "テスト",
      is_published: true,
      updated_at: "2024-01-01T00:00:00Z",
    };

    mockSupabaseClient.single.mockResolvedValue({
      data: mockManual,
      error: null,
    });

    const { createClient } = await import("@/lib/supabase/server");
    (createClient as Mock).mockResolvedValue(mockSupabaseClient);

    const { container } = render(await ManualDetailPage({ params: createParams("123") }));

    const backLink = container.querySelector('a[href="/"]');
    expect(backLink).toBeInTheDocument();
    expect(backLink?.textContent).toContain("ホームに戻る");
  });

  it("formats date correctly for Japanese locale", async () => {
    const mockManual = {
      id: "123",
      title: "日付テスト",
      url: "https://example.com/test.pdf",
      category: "テスト",
      is_published: true,
      updated_at: "2024-12-31T23:59:59Z",
    };

    mockSupabaseClient.single.mockResolvedValue({
      data: mockManual,
      error: null,
    });

    const { createClient } = await import("@/lib/supabase/server");
    (createClient as Mock).mockResolvedValue(mockSupabaseClient);

    const { getByText } = render(await ManualDetailPage({ params: createParams("123") }));

    // The exact format may vary based on timezone
    expect(getByText(/最終更新: 202\d\/\d+\/\d+/)).toBeInTheDocument();
  });
});
