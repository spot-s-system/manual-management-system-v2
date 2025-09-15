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
import SearchPage from "../page";

// Mock Supabase server client
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

// Mock Next.js Link component
interface MockLinkProps {
  children: ReactNode;
  href: string;
  className?: string;
}

vi.mock("next/link", () => ({
  default: ({ children, href, className }: MockLinkProps) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

// Mock components
interface MockManualProps {
  manual: {
    id: string;
    title: string;
  };
}

vi.mock("@/components/manual-card-with-modal", () => ({
  ManualCardWithModal: ({ manual }: MockManualProps) => (
    <div data-testid="manual-card" data-manual-id={manual.id}>
      {manual.title}
    </div>
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
  ilike: Mock;
  order: Mock;
};

describe("SearchPage", () => {
  let mockSupabaseClient: MockSupabaseClient;
  let consoleErrorSpy: MockInstance;

  beforeEach(() => {
    vi.clearAllMocks();
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    mockSupabaseClient = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      ilike: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
    };
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  const createSearchParams = (q?: string) => Promise.resolve({ q });

  it("renders search results successfully", async () => {
    const mockManuals = [
      {
        id: "1",
        title: "基本操作マニュアル",
        url: "https://example.com/manual1.pdf",
        is_published: true,
        order_index: 1,
      },
      {
        id: "2",
        title: "基本設定ガイド",
        url: "https://example.com/manual2.pdf",
        is_published: true,
        order_index: 2,
      },
    ];

    mockSupabaseClient.order.mockResolvedValue({
      data: mockManuals,
      error: null,
    });

    const { createClient } = await import("@/lib/supabase/server");
    (createClient as Mock).mockResolvedValue(mockSupabaseClient);

    const { getByText, getAllByTestId } = render(
      await SearchPage({ searchParams: createSearchParams("基本") })
    );

    expect(getByText("「基本」の検索結果")).toBeInTheDocument();
    expect(getByText("キーワードに一致するマニュアル一覧です。")).toBeInTheDocument();

    const manualCards = getAllByTestId("manual-card");
    expect(manualCards).toHaveLength(2);
    expect(getByText("基本操作マニュアル")).toBeInTheDocument();
    expect(getByText("基本設定ガイド")).toBeInTheDocument();
  });

  it("shows empty state when no results found", async () => {
    mockSupabaseClient.order.mockResolvedValue({
      data: [],
      error: null,
    });

    const { createClient } = await import("@/lib/supabase/server");
    (createClient as Mock).mockResolvedValue(mockSupabaseClient);

    const { getByText, getByRole } = render(
      await SearchPage({ searchParams: createSearchParams("存在しない") })
    );

    expect(getByText("「存在しない」の検索結果")).toBeInTheDocument();
    expect(
      getByText("「存在しない」に一致するマニュアルが見つかりませんでした。")
    ).toBeInTheDocument();
    expect(getByText("別のキーワードでお試しください。")).toBeInTheDocument();
    expect(getByText("トップページに戻る")).toBeInTheDocument();
    expect(getByRole("img", { name: "検索結果なし" })).toBeInTheDocument();
  });

  it("handles empty search query", async () => {
    mockSupabaseClient.order.mockResolvedValue({
      data: [],
      error: null,
    });

    const { createClient } = await import("@/lib/supabase/server");
    (createClient as Mock).mockResolvedValue(mockSupabaseClient);

    const { getByText } = render(await SearchPage({ searchParams: createSearchParams() }));

    expect(getByText("「」の検索結果")).toBeInTheDocument();
    expect(mockSupabaseClient.ilike).toHaveBeenCalledWith("title", "%%");
  });

  it("handles database error", async () => {
    const mockError = new Error("Search failed");
    mockSupabaseClient.order.mockResolvedValue({
      data: null,
      error: mockError,
    });

    const { createClient } = await import("@/lib/supabase/server");
    (createClient as Mock).mockResolvedValue(mockSupabaseClient);

    const { getByTestId, getByText } = render(
      await SearchPage({ searchParams: createSearchParams("test") })
    );

    expect(getByText("「test」の検索結果")).toBeInTheDocument();
    expect(getByTestId("error-message")).toBeInTheDocument();
    expect(getByText("検索に失敗しました")).toBeInTheDocument();
    expect(getByText("Search failed")).toBeInTheDocument();
    expect(consoleErrorSpy).toHaveBeenCalledWith("Failed to search manuals:", mockError);
  });

  it("handles unexpected error", async () => {
    const { createClient } = await import("@/lib/supabase/server");
    (createClient as Mock).mockRejectedValue(new Error("Unexpected error"));

    const { getByTestId, getByText } = render(
      await SearchPage({ searchParams: createSearchParams("test") })
    );

    expect(getByTestId("error-message")).toBeInTheDocument();
    expect(getByText("予期しないエラーが発生しました")).toBeInTheDocument();
    expect(getByText("ページの読み込み中にエラーが発生しました。")).toBeInTheDocument();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Unexpected error in SearchPage:",
      expect.any(Error)
    );
  });

  it("queries database with correct parameters", async () => {
    mockSupabaseClient.order.mockResolvedValue({
      data: [],
      error: null,
    });

    const { createClient } = await import("@/lib/supabase/server");
    (createClient as Mock).mockResolvedValue(mockSupabaseClient);

    render(await SearchPage({ searchParams: createSearchParams("テスト") }));

    expect(mockSupabaseClient.from).toHaveBeenCalledWith("manuals");
    expect(mockSupabaseClient.select).toHaveBeenCalledWith("*");
    expect(mockSupabaseClient.eq).toHaveBeenCalledWith("is_published", true);
    expect(mockSupabaseClient.ilike).toHaveBeenCalledWith("title", "%テスト%");
    expect(mockSupabaseClient.order).toHaveBeenCalledWith("order_index", { ascending: true });
  });

  it("renders back link correctly", async () => {
    mockSupabaseClient.order.mockResolvedValue({
      data: [],
      error: null,
    });

    const { createClient } = await import("@/lib/supabase/server");
    (createClient as Mock).mockResolvedValue(mockSupabaseClient);

    const { container } = render(await SearchPage({ searchParams: createSearchParams("test") }));

    const backLink = container.querySelector('a[href="/"]');
    expect(backLink).toBeInTheDocument();
    expect(backLink?.textContent).toBe("トップページに戻る");
  });

  it("escapes special characters in search query", async () => {
    const specialQuery = "test%_";
    mockSupabaseClient.order.mockResolvedValue({
      data: [],
      error: null,
    });

    const { createClient } = await import("@/lib/supabase/server");
    (createClient as Mock).mockResolvedValue(mockSupabaseClient);

    const { getByText } = render(
      await SearchPage({ searchParams: createSearchParams(specialQuery) })
    );

    expect(getByText(`「${specialQuery}」の検索結果`)).toBeInTheDocument();
    expect(mockSupabaseClient.ilike).toHaveBeenCalledWith("title", `%${specialQuery}%`);
  });
});
