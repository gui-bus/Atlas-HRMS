"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { PlusIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

interface PageHeaderProps {
  title: string;
  subTitle?: string;
  buttonText?: string;
  buttonLink?: string;
  onClickButton?: () => void;
}

export function PageHeader({
  title,
  subTitle,
  buttonText,
  buttonLink,
  onClickButton,
}: PageHeaderProps) {
  const router = useRouter();

  const handleButtonClick = () => {
    if (onClickButton) {
      onClickButton();
    } else if (buttonLink) {
      router.push(buttonLink);
    }
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {subTitle && <p className="text-muted-foreground text-sm">{subTitle}</p>}
      </div>
      {buttonText && (buttonLink || onClickButton) && (
        <Button
          onClick={handleButtonClick}
          className="gap-3 h-12 w-full md:max-w-72 cursor-pointer"
        >
          <PlusIcon className="size-6" weight="duotone" />
          {buttonText}
        </Button>
      )}
    </div>
  );
}
