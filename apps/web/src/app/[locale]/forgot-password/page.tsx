"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { api } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { useTheme } from "@/providers/ThemeProvider";
import { useEffect } from "react";

const forgotPasswordSchema = z.object({
  email: z.string().email("E-mail inválido"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const t = useTranslations("Auth");
  const router = useRouter();
  const pathname = usePathname();

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const [countdown, setCountdown] = useState<number | null>(null);

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const response = await api.post("/auth/forgot-password", data);
      setSuccessMsg(t("recoveryEmailSent"));
      setCountdown(5);

      const segments = pathname.split("/");
      const locale = segments[1] || "pt";

      // Setup live countdown logic
      let currentSeconds = 5;
      const interval = setInterval(() => {
        currentSeconds -= 1;
        setCountdown(currentSeconds);
        if (currentSeconds <= 0) {
          clearInterval(interval);
          router.push(`/${locale}/login`);
        }
      }, 1000);
    } catch (err: any) {
      console.error("Erro ao enviar email de recuperacao:", err);
      const responseError = err.response?.data;
      if (responseError?.message) {
        setErrorMsg(
          Array.isArray(responseError.message) ? responseError.message[0] : responseError.message,
        );
      } else {
        setErrorMsg("Ocorreu um erro ao processar sua solicitação.");
      }
    } finally {
      setLoading(false);
    }
  };

  const segments = pathname.split("/");
  const locale = segments[1] || "pt";

  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const logoSrc = mounted && theme === "light" ? "/utils/logo_black.svg" : "/utils/logo_white.svg";

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-center items-center p-6 relative">
      <div className="w-full max-w-sm space-y-8 animate-fade-in">
        <div className="flex flex-col items-center space-y-4">
          {mounted && (
            <img
              src={logoSrc}
              alt="Atlas HRMS Logo"
              className="h-20 w-auto object-contain transition-opacity duration-300"
            />
          )}
          <div className="flex items-center space-x-2 pt-1">
            <ThemeSwitcher />
            <LanguageSwitcher />
          </div>
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">{t("forgotPasswordTitle")}</h1>
            <p className="text-sm text-muted-foreground">{t("forgotPasswordDesc")}</p>
          </div>
        </div>

        <div className="space-y-6">
          {errorMsg && (
            <div className="bg-destructive/15 border border-destructive/30 text-destructive text-sm px-4 py-3 rounded-lg text-center font-medium">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="space-y-3 bg-primary/15 border border-primary/30 text-primary text-sm px-4 py-3 rounded-lg text-center font-medium">
              <p>{successMsg}</p>
              {countdown !== null && (
                <p className="text-xs text-muted-foreground">
                  {t("redirectingToLogin", { seconds: countdown })}
                </p>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t("emailAddress")}</Label>
              <Input
                id="email"
                type="email"
                placeholder="exemplo@atlas.com"
                {...register("email")}
                className={errors.email ? "border-destructive focus-visible:ring-destructive" : ""}
              />
              {errors.email && (
                <span className="text-xs text-destructive font-medium">{errors.email.message}</span>
              )}
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 rounded-full border-2 border-primary-foreground/20 border-t-primary-foreground animate-spin" />
                  <span>{t("sending")}...</span>
                </div>
              ) : (
                <span>{t("sendInstructions")}</span>
              )}
            </Button>
          </form>

          <div className="text-center">
            <Link
              href={`/${locale}/login`}
              className="text-sm text-primary font-semibold hover:underline"
            >
              {t("backToLogin")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
