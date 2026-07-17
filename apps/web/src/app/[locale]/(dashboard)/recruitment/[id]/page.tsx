"use client";

import React, { useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  CircleNotch,
  XCircle,
  CheckCircle,
  ArrowSquareOut,
  Copy,
  Check,
  DotsSixVertical,
  File,
  UserCheck,
} from "@phosphor-icons/react";

import { recruitmentService, Application } from "@/services/recruitment.service";
import { RbacGuard } from "@/components/rbac-guard";
import { Button } from "@/components/ui/button";

const STAGES = [
  "SUBMITTED",
  "SCREENING",
  "HR_INTERVIEW",
  "TECHNICAL_TEST",
  "MANAGER_INTERVIEW",
  "OFFER",
  "HIRED",
  "REJECTED",
] as const;

type Stage = (typeof STAGES)[number];

interface KanbanCardProps {
  app: Application;
  onReject: (id: string) => void;
  onHire: (id: string) => void;
  isHiring: boolean;
  resumeLabel: string;
  admitLabel: string;
  admittingLabel: string;
}

function KanbanCard({
  app,
  onReject,
  onHire,
  isHiring,
  resumeLabel,
  admitLabel,
  admittingLabel,
}: KanbanCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: app.id,
    data: { type: "card", status: app.status },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group relative p-3 bg-card/60 backdrop-blur-sm rounded-xl space-y-2 select-none cursor-default hover:bg-card/90 transition-all duration-150"
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2.5 right-2.5 cursor-grab active:cursor-grabbing p-0.5 rounded text-muted-foreground/40 hover:text-muted-foreground/80 transition-colors"
      >
        <DotsSixVertical className="h-4 w-4" />
      </div>

      <div className="space-y-0.5 pr-6">
        <p className="font-semibold text-sm text-foreground leading-tight">{app.candidateName}</p>
        <p className="text-xs text-muted-foreground truncate">{app.candidateEmail}</p>
      </div>

      <div className="flex items-center justify-between pt-0.5">
        {app.resumeUrl ? (
          <a
            href={app.resumeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <File className="h-3 w-3" />
            {resumeLabel}
            <ArrowSquareOut className="h-2.5 w-2.5" />
          </a>
        ) : (
          <span />
        )}

        <div className="flex items-center gap-1">
          {app.status !== "HIRED" && app.status !== "REJECTED" && (
            <button
              className="h-6 w-6 flex items-center justify-center rounded-md text-destructive hover:bg-destructive/10 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onReject(app.id);
              }}
              title="Reject"
            >
              <XCircle className="h-3.5 w-3.5" />
            </button>
          )}

          {app.status === "OFFER" && (
            <button
              className="h-6 w-6 flex items-center justify-center rounded-md text-emerald-500 hover:bg-emerald-500/10 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onReject(app.id);
              }}
              title="Hire"
            >
              <CheckCircle className="h-3.5 w-3.5" />
            </button>
          )}

          {app.status === "HIRED" && (
            <Button
              size="sm"
              className="h-6 text-[10px] px-2 rounded-md gap-1"
              disabled={isHiring}
              onClick={(e) => {
                e.stopPropagation();
                onHire(app.id);
              }}
            >
              <UserCheck className="h-3 w-3" />
              {isHiring ? admittingLabel : admitLabel}
            </Button>
          )}
        </div>
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
  hiringId: string | null;
  resumeLabel: string;
  admitLabel: string;
  admittingLabel: string;
}

