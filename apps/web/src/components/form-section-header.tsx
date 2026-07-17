"use client";

import React from "react";

interface FormSectionHeaderProps {
  title: string;
  description?: string;
  icon: React.ComponentType<any>;
}

export function FormSectionHeader({
  title,
  description,
  icon: IconComponent,
}: FormSectionHeaderProps) {
  return (
    <div className="flex items-start space-x-3.5 pt-4 pb-2">
      <div className="p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-900 shrink-0 flex items-center justify-center">
        <IconComponent className="w-5 h-5" weight="duotone" />
      </div>
      <div className="space-y-0.5">
        <h4 className="text-sm font-bold tracking-tight text-foreground uppercase">{title}</h4>
        {description && (
          <p className="text-xs text-muted-foreground leading-normal">{description}</p>
        )}
      </div>
    </div>
  );
}
