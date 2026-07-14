"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Eye, EyeOff } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { api } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "A senha deve conter no mínimo 6 caracteres"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const t = useTranslations("Auth");
  const router = useRouter();
  const pathname = usePathname();
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
        router.push(`/${locale}`);
      }
    } catch (err: any) {
      const responseError = err.response?.data;
      if (responseError?.message) {
        if (Array.isArray(responseError.message)) {
          setErrorMsg(responseError.message[0]);
        } else {
          setErrorMsg(responseError.message);
        }
      } else {
        setErrorMsg("Ocorreu um erro ao tentar realizar o login. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  const segments = pathname.split("/");
  const locale = segments[1] || "pt";

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-center items-center p-6">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo/Icon Area */}
        <div className="flex flex-col items-center space-y-4">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary text-primary-foreground font-bold text-xl">
            A
          </div>
          <div className="text-center space-y-1.5">
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
              <Label htmlFor="password">{t("password")}</Label>
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
                <span className="text-xs text-destructive font-medium">{errors.password.message}</span>
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
              <a
                href={`/${locale}/register`}
                className="text-primary font-semibold hover:underline"
              >
                {t("signUp")}
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
