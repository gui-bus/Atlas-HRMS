"use client";

import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { Plus, Eye, Trash, Loader2 } from "lucide-react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";

import { recruitmentService, Recruitment } from "@/services/recruitment.service";
import { Button } from "@/components/ui/button";

export default function RecruitmentListPage() {
  const t = useTranslations("Recruitment");
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const locale = params?.locale || "pt";

  // --- Fetch List ---
  const { data: recruitmentsResponse, isLoading } = useQuery({
    queryKey: ["recruitments"],
    queryFn: () => recruitmentService.getRecruitments(),
  });
  const recruitments = recruitmentsResponse?.data || [];

  // --- Mutation ---
  const deleteMutation = useMutation({
    mutationFn: (id: string) => recruitmentService.deleteRecruitment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recruitments"] });
    },
  });

  const getStatusLabel = (status: string) => {
    const map = {
      DRAFT: "Rascunho",
      OPEN: "Aberta",
      CLOSED: "Encerrada",
      CANCELLED: "Cancelada",
    };
    return map[status as keyof typeof map] || status;
  };

  const getWorkModelLabel = (model: string) => {
    const map = {
      REMOTE: "Remoto",
      HYBRID: "Híbrido",
      ONSITE: "Presencial",
    };
    return map[model as keyof typeof map] || model;
  };

  // --- Tables Setup ---
  const columnHelper = createColumnHelper<Recruitment>();
  const columns = [
    columnHelper.accessor("title", {
      header: t("form.title"),
      cell: (info) => <span className="font-semibold text-foreground">{info.getValue()}</span>,
    }),
    columnHelper.accessor("department.name", {
      id: "department",
      header: t("form.department"),
      cell: (info) => <span className="text-muted-foreground">{info.getValue() || "—"}</span>,
    }),
    columnHelper.accessor("workModel", {
      header: t("form.workModel"),
      cell: (info) => (
        <span className="text-muted-foreground">{getWorkModelLabel(info.getValue())}</span>
      ),
    }),
    columnHelper.accessor("status", {
      header: t("form.status"),
      cell: (info) => {
        const val = info.getValue();
        const colors = {
          DRAFT: "bg-muted text-muted-foreground",
          OPEN: "bg-emerald-500/10 text-emerald-500",
          CLOSED: "bg-destructive/10 text-destructive",
          CANCELLED: "bg-amber-500/10 text-amber-500",
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
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 text-destructive hover:bg-destructive/10 rounded-xl border-0"
              disabled={deleteMutation.isPending}
              onClick={() => deleteMutation.mutate(id)}
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    }),
  ];

  const table = useReactTable({
    data: recruitments,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="p-6 md:p-8 space-y-6 w-full">
      {/* Title Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground text-sm">{t("subTitle")}</p>
        </div>
        <Button
          onClick={() => router.push(`/${locale}/recruitment/new`)}
          className="gap-2 rounded-2xl"
        >
          <Plus className="h-4 w-4" />
          {t("addJob")}
        </Button>
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
              ) : recruitments.length === 0 ? (
                <tr className="border-0">
                  <td
                    colSpan={columns.length}
                    className="h-24 text-center text-muted-foreground border-0"
                  >
                    Nenhum processo seletivo cadastrado.
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
    </div>
  );
}
