"use client";

import { useState } from "react";
import { ManualCard } from "./manual-card";
import { ManualModal } from "./ui/modal";

type ManualCardWithModalProps = {
  manual: {
    id: string;
    title: string;
    url: string;
    main_category: string;
    sub_category?: string | null;
    tags?: string[] | null;
  };
};

export function ManualCardWithModal({ manual }: ManualCardWithModalProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="cursor-pointer text-left w-full"
        onClick={() => setIsModalOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setIsModalOpen(true);
          }
        }}
      >
        <ManualCard manual={manual} />
      </button>
      <ManualModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        url={manual.url}
        title={manual.title}
      />
    </>
  );
}
