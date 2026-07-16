"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { Info, Loader2, Search, ArrowLeft, ArrowRight } from "lucide-react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";

import { auditService, AuditLog } from "@/services/audit.service";
import { RbacGuard } from "@/components/rbac-guard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const formatDate = (dateString: string) => {
  try {
    return new Date(dateString).toLocaleString();
  } catch {
    return dateString;
  }
};

export default function AuditLogsPage() {
  const t = useTranslations("Audit");
  const params = useParams();
  const locale = params?.locale || "pt";

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  // --- Fetch List ---
  const { data: auditResponse, isLoading } = useQuery({
    queryKey: ["audit-logs", page, search],
    queryFn: () => auditService.getAuditLogs({ page, limit: 15, search }),
    placeholderData: (keepPreviousData) => keepPreviousData,
  });

  const logs = auditResponse?.data || [];
  const meta = auditResponse?.meta || { total: 0, page: 1, lastPage: 1, limit: 15 };

  const getPrettyDetails = (details?: string) => {
    if (!details) return "Sem detalhes adicionais.";
    try {
      const parsed = JSON.parse(details);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return details;
    }
  };

  // --- Tables Setup ---
  const columnHelper = createColumnHelper<AuditLog>();
  const columns = [
    columnHelper.accessor("action", {
      header: t("table.action"),
      cell: (info) => (
        <span className="font-semibold text-foreground font-mono text-xs">{info.getValue()}</span>
      ),
    }),
    columnHelper.accessor("user", {
      header: t("table.user"),
      cell: (info) => {
        const u = info.getValue();
        return <span className="text-muted-foreground">{u?.email || "Público / Anônimo"}</span>;
      },
    }),
    columnHelper.accessor("timestamp", {
      header: t("table.timestamp"),
      cell: (info) => <span className="text-muted-foreground">{formatDate(info.getValue())}</span>,
    }),
    columnHelper.display({
      id: "details",
      header: t("table.details"),
      cell: (info) => {
        const log = info.row.original;
        return (
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-xl border-0 bg-muted/40 hover:bg-muted/65"
            onClick={() => setSelectedLog(log)}
          >
            <Info className="h-4 w-4" />
          </Button>
        );
      },
    }),
  ];

  const table = useReactTable({
    data: logs,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <RbacGuard allowedRoles={["ADMIN", "HR"]}>
      <div className="p-6 md:p-8 space-y-6 w-full">
        {/* Title Header */}
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground text-sm">{t("subTitle")}</p>
        </div>

        {/* Filter Toolbar */}
        <div className="flex items-center gap-4 pt-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t("searchPlaceholder")}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-10 h-10 rounded-2xl bg-muted/40 border-0 focus-visible:ring-1"
            />
          </div>
        </div>

        {/* Tabela Zebrada Sem Bordas */}
        <div className="w-full bg-transparent overflow-hidden">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-sm border-collapse text-left border-0">
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id} className="bg-muted/20 hover:bg-muted/20 border-0">
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="h-10 px-4 align-middle font-medium text-muted-foreground border-0"
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
                      <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr className="border-0">
                    <td
                      colSpan={columns.length}
                      className="h-24 text-center text-muted-foreground border-0"
                    >
                      Nenhum log de auditoria encontrado.
                    </td>
                  </tr>
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <tr
                      key={row.id}
                      className="odd:bg-muted/15 even:bg-transparent transition-colors hover:bg-muted/25 border-0"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="p-4 align-middle border-0">
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

        {/* Paginação */}
        {meta.lastPage > 1 && (
          <div className="flex items-center justify-end gap-2 pt-4">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-xl border-0 bg-muted/40"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <span className="text-xs text-muted-foreground font-medium px-2">
              Página {page} de {meta.lastPage}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-xl border-0 bg-muted/40"
              disabled={page >= meta.lastPage}
              onClick={() => setPage((p) => Math.min(meta.lastPage, p + 1))}
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* --- Details Dialog --- */}
        <Dialog open={!!selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)}>
          <DialogContent className="border-0 shadow-2xl rounded-2xl max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedLog?.action}</DialogTitle>
              <DialogDescription>
                Logs de auditoria registram informações de metadados para segurança corporativa.
              </DialogDescription>
            </DialogHeader>

            {selectedLog && (
              <div className="pt-2">
                <pre className="font-mono text-xs bg-muted/30 p-4 rounded-2xl overflow-x-auto max-h-[300px]">
                  {getPrettyDetails(selectedLog.details)}
                </pre>
              </div>
            )}

            <div className="flex justify-end pt-4">
              <Button
                variant="outline"
                onClick={() => setSelectedLog(null)}
                className="rounded-2xl border-0 bg-muted/40 hover:bg-muted/65"
              >
                Fechar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </RbacGuard>
  );
}
