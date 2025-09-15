import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ManualCard } from "../manual-card";

describe("ManualCard", () => {
  const mockManual = {
    id: "1",
    title: "テストマニュアル",
    url: "https://example.com/manual.pdf",
    main_category: "基本操作",
    sub_category: "初期設定",
    tags: ["初心者向け", "ガイド"],
  };

  it("renders manual title", () => {
    render(<ManualCard manual={mockManual} />);
    expect(screen.getByText("テストマニュアル")).toBeInTheDocument();
  });

  it("renders category with subcategory", () => {
    render(<ManualCard manual={mockManual} />);
    expect(screen.getByText("基本操作 > 初期設定")).toBeInTheDocument();
  });

  it("renders category without subcategory", () => {
    const manualWithoutSubCategory = {
      ...mockManual,
      sub_category: null,
    };

    render(<ManualCard manual={manualWithoutSubCategory} />);
    expect(screen.getByText("基本操作")).toBeInTheDocument();
  });

  it("renders tags", () => {
    render(<ManualCard manual={mockManual} />);
    expect(screen.getByText("#初心者向け")).toBeInTheDocument();
    expect(screen.getByText("#ガイド")).toBeInTheDocument();
  });

  it("renders without tags", () => {
    const manualWithoutTags = {
      ...mockManual,
      tags: null,
    };

    render(<ManualCard manual={manualWithoutTags} />);
    expect(screen.getByText("テストマニュアル")).toBeInTheDocument();
    expect(screen.queryByText("#初心者向け")).not.toBeInTheDocument();
  });

  it("renders description text", () => {
    render(<ManualCard manual={mockManual} />);
    expect(screen.getByText("クリックして詳細を確認")).toBeInTheDocument();
  });

  it("shows manual icon instead of thumbnail", () => {
    render(<ManualCard manual={mockManual} />);
    expect(screen.getByText("マニュアル")).toBeInTheDocument();
  });
});
