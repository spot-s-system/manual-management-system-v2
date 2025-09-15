import { fireEvent, render, waitFor } from "@testing-library/react";
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
import RequestPage from "../page";

// Mock Supabase browser client
vi.mock("@supabase/ssr", () => ({
  createBrowserClient: vi.fn(),
}));

// Mock Next.js navigation
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock components
import type { ReactNode } from "react";

interface MockButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: string;
}

vi.mock("@/components/ui/button", () => ({
  Button: ({ children, disabled, onClick, type, variant, ...props }: MockButtonProps) => (
    <button type={type} disabled={disabled} onClick={onClick} data-variant={variant} {...props}>
      {children}
    </button>
  ),
}));

interface MockCardProps {
  children: ReactNode;
}

vi.mock("@/components/ui/card", () => ({
  Card: ({ children }: MockCardProps) => <div data-testid="card">{children}</div>,
  CardHeader: ({ children }: MockCardProps) => <div data-testid="card-header">{children}</div>,
  CardTitle: ({ children }: MockCardProps) => <h1>{children}</h1>,
  CardDescription: ({ children }: MockCardProps) => <p>{children}</p>,
  CardContent: ({ children }: MockCardProps) => <div data-testid="card-content">{children}</div>,
}));

vi.mock("@/components/ui/input", () => ({
  Input: (props: React.InputHTMLAttributes<HTMLInputElement>) => <input {...props} />,
}));

interface MockLabelProps {
  children: ReactNode;
  htmlFor?: string;
}

vi.mock("@/components/ui/label", () => ({
  Label: ({ children, htmlFor }: MockLabelProps) => <label htmlFor={htmlFor}>{children}</label>,
}));

