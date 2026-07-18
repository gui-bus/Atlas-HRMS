"use client";

import React, { useState, useRef } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import {
  CaretDown,
  Users,
  UserPlus,
  Calendar,
  FileText,
  Briefcase,
  FilePlus,
  Buildings,
  ClipboardText,
  Clock,
} from "@phosphor-icons/react";

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
    }, 150);
  };

  const t = useTranslations("Navigation");

  const allCategories: MenuCategory[] = [
    {
      label: t("categories.peopleManagement"),
      items: [
        {
          label: t("items.employees.label"),
          desc: t("items.employees.desc"),
          href: `/${locale}/employees`,
          icon: <Users className="w-8 h-8 text-primary shrink-0" />,
          allowedRoles: ["ADMIN", "HR", "MANAGER"],
        },
        {
          label: t("items.newEmployee.label"),
          desc: t("items.newEmployee.desc"),
          href: `/${locale}/employees/new`,
          icon: <UserPlus className="w-8 h-8 text-primary shrink-0" />,
          allowedRoles: ["ADMIN", "HR"],
        },
        {
          label: t("items.vacationsAdmin.label"),
          desc: t("items.vacationsAdmin.desc"),
          href: `/${locale}/absences/vacations`,
          icon: <Calendar className="w-8 h-8 text-primary shrink-0" />,
          allowedRoles: ["ADMIN", "HR", "MANAGER"],
        },
        {
          label: t("items.vacationsEmployee.label"),
          desc: t("items.vacationsEmployee.desc"),
          href: `/${locale}/absences/vacations/my-requests`,
          icon: <Calendar className="w-8 h-8 text-primary shrink-0" />,
          allowedRoles: ["EMPLOYEE"],
        },
        {
          label: t("items.leavesAdmin.label"),
          desc: t("items.leavesAdmin.desc"),
          href: `/${locale}/absences/leaves`,
          icon: <Calendar className="w-8 h-8 text-primary shrink-0" />,
          allowedRoles: ["ADMIN", "HR", "MANAGER"],
        },
        {
          label: t("items.leavesEmployee.label"),
          desc: t("items.leavesEmployee.desc"),
          href: `/${locale}/absences/leaves/my-requests`,
          icon: <Calendar className="w-8 h-8 text-primary shrink-0" />,
          allowedRoles: ["EMPLOYEE"],
        },
        {
          label: t("items.documents.label"),
          desc: t("items.documents.desc"),
          href: `/${locale}/documents`,
          icon: <FileText className="w-8 h-8 text-primary shrink-0" />,
          allowedRoles: ["ADMIN", "HR", "MANAGER", "EMPLOYEE"],
        },
        {
          label: t("items.timeClock.label"),
          desc: t("items.timeClock.desc"),
          href: `/${locale}/time-attendance/my-history`,
          icon: <Clock className="w-8 h-8 text-primary shrink-0" />,
          allowedRoles: ["EMPLOYEE"],
        },
      ],
    },
    {
      label: t("categories.recruitment"),
      items: [
        {
          label: t("items.jobs.label"),
          desc: t("items.jobs.desc"),
          href: `/${locale}/recruitment`,
          icon: <Briefcase className="w-8 h-8 text-primary shrink-0" />,
          allowedRoles: ["ADMIN", "HR", "MANAGER"],
        },
        {
          label: t("items.newJob.label"),
          desc: t("items.newJob.desc"),
          href: `/${locale}/recruitment/new`,
          icon: <FilePlus className="w-8 h-8 text-primary shrink-0" />,
          allowedRoles: ["ADMIN", "HR"],
        },
      ],
    },
    {
      label: t("categories.organization"),
      items: [
        {
          label: t("items.departments.label"),
          desc: t("items.departments.desc"),
          href: `/${locale}/organization/departments`,
          icon: <Buildings className="w-8 h-8 text-primary shrink-0" />,
          allowedRoles: ["ADMIN", "HR", "MANAGER"],
        },
        {
          label: t("items.positions.label"),
          desc: t("items.positions.desc"),
          href: `/${locale}/organization/positions`,
          icon: <Buildings className="w-8 h-8 text-primary shrink-0" />,
          allowedRoles: ["ADMIN", "HR", "MANAGER"],
        },
        {
          label: t("items.auditLogs.label"),
          desc: t("items.auditLogs.desc"),
          href: `/${locale}/audit`,
          icon: <ClipboardText className="w-8 h-8 text-primary shrink-0" />,
          allowedRoles: ["ADMIN", "HR"],
        },
        {
          label: t("items.userAccounts.label"),
          desc: t("items.userAccounts.desc"),
          href: `/${locale}/organization/users`,
          icon: <Users className="w-8 h-8 text-primary shrink-0" />,
          allowedRoles: ["ADMIN", "HR"],
        },
        {
          label: t("items.timeCorrections.label"),
          desc: t("items.timeCorrections.desc"),
          href: `/${locale}/time-attendance/admin/corrections`,
          icon: <Clock className="w-8 h-8 text-primary shrink-0" />,
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

  if (userRole === "EMPLOYEE") {
    const employeeItems = allCategories
      .flatMap((c) => c.items)
      .filter((item) => item.allowedRoles.includes("EMPLOYEE"));

    return (
      <nav className="hidden lg:flex items-center space-x-2">
        {employeeItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="flex items-center space-x-1 px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground rounded-md hover:bg-accent/40 transition-colors focus:outline-none select-none cursor-pointer"
          >
            <span>{item.label === "Documentos" ? "Meus Documentos" : item.label}</span>
          </Link>
        ))}
      </nav>
    );
  }

  return (
    <nav className="hidden lg:flex items-center space-x-1">
      {menuCategories.map((category) => {
        if (category.items.length === 1) {
          const singleItem = category.items[0];
          return (
            <Link
              key={category.label}
              href={singleItem.href}
              className="flex items-center space-x-1 px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground rounded-md hover:bg-accent/40 transition-colors focus:outline-none select-none cursor-pointer"
            >
              <span>{singleItem.label}</span>
            </Link>
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
                    <CaretDown className="w-3.5 h-3.5 opacity-60 transition-transform duration-200" />
                  </div>
                }
              />
              <DropdownMenuContent
                className="p-5 w-162 grid grid-cols-2 gap-5 border-0 shadow-2xl bg-background/95 backdrop-blur-md rounded-2xl"
                align="start"
                side="bottom"
                onMouseEnter={() => handleMouseEnter(category.label)}
                onMouseLeave={handleMouseLeave}
              >
                <DropdownMenuGroup className="grid grid-cols-2 gap-5 col-span-2">
                  {category.items.map((item) => (
                    <DropdownMenuItem
                      key={item.label}
                      render={<Link href={item.href} />}
                      className="flex items-start space-x-4 p-4 rounded-2xl hover:bg-accent/60 hover:text-accent-foreground transition-all duration-200 cursor-pointer border-0"
                    >
                      <div className="p-5 rounded-2xl bg-primary/10 text-primary shrink-0 flex items-center justify-center">
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
