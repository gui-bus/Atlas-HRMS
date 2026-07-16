"use client";

import React, { useState, useRef } from "react";
import {
  ChevronDown,
  Users,
  UserPlus,
  Calendar,
  FileText,
  Briefcase,
  FilePlus,
  Building,
  ClipboardList,
} from "lucide-react";

import { useAuthStore } from "@/store/useAuthStore";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface MenuItem {
  label: string;
  desc: string;
  href: string;
  icon: React.ReactNode;
  allowedRoles: string[];
}

interface MenuCategory {
  label: string;
  items: MenuItem[];
}

interface DesktopNavProps {
  locale: string;
}

export function DesktopNav({ locale }: DesktopNavProps) {
  const { user } = useAuthStore();
  const userRole = user?.role || "EMPLOYEE";
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = (categoryLabel: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setOpenCategory(categoryLabel);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setOpenCategory(null);
    }, 150); // Grace period to bridge any gap between trigger and content portal
  };

  const allCategories: MenuCategory[] = [
    {
      label: "Gestão de Pessoas",
      items: [
        {
          label: "Colaboradores",
          desc: "Base cadastral de funcionários e perfis.",
          href: `/${locale}/employees`,
          icon: <Users className="w-8 h-8 text-primary shrink-0" />,
          allowedRoles: ["ADMIN", "HR", "MANAGER"],
        },
        {
          label: "Novo Cadastro",
          desc: "Adicionar novos colaboradores ao sistema.",
          href: `/${locale}/employees/new`,
          icon: <UserPlus className="w-8 h-8 text-primary shrink-0" />,
          allowedRoles: ["ADMIN", "HR"],
        },
        {
          label: "Férias",
          desc: "Controle e aprovação de ausências de férias.",
          href: `/${locale}/absences/vacations`,
          icon: <Calendar className="w-8 h-8 text-primary shrink-0" />,
          allowedRoles: ["ADMIN", "HR", "MANAGER"],
        },
        {
          label: "Atestados & Licenças",
          desc: "Controle de licenças e afastamentos.",
          href: `/${locale}/absences/leaves`,
          icon: <Calendar className="w-8 h-8 text-primary shrink-0" />,
          allowedRoles: ["ADMIN", "HR", "MANAGER"],
        },
        {
          label: "Documentos",
          desc: "Termos, contratos e comprovantes.",
          href: `/${locale}/documents`,
          icon: <FileText className="w-8 h-8 text-primary shrink-0" />,
          allowedRoles: ["ADMIN", "HR", "MANAGER"],
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
          icon: <Briefcase className="w-8 h-8 text-primary shrink-0" />,
          allowedRoles: ["ADMIN", "HR", "MANAGER"],
        },
        {
          label: "Nova Vaga",
          desc: "Criar e publicar processos seletivos públicos.",
          href: `/${locale}/recruitment/new`,
          icon: <FilePlus className="w-8 h-8 text-primary shrink-0" />,
          allowedRoles: ["ADMIN", "HR"],
        },
      ],
    },
    {
      label: "Organização",
      items: [
        {
          label: "Departamentos",
          desc: "Listar e gerenciar departamentos da empresa.",
          href: `/${locale}/organization/departments`,
          icon: <Building className="w-8 h-8 text-primary shrink-0" />,
          allowedRoles: ["ADMIN", "HR", "MANAGER"],
        },
        {
          label: "Cargos",
          desc: "Definir cargos e faixas salariais.",
          href: `/${locale}/organization/positions`,
          icon: <Building className="w-8 h-8 text-primary shrink-0" />,
          allowedRoles: ["ADMIN", "HR", "MANAGER"],
        },
        {
          label: "Logs de Auditoria",
          desc: "Monitore o histórico de operações críticas.",
          href: `/${locale}/audit`,
          icon: <ClipboardList className="w-8 h-8 text-primary shrink-0" />,
          allowedRoles: ["ADMIN", "HR"],
        },
        {
          label: "Contas de Usuário",
          desc: "Níveis de acesso e credenciais do sistema.",
          href: `/${locale}/organization/users`,
          icon: <Users className="w-8 h-8 text-primary shrink-0" />,
          allowedRoles: ["ADMIN", "HR"],
        },
      ],
    },
  ];

  // Filter categories to only keep allowed items
  const menuCategories = allCategories
    .map((category) => ({
      ...category,
      items: category.items.filter((item) => item.allowedRoles.includes(userRole)),
    }))
    .filter((category) => category.items.length > 0);

  return (
    <nav className="hidden lg:flex items-center space-x-1">
      {menuCategories.map((category) => {
        // If only 1 item inside the category is available for this role,
        // render a direct link instead of a dropdown/mega-menu
        if (category.items.length === 1) {
          const singleItem = category.items[0];
          return (
            <a
              key={category.label}
              href={singleItem.href}
              className="flex items-center space-x-1 px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground rounded-md hover:bg-accent/40 transition-colors focus:outline-none select-none cursor-pointer"
            >
              <span>{singleItem.label}</span>
            </a>
          );
        }

        return (
          <div
            key={category.label}
            onMouseEnter={() => handleMouseEnter(category.label)}
            onMouseLeave={handleMouseLeave}
            className="relative"
          >
            <DropdownMenu
              open={openCategory === category.label}
              onOpenChange={(isOpen) => {
                if (!isOpen) setOpenCategory(null);
              }}
            >
              <DropdownMenuTrigger
                render={
                  <div
                    role="button"
                    tabIndex={0}
                    className="flex items-center space-x-1 px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground rounded-md hover:bg-accent/40 transition-colors focus:outline-none select-none cursor-pointer"
                  >
                    <span>{category.label}</span>
                    <ChevronDown className="w-3.5 h-3.5 opacity-60 transition-transform duration-200" />
                  </div>
                }
              />
              <DropdownMenuContent
                className="p-5 w-[650px] grid grid-cols-2 gap-5 border-0 shadow-2xl bg-background/95 backdrop-blur-md rounded-2xl"
                align="start"
                side="bottom"
                onMouseEnter={() => handleMouseEnter(category.label)}
                onMouseLeave={handleMouseLeave}
              >
                <DropdownMenuGroup className="grid grid-cols-2 gap-5 col-span-2">
                  {category.items.map((item) => (
                    <DropdownMenuItem
                      key={item.label}
                      render={<a href={item.href} />}
                      className="flex items-start space-x-4 p-4 rounded-2xl hover:bg-accent/60 hover:text-accent-foreground transition-all duration-200 cursor-pointer border-0"
                    >
                      <div className="p-3 rounded-2xl bg-primary/10 text-primary shrink-0 flex items-center justify-center">
                        {item.icon}
                      </div>
                      <div className="space-y-1.5">
                        <p className="text-sm font-bold leading-none tracking-tight">
                          {item.label}
                        </p>
                        <p className="text-xs text-muted-foreground leading-normal line-clamp-2">
                          {item.desc}
                        </p>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      })}
    </nav>
  );
}
