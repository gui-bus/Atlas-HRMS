"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  MagnifyingGlass,
  MapPin,
  Briefcase,
  Calendar,
  Building2,
  CaretRight,
  CircleNotch,
} from "@phosphor-icons/react";
import { useParams, useRouter } from "next/navigation";
import { recruitmentService, Recruitment } from "@/services/recruitment.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function PublicJobsPage() {
  const router = useRouter();
  const { locale } = useParams();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: response, isLoading } = useQuery({
    queryKey: ["public-jobs"],
    queryFn: () => recruitmentService.getRecruitments(),
  });

  const jobs = response?.data || [];

  const getSeniorityLabel = (seniority: string) => {
    const map = {
      JUNIOR: "Júnior",
      MID: "Pleno",
      SENIOR: "Sênior",
      LEAD: "Lead",
      EXECUTIVE: "Diretoria",
    };
    return map[seniority] || seniority;
  };

  const getWorkModelLabel = (model: string) => {
    const map = {
      REMOTE: "Remoto",
      HYBRID: "Híbrido",
      ONSITE: "Presencial",
    };
    return map[model] || model;
  };

  const filteredJobs = jobs.filter((job) => {
    if (job.status !== "OPEN") return false;
    const titleMatch = job.title.toLowerCase().includes(searchTerm.toLowerCase());
    const deptMatch =
      job.department?.name.toLowerCase().includes(searchTerm.toLowerCase()) || false;
    return titleMatch || deptMatch;
  });

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Public Header */}
      <header className="border-b border-muted/20 py-4 px-6 md:px-12 flex justify-between items-center bg-card/10 backdrop-blur-md sticky top-0 z-50">
        <div
          className="flex items-center space-x-3 cursor-pointer"
          onClick={() => router.push(`/${locale}/jobs`)}
        >
          <div className="h-9 w-9 bg-primary rounded-xl flex items-center justify-center text-primary-foreground font-black text-lg">
            A
          </div>
          <span className="font-bold tracking-tight text-lg">Atlas Carreiras</span>
        </div>

        <Button
          variant="outline"
          onClick={() => router.push(`/${locale}/login`)}
          className="rounded-2xl border-0 bg-muted/40 hover:bg-muted/65 text-xs font-bold"
        >
          Área do Colaborador
        </Button>
      </header>

      {/* Hero Banner */}
      <section className="py-16 px-6 md:px-12 text-center max-w-4xl mx-auto space-y-4">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
          Trabalhe no <span className="text-primary">Atlas HRMS</span>
        </h1>
        <p className="text-muted-foreground text-base max-w-2xl mx-auto">
          Encontre a vaga ideal para o seu perfil e venha fazer parte de uma equipe focada em
          inovação e pessoas.
        </p>
      </section>

      {/* MagnifyingGlass and Jobs List */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-6 md:px-12 pb-16 space-y-6">
        <div className="relative w-full">
          <MagnifyingGlass className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Pesquisar vagas por título ou departamento..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-11 rounded-2xl bg-muted/25 border-0 focus-visible:ring-1"
          />
        </div>

        <div className="space-y-4">
          {isLoading ? (
            <div className="py-12 flex items-center justify-center">
              <CircleNotch className="h-7 w-7 animate-spin text-muted-foreground" />
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              Nenhuma vaga aberta encontrada neste momento.
            </div>
          ) : (
            filteredJobs.map((job) => (
              <div
                key={job.id}
                onClick={() => router.push(`/${locale}/jobs/${job.slug}`)}
                className="group bg-muted/10 p-6 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4 border-0 hover:bg-muted/15 transition-all cursor-pointer select-none"
              >
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full uppercase tracking-wider">
                    {job.department?.name || "Geral"}
                  </span>
                  <h2 className="text-xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
                    {job.title}
                  </h2>
                  <div className="flex flex-wrap gap-4 text-xs text-muted-foreground font-semibold">
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

                <div className="flex items-center gap-2 text-primary font-bold text-xs group-hover:translate-x-1 transition-transform">
                  Ver Detalhes
                  <CaretRight className="w-4 h-4" />
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
