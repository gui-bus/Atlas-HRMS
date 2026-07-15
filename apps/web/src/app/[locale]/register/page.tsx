"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Check, X, Eye, EyeOff } from "lucide-react";
import { api } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

const registerSchema = z
  .object({
    email: z.string().email("E-mail inválido"),
    password: z
      .string()
      .min(8, "A senha deve conter no mínimo 8 caracteres")
      .regex(/[a-z]/, "A senha deve conter pelo menos uma letra minúscula")
      .regex(/[A-Z]/, "A senha deve conter pelo menos uma letra maiúscula")
      .regex(/[0-9]/, "A senha deve conter pelo menos um número")
      .regex(/[!@#$%^&*(),.?":{}|<>]/, "A senha deve conter pelo menos um caractere especial"),
    confirmPassword: z.string().min(1, "Confirmação de senha é obrigatória"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

interface RuleItem {
  id: string;
  label: string;
  test: (val: string) => boolean;
}

const passwordRules: RuleItem[] = [
  { id: "length", label: "Mínimo de 8 caracteres", test: (val) => val.length >= 8 },
  { id: "lowercase", label: "Pelo menos uma letra minúscula", test: (val) => /[a-z]/.test(val) },
  { id: "uppercase", label: "Pelo menos uma letra maiúscula", test: (val) => /[A-Z]/.test(val) },
  { id: "number", label: "Pelo menos um número", test: (val) => /[0-9]/.test(val) },
  {
    id: "special",
    label: "Pelo menos um caractere especial (!@#$%^&*)",
    test: (val) => /[!@#$%^&*(),.?":{}|<>]/.test(val),
  },
];

export default function RegisterPage() {
  const t = useTranslations("Auth");
  const router = useRouter();
  const pathname = usePathname();

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const passwordValue = watch("password", "");

  useEffect(() => {
    let score = 0;
    if (!passwordValue) {
      setPasswordStrength(0);
      return;
    }
    passwordRules.forEach((rule) => {
      if (rule.test(passwordValue)) {
        score += 1;
      }
    });
    setPasswordStrength(score);
  }, [passwordValue]);

  const onSubmit = async (data: RegisterFormData) => {
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await api.post("/auth/register", data);
      setSuccessMsg("Conta criada com sucesso! Redirecionando para o login...");
      setTimeout(() => {
        const segments = pathname.split("/");
        const locale = segments[1] || "pt";
        router.push(`/${locale}/login`);
      }, 2500);
    } catch (err: any) {
      const responseError = err.response?.data;
      if (responseError?.message) {
        if (Array.isArray(responseError.message)) {
          setErrorMsg(responseError.message[0]);
        } else {
          setErrorMsg(responseError.message);
        }
      } else {
        setErrorMsg("Ocorreu um erro ao tentar criar sua conta. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  const getStrengthBarColor = () => {
    if (passwordStrength <= 2) return "bg-destructive";
    if (passwordStrength <= 4) return "bg-amber-500 animate-pulse";
    return "bg-primary";
  };

  const getStrengthText = () => {
    if (passwordStrength === 0) return "";
    if (passwordStrength <= 2) return "Fraca";
    if (passwordStrength <= 4) return "Média";
    return "Forte";
  };

  const segments = pathname.split("/");
  const locale = segments[1] || "pt";

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-center items-center p-6 relative">
      {/* Dynamic Selector Placement in Header Top Corner */}
      <div className="absolute top-4 right-4 z-50">
        <LanguageSwitcher />
      </div>

      <div className="w-full max-w-sm space-y-8 animate-fade-in">
        {/* Logo/Icon Area */}
        <div className="flex flex-col items-center space-y-4">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary text-primary-foreground font-bold text-xl">
            A
          </div>
          <div className="text-center space-y-1.5">
            <h1 className="text-2xl font-bold tracking-tight">{t("createAccount")}</h1>
            <p className="text-sm text-muted-foreground">{t("fillRegisterDetails")}</p>
          </div>
        </div>

        {/* Minimal Form body */}
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

              {/* Password Strength Indicator */}
              {passwordValue && (
                <div className="space-y-2 pt-1">
                  <div className="flex justify-between items-center text-xs font-medium">
                    <span className="text-muted-foreground">Força da Senha:</span>
                    <span
                      className={
                        passwordStrength <= 2
                          ? "text-destructive"
                          : passwordStrength <= 4
                            ? "text-amber-500"
                            : "text-primary"
                      }
                    >
                      {getStrengthText()}
                    </span>
                  </div>
                  <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getStrengthBarColor()} transition-all duration-300`}
                      style={{ width: `${(passwordStrength / 5) * 100}%` }}
                    />
                  </div>

                  {/* Requirement Checklist */}
                  <div className="space-y-1.5 pt-1">
                    {passwordRules.map((rule) => {
                      const passed = rule.test(passwordValue);
                      return (
                        <div key={rule.id} className="flex items-center space-x-2 text-xs">
                          {passed ? (
                            <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                          ) : (
                            <X className="w-3.5 h-3.5 text-muted-foreground shrink-0 opacity-55" />
                          )}
                          <span className={passed ? "text-foreground" : "text-muted-foreground"}>
                            {rule.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {errors.password && (
                <span className="text-xs text-destructive font-medium">
                  {errors.password.message}
                </span>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{t("confirmPassword")}</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  {...register("confirmPassword")}
                  className={`pr-10 ${
                    errors.confirmPassword
                      ? "border-destructive focus-visible:ring-destructive"
                      : ""
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <span className="text-xs text-destructive font-medium">
                  {errors.confirmPassword.message}
                </span>
              )}
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 rounded-full border-2 border-primary-foreground/20 border-t-primary-foreground animate-spin" />
                  <span>{t("registering")}...</span>
                </div>
              ) : (
                <span>{t("signUp")}</span>
              )}
            </Button>
          </form>

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              {t("alreadyHaveAccount")}{" "}
              <Link
                href={`/${locale}/login`}
                className="text-primary font-semibold hover:underline"
              >
                {t("signIn")}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
