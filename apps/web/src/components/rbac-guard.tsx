"use client";

import React, { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";

interface RbacGuardProps {
  allowedRoles: string[];
  children: React.ReactNode;
}

export function RbacGuard({ allowedRoles, children }: RbacGuardProps) {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const params = useParams();
  const locale = params?.locale || "pt";

  useEffect(() => {
    if (isAuthenticated && user && !allowedRoles.includes(user.role)) {
      router.push(`/${locale}`);
    }
  }, [user, isAuthenticated, allowedRoles, router, locale]);

  if (!isAuthenticated || !user || !allowedRoles.includes(user.role)) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return <>{children}</>;
}
