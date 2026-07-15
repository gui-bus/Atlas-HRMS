"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "../store/useAuthStore";
import { api } from "../lib/api";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, setAuth, clearAuth } = useAuthStore();
  const [isBootstrapped, setIsBootstrapped] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Tenta restaurar a sessão no mount do app usando o refresh token do cookie
  useEffect(() => {
    const bootstrapSession = async () => {
      try {
        const response = await api.post("/auth/refresh");
        const { accessToken } = response.data;

        if (accessToken) {
          const payloadBase64 = accessToken.split(".")[1];
          const decodedPayload = JSON.parse(atob(payloadBase64));
          const userData = {
            id: decodedPayload.sub,
            email: decodedPayload.email,
            role: decodedPayload.role,
            isActive: true,
            createdAt: "",
            updatedAt: "",
          };
          setAuth(userData, accessToken);
        }
      } catch (err) {
        // Se falhar, limpa o estado (o usuário não possui um cookie válido)
        clearAuth();
      } finally {
        setIsBootstrapped(true);
      }
    };

    bootstrapSession();
  }, [setAuth, clearAuth]);

  // Controle de rotas protegidas
  useEffect(() => {
    if (!isBootstrapped) return;

    // Detecta o locale do path, por exemplo: "/pt/login" -> true
    const isPublicRoute =
      pathname.endsWith("/login") ||
      pathname.endsWith("/register") ||
      pathname.includes("/forgot-password") ||
      pathname.includes("/reset-password");

    if (!isAuthenticated && !isPublicRoute) {
      // Se não autenticado e tentando acessar rota privada, manda para o login
      // Mantendo o prefixo de locale (ex: /pt)
      const segments = pathname.split("/");
      const locale = segments[1] || "pt";
      router.push(`/${locale}/login?redirect=${encodeURIComponent(pathname)}`);
    } else if (isAuthenticated && isPublicRoute) {
      // Se já autenticado e acessando tela de login/cadastro, manda para o dashboard raiz
      const segments = pathname.split("/");
      const locale = segments[1] || "pt";
      router.push(`/${locale}`);
    }
  }, [isAuthenticated, isBootstrapped, pathname, router]);

  // Previne a tela de bloqueio de boot se estiver em uma rota pública
  const isPublicRoute =
    pathname.endsWith("/login") ||
    pathname.endsWith("/register") ||
    pathname.includes("/forgot-password") ||
    pathname.includes("/reset-password");

  // Tela de carregamento premium enquanto restaura a sessão (apenas se for rota privada)
  if (!isBootstrapped && !isPublicRoute) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col justify-center items-center space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
        <span className="text-muted-foreground text-sm font-medium animate-pulse">
          Carregando Atlas...
        </span>
      </div>
    );
  }

  // Previne renderização de rotas privadas se não estiver logado
  const isPublicRoute =
    pathname.endsWith("/login") ||
    pathname.endsWith("/register") ||
    pathname.includes("/forgot-password") ||
    pathname.includes("/reset-password");

  if (!isAuthenticated && !isPublicRoute) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col justify-center items-center">
        <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
