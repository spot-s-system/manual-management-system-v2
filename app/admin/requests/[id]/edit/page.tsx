"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type ManualRequest = {
  id: string;
  requester_name: string;
  requester_email: string;
  department: string | null;
  manual_title: string;
  manual_description: string;
  urgency: "low" | "medium" | "high";
  use_case: string | null;
  expected_users: string | null;
  additional_notes: string | null;
  status: "pending" | "in_progress" | "completed" | "rejected";
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  manual_id: string | null;
};

export default function EditRequestPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [request, setRequest] = useState<ManualRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase環境変数が設定されていません");
  }

  const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

  useEffect(() => {
    params.then(({ id }) => setRequestId(id));
  }, [params]);

  useEffect(() => {
    if (requestId) {
      loadRequest();
    }
  }, [requestId]);

  const loadRequest = async () => {
    try {
      const { data, error } = await supabase
        .from("manual_requests")
        .select("*")
        .eq("id", requestId)
        .single();

      if (error) {
        console.error("Failed to load request:", error);
        throw error;
      }
      setRequest(data);
    } catch (err) {
      console.error("Error loading request:", err);
      setError("リクエストの読み込みに失敗しました。");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!request) return;

    setIsSaving(true);
    setError(null);

    try {
      const updateData: Partial<ManualRequest> = {
        status: request.status,
        admin_notes: request.admin_notes,
        manual_id: request.manual_id,
      };

      if (request.status === "completed") {
        updateData.completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from("manual_requests")
        .update(updateData)
        .eq("id", requestId);

      if (error) {
        console.error("Failed to update request:", error);
        throw error;
      }

      alert("リクエストを更新しました。");
      router.push("/admin/requests");
    } catch (err) {
      console.error("Error saving request:", err);
      setError("保存に失敗しました。");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>読み込み中...</p>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-red-600">リクエストが見つかりません。</p>
      </div>
    );
  }

  const urgencyLabels = {
    low: "低",
    medium: "中",
    high: "高",
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">リクエスト詳細・編集</h1>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>リクエスト情報</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>リクエスト者</Label>
                <p className="mt-1">{request.requester_name}</p>
              </div>
              <div>
                <Label>メールアドレス</Label>
                <p className="mt-1">{request.requester_email}</p>
              </div>
              <div>
                <Label>部署</Label>
                <p className="mt-1">{request.department || "-"}</p>
              </div>
              <div>
                <Label>緊急度</Label>
                <p className="mt-1">{urgencyLabels[request.urgency]}</p>
              </div>
              <div>
                <Label>リクエスト日</Label>
                <p className="mt-1">{new Date(request.created_at).toLocaleDateString("ja-JP")}</p>
              </div>
              <div>
                <Label>最終更新日</Label>
                <p className="mt-1">{new Date(request.updated_at).toLocaleDateString("ja-JP")}</p>
              </div>
            </div>

            <div>
              <Label>操作ガイドタイトル</Label>
              <p className="mt-1 font-semibold">{request.manual_title}</p>
            </div>

            <div>
              <Label>説明</Label>
              <p className="mt-1 whitespace-pre-wrap">{request.manual_description}</p>
            </div>

            {request.use_case && (
              <div>
                <Label>使用目的</Label>
                <p className="mt-1">{request.use_case}</p>
              </div>
            )}

            {request.expected_users && (
              <div>
                <Label>想定利用者</Label>
                <p className="mt-1">{request.expected_users}</p>
              </div>
            )}

            {request.additional_notes && (
              <div>
                <Label>備考</Label>
                <p className="mt-1">{request.additional_notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>対応状況</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="status">ステータス</Label>
              <select
                id="status"
                value={request.status}
                onChange={(e) =>
                  setRequest({
                    ...request,
                    status: e.target.value as ManualRequest["status"],
                  })
                }
                className="w-full mt-1 p-2 border rounded-md"
              >
                <option value="pending">未対応</option>
                <option value="in_progress">対応中</option>
                <option value="completed">完了</option>
                <option value="rejected">却下</option>
              </select>
            </div>

            <div>
              <Label htmlFor="manual_id">関連マニュアルID（完了時）</Label>
              <Input
                id="manual_id"
                value={request.manual_id || ""}
                onChange={(e) => setRequest({ ...request, manual_id: e.target.value || null })}
                placeholder="作成した操作ガイドのIDを入力"
              />
            </div>

            <div>
              <Label htmlFor="admin_notes">管理者メモ</Label>
              <Textarea
                id="admin_notes"
                value={request.admin_notes || ""}
                onChange={(e) => setRequest({ ...request, admin_notes: e.target.value || null })}
                rows={4}
                placeholder="対応状況や判断理由などを記録"
              />
            </div>

            {error && <p className="text-red-600 text-sm">{error}</p>}

            <div className="flex gap-4">
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? "保存中..." : "保存"}
              </Button>
              <Button variant="outline" onClick={() => router.push("/admin/requests")}>
                キャンセル
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
