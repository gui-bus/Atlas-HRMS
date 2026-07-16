"use client";

import React from "react";
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
}

interface MenuCategory {
  label: string;
  items: MenuItem[];
}

interface DesktopNavProps {
  locale: string;
}

export function DesktopNav({ locale }: DesktopNavProps) {
  const menuCategories: MenuCategory[] = [
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

  return (
    <nav className="hidden lg:flex items-center space-x-1">
      {menuCategories.map((category) => (
        <DropdownMenu key={category.label}>
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
            className="p-4 w-[480px] grid grid-cols-2 gap-4 border-0 shadow-xl"
            align="start"
            side="bottom"
          >
            <DropdownMenuGroup className="grid grid-cols-2 gap-4 col-span-2">
              {category.items.map((item) => (
                <DropdownMenuItem
                  key={item.label}
                  render={<a href={item.href} />}
                  className="flex items-start space-x-3.5 p-3.5 rounded-xl hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer border-0"
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
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      ))}
    </nav>
  );
}
