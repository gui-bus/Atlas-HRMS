"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { CircleNotchIcon, PlusIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

interface FormActionsProps {
  cancelText: string;
  submitText: string;
  isSubmitting?: boolean;
  onCancel?: () => void;
}

export function FormActions({ cancelText, submitText, isSubmitting, onCancel }: FormActionsProps) {
  const router = useRouter();

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      router.back();
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <Button
        type="button"
        variant="outline"
        onClick={handleCancel}
        className="border-0 bg-muted/40 hover:bg-muted/65 transition-colors w-full h-12 cursor-pointer"
      >
        {cancelText}
      </Button>
      <Button type="submit" disabled={isSubmitting} className="gap-3 w-full h-12 cursor-pointer">
        {isSubmitting ? (
          <CircleNotchIcon className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <PlusIcon className="size-6" weight="duotone" />
        )}
        {submitText}
      </Button>
    </div>
  );
}
