"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useMutation } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Key, Eye, EyeSlash, CircleNotch, Check, X } from "@phosphor-icons/react";

import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormSectionHeader } from "@/components/form-section-header";
import { useToast } from "@/components/ui/toast";
import { FormHeader } from "@/components/form-header";
import { FormActions } from "@/components/form-actions";

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

export default function ChangePasswordPage() {
  const t = useTranslations("Profile");
  const router = useRouter();
  const params = useParams();
  const locale = params?.locale || "pt";
  const { toast } = useToast();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [passwordStrength, setPasswordStrength] = useState(0);

  useEffect(() => {
    let score = 0;
    if (!newPassword) {
      setPasswordStrength(0);
      return;
    }
    passwordRules.forEach((rule) => {
      if (rule.test(newPassword)) {
        score += 1;
      }
    });
    setPasswordStrength(score);
  }, [newPassword]);

  const changePasswordMutation = useMutation({
    mutationFn: async () => {
      return api.put("/users/change-password", {
        currentPassword,
        newPassword,
        confirmNewPassword,
      });
    },
    onSuccess: () => {
      toast(t("passwordSuccess"), "success");
      router.push(`/${locale}/profile`);
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || "Erro ao alterar senha.";
      toast(msg, "error");
    },
  });

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      toast("A confirmação da nova senha não confere", "error");
      return;
    }
    const allPassed = passwordRules.every((rule) => rule.test(newPassword));
    if (!allPassed) {
      toast("A nova senha não atende aos requisitos mínimos de segurança", "error");
      return;
    }
    changePasswordMutation.mutate();
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

  return (
    <div className="p-6 md:p-8 space-y-6 w-full animate-fade-in">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.back()}
          className="rounded-2xl border-0 bg-muted/40 hover:bg-muted/65 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <FormHeader
          title={t("changePassword")}
          subTitle="Altere a credencial de segurança da sua conta corporativa."
          requiredNotice={true}
        />
      </div>

      <form onSubmit={handlePasswordSubmit} className="space-y-8 w-full">
        <div className="space-y-4">
          <FormSectionHeader
            title="Alterar Senha"
            description="Preencha os campos abaixo para atualizar suas credenciais."
            icon={Key}
          />

          <div className="space-y-4 w-full">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">{t("currentPassword")}</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="h-10 rounded-2xl bg-muted/20 border-0 focus-visible:ring-1 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/80 hover:text-foreground"
                >
                  {showCurrentPassword ? (
                    <EyeSlash className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">{t("newPassword")}</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="h-10 rounded-2xl bg-muted/20 border-0 focus-visible:ring-1 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/80 hover:text-foreground"
                >
                  {showNewPassword ? <EyeSlash className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password strength meter */}
              {newPassword && (
                <div className="space-y-2 pt-1">
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-muted-foreground">Força da Senha</span>
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
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden flex gap-1">
                    <div
                      className={`h-full transition-all duration-300 ${getStrengthBarColor()}`}
                      style={{ width: `${(passwordStrength / 5) * 100}%` }}
                    />
                  </div>

                  {/* Rules Check List */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1.5 pt-1">
                    {passwordRules.map((rule) => {
                      const passed = rule.test(newPassword);
                      return (
                        <div key={rule.id} className="flex items-center space-x-2 text-xs">
                          {passed ? (
                            <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                          ) : (
                            <X className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0" />
                          )}
                          <span
                            className={
                              passed ? "text-foreground font-medium" : "text-muted-foreground"
                            }
                          >
                            {rule.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmNewPassword">{t("confirmNewPassword")}</Label>
              <div className="relative">
                <Input
                  id="confirmNewPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className="h-10 rounded-2xl bg-muted/20 border-0 focus-visible:ring-1 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/80 hover:text-foreground"
                >
                  {showConfirmPassword ? (
                    <EyeSlash className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-muted/20">
          <FormActions
            cancelText={t("form.cancel")}
            submitText={t("changePassword")}
            isSubmitting={changePasswordMutation.isPending}
          />
        </div>
      </form>
    </div>
  );
}
