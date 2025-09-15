"use client";

import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

export function Modal({ isOpen, onClose, children, className }: ModalProps) {
  const [mounted, setMounted] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      previousActiveElement.current = document.activeElement as HTMLElement;

      // Focus trap - focus first focusable element in modal
      if (modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length > 0) {
          (focusableElements[0] as HTMLElement).focus();
        }
      }
    } else {
      document.body.style.overflow = "unset";

      // Restore focus to previous element
      if (previousActiveElement.current?.focus) {
        previousActiveElement.current.focus();
      }
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    const handleTab = (e: KeyboardEvent) => {
      if (e.key === "Tab" && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
      document.addEventListener("keydown", handleTab);
    }

    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.removeEventListener("keydown", handleTab);
    };
  }, [isOpen, onClose]);

  if (!mounted || !isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-1 sm:p-2"
      aria-modal="true"
    >
      <button
        type="button"
        className={cn(
          "fixed inset-0 bg-black/50 backdrop-blur-sm",
          "max-sm:bg-black/70" // Darker overlay on mobile for better contrast
        )}
        onClick={onClose}
        aria-label="Close modal overlay"
      />
      <div
        ref={modalRef}
        className={cn(
          "relative z-50 w-full h-full bg-white rounded-lg shadow-lg overflow-hidden focus-trap",
          className
        )}
      >
        {/* Desktop close button - hidden on mobile as ManualModal handles it */}
        <button
          type="button"
          onClick={onClose}
          className={cn(
            "absolute top-4 right-4 z-10 p-2 bg-white/90 hover:bg-white rounded-full shadow-md transition-colors",
            "max-sm:hidden" // Hidden on mobile
          )}
          aria-label="Close modal"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
        {children}
      </div>
    </div>
  );
}

interface ManualModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  title: string;
}

export function ManualModal({ isOpen, onClose, url, title }: ManualModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} className="flex flex-col">
      <div className="p-4 border-b bg-gray-50">
        <h2 className="text-lg font-semibold">{title}</h2>
      </div>
      <div className="flex-1 overflow-hidden">
        <iframe
          src={url}
          title={title}
          className="w-full h-full border-0"
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
        />
      </div>
    </Modal>
  );
}
