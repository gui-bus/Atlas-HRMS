"use client";

import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import {
  Check,
  X,
  MagnifyingGlass,
  ArrowsDownUp,
  CircleNotch,
  CaretLeft,
  CaretRight,
} from "@phosphor-icons/react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
  SortingState,
} from "@tanstack/react-table";

import { useAuthStore } from "@/store/useAuthStore";
import { vacationService, Vacation } from "@/services/vacation.service";
import { RbacGuard } from "@/components/rbac-guard";
import { Button } from "@/components/ui/button";
import { Select, Option } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

export default function VacationsAdminPage() {
  const t = useTranslations("Absences");
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const locale = params?.locale || "pt";

  // State
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED">(
    "ALL",
  );
  const [page, setPage] = useState(1);

  // Fetch
  const { data: vacationsData, isLoading } = useQuery({
    queryKey: ["vacations", page],
    queryFn: () => vacationService.getVacations({ page, limit: 10 }),
  });
  const vacations = vacationsData?.data || [];
  const totalPages = vacationsData?.totalPages || 1;

  // Approve Mutation
  const approveMutation = useMutation({
    mutationFn: (id: string) => vacationService.updateVacationStatus(id, { status: "APPROVED" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vacations"] });
    },
  });

  // Local Filter
  const filteredData = useMemo(() => {
    return vacations.filter((v) => {
      if (statusFilter !== "ALL" && v.status !== statusFilter) return false;
      return true;
    });
  }, [vacations, statusFilter]);

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  const columnHelper = createColumnHelper<Vacation>();
  const columns = [
    columnHelper.accessor((row) => `${row.employee?.firstName} ${row.employee?.lastName}`, {
      id: "employee",
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
    columnHelper.accessor("startDate", {
      header: "Data de Início",
      cell: (info) => <span className="text-muted-foreground">{formatDate(info.getValue())}</span>,
    }),
    columnHelper.accessor("endDate", {
      header: "Data de Fim",
      cell: (info) => <span className="text-muted-foreground">{formatDate(info.getValue())}</span>,
    }),
    columnHelper.accessor("comments", {
      header: "Comentários",
      cell: (info) => (
        <span className="text-muted-foreground text-xs">{info.getValue() || "—"}</span>
      ),
    }),
    columnHelper.accessor("status", {
      header: "Status",
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
    columnHelper.display({
      id: "actions",
      header: "Ações",
      cell: (info) => {
        const row = info.row.original;
        if (row.status !== "PENDING")
          return <span className="text-muted-foreground/60 text-xs">—</span>;

        return (
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 text-emerald-500 hover:bg-emerald-500/10 rounded-xl border-0"
              disabled={approveMutation.isPending}
              onClick={() => approveMutation.mutate(row.id)}
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 text-destructive hover:bg-destructive/10 rounded-xl border-0"
              onClick={() => router.push(`/${locale}/absences/vacations/${row.id}/reject`)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    }),
  ];

  const table = useReactTable({
    data: filteredData,
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
          <h1 className="text-2xl font-bold tracking-tight">Controle de Férias</h1>
          <p className="text-muted-foreground text-sm">
            Visualize, aprove ou rejeite solicitações de férias anuais.
          </p>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <MagnifyingGlass className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Pesquisar colaborador..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="pl-10 h-10 rounded-2xl bg-muted/40 border-0 focus-visible:ring-1"
            />
          </div>

          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="flex h-10 w-full md:w-[180px] rounded-2xl border border-transparent bg-muted/45 px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring outline-none cursor-pointer transition-colors"
          >
            <Option value="ALL">Todos os status</Option>
            <Option value="PENDING">Pendentes</Option>
            <Option value="APPROVED">Aprovados</Option>
            <Option value="REJECTED">Rejeitados</Option>
          </Select>
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
                ) : filteredData.length === 0 ? (
                  <tr className="border-0">
                    <td
                      colSpan={columns.length}
                      className="h-24 text-center text-muted-foreground border-0"
                    >
                      Nenhuma solicitação de férias encontrada.
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

        {/* Pagination controls */}
        {!isLoading && totalPages > 1 && (
          <div className="flex items-center justify-end gap-2 pt-4">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-xl border-0 bg-muted/40"
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
            >
              <CaretLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium px-2 text-muted-foreground">
              {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-xl border-0 bg-muted/40"
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={page === totalPages}
            >
              <CaretRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </RbacGuard>
  );
}
