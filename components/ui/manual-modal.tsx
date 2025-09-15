"use client";

import { Modal } from "@/components/ui/modal";
import { cn } from "@/lib/utils";
import { ExternalLink, FileText, Loader2, X } from "lucide-react";
import { useEffect, useState } from "react";

interface ManualModalProps {
  isOpen: boolean;
  onClose: () => void;
  manual: {
    title: string;
    url: string;
    main_category: string;
    sub_category?: string | null;
    tags?: string[] | null;
    reference_links?: { title: string; url: string }[] | null;
  };
}

export function ManualModal({ isOpen, onClose, manual }: ManualModalProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Reset loading state when modal opens
  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
    }
  }, [isOpen]);

  // Handle swipe to close on mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientY);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isSwipeDown = distance < -100;

    if (isSwipeDown) {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className={cn(
        "flex flex-col",
        // Mobile: Full screen
        "sm:w-[99vw] sm:max-w-[99vw] sm:h-[99vh] sm:max-h-[99vh]",
        // Tablet: Maximize height
        "md:w-[98vw] md:max-w-[98vw] md:h-[99vh] md:max-h-[99vh]",
        // Desktop: Maximize height
        "lg:w-[98vw] lg:max-w-[98vw] lg:h-[99vh] lg:max-h-[99vh]",
        // Mobile fullscreen override with safe area
        "max-sm:fixed max-sm:inset-0 max-sm:w-full max-sm:h-full max-sm:max-w-none max-sm:max-h-none max-sm:rounded-none",
        "max-sm:h-mobile-full" // Use CSS utility for proper height
      )}
    >
      {/* Mobile-optimized header */}
      <div
        className={cn(
          "border-b bg-white",
          "p-2 sm:p-3",
          // Mobile: Fixed header with smaller padding and safe area
          "max-sm:sticky max-sm:top-0 max-sm:z-20 max-sm:shadow-sm",
          "max-sm:safe-area-inset-top"
        )}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Mobile close button - more prominent */}
        <button
          type="button"
          onClick={onClose}
          className={cn(
            "absolute top-3 right-3 z-10 p-2 rounded-full transition-colors",
            "sm:hidden",
            "bg-gray-100 hover:bg-gray-200"
          )}
          aria-label="Close modal"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
        <h2
          className={cn(
            "font-bold text-slate-800 mb-1",
            "text-base sm:text-lg",
            "pr-12 sm:pr-0" // Space for close button on mobile
          )}
        >
          {manual.title}
        </h2>
        <div className="flex flex-col gap-1">
          <span className="text-xs text-slate-600">
            {`${manual.main_category}${manual.sub_category ? ` > ${manual.sub_category}` : ""}`}
          </span>
          {manual.tags && manual.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {manual.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className={cn("flex-1 overflow-hidden relative", "bg-gray-50")}>
        {/* Loading indicator */}
        {isLoading && manual.url !== "#" && (
          <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <p className="text-sm text-gray-600">読み込み中...</p>
            </div>
          </div>
        )}

        {manual.url === "#" ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div className="bg-slate-100 rounded-full p-6 mb-4">
              <FileText className="w-12 h-12 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-700 mb-2">マニュアル準備中</h3>
            <p className="text-slate-600 max-w-md">
              このマニュアルは現在準備中です。
              <br />
              しばらくお待ちください。
            </p>
          </div>
        ) : (
          <iframe
            src={manual.url}
            title={manual.title}
            className="w-full h-full border-0"
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
            onLoad={() => setIsLoading(false)}
            onError={() => setIsLoading(false)}
          />
        )}
      </div>

      {manual.reference_links && manual.reference_links.length > 0 && (
        <div
          className={cn(
            "border-t bg-slate-50",
            "p-2 sm:p-3",
            // Mobile: Make it scrollable if needed
            "max-sm:max-h-[15vh] max-sm:overflow-y-auto"
          )}
        >
          <h3 className="text-xs sm:text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            freee人事労務 参考マニュアル
          </h3>
          <div className="space-y-2">
            {manual.reference_links.map((link, index) => (
              <a
                key={`${link.url}-${index}`}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "flex items-center gap-2 text-blue-600 hover:text-blue-700 hover:bg-white rounded-lg transition-colors",
                  "text-xs sm:text-sm",
                  "p-2 sm:p-2"
                )}
              >
                <ExternalLink className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{link.title}</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </Modal>
  );
}
