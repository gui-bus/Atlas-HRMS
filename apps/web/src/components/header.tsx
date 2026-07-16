"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  ChevronDown,
  LogOut,
  Users,
  Building,
  Calendar,
  FileText,
  Briefcase,
  ClipboardList,
} from "lucide-react";
import { Sun, Moon } from "@phosphor-icons/react";

import { useAuthStore } from "@/store/useAuthStore";
import { api } from "@/lib/api";
import { useTheme } from "@/providers/ThemeProvider";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ThemeSwitcher } from "./ThemeSwitcher";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";

export function Header() {
  const t = useTranslations("Common");
  const { user, clearAuth } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const { theme } = useTheme();
  const [loggingOut, setLoggingOut] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  // Menu Categories with Dropdowns
  const menuItems = [
    {
      label: t("employees"),
      icon: <Users className="w-4 h-4" />,
      items: [
        { label: "Listar Colaboradores", href: `/${locale}/employees` },
        { label: "Novo Cadastro", href: `/${locale}/employees/new` },
      ],
    },
    {
      label: t("departments"),
      icon: <Building className="w-4 h-4" />,
      items: [{ label: "Departamentos & Cargos", href: `/${locale}/organization` }],
    },
    {
      label: t("vacations"),
      icon: <Calendar className="w-4 h-4" />,
      items: [
        { label: "Férias & Licenças", href: `/${locale}/absences` },
        { label: "Minhas Solicitações", href: `/${locale}/absences/my-requests` },
      ],
    },
    {
      label: "Documentos",
      icon: <FileText className="w-4 h-4" />,
      items: [{ label: "Repositório Geral", href: `/${locale}/documents` }],
    },
    {
      label: t("recruitment"),
      icon: <Briefcase className="w-4 h-4" />,
      items: [
        { label: "Vagas Abertas", href: `/${locale}/recruitment` },
        { label: "Nova Vaga", href: `/${locale}/recruitment/new` },
      ],
    },
    {
      label: "Auditoria",
      icon: <ClipboardList className="w-4 h-4" />,
      items: [{ label: "Logs do Sistema", href: `/${locale}/audit` }],
    },
  ];

  const logoSrc =
    mounted && theme === "dark" ? "/utils/logo_white_text.svg" : "/utils/logo_black_text.svg";

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 w-full items-center justify-between px-6">
        {/* Left: Branding/Logo */}
        <div className="flex items-center gap-6">
          <a href={`/${locale}`} className="flex items-center space-x-2 shrink-0">
            {mounted ? (
              <Image
                src={logoSrc}
                alt="Atlas HRMS Logo"
                width={120}
                height={35}
                className="h-8 w-auto object-contain"
                priority
              />
            ) : (
              <div className="h-8 w-24 bg-muted animate-pulse rounded" />
            )}
          </a>

          {/* Middle: Hover Navigation Menus */}
          <nav className="hidden lg:flex items-center space-x-1">
            {menuItems.map((category) => (
              <div key={category.label} className="relative group py-2">
                <button className="flex items-center space-x-1.5 px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground rounded-md hover:bg-accent/50 transition-colors focus:outline-none">
                  {category.icon}
                  <span>{category.label}</span>
                  <ChevronDown className="w-3.5 h-3.5 opacity-60 group-hover:rotate-180 transition-transform duration-200" />
                </button>

                {/* Dropdown panel */}
                <div className="absolute left-0 top-full hidden group-hover:block w-52 rounded-lg border bg-popover p-1.5 text-popover-foreground shadow-md animate-in fade-in-50 slide-in-from-top-1">
                  {category.items.map((item) => (
                    <a
                      key={item.label}
                      href={item.href}
                      className="block px-3 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground transition-colors font-normal"
                    >
                      {item.label}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-4">
          {/* Language Switcher */}
          <LanguageSwitcher />

          {/* Theme Toggler */}
          <ThemeSwitcher />

          {/* User Profile Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <div className="flex items-center space-x-3 px-2 py-1.5 rounded-lg hover:bg-accent transition-colors cursor-pointer select-none border">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm shrink-0 uppercase border border-primary/20">
                    {user?.email?.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden md:flex flex-col text-left min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate max-w-[120px]">
                      {user?.email}
                    </p>
                    <span className="inline-block text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                      {user?.role}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                </div>
              }
            />
            <DropdownMenuContent className="w-56" align="end" side="bottom">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none truncate">{user?.email}</p>
                  <p className="text-xs leading-none text-muted-foreground uppercase">
                    Função: {user?.role}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                disabled={loggingOut}
                className="cursor-pointer text-destructive focus:text-destructive"
              >
                <LogOut className="w-4 h-4 mr-2" />
                <span>{loggingOut ? "Saindo..." : "Sair"}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
