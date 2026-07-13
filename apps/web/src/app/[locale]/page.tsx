"use client";

import { useTranslations } from "next-intl";
import { LayoutDashboard } from "lucide-react";

export default function DashboardPage() {
  const t = useTranslations("Dashboard");
  const common = useTranslations("Common");

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-800 bg-slate-900/50 backdrop-blur-md flex flex-col p-6 space-y-6">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">
            A
          </div>
          <span className="font-semibold text-lg tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            {common("title")}
          </span>
        </div>

        <nav className="flex-1 space-y-1">
          <a
            href="#"
            className="flex items-center space-x-3 px-4 py-3 rounded-lg bg-slate-800 text-white font-medium transition-all duration-200"
          >
            <LayoutDashboard className="w-5 h-5 text-indigo-400" />
            <span>{common("dashboard")}</span>
          </a>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-10 space-y-8 overflow-y-auto flex flex-col justify-center items-center">
        <div className="text-center space-y-4 max-w-md">
          <h1 className="text-3xl font-bold tracking-tight text-white">{t("welcome")}</h1>
          <p className="text-slate-400">
            O painel de controle está pronto. Configure a autenticação e as rotas da API para
            começar a carregar os dados.
          </p>
        </div>
      </main>
    </div>
  );
}
