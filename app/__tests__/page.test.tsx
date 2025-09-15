import { render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "@testing-library/jest-dom";
import type { ReactNode } from "react";
import Home from "../(app)/page";

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

// Mock ErrorMessage component
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

// Mock lucide-react icons
vi.mock("lucide-react", () => ({
  ChevronRight: () => <span>›</span>,
}));

describe("Home Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders all fixed categories successfully", async () => {
    const { getByText, getAllByRole } = render(await Home());

    expect(getByText("カテゴリーから探す")).toBeInTheDocument();
    expect(getByText("入社（入社手続き）")).toBeInTheDocument();
    expect(getByText("賞与")).toBeInTheDocument();
    expect(getByText("有休")).toBeInTheDocument();
    expect(getByText("退職")).toBeInTheDocument();
    expect(getByText("勤怠")).toBeInTheDocument();
    expect(getByText("その他")).toBeInTheDocument();

    // Check descriptions
    expect(getByText("新入社員の入社準備に必要な手続きや情報")).toBeInTheDocument();
    expect(getByText("入社時の各種手続きと申請方法")).toBeInTheDocument();
    expect(getByText("賞与計算と支給に関する手続き")).toBeInTheDocument();
    expect(getByText("有給休暇の管理と申請方法")).toBeInTheDocument();
    expect(getByText("退職手続きと必要な対応")).toBeInTheDocument();
    expect(getByText("勤怠管理とシフト設定")).toBeInTheDocument();
    expect(getByText("その他の管理業務に関するマニュアル")).toBeInTheDocument();

    // Check links
    const links = getAllByRole("link");
    expect(links).toHaveLength(7);
    expect(links[0]).toHaveAttribute("href", "/category/入社（入社日まで）");
    expect(links[1]).toHaveAttribute("href", "/category/入社（入社手続き）");
    expect(links[2]).toHaveAttribute("href", "/category/賞与");
    expect(links[3]).toHaveAttribute("href", "/category/有休");
    expect(links[4]).toHaveAttribute("href", "/category/退職");
    expect(links[5]).toHaveAttribute("href", "/category/勤怠");
    expect(links[6]).toHaveAttribute("href", "/category/その他");
  });

  it("renders correct layout structure", async () => {
    const { container } = render(await Home());

    expect(container.querySelector(".min-h-screen.bg-slate-100")).toBeInTheDocument();
    expect(container.querySelector(".container.mx-auto")).toBeInTheDocument();
    expect(container.querySelector(".grid")).toBeInTheDocument();
  });

  it("renders category icons", async () => {
    const { getAllByTestId } = render(await Home());

    const icons = getAllByTestId("category-icon");
    expect(icons).toHaveLength(7);
    expect(icons[0]).toHaveAttribute("data-icon", "UserPlus");
    expect(icons[1]).toHaveAttribute("data-icon", "ClipboardList");
    expect(icons[2]).toHaveAttribute("data-icon", "Gift");
    expect(icons[3]).toHaveAttribute("data-icon", "Calendar");
    expect(icons[4]).toHaveAttribute("data-icon", "UserMinus");
    expect(icons[5]).toHaveAttribute("data-icon", "Clock");
    expect(icons[6]).toHaveAttribute("data-icon", "MoreHorizontal");
  });

  it("renders もっと見る links for each category", async () => {
    const { container } = render(await Home());

    const moreLinks = container.querySelectorAll("span");
    const moreTextCount = Array.from(moreLinks).filter((span) =>
      span.textContent?.includes("もっと見る")
    ).length;
    expect(moreTextCount).toBe(7);
  });
});
