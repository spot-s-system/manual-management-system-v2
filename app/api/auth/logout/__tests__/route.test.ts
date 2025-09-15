import { NextResponse } from "next/server";
import { type Mock, afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "../route";

// Mock Next.js server functions
vi.mock("next/server", () => ({
  NextResponse: {
    redirect: vi.fn((url) => ({
      status: 307,
      headers: new Headers({ Location: url.toString() }),
      url: url.toString(),
    })),
  },
}));

// Mock Supabase server client
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

type MockSupabaseClient = {
  auth: {
    signOut: Mock;
  };
};

describe("POST /api/auth/logout", () => {
  let mockSupabaseClient: MockSupabaseClient;
  let mockSignOut: Mock;

  beforeEach(async () => {
    vi.clearAllMocks();

    mockSignOut = vi.fn().mockResolvedValue({ error: null });
    mockSupabaseClient = {
      auth: {
        signOut: mockSignOut,
      },
    };

    const { createClient } = await import("@/lib/supabase/server");
    (createClient as Mock).mockResolvedValue(mockSupabaseClient);
  });

  it("calls supabase signOut", async () => {
    await POST();

    expect(mockSignOut).toHaveBeenCalledTimes(1);
  });

  it("redirects to login page with default URL", async () => {
    const originalEnv = process.env.NEXT_PUBLIC_SITE_URL;
    // biome-ignore lint/performance/noDelete: Need to actually delete to test fallback behavior
    delete process.env.NEXT_PUBLIC_SITE_URL;

    const response = await POST();

    expect(NextResponse.redirect).toHaveBeenCalledWith(
      new URL("/admin/login", "http://localhost:3000")
    );
    expect(response.url).toContain("/admin/login");

    process.env.NEXT_PUBLIC_SITE_URL = originalEnv;
  });

  it("redirects to login page with site URL from env", async () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://example.com";

    const response = await POST();

    expect(NextResponse.redirect).toHaveBeenCalledWith(
      new URL("/admin/login", "https://example.com")
    );
    expect(response.url).toContain("/admin/login");
  });

  it("handles signOut error gracefully", async () => {
    mockSignOut.mockResolvedValue({ error: new Error("Sign out failed") });

    // Should still redirect even if signOut fails
    const response = await POST();

    expect(NextResponse.redirect).toHaveBeenCalled();
    expect(response.url).toContain("/admin/login");
  });
});
