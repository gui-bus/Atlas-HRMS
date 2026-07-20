"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { Info, CircleNotch, MagnifyingGlass } from "@phosphor-icons/react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import { useQueryState, parseAsInteger, parseAsString } from "nuqs";

import { auditService, AuditLog } from "@/services/audit.service";
import { RbacGuard } from "@/components/rbac-guard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationLink,
  PaginationEllipsis,
  getPageNumbers,
} from "@/components/ui/pagination";
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

  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [search, setSearch] = useQueryState("search", parseAsString.withDefault(""));
  const [logId, setLogId] = useQueryState("logId", parseAsString.withDefault(""));

  
  const { data: auditResponse, isLoading } = useQuery({
    queryKey: ["audit-logs", page, search],
    queryFn: () => auditService.getAuditLogs({ page, limit: 15, search }),
    placeholderData: (keepPreviousData) => keepPreviousData,
  });

  const logs = auditResponse?.data || [];
  const totalPages = (auditResponse as any)?.totalPages || 1;

  const selectedLog = React.useMemo(() => {
    if (!logId) return null;
    return logs.find((l) => l.id === logId) || null;
  }, [logs, logId]);

  const getActionLabel = (action: string) => {
    const map: Record<string, string> = {
      USER_LOGIN_SUCCESS: t("actions.USER_LOGIN_SUCCESS"),
      USER_LOGIN_FAILED: t("actions.USER_LOGIN_FAILED"),
      EMPLOYEE_CREATED: t("actions.EMPLOYEE_CREATED"),
      EMPLOYEE_UPDATED: t("actions.EMPLOYEE_UPDATED"),
      EMPLOYEE_DELETED: t("actions.EMPLOYEE_DELETED"),
      DEPARTMENT_CREATED: t("actions.DEPARTMENT_CREATED"),
      DEPARTMENT_UPDATED: t("actions.DEPARTMENT_UPDATED"),
      DEPARTMENT_DELETED: t("actions.DEPARTMENT_DELETED"),
      POSITION_CREATED: t("actions.POSITION_CREATED"),
      POSITION_UPDATED: t("actions.POSITION_UPDATED"),
      POSITION_DELETED: t("actions.POSITION_DELETED"),
      VACATION_REQUESTED: t("actions.VACATION_REQUESTED"),
      VACATION_APPROVED: t("actions.VACATION_APPROVED"),
      VACATION_REJECTED: t("actions.VACATION_REJECTED"),
      LEAVE_REQUESTED: t("actions.LEAVE_REQUESTED"),
      LEAVE_APPROVED: t("actions.LEAVE_APPROVED"),
      LEAVE_REJECTED: t("actions.LEAVE_REJECTED"),
      CANDIDATE_STATUS_CHANGED: t("actions.CANDIDATE_STATUS_CHANGED"),
      DOCUMENT_UPLOADED: t("actions.DOCUMENT_UPLOADED"),
      DOCUMENT_DELETED: t("actions.DOCUMENT_DELETED"),
    };
    return map[action] || action;
  };

  const getPrettyDetails = (details?: string) => {
    if (!details) return t("noDetails");
    try {
      const parsed = JSON.parse(details);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return details;
    }
  };

  
  const columnHelper = createColumnHelper<AuditLog>();
  const columns = [
    columnHelper.accessor("action", {
      header: t("table.action"),
      cell: (info) => (
        <span className="font-semibold text-foreground font-mono text-xs">{getActionLabel(info.getValue())}</span>
      ),
    }),
    columnHelper.accessor("user", {
      header: t("table.user"),
      cell: (info) => {
        const u = info.getValue();
        return <span className="text-muted-foreground">{u?.email || t("publicAnonymous")}</span>;
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
            onClick={() => setLogId(log.id)}
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
        
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground text-sm">{t("subTitle")}</p>
        </div>

        
        <div className="flex items-center gap-4 pt-2">
          <div className="relative flex-1">
            <MagnifyingGlass className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
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
                ) : logs.length === 0 ? (
                  <tr className="border-0">
                    <td
                      colSpan={columns.length}
                      className="h-24 text-center text-muted-foreground border-0"
                    >
                      {t("empty")}
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

        
        {totalPages > 1 && (
          <Pagination className="justify-end pt-4">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setPage(Math.max(page - 1, 1))}
                  disabled={page === 1}
                />
              </PaginationItem>
              {getPageNumbers(page, totalPages).map((p, idx) => (
                <PaginationItem key={idx}>
                  {p === "ellipsis" ? (
                    <PaginationEllipsis />
                  ) : (
                    <PaginationLink isActive={page === p} onClick={() => setPage(p)}>
                      {p}
                    </PaginationLink>
                  )}
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  onClick={() => setPage(Math.min(page + 1, totalPages))}
                  disabled={page === totalPages}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}

        
        <Dialog open={!!logId} onOpenChange={(open) => !open && setLogId("")}>
          <DialogContent className="border-0 shadow-2xl rounded-2xl max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {selectedLog ? getActionLabel(selectedLog.action) : t("modalTitle")}
              </DialogTitle>
              <DialogDescription>
                {t("modalDescription")}
              </DialogDescription>
            </DialogHeader>

            {selectedLog && (
              <div className="pt-2">
                <pre className="font-mono text-xs bg-muted/30 p-4 rounded-2xl overflow-x-auto whitespace-pre-wrap break-all break-words max-h-[300px]">
                  {getPrettyDetails(selectedLog.details)}
                </pre>
              </div>
            )}

            <div className="flex justify-end pt-4">
              <Button
                variant="outline"
                onClick={() => setLogId("")}
                className="rounded-2xl border-0 bg-muted/40 hover:bg-muted/65"
              >
                {t("close")}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </RbacGuard>
  );
}
