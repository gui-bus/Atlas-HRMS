"use client";

import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import {
  Plus,
  Eye,
  Pencil,
  Trash,
  MagnifyingGlass,
  ArrowsDownUp,
  CircleNotch,
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
import { recruitmentService, Recruitment } from "@/services/recruitment.service";
import { RbacGuard } from "@/components/rbac-guard";
import { Button } from "@/components/ui/button";
import { Select, Option } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

export default function RecruitmentListPage() {
  const t = useTranslations("Recruitment");
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const locale = params?.locale || "pt";
  const { user } = useAuthStore();
  const isAdminOrHr = user?.role === "ADMIN" || user?.role === "HR";

  // State
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "ALL" | "OPEN" | "ON_HOLD" | "CLOSED" | "CANCELLED"
  >("ALL");

  // --- Fetch List ---
  const { data: recruitmentsData, isLoading } = useQuery({
    queryKey: ["recruitments"],
    queryFn: () => recruitmentService.getRecruitments(),
  });
  const recruitments = recruitmentsData?.data || [];

  // --- Delete Vacancy ---
  const deleteMutation = useMutation({
    mutationFn: (id: string) => recruitmentService.deleteRecruitment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recruitments"] });
    },
  });

  const getStatusLabel = (val: string) => {
    const statusMap = {
      OPEN: "Aberta",
      ON_HOLD: "Em Espera",
      CLOSED: "Encerrada",
      CANCELLED: "Cancelada",
    };
    return statusMap[val] || val;
  };

  const getSeniorityLabel = (val: string) => {
    const map = {
      JUNIOR: "Júnior",
      MID: "Pleno",
      SENIOR: "Sênior",
      LEAD: "Tech Lead",
      EXECUTIVE: "Diretoria",
    };
    return map[val] || val;
  };

  // Local Filter
  const filteredData = useMemo(() => {
    return recruitments.filter((r) => {
      if (statusFilter !== "ALL" && r.status !== statusFilter) return false;
      return true;
    });
  }, [recruitments, statusFilter]);

  const columnHelper = createColumnHelper<Recruitment>();
  const columns = [
    columnHelper.accessor("title", {
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-transparent p-0 text-muted-foreground font-semibold"
        >
          {t("form.title")}
          <ArrowsDownUp className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: (info) => <span className="font-semibold text-foreground">{info.getValue()}</span>,
    }),
    columnHelper.accessor("seniority", {
      header: t("form.seniority"),
      cell: (info) => (
        <span className="text-muted-foreground">{getSeniorityLabel(info.getValue())}</span>
      ),
    }),
    columnHelper.accessor("workModel", {
      header: t("form.workModel"),
      cell: (info) => {
        const val = info.getValue();
        const labels = { REMOTE: "Remoto", HYBRID: "Híbrido", ONSITE: "Presencial" };
        return <span className="text-muted-foreground">{labels[val] || val}</span>;
      },
    }),
    columnHelper.accessor("vacancies", {
      header: "Vagas",
      cell: (info) => (
        <span className="text-muted-foreground font-semibold">{info.getValue()}</span>
      ),
    }),
    columnHelper.accessor("status", {
      header: "Status",
      cell: (info) => {
        const val = info.getValue();
        const colors = {
          OPEN: "bg-emerald-500/10 text-emerald-500",
          ON_HOLD: "bg-amber-500/10 text-amber-500",
          CLOSED: "bg-muted text-muted-foreground",
          CANCELLED: "bg-destructive/10 text-destructive",
        };
        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${colors[val]}`}
          >
            {getStatusLabel(val)}
          </span>
        );
      },
    }),
    columnHelper.display({
      id: "actions",
      header: "Ações",
      cell: (info) => {
        const id = info.row.original.id;
        return (
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-xl border-0 bg-muted/40 hover:bg-muted/65"
              onClick={() => router.push(`/${locale}/recruitment/${id}`)}
              title="Quadro Kanban"
            >
              <Eye className="h-4 w-4" />
            </Button>
            {isAdminOrHr && (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-xl border-0 bg-muted/40 hover:bg-muted/65 text-primary"
                  onClick={() => router.push(`/${locale}/recruitment/${id}/edit`)}
                  title="Editar Vaga"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:bg-destructive/10 rounded-xl border-0"
                  disabled={deleteMutation.isPending}
                  onClick={() => deleteMutation.mutate(id)}
                  title="Excluir"
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </>
            )}
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
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
            <p className="text-muted-foreground text-sm">{t("subTitle")}</p>
          </div>
          {isAdminOrHr && (
            <Button
              onClick={() => router.push(`/${locale}/recruitment/new`)}
              className="gap-2 rounded-2xl animate-fade-in"
            >
              <Plus className="h-4 w-4" />
              {t("addJob")}
            </Button>
          )}
        </div>

        {/* Toolbar */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <MagnifyingGlass className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Pesquisar vaga..."
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
            <Option value="OPEN">Aberta</Option>
            <Option value="ON_HOLD">Em Espera</Option>
            <Option value="CLOSED">Encerrada</Option>
            <Option value="CANCELLED">Cancelada</Option>
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
                      Nenhuma vaga cadastrada.
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
