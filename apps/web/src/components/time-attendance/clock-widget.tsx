import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Clock, CheckCircle2, AlertCircle, Calendar } from "lucide-react";
import { timeAttendanceService } from "@/services/time-attendance.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ClockWidget() {
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

  // Update clock every second
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

  // Fetch today's records
  const { data: todayRecords = [], isLoading } = useQuery({
    queryKey: ["today-records"],
    queryFn: () => timeAttendanceService.getTodayRecords(),
  });

  // Fetch bank of hours balance
  const { data: balanceMinutes = 0 } = useQuery({
    queryKey: ["hour-bank-balance"],
    queryFn: () => timeAttendanceService.getHourBankBalance(),
  });

  // Register Point mutation
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
                // If location is denied, record anyway
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
    onSuccess: (data) => {
      showNotification(`Ponto registrado com sucesso!`, "success");
      setComments("");
      setShowComments(false);
      queryClient.invalidateQueries({ queryKey: ["today-records"] });
      queryClient.invalidateQueries({ queryKey: ["hour-bank-balance"] });
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "Erro ao registrar ponto";
      showNotification(msg, "error");
    },
  });

  const getRecordTypeLabel = (type: string) => {
    const map = {
      ENTRY: "Entrada",
      INTERVAL_OUT: "Saída Almoço",
      INTERVAL_IN: "Retorno Almoço",
      EXIT: "Saída Expediente",
    };
    return map[type] || type;
  };

  const getNextRecordLabel = () => {
    if (todayRecords.length === 0) return "Entrada";
    if (todayRecords.length === 1) return "Saída Almoço";
    if (todayRecords.length === 2) return "Retorno Almoço";
    if (todayRecords.length === 3) return "Saída Expediente";
    return "Jornada Completa";
  };

  const formatBalance = (mins: number) => {
    const prefix = mins >= 0 ? "+" : "-";
    const absolute = Math.abs(mins);
    const hrs = Math.floor(absolute / 60);
    const remainingMins = absolute % 60;
    return `${prefix}${hrs.toString().padStart(2, "0")}h ${remainingMins.toString().padStart(2, "0")}m`;
  };

  return (
    <div className="bg-card/45 border border-muted/20 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-8 backdrop-blur-md shadow-xl animate-fade-in">
      {/* Clock Display */}
      <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-3">
        <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-wider bg-primary/10 px-3 py-1 rounded-full w-fit">
          <Clock className="w-3.5 h-3.5" />
          Ponto Eletrônico
        </div>
        <div className="text-5xl md:text-6xl font-black tracking-tighter text-foreground tabular-nums select-none drop-shadow-sm font-sans animate-pulse">
          {time || "00:00:00"}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
          <Calendar className="w-3.5 h-3.5" />
          {dateStr}
        </div>

        {/* Hour Bank Balance Card */}
        <div className="pt-2">
          <div className="text-xs text-muted-foreground font-semibold">
            Banco de Horas Acumulado
          </div>
          <div
            className={`text-lg font-bold tracking-tight ${
              balanceMinutes >= 0 ? "text-emerald-500" : "text-destructive"
            }`}
          >
            {formatBalance(balanceMinutes)}
          </div>
        </div>
      </div>

      {/* Control Panel */}
      <div className="flex flex-col w-full md:w-auto items-center space-y-4 max-w-sm">
        {/* Dynamic Journey Sequence */}
        <div className="w-full bg-muted/20 p-4 rounded-2xl space-y-3 border border-muted/10">
          <div className="text-xs font-semibold text-muted-foreground border-b border-muted/20 pb-1">
            Status da Jornada
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs">
            {["ENTRY", "INTERVAL_OUT", "INTERVAL_IN", "EXIT"].map((type, idx) => {
              const matched = todayRecords.find((r) => r.type === type);
              return (
                <div key={type} className="flex items-center gap-2 py-0.5">
                  {matched ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-muted-foreground/30 shrink-0" />
                  )}
                  <div className="truncate">
                    <p className="font-semibold text-foreground/80">{getRecordTypeLabel(type)}</p>
                    <p className="text-[10px] text-muted-foreground/80 tabular-nums">
                      {matched
                        ? new Date(matched.timestamp).toLocaleTimeString("pt-BR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "--:--"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Clock In Actions */}
        <div className="w-full space-y-2">
          {showComments ? (
            <div className="space-y-2">
              <Input
                placeholder="Observação opcional..."
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                className="h-10 rounded-2xl text-xs bg-muted/40 border-0 focus-visible:ring-1"
              />
              <div className="flex gap-2">
                <Button
                  onClick={() => clockInMutation.mutate()}
                  disabled={clockInMutation.isPending || todayRecords.length >= 4}
                  className="flex-1 h-10 rounded-2xl text-xs font-bold"
                >
                  {clockInMutation.isPending
                    ? "Registrando..."
                    : `Confirmar (${getNextRecordLabel()})`}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setShowComments(false)}
                  className="h-10 rounded-2xl text-xs font-medium"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <Button
              onClick={() => {
                if (todayRecords.length >= 4) {
                  showNotification("Jornada de trabalho diária já concluída!", "error");
                  return;
                }
                setShowComments(true);
              }}
              disabled={todayRecords.length >= 4}
              className="w-full h-12 rounded-2xl font-bold text-sm tracking-wide shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all bg-primary text-primary-foreground"
            >
              {todayRecords.length >= 4
                ? "Jornada Diária Concluída"
                : `Registrar Ponto (${getNextRecordLabel()})`}
            </Button>
          )}
        </div>

        {/* Local Notification Banner */}
        {notification && (
          <div
            className={`w-full p-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 border text-left ${
              notification.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                : "bg-destructive/10 border-destructive/20 text-destructive"
            }`}
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{notification.text}</span>
          </div>
        )}
      </div>
    </div>
  );
}
