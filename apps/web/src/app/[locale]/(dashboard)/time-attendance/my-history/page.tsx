"use client";

import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { MagnifyingGlass, CircleNotch, ArrowLeft, Clock, Calendar } from "@phosphor-icons/react";
import { useRouter, useParams } from "next/navigation";
import { timeAttendanceService, TimeRecord } from "@/services/time-attendance.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function MyTimeHistoryPage() {
  const router = useRouter();
  const { locale } = useParams();
  const [globalFilter, setGlobalFilter] = useState("");

  const { data: records = [], isLoading } = useQuery({
    queryKey: ["my-time-history"],
    queryFn: () => timeAttendanceService.getMyHistory(),
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

  // Group records by local date
  const groupedDays = useMemo(() => {
    const groups: { [dateKey: string]: TimeRecord[] } = {};

    records.forEach((rec) => {
      const date = new Date(rec.timestamp);
      const dateKey = date.toLocaleDateString("pt-BR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });

      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(rec);
    });

    // Sort punches inside each day ascending
    Object.keys(groups).forEach((key) => {
      groups[key].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    });

    return groups;
  }, [records]);

  // Calculate worked time for a day
  const calculateWorkedTime = (dayRecords: TimeRecord[]) => {
    if (dayRecords.length < 2) return "--:--";

    let totalMs = 0;
    const entry = dayRecords.find((r) => r.type === "ENTRY");
    const intOut = dayRecords.find((r) => r.type === "INTERVAL_OUT");
    const intIn = dayRecords.find((r) => r.type === "INTERVAL_IN");
    const exit = dayRecords.find((r) => r.type === "EXIT");

    // Morning shift
    if (entry && intOut) {
      totalMs += new Date(intOut.timestamp).getTime() - new Date(entry.timestamp).getTime();
    }
    // Afternoon shift
    if (intIn && exit) {
      totalMs += new Date(exit.timestamp).getTime() - new Date(intIn.timestamp).getTime();
    }

    // Fallback if no interval records but have ENTRY and EXIT
    if (totalMs === 0 && entry && exit) {
      totalMs += new Date(exit.timestamp).getTime() - new Date(entry.timestamp).getTime();
    }

    if (totalMs === 0) return "--:--";

    const totalMinutes = Math.floor(totalMs / 60000);
    const hrs = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    return `${hrs.toString().padStart(2, "0")}h ${mins.toString().padStart(2, "0")}m`;
  };

  const filteredDays = useMemo(() => {
    return Object.keys(groupedDays)
      .filter((dateKey) => {
        if (!globalFilter) return true;
        return dateKey.includes(globalFilter);
      })
      .sort((a, b) => {
        // Sort dates descending
        const [dayA, monthA, yearA] = a.split("/").map(Number);
        const [dayB, monthB, yearB] = b.split("/").map(Number);
        return (
          new Date(yearB, monthB - 1, dayB).getTime() - new Date(yearA, monthA - 1, dayA).getTime()
        );
      });
  }, [groupedDays, globalFilter]);

  return (
    <div className="p-6 md:p-8 space-y-6 w-full animate-fade-in">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-semibold">
            <Clock className="w-3.5 h-3.5 text-primary" />
            Ponto Eletrônico
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Meu Histórico de Pontos</h1>
          <p className="text-muted-foreground text-sm">
            Consulte seus horários de entrada, saídas e total trabalhado em cada dia.
          </p>
        </div>

        <Button
          onClick={() => router.push(`/${locale}/time-attendance/corrections/new`)}
          className="rounded-2xl text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/95 transition-all"
        >
          Solicitar Ajuste
        </Button>
      </div>

      {/* MagnifyingGlass Input */}
      <div className="relative w-full">
        <MagnifyingGlass className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Pesquisar por data (ex: DD/MM/AAAA)..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="pl-10 h-10 rounded-2xl bg-muted/40 border-0 focus-visible:ring-1"
        />
      </div>

      {/* Main List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="py-12 flex items-center justify-center">
            <CircleNotch className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : filteredDays.length === 0 ? (
          <div className="py-12 text-center text-sm text-muted-foreground">
            Nenhuma marcação de ponto encontrada.
          </div>
        ) : (
          filteredDays.map((dateKey) => {
            const dayRecords = groupedDays[dateKey];
            const workedTime = calculateWorkedTime(dayRecords);

            return (
              <div
                key={dateKey}
                className="bg-muted/10 p-5 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4 border-0"
              >
                {/* Day Info */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                    <Calendar className="w-4 h-4 text-primary shrink-0" />
                    {dateKey}
                  </div>
                  <div className="text-xs text-muted-foreground font-semibold">
                    Total Trabalhado:{" "}
                    <span className="font-mono text-foreground font-bold">{workedTime}</span>
                  </div>
                </div>

                {/* Clock Timeline Row */}
                <div className="flex flex-wrap gap-4 items-center">
                  {dayRecords.map((rec) => (
                    <div
                      key={rec.id}
                      className="bg-card/45 px-3 py-1.5 rounded-xl border border-muted/15 text-xs flex flex-col items-center min-w-[90px]"
                    >
                      <span className="font-bold text-foreground/80 text-[10px]">
                        {getRecordTypeLabel(rec.type)}
                      </span>
                      <span className="font-mono font-bold tabular-nums text-primary mt-0.5">
                        {new Date(rec.timestamp).toLocaleTimeString("pt-BR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      {rec.comments && (
                        <span
                          className="text-[9px] text-muted-foreground mt-0.5 max-w-[120px] truncate"
                          title={rec.comments}
                        >
                          {rec.comments}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
