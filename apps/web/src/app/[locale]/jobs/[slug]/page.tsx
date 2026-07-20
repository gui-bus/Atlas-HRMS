"use client";

import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  ArrowLeft,
  Briefcase,
  MapPin,
  CircleNotch,
  CheckCircle,
  FileArrowUp,
  Buildings,
  GraduationCap,
} from "@phosphor-icons/react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { recruitmentService } from "@/services/recruitment.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function PublicJobDetailPage() {
  const router = useRouter();
  const { locale, slug } = useParams();
  const t = useTranslations("PublicJobs");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const { data: job, isLoading } = useQuery({
    queryKey: ["public-job", slug],
    queryFn: () => recruitmentService.getPublicJobBySlug(slug as string),
    enabled: !!slug,
  });

  const applyMutation = useMutation({
    mutationFn: () => {
      const formData = new FormData();
      formData.append("firstName", firstName);
      formData.append("lastName", lastName);
      formData.append("email", email);
      formData.append("phone", phone);
      if (linkedinUrl) formData.append("linkedinUrl", linkedinUrl);
      if (githubUrl) formData.append("githubUrl", githubUrl);
      if (coverLetter) formData.append("coverLetter", coverLetter);
      if (resumeFile) formData.append("resume", resumeFile);

      return recruitmentService.applyToJob(slug as string, formData);
    },
    onSuccess: () => {
      setMessage({ text: t("successMessage"), type: "success" });
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || t("errorGeneric");
      setMessage({ text: msg, type: "error" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || !phone || !resumeFile) {
      setMessage({
        text: t("errorFillRequired"),
        type: "error",
      });
      return;
    }
    applyMutation.mutate();
  };

  const getSeniorityLabel = (seniority: string) => {
    const map: Record<string, string> = {
      JUNIOR: t("allSeniorities").includes("Seniorities") ? "Junior" : "Júnior",
      MID: t("allSeniorities").includes("Seniorities") ? "Mid" : "Pleno",
      SENIOR: t("allSeniorities").includes("Seniorities") ? "Senior" : "Sênior",
      LEAD: "Lead",
      EXECUTIVE: t("allSeniorities").includes("Seniorities") ? "Executive" : "Diretoria",
    };
    return map[seniority] || seniority;
  };

  const getWorkModelLabel = (model: string) => {
    const map: Record<string, string> = {
      REMOTE: t("allWorkModels").includes("Models") ? "Remote" : "Remoto",
      HYBRID: t("allWorkModels").includes("Models") ? "Hybrid" : "Híbrido",
      ONSITE: t("allWorkModels").includes("Models") ? "On-site" : "Presencial",
    };
    return map[model] || model;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <CircleNotch className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground space-y-4">
        <p className="text-muted-foreground text-sm">{t("notFound")}</p>
        <Button onClick={() => router.push(`/${locale}/jobs`)} variant="outline">
          {t("backToList")}
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col w-full">
      
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 md:px-12 py-10 grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        <div className="lg:col-span-7 space-y-8 animate-fade-in">
          <Button
            variant="ghost"
            onClick={() => router.push(`/${locale}/jobs`)}
            className="p-0 hover:bg-transparent text-muted-foreground hover:text-foreground text-xs font-semibold flex items-center gap-1.5 border-0"
          >
            <ArrowLeft className="w-4 h-4" />
            {t("backToList")}
          </Button>

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[10px] font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full uppercase tracking-wider w-fit">
              <Buildings className="h-3 w-3" />
              {job.department?.name || "Geral"}
            </div>
            
            <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
              {job.title}
            </h1>

            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground font-semibold">
              <span className="flex items-center gap-1.5 bg-muted/15 px-3 py-1.5 rounded-2xl">
                <Briefcase className="w-3.5 h-3.5 text-primary" />
                {getSeniorityLabel(job.seniority)} • {job.employmentType}
              </span>
              <span className="flex items-center gap-1.5 bg-muted/15 px-3 py-1.5 rounded-2xl">
                <MapPin className="w-3.5 h-3.5 text-primary" />
                {getWorkModelLabel(job.workModel)}
              </span>
            </div>
          </div>

          <div className="space-y-8 pt-6 border-t border-muted/10">
            <div className="space-y-3">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-primary" />
                {t("jobDescription")}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap">
                {job.description}
              </p>
            </div>

            {job.requirements && (
              <div className="space-y-3">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-primary" />
                  {t("requirements")}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap">
                  {job.requirements}
                </p>
              </div>
            )}
          </div>
        </div>

        
        <div className="lg:col-span-5 bg-muted/10 p-6 md:p-8 rounded-3xl h-fit space-y-6 animate-fade-in">
          <h2 className="text-xl font-bold tracking-tight">{t("applyTitle")}</h2>
          <p className="text-xs text-muted-foreground font-semibold">
            {t("applySubTitle")}
          </p>

          {applyMutation.isSuccess ? (
            <div className="space-y-4 text-center py-6">
              <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto" />
              <p className="text-sm font-bold text-emerald-500">{t("successTitle")}</p>
              <p className="text-xs text-muted-foreground">
                {t("successDesc")}
              </p>
              <Button
                onClick={() => router.push(`/${locale}/jobs`)}
                className="w-full rounded-2xl text-xs font-bold mt-4 border-0 bg-primary/10 text-primary hover:bg-primary/20"
              >
                {t("viewOtherJobs")}
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {message && (
                <div
                  className={`p-3 rounded-2xl text-xs font-semibold text-center border-0 ${
                    message.type === "success"
                      ? "bg-emerald-500/10 text-emerald-500"
                      : "bg-destructive/10 text-destructive"
                  }`}
                >
                  {message.text}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">
                    {t("firstName")} <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="h-10 rounded-2xl bg-background border-0 focus-visible:ring-1"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">
                    {t("lastName")} <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="h-10 rounded-2xl bg-background border-0 focus-visible:ring-1"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">
                  {t("email")} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-10 rounded-2xl bg-background border-0 focus-visible:ring-1"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">
                  {t("phone")} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="h-10 rounded-2xl bg-background border-0 focus-visible:ring-1"
                  placeholder={t("phonePlaceholder")}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="linkedinUrl">{t("linkedin")}</Label>
                  <Input
                    id="linkedinUrl"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    className="h-10 rounded-2xl bg-background border-0 focus-visible:ring-1"
                    placeholder={t("linkedinPlaceholder")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="githubUrl">{t("github")}</Label>
                  <Input
                    id="githubUrl"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    className="h-10 rounded-2xl bg-background border-0 focus-visible:ring-1"
                    placeholder={t("githubPlaceholder")}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="coverLetter">{t("coverLetter")}</Label>
                <textarea
                  id="coverLetter"
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  className="flex min-h-[80px] w-full rounded-2xl border-0 bg-background px-3 py-2 text-sm outline-none focus-visible:ring-1 text-foreground"
                  placeholder={t("coverLetterPlaceholder")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="resume">
                  {t("resumePdf")} <span className="text-destructive">*</span>
                </Label>
                <div className="relative border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 transition-colors rounded-2xl p-4 flex flex-col items-center justify-center gap-1.5 cursor-pointer text-center bg-background">
                  <input
                    id="resume"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        setResumeFile(e.target.files[0]);
                      }
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    required
                  />
                  <FileArrowUp className="w-5 h-5 text-muted-foreground/75" />
                  <span className="text-xs font-semibold text-muted-foreground/90">
                    {resumeFile ? resumeFile.name : t("resumeAttach")}
                  </span>
                </div>
              </div>

              <Button
                type="submit"
                disabled={applyMutation.isPending}
                className="w-full h-11 rounded-2xl font-bold text-xs bg-primary text-primary-foreground hover:bg-primary/95 border-0 mt-4"
              >
                {applyMutation.isPending ? t("submitting") : t("submit")}
              </Button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
