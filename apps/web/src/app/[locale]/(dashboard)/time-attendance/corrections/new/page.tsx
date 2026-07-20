"use client";

import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Clock, Calendar } from "@phosphor-icons/react";
import { timeAttendanceService } from "@/services/time-attendance.service";
import { Button } from "@/components/ui/button";
import { Select, Option } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function NewCorrectionRequestPage() {
  const router = useRouter();
  const { locale } = useParams();
  const queryClient = useQueryClient();

  const [date, setDate] = useState("");
  const [targetType, setTargetType] = useState("ENTRY");
  const [time, setTime] = useState("");
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const requestMutation = useMutation({
    mutationFn: () => {
      return timeAttendanceService.requestCorrection({
        date,
        targetType,
        time,
        reason,
      });
    },
    onSuccess: () => {
      setMessage({ text: "Solicitação de ajuste enviada com sucesso!", type: "success" });
      queryClient.invalidateQueries({ queryKey: ["my-time-history"] });
      setTimeout(() => {
        router.push(`/${locale}/time-attendance/my-history`);
      }, 2000);
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || "Erro ao enviar solicitação.";
      setMessage({ text: msg, type: "error" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !time || !reason) {
      setMessage({ text: "Por favor, preencha todos os campos obrigatórios.", type: "error" });
      return;
    }
    requestMutation.mutate();
  };

  return (
    <div className="p-6 md:p-8 space-y-6 w-full animate-fade-in">
      
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.push(`/${locale}/time-attendance/my-history`)}
          className="rounded-2xl border-0 bg-muted/40 hover:bg-muted/65 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-semibold">
            <Clock className="w-3.5 h-3.5 text-primary" />
            Ajuste de Jornada
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Solicitar Correção de Ponto</h1>
          <p className="text-muted-foreground text-sm">
            Informe a data, o tipo da batida e o horário correto. A solicitação passará por
            aprovação do gestor.
          </p>
          <p className="text-xs text-destructive/80 mt-1.5">
            * Os campos marcados com * são obrigatórios
          </p>
        </div>
      </div>

      
      <form onSubmit={handleSubmit} className="space-y-6 pt-4">
        {message && (
          <div
            className={`p-3 rounded-2xl text-xs font-semibold text-center border-0 ${
              message.type === "success"
                ? "bg-emerald-500/10 text-emerald-500"
                : "bg-destructive/10 text-destructive"
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          <div className="space-y-2">
            <Label htmlFor="date">
              Data da Batida <span className="text-destructive">*</span>
            </Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="h-10 rounded-2xl bg-muted/40 border-0 focus-visible:ring-1"
            />
          </div>

          
          <div className="space-y-2">
            <Label htmlFor="targetType">
              Tipo de Batida <span className="text-destructive">*</span>
            </Label>
            <Select
              id="targetType"
              value={targetType}
              onChange={(e) => setTargetType(e.target.value)}
              className="flex h-10 w-full rounded-2xl border border-transparent bg-muted/45 px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring outline-none cursor-pointer transition-colors"
            >
              <Option value="ENTRY">Entrada</Option>
              <Option value="INTERVAL_OUT">Saída Almoço</Option>
              <Option value="INTERVAL_IN">Retorno Almoço</Option>
              <Option value="EXIT">Saída Expediente</Option>
            </Select>
          </div>
        </div>

        
        <div className="space-y-2">
          <Label htmlFor="time">
            Horário Correto (HH:MM) <span className="text-destructive">*</span>
          </Label>
          <Input
            id="time"
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="h-10 rounded-2xl bg-muted/40 border-0 focus-visible:ring-1"
          />
        </div>

        
        <div className="space-y-2">
          <Label htmlFor="reason">
            Motivo do Ajuste <span className="text-destructive">*</span>
          </Label>
          <textarea
            id="reason"
            placeholder="Descreva detalhadamente o motivo do ajuste (ex: esquecimento, problema no crachá)..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="flex min-h-[100px] w-full rounded-2xl border-0 bg-muted/45 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-50 resize-none outline-none"
          />
        </div>

        
        <div className="flex justify-end gap-3 pt-6 border-t border-transparent">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/${locale}/time-attendance/my-history`)}
            className="rounded-2xl border-0 bg-muted/40 hover:bg-muted/65 text-foreground transition-colors text-xs font-bold h-10 px-6"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={requestMutation.isPending}
            className="rounded-2xl text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/95 border-0 h-10 px-6"
          >
            {requestMutation.isPending ? "Enviando..." : "Enviar Solicitação"}
          </Button>
        </div>
      </form>
    </div>
  );
}
