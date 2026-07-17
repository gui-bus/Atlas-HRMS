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
  }, [setAuth, clearAuth]);

  useEffect(() => {
    if (!isBootstrapped) return;

    const isPublicRoute =
      pathname.endsWith("/login") ||
      pathname.endsWith("/register") ||
      pathname.includes("/forgot-password") ||
      pathname.includes("/reset-password");

    if (!isAuthenticated && !isPublicRoute) {
      const segments = pathname.split("/");
      const locale = segments[1] || "pt";
      router.push(`/${locale}/login?redirect=${encodeURIComponent(pathname)}`);
    } else if (isAuthenticated && isPublicRoute) {
      const segments = pathname.split("/");
      const locale = segments[1] || "pt";
      router.push(`/${locale}`);
    }
  }, [isAuthenticated, isBootstrapped, pathname, router]);

  const isPublicRoute =
    pathname.endsWith("/login") ||
    pathname.endsWith("/register") ||
    pathname.includes("/forgot-password") ||
    pathname.includes("/reset-password");

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
