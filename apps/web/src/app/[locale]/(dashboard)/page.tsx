"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import {
  Users,
  Briefcase,
  Calendar,
  Buildings,
  FileText,
  PlusCircle,
  Clock,
  UserPlus,
  Pencil,
  SuitcaseSimple,
  TrendUp,
  CheckCircle,
  HourglassMedium,
} from "@phosphor-icons/react";

import { useAuthStore } from "@/store/useAuthStore";
import { dashboardService } from "@/services/dashboard.service";
import { Button } from "@/components/ui/button";
import { ClockWidget } from "@/components/time-attendance/clock-widget";

const APPLICATION_STAGES = [
  "SUBMITTED",
  "SCREENING",
  "HR_INTERVIEW",
  "TECHNICAL_TEST",
  "TECHNICAL_INTERVIEW",
  "FINAL_INTERVIEW",
  "OFFER",
  "HIRED",
  "REJECTED",
];

export default function DashboardPage() {
  const t = useTranslations("Dashboard");
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const locale = params?.locale || "pt";

  const isEmployee = user?.role === "EMPLOYEE";
  const isAdminOrHr = user?.role === "ADMIN" || user?.role === "HR";

  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () => dashboardService.getStats(),
    enabled: !isEmployee && !!user,
  });

  const { data: employeeSummary, isLoading: isLoadingEmployee } = useQuery({
    queryKey: ["employee-summary"],
    queryFn: () => dashboardService.getEmployeeSummary(),
    enabled: !!user,
  });

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case "ADMIN":
        return t("roleAdmin");
      case "HR":
        return t("roleHr");
      case "MANAGER":
        return t("roleManager");
      default:
        return t("roleEmployee");
    }
  };

  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours < 12) return t("greeting_morning");
    if (hours < 18) return t("greeting_afternoon");
    return t("greeting_evening");
  };

  const formatBalance = (mins: number) => {
    const prefix = mins >= 0 ? "+" : "-";
    const absolute = Math.abs(mins);
    const hrs = Math.floor(absolute / 60);
    const remainingMins = absolute % 60;
    return `${prefix}${hrs.toString().padStart(2, "0")}h ${remainingMins.toString().padStart(2, "0")}m`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const totalStageApplications = Object.values(stats?.applicationsByStage ?? {}).reduce(
    (acc, v) => acc + v,
    0,
  );

  // ─── Employee View ───────────────────────────────────────────────────────────
  if (isEmployee) {
    const balance = employeeSummary?.hourBankBalance ?? 0;
    const nextVacation = employeeSummary?.upcomingVacations?.[0];
    const pendingTotal =
      (employeeSummary?.pendingVacationsCount ?? 0) + (employeeSummary?.pendingLeavesCount ?? 0);

    return (
      <div className="p-6 md:p-8 space-y-8 w-full animate-fade-in">
        <div className="space-y-1.5">
          <h1 className="text-2xl font-bold tracking-tight">
            {getGreeting()}, {user?.email.split("@")[0]}!
          </h1>
          <p className="text-muted-foreground text-sm">
            {getRoleLabel(user?.role)} · {t("employeeSubtitle")}
          </p>
        </div>

        {/* Clock Widget */}
        <ClockWidget />

        {/* Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
          {/* Banco de Horas */}
          <div className="bg-muted/15 p-5 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground uppercase">
                {t("myHourBank")}
              </span>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </div>
            {isLoadingEmployee ? (
              <div className="h-8 w-24 bg-muted/30 rounded animate-pulse" />
            ) : (
              <p
                className={`text-2xl font-black font-mono tabular-nums tracking-tight ${
                  balance >= 0 ? "text-emerald-500" : "text-destructive"
                }`}
              >
                {formatBalance(balance)}
              </p>
            )}
            <p className="text-xs text-muted-foreground">{t("myHourBankDesc")}</p>
          </div>

          {/* Próximas Férias */}
          <div className="bg-muted/15 p-5 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground uppercase">
                {t("myVacations")}
              </span>
              <SuitcaseSimple className="h-4 w-4 text-muted-foreground" />
            </div>
            {isLoadingEmployee ? (
              <div className="h-8 w-32 bg-muted/30 rounded animate-pulse" />
            ) : nextVacation ? (
              <div className="space-y-0.5">
                <p className="text-sm font-bold text-foreground">
                  {t("upcomingFrom")} {formatDate(nextVacation.startDate)}
                </p>
                <p className="text-xs text-muted-foreground">
                  até {formatDate(nextVacation.endDate)}
                </p>
              </div>
            ) : (
              <p className="text-sm font-semibold text-muted-foreground">
                {t("noUpcomingVacations")}
              </p>
            )}
            <p className="text-xs text-muted-foreground">{t("myVacationsDesc")}</p>
          </div>

          {/* Minhas Solicitações */}
          <div className="bg-muted/15 p-5 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground uppercase">
                {t("myPendingRequests")}
              </span>
              <HourglassMedium className="h-4 w-4 text-muted-foreground" />
            </div>
            {isLoadingEmployee ? (
              <div className="h-8 w-12 bg-muted/30 rounded animate-pulse" />
            ) : pendingTotal > 0 ? (
              <div className="space-y-0.5">
                <p className="text-2xl font-black tracking-tight">{pendingTotal}</p>
                <p className="text-xs text-muted-foreground">
                  {t("pendingRequestsDetail", {
                    vacations: employeeSummary?.pendingVacationsCount ?? 0,
                    leaves: employeeSummary?.pendingLeavesCount ?? 0,
                  })}
                </p>
              </div>
            ) : (
              <p className="text-sm font-semibold text-emerald-500 flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4" />
                {t("noPendingRequests")}
              </p>
            )}
            <p className="text-xs text-muted-foreground">{t("myPendingRequestsDesc")}</p>
          </div>
        </div>
      </div>
    );
  }

  // ─── Administrative View ─────────────────────────────────────────────────────
  return (
    <div className="p-6 md:p-8 space-y-8 w-full animate-fade-in">
      {/* Header */}
      <div className="space-y-1.5">
        <h1 className="text-2xl font-bold tracking-tight">
          {getGreeting()}, {user?.email.split("@")[0]}
        </h1>
        <p className="text-muted-foreground text-sm">
          {getRoleLabel(user?.role)} · {t("adminSubtitle")}
        </p>
      </div>

      {/* Row 1 — Main Stats (4 cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
        <div className="bg-muted/15 p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase">
              {t("totalEmployees")}
            </span>
            <Users className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-bold tracking-tight">
              {isLoadingStats ? "—" : (stats?.totalEmployees ?? 0)}
            </p>
            <p className="text-xs text-muted-foreground">{t("totalEmployeesDesc")}</p>
          </div>
        </div>

        <div className="bg-muted/15 p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase">
              {t("departments")}
            </span>
            <Buildings className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-bold tracking-tight">
              {isLoadingStats ? "—" : (stats?.totalDepartments ?? 0)}
            </p>
            <p className="text-xs text-muted-foreground">{t("departmentsDesc")}</p>
          </div>
        </div>

        <div className="bg-muted/15 p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase">
              {t("openJobs")}
            </span>
            <Briefcase className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-bold tracking-tight">
              {isLoadingStats ? "—" : (stats?.openJobs ?? 0)}
            </p>
            <p className="text-xs text-muted-foreground">{t("openJobsDesc")}</p>
          </div>
        </div>

        <div className="bg-muted/15 p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase">
              {t("activeAbsences")}
            </span>
            <Calendar className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-bold tracking-tight">
              {isLoadingStats ? "—" : (stats?.activeAbsences ?? 0)}
            </p>
            <p className="text-xs text-muted-foreground">{t("activeAbsencesDesc")}</p>
          </div>
        </div>
      </div>

      {/* Row 2 — Operational Stats (3 cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
        <div className="bg-muted/15 p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase">
              {t("pendingApprovals")}
            </span>
            <HourglassMedium className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-bold tracking-tight">
              {isLoadingStats ? "—" : (stats?.pendingVacations ?? 0) + (stats?.pendingLeaves ?? 0)}
            </p>
            <p className="text-xs text-muted-foreground">{t("pendingApprovalsDesc")}</p>
          </div>
        </div>

        <div className="bg-muted/15 p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase">
              {t("newHiresThisMonth")}
            </span>
            <UserPlus className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-bold tracking-tight">
              {isLoadingStats ? "—" : (stats?.newHiresThisMonth ?? 0)}
            </p>
            <p className="text-xs text-muted-foreground">{t("newHiresThisMonthDesc")}</p>
          </div>
        </div>

        <div className="bg-muted/15 p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase">
              {t("pendingCorrections")}
            </span>
            <Pencil className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <p
              className={`text-3xl font-bold tracking-tight ${
                (stats?.pendingCorrections ?? 0) > 0 ? "text-amber-500" : ""
              }`}
            >
              {isLoadingStats ? "—" : (stats?.pendingCorrections ?? 0)}
            </p>
            <p className="text-xs text-muted-foreground">{t("pendingCorrectionsDesc")}</p>
          </div>
        </div>
      </div>

      {/* Recruitment Funnel */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold tracking-tight flex items-center gap-2">
            <TrendUp className="h-4 w-4 text-muted-foreground" />
            {t("recruitmentFunnel")}
          </h2>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>
              <span className="font-bold text-foreground">{stats?.totalApplications ?? 0}</span>{" "}
              {t("totalApplications")}
            </span>
            <span>
              <span className="font-bold text-emerald-500">{stats?.hiredCount ?? 0}</span>{" "}
              {t("hired")}
            </span>
            {isAdminOrHr && (
              <button
                onClick={() => router.push(`/${locale}/jobs`)}
                className="text-primary hover:text-primary/80 font-semibold transition-colors flex items-center gap-1">
                <SuitcaseSimple className="h-3.5 w-3.5" />
                {t("viewJobsPortal")}
              </button>
            )}
          </div>
        </div>

        <div className="bg-muted/15 rounded-2xl p-5 space-y-3">
          {isLoadingStats ? (
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-6 bg-muted/30 rounded animate-pulse" />
              ))}
            </div>
          ) : totalStageApplications === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">
              {t("noActiveApplications")}
            </p>
          ) : (
            <div className="space-y-2.5">
              {APPLICATION_STAGES.filter(
                (stage) => (stats?.applicationsByStage?.[stage] ?? 0) > 0,
              ).map((stage) => {
                const count = stats?.applicationsByStage?.[stage] ?? 0;
                const pct = totalStageApplications > 0 ? (count / totalStageApplications) * 100 : 0;
                const isHired = stage === "HIRED";
                const isRejected = stage === "REJECTED";

                const stageLabels: Record<string, string> = {
                  SUBMITTED: t("stageLabels.SUBMITTED"),
                  SCREENING: t("stageLabels.SCREENING"),
                  HR_INTERVIEW: t("stageLabels.HR_INTERVIEW"),
                  TECHNICAL_TEST: t("stageLabels.TECHNICAL_TEST"),
                  TECHNICAL_INTERVIEW: t("stageLabels.TECHNICAL_INTERVIEW"),
                  FINAL_INTERVIEW: t("stageLabels.FINAL_INTERVIEW"),
                  MANAGER_INTERVIEW: t("stageLabels.MANAGER_INTERVIEW"),
                  OFFER: t("stageLabels.OFFER"),
                  HIRED: t("stageLabels.HIRED"),
                  REJECTED: t("stageLabels.REJECTED"),
                };

                return (
                  <div key={stage} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span
                        className={`font-semibold ${
                          isHired
                            ? "text-emerald-500"
                            : isRejected
                              ? "text-muted-foreground/60"
                              : "text-foreground"
                        }`}
                      >
                        {stageLabels[stage] ?? stage}
                      </span>
                      <span className="font-bold tabular-nums text-muted-foreground">{count}</span>
                    </div>
                    <div className="h-1.5 w-full bg-muted/30 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isHired
                            ? "bg-emerald-500"
                            : isRejected
                              ? "bg-muted-foreground/30"
                              : "bg-primary/70"
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <h2 className="text-base font-bold tracking-tight">{t("quickActions")}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 w-full">
          {isAdminOrHr && (
            <>
              <Button
                variant="outline"
                className="h-12 justify-start rounded-2xl border-0 bg-muted/40 hover:bg-muted/65 text-xs font-semibold px-4 animate-fade-in"
                onClick={() => router.push(`/${locale}/employees/new`)}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                {t("hireEmployee")}
              </Button>

              <Button
                variant="outline"
                className="h-12 justify-start rounded-2xl border-0 bg-muted/40 hover:bg-muted/65 text-xs font-semibold px-4 animate-fade-in"
                onClick={() => router.push(`/${locale}/recruitment/new`)}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                {t("newJob")}
              </Button>
            </>
          )}

          <Button
            variant="outline"
            className="h-12 justify-start rounded-2xl border-0 bg-muted/40 hover:bg-muted/65 text-xs font-semibold px-4"
            onClick={() => router.push(`/${locale}/absences/vacations`)}
          >
            <Calendar className="mr-2 h-4 w-4" />
            {t("manageVacations")}
          </Button>

          <Button
            variant="outline"
            className="h-12 justify-start rounded-2xl border-0 bg-muted/40 hover:bg-muted/65 text-xs font-semibold px-4"
            onClick={() => router.push(`/${locale}/documents`)}
          >
            <FileText className="mr-2 h-4 w-4" />
            {t("fileRepository")}
          </Button>
        </div>
      </div>
    </div>
  );
}
