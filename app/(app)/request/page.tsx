"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RequestPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    requester_name: "",
    requester_email: "",
    department: "",
    manual_title: "",
    manual_description: "",
    urgency: "medium",
    use_case: "",
    expected_users: "",
    additional_notes: "",
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">Missing Supabase environment variables</p>
      </div>
    );
  }

  const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const { error: insertError } = await supabase.from("manual_requests").insert([formData]);

      if (insertError) {
        console.error("Failed to insert manual request:", insertError);
        throw insertError;
      }

      // メール通知のAPIを呼び出す
      try {
        const response = await fetch("/api/request/notify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          console.error("Failed to send notification:", response.statusText);
        }
      } catch (notifyError) {
        console.error("Failed to send notification:", notifyError);
        // 通知の失敗は続行を妨げない
      }

      alert("リクエストが送信されました。ありがとうございました。");
      router.push("/");
    } catch (err) {
      console.error("Error submitting request:", err);
      if (err instanceof Error) {
        setError(`リクエストの送信に失敗しました: ${err.message}`);
      } else {
        setError("リクエストの送信に失敗しました。もう一度お試しください。");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl">操作ガイドリクエストフォーム</CardTitle>
          <CardDescription className="text-sm sm:text-base">
            必要な操作ガイドについてのリクエストを送信してください。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <fieldset className="space-y-6">
              <legend className="sr-only">基本情報</legend>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="requester_name" className="text-sm">
                    お名前 <span aria-label="必須項目">*</span>
                  </Label>
                  <Input
                    id="requester_name"
                    name="requester_name"
                    required
                    aria-required="true"
                    value={formData.requester_name}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="requester_email" className="text-sm">
                    メールアドレス <span aria-label="必須項目">*</span>
                  </Label>
                  <Input
                    id="requester_email"
                    name="requester_email"
                    type="email"
                    required
                    aria-required="true"
                    value={formData.requester_email}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department" className="text-sm">
                    部署
                  </Label>
                  <Input
                    id="department"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="urgency" className="text-sm">
                    緊急度 <span aria-label="必須項目">*</span>
                  </Label>
                  <select
                    id="urgency"
                    name="urgency"
                    required
                    aria-required="true"
                    value={formData.urgency}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-600"
                    aria-describedby="urgency-help"
                  >
                    <option value="low">低</option>
                    <option value="medium">中</option>
                    <option value="high">高</option>
                  </select>
                  <span id="urgency-help" className="sr-only">
                    緊急度を選択してください
                  </span>
                </div>
              </div>
            </fieldset>

            <fieldset className="space-y-6">
              <legend className="sr-only">操作ガイド詳細情報</legend>
              <div className="space-y-2">
                <Label htmlFor="manual_title" className="text-sm">
                  リクエストする操作ガイドのタイトル <span aria-label="必須項目">*</span>
                </Label>
                <Input
                  id="manual_title"
                  name="manual_title"
                  required
                  aria-required="true"
                  value={formData.manual_title}
                  onChange={handleChange}
                  placeholder="例: 新入社員向け業務システム操作ガイド"
                  className="text-sm placeholder:text-xs sm:placeholder:text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="manual_description" className="text-sm">
                  操作ガイドの内容説明 <span aria-label="必須項目">*</span>
                </Label>
                <Textarea
                  id="manual_description"
                  name="manual_description"
                  required
                  aria-required="true"
                  value={formData.manual_description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="どのような内容の操作ガイドが必要か、詳しくご記入ください"
                  className="text-sm placeholder:text-xs sm:placeholder:text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="use_case" className="text-sm">
                  使用目的・シーン
                </Label>
                <Textarea
                  id="use_case"
                  name="use_case"
                  value={formData.use_case}
                  onChange={handleChange}
                  rows={3}
                  placeholder="この操作ガイドをどのような場面で使用する予定かご記入ください"
                  className="text-sm placeholder:text-xs sm:placeholder:text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expected_users" className="text-sm">
                  想定利用者
                </Label>
                <Input
                  id="expected_users"
                  name="expected_users"
                  value={formData.expected_users}
                  onChange={handleChange}
                  placeholder="例: 新入社員、営業部門全体、システム管理者など"
                  className="text-sm placeholder:text-xs sm:placeholder:text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="additional_notes" className="text-sm">
                  その他備考
                </Label>
                <Textarea
                  id="additional_notes"
                  name="additional_notes"
                  value={formData.additional_notes}
                  onChange={handleChange}
                  rows={3}
                  placeholder="その他、要望や参考情報があればご記入ください"
                  className="text-sm placeholder:text-xs sm:placeholder:text-sm"
                />
              </div>
            </fieldset>

            {error && (
              <div role="alert" aria-live="polite" className="text-red-600 text-xs sm:text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                aria-busy={isSubmitting}
                className="text-sm sm:text-base"
              >
                {isSubmitting ? "送信中..." : "リクエストを送信"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/")}
                className="text-sm sm:text-base"
              >
                キャンセル
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
