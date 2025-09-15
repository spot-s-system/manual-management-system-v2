import type { NextRequest, NextResponse } from "next/server";
import { type MockInstance, afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "../route";

// Mock Next.js server functions
vi.mock("next/server", () => ({
  NextRequest: vi.fn(),
  NextResponse: {
    json: vi.fn((data, init) => ({
      status: init?.status || 200,
      body: data,
      headers: new Headers({ "content-type": "application/json" }),
    })),
  },
}));

describe("POST /api/request/notify", () => {
  let consoleLogSpy: MockInstance;
  let consoleErrorSpy: MockInstance;
  const originalEnv = process.env.NODE_ENV;
  const originalAdminEmail = process.env.ADMIN_EMAIL;

  beforeEach(() => {
    vi.clearAllMocks();
    consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.stubEnv("NODE_ENV", "development");
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    vi.unstubAllEnvs();
    if (originalAdminEmail !== undefined) {
      process.env.ADMIN_EMAIL = originalAdminEmail;
    }
  });

  const createMockRequest = (data: unknown) => {
    return {
      json: vi.fn().mockResolvedValue(data),
    } as unknown as NextRequest;
  };

  const mockRequestData = {
    requester_name: "山田太郎",
    requester_email: "yamada@example.com",
    department: "営業部",
    urgency: "high",
    manual_title: "新製品マニュアル",
    manual_description: "新製品の操作方法について",
    use_case: "顧客向け説明",
    expected_users: "営業スタッフ",
    additional_notes: "至急お願いします",
  };

  it("processes notification request successfully", async () => {
    const request = createMockRequest(mockRequestData);

    const response = await POST(request);

    expect(response.body).toEqual({ success: true });
    expect(consoleLogSpy).toHaveBeenCalled();
  });

  it("logs email in development mode", async () => {
    const request = createMockRequest(mockRequestData);

    await POST(request);

    const logCalls = consoleLogSpy.mock.calls.flat().join("\n");
    expect(logCalls).toContain("=== マニュアルリクエスト通知メール ===");
    expect(logCalls).toContain("山田太郎");
    expect(logCalls).toContain("yamada@example.com");
    expect(logCalls).toContain("営業部");
    expect(logCalls).toContain("高"); // urgency: high -> 高
    expect(logCalls).toContain("新製品マニュアル");
  });

  it("uses default admin email when not set", async () => {
    // biome-ignore lint/performance/noDelete: Need to actually delete to test default email fallback
    delete process.env.ADMIN_EMAIL;
    const request = createMockRequest(mockRequestData);

    await POST(request);

    const logCalls = consoleLogSpy.mock.calls.flat().join("\n");
    expect(logCalls).toContain("admin@example.com");
  });

  it("uses custom admin email from env", async () => {
    process.env.ADMIN_EMAIL = "custom@company.com";
    const request = createMockRequest(mockRequestData);

    await POST(request);

    const logCalls = consoleLogSpy.mock.calls.flat().join("\n");
    expect(logCalls).toContain("custom@company.com");
  });

  it("handles optional fields correctly", async () => {
    const minimalData = {
      requester_name: "田中花子",
      requester_email: "tanaka@example.com",
      urgency: "low",
      manual_title: "基本マニュアル",
      manual_description: "基本的な使い方",
    };
    const request = createMockRequest(minimalData);

    await POST(request);

    const logCalls = consoleLogSpy.mock.calls.flat().join("\n");
    expect(logCalls).toContain("部署: 未記入");
    expect(logCalls).toContain("使用目的: 未記入");
    expect(logCalls).toContain("想定利用者: 未記入");
    expect(logCalls).toContain("備考: 未記入");
  });

  it("converts urgency levels correctly", async () => {
    const urgencyLevels = [
      { urgency: "low", expected: "低" },
      { urgency: "medium", expected: "中" },
      { urgency: "high", expected: "高" },
    ];

    for (const { urgency, expected } of urgencyLevels) {
      const data = { ...mockRequestData, urgency };
      const request = createMockRequest(data);

      await POST(request);

      const logCalls = consoleLogSpy.mock.calls.flat().join("\n");
      expect(logCalls).toContain(`緊急度: ${expected}`);

      consoleLogSpy.mockClear();
    }
  });

  it("logs differently in production mode", async () => {
    vi.stubEnv("NODE_ENV", "production");
    const request = createMockRequest(mockRequestData);

    await POST(request);

    const logCalls = consoleLogSpy.mock.calls.flat().join("\n");
    expect(logCalls).toContain("Production email would be sent to:");
    expect(logCalls).not.toContain("=== マニュアルリクエスト通知メール ===");
  });

  it("handles JSON parsing error", async () => {
    const request = {
      json: vi.fn().mockRejectedValue(new Error("Invalid JSON")),
    } as unknown as NextRequest;

    const response = await POST(request);

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: "Failed to send notification" });
    expect(consoleErrorSpy).toHaveBeenCalledWith("Error sending notification:", expect.any(Error));
  });

  it("returns error response on exception", async () => {
    const request = createMockRequest(mockRequestData);
    // Force an error by mocking console.log to throw
    consoleLogSpy.mockImplementation(() => {
      throw new Error("Unexpected error");
    });

    const response = await POST(request);

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: "Failed to send notification" });
  });
});
