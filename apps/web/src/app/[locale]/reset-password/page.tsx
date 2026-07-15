"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Eye, EyeOff } from "lucide-react";
import { api } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

const resetPasswordSchema = z.object({
  token: z.string().min(1, "O token é obrigatório"),
  password: z.string().min(6, "A senha deve conter no mínimo 6 caracteres"),
  confirmPassword: z.string().min(6, "Confirmação de senha é obrigatória"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const t = useTranslations("Auth");
  const router = useRouter();
  const pathname = usePathname();

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const response = await api.post("/auth/reset-password", {
        token: data.token,
        password: data.password,
      });
      setSuccessMsg(response.data.message || t("resetSuccess"));
      
      const segments = pathname.split("/");
      const locale = segments[1] || "pt";

      // Redirect back to login screen on success
      setTimeout(() => {
        router.push(`/${locale}/login`);
      }, 3000);
    } catch (err: any) {
      console.error("Erro ao resetar senha:", err);
      const responseError = err.response?.data;
      if (responseError?.message) {
        setErrorMsg(Array.isArray(responseError.message) ? responseError.message[0] : responseError.message);
      } else {
        setErrorMsg("Ocorreu um erro ao processar sua solicitação.");
      }
    } finally {
      setLoading(false);
    }
  };

  const segments = pathname.split("/");
  const locale = segments[1] || "pt";

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-center items-center p-6 relative">
      <div className="absolute top-4 right-4 z-50">
        <LanguageSwitcher />
      </div>

      <div className="w-full max-w-sm space-y-8">
        <div className="flex flex-col items-center space-y-4">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary text-primary-foreground font-bold text-xl">
            A
          </div>
          <div className="text-center space-y-1.5">
            <h1 className="text-2xl font-bold tracking-tight">{t("resetPasswordTitle")}</h1>
            <p className="text-sm text-muted-foreground">{t("resetPasswordDesc")}</p>
          </div>
        </div>

        <div className="space-y-6">
          {errorMsg && (
            <div className="bg-destructive/15 border border-destructive/30 text-destructive text-sm px-4 py-3 rounded-lg text-center font-medium">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="bg-primary/15 border border-primary/30 text-primary text-sm px-4 py-3 rounded-lg text-center font-medium">
              {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="token">Token</Label>
              <Input
                id="token"
                type="text"
                placeholder={t("tokenPlaceholder")}
                {...register("token")}
                className={errors.token ? "border-destructive focus-visible:ring-destructive" : ""}
              />
              {errors.token && (
                <span className="text-xs text-destructive font-medium">{errors.token.message}</span>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{t("newPasswordPlaceholder")}</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  {...register("password")}
                  className={`pr-10 ${
                    errors.password ? "border-destructive focus-visible:ring-destructive" : ""
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <span className="text-xs text-destructive font-medium">
                  {errors.password.message}
                </span>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{t("confirmNewPasswordPlaceholder")}</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                {...register("confirmPassword")}
                className={errors.confirmPassword ? "border-destructive focus-visible:ring-destructive" : ""}
              />
              {errors.confirmPassword && (
                <span className="text-xs text-destructive font-medium">{errors.confirmPassword.message}</span>
              )}
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 rounded-full border-2 border-primary-foreground/20 border-t-primary-foreground animate-spin" />
                  <span>{t("resetting")}...</span>
                </div>
              ) : (
                <span>{t("resetPasswordTitle")}</span>
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
