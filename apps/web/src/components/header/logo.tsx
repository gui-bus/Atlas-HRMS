"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useTheme } from "@/providers/ThemeProvider";

interface LogoProps {
  locale: string;
}

export function Logo({ locale }: LogoProps) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const logoSrc =
    mounted && theme === "dark" ? "/utils/logo_white_text.svg" : "/utils/logo_black_text.svg";

  return (
    <a href={`/${locale}`} className="flex items-center space-x-2 shrink-0">
      {mounted ? (
        <Image
          src={logoSrc}
          alt="Atlas HRMS Logo"
          width={0}
          height={0}
          sizes="100vw"
          className="h-4 w-auto object-contain opacity-90 hover:opacity-100 transition-opacity"
          priority
        />
      ) : (
        <div className="h-6 w-20 bg-muted animate-pulse rounded" />
      )}
    </a>
  );
}
