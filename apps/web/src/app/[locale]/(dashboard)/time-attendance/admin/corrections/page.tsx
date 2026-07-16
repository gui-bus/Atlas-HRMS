"use client";

import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { MagnifyingGlass, CircleNotch, ArrowsDownUp, Check, X } from "@phosphor-icons/react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
  SortingState,
} from "@tanstack/react-table";

import { timeAttendanceService, TimeCorrectionRequest } from "@/services/time-attendance.service";
import { RbacGuard } from "@/components/rbac-guard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
export default function PendingCorrectionsPage() {
  const queryClient = useQueryClient();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ["pending-corrections"],
    queryFn: () => timeAttendanceService.getPendingCorrections(),
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) =>
      timeAttendanceService.approveCorrection(id, "Aprovado via painel administrativo"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-corrections"] });
      setMessage({ text: "Ajuste de ponto aprovado com sucesso!", type: "success" });
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || "Erro ao aprovar ajuste.";
      setMessage({ text: msg, type: "error" });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) =>
      timeAttendanceService.rejectCorrection(id, "Rejeitado via painel administrativo"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-corrections"] });
      setMessage({ text: "Ajuste de ponto rejeitado com sucesso.", type: "success" });
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || "Erro ao rejeitar ajuste.";
      setMessage({ text: msg, type: "error" });
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

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("pt-BR");
    } catch {
      return dateStr;
    }
  };

  const columnHelper = createColumnHelper<TimeCorrectionRequest>();
  const columns = [
    columnHelper.accessor((row) => `${row.employee?.firstName} ${row.employee?.lastName}`, {
      id: "employeeName",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-transparent p-0 text-muted-foreground font-semibold"
        >
          Colaborador
          <ArrowsDownUp className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: (info) => <span className="font-semibold text-foreground">{info.getValue()}</span>,
    }),
    columnHelper.accessor("date", {
      header: "Data do Ajuste",
      cell: (info) => <span className="text-muted-foreground">{formatDate(info.getValue())}</span>,
    }),
    columnHelper.accessor("targetType", {
      header: "Tipo da Batida",
      cell: (info) => (
        <span className="text-muted-foreground">{getRecordTypeLabel(info.getValue())}</span>
      ),
    }),
    columnHelper.accessor("time", {
      header: "Horário Proposto",
      cell: (info) => <span className="font-mono text-primary font-bold">{info.getValue()}</span>,
    }),
    columnHelper.accessor("reason", {
      header: "Justificativa",
      cell: (info) => (
        <span
          className="text-muted-foreground text-xs leading-relaxed max-w-[240px] block truncate"
          title={info.getValue()}
        >
          {info.getValue()}
        </span>
      ),
    }),
    columnHelper.display({
      id: "actions",
      header: "Ações",
      cell: (info) => {
        const id = info.row.original.id;
        return (
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => approveMutation.mutate(id)}
              disabled={approveMutation.isPending || rejectMutation.isPending}
              className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-0 rounded-xl px-2 h-8"
            >
              <Check className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              onClick={() => rejectMutation.mutate(id)}
              disabled={approveMutation.isPending || rejectMutation.isPending}
              className="bg-destructive/10 text-destructive hover:bg-destructive/20 border-0 rounded-xl px-2 h-8"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        );
      },
    }),
  ];

  const table = useReactTable({
    data: requests,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <RbacGuard allowedRoles={["ADMIN", "HR", "MANAGER"]}>
      <div className="p-6 md:p-8 space-y-6 w-full animate-fade-in">
        {/* Title Header */}
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Solicitações de Ajuste de Ponto</h1>
          <p className="text-muted-foreground text-sm">
            Revise, aprove ou recuse pedidos de correção de ponto retroativos feitos por
            colaboradores da empresa.
          </p>
        </div>

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

        {/* Toolbar */}
        <div className="relative w-full">
          <MagnifyingGlass className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Pesquisar solicitações..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-10 h-10 rounded-2xl bg-muted/40 border-0 focus-visible:ring-1"
          />
        </div>

        {/* Table */}
        <div className="w-full bg-transparent overflow-hidden">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-sm border-collapse text-left border-0">
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id} className="bg-muted/20 hover:bg-muted/20 border-0">
                    {headerGroup.headers.map((header, index) => (
                      <th
                        key={header.id}
                        className={`h-10 px-4 align-middle font-medium text-muted-foreground border-0 ${index === 0 ? "w-full" : "w-auto shrink-0 whitespace-nowrap"}`}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {isLoading ? (
                  <tr className="border-0">
                    <td colSpan={columns.length} className="h-24 text-center border-0">
                      <CircleNotch className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                    </td>
                  </tr>
                ) : requests.length === 0 ? (
                  <tr className="border-0">
                    <td
                      colSpan={columns.length}
                      className="h-24 text-center text-muted-foreground border-0"
                    >
                      Nenhum pedido de ajuste pendente.
                    </td>
                  </tr>
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <tr
                      key={row.id}
                      className="odd:bg-muted/15 even:bg-transparent transition-colors hover:bg-muted/25 border-0"
                    >
                      {row.getVisibleCells().map((cell, index) => (
                        <td
                          key={cell.id}
                          className={`p-4 align-middle border-0 ${index === 0 ? "w-full" : "w-auto shrink-0 whitespace-nowrap"}`}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </RbacGuard>
  );
}