vi.mock("@/components/ui/textarea", () => ({
  Textarea: (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => <textarea {...props} />,
}));

// Mock fetch
global.fetch = vi.fn();

// Mock alert
global.alert = vi.fn();

type MockSupabaseClient = {
  from: MockInstance;
  insert: MockInstance;
};

describe("RequestPage", () => {
  let mockSupabaseClient: MockSupabaseClient;
  let consoleErrorSpy: MockInstance;
  const originalEnv = process.env;

  beforeEach(async () => {
    vi.clearAllMocks();
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-anon-key";

    mockSupabaseClient = {
      from: vi.fn().mockReturnThis(),
      insert: vi.fn(),
    };

    const { createBrowserClient } = await import("@supabase/ssr");
    (createBrowserClient as Mock).mockReturnValue(mockSupabaseClient);
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    process.env = originalEnv;
  });

  it("renders form with all fields", () => {
    const { getByLabelText, getByText } = render(<RequestPage />);

    expect(getByText("マニュアルリクエストフォーム")).toBeInTheDocument();
    expect(getByText(/必要なマニュアルについてのリクエストを送信してください/)).toBeInTheDocument();

    expect(getByLabelText(/お名前/)).toBeInTheDocument();
    expect(getByLabelText(/メールアドレス/)).toBeInTheDocument();
    expect(getByLabelText("部署")).toBeInTheDocument();
    expect(getByLabelText(/緊急度/)).toBeInTheDocument();
    expect(getByLabelText(/リクエストするマニュアルのタイトル/)).toBeInTheDocument();
    expect(getByLabelText(/マニュアルの内容説明/)).toBeInTheDocument();
    expect(getByLabelText("使用目的・シーン")).toBeInTheDocument();
    expect(getByLabelText("想定利用者")).toBeInTheDocument();
    expect(getByLabelText("その他備考")).toBeInTheDocument();
  });

  it("handles form submission successfully", async () => {
    mockSupabaseClient.insert.mockResolvedValue({ error: null });
    (global.fetch as Mock).mockResolvedValue({ ok: true });

    const { getByLabelText, getByText } = render(<RequestPage />);

    // Fill form
    fireEvent.change(getByLabelText(/お名前/), { target: { value: "山田太郎" } });
    fireEvent.change(getByLabelText(/メールアドレス/), { target: { value: "yamada@example.com" } });
    fireEvent.change(getByLabelText("部署"), { target: { value: "営業部" } });
    fireEvent.change(getByLabelText(/緊急度/), { target: { value: "high" } });
    fireEvent.change(getByLabelText(/リクエストするマニュアルのタイトル/), {
      target: { value: "新製品マニュアル" },
    });
    fireEvent.change(getByLabelText(/マニュアルの内容説明/), {
      target: { value: "新製品の使い方" },
    });

    // Submit form
    const submitButton = getByText("リクエストを送信");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockSupabaseClient.from).toHaveBeenCalledWith("manual_requests");
      expect(mockSupabaseClient.insert).toHaveBeenCalledWith([
        expect.objectContaining({
          requester_name: "山田太郎",
          requester_email: "yamada@example.com",
          department: "営業部",
          urgency: "high",
          manual_title: "新製品マニュアル",
          manual_description: "新製品の使い方",
        }),
      ]);
      expect(global.fetch).toHaveBeenCalledWith("/api/request/notify", expect.any(Object));
      expect(global.alert).toHaveBeenCalledWith(
        "リクエストが送信されました。ありがとうございました。"
      );
      expect(mockPush).toHaveBeenCalledWith("/");
    });
  });

  it("shows error when database insert fails", async () => {
    const mockError = new Error("Database error");
    mockSupabaseClient.insert.mockResolvedValue({ error: mockError });

    const { getByLabelText, getByText, getByRole } = render(<RequestPage />);

    // Fill required fields
    fireEvent.change(getByLabelText(/お名前/), { target: { value: "テスト" } });
    fireEvent.change(getByLabelText(/メールアドレス/), { target: { value: "test@example.com" } });
    fireEvent.change(getByLabelText(/リクエストするマニュアルのタイトル/), {
      target: { value: "テスト" },
    });
    fireEvent.change(getByLabelText(/マニュアルの内容説明/), {
      target: { value: "テスト" },
    });

    fireEvent.click(getByText("リクエストを送信"));

    await waitFor(() => {
      expect(getByRole("alert")).toHaveTextContent(
        "リクエストの送信に失敗しました: Database error"
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith("Failed to insert manual request:", mockError);
    });
  });

  it("continues even if notification fails", async () => {
    mockSupabaseClient.insert.mockResolvedValue({ error: null });
    (global.fetch as Mock).mockRejectedValue(new Error("Network error"));

    const { getByLabelText, getByText } = render(<RequestPage />);

    // Fill required fields
    fireEvent.change(getByLabelText(/お名前/), { target: { value: "テスト" } });
    fireEvent.change(getByLabelText(/メールアドレス/), { target: { value: "test@example.com" } });
    fireEvent.change(getByLabelText(/リクエストするマニュアルのタイトル/), {
      target: { value: "テスト" },
    });
    fireEvent.change(getByLabelText(/マニュアルの内容説明/), {
      target: { value: "テスト" },
    });

    fireEvent.click(getByText("リクエストを送信"));

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Failed to send notification:",
        expect.any(Error)
      );
      expect(global.alert).toHaveBeenCalledWith(
        "リクエストが送信されました。ありがとうございました。"
      );
      expect(mockPush).toHaveBeenCalledWith("/");
    });
  });

  it("disables submit button while submitting", async () => {
    mockSupabaseClient.insert.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ error: null }), 100))
    );

    const { getByLabelText, getByText } = render(<RequestPage />);

    // Fill required fields
    fireEvent.change(getByLabelText(/お名前/), { target: { value: "テスト" } });
    fireEvent.change(getByLabelText(/メールアドレス/), { target: { value: "test@example.com" } });
    fireEvent.change(getByLabelText(/リクエストするマニュアルのタイトル/), {
      target: { value: "テスト" },
    });
    fireEvent.change(getByLabelText(/マニュアルの内容説明/), {
      target: { value: "テスト" },
    });

    const submitButton = getByText("リクエストを送信");
    fireEvent.click(submitButton);

    expect(getByText("送信中...")).toBeInTheDocument();
    expect(submitButton).toBeDisabled();

    await waitFor(() => {
      expect(getByText("リクエストを送信")).toBeInTheDocument();
    });
  });

  it("navigates back on cancel", () => {
    const { getByText } = render(<RequestPage />);

    fireEvent.click(getByText("キャンセル"));

    expect(mockPush).toHaveBeenCalledWith("/");
  });

  it("updates form data on input change", () => {
    const { getByLabelText } = render(<RequestPage />);

    const nameInput = getByLabelText(/お名前/) as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: "新しい名前" } });
    expect(nameInput.value).toBe("新しい名前");

    const urgencySelect = getByLabelText(/緊急度/) as HTMLSelectElement;
    fireEvent.change(urgencySelect, { target: { value: "low" } });
    expect(urgencySelect.value).toBe("low");
  });

  it("shows error when environment variables are missing", () => {
    // Save current env values
    const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const originalKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // Delete env variables

    // biome-ignore lint/performance/noDelete: Need to actually delete to test missing env vars, setting to undefined doesn't work
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    // biome-ignore lint/performance/noDelete: Need to actually delete to test missing env vars, setting to undefined doesn't work
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const { getByText } = render(<RequestPage />);
    expect(getByText("Missing Supabase environment variables")).toBeInTheDocument();

    // Restore env variables
    process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl;
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = originalKey;
  });

  it("has correct accessibility attributes", () => {
    const { getByLabelText } = render(<RequestPage />);

    const nameInput = getByLabelText(/お名前/);
    expect(nameInput).toHaveAttribute("aria-required", "true");
    expect(nameInput).toBeRequired();

    const urgencySelect = getByLabelText(/緊急度/);
    expect(urgencySelect).toHaveAttribute("aria-describedby", "urgency-help");
  });

  it("handles notification API error response", async () => {
    mockSupabaseClient.insert.mockResolvedValue({ error: null });
    (global.fetch as Mock).mockResolvedValue({
      ok: false,
      statusText: "Internal Server Error",
    });

    const { getByLabelText, getByText } = render(<RequestPage />);

    // Fill required fields
    fireEvent.change(getByLabelText(/お名前/), { target: { value: "テスト" } });
    fireEvent.change(getByLabelText(/メールアドレス/), { target: { value: "test@example.com" } });
    fireEvent.change(getByLabelText(/リクエストするマニュアルのタイトル/), {
      target: { value: "テスト" },
    });
    fireEvent.change(getByLabelText(/マニュアルの内容説明/), {
      target: { value: "テスト" },
    });

    fireEvent.click(getByText("リクエストを送信"));

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Failed to send notification:",
        "Internal Server Error"
      );
      expect(global.alert).toHaveBeenCalledWith(
        "リクエストが送信されました。ありがとうございました。"
      );
    });
  });
});
