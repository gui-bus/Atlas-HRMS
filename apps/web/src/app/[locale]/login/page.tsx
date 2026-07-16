"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Eye, EyeOff } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { api } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { useTheme } from "@/providers/ThemeProvider";
import { useEffect } from "react";

const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "A senha deve conter no mínimo 6 caracteres"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const t = useTranslations("Auth");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    setErrorMsg(null);

    try {
      const response = await api.post("/auth/login", data);
      const { user, accessToken } = response.data;

      if (user && accessToken) {
        setAuth(user, accessToken);
        const segments = pathname.split("/");
        const locale = segments[1] || "pt";
        const redirect = searchParams.get("redirect");

        if (redirect) {
          router.push(redirect);
        } else {
          router.push(`/${locale}`);
        }
      }
    } catch (err: any) {
      console.error("Erro ao realizar login:", err);
      const responseError = err.response?.data;
      if (responseError?.message) {
        if (Array.isArray(responseError.message)) {
          setErrorMsg(responseError.message[0]);
        } else {
          setErrorMsg(responseError.message);
        }
      } else if (err.request && !err.response) {
        setErrorMsg(
          "Não foi possível estabelecer conexão com o servidor. Tente novamente mais tarde.",
        );
      } else {
        setErrorMsg("Ocorreu um erro ao tentar realizar o login. Tente novamente.");
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
            <h1 className="text-2xl font-bold tracking-tight">{t("welcomeBack")}</h1>
            <p className="text-sm text-muted-foreground">{t("enterDetails")}</p>
          </div>
        </div>

        {/* Minimal Form body */}
        <div className="space-y-6">
          {errorMsg && (
            <div className="bg-destructive/15 border border-destructive/30 text-destructive text-sm px-4 py-3 rounded-lg text-center font-medium">
              {errorMsg}
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

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="password">{t("password")}</Label>
                <Link
                  href={`/${locale}/forgot-password`}
                  className="text-xs text-primary hover:underline font-medium"
                >
                  {t("forgotPasswordLink")}
                </Link>
              </div>
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

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 rounded-full border-2 border-primary-foreground/20 border-t-primary-foreground animate-spin" />
                  <span>{t("signingIn")}...</span>
                </div>
              ) : (
                <span>{t("signIn")}</span>
              )}
            </Button>
          </form>

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              {t("noAccount")}{" "}
              <Link
                href={`/${locale}/register`}
                className="text-primary font-semibold hover:underline"
              >
                {t("signUp")}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
