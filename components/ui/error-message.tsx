import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

interface ErrorMessageProps {
  title?: string;
  message?: string;
  retry?: () => void;
}

export function ErrorMessage({
  title = "エラーが発生しました",
  message = "データの取得中にエラーが発生しました。時間をおいて再度お試しください。",
  retry,
}: ErrorMessageProps) {
  return (
    <Card className="border-destructive" role="alert" aria-live="assertive">
      <CardContent className="flex items-center space-x-4 pt-6">
        <AlertCircle className="h-8 w-8 text-destructive" aria-hidden="true" />
        <div className="flex-1 space-y-1">
          <p className="text-sm font-medium leading-none">{title}</p>
          <p className="text-sm text-muted-foreground">{message}</p>
        </div>
        {retry && (
          <button
            type="button"
            onClick={retry}
            className="rounded-md bg-primary px-3 py-1 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            aria-label="エラーを再試行"
          >
            再試行
          </button>
        )}
      </CardContent>
    </Card>
  );
}
