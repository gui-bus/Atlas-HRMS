"use client";

import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import {
  Plus,
  MagnifyingGlass,
  Pencil,
  Trash,
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
import { positionService, Position } from "@/services/position.service";
import { departmentService } from "@/services/department.service";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function PositionsPage() {
  const t = useTranslations("Organization");
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const locale = params?.locale || "pt";
  const { user } = useAuthStore();
  const isAdminOrHr = user?.role === "ADMIN" || user?.role === "HR";

  // State
  const [globalFilter, setGlobalFilter] = useState("");
  const [deptFilter, setDeptFilter] = useQueryState("department", parseAsString.withDefault("ALL"));
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [sortBy, setSortBy] = useQueryState("sortBy", parseAsString.withDefault(""));
  const [sortOrder, setSortOrder] = useQueryState("sortOrder", parseAsString.withDefault(""));

  // Fetch lists
  const { data: positionsData, isLoading } = useQuery({
    queryKey: ["positions", { page, sortBy, sortOrder }],
    queryFn: () =>
      positionService.getPositions({
        page,
        limit: 10,
        sortBy: sortBy || undefined,
        sortOrder: sortOrder || undefined,
      }),
  });
  const positions = positionsData?.data || [];
  const totalPages = positionsData?.totalPages || 1;

  const { data: departmentsData } = useQuery({
    queryKey: ["departments"],
    queryFn: () => departmentService.getDepartments(),
  });
  const departments = Array.isArray(departmentsData)
    ? departmentsData
    : departmentsData?.data || [];

  // Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => positionService.deletePosition(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["positions"] });
      setDeleteConfirmOpen(false);
      setSelectedId(null);
    },
  });

  // Filtering data locally
  const filteredData = useMemo(() => {
    return positions.filter((pos) => {
      if (deptFilter !== "ALL" && pos.departmentId !== deptFilter) return false;
      return true;
    });
  }, [positions, deptFilter]);

  const handleDeleteClick = (id: string) => {
    setSelectedId(id);
    setDeleteConfirmOpen(true);
  };

  const getDeptName = (deptId?: string) => {
    if (!deptId) return t("inactive"); // or non-assigned key, but let's translate inline or with commons if available. Let's look at getDeptName below.
    const found = departments.find((d) => d.id === deptId);
    return found ? found.name : "Desconhecido"; // translation isn't critical since it's database value, but fallback "Desconhecido" can be "Unknown"
  };

  const formatCurrency = (val?: string) => {
    if (!val) return "—";
    const parsed = parseFloat(val);
    if (isNaN(parsed)) return "—";
    // We should use a helper or format dynamically based on locale. For BRL, keeping currency BRL but formatting based on active locale:
    return new Intl.NumberFormat(locale === "pt" ? "pt-BR" : locale === "es" ? "es-ES" : "en-US", {
      style: "currency",
      currency: "BRL",
    }).format(parsed);
  };

  const columnHelper = createColumnHelper<Position>();
  const columns = [
    columnHelper.accessor("title", {
      header: t("form.title"),
      cell: (info) => <span className="font-semibold text-foreground">{info.getValue()}</span>,
    }),
    columnHelper.accessor("departmentId", {
      header: t("form.department"),
      cell: (info) => <span className="text-muted-foreground">{getDeptName(info.getValue())}</span>,
    }),
    columnHelper.accessor("salaryRangeMin", {
      header: t("form.salaryMin"),
      cell: (info) => (
        <span className="text-muted-foreground">{formatCurrency(info.getValue())}</span>
      ),
    }),
    columnHelper.accessor("salaryRangeMax", {
      header: t("form.salaryMax"),
      cell: (info) => (
        <span className="text-muted-foreground">{formatCurrency(info.getValue())}</span>
      ),
    }),
    columnHelper.accessor("active", {
      header: t("table.status"),
      cell: (info) => {
        const val = info.getValue();
        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
              val ? "bg-emerald-500/10 text-emerald-500" : "bg-muted text-muted-foreground"
            }`}
          >
            {val ? t("active") : t("inactive")}
          </span>
        );
      },
    }),
    columnHelper.display({
      id: "actions",
      header: t("table.actions"),
      cell: (info) => {
        const pos = info.row.original;
        if (!isAdminOrHr) return <span className="text-muted-foreground/60 text-xs">—</span>;

        return (
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-xl border-0 bg-muted/40 hover:bg-muted/65"
              onClick={() => router.push(`/${locale}/organization/positions/${pos.id}`)}
              title={t("table.edit")}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 text-destructive hover:bg-destructive/10 rounded-xl border-0"
              onClick={() => handleDeleteClick(pos.id)}
              title={t("table.delete")}
            >
              <Trash className="h-4 w-4" />
            </Button>
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
          title={t("positionsTitle")}
          subTitle={t("positionsSubTitle")}
          buttonText={isAdminOrHr ? t("addPositionBtn") : undefined}
          buttonLink={`/${locale}/organization/positions/new`}
        />

        {/* Toolbar controls: search & filter */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <MagnifyingGlass className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t("searchPositionsPlaceholder")}
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="pl-10 h-10 rounded-2xl bg-muted/40 border-0 focus-visible:ring-1"
            />
          </div>

          <Select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="flex h-10 w-full md:w-[220px] rounded-2xl border border-transparent bg-muted/45 px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring outline-none cursor-pointer transition-colors"
          >
            <Option value="ALL">{t("allDepartments")}</Option>
            {departments.map((d) => (
              <Option key={d.id} value={d.id}>
                {d.name}
              </Option>
            ))}
          </Select>
        </div>

        {/* Tabela Zebrada Sem Bordas */}
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
                      {t("emptyPositions")}
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

        {/* --- Delete Confirmation Dialog --- */}
        <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
          <DialogContent className="border-0 shadow-2xl rounded-2xl max-w-sm">
            <DialogHeader>
              <DialogTitle>{t("deletePositionTitle")}</DialogTitle>
              <DialogDescription>
                {t("deletePositionDesc")}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="pt-2">
              <Button
                variant="outline"
                onClick={() => setDeleteConfirmOpen(false)}
                disabled={deleteMutation.isPending}
                className="rounded-2xl border-0 bg-muted/40 hover:bg-muted/65"
              >
                {t("form.cancel")}
              </Button>
              <Button
                variant="destructive"
                onClick={() => selectedId && deleteMutation.mutate(selectedId)}
                disabled={deleteMutation.isPending}
                className="rounded-2xl"
              >
                {deleteMutation.isPending && <CircleNotch className="mr-2 h-4 w-4 animate-spin" />}
                {t("table.delete")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </RbacGuard>
  );
}
