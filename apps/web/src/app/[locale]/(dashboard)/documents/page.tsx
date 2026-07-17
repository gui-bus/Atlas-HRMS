"use client";

import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import {
  Plus,
  Trash,
  CircleNotch,
  MagnifyingGlass,
  ArrowsDownUp,
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

import { documentService, Document } from "@/services/document.service";
import { employeeService } from "@/services/employee.service";
import { useAuthStore } from "@/store/useAuthStore";
import { RbacGuard } from "@/components/rbac-guard";
import { PageHeader } from "@/components/page-header";
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

export default function DocumentsPage() {
  const t = useTranslations("Documents");
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const locale = params?.locale || "pt";

  const { user } = useAuthStore();
  const userRole = user?.role || "EMPLOYEE";
  const isEmployee = userRole === "EMPLOYEE";

  // Get current logged-in employee ID if role is EMPLOYEE
  const { data: employeesData } = useQuery({
    queryKey: ["employees", { search: user?.email }],
    queryFn: () => employeeService.getEmployees({ search: user?.email }),
    enabled: isEmployee && !!user?.email,
  });
  const currentEmployee = employeesData?.data?.[0];

  // --- Fetch Lists ---
  const { data: documents = [], isLoading: loadingDocs } = useQuery({
    queryKey: ["documents"],
    queryFn: () => documentService.getDocuments(),
  });

  // --- State ---
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // --- Mutations ---
  const deleteMutation = useMutation({
    mutationFn: (id: string) => documentService.deleteDocument(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      setDeleteConfirmOpen(false);
      setDeleteId(null);
    },
  });

  // --- Open Dialogs ---
  const handleOpenDeleteConfirm = (id: string) => {
    setDeleteId(id);
    setDeleteConfirmOpen(true);
  };

  const getDocTypeLabel = (type: string) => {
    const labels = {
      CONTRACT: "Contrato",
      ID_CARD: "Identidade",
      CERTIFICATE: "Certificado",
      OTHER: "Outros",
    };
    return labels[type] || type;
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
    return documents.filter((doc) => {
      if (isEmployee) {
        if (!currentEmployee || doc.employeeId !== currentEmployee.id) {
          return false;
        }
      }
      if (typeFilter !== "ALL" && doc.type !== typeFilter) return false;
      return true;
    });
  }, [documents, typeFilter, isEmployee, currentEmployee]);

  const columnHelper = createColumnHelper<Document>();
  const columns = useMemo(() => {
    return [
      columnHelper.accessor("name", {
        header: t("table.name"),
        cell: (info) => {
          const doc = info.row.original;
          return (
            <a
              href={doc.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-primary hover:underline"
            >
              {info.getValue()}
            </a>
          );
        },
      }),
      columnHelper.accessor("type", {
        header: t("table.type"),
        cell: (info) => (
          <span className="text-muted-foreground">{getDocTypeLabel(info.getValue())}</span>
        ),
      }),
      ...(!isEmployee
        ? [
            columnHelper.accessor((row) => `${row.employee?.firstName} ${row.employee?.lastName}`, {
              id: "employee",
              header: t("table.employee"),
              cell: (info) => <span className="text-muted-foreground">{info.getValue()}</span>,
            }),
          ]
        : []),
      columnHelper.accessor("createdAt", {
        header: t("table.createdAt"),
        cell: (info) => (
          <span className="text-muted-foreground">{formatDate(info.getValue())}</span>
        ),
      }),
      ...(!isEmployee
        ? [
            columnHelper.display({
              id: "actions",
              header: t("table.actions"),
              cell: (info) => {
                const doc = info.row.original;
                return (
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:bg-destructive/10 rounded-xl border-0"
                    onClick={() => handleOpenDeleteConfirm(doc.id)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                );
              },
            }),
          ]
        : []),
    ];
  }, [isEmployee, t]);

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
    <RbacGuard allowedRoles={["ADMIN", "HR", "MANAGER", "EMPLOYEE"]}>
      <div className="p-6 md:p-8 space-y-6 w-full animate-fade-in">
        {/* Title Header */}
        <PageHeader
          title={t("title")}
          subTitle={t("subTitle")}
          buttonText={!isEmployee ? "Adicionar Documento" : undefined}
          buttonLink={`/${locale}/documents/new`}
        />

        {/* Toolbar */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <MagnifyingGlass className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Pesquisar documento..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="pl-10 h-10 rounded-2xl bg-muted/40 border-0 focus-visible:ring-1"
            />
          </div>

          <Select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="flex h-10 w-full md:w-[200px] rounded-2xl border border-transparent bg-muted/45 px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring outline-none cursor-pointer transition-colors"
          >
            <Option value="ALL">Todos os tipos</Option>
            <Option value="CONTRACT">Contrato</Option>
            <Option value="ID_CARD">Identidade</Option>
            <Option value="CERTIFICATE">Certificado</Option>
            <Option value="OTHER">Outros</Option>
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
                {loadingDocs ? (
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
                      Nenhum documento encontrado.
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

        {/* Delete Confirmation */}
        <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
          <DialogContent className="border-0 shadow-2xl rounded-2xl max-w-sm">
            <DialogHeader>
              <DialogTitle>Excluir Documento</DialogTitle>
              <DialogDescription>
                Deseja mesmo excluir permanentemente este documento?
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
                onClick={() => deleteId && deleteMutation.mutate(deleteId)}
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
