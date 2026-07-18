"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  CaretRight,
  Briefcase,
  UsersThree,
  CalendarCheck,
  GithubLogo,
  LinkedinLogo,
  Globe,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/header/logo";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";

export default function LandingPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params?.locale || "pt";
  const t = useTranslations("LandingPage");

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between">
      <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-12 h-20 flex flex-col md:flex-row items-center justify-center md:justify-between border-b border-muted/10 py-20 md:py-0 gap-5">
        <Logo locale={locale as string} size="sm" />

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-0.5 sm:gap-1">
            <LanguageSwitcher />
            <ThemeSwitcher />
          </div>

          <Button
            variant="outline"
            className="rounded-2xl border-0 bg-muted/40 hover:bg-muted/65 text-[10px] sm:text-xs font-semibold px-3 sm:px-4 py-1.5 sm:py-2 h-auto"
            onClick={() => router.push(`/${locale}/login`)}
          >
            {t("employeePortal")}
          </Button>
        </div>
      </header>

      <main className="flex-1 flex flex-col justify-center items-center px-6 md:px-12 py-16 animate-fade-in max-w-5xl mx-auto space-y-12 w-full">
        <div className="flex justify-center py-4 hidden md:block">
          <Logo locale={locale as string} size="lg" />
        </div>

        <div className="text-center space-y-4 max-w-2xl">
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-muted-foreground">
            {t("title")}
          </h2>
          <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
            {t("subtitle")}
          </p>
        </div>

        {/* Primary CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
          <Button
            size="lg"
            className="h-12 w-full sm:w-auto px-8 rounded-2xl text-sm font-bold gap-2"
            onClick={() => router.push(`/${locale}/login`)}
          >
            {t("ctaAccess")}
            <CaretRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="h-12 w-full sm:w-auto px-8 rounded-2xl text-sm font-semibold border-0 bg-muted/40 hover:bg-muted/65"
            onClick={() => router.push(`/${locale}/jobs`)}
          >
            {t("ctaJobs")}
          </Button>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full pt-10 border-t border-muted/10">
          <div className="bg-muted/5 p-6 rounded-3xl space-y-3">
            <div className="h-10 w-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
              <UsersThree className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-base">{t("features.teamsTitle")}</h3>
            <p className="text-muted-foreground text-xs leading-relaxed">
              {t("features.teamsDesc")}
            </p>
          </div>

          <div className="bg-muted/5 p-6 rounded-3xl space-y-3">
            <div className="h-10 w-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
              <CalendarCheck className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-base">{t("features.timeTitle")}</h3>
            <p className="text-muted-foreground text-xs leading-relaxed">
              {t("features.timeDesc")}
            </p>
          </div>

          <div className="bg-muted/5 p-6 rounded-3xl space-y-3">
            <div className="h-10 w-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
              <Briefcase className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-base">{t("features.recruitmentTitle")}</h3>
            <p className="text-muted-foreground text-xs leading-relaxed">
              {t("features.recruitmentDesc")}
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-muted/10 bg-muted/5 py-8 mt-16">
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center sm:items-start gap-1">
            <div className="scale-75 origin-left">
              <Logo locale={locale as string} size="sm" />
            </div>
            <span className="text-[10px] text-muted-foreground font-medium">
              © {new Date().getFullYear()} Atlas HRMS. Todos os direitos reservados.
            </span>
          </div>

          <div className="flex items-center gap-4 text-muted-foreground">
            <a
              href="https://guibus.dev/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl hover:bg-muted/20 hover:text-foreground transition-colors flex items-center gap-1.5 text-xs font-semibold"
              title="Portfolio"
            >
              <Globe className="w-4 h-4" />
              <span className="hidden sm:inline">guibus.dev</span>
            </a>

            <a
              href="https://github.com/gui-bus"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl hover:bg-muted/20 hover:text-foreground transition-colors flex items-center gap-1.5 text-xs font-semibold"
              title="GitHub"
            >
              <GithubLogo className="w-4 h-4" />
              <span className="hidden sm:inline">GitHub</span>
            </a>

            <a
              href="https://www.linkedin.com/in/gui-bus/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl hover:bg-muted/20 hover:text-foreground transition-colors flex items-center gap-1.5 text-xs font-semibold"
              title="LinkedIn"
            >
              <LinkedinLogo className="w-4 h-4" />
              <span className="hidden sm:inline">LinkedIn</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
