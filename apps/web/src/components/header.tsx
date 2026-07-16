"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  ChevronDown,
  LogOut,
  Users,
  UserPlus,
  Calendar,
  FileText,
  Briefcase,
  FilePlus,
  Building,
  ClipboardList,
  Menu,
} from "lucide-react";

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
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

export function Header() {
  const t = useTranslations("Common");
  const { user, clearAuth } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const { theme } = useTheme();
  const [loggingOut, setLoggingOut] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

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

  // Grouped menu structure with Icons, Titles, and Descriptions
  const menuCategories = [
    {
      label: "Gestão de Pessoas",
      items: [
        {
          label: "Colaboradores",
          desc: "Base cadastral de funcionários e perfis.",
          href: `/${locale}/employees`,
          icon: <Users className="w-6 h-6 text-primary shrink-0" />,
        },
        {
          label: "Novo Cadastro",
          desc: "Adicionar novos colaboradores ao sistema.",
          href: `/${locale}/employees/new`,
          icon: <UserPlus className="w-6 h-6 text-primary shrink-0" />,
        },
        {
          label: "Férias & Licenças",
          desc: "Controle e aprovação de ausências.",
          href: `/${locale}/absences`,
          icon: <Calendar className="w-6 h-6 text-primary shrink-0" />,
        },
        {
          label: "Documentos",
          desc: "Termos, contratos e comprovantes.",
          href: `/${locale}/documents`,
          icon: <FileText className="w-6 h-6 text-primary shrink-0" />,
        },
      ],
    },
    {
      label: "Recrutamento",
      items: [
        {
          label: "Quadro de Vagas",
          desc: "Processos seletivos e candidatos ativos.",
          href: `/${locale}/recruitment`,
          icon: <Briefcase className="w-6 h-6 text-primary shrink-0" />,
        },
        {
          label: "Nova Vaga",
          desc: "Criar e publicar processos seletivos públicos.",
          href: `/${locale}/recruitment/new`,
          icon: <FilePlus className="w-6 h-6 text-primary shrink-0" />,
        },
      ],
    },
    {
      label: "Organização",
      items: [
        {
          label: "Departamentos & Cargos",
          desc: "Definir hierarquias e faixas salariais.",
          href: `/${locale}/organization`,
          icon: <Building className="w-6 h-6 text-primary shrink-0" />,
        },
        {
          label: "Logs de Auditoria",
          desc: "Monitore o histórico de operações críticas.",
          href: `/${locale}/audit`,
          icon: <ClipboardList className="w-6 h-6 text-primary shrink-0" />,
        },
      ],
    },
  ];

  const logoSrc =
    mounted && theme === "dark" ? "/utils/logo_white_text.svg" : "/utils/logo_black_text.svg";

  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 w-full items-center justify-between px-6 md:px-8">
        {/* Left: Brand Logo & Desktop Nav */}
        <div className="flex items-center gap-8">
          <a href={`/${locale}`} className="flex items-center space-x-2 shrink-0">
            {mounted ? (
              <Image
                src={logoSrc}
                alt="Atlas HRMS Logo"
                width={100}
                height={28}
                className="h-6 w-auto object-contain opacity-90 hover:opacity-100 transition-opacity"
                priority
              />
            ) : (
              <div className="h-6 w-20 bg-muted animate-pulse rounded" />
            )}
          </a>

          {/* Desktop Mega Menus */}
          <nav className="hidden lg:flex items-center space-x-1">
            {menuCategories.map((category) => (
              <div key={category.label} className="relative group py-2">
                <button className="flex items-center space-x-1 px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground rounded-md hover:bg-accent/40 transition-colors focus:outline-none select-none">
                  <span>{category.label}</span>
                  <ChevronDown className="w-3.5 h-3.5 opacity-60 group-hover:rotate-180 transition-transform duration-200" />
                </button>

                {/* Mega Dropdown Panel (2x2 Grid) */}
                <div className="absolute left-0 top-full hidden group-hover:grid grid-cols-2 gap-4 p-4 w-[480px] rounded-2xl bg-popover text-popover-foreground shadow-xl animate-in fade-in-50 slide-in-from-top-1 border-0">
                  {category.items.map((item) => (
                    <a
                      key={item.label}
                      href={item.href}
                      className="flex items-start space-x-3.5 p-3.5 rounded-xl hover:bg-accent hover:text-accent-foreground transition-colors"
                    >
                      <div className="p-2.5 rounded-xl bg-muted/65 text-primary shrink-0 flex items-center justify-center">
                        {item.icon}
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-semibold leading-none">{item.label}</p>
                        <p className="text-xs text-muted-foreground leading-normal line-clamp-2">
                          {item.desc}
                        </p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2 md:gap-4">
          <div className="hidden sm:flex items-center gap-2 md:gap-4">
            {/* Language Switcher */}
            <LanguageSwitcher />

            {/* Theme Toggler */}
            <ThemeSwitcher />
          </div>

          {/* User Profile Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <div
                  role="button"
                  tabIndex={0}
                  className="flex items-center space-x-2.5 px-2.5 py-1.5 rounded-xl hover:bg-accent transition-colors cursor-pointer select-none outline-none focus:outline-none"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm shrink-0 uppercase border-0">
                    {user?.email?.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden md:flex flex-col text-left min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate max-w-[120px]">
                      {user?.email}
                    </p>
                    <span className="inline-block text-[9px] font-bold uppercase tracking-wider text-muted-foreground leading-none">
                      {user?.role}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                </div>
              }
            />
            <DropdownMenuContent className="w-56 border-0 shadow-xl" align="end" side="bottom">
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

          {/* Mobile Menu Toggle via Shadcn/UI Sheet */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger
              render={
                <button
                  type="button"
                  className="flex lg:hidden items-center justify-center w-9 h-9 rounded-xl hover:bg-accent text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
                >
                  <Menu className="w-5 h-5" />
                </button>
              }
            />
            <SheetContent
              side="right"
              className="w-[300px] sm:w-[350px] p-6 flex flex-col justify-between border-0 shadow-xl"
            >
              <div className="space-y-6 overflow-y-auto pr-1">
                <SheetHeader className="p-0">
                  <SheetTitle className="text-left font-bold text-lg uppercase tracking-wider text-primary">
                    ATLAS HRMS
                  </SheetTitle>
                </SheetHeader>

                <div className="space-y-6">
                  {menuCategories.map((category) => (
                    <div key={category.label} className="space-y-2">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        {category.label}
                      </p>
                      <div className="grid grid-cols-1 gap-1">
                        {category.items.map((item) => (
                          <a
                            key={item.label}
                            href={item.href}
                            className="flex items-center space-x-3 p-2.5 rounded-xl hover:bg-accent text-foreground text-sm font-medium transition-colors"
                          >
                            <div className="p-2 rounded-lg bg-muted/65 text-primary shrink-0">
                              {React.cloneElement(item.icon, {
                                className: "w-5 h-5 text-primary shrink-0",
                              })}
                            </div>
                            <span>{item.label}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4 space-y-4">
                <div className="flex justify-between items-center px-2">
                  <LanguageSwitcher />
                  <ThemeSwitcher />
                </div>
                {user && (
                  <div className="flex items-center space-x-3 p-2 bg-muted/30 rounded-xl">
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm shrink-0 uppercase">
                      {user.email.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate">{user.email}</p>
                      <span className="text-[9px] font-bold uppercase text-muted-foreground">
                        {user.role}
                      </span>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
