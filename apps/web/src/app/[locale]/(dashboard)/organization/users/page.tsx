"use client";

import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import {
  MagnifyingGlass,
  ArrowsDownUp,
  CircleNotch,
  Eye,
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

import { userAccountService, UserAccount } from "@/services/user-account.service";
import { RbacGuard } from "@/components/rbac-guard";
import { PageHeader } from "@/components/page-header";
import { Input } from "@/components/ui/input";
import { Select, Option } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
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

export default function UserAccountsPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params?.locale || "pt";
  const t = useTranslations("Users");
  // State
  const [globalFilter, setGlobalFilter] = useState("");
  const [roleFilter, setRoleFilter] = useQueryState("role", parseAsString.withDefault("ALL"));
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [sortBy, setSortBy] = useQueryState("sortBy", parseAsString.withDefault(""));
  const [sortOrder, setSortOrder] = useQueryState("sortOrder", parseAsString.withDefault(""));

  // --- Fetch List ---
  const { data: accountsData, isLoading } = useQuery({
    queryKey: ["user-accounts", { page, sortBy, sortOrder }],
    queryFn: () =>
      userAccountService.getUserAccounts({
        page,
        limit: 10,
        sortBy: sortBy || undefined,
        sortOrder: sortOrder || undefined,
      }),
  });
  const accounts = accountsData?.data || [];
  const totalPages = accountsData?.totalPages || 1;

  const getRoleLabel = (role: string) => {
    const rolesMap: Record<string, string> = {
      ADMIN: t("roles.ADMIN"),
      HR: t("roles.HR"),
      MANAGER: t("roles.MANAGER"),
      EMPLOYEE: t("roles.EMPLOYEE"),
    };
    return rolesMap[role] || role;
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString(locale === "pt" ? "pt-BR" : locale === "es" ? "es-ES" : "en-US");
    } catch {
      return dateString;
    }
  };

  // Local Filter
  const filteredData = useMemo(() => {
    return accounts.filter((acc) => {
      if (roleFilter !== "ALL" && acc.role !== roleFilter) return false;
      return true;
    });
  }, [accounts, roleFilter]);

  const columnHelper = createColumnHelper<UserAccount>();
  const columns = [
    columnHelper.accessor("email", {
      header: t("table.email"),
      cell: (info) => <span className="font-semibold text-foreground">{info.getValue()}</span>,
    }),
    columnHelper.accessor("role", {
      header: t("table.role"),
      cell: (info) => {
        const val = info.getValue();
        const colors: Record<string, string> = {
          ADMIN: "bg-primary/10 text-primary",
          HR: "bg-emerald-500/10 text-emerald-500",
          MANAGER: "bg-amber-500/10 text-amber-500",
          EMPLOYEE: "bg-muted text-muted-foreground",
        };
        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${colors[val] ?? "bg-muted text-muted-foreground"}`}
          >
            {getRoleLabel(val)}
          </span>
        );
      },
    }),
    columnHelper.accessor("createdAt", {
      header: t("table.createdAt"),
      cell: (info) => <span className="text-muted-foreground">{formatDate(info.getValue())}</span>,
    }),
    columnHelper.display({
      id: "actions",
      header: t("table.actions"),
      cell: (info) => {
        const rowData = info.row.original;
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-xl border-0 bg-muted/40 hover:bg-muted/65 text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => router.push(`/${locale}/organization/users/${rowData.id}`)}
            >
              <Eye className="h-4 w-4" />
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
    <RbacGuard allowedRoles={["ADMIN", "HR"]}>
      <div className="p-6 md:p-8 space-y-6 w-full animate-fade-in">
        {/* Title Header */}
        <PageHeader
          title={t("title")}
          subTitle={t("subTitle")}
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
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="flex h-10 w-full md:w-[200px] rounded-2xl border border-transparent bg-muted/45 px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring outline-none cursor-pointer transition-colors"
          >
            <Option value="ALL">{t("allRoles")}</Option>
            <Option value="ADMIN">{t("roles.ADMIN")}</Option>
            <Option value="HR">{t("roles.HR")}</Option>
            <Option value="MANAGER">{t("roles.MANAGER")}</Option>
            <Option value="EMPLOYEE">{t("roles.EMPLOYEE")}</Option>
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
