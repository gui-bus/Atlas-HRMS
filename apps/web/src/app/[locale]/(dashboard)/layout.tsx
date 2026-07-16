"use client";

import React from "react";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <div className="flex w-full max-w-[110rem] mx-auto relative bg-background text-foreground">
        {/* App Sidebar from Shadcn */}
        <AppSidebar />

        {/* Main content pane */}
        <SidebarInset className="flex flex-col flex-1 w-full">
          <header className="flex h-14 items-center gap-4 border-b px-6">
            <SidebarTrigger />
            <div className="flex-1">
              <span className="font-semibold text-sm">Dashboard</span>
            </div>
          </header>

          <div className="flex-1">{children}</div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
