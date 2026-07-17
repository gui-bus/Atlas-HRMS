"use client";

import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import {
  Eye,
  Pencil,
  Trash,
  MagnifyingGlass,
  ArrowsDownUp,
  CircleNotch,
  CaretLeft,
  CaretRight,
  CaretUp,
  CaretDown,
  CaretUpDown,
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
import { useQueryState, parseAsInteger, parseAsString } from "nuqs";

import { useAuthStore } from "@/store/useAuthStore";
import { recruitmentService, Recruitment } from "@/services/recruitment.service";
import { RbacGuard } from "@/components/rbac-guard";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Select, Option } from "@/components/ui/select";
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

export default function RecruitmentListPage() {
  const t = useTranslations("Recruitment");
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const locale = params?.locale || "pt";
  const { user } = useAuthStore();
  const isAdminOrHr = user?.role === "ADMIN" || user?.role === "HR";

  // State
  const [globalFilter, setGlobalFilter] = useState("");
  const [statusFilter, setStatusFilter] = useQueryState("status", parseAsString.withDefault("ALL"));
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [sortBy, setSortBy] = useQueryState("sortBy", parseAsString.withDefault(""));
  const [sortOrder, setSortOrder] = useQueryState("sortOrder", parseAsString.withDefault(""));

  // --- Fetch List ---
  const { data: recruitmentsData, isLoading } = useQuery({
    queryKey: ["recruitments", { page, sortBy, sortOrder }],
    queryFn: () =>
      recruitmentService.getRecruitments({
        page,
        limit: 10,
        sortBy: sortBy || undefined,
        sortOrder: sortOrder || undefined,
      }),
  });
  const recruitments = recruitmentsData?.data || [];
  const totalPages = recruitmentsData?.totalPages || 1;

  // --- Delete Vacancy ---
  const deleteMutation = useMutation({
    mutationFn: (id: string) => recruitmentService.deleteRecruitment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recruitments"] });
    },
  });

  const getStatusLabel = (val: string) => {
    const map: Record<string, string> = {
      DRAFT: t("status.DRAFT"),
      OPEN: t("status.OPEN"),
      ON_HOLD: t("status.ON_HOLD"),
      CLOSED: t("status.CLOSED"),
      CANCELLED: t("status.CANCELLED"),
    };
    return map[val] || val;
  };

  const getSeniorityLabel = (val: string) => {
    const map: Record<string, string> = {
      JUNIOR: t("seniority.JUNIOR"),
      MID: t("seniority.MID"),
      SENIOR: t("seniority.SENIOR"),
      LEAD: t("seniority.LEAD"),
      EXECUTIVE: t("seniority.EXECUTIVE"),
    };
    return map[val] ?? val;
  };

  const getWorkModelLabel = (val: string) => {
    const map: Record<string, string> = {
      REMOTE: t("workModelOptions.REMOTE"),
      HYBRID: t("workModelOptions.HYBRID"),
      ONSITE: t("workModelOptions.ONSITE"),
    };
    return map[val] ?? val;
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
      header: t("form.title"),
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
      cell: (info) => (
        <span className="text-muted-foreground">{getWorkModelLabel(info.getValue())}</span>
      ),
    }),
    columnHelper.accessor("vacancies", {
      header: t("table.vacancies"),
      cell: (info) => (
        <span className="text-muted-foreground font-semibold">{info.getValue()}</span>
      ),
    }),
    columnHelper.accessor("status", {
      header: t("table.status"),
      cell: (info) => {
        const val = info.getValue();
        if (!val) return <span className="text-muted-foreground">—</span>;
        const colors: Record<string, string> = {
          DRAFT: "bg-blue-500/10 text-blue-500",
          OPEN: "bg-emerald-500/10 text-emerald-500",
          ON_HOLD: "bg-amber-500/10 text-amber-500",
          CLOSED: "bg-muted text-muted-foreground",
          CANCELLED: "bg-destructive/10 text-destructive",
        };
        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
              colors[val] ?? "bg-muted text-muted-foreground"
            }`}
          >
            {getStatusLabel(val)}
          </span>
        );
      },
    }),
    columnHelper.display({
      id: "actions",
      header: t("table.actions"),
      cell: (info) => {
        const id = info.row.original.id;
        return (
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-xl border-0 bg-muted/40 hover:bg-muted/65"
              onClick={() => router.push(`/${locale}/recruitment/${id}`)}
              title={t("actions.kanban")}
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
                  title={t("actions.edit")}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:bg-destructive/10 rounded-xl border-0"
                  disabled={deleteMutation.isPending}
                  onClick={() => deleteMutation.mutate(id)}
                  title={t("actions.delete")}
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

  const sorting = React.useMemo(() => {
    return sortBy && sortOrder ? [{ id: sortBy, desc: sortOrder === "desc" }] : [];
  }, [sortBy, sortOrder]);

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: (updater: any) => {
      const nextState = typeof updater === "function" ? updater(sorting) : updater;
      const sort = nextState[0];
      if (sort) {
        setSortBy(sort.id);
        setSortOrder(sort.desc ? "desc" : "asc");
      } else {
        setSortBy("");
        setSortOrder("");
      }
      setPage(1);
    },
    onGlobalFilterChange: setGlobalFilter,
    manualSorting: true,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <RbacGuard allowedRoles={["ADMIN", "HR", "MANAGER"]}>
      <div className="p-6 md:p-8 space-y-6 w-full animate-fade-in">
        {/* Title Header */}
        <PageHeader
          title={t("title")}
          subTitle={t("subTitle")}
          buttonText={isAdminOrHr ? t("addJob") : undefined}
          buttonLink={`/${locale}/recruitment/new`}
        />

        {/* Toolbar */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <MagnifyingGlass className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t("searchPlaceholder")}
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
            <Option value="ALL">{t("allStatuses")}</Option>
            <Option value="OPEN">{t("status.OPEN")}</Option>
            <Option value="ON_HOLD">{t("status.ON_HOLD")}</Option>
            <Option value="CLOSED">{t("status.CLOSED")}</Option>
            <Option value="CANCELLED">{t("status.CANCELLED")}</Option>
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
                        onClick={
                          header.column.getCanSort()
                            ? header.column.getToggleSortingHandler()
                            : undefined
                        }
                        className={`h-10 px-4 align-middle font-medium text-muted-foreground border-0 ${
                          header.column.getCanSort() ? "cursor-pointer select-none" : ""
                        } ${index === 0 ? "w-full" : "w-auto shrink-0 whitespace-nowrap"}`}
                      >
                        <div className="flex items-center gap-1">
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {header.column.getCanSort() &&
                            ({
                              asc: <CaretUp className="h-4 w-4" />,
                              desc: <CaretDown className="h-4 w-4" />,
                            }[header.column.getIsSorted() as string] ?? (
                              <CaretUpDown className="h-4 w-4 opacity-50" />
                            ))}
                        </div>
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

        {/* Pagination controls */}
        {!isLoading && totalPages > 1 && (
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
      </div>
    </RbacGuard>
  );
}
