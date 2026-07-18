"use client";

import React, { useState, useCallback } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  rectIntersection,
  useDroppable,
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
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`relative p-3 rounded-xl space-y-2 select-none hover:bg-muted/50 transition-colors duration-150 border border-transparent cursor-grab active:cursor-grabbing ${
        isDragging ? "bg-muted/10 border-dashed border-muted" : "bg-muted/30"
      }`}
    >
      <div className="absolute top-2.5 right-2.5 p-0.5 rounded text-muted-foreground/30 hover:text-muted-foreground/70">
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
            >
              <XCircle className="h-3.5 w-3.5" />
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
  const { setNodeRef, isOver } = useDroppable({
    id: stage,
  });

  return (
    <div
      ref={setNodeRef}
      data-stage={stage}
      className={`flex flex-col rounded-2xl p-3 w-[220px] flex-shrink-0 transition-colors duration-200 border border-transparent ${
        isOver ? "bg-primary/5 border-dashed border-primary/20" : "bg-muted/20"
      }`}
    >
      <div className="flex justify-between items-center mb-3 px-1">
        <h3 className="font-bold text-xs uppercase tracking-wider text-foreground">{label}</h3>
        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-muted/40 text-muted-foreground">
          {apps.length}
        </span>
      </div>

      <SortableContext items={apps.map((a) => a.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-2 flex-1 min-h-[150px]">
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
  const [localApps, setLocalApps] = useState<Application[] | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
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
    select: (data) => data.data,
  });

  const applications: Application[] = localApps ?? applicationsResponse ?? [];

  const updateStatusMutation = useMutation({
    mutationFn: (args: { applicationId: string; status: string }) =>
      recruitmentService.updateApplicationStatus(args.applicationId, { status: args.status }),
    onSuccess: () => {
      setLocalApps(null);
      queryClient.invalidateQueries({ queryKey: ["applications", id] });
    },
    onError: () => {
      setLocalApps(null);
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

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const dragged = applications.find((a) => a.id === event.active.id);
      setActiveCard(dragged ?? null);
      setLocalApps([...applications]);
    },
    [applications],
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveCard(null);

      if (!over) {
        setLocalApps(null);
        return;
      }

      const draggedApp = (localApps ?? applications).find((a) => a.id === active.id);
      if (!draggedApp) {
        setLocalApps(null);
        return;
      }

      const overStage = STAGES.find((s) => s === over.id);
      const overCard = (localApps ?? applications).find((a) => a.id === over.id);
      const targetStage = overStage ?? overCard?.status;

      if (!targetStage || targetStage === draggedApp.status) {
        setLocalApps(null);
        return;
      }

      const optimistic = (localApps ?? applications).map((a) =>
        a.id === draggedApp.id ? { ...a, status: targetStage as Application["status"] } : a,
      );
      setLocalApps(optimistic);
      updateStatusMutation.mutate({ applicationId: draggedApp.id, status: targetStage });
    },
    [applications, localApps, updateStatusMutation],
  );

  const handleDragMove = useCallback(
    (event: any) => {
      const { active, over } = event;
      if (!over || !localApps) return;

      const draggedApp = localApps.find((a) => a.id === active.id);
      if (!draggedApp) return;

      const overStage = STAGES.find((s) => s === over.id);
      const overCard = localApps.find((a) => a.id === over.id);
      const targetStage = overStage ?? overCard?.status;

      if (!targetStage || targetStage === draggedApp.status) return;

      setLocalApps((prev) =>
        (prev ?? []).map((a) =>
          a.id === draggedApp.id ? { ...a, status: targetStage as Application["status"] } : a,
        ),
      );
    },
    [localApps],
  );

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

        {/* Kanban Board — scrolls horizontally only */}
        <div className="flex-1 overflow-x-auto overflow-y-hidden px-6 pb-6">
          <DndContext
            sensors={sensors}
            collisionDetection={rectIntersection}
            onDragStart={handleDragStart}
            onDragMove={handleDragMove}
            onDragEnd={handleDragEnd}
          >
            <div className="flex gap-3 h-full">
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

            <DragOverlay dropAnimation={null}>
              {activeCard ? (
                <div className="p-3 bg-card/90 backdrop-blur-sm rounded-xl space-y-1 w-[220px] rotate-1 ring-1 ring-muted/30">
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
