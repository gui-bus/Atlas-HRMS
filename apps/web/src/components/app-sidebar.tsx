"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { LayoutDashboard, Users } from "lucide-react";
import { Sun, Moon, SignOut, CaretUpDown } from "@phosphor-icons/react";
import { useAuthStore } from "@/store/useAuthStore";
import { api } from "@/lib/api";
import { useTheme } from "@/providers/ThemeProvider";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";

export function AppSidebar() {
  const t = useTranslations("Common");
  const { user, clearAuth } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [loggingOut, setLoggingOut] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const segments = pathname.split("/");
  const locale = segments[1] || "pt";

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await api.post("/auth/logout");
    } catch (err) {
      console.error("Erro durante o logout", err);
    } finally {
      clearAuth();
      router.push(`/${locale}/login`);
      setLoggingOut(false);
    }
  };

  return (
    <Sidebar variant="inset" collapsible="offcanvas">
      {/* Sidebar Header: Branding */}
      <SidebarHeader className="border-b border-sidebar-border/50 py-4 px-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-base">
            A
          </div>
          <span className="font-bold text-base tracking-wider uppercase text-sidebar-foreground">
            ATLAS
          </span>
        </div>
      </SidebarHeader>

      {/* Sidebar Content: Navigation Menus */}
      <SidebarContent className="px-3 py-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              render={<a href={`/${locale}`} />}
              isActive={pathname === `/${locale}`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span className="font-medium text-sm">{t("dashboard")}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton
              render={<a href={`/${locale}/employees`} />}
              isActive={pathname.startsWith(`/${locale}/employees`)}
            >
              <Users className="w-4 h-4" />
              <span className="font-medium text-sm">{t("employees")}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>

      {/* Sidebar Footer: User Dropdown Menu */}
      <SidebarFooter className="border-t border-sidebar-border/50 p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <div className="w-full h-12 flex items-center justify-between px-2 hover:bg-sidebar-accent transition-colors">
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-sidebar-accent flex items-center justify-center font-semibold text-sidebar-accent-foreground text-sm border border-sidebar-border shrink-0">
                        {user?.email?.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <p className="text-xs font-semibold text-sidebar-foreground truncate">
                          {user?.email}
                        </p>
                        <span className="inline-block text-[9px] font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 uppercase tracking-wider mt-0.5">
                          {user?.role}
                        </span>
                      </div>
                    </div>
                    <CaretUpDown className="w-4 h-4 text-muted-foreground shrink-0 ml-2" />
                  </div>
                }
              />
              <DropdownMenuContent className="w-56" align="end" side="top">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user?.email}</p>
                      <p className="text-xs leading-none text-muted-foreground uppercase">
                        Cargo: {user?.role}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={toggleTheme} className="cursor-pointer">
                  {theme === "dark" ? (
                    <>
                      <Sun className="w-4 h-4 mr-2" />
                      <span>Modo Claro</span>
                    </>
                  ) : (
                    <>
                      <Moon className="w-4 h-4 mr-2" />
                      <span>Modo Escuro</span>
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <SignOut className="w-4 h-4 mr-2" />
                  <span>{loggingOut ? "Saindo..." : "Sair"}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
