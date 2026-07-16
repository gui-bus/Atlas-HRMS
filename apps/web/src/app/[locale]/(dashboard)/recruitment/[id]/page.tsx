"use client";

import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, ArrowRight, CheckCircle, XCircle } from "lucide-react";

import { recruitmentService, Application } from "@/services/recruitment.service";
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

export default function RecruitmentDetailsPage() {
  const t = useTranslations("Recruitment");
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = params?.id as string;
  const locale = params?.locale || "pt";

  // --- Fetch Vacancy ---
  const { data: vacancy, isLoading: loadingVacancy } = useQuery({
    queryKey: ["recruitment", id],
    queryFn: () => recruitmentService.getRecruitment(id),
    enabled: !!id,
  });

  // --- Fetch Applications ---
  const { data: applicationsResponse, isLoading: loadingApps } = useQuery({
    queryKey: ["applications", id],
    queryFn: () => recruitmentService.getApplications(id),
    enabled: !!id,
  });
  const applications = applicationsResponse?.data || [];

  // --- Mutations ---
  const updateStatusMutation = useMutation({
    mutationFn: (args: { applicationId: string; status: string }) => {
      return recruitmentService.updateApplicationStatus(args.applicationId, {
        status: args.status,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications", id] });
    },
  });

  const hireMutation = useMutation({
    mutationFn: (applicationId: string) => recruitmentService.hireCandidate(applicationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications", id] });
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
  });

  if (loadingVacancy || loadingApps) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!vacancy) {
    return <div className="p-8 text-center text-destructive font-medium">Vaga não encontrada.</div>;
  }

  const getNextStage = (current: string): string | null => {
    const idx = STAGES.indexOf(current as any);
    if (idx === -1 || idx >= STAGES.length - 2) return null; // Can't move forward from HIRED or REJECTED
    return STAGES[idx + 1];
  };

  const getPrevStage = (current: string): string | null => {
    const idx = STAGES.indexOf(current as any);
    if (idx <= 0 || current === "REJECTED") return null;
    return STAGES[idx - 1];
  };

  return (
    <div className="p-6 md:p-8 space-y-6 w-full">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.back()}
          className="rounded-2xl border-0 bg-muted/40 hover:bg-muted/65 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{vacancy.title}</h1>
          <p className="text-muted-foreground text-sm">
            {vacancy.department?.name || "Sem Departamento"} • Funil de Recrutamento
          </p>
        </div>
      </div>

      {/* Kanban Board Container */}
      <div className="overflow-x-auto w-full pb-4">
        <div className="flex gap-4 min-w-[1200px] h-[calc(100vh-250px)]">
          {STAGES.map((stage) => {
            const stageApps = applications.filter((app) => app.status === stage);

            return (
              <div
                key={stage}
                className="flex-1 flex flex-col rounded-2xl bg-muted/20 p-4 min-w-[200px]"
              >
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold text-sm uppercase text-foreground">
                    {t(`stages.${stage}` as any)}
                  </h3>
                  <span className="text-xs font-bold bg-muted/40 text-muted-foreground px-2 py-0.5 rounded-full">
                    {stageApps.length}
                  </span>
                </div>

                {/* Cards Container */}
                <div className="flex-1 space-y-3 overflow-y-auto pr-1">
                  {stageApps.map((app) => (
                    <div
                      key={app.id}
                      className="p-3 bg-muted/40 rounded-xl space-y-2 border border-transparent shadow-none"
                    >
                      <div className="space-y-0.5">
                        <p className="font-medium text-sm text-foreground">{app.candidateName}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {app.candidateEmail}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <a
                          href={app.resumeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline"
                        >
                          Currículo
                        </a>

                        {/* Stage Controls */}
                        <div className="flex items-center gap-1">
                          {getPrevStage(app.status) && (
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-6 w-6 rounded-md border-0 bg-muted/40 hover:bg-muted/65"
                              onClick={() =>
                                updateStatusMutation.mutate({
                                  applicationId: app.id,
                                  status: getPrevStage(app.status)!,
                                })
                              }
                            >
                              <ArrowLeft className="h-3 w-3" />
                            </Button>
                          )}

                          {app.status !== "HIRED" && app.status !== "REJECTED" && (
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-6 w-6 text-destructive hover:bg-destructive/10 rounded-md border-0"
                              onClick={() =>
                                updateStatusMutation.mutate({
                                  applicationId: app.id,
                                  status: "REJECTED",
                                })
                              }
                            >
                              <XCircle className="h-3 w-3" />
                            </Button>
                          )}

                          {getNextStage(app.status) && (
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-6 w-6 rounded-md border-0 bg-muted/40 hover:bg-muted/65"
                              onClick={() =>
                                updateStatusMutation.mutate({
                                  applicationId: app.id,
                                  status: getNextStage(app.status)!,
                                })
                              }
                            >
                              <ArrowRight className="h-3 w-3" />
                            </Button>
                          )}

                          {app.status === "OFFER" && (
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-6 w-6 text-emerald-500 hover:bg-emerald-500/10 rounded-md border-0"
                              onClick={() =>
                                updateStatusMutation.mutate({
                                  applicationId: app.id,
                                  status: "HIRED",
                                })
                              }
                            >
                              <CheckCircle className="h-3 w-3" />
                            </Button>
                          )}

                          {app.status === "HIRED" && (
                            <Button
                              size="sm"
                              className="h-6 text-[10px] px-2 rounded-md"
                              disabled={hireMutation.isPending}
                              onClick={() => hireMutation.mutate(app.id)}
                            >
                              Admitir
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
