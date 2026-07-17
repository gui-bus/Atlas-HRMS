"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import {
  MagnifyingGlass,
  Eye,
  Trash,
  CircleNotch,
  CaretUp,
  CaretDown,
  CaretUpDown,
} from "@phosphor-icons/react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import { useQueryState, parseAsInteger, parseAsString } from "nuqs";

import { employeeService, EmployeeWithDetails } from "@/services/employee.service";
import { RbacGuard } from "@/components/rbac-guard";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Select, Option } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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

export default function EmployeesListPage() {
  const t = useTranslations("Employees");
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const locale = params?.locale || "pt";

  const [search, setSearch] = useQueryState("search", parseAsString.withDefault(""));
  const [status, setStatus] = useQueryState("status", parseAsString.withDefault(""));
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [sortBy, setSortBy] = useQueryState("sortBy", parseAsString.withDefault(""));
  const [sortOrder, setSortOrder] = useQueryState("sortOrder", parseAsString.withDefault(""));
  const limit = 10;

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["employees", { page, limit, search, status, sortBy, sortOrder }],
    queryFn: () =>
      employeeService.getEmployees({
        page,
        limit,
        search: search || undefined,
        status: status || undefined,
        sortBy: sortBy || undefined,
        sortOrder: (sortOrder as "asc" | "desc") || undefined,
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => employeeService.deleteEmployee(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      setDeleteConfirmOpen(false);
      setSelectedEmployeeId(null);
    },
  });

  const handleDeleteClick = (id: string) => {
    setSelectedEmployeeId(id);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedEmployeeId) {
      deleteMutation.mutate(selectedEmployeeId);
    }
  };

  const columnHelper = createColumnHelper<EmployeeWithDetails>();

  const columns = [
    columnHelper.accessor((row) => `${row.firstName} ${row.lastName}`, {
      id: "name",
      header: t("table.name"),
      cell: (info) => <span className="font-medium text-foreground">{info.getValue()}</span>,
    }),
    columnHelper.accessor("email", {
      header: t("table.email"),
      cell: (info) => <span className="text-muted-foreground">{info.getValue()}</span>,
    }),
    columnHelper.accessor("phone", {
      header: t("table.phone"),
      cell: (info) => <span className="text-muted-foreground">{info.getValue()}</span>,
    }),
    columnHelper.accessor("status", {
      header: t("table.status"),
      cell: (info) => {
        const val = info.getValue();
        let badgeVariant: "success" | "secondary" | "destructive" | "default" = "default";
        let statusLabel: string = val;

        if (val === "ACTIVE") {
          badgeVariant = "success";
          statusLabel = t("statusActive");
        } else if (val === "INACTIVE") {
          badgeVariant = "secondary";
          statusLabel = t("statusInactive");
        } else if (val === "ON_LEAVE") {
          badgeVariant = "secondary";
          statusLabel = t("statusOnLeave");
        } else if (val === "SUSPENDED") {
          badgeVariant = "destructive";
          statusLabel = t("statusSuspended");
        }

        return <Badge variant={badgeVariant}>{statusLabel}</Badge>;
      },
    }),
    columnHelper.accessor("hireDate", {
      header: t("table.hireDate"),
      cell: (info) => {
        try {
          return new Date(info.getValue()).toLocaleDateString(
            locale === "en" ? "en-US" : locale === "es" ? "es-ES" : "pt-BR",
          );
        } catch {
          return "-";
        }
      },
    }),
    columnHelper.accessor("salary", {
      header: t("table.salary"),
      cell: (info) => {
        const salaryNum = parseFloat(info.getValue());
        if (isNaN(salaryNum)) return "-";
        return new Intl.NumberFormat(
          locale === "en" ? "en-US" : locale === "es" ? "es-ES" : "pt-BR",
          {
            style: "currency",
            currency: locale === "en" ? "USD" : locale === "es" ? "EUR" : "BRL",
          },
        ).format(salaryNum);
      },
    }),
    columnHelper.display({
      id: "actions",
      header: t("table.actions"),
      cell: (info) => {
        const emp = info.row.original;
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => router.push(`/${locale}/employees/${emp.id}`)}
              title={t("table.viewProfile")}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 text-destructive hover:bg-destructive/10"
              onClick={() => handleDeleteClick(emp.id)}
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
    data: data?.data || [],
    columns,
    state: { sorting },
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
    manualSorting: true,
    getCoreRowModel: getCoreRowModel(),
  });

  const totalPages = (data as any)?.totalPages || 1;

  return (
    <RbacGuard allowedRoles={["ADMIN", "HR", "MANAGER"]}>
      <div className="p-6 md:p-8 space-y-6">
        <PageHeader
          title={t("title")}
          subTitle={t("subTitle")}
          buttonText={t("addEmployee")}
          buttonLink={`/${locale}/employees/new`}
        />

        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <MagnifyingGlass className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("searchPlaceholder")}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-10 h-10 rounded-2xl border-0 bg-muted/40 hover:bg-muted/50 focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors"
            />
          </div>
          <Select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="flex h-10 w-full md:w-[180px] rounded-2xl border-0 bg-muted/40 hover:bg-muted/50 px-4 text-sm outline-none focus:outline-none transition-colors cursor-pointer"
          >
            <Option value="">{t("table.status")}</Option>
            <Option value="ACTIVE">{t("statusActive")}</Option>
            <Option value="INACTIVE">{t("statusInactive")}</Option>
            <Option value="ON_LEAVE">{t("statusOnLeave")}</Option>
            <Option value="SUSPENDED">{t("statusSuspended")}</Option>
          </Select>
        </div>

        {/* Table section */}
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
                        className={`h-10 px-4 align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 border-0 ${
                          header.column.getCanSort() ? "cursor-pointer select-none" : ""
                        } ${index === 0 ? "w-full" : "w-auto shrink-0 whitespace-nowrap"}`}
                      >
                        <div className="flex items-center gap-1">
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
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
                ) : isError ? (
                  <tr className="border-0">
                    <td
                      colSpan={columns.length}
                      className="h-24 text-center text-destructive border-0"
                    >
                      {t("form.errorLoading")}
                    </td>
                  </tr>
                ) : table.getRowModel().rows.length === 0 ? (
                  <tr className="border-0">
                    <td
                      colSpan={columns.length}
                      className="h-24 text-center text-muted-foreground border-0"
                    >
                      {t("form.notFound")}
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
                          className={`p-4 align-middle [&:has([role=checkbox])]:pr-0 border-0 ${
                            index === 0 ? "w-full" : "w-auto shrink-0 whitespace-nowrap"
                          }`}
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
        {!isLoading && !isError && totalPages > 1 && (
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

        {/* Delete confirmation dialog */}
        <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("table.deleteConfirmTitle")}</DialogTitle>
              <DialogDescription>{t("table.deleteConfirmDesc")}</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeleteConfirmOpen(false)}
                disabled={deleteMutation.isPending}
              >
                {t("table.cancel")}
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirmDelete}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? (
                  <CircleNotch className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                {t("table.confirm")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </RbacGuard>
  );
}
