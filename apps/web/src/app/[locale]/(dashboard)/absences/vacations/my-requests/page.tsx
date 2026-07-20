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
import { vacationService, Vacation } from "@/services/vacation.service";
import { RbacGuard } from "@/components/rbac-guard";
import { Button } from "@/components/ui/button";

export default function MyVacationsPage() {
  const t = useTranslations("Absences");
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const locale = params?.locale || "pt";

  
  const { data: employeesData, isLoading: loadingEmployee } = useQuery({
    queryKey: ["employees", { search: user?.email }],
    queryFn: () => employeeService.getEmployees({ search: user?.email }),
    enabled: !!user?.email,
  });

  const employee = employeesData?.data?.[0];
  const employeeId = employee?.id || "";

  
  const { data: myVacations = [], isLoading: loadingVacations } = useQuery({
    queryKey: ["my-vacations", employeeId],
    queryFn: () => vacationService.getEmployeeVacations(employeeId),
    enabled: !!employeeId,
  });

  
  const cancelVacationMutation = useMutation({
    mutationFn: (id: string) => vacationService.cancelVacation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-vacations", employeeId] });
    },
  });

  
  const [vSorting, setVSorting] = useState<SortingState>([]);

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  
  const vColumnHelper = createColumnHelper<Vacation>();
  const vacationColumns = [
    vColumnHelper.accessor("startDate", {
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
      cell: (info) => (
        <span className="font-semibold text-foreground">{formatDate(info.getValue())}</span>
      ),
    }),
    vColumnHelper.accessor("endDate", {
      header: t("endDate"),
      cell: (info) => <span className="text-muted-foreground">{formatDate(info.getValue())}</span>,
    }),
    vColumnHelper.accessor("comments", {
      header: t("comments"),
      cell: (info) => (
        <span className="text-muted-foreground text-xs">{info.getValue() || "—"}</span>
      ),
    }),
    vColumnHelper.accessor("status", {
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
    vColumnHelper.display({
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
            disabled={cancelVacationMutation.isPending}
            onClick={() => cancelVacationMutation.mutate(row.id)}
          >
            {t("cancel")}
          </Button>
        );
      },
    }),
  ];

  const vacationTable = useReactTable({
    data: myVacations,
    columns: vacationColumns,
    state: { sorting: vSorting },
    onSortingChange: setVSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <RbacGuard allowedRoles={["ADMIN", "HR", "MANAGER", "EMPLOYEE"]}>
      <div className="p-6 md:p-8 space-y-6 w-full animate-fade-in">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">Minhas Férias</h1>
            <p className="text-muted-foreground text-sm">
              Consulte seu histórico e gerencie suas solicitações de férias anuais.
            </p>
          </div>
          <Button
            onClick={() => router.push(`/${locale}/absences/vacations/new`)}
            className="gap-2 rounded-2xl"
          >
            <Plus className="h-4 w-4" />
            Solicitar Férias
          </Button>
        </div>

        
        <div className="w-full bg-transparent overflow-hidden">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-sm border-collapse text-left border-0">
              <thead>
                {vacationTable.getHeaderGroups().map((headerGroup) => (
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
                {loadingEmployee || loadingVacations ? (
                  <tr className="border-0">
                    <td colSpan={vacationColumns.length} className="h-24 text-center border-0">
                      Carregando solicitações...
                    </td>
                  </tr>
                ) : myVacations.length === 0 ? (
                  <tr className="border-0">
                    <td
                      colSpan={vacationColumns.length}
                      className="h-24 text-center text-muted-foreground border-0"
                    >
                      Nenhuma solicitação de férias registrada.
                    </td>
                  </tr>
                ) : (
                  vacationTable.getRowModel().rows.map((row) => (
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
