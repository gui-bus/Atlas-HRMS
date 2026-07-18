"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  MagnifyingGlass,
  MapPin,
  Briefcase,
  CircleNotch,
  ArrowLeft,
  Funnel,
  Buildings,
} from "@phosphor-icons/react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { recruitmentService } from "@/services/recruitment.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/header/logo";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";

export default function PublicJobsPage() {
  const router = useRouter();
  const { locale } = useParams();
  const t = useTranslations("PublicJobs");
  const tRec = useTranslations("Recruitment");
  const [search, setSearch] = useState("");
  const [seniority, setSeniority] = useState("");
  const [workModel, setWorkModel] = useState("");
  const [employmentType, setEmploymentType] = useState("");

  const { data: response, isLoading } = useQuery({
    queryKey: ["public-jobs", { search, seniority, workModel, employmentType }],
    queryFn: () =>
      recruitmentService.getRecruitments({
        search: search || undefined,
        seniority: seniority || undefined,
        workModel: workModel || undefined,
        employmentType: employmentType || undefined,
        limit: 100,
      }),
  });

  const jobs = response?.data || [];

  const getSeniorityLabel = (sen: string) => {
    const map: Record<string, string> = {
      JUNIOR: t("allSeniorities").includes("Seniorities") ? "Junior" : "Júnior",
      MID: t("allSeniorities").includes("Seniorities") ? "Mid" : "Pleno",
      SENIOR: t("allSeniorities").includes("Seniorities") ? "Senior" : "Sênior",
      LEAD: "Lead",
      EXECUTIVE: t("allSeniorities").includes("Seniorities") ? "Executive" : "Diretoria",
    };
    return map[sen] || sen;
  };

  const getWorkModelLabel = (model: string) => {
    const map: Record<string, string> = {
      REMOTE: t("allWorkModels").includes("Models") ? "Remote" : "Remoto",
      HYBRID: t("allWorkModels").includes("Models") ? "Hybrid" : "Híbrido",
      ONSITE: t("allWorkModels").includes("Models") ? "On-site" : "Presencial",
    };
    return map[model] || model;
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col w-full">
      <main className="flex-1 w-full py-10 space-y-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-center md:justify-between gap-5">
          <Button
            variant="ghost"
            onClick={() => router.push(`/${locale}`)}
            className="p-0 hover:bg-transparent text-muted-foreground hover:text-foreground text-xs font-semibold flex items-center gap-1.5 border-0 shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">{t("backToHome")}</span>
            <span className="sm:hidden">{t("backToHomeMobile")}</span>
          </Button>

          <Logo locale={locale as string} size="sm" />

          <div className="flex items-center gap-0.5 sm:gap-1">
            <LanguageSwitcher />
            <ThemeSwitcher />
          </div>

          <span className="text-[10px] sm:text-xs font-bold text-muted-foreground tracking-widest uppercase text-right shrink-0">
            {t("portalTitle")}
          </span>
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-4 bg-muted/10 p-5 rounded-3xl">
          <div className="relative md:col-span-1">
            <MagnifyingGlass className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t("searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-10 rounded-2xl bg-background border-0 focus-visible:ring-1"
            />
          </div>

          <div>
            <select
              value={seniority}
              onChange={(e) => setSeniority(e.target.value)}
              className="flex h-10 w-full rounded-2xl border border-transparent bg-background px-3 text-sm outline-none cursor-pointer text-foreground focus-visible:ring-1"
            >
              <option value="">{t("allSeniorities")}</option>
              <option value="JUNIOR">{tRec("seniority.JUNIOR")}</option>
              <option value="MID">{tRec("seniority.MID")}</option>
              <option value="SENIOR">{tRec("seniority.SENIOR")}</option>
              <option value="LEAD">{tRec("seniority.LEAD")}</option>
              <option value="EXECUTIVE">{tRec("seniority.EXECUTIVE")}</option>
            </select>
          </div>

          <div>
            <select
              value={workModel}
              onChange={(e) => setWorkModel(e.target.value)}
              className="flex h-10 w-full rounded-2xl border border-transparent bg-background px-3 text-sm outline-none cursor-pointer text-foreground focus-visible:ring-1"
            >
              <option value="">{t("allWorkModels")}</option>
              <option value="REMOTE">{tRec("workModelOptions.REMOTE")}</option>
              <option value="HYBRID">{tRec("workModelOptions.HYBRID")}</option>
              <option value="ONSITE">{tRec("workModelOptions.ONSITE")}</option>
            </select>
          </div>

          <div>
            <select
              value={employmentType}
              onChange={(e) => setEmploymentType(e.target.value)}
              className="flex h-10 w-full rounded-2xl border border-transparent bg-background px-3 text-sm outline-none cursor-pointer text-foreground focus-visible:ring-1"
            >
              <option value="">{t("allTypes")}</option>
              <option value="CLT">{tRec("employmentTypes.CLT")}</option>
              <option value="PJ">{tRec("employmentTypes.PJ")}</option>
              <option value="CONTRACTOR">{tRec("employmentTypes.CONTRACTOR")}</option>
              <option value="INTERNSHIP">{tRec("employmentTypes.INTERNSHIP")}</option>
              <option value="TEMPORARY">{tRec("employmentTypes.TEMPORARY")}</option>
            </select>
          </div>
        </div>

        <div className="max-w-7xl mx-auto w-full">
          {isLoading ? (
            <div className="py-24 flex items-center justify-center">
              <CircleNotch className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : jobs.length === 0 ? (
            <div className="py-24 text-center text-sm text-muted-foreground bg-muted/5 rounded-3xl">
              {t("empty")}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  onClick={() => router.push(`/${locale}/jobs/${job.slug}`)}
                  className="group bg-muted/10 p-6 rounded-3xl flex flex-col justify-between gap-6 border-0 hover:bg-muted/15 transition-all duration-200 cursor-pointer select-none"
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full uppercase tracking-wider w-fit">
                      <Buildings className="h-3 w-3" />
                      {job.department?.name || "Geral"}
                    </div>
                    <h2 className="text-xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors leading-snug">
                      {job.title}
                    </h2>
                  </div>

                  <div className="space-y-4 pt-2 border-t border-muted/10">
                    <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground font-semibold">
                      <span className="flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5 text-primary" />
                        {getSeniorityLabel(job.seniority)} • {job.employmentType}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-primary" />
                        {getWorkModelLabel(job.workModel)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
