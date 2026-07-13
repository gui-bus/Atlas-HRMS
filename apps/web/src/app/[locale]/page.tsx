"use client";

import { useTranslations } from "next-intl";
import { Users, FileText, Calendar, Compass, UserCheck, LayoutDashboard } from "lucide-react";

export default function DashboardPage() {
  const t = useTranslations("Dashboard");
  const common = useTranslations("Common");

  const stats = [
    {
      title: t("totalEmployees"),
      value: "1,248",
      change: "+12% em relação ao mês anterior",
      icon: Users,
      color: "from-blue-600 to-indigo-600",
    },
    {
      title: t("activeRecruitments"),
      value: "14",
      change: "4 vagas publicadas nesta semana",
      icon: Compass,
      color: "from-purple-600 to-pink-600",
    },
    {
      title: t("pendingVacations"),
      value: "8",
      change: "3 requerem aprovação urgente",
      icon: Calendar,
      color: "from-amber-500 to-orange-600",
    },
  ];

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
          <a
            href="#"
            className="flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-slate-800/40 hover:text-slate-200 transition-all duration-200"
          >
            <Users className="w-5 h-5" />
            <span>{common("employees")}</span>
          </a>
          <a
            href="#"
            className="flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-slate-800/40 hover:text-slate-200 transition-all duration-200"
          >
            <Compass className="w-5 h-5" />
            <span>{common("recruitment")}</span>
          </a>
          <a
            href="#"
            className="flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-slate-800/40 hover:text-slate-200 transition-all duration-200"
          >
            <Calendar className="w-5 h-5" />
            <span>{common("vacations")}</span>
          </a>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-10 space-y-8 overflow-y-auto">
        <header className="flex items-center justify-between pb-6 border-b border-slate-800">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">{t("welcome")}</h1>
            <p className="text-slate-400 mt-1">
              Visão geral e ações administrativas do sistema corporativo.
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-semibold text-white">Guilherme Silva</p>
              <p className="text-xs text-slate-400">Administrador HR</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700 shadow-md">
              <UserCheck className="w-5 h-5 text-indigo-400" />
            </div>
          </div>
        </header>

        {/* Stats Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div
                key={i}
                className="glass-panel rounded-2xl p-6 relative overflow-hidden transition-all duration-300 hover:translate-y-[-2px] hover:shadow-indigo-500/5 hover:shadow-2xl"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-slate-400 font-medium">{stat.title}</span>
                  <div
                    className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${stat.color} flex items-center justify-center text-white shadow-lg`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
                <h3 className="text-4xl font-bold tracking-tight text-white mb-2">{stat.value}</h3>
                <p className="text-xs text-slate-400">{stat.change}</p>
              </div>
            );
          })}
        </section>

        {/* Content Details Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quick Actions */}
          <div className="glass-panel rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-white">{t("quickActions")}</h2>
            <div className="grid grid-cols-2 gap-4">
              <button className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:bg-slate-800/60 transition-all duration-200 group">
                <Users className="w-6 h-6 text-indigo-400 group-hover:scale-110 transition-transform duration-200 mb-2" />
                <span className="text-sm font-medium text-slate-300">Novo Colaborador</span>
              </button>
              <button className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:bg-slate-800/60 transition-all duration-200 group">
                <Calendar className="w-6 h-6 text-emerald-400 group-hover:scale-110 transition-transform duration-200 mb-2" />
                <span className="text-sm font-medium text-slate-300">Aprovar Férias</span>
              </button>
              <button className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:bg-slate-800/60 transition-all duration-200 group">
                <Compass className="w-6 h-6 text-pink-400 group-hover:scale-110 transition-transform duration-200 mb-2" />
                <span className="text-sm font-medium text-slate-300">Abrir Vaga</span>
              </button>
              <button className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:bg-slate-800/60 transition-all duration-200 group">
                <FileText className="w-6 h-6 text-amber-400 group-hover:scale-110 transition-transform duration-200 mb-2" />
                <span className="text-sm font-medium text-slate-300">Relatórios</span>
              </button>
            </div>
          </div>

          {/* System Info */}
          <div className="glass-panel rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-white">Status da Plataforma</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Banco de Dados (PostgreSQL)</span>
                <span className="text-emerald-400 font-semibold flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse inline-block" />
                  <span>Conectado</span>
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Servidor API NestJS</span>
                <span className="text-emerald-400 font-semibold flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse inline-block" />
                  <span>Online (Porta 3001)</span>
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Next.js App Router (Turborepo)</span>
                <span className="text-indigo-400 font-semibold flex items-center space-x-1.5">
                  <span>Vite / Next.js Server (Porta 3000)</span>
                </span>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
