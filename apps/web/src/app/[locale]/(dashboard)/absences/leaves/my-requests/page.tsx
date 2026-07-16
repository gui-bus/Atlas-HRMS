"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { Calendar, Plus, ArrowsDownUp } from "@phosphor-icons/react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  SortingState,
} from "@tanstack/react-table";

import { useAuthStore } from "@/store/useAuthStore";
import { employeeService } from "@/services/employee.service";
import { vacationService, Leave } from "@/services/vacation.service";
import { RbacGuard } from "@/components/rbac-guard";
import { Button } from "@/components/ui/button";

export default function MyLeavesPage() {
  const t = useTranslations("Absences");
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const locale = params?.locale || "pt";

  // --- Fetch the Employee matching the logged-in user email ---
  const { data: employeesData, isLoading: loadingEmployee } = useQuery({
    queryKey: ["employees", { search: user?.email }],
    queryFn: () => employeeService.getEmployees({ search: user?.email }),
    enabled: !!user?.email,
  });

  const employee = employeesData?.data?.[0];
  const employeeId = employee?.id || "";

  // --- Fetch My History ---
  const { data: myLeaves = [], isLoading: loadingLeaves } = useQuery({
    queryKey: ["my-leaves", employeeId],
    queryFn: () => vacationService.getEmployeeLeaves(employeeId),
    enabled: !!employeeId,
  });

  // Cancel Mutations
  const cancelLeaveMutation = useMutation({
    mutationFn: (id: string) => vacationService.cancelLeave(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-leaves", employeeId] });
    },
  });

  // Table state
  const [lSorting, setLSorting] = useState<SortingState>([]);

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  // --- Leave Columns ---
  const lColumnHelper = createColumnHelper<Leave>();
  const leaveColumns = [
    lColumnHelper.accessor("type", {
      header: t("type"),
      cell: (info) => {
        const typeMap = {
          MEDICAL: t("medical"),
          PARENTAL: t("parental"),
          LEGAL: t("legal"),
          UNPAID: t("unpaid"),
          OTHER: t("other"),
        };
        return <span className="font-semibold text-foreground">{typeMap[info.getValue()]}</span>;
      },
    }),
    lColumnHelper.accessor("startDate", {
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-transparent p-0 text-muted-foreground font-semibold"
        >
          {t("startDate")}
          <ArrowsDownUp className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: (info) => <span className="text-muted-foreground">{formatDate(info.getValue())}</span>,
    }),
    lColumnHelper.accessor("endDate", {
      header: t("endDate"),
      cell: (info) => <span className="text-muted-foreground">{formatDate(info.getValue())}</span>,
    }),
    lColumnHelper.accessor("reason", {
      header: t("reason"),
      cell: (info) => (
        <span className="text-muted-foreground text-xs">{info.getValue() || "—"}</span>
      ),
    }),
    lColumnHelper.accessor("status", {
      header: t("status"),
      cell: (info) => {
        const val = info.getValue();
        const colors = {
          PENDING: "bg-amber-500/10 text-amber-500",
          APPROVED: "bg-emerald-500/10 text-emerald-500",
          REJECTED: "bg-destructive/10 text-destructive",
          CANCELLED: "bg-muted text-muted-foreground",
        };
        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${colors[val]}`}
          >
            {t(val.toLowerCase())}
          </span>
        );
      },
    }),
    lColumnHelper.display({
      id: "actions",
      header: t("actions"),
      cell: (info) => {
        const row = info.row.original;
        if (row.status !== "PENDING")
          return <span className="text-muted-foreground/60 text-xs">—</span>;
        return (
          <Button
            variant="outline"
            size="sm"
            className="text-destructive hover:bg-destructive/10 border-0 h-7"
            disabled={cancelLeaveMutation.isPending}
            onClick={() => cancelLeaveMutation.mutate(row.id)}
          >
            {t("cancel")}
          </Button>
        );
      },
    }),
  ];

  const leaveTable = useReactTable({
    data: myLeaves,
    columns: leaveColumns,
    state: { sorting: lSorting },
    onSortingChange: setLSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <RbacGuard allowedRoles={["ADMIN", "HR", "MANAGER", "EMPLOYEE"]}>
      <div className="p-6 md:p-8 space-y-6 w-full animate-fade-in">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">Meus Atestados & Licenças</h1>
            <p className="text-muted-foreground text-sm">
              Consulte seu histórico e gerencie suas solicitações de licenças e afastamentos.
            </p>
          </div>
          <Button
            onClick={() => router.push(`/${locale}/absences/leaves/new`)}
            className="gap-2 rounded-2xl"
          >
            <Plus className="h-4 w-4" />
            Solicitar Licença
          </Button>
        </div>

        {/* Leaves Table */}
        <div className="w-full bg-transparent overflow-hidden">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-sm border-collapse text-left border-0">
              <thead>
                {leaveTable.getHeaderGroups().map((headerGroup) => (
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
                {loadingEmployee || loadingLeaves ? (
                  <tr className="border-0">
                    <td colSpan={leaveColumns.length} className="h-24 text-center border-0">
                      Carregando solicitações...
                    </td>
                  </tr>
                ) : myLeaves.length === 0 ? (
                  <tr className="border-0">
                    <td
                      colSpan={leaveColumns.length}
                      className="h-24 text-center text-muted-foreground border-0"
                    >
                      Nenhuma solicitação de licença registrada.
                    </td>
                  </tr>
                ) : (
                  leaveTable.getRowModel().rows.map((row) => (
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
