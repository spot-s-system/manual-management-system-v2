import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ErrorMessage } from "@/components/ui/error-message";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

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

const urgencyLabels = {
  low: { label: "低", className: "text-blue-600 bg-blue-50" },
  medium: { label: "中", className: "text-yellow-600 bg-yellow-50" },
  high: { label: "高", className: "text-red-600 bg-red-50" },
};

const statusLabels = {
  pending: { label: "未対応", className: "text-gray-600 bg-gray-50" },
  in_progress: { label: "対応中", className: "text-blue-600 bg-blue-50" },
  completed: { label: "完了", className: "text-green-600 bg-green-50" },
  rejected: { label: "却下", className: "text-red-600 bg-red-50" },
};

export default async function AdminRequestsPage() {
  try {
    const supabase = await createClient();

    const { data: requests, error } = await supabase
      .from("manual_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to fetch requests:", error);
      return (
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">操作ガイドリクエスト一覧</h1>
          </div>
          <ErrorMessage title="リクエストの取得に失敗しました" message={error.message} />
        </div>
      );
    }

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">操作ガイドリクエスト一覧</h1>
        </div>

        {!requests || requests.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-500">リクエストはまだありません。</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {requests.map((request: ManualRequest) => (
              <Card key={request.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">{request.manual_title}</CardTitle>
                      <CardDescription className="mt-2">
                        <span className="text-sm">
                          リクエスト者: {request.requester_name} ({request.requester_email})
                          {request.department && ` - ${request.department}`}
                        </span>
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          urgencyLabels[request.urgency].className
                        }`}
                      >
                        緊急度: {urgencyLabels[request.urgency].label}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          statusLabels[request.status].className
                        }`}
                      >
                        {statusLabels[request.status].label}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-1">説明</h4>
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {request.manual_description}
                      </p>
                    </div>

                    {request.use_case && (
                      <div>
                        <h4 className="font-semibold mb-1">使用目的</h4>
                        <p className="text-gray-700">{request.use_case}</p>
                      </div>
                    )}

                    {request.expected_users && (
                      <div>
                        <h4 className="font-semibold mb-1">想定利用者</h4>
                        <p className="text-gray-700">{request.expected_users}</p>
                      </div>
                    )}

                    {request.additional_notes && (
                      <div>
                        <h4 className="font-semibold mb-1">備考</h4>
                        <p className="text-gray-700">{request.additional_notes}</p>
                      </div>
                    )}

                    {request.admin_notes && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-semibold mb-1">管理者メモ</h4>
                        <p className="text-gray-700">{request.admin_notes}</p>
                      </div>
                    )}

                    <div className="flex justify-between items-center pt-4 border-t">
                      <span className="text-sm text-gray-500">
                        リクエスト日: {new Date(request.created_at).toLocaleDateString("ja-JP")}
                      </span>
                      <Link href={`/admin/requests/${request.id}/edit`}>
                        <Button size="sm">詳細・編集</Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error("Unexpected error in AdminRequestsPage:", error);
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">マニュアルリクエスト一覧</h1>
        <ErrorMessage
          title="予期しないエラーが発生しました"
          message="ページの読み込み中にエラーが発生しました。"
        />
      </div>
    );
  }
}
