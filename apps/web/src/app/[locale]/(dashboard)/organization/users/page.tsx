"use client";

import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { MagnifyingGlass, ArrowsDownUp, CircleNotch, Eye } from "@phosphor-icons/react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
  SortingState,
} from "@tanstack/react-table";

import { userAccountService, UserAccount } from "@/services/user-account.service";
import { RbacGuard } from "@/components/rbac-guard";
import { Input } from "@/components/ui/input";
import { Select, Option } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export default function UserAccountsPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params?.locale || "pt";
  const t = useTranslations("Common"); // Reuse dashboard translation scope or commons
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");

  // --- Fetch List ---
  const { data: accounts = [], isLoading } = useQuery({
    queryKey: ["user-accounts"],
    queryFn: () => userAccountService.getUserAccounts(),
  });

  const getRoleLabel = (role: string) => {
    const rolesMap = {
      ADMIN: "Administrador",
      HR: "Recursos Humanos",
      MANAGER: "Gestor",
      EMPLOYEE: "Colaborador",
    };
    return rolesMap[role] || role;
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
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
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-transparent p-0 text-muted-foreground font-semibold"
        >
          E-mail
          <ArrowsDownUp className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: (info) => <span className="font-semibold text-foreground">{info.getValue()}</span>,
    }),
    columnHelper.accessor("role", {
      header: "Nível de Acesso",
      cell: (info) => {
        const val = info.getValue();
        const colors = {
          ADMIN: "bg-primary/10 text-primary",
          HR: "bg-emerald-500/10 text-emerald-500",
          MANAGER: "bg-amber-500/10 text-amber-500",
          EMPLOYEE: "bg-muted text-muted-foreground",
        };
        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${colors[val]}`}
          >
            {getRoleLabel(val)}
          </span>
        );
      },
    }),
    columnHelper.accessor("createdAt", {
      header: "Data de Criação",
      cell: (info) => <span className="text-muted-foreground">{formatDate(info.getValue())}</span>,
    }),
    columnHelper.display({
      id: "actions",
      header: "Ações",
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
    <RbacGuard allowedRoles={["ADMIN", "HR"]}>
      <div className="p-6 md:p-8 space-y-6 w-full animate-fade-in">
        {/* Title Header */}
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Contas de Usuário</h1>
          <p className="text-muted-foreground text-sm">
            Visualize e gerencie os níveis de acesso das credenciais ativas no sistema.
          </p>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <MagnifyingGlass className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Pesquisar contas por e-mail..."
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
            <Option value="ALL">Todos os níveis</Option>
            <Option value="ADMIN">Administrador</Option>
            <Option value="HR">Recursos Humanos</Option>
            <Option value="MANAGER">Gestor</Option>
            <Option value="EMPLOYEE">Colaborador</Option>
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
                      Nenhuma conta cadastrada encontrada.
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
