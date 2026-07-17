import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle, WarningCircle } from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
import { timeAttendanceService } from "@/services/time-attendance.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ClockWidget() {
  const t = useTranslations("TimeAttendance");
  const queryClient = useQueryClient();
  const [time, setTime] = useState<string>("");
  const [dateStr, setDateStr] = useState<string>("");
  const [comments, setComments] = useState<string>("");
  const [showComments, setShowComments] = useState(false);
  const [notification, setNotification] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  const showNotification = (text: string, type: "success" | "error") => {
    setNotification({ text, type });
    setTimeout(() => {
      setNotification(null);
    }, 5000);
  };

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString("pt-BR", { hour12: false }));
      setDateStr(
        now.toLocaleDateString("pt-BR", {
          weekday: "long",
          day: "2-digit",
          month: "long",
          year: "numeric",
        }),
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const { data: todayRecords = [] } = useQuery({
    queryKey: ["today-records"],
    queryFn: () => timeAttendanceService.getTodayRecords(),
  });

  const { data: balanceMinutes = 0 } = useQuery({
    queryKey: ["hour-bank-balance"],
    queryFn: () => timeAttendanceService.getHourBankBalance(),
  });

  const clockInMutation = useMutation({
    mutationFn: () => {
      return new Promise<any>((resolve, reject) => {
        if ("geolocation" in navigator) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              try {
                const res = await timeAttendanceService.clockIn(comments, {
                  latitude: position.coords.latitude,
                  longitude: position.coords.longitude,
                });
                resolve(res);
              } catch (err) {
                reject(err);
              }
            },
            async () => {
              try {
                const res = await timeAttendanceService.clockIn(comments);
                resolve(res);
              } catch (err) {
                reject(err);
              }
            },
          );
        } else {
          timeAttendanceService.clockIn(comments).then(resolve).catch(reject);
        }
      });
    },
    onSuccess: () => {
      showNotification(t("clockSuccess"), "success");
      setComments("");
      setShowComments(false);
      queryClient.invalidateQueries({ queryKey: ["today-records"] });
      queryClient.invalidateQueries({ queryKey: ["hour-bank-balance"] });
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || t("clockError");
      showNotification(msg, "error");
    },
  });

  const getRecordTypeLabel = (type: string) => {
    const map: Record<string, string> = {
      ENTRY: t("entry"),
      INTERVAL_OUT: t("intervalOut"),
      INTERVAL_IN: t("intervalIn"),
      EXIT: t("exit"),
    };
    return map[type] || type;
  };

  const getNextRecordLabel = () => {
    if (todayRecords.length === 0) return t("entry");
    if (todayRecords.length === 1) return t("intervalOut");
    if (todayRecords.length === 2) return t("intervalIn");
    if (todayRecords.length === 3) return t("exit");
    return t("journeyComplete");
  };

  const formatBalance = (mins: number) => {
    const prefix = mins >= 0 ? "+" : "-";
    const absolute = Math.abs(mins);
    const hrs = Math.floor(absolute / 60);
    const remainingMins = absolute % 60;
    return `${prefix}${hrs.toString().padStart(2, "0")}h ${remainingMins.toString().padStart(2, "0")}m`;
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-8 w-full text-center animate-fade-in py-4">
      <div className="space-y-3">
        <div className="text-sm font-bold tracking-wider text-primary uppercase select-none">
          {t("brasiliaTime")}
        </div>

        <div className="text-8xl md:text-9xl font-black tracking-tighter text-foreground font-mono tabular-nums leading-none select-none">
          {time || "00:00:00"}
        </div>

        <div className="text-sm font-medium text-muted-foreground">{dateStr}</div>
      </div>

      <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-muted/20 border-0 text-xs font-semibold">
        <span className="text-muted-foreground">{t("hourBank")}</span>
        <span
          className={`font-mono font-bold tabular-nums ${
            balanceMinutes >= 0 ? "text-emerald-500" : "text-destructive"
          }`}
        >
          {formatBalance(balanceMinutes)}
        </span>
      </div>

      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-3">
          {showComments ? (
            <div className="space-y-2">
              <Input
                placeholder={t("optionalNote")}
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                className="h-11 rounded-2xl text-sm bg-muted/45 border-0 focus-visible:ring-1 focus-visible:ring-primary/30 text-center"
              />
              <div className="flex gap-2">
                <Button
                  onClick={() => clockInMutation.mutate()}
                  disabled={clockInMutation.isPending || todayRecords.length >= 4}
                  className="flex-1 h-11 rounded-2xl text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 border-0"
                >
                  {clockInMutation.isPending
                    ? t("registering")
                    : `${t("confirm")} (${getNextRecordLabel()})`}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setShowComments(false)}
                  className="h-11 rounded-2xl text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/30 border-0"
                >
                  {t("cancel")}
                </Button>
              </div>
            </div>
          ) : (
            <Button
              onClick={() => {
                if (todayRecords.length >= 4) {
                  showNotification(t("journeyAlreadyDone"), "error");
                  return;
                }
                setShowComments(true);
              }}
              disabled={todayRecords.length >= 4}
              className="w-full h-12 rounded-2xl font-bold text-sm tracking-wide bg-primary text-primary-foreground hover:bg-primary/95 transition-all border-0"
            >
              {todayRecords.length >= 4
                ? t("journeyComplete")
                : `${t("clockIn")} (${getNextRecordLabel()})`}
            </Button>
          )}
        </div>

        <div className="grid grid-cols-4 gap-2 pt-2 text-center">
          {["ENTRY", "INTERVAL_OUT", "INTERVAL_IN", "EXIT"].map((type) => {
            const matched = todayRecords.find((r) => r.type === type);
            return (
              <div key={type} className="space-y-1 flex flex-col items-center">
                <div
                  className={`w-3.5 h-3.5 rounded-full flex items-center justify-center transition-all ${
                    matched ? "bg-emerald-500" : "bg-muted/40"
                  }`}
                />
                <span className="text-[10px] font-bold text-muted-foreground block truncate max-w-full">
                  {getRecordTypeLabel(type)}
                </span>
                <span className="text-[10px] font-mono tabular-nums text-muted-foreground/75 block">
                  {matched
                    ? new Date(matched.timestamp).toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "--:--"}
                </span>
              </div>
            );
          })}
        </div>

        {notification && (
          <div
            className={`p-3 rounded-2xl text-xs font-semibold flex items-center justify-center gap-2 border-0 ${
              notification.type === "success"
                ? "bg-emerald-500/10 text-emerald-500"
                : "bg-destructive/10 text-destructive"
            }`}
          >
            {notification.type === "success" ? (
              <CheckCircle className="w-4 h-4 shrink-0" />
            ) : (
              <WarningCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{notification.text}</span>
          </div>
        )}
      </div>
    </div>
  );
}
