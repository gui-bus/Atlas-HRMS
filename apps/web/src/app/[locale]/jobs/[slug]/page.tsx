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
} from "@phosphor-icons/react";
import { useParams, useRouter } from "next/navigation";
import { recruitmentService } from "@/services/recruitment.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function PublicJobDetailPage() {
  const router = useRouter();
  const { locale, slug } = useParams();

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
      setMessage({ text: "Candidatura enviada com sucesso! Boa sorte!", type: "success" });
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || "Erro ao enviar candidatura. Tente novamente.";
      setMessage({ text: msg, type: "error" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || !phone || !resumeFile) {
      setMessage({
        text: "Por favor, preencha todos os campos obrigatórios e anexe o currículo.",
        type: "error",
      });
      return;
    }
    applyMutation.mutate();
  };

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
        <p className="text-muted-foreground">Vaga não encontrada ou encerrada.</p>
        <Button onClick={() => router.push(`/${locale}/jobs`)} variant="outline">
          Voltar para Vagas
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
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
      </header>

      {/* Main Details Panel */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 md:px-12 py-10 grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left 2 Columns: Description and Info */}
        <div className="lg:col-span-2 space-y-6">
          <Button
            variant="ghost"
            onClick={() => router.push(`/${locale}/jobs`)}
            className="p-0 hover:bg-transparent text-muted-foreground hover:text-foreground text-xs font-semibold flex items-center gap-1.5 border-0"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para vagas
          </Button>

          <div className="space-y-3">
            <span className="text-[10px] font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full uppercase tracking-wider w-fit block">
              {job.department?.name || "Geral"}
            </span>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight leading-tight">
              {job.title}
            </h1>
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

          <div className="border-t border-muted/20 pt-6 space-y-6">
            <div className="space-y-2">
              <h3 className="text-lg font-bold">Descrição da Vaga</h3>
              <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap">
                {job.description}
              </p>
            </div>

            {job.requirements && (
              <div className="space-y-2">
                <h3 className="text-lg font-bold">Requisitos</h3>
                <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap">
                  {job.requirements}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Column: Apply Form */}
        <div className="bg-muted/10 p-6 md:p-8 rounded-3xl h-fit space-y-6">
          <h2 className="text-xl font-bold tracking-tight">Candidatar-se</h2>
          <p className="text-xs text-muted-foreground font-semibold">
            Preencha seus dados de contato e envie seu currículo em PDF.
          </p>

          {applyMutation.isSuccess ? (
            <div className="space-y-4 text-center py-6">
              <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto" />
              <p className="text-sm font-bold text-emerald-500">Candidatura enviada com sucesso!</p>
              <p className="text-xs text-muted-foreground">
                Em breve nossa equipe entrará em contato.
              </p>
              <Button
                onClick={() => router.push(`/${locale}/jobs`)}
                className="w-full rounded-2xl text-xs font-bold mt-4 border-0 bg-primary/10 text-primary hover:bg-primary/20"
              >
                Ver outras vagas
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

              <div className="space-y-2">
                <Label htmlFor="firstName">
                  Nome <span className="text-destructive">*</span>
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
                  Sobrenome <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="h-10 rounded-2xl bg-background border-0 focus-visible:ring-1"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">
                  E-mail <span className="text-destructive">*</span>
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
                  Telefone <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="h-10 rounded-2xl bg-background border-0 focus-visible:ring-1"
                  placeholder="(00) 00000-0000"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="linkedinUrl">LinkedIn (URL)</Label>
                <Input
                  id="linkedinUrl"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  className="h-10 rounded-2xl bg-background border-0 focus-visible:ring-1"
                  placeholder="https://linkedin.com/in/..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="resume">
                  Currículo (PDF) <span className="text-destructive">*</span>
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
                    {resumeFile ? resumeFile.name : "Clique para anexar seu PDF"}
                  </span>
                </div>
              </div>

              <Button
                type="submit"
                disabled={applyMutation.isPending}
                className="w-full h-11 rounded-2xl font-bold text-xs bg-primary text-primary-foreground hover:bg-primary/95 border-0 mt-4"
              >
                {applyMutation.isPending ? "Enviando Candidatura..." : "Enviar Candidatura"}
              </Button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
