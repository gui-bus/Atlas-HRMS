"use client";

import React, { useEffect, useState } from "react";
import { Sun, Moon } from "@phosphor-icons/react";
import { useTheme } from "@/providers/ThemeProvider";
import { Button } from "@/components/ui/button";

export function ThemeSwitcher() {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-10 h-10" />;
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="w-10 h-10 rounded-lg hover:bg-accent focus:ring-0 text-muted-foreground hover:text-foreground transition-colors"
      aria-label="Alterar tema"
    >
      {theme === "dark" ? <Sun className="w-[1.2rem] h-[1.2rem]" /> : <Moon className="w-[1.2rem] h-[1.2rem]" />}
    </Button>
  );
}
