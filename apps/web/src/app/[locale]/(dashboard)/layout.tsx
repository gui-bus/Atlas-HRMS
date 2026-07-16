"use client";

import React from "react";
import { Header } from "@/components/header";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col w-full">
      <Header />
      <main className="flex-1 w-full">{children}</main>
    </div>
  );
}
