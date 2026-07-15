"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const languages = [
  { code: "pt", name: "Português", icon: "/idiomas/pt.webp" },
  { code: "en", name: "English", icon: "/idiomas/en.webp" },
  { code: "es", name: "Español", icon: "/idiomas/es.webp" },
];

export function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();

  const segments = pathname.split("/");
  const currentLocale = segments[1] || "pt";

  const handleLanguageChange = (localeCode: string) => {
    const updatedSegments = [...segments];
    updatedSegments[1] = localeCode;
    router.push(updatedSegments.join("/"));
  };

  const activeLang = languages.find((l) => l.code === currentLocale) || languages[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={
        <div className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-accent focus:ring-0 cursor-pointer select-none">
          <Image
            src={activeLang.icon}
            alt={activeLang.name}
            width={20}
            height={20}
            className="rounded-sm object-cover"
          />
          <span className="text-sm font-medium text-muted-foreground uppercase">{activeLang.code}</span>
        </div>
      } />
      <DropdownMenuContent align="end" className="w-36 bg-popover border border-border rounded-lg shadow-lg">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className="flex items-center space-x-3 px-3 py-2 cursor-pointer hover:bg-accent rounded-md transition-colors"
          >
            <Image
              src={lang.icon}
              alt={lang.name}
              width={20}
              height={20}
              className="rounded-sm object-cover"
            />
            <span className="text-sm font-medium text-foreground">{lang.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
