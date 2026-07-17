"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useTheme } from "@/providers/ThemeProvider";
import Link from "next/link";

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

  const iconSrc = mounted && theme === "dark" ? "/utils/icon_white.svg" : "/utils/icon_black.svg";

  return (
    <Link href={`/${locale}`} className="flex items-center space-x-2 shrink-0">
      {mounted ? (
        <div className="flex items-center space-x-6">
          <Image
            src={iconSrc}
            alt="Atlas HRMS Logo"
            width={0}
            height={0}
            sizes="100vw"
            className="h-8 w-auto object-contain opacity-90 hover:opacity-100 transition-opacity"
            priority
          />

          <Image
            src={logoSrc}
            alt="Atlas HRMS Logo"
            width={0}
            height={0}
            sizes="100vw"
            className="h-4 w-auto object-contain opacity-90 hover:opacity-100 transition-opacity"
            priority
          />
        </div>
      ) : (
        <div className="h-6 w-20 bg-muted animate-pulse rounded" />
      )}
    </Link>
  );
}
