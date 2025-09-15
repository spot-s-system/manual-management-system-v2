import { Monitor } from "lucide-react";

interface PcRecommendationNoticeProps {
  className?: string;
}

export function PcRecommendationNotice({ className = "" }: PcRecommendationNoticeProps) {
  return (
    <div
      className={`flex items-center gap-3 rounded-lg bg-blue-50 border border-blue-200 px-4 py-3 text-sm ${className}`}
    >
      <Monitor className="h-5 w-5 text-blue-600 flex-shrink-0" />
      <p className="text-blue-900">
        <span className="font-semibold">PC推奨：</span>
        この操作ガイドは、最適な閲覧環境のため、パソコンでのご利用をお勧めします。
      </p>
    </div>
  );
}
