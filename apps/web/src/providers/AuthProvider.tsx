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

  useEffect(() => {
    const bootstrapSession = async () => {
      // 1. Tenta recuperar a sessão de forma síncrona do localStorage para evitar atrasos na hidratação
      try {
        const stored = localStorage.getItem("atlas-auth");
        if (stored) {
          const parsed = JSON.parse(stored);
          const localToken = parsed.state?.accessToken;
          const localUser = parsed.state?.user;

          if (localToken && localUser) {
            api.defaults.headers.common["Authorization"] = `Bearer ${localToken}`;
            setAuth(localUser, localToken);
            setIsBootstrapped(true);
            return;
          }
        }
      } catch (e) {
        console.error("Erro ao ler sessão do localStorage no bootstrap", e);
      }

      // 2. Se não houver sessão local persistida, tenta o refresh silencioso via cookie
      try {
        const response = await api.post("/auth/refresh");
        const { accessToken } = response.data;

        if (accessToken) {
          api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
          const responseMe = await api.get("/auth/me");
          setAuth(responseMe.data, accessToken);
        }
      } catch (err) {
        clearAuth();
      } finally {
        setIsBootstrapped(true);
      }
    };

    bootstrapSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isBootstrapped) return;

    const isPublicRoute =
      pathname.endsWith("/login") ||
      pathname.endsWith("/register") ||
      pathname.includes("/forgot-password") ||
      pathname.includes("/reset-password") ||
      pathname.includes("/jobs") ||
      pathname === `/${pathname.split("/")[1]}` ||
      pathname === "/";

    if (!isAuthenticated && !isPublicRoute) {
      const segments = pathname.split("/");
      const locale = segments[1] || "pt";
      router.push(`/${locale}/login?redirect=${encodeURIComponent(pathname)}`);
    } else if (isAuthenticated && (pathname.endsWith("/login") || pathname.endsWith("/register"))) {
      const segments = pathname.split("/");
      const locale = segments[1] || "pt";
      router.push(`/${locale}/dashboard`);
    }
  }, [isAuthenticated, isBootstrapped, pathname, router]);

  const isPublicRoute =
    pathname.endsWith("/login") ||
    pathname.endsWith("/register") ||
    pathname.includes("/forgot-password") ||
    pathname.includes("/reset-password") ||
    pathname.includes("/jobs") ||
    pathname === `/${pathname.split("/")[1]}` ||
    pathname === "/";

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

  if (!isAuthenticated && !isPublicRoute) {
    return (
      <div className=" bg-background text-foreground flex flex-col justify-center items-center">
        <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
