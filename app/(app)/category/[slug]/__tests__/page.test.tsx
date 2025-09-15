import { render, waitFor } from "@testing-library/react";
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
import CategoryPage from "../page";

type MockSupabaseClient = {
  from: Mock;
  select: Mock;
  eq: Mock;
  order: Mock;
};

// Create a reference to store the mock client
let mockSupabaseClientRef: MockSupabaseClient;

// Mock Supabase client
vi.mock("@/lib/supabase/client", () => ({
  createClient: vi.fn(() => mockSupabaseClientRef),
}));

// Mock Next.js navigation
let mockSlug = "test-slug";
vi.mock("next/navigation", () => ({
  notFound: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
  useParams: () => ({ slug: mockSlug }),
}));

// Mock Next.js Link component
interface MockLinkProps {
  children: ReactNode;
  href: string;
}

vi.mock("next/link", () => ({
  default: ({ children, href }: MockLinkProps) => <a href={href}>{children}</a>,
}));

// Mock Next.js Image component
interface MockImageProps {
  alt: string;
  [key: string]: unknown;
}

vi.mock("next/image", () => ({
  default: ({ alt, ...props }: MockImageProps) => (
    // eslint-disable-next-line @next/next/no-img-element
    // biome-ignore lint/a11y/useAltText: This is a mock component for testing
    <img alt={alt} {...props} />
  ),
}));

// Mock components
interface MockCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

vi.mock("@/components/ui/card", () => ({
  Card: ({ children, className, onClick }: MockCardProps) => (
    <button type="button" className={className} onClick={onClick}>
      {children}
    </button>
  ),
}));

interface MockButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  className?: string;
  variant?: string;
  size?: string;
}

