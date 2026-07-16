"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Logo } from "./header/logo";
import { DesktopNav } from "./header/desktop-nav";
import { UserDropdown } from "./header/user-dropdown";
import { NotificationDropdown } from "./header/notification-dropdown";
import { MobileNav } from "./header/mobile-nav";

export function Header() {
  const pathname = usePathname();
  const segments = pathname.split("/");
  const locale = segments[1] || "pt";

  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 w-full items-center justify-between px-6 md:px-8">
        {/* Left branding logo & desktop menus */}
        <div className="flex items-center gap-8">
          <Logo locale={locale} />
          <DesktopNav locale={locale} />
        </div>

        {/* Right side widgets */}
        <div className="flex items-center gap-2 md:gap-4">
          <NotificationDropdown locale={locale} />
          <UserDropdown locale={locale} />
          <MobileNav locale={locale} />
        </div>
      </div>
    </header>
  );
}
