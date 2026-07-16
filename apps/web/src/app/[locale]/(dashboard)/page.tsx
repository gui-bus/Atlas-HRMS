"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { useAuthStore } from "@/store/useAuthStore";

export default function DashboardPage() {
  const t = useTranslations("Dashboard");
  const { user } = useAuthStore();

  const renderRoleContent = () => {
    if (!user) return null;

    switch (user.role) {
      case "ADMIN":
        return (
          <div className="border rounded-lg p-6 space-y-2 bg-card text-card-foreground">
            <h2 className="text-lg font-bold">Painel de Administração</h2>
            <p className="text-muted-foreground text-sm">Conteúdo para o Administrador</p>
          </div>
        );
      case "HR":
        return (
          <div className="border rounded-lg p-6 space-y-2 bg-card text-card-foreground">
            <h2 className="text-lg font-bold">Painel de Recursos Humanos</h2>
            <p className="text-muted-foreground text-sm">Conteúdo para o Recursos Humanos</p>
          </div>
        );
      case "MANAGER":
        return (
          <div className="border rounded-lg p-6 space-y-2 bg-card text-card-foreground">
            <h2 className="text-lg font-bold">Painel do Gestor</h2>
            <p className="text-muted-foreground text-sm">Conteúdo para o Gestor</p>
          </div>
        );
      case "EMPLOYEE":
      default:
        return (
          <div className="border rounded-lg p-6 space-y-2 bg-card text-card-foreground">
            <h2 className="text-lg font-bold">Painel do Funcionário</h2>
            <p className="text-muted-foreground text-sm">Conteúdo para o Funcionário</p>
          </div>
        );
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="space-y-1.5">
        <h1 className="text-2xl font-bold tracking-tight">{t("welcome")}</h1>
        <p className="text-muted-foreground text-sm">
          O painel de controle está pronto. Configure a autenticação e as rotas da API para começar
          a carregar os dados.
        </p>
      </div>

      {/* Role-based conditional panel */}
      <div className="max-w-3xl">{renderRoleContent()}</div>
    </div>
  );
}