function KanbanColumn({
  stage,
  label,
  apps,
  onReject,
  onHire,
  hiringId,
  resumeLabel,
  admitLabel,
  admittingLabel,
}: KanbanColumnProps) {
  const isRejected = stage === "REJECTED";
  const isHired = stage === "HIRED";

  const columnBg = isRejected
    ? "bg-destructive/5"
    : isHired
      ? "bg-emerald-500/5"
      : "bg-muted/20";

  const countBg = isRejected
    ? "bg-destructive/10 text-destructive"
    : isHired
      ? "bg-emerald-500/10 text-emerald-500"
      : "bg-muted/40 text-muted-foreground";

  const headerColor = isRejected
    ? "text-destructive/70"
    : isHired
      ? "text-emerald-500"
      : "text-foreground";

  return (
    <div className={`flex-1 flex flex-col rounded-2xl ${columnBg} p-3 min-w-[200px] max-w-[260px]`}>
      <div className="flex justify-between items-center mb-3 px-1">
        <h3 className={`font-bold text-xs uppercase tracking-wider ${headerColor}`}>{label}</h3>
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${countBg}`}>
          {apps.length}
        </span>
      </div>

      <SortableContext
        items={apps.map((a) => a.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex-1 space-y-2 overflow-y-auto min-h-[60px]">
          {apps.map((app) => (
            <KanbanCard
              key={app.id}
              app={app}
              onReject={onReject}
              onHire={onHire}
              isHiring={hiringId === app.id}
              resumeLabel={resumeLabel}
              admitLabel={admitLabel}
              admittingLabel={admittingLabel}
            />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}

export default function RecruitmentDetailsPage() {
  const t = useTranslations("Recruitment");
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = params?.id as string;
  const locale = params?.locale || "pt";

  const [hiringId, setHiringId] = useState<string | null>(null);
  const [activeCard, setActiveCard] = useState<Application | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  const { data: vacancy, isLoading: loadingVacancy } = useQuery({
    queryKey: ["recruitment", id],
    queryFn: () => recruitmentService.getRecruitment(id),
    enabled: !!id,
  });

  const { data: applicationsResponse, isLoading: loadingApps } = useQuery({
    queryKey: ["applications", id],
    queryFn: () => recruitmentService.getApplications(id),
    enabled: !!id,
  });

  const applications = applicationsResponse?.data || [];

  const updateStatusMutation = useMutation({
    mutationFn: (args: { applicationId: string; status: string }) =>
      recruitmentService.updateApplicationStatus(args.applicationId, { status: args.status }),
    onMutate: async ({ applicationId, status }) => {
      await queryClient.cancelQueries({ queryKey: ["applications", id] });
      const previous = queryClient.getQueryData<{ data: Application[] }>(["applications", id]);
      queryClient.setQueryData<{ data: Application[] }>(["applications", id], (old) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data.map((app) =>
            app.id === applicationId ? { ...app, status: status as Application["status"] } : app,
          ),
        };
      });
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["applications", id], context.previous);
      }
    },
    onSettled: () => {
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

  const handleDragStart = (event: DragStartEvent) => {
    const draggedApp = applications.find((a) => a.id === event.active.id);
    setActiveCard(draggedApp ?? null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveCard(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeApp = applications.find((a) => a.id === active.id);
    if (!activeApp) return;

    const overStage = STAGES.find((s) => s === over.id);
    const overCardApp = applications.find((a) => a.id === over.id);
    const targetStage = overStage ?? overCardApp?.status;

    if (targetStage && targetStage !== activeApp.status) {
      updateStatusMutation.mutate({ applicationId: activeApp.id, status: targetStage });
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeApp = applications.find((a) => a.id === active.id);
    const overStage = STAGES.find((s) => s === over.id);
    const overCardApp = applications.find((a) => a.id === over.id);
    const targetStage = overStage ?? overCardApp?.status;

    if (targetStage && activeApp && targetStage !== activeApp.status) {
      queryClient.setQueryData<{ data: Application[] }>(["applications", id], (old) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data.map((app) =>
            app.id === activeApp.id ? { ...app, status: targetStage as Application["status"] } : app,
          ),
        };
      });
    }
  };

  const handleReject = (applicationId: string) => {
    updateStatusMutation.mutate({ applicationId, status: "REJECTED" });
  };

  const handleCopyPortalLink = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/${locale}/jobs`);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {}
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
      <div className="p-8 text-center text-destructive font-medium">
        {t("kanban.notFound")}
      </div>
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
      <div className="p-6 md:p-8 flex flex-col gap-5 w-full h-[calc(100vh-56px)]">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-shrink-0">
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
                {vacancy.department?.name || t("kanban.noDepartment")} •{" "}
                {t("kanban.funnelLabel")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              variant="outline"
              size="sm"
              className="rounded-2xl border-0 bg-muted/40 hover:bg-muted/65 gap-2 text-xs h-9"
              onClick={handleCopyPortalLink}
            >
              {copiedLink ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                  <span className="text-emerald-500">{t("kanban.portalLinkCopied")}</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  {t("kanban.copyPortalLink")}
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-2xl border-0 bg-muted/40 hover:bg-muted/65 gap-2 text-xs h-9"
              onClick={() => router.push(`/${locale}/jobs`)}
            >
              <ArrowSquareOut className="h-3.5 w-3.5" />
              {t("kanban.viewJobsPortal")}
            </Button>
          </div>
        </div>

        {/* Kanban Board */}
        <div className="flex-1 overflow-x-auto overflow-y-hidden pb-2">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <div className="flex gap-3 h-full min-w-max">
              {STAGES.map((stage) => (
                <KanbanColumn
                  key={stage}
                  stage={stage}
                  label={t(`stages.${stage}` as any)}
                  apps={appsByStage[stage]}
                  onReject={handleReject}
                  onHire={(appId) => hireMutation.mutate(appId)}
                  hiringId={hiringId}
                  resumeLabel={t("kanban.resumeLink")}
                  admitLabel={t("kanban.admit")}
                  admittingLabel={t("kanban.admitting")}
                />
              ))}
            </div>

            <DragOverlay>
              {activeCard ? (
                <div className="p-3 bg-card rounded-xl shadow-2xl shadow-black/30 border border-muted/30 space-y-2 w-[220px] rotate-2 opacity-95">
                  <p className="font-semibold text-sm">{activeCard.candidateName}</p>
                  <p className="text-xs text-muted-foreground truncate">{activeCard.candidateEmail}</p>
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>
      </div>
    </RbacGuard>
  );
}
