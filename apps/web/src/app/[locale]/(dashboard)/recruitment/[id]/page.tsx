"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  CircleNotch,
  XCircle,
  ArrowSquareOut,
  UserCheck,
  CaretLeft,
  CaretRight,
  Phone,
  LinkedinLogo,
} from "@phosphor-icons/react";

import { recruitmentService, Application } from "@/services/recruitment.service";
import { RbacGuard } from "@/components/rbac-guard";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const STAGES = [
  "SCREENING",
  "HR_INTERVIEW",
  "TECHNICAL_TEST",
  "OFFER",
  "HIRED",
  "REJECTED",
] as const;

type Stage = (typeof STAGES)[number];

interface KanbanCardProps {
  app: Application;
  onReject: (id: string) => void;
  onHire: (id: string) => void;
  onMoveStage: (id: string, newStage: Stage) => void;
  isHiring: boolean;
  resumeLabel: string;
  admitLabel: string;
  admittingLabel: string;
  changeStageLabel: string;
  rejectCandidateLabel: string;
  appliedAtLabel: string;
  currentIndex: number;
}

function KanbanCard({
  app,
  onReject,
  onHire,
  onMoveStage,
  isHiring,
  resumeLabel,
  admitLabel,
  admittingLabel,
  changeStageLabel,
  rejectCandidateLabel,
  appliedAtLabel,
  currentIndex,
}: KanbanCardProps) {
  const candidate = app.candidate;
  const fullName = candidate ? `${candidate.firstName} ${candidate.lastName}` : app.candidateName;
  const email = candidate?.email ?? app.candidateEmail;
  const phone = candidate?.phone;
  const linkedin = candidate?.linkedinUrl;
  const appliedDate = new Date(app.createdAt).toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="p-4 rounded-xl border border-muted/20 bg-neutral-100 dark:bg-neutral-900 shadow-[0_2px_6px_rgba(0,0,0,0.03)] dark:shadow-[0_2px_6px_rgba(0,0,0,0.15)] transition-all duration-200 hover:border-muted-foreground/30 hover:shadow-md flex flex-col gap-3">
      {/* Candidate info */}
      <div className="space-y-1">
        <p className="font-bold text-sm text-foreground tracking-tight leading-snug">{fullName}</p>
        <p className="text-[11px] text-muted-foreground truncate">{email}</p>
        {phone && (
          <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <Phone className="h-3 w-3 shrink-0" />
            <span>{phone}</span>
          </div>
        )}
        {linkedin && (
          <a
            href={linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[11px] text-blue-500 hover:text-blue-400 hover:underline transition-colors w-fit"
          >
            <LinkedinLogo className="h-3 w-3 shrink-0" />
            <span>LinkedIn</span>
            <ArrowSquareOut className="h-2.5 w-2.5 shrink-0" />
          </a>
        )}
        <p className="text-[10px] text-muted-foreground/60 pt-0.5">
          {appliedAtLabel}: {appliedDate}
        </p>
      </div>

      {/* Action buttons — full column */}
      <div className="flex flex-col gap-1.5 pt-2.5 border-t border-muted/10">
        {app.resumeUrl && (
          <a
            href={app.resumeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "w-full h-8 text-[11px] font-semibold gap-1.5 rounded-lg justify-center",
            )}
          >
            <ArrowSquareOut className="h-3.5 w-3.5 shrink-0" />
            <span>{resumeLabel}</span>
          </a>
        )}

        {app.status === "HIRED" && (
          <Button
            size="sm"
            className="w-full h-8 text-[11px] px-3 rounded-lg gap-1.5 font-semibold border-0 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-colors duration-150"
            disabled={isHiring}
            onClick={() => onHire(app.id)}
          >
            <UserCheck className="h-3.5 w-3.5 shrink-0" />
            <span>{isHiring ? admittingLabel : admitLabel}</span>
          </Button>
        )}

        {app.status !== "HIRED" && app.status !== "REJECTED" && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full h-8 text-[11px] font-semibold gap-1.5 rounded-lg justify-center border-0 bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20 transition-colors duration-150"
            onClick={() => onReject(app.id)}
          >
            <XCircle className="h-3.5 w-3.5 shrink-0" />
            <span>{rejectCandidateLabel}</span>
          </Button>
        )}
      </div>

      {/* Stage navigation */}
      <div className="flex justify-between items-center gap-1 pt-2 border-t border-dashed border-muted/10">
        <Button
          variant="outline"
          size="icon"
          className="h-6 w-6 rounded-md hover:bg-muted shrink-0"
          disabled={currentIndex === 0}
          onClick={() => onMoveStage(app.id, STAGES[currentIndex - 1])}
        >
          <CaretLeft className="h-3.5 w-3.5 text-muted-foreground" />
        </Button>
        <span className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-wide truncate max-w-[130px]">
          {changeStageLabel}
        </span>
        <Button
          variant="outline"
          size="icon"
          className="h-6 w-6 rounded-md hover:bg-muted shrink-0"
          disabled={currentIndex === STAGES.length - 1}
          onClick={() => onMoveStage(app.id, STAGES[currentIndex + 1])}
        >
          <CaretRight className="h-3.5 w-3.5 text-muted-foreground" />
        </Button>
      </div>
    </div>
  );
}

