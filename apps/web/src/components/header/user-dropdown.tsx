"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { SignOut, User, Gear, Shield } from "@phosphor-icons/react";

import { useAuthStore } from "@/store/useAuthStore";
import { api } from "@/lib/api";
import { LanguageSwitcher } from "../LanguageSwitcher";
import { ThemeSwitcher } from "../ThemeSwitcher";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface UserDropdownProps {
  locale: string;
}

export function UserDropdown({ locale }: UserDropdownProps) {
  const { user, clearAuth } = useAuthStore();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

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

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case "ADMIN":
        return "Administrador";
      case "HR":
        return "Recursos Humanos";
      case "MANAGER":
        return "Gestor";
      case "EMPLOYEE":
      default:
        return "Colaborador";
    }
  };

  return (
    <div className="flex items-center gap-3">
      {/* Utilities Switchers */}
      <div className="hidden sm:flex items-center gap-1">
        <LanguageSwitcher />
        <ThemeSwitcher />
      </div>

      {/* User Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <div
              role="button"
              tabIndex={0}
              className="relative flex items-center justify-center h-9 w-9 rounded-full bg-primary/10 text-primary hover:bg-primary/15 active:scale-95 transition-all cursor-pointer select-none outline-none focus:outline-none"
            >
              <span className="font-bold text-sm tracking-wide uppercase">
                {user?.email?.charAt(0).toUpperCase()}
              </span>
              {/* Active dot indicator */}
              <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-background" />
            </div>
          }
        />
        <DropdownMenuContent
          className="w-64 p-2 border-0 shadow-2xl rounded-2xl bg-popover text-popover-foreground animate-in fade-in-50 slide-in-from-top-2"
          align="end"
          side="bottom"
        >
          {/* Premium User Profile Header Card */}
          <div className="flex flex-col items-center text-center p-4 bg-muted/40 rounded-xl mb-1.5">
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg uppercase mb-2">
              {user?.email?.charAt(0).toUpperCase()}
            </div>
            <p
              className="text-sm font-semibold text-foreground truncate w-full max-w-[200px]"
              title={user?.email}
            >
              {user?.email}
            </p>
            <div className="mt-1.5">
              <Badge
                variant="success"
                className="px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase"
              >
                {getRoleLabel(user?.role)}
              </Badge>
            </div>
          </div>

          <DropdownMenuSeparator className="my-1" />

          {/* Navigation/Actions Group */}
          <DropdownMenuGroup>
            <DropdownMenuItem
              render={<a href={`/${locale}/profile`} />}
              className="flex items-center space-x-2.5 p-2.5 rounded-xl hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer border-0"
            >
              <User className="w-4 h-4 text-muted-foreground shrink-0" />
              <span className="text-sm font-medium">Meu Perfil</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              render={<a href={`/${locale}/settings`} />}
              className="flex items-center space-x-2.5 p-2.5 rounded-xl hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer border-0"
            >
              <Gear className="w-4 h-4 text-muted-foreground shrink-0" />
              <span className="text-sm font-medium">Configurações</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator className="my-1" />

          {/* Logout Trigger */}
          <DropdownMenuItem
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex items-center space-x-2.5 p-2.5 rounded-xl hover:bg-destructive/10 text-destructive focus:bg-destructive/15 focus:text-destructive transition-colors cursor-pointer border-0"
          >
            <SignOut className="w-4 h-4 shrink-0" />
            <span className="text-sm font-semibold">Sair da Conta</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
