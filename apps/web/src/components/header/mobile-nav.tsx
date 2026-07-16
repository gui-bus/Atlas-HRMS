"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  List,
  SignOut,
  Users,
  UserPlus,
  Calendar,
  FileText,
  Briefcase,
  FilePlus,
  Buildings,
  ClipboardText,
  Clock,
  TextOutdentIcon,
} from "@phosphor-icons/react";

import { useAuthStore } from "@/store/useAuthStore";
import { api } from "@/lib/api";
import { LanguageSwitcher } from "../LanguageSwitcher";
import { ThemeSwitcher } from "../ThemeSwitcher";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

interface MobileNavProps {
  locale: string;
}

export function MobileNav({ locale }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { user, clearAuth } = useAuthStore();
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await api.post("/auth/logout");
    } catch (err) {
      console.error("Erro durante o logout", err);
    } finally {
      clearAuth();
      setLoggingOut(false);
    }
  };

  const userRole = user?.role || "EMPLOYEE";

  const allCategories = [
    {
      label: "Gestão de Pessoas",
      items: [
        {
          label: "Colaboradores",
          href: `/${locale}/employees`,
          icon: <Users className="w-5 h-5 text-primary shrink-0" />,
          allowedRoles: ["ADMIN", "HR", "MANAGER"],
        },
        {
          label: "Novo Cadastro",
          href: `/${locale}/employees/new`,
          icon: <UserPlus className="w-5 h-5 text-primary shrink-0" />,
          allowedRoles: ["ADMIN", "HR"],
        },
        {
          label: "Férias",
          href: `/${locale}/absences/vacations`,
          icon: <Calendar className="w-5 h-5 text-primary shrink-0" />,
          allowedRoles: ["ADMIN", "HR", "MANAGER"],
        },
        {
          label: "Minhas Férias",
          href: `/${locale}/absences/vacations/my-requests`,
          icon: <Calendar className="w-5 h-5 text-primary shrink-0" />,
          allowedRoles: ["EMPLOYEE"],
        },
        {
          label: "Atestados & Licenças",
          href: `/${locale}/absences/leaves`,
          icon: <Calendar className="w-5 h-5 text-primary shrink-0" />,
          allowedRoles: ["ADMIN", "HR", "MANAGER"],
        },
        {
          label: "Meus Atestados",
          href: `/${locale}/absences/leaves/my-requests`,
          icon: <Calendar className="w-5 h-5 text-primary shrink-0" />,
          allowedRoles: ["EMPLOYEE"],
        },
        {
          label: "Documentos",
          href: `/${locale}/documents`,
          icon: <FileText className="w-5 h-5 text-primary shrink-0" />,
          allowedRoles: ["ADMIN", "HR", "MANAGER", "EMPLOYEE"],
        },
        {
          label: "Meu Ponto",
          href: `/${locale}/time-attendance/my-history`,
          icon: <Clock className="w-5 h-5 text-primary shrink-0" />,
          allowedRoles: ["EMPLOYEE"],
        },
      ],
    },
    {
      label: "Recrutamento",
      items: [
        {
          label: "Quadro de Vagas",
          href: `/${locale}/recruitment`,
          icon: <Briefcase className="w-5 h-5 text-primary shrink-0" />,
          allowedRoles: ["ADMIN", "HR", "MANAGER"],
        },
        {
          label: "Nova Vaga",
          href: `/${locale}/recruitment/new`,
          icon: <FilePlus className="w-5 h-5 text-primary shrink-0" />,
          allowedRoles: ["ADMIN", "HR"],
        },
      ],
    },
    {
      label: "Organização",
      items: [
        {
          label: "Departamentos",
          href: `/${locale}/organization/departments`,
          icon: <Buildings className="w-5 h-5 text-primary shrink-0" />,
          allowedRoles: ["ADMIN", "HR", "MANAGER"],
        },
        {
          label: "Cargos",
          href: `/${locale}/organization/positions`,
          icon: <Buildings className="w-5 h-5 text-primary shrink-0" />,
          allowedRoles: ["ADMIN", "HR", "MANAGER"],
        },
        {
          label: "Logs de Auditoria",
          href: `/${locale}/audit`,
          icon: <ClipboardText className="w-5 h-5 text-primary shrink-0" />,
          allowedRoles: ["ADMIN", "HR"],
        },
        {
          label: "Contas de Usuário",
          href: `/${locale}/organization/users`,
          icon: <Users className="w-5 h-5 text-primary shrink-0" />,
          allowedRoles: ["ADMIN", "HR"],
        },
        {
          label: "Ajustes de Ponto",
          href: `/${locale}/time-attendance/admin/corrections`,
          icon: <Clock className="w-5 h-5 text-primary shrink-0" />,
          allowedRoles: ["ADMIN", "HR", "MANAGER"],
        },
      ],
    },
  ];

  const menuCategories = allCategories
    .map((category) => ({
      ...category,
      items: category.items.filter((item) => item.allowedRoles.includes(userRole)),
    }))
    .filter((category) => category.items.length > 0);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <button
            type="button"
            className="flex lg:hidden items-center justify-center w-9 h-9 rounded-xl hover:bg-accent text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
          >
            <TextOutdentIcon className="w-5 h-5" />
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
            {menuCategories.map((category) => {
              if (category.items.length === 1) {
                const singleItem = category.items[0];
                return (
                  <div key={category.label} className="space-y-2">
                    <a
                      href={singleItem.href}
                      className="flex items-center space-x-3 p-2.5 rounded-xl hover:bg-accent text-foreground text-sm font-medium transition-colors animate-fade-in"
                    >
                      <div className="p-2 rounded-lg bg-muted/65 text-primary shrink-0">
                        {singleItem.icon}
                      </div>
                      <span>{singleItem.label}</span>
                    </a>
                  </div>
                );
              }

              return (
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
                          {item.icon}
                        </div>
                        <span>{item.label}</span>
                      </a>
                    ))}
                  </div>
                </div>
              );
            })}
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
                disabled={loggingOut}
                className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
              >
                <SignOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