vi.mock("@/components/ui/button", () => ({
  Button: ({ children, className, ...props }: MockButtonProps) => (
    <button className={className} {...props}>
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

interface MockManualModalProps {
  isOpen: boolean;
  onClose: () => void;
  manual: {
    id: string;
    title: string;
    url: string;
    main_category: string;
    sub_category?: string;
  };
}

vi.mock("@/components/ui/manual-modal", () => ({
  ManualModal: ({ isOpen, onClose, manual }: MockManualModalProps) =>
    isOpen ? (
      <div data-testid="manual-modal">
        <h1>{manual.title}</h1>
        <button type="button" onClick={onClose}>
          Close
        </button>
      </div>
    ) : null,
}));

// Mock lucide-react icons
vi.mock("lucide-react", () => ({
  ChevronRight: () => <span>›</span>,
  LayoutGrid: () => <span>⊞</span>,
}));

// Mock CategoryIcon component
interface MockCategoryIconProps {
  iconName?: string;
  className?: string;
}

vi.mock("@/components/ui/category-icon", () => ({
  CategoryIcon: ({ iconName, className }: MockCategoryIconProps) => (
    <div data-testid="category-icon" data-icon={iconName} className={className} />
  ),
}));

// Mock categories constants
vi.mock("@/app/constants/categories", () => ({
  CATEGORIES: {
    "入社（入社日まで）": {
      name: "入社（入社日まで）",
      label: "入社（入社日まで）",
      subcategories: ["本人情報", "給与情報", "通勤手当", "保険関係"],
    },
    "入社（入社手続き）": {
      name: "入社（入社手続き）",
      label: "入社（入社手続き）",
      subcategories: ["税金", "保険関係"],
    },
    賞与: {
      name: "賞与",
      label: "賞与",
      subcategories: [],
    },
    有休: {
      name: "有休",
      label: "有休",
      subcategories: [],
    },
    退職: {
      name: "退職",
      label: "退職",
      subcategories: [],
    },
    勤怠: {
      name: "勤怠",
      label: "勤怠",
      subcategories: [],
    },
    その他: {
      name: "その他",
      label: "その他",
      subcategories: [],
    },
  },
  getSubCategories: (mainCategory: string) => {
    const categories: Record<string, string[]> = {
      "入社（入社日まで）": ["本人情報", "給与情報", "通勤手当", "保険関係"],
      "入社（入社手続き）": ["税金", "保険関係"],
      賞与: [],
      有休: [],
      退職: [],
      勤怠: [],
      その他: [],
    };
    return categories[mainCategory] || [];
  },
}));

describe("CategoryPage", () => {
  let mockSupabaseClient: MockSupabaseClient;
  let consoleErrorSpy: MockInstance;

  beforeEach(() => {
    vi.clearAllMocks();
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    mockSupabaseClient = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
    };

    // Set the reference so the mock can use it
    mockSupabaseClientRef = mockSupabaseClient;
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    mockSlug = "test-slug";
  });

  it("renders category and manuals successfully", async () => {
    mockSlug = "入社（入社日まで）";

    const mockManuals = [
      {
        id: "1",
        title: "新入社員ガイド",
        url: "https://example.com/manual1.pdf",
        main_category: "入社（入社日まで）",
        sub_category: "本人情報",
        is_published: true,
        order_index: 1,
      },
      {
        id: "2",
        title: "入社前準備リスト",
        url: "https://example.com/manual2.pdf",
        main_category: "入社（入社日まで）",
        sub_category: "本人情報",
        is_published: true,
        order_index: 2,
      },
    ];

    mockSupabaseClient.order.mockResolvedValue({
      data: mockManuals,
      error: null,
    });

    const { getByText, getAllByText } = render(<CategoryPage />);

    // Wait for the component to load
    await waitFor(() => {
      // Use getAllByText since the category name appears multiple times
      const categoryNames = getAllByText("入社（入社日まで）");
      expect(categoryNames.length).toBeGreaterThan(0);
    });

    expect(
      getByText("入社（入社日まで）に関する操作ガイドをご覧いただけます。")
    ).toBeInTheDocument();
    expect(getByText("カテゴリ一覧に戻る")).toBeInTheDocument();

    // Check sub-category sections
    expect(getByText("本人情報")).toBeInTheDocument();
    expect(getByText("新入社員ガイド")).toBeInTheDocument();
    expect(getByText("入社前準備リスト")).toBeInTheDocument();
  });

  it("shows empty state when no manuals exist", async () => {
    mockSlug = "退職";

    mockSupabaseClient.order.mockResolvedValue({
      data: [],
      error: null,
    });

    const { getByText, getAllByText } = render(<CategoryPage />);

    await waitFor(() => {
      // Use getAllByText since the category name appears multiple times
      const categoryNames = getAllByText("退職");
      expect(categoryNames.length).toBeGreaterThan(0);
    });

    expect(getByText("このカテゴリにはまだマニュアルがありません。")).toBeInTheDocument();
    expect(getByText("新しいマニュアルが追加されるのをお待ちください。")).toBeInTheDocument();
  });

  it("calls notFound when category does not exist", async () => {
    mockSlug = "non-existent";

    // Get the mocked module
    const navigationModule = (await vi.importMock("next/navigation")) as {
      notFound: Mock;
    };

    expect(() => render(<CategoryPage />)).toThrow("NEXT_NOT_FOUND");
    expect(navigationModule.notFound).toHaveBeenCalled();
  });

  it("handles manuals fetch error", async () => {
    mockSlug = "賞与";

    const mockError = new Error("Failed to fetch manuals");

    mockSupabaseClient.order.mockResolvedValue({
      data: null,
      error: mockError,
    });

    const { getByTestId, getByText } = render(<CategoryPage />);

    await waitFor(() => {
      expect(getByTestId("error-message")).toBeInTheDocument();
    });

    expect(getByText("マニュアルの取得に失敗しました")).toBeInTheDocument();
    expect(getByText("Failed to fetch manuals")).toBeInTheDocument();
  });

  it("shows loading state initially", () => {
    mockSlug = "勤怠";

    mockSupabaseClient.order.mockImplementation(() => new Promise(() => {})); // Never resolve

    const { getByText } = render(<CategoryPage />);

    expect(getByText("読み込み中...")).toBeInTheDocument();
  });

  it("queries database with correct parameters", async () => {
    mockSlug = "勤怠";

    mockSupabaseClient.order.mockResolvedValue({
      data: [],
      error: null,
    });

    render(<CategoryPage />);

    await waitFor(() => {
      expect(mockSupabaseClient.from).toHaveBeenCalledWith("manuals");
      expect(mockSupabaseClient.select).toHaveBeenCalledWith("*");
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith("main_category", "勤怠");
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith("is_published", true);
      expect(mockSupabaseClient.order).toHaveBeenCalledWith("order_index", { ascending: true });
    });
  });

  it("renders back button with correct link", async () => {
    mockSlug = "その他";

    mockSupabaseClient.order.mockResolvedValue({
      data: [],
      error: null,
    });

    const { container } = render(<CategoryPage />);

    await waitFor(() => {
      const backLink = container.querySelector('a[href="/"]');
      expect(backLink).toBeInTheDocument();
      expect(backLink?.textContent).toContain("カテゴリ一覧に戻る");
    });
  });
});
