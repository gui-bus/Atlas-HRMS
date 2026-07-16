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
import { departmentService, Department } from "@/services/department.service";
import { RbacGuard } from "@/components/rbac-guard";
import { Button } from "@/components/ui/button";
import { Select, Option } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function DepartmentsPage() {
  const t = useTranslations("Organization");
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const locale = params?.locale || "pt";
  const { user } = useAuthStore();
  const isAdminOrHr = user?.role === "ADMIN" || user?.role === "HR";

  // State
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Fetch
  const { data: departments = [], isLoading } = useQuery({
    queryKey: ["departments"],
    queryFn: () => departmentService.getDepartments(),
  });

  // Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => departmentService.deleteDepartment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      setDeleteConfirmOpen(false);
      setSelectedId(null);
    },
  });

  // Filtering data locally
  const filteredData = useMemo(() => {
    return departments.filter((dept) => {
      if (statusFilter === "ACTIVE") return dept.active === true;
      if (statusFilter === "INACTIVE") return dept.active === false;
      return true;
    });
  }, [departments, statusFilter]);

  const handleDeleteClick = (id: string) => {
    setSelectedId(id);
    setDeleteConfirmOpen(true);
  };

  const columnHelper = createColumnHelper<Department>();
  const columns = [
    columnHelper.accessor("name", {
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-transparent p-0 text-muted-foreground font-semibold"
        >
          Nome
          <ArrowsDownUp className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: (info) => <span className="font-semibold text-foreground">{info.getValue()}</span>,
    }),
    columnHelper.accessor("code", {
      header: "Código",
      cell: (info) => (
        <span className="text-muted-foreground font-mono text-xs">{info.getValue()}</span>
      ),
    }),
    columnHelper.accessor("employeesCount", {
      header: "Colaboradores",
      cell: (info) => <span className="text-muted-foreground">{info.getValue() ?? 0}</span>,
    }),
    columnHelper.accessor("active", {
      header: "Status",
      cell: (info) => {
        const val = info.getValue();
        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
              val ? "bg-emerald-500/10 text-emerald-500" : "bg-muted text-muted-foreground"
            }`}
          >
            {val ? "Ativo" : "Inativo"}
          </span>
        );
      },
    }),
    columnHelper.display({
      id: "actions",
      header: "Ações",
      cell: (info) => {
        const dept = info.row.original;
        // Hide edit/delete actions if not ADMIN or HR
        if (!isAdminOrHr) return <span className="text-muted-foreground/60 text-xs">—</span>;

        return (
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-xl border-0 bg-muted/40 hover:bg-muted/65"
              onClick={() => router.push(`/${locale}/organization/departments/${dept.id}`)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 text-destructive hover:bg-destructive/10 rounded-xl border-0"
              onClick={() => handleDeleteClick(dept.id)}
            >
              <Trash className="h-4 w-4" />
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
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">Departamentos</h1>
            <p className="text-muted-foreground text-sm">
              Gerencie os setores e departamentos estruturais da empresa.
            </p>
          </div>
          {/* Hide Create button if not ADMIN or HR */}
          {isAdminOrHr && (
            <Button
              onClick={() => router.push(`/${locale}/organization/departments/new`)}
              className="gap-2 rounded-2xl"
            >
              <Plus className="h-4 w-4" />
              Adicionar Departamento
            </Button>
          )}
        </div>

        {/* Toolbar controls: search & filter */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <MagnifyingGlass className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Pesquisar departamento..."
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
            <Option value="ACTIVE">Ativos</Option>
            <Option value="INACTIVE">Inativos</Option>
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
                      Nenhum departamento encontrado.
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

        {/* --- Delete Confirmation Dialog --- */}
        <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
          <DialogContent className="border-0 shadow-2xl rounded-2xl max-w-sm">
            <DialogHeader>
              <DialogTitle>Excluir Departamento</DialogTitle>
              <DialogDescription>
                Tem certeza que deseja excluir permanentemente este departamento? Todos os vínculos
                serão afetados.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="pt-2">
              <Button
                variant="outline"
                onClick={() => setDeleteConfirmOpen(false)}
                disabled={deleteMutation.isPending}
                className="rounded-2xl border-0 bg-muted/40 hover:bg-muted/65"
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={() => selectedId && deleteMutation.mutate(selectedId)}
                disabled={deleteMutation.isPending}
                className="rounded-2xl"
              >
                {deleteMutation.isPending && <CircleNotch className="mr-2 h-4 w-4 animate-spin" />}
                Excluir
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </RbacGuard>
  );
}
