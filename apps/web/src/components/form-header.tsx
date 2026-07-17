import React from "react";

interface FormHeaderProps {
  title: string;
  subTitle?: string;
  requiredNotice?: string | boolean;
}

export function FormHeader({ title, subTitle, requiredNotice }: FormHeaderProps) {
  const noticeText =
    typeof requiredNotice === "string"
      ? requiredNotice
      : requiredNotice === true
        ? "* Os campos marcados com * são obrigatórios"
        : null;

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight uppercase">{title}</h1>
      {subTitle && <p className="text-muted-foreground text-sm">{subTitle}</p>}
      {noticeText && <p className="text-xs text-destructive/80 mt-1.5">{noticeText}</p>}
    </div>
  );
}
