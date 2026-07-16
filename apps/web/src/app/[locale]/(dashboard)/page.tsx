"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import {
  Users,
  Briefcase,
  Calendar,
  Building,
  FileText,
  ArrowRight,
  PlusCircle,
} from "lucide-react";

import { useAuthStore } from "@/store/useAuthStore";
import { dashboardService } from "@/services/dashboard.service";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const t = useTranslations("Dashboard");
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const locale = params?.locale || "pt";

  const isEmployee = user?.role === "EMPLOYEE";
  const isAdminOrHr = user?.role === "ADMIN" || user?.role === "HR";

  // --- Fetch Dashboard Stats (only for admin/hr/managers) ---
  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () => dashboardService.getStats(),
    enabled: !isEmployee && !!user,
  });

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

  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours < 12) return "Bom dia";
    if (hours < 18) return "Boa tarde";
    return "Boa noite";
  };

  // --- Employee dashboard view ---
  if (isEmployee) {
    return (
      <div className="p-6 md:p-8 space-y-8 w-full animate-fade-in">
        {/* Welcome block */}
        <div className="space-y-1.5">
          <h1 className="text-2xl font-bold tracking-tight">
            {getGreeting()}, {user?.email.split("@")[0]}!
          </h1>
          <p className="text-muted-foreground text-sm">
            Painel do {getRoleLabel(user?.role)}. Gerencie suas informações e envie solicitações.
          </p>
        </div>

        {/* Quick Links cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          <div className="bg-muted/15 p-6 rounded-2xl flex flex-col justify-between h-40">
            <div className="space-y-2">
              <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                <Calendar className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-sm">Minhas Ausências</h3>
              <p className="text-xs text-muted-foreground">
                Solicitar férias e registrar atestados.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="mt-4 self-start rounded-xl border-0 bg-muted/40 hover:bg-muted/65 text-xs font-semibold"
              onClick={() => router.push(`/${locale}/absences/my-requests`)}
            >
              Acessar
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          </div>

          <div className="bg-muted/15 p-6 rounded-2xl flex flex-col justify-between h-40">
            <div className="space-y-2">
              <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                <FileText className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-sm">Meus Documentos</h3>
              <p className="text-xs text-muted-foreground">
                Acessar e consultar recibos ou contratos.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="mt-4 self-start rounded-xl border-0 bg-muted/40 hover:bg-muted/65 text-xs font-semibold animate-fade-in"
              onClick={() => router.push(`/${locale}/absences/my-requests`)}
            >
              Acessar
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // --- Administrative dashboard view ---
  return (
    <div className="p-6 md:p-8 space-y-8 w-full animate-fade-in">
      {/* Title Header */}
      <div className="space-y-1.5">
        <h1 className="text-2xl font-bold tracking-tight">
          {getGreeting()}, {user?.email.split("@")[0]}
        </h1>
        <p className="text-muted-foreground text-sm">
          Acompanhe o panorama geral da empresa e as ações pendentes.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
        {/* Total Colaboradores */}
        <div className="bg-muted/15 p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase">Colaboradores</span>
            <Users className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-bold tracking-tight">
              {isLoading ? "..." : (stats?.totalEmployees ?? 0)}
            </p>
            <p className="text-xs text-muted-foreground">Funcionários ativos registrados</p>
          </div>
        </div>

        {/* Departamentos */}
        <div className="bg-muted/15 p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase">Setores</span>
            <Building className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-bold tracking-tight">
              {isLoading ? "..." : (stats?.totalDepartments ?? 0)}
            </p>
            <p className="text-xs text-muted-foreground">Departamentos estruturados</p>
          </div>
        </div>

        {/* Vagas Abertas */}
        <div className="bg-muted/15 p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase">Recrutamento</span>
            <Briefcase className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-bold tracking-tight">
              {isLoading ? "..." : (stats?.openJobs ?? 0)}
            </p>
            <p className="text-xs text-muted-foreground">Processos seletivos ativos</p>
          </div>
        </div>

        {/* Ausências Pendentes */}
        <div className="bg-muted/15 p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase">Pendências</span>
            <Calendar className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-bold tracking-tight">
              {isLoading ? "..." : (stats?.pendingVacations ?? 0) + (stats?.pendingLeaves ?? 0)}
            </p>
            <p className="text-xs text-muted-foreground">Aprovações de ausências pendentes</p>
          </div>
        </div>
      </div>

      {/* Quick Actions for Admins/HR/Managers with RBAC */}
      <div className="space-y-4 pt-4">
        <h2 className="text-lg font-bold tracking-tight">Ações Rápidas</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 w-full">
          {isAdminOrHr && (
            <>
              <Button
                variant="outline"
                className="h-12 justify-start rounded-2xl border-0 bg-muted/40 hover:bg-muted/65 text-xs font-semibold px-4 animate-fade-in"
                onClick={() => router.push(`/${locale}/employees/new`)}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Admitir Colaborador
              </Button>

              <Button
                variant="outline"
                className="h-12 justify-start rounded-2xl border-0 bg-muted/40 hover:bg-muted/65 text-xs font-semibold px-4 animate-fade-in"
                onClick={() => router.push(`/${locale}/recruitment/new`)}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Nova Vaga (ATS)
              </Button>
            </>
          )}

          <Button
            variant="outline"
            className="h-12 justify-start rounded-2xl border-0 bg-muted/40 hover:bg-muted/65 text-xs font-semibold px-4"
            onClick={() => router.push(`/${locale}/absences/vacations`)}
          >
            <Calendar className="mr-2 h-4 w-4" />
            Controlar Férias
          </Button>

          <Button
            variant="outline"
            className="h-12 justify-start rounded-2xl border-0 bg-muted/40 hover:bg-muted/65 text-xs font-semibold px-4"
            onClick={() => router.push(`/${locale}/documents`)}
          >
            <FileText className="mr-2 h-4 w-4" />
            Repositório de Arquivos
          </Button>
        </div>
      </div>
    </div>
  );
}
