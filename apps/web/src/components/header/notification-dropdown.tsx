"use client";

import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, Check, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

import { notificationService, Notification } from "@/services/notification.service";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NotificationDropdownProps {
  locale: string;
}

export function NotificationDropdown({ locale }: NotificationDropdownProps) {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  // --- Fetch notifications ---
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => notificationService.getNotifications(),
    enabled: !!user,
    // Poll every 30 seconds for live updates
    refetchInterval: 30000,
  });

  // --- Mutations ---
  const readMutation = useMutation({
    mutationFn: (id: string) => notificationService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString(locale === "pt" ? "pt-BR" : "en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <div
            role="button"
            tabIndex={0}
            className="relative p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent/40 transition-colors focus:outline-none select-none cursor-pointer flex items-center justify-center"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground animate-pulse">
                {unreadCount}
              </span>
            )}
          </div>
        }
      />
      <DropdownMenuContent
        className="w-[360px] p-2 border-0 shadow-2xl bg-background/95 backdrop-blur-md rounded-2xl"
        align="end"
        side="bottom"
      >
        <div className="px-3 py-2 flex items-center justify-between text-foreground">
          <span className="text-sm font-bold tracking-tight">Notificações</span>
          {unreadCount > 0 && (
            <span className="text-xs text-muted-foreground font-normal">
              {unreadCount} não lidas
            </span>
          )}
        </div>
        <DropdownMenuSeparator className="bg-muted/40 my-1" />

        <DropdownMenuGroup className="max-h-[300px] overflow-y-auto space-y-1 py-1">
          {isLoading ? (
            <div className="py-8 flex items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground">
              Nenhuma notificação encontrada.
            </div>
          ) : (
            notifications.map((item) => (
              <div
                key={item.id}
                className={`flex items-start justify-between gap-3 p-3 rounded-xl transition-all border-0 ${
                  !item.read ? "bg-primary/5 text-foreground" : "text-muted-foreground"
                }`}
              >
                <div className="space-y-1 flex-1">
                  <p className="text-xs leading-relaxed font-medium">{item.message}</p>
                  <p className="text-[10px] text-muted-foreground">{formatDate(item.createdAt)}</p>
                </div>
                {!item.read && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      readMutation.mutate(item.id);
                    }}
                    className="h-6 w-6 shrink-0 rounded-lg hover:bg-primary/10 text-primary border-0"
                    disabled={readMutation.isPending}
                  >
                    <Check className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            ))
          )}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