interface KanbanColumnProps {
  stage: Stage;
  label: string;
  apps: Application[];
  onReject: (id: string) => void;
  onHire: (id: string) => void;
  onMoveStage: (id: string, newStage: Stage) => void;
  hiringId: string | null;
  resumeLabel: string;
  admitLabel: string;
  admittingLabel: string;
  changeStageLabel: string;
  rejectCandidateLabel: string;
  appliedAtLabel: string;
  stageIndex: number;
}

function KanbanColumn({
  stage,
  label,
  apps,
  onReject,
  onHire,
  onMoveStage,
  hiringId,
  resumeLabel,
  admitLabel,
  admittingLabel,
  changeStageLabel,
  rejectCandidateLabel,
  appliedAtLabel,
  stageIndex,
}: KanbanColumnProps) {
  return (
    <div
      data-stage={stage}
      className="flex flex-col rounded-2xl p-3 w-[270px] flex-shrink-0 bg-muted/20"
    >
      <div className="flex justify-between items-center mb-3 px-1">
        <h3 className="font-bold text-xs uppercase tracking-wider text-foreground">{label}</h3>
        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-muted/40 text-muted-foreground">
          {apps.length}
        </span>
      </div>

      <div className="flex flex-col gap-2 flex-1 min-h-[150px]">
        {apps.map((app) => (
          <KanbanCard
            key={app.id}
            app={app}
            onReject={onReject}
            onHire={onHire}
            onMoveStage={onMoveStage}
            isHiring={hiringId === app.id}
            resumeLabel={resumeLabel}
            admitLabel={admitLabel}
            admittingLabel={admittingLabel}
            changeStageLabel={changeStageLabel}
            rejectCandidateLabel={rejectCandidateLabel}
            appliedAtLabel={appliedAtLabel}
            currentIndex={stageIndex}
          />
        ))}
      </div>
    </div>
  );
}

export default function RecruitmentDetailsPage() {
  const t = useTranslations("Recruitment");
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = params?.id as string;

  const [hiringId, setHiringId] = useState<string | null>(null);

  const { data: vacancy, isLoading: loadingVacancy } = useQuery({
    queryKey: ["recruitment", id],
    queryFn: () => recruitmentService.getRecruitment(id),
    enabled: !!id,
  });

  const { data: applicationsResponse, isLoading: loadingApps } = useQuery({
    queryKey: ["applications", id],
    queryFn: () => recruitmentService.getApplications(id),
    enabled: !!id,
    select: (data) => data.data,
  });

  const applications: Application[] = applicationsResponse ?? [];

  const updateStatusMutation = useMutation({
    mutationFn: (args: { applicationId: string; status: string }) =>
      recruitmentService.updateApplicationStatus(args.applicationId, { status: args.status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications", id] });
    },
  });

  const hireMutation = useMutation({
    mutationFn: (applicationId: string) => {
      setHiringId(applicationId);
      return recruitmentService.hireCandidate(applicationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications", id] });
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      setHiringId(null);
    },
    onError: () => setHiringId(null),
  });

  const handleMoveStage = (applicationId: string, newStage: Stage) => {
    updateStatusMutation.mutate({ applicationId, status: newStage });
  };

  const handleReject = (applicationId: string) => {
    updateStatusMutation.mutate({ applicationId, status: "REJECTED" });
  };

  if (loadingVacancy || loadingApps) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <CircleNotch className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!vacancy) {
    return (
      <div className="p-8 text-center text-destructive font-medium">{t("kanban.notFound")}</div>
    );
  }

  const appsByStage = STAGES.reduce(
    (acc, stage) => {
      acc[stage] = applications.filter((app) => app.status === stage);
      return acc;
    },
    {} as Record<Stage, Application[]>,
  );

  return (
    <RbacGuard allowedRoles={["ADMIN", "HR", "MANAGER"]}>
      <div className="flex flex-col overflow-hidden" style={{ height: "calc(100vh - 4rem)" }}>
        {/* Header */}
        <div className="flex items-start justify-between gap-4 px-6 pt-6 pb-4 flex-shrink-0">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.back()}
              className="rounded-2xl border-0 bg-muted/40 hover:bg-muted/65 transition-colors flex-shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight leading-tight">{vacancy.title}</h1>
              <p className="text-muted-foreground text-sm">
                {vacancy.department?.name || t("kanban.noDepartment")} • {t("kanban.funnelLabel")}
              </p>
            </div>
          </div>
        </div>

        {/* Kanban Board — scrolls horizontally only */}
        <div className="flex-1 overflow-x-auto overflow-y-hidden px-6 pb-6">
          <div className="flex gap-3 h-full">
            {STAGES.map((stage, index) => (
              <KanbanColumn
                key={stage}
                stage={stage}
                label={t(`stages.${stage}` as any)}
                apps={appsByStage[stage]}
                onReject={handleReject}
                onHire={(appId) => hireMutation.mutate(appId)}
                onMoveStage={handleMoveStage}
                hiringId={hiringId}
                resumeLabel={t("kanban.resumeLink")}
                admitLabel={t("kanban.admit")}
                admittingLabel={t("kanban.admitting")}
                changeStageLabel={t("kanban.changeStage")}
                rejectCandidateLabel={t("kanban.rejectCandidate")}
                appliedAtLabel={t("kanban.appliedAt")}
                stageIndex={index}
              />
            ))}
          </div>
        </div>
      </div>
    </RbacGuard>
  );
}
