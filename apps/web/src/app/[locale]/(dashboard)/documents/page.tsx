"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash, Loader2, File, Folder } from "lucide-react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";

import { documentService, Document } from "@/services/document.service";
import { employeeService } from "@/services/employee.service";
import { documentSchema, DocumentFormValues } from "@/schemas/document.schema";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormSectionHeader } from "@/components/form-section-header";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const formatDate = (dateString: string) => {
  try {
    return new Date(dateString).toLocaleDateString();
  } catch {
    return dateString;
  }
};

export default function DocumentsPage() {
  const t = useTranslations("Documents");
  const params = useParams();
  const queryClient = useQueryClient();
  const locale = params?.locale || "pt";

  // --- Fetch Lists ---
  const { data: documents = [], isLoading: loadingDocs } = useQuery({
    queryKey: ["documents"],
    queryFn: () => documentService.getDocuments(),
  });

  const { data: employeesData } = useQuery({
    queryKey: ["employees", { page: 1, limit: 100 }],
    queryFn: () => employeeService.getEmployees({ page: 1, limit: 100 }),
  });
  const employees = employeesData?.data || [];

  // --- Modals State ---
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // --- React Hook Form ---
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<DocumentFormValues>({
    resolver: zodResolver(documentSchema),
    defaultValues: { name: "", type: "CONTRACT", url: "", employeeId: "" },
  });

  // --- Mutations ---
  const uploadMutation = useMutation({
    mutationFn: (data: DocumentFormValues) => documentService.createDocument(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      setUploadModalOpen(false);
      reset();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => documentService.deleteDocument(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      setDeleteConfirmOpen(false);
      setDeleteId(null);
    },
  });

  // --- Open Dialogs ---
  const handleOpenUploadModal = () => {
    reset({ name: "", type: "CONTRACT", url: "", employeeId: "" });
    setUploadModalOpen(true);
  };

  const handleOpenDeleteConfirm = (id: string) => {
    setDeleteId(id);
    setDeleteConfirmOpen(true);
  };

  const getDocTypeLabel = (type: string) => {
    const map = {
      CONTRACT: t("types.contract"),
      IDENTIFICATION: t("types.identification"),
      EDUCATION: t("types.education"),
      ADDRESS_PROOF: t("types.address_proof"),
      OTHER: t("types.other"),
    };
    return map[type as keyof typeof map] || type;
  };

  // --- Tables Setup ---
  const columnHelper = createColumnHelper<Document>();
  const columns = [
    columnHelper.accessor("name", {
      header: t("table.name"),
      cell: (info) => (
        <a
          href={info.row.original.url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-foreground hover:text-primary hover:underline flex items-center gap-2"
        >
          <File className="h-4 w-4 text-muted-foreground shrink-0" />
          {info.getValue()}
        </a>
      ),
    }),
    columnHelper.accessor("type", {
      header: t("table.type"),
      cell: (info) => (
        <span className="text-muted-foreground">{getDocTypeLabel(info.getValue())}</span>
      ),
    }),
    columnHelper.accessor((row) => `${row.employee?.firstName} ${row.employee?.lastName}`, {
      id: "employee",
      header: t("table.employee"),
      cell: (info) => <span className="text-muted-foreground">{info.getValue()}</span>,
    }),
    columnHelper.accessor("createdAt", {
      header: t("table.createdAt"),
      cell: (info) => <span className="text-muted-foreground">{formatDate(info.getValue())}</span>,
    }),
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
  ];

  const table = useReactTable({
    data: documents,
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
        <Button onClick={handleOpenUploadModal} className="gap-2 rounded-2xl">
          <Plus className="h-4 w-4" />
          {t("addDocument")}
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
              {loadingDocs ? (
                <tr className="border-0">
                  <td colSpan={columns.length} className="h-24 text-center border-0">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                  </td>
                </tr>
              ) : documents.length === 0 ? (
                <tr className="border-0">
                  <td
                    colSpan={columns.length}
                    className="h-24 text-center text-muted-foreground border-0"
                  >
                    Nenhum documento cadastrado.
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

      {/* --- Add Document Dialog --- */}
      <Dialog open={uploadModalOpen} onOpenChange={setUploadModalOpen}>
        <DialogContent className="border-0 shadow-2xl rounded-2xl max-w-lg">
          <DialogHeader>
            <DialogTitle>{t("addDocument")}</DialogTitle>
            <DialogDescription className="text-xs text-destructive/80 mt-1">
              * {t("requiredFieldsNotice")}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit((d) => uploadMutation.mutate(d))} className="space-y-4 pt-2">
            <FormSectionHeader
              title={t("title")}
              description="Envie e associe o arquivo de documento a um colaborador do sistema."
              icon={Folder}
            />

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="doc-name">
                  {t("form.name")} <span className="text-destructive">*</span>
                </Label>
                <Input id="doc-name" {...register("name")} />
                {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="doc-type">
                  {t("form.type")} <span className="text-destructive">*</span>
                </Label>
                <select
                  id="doc-type"
                  {...register("type")}
                  className="flex h-8 w-full rounded-2xl border border-transparent bg-input/50 px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring outline-none cursor-pointer transition-colors"
                >
                  <option value="CONTRACT">{t("types.contract")}</option>
                  <option value="IDENTIFICATION">{t("types.identification")}</option>
                  <option value="EDUCATION">{t("types.education")}</option>
                  <option value="ADDRESS_PROOF">{t("types.address_proof")}</option>
                  <option value="OTHER">{t("types.other")}</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="doc-url">
                  {t("form.url")} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="doc-url"
                  placeholder="https://uploadthing.com/..."
                  {...register("url")}
                />
                {errors.url && <p className="text-xs text-destructive">{errors.url.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="doc-employee">
                  {t("form.employee")} <span className="text-destructive">*</span>
                </Label>
                <select
                  id="doc-employee"
                  {...register("employeeId")}
                  className="flex h-8 w-full rounded-2xl border border-transparent bg-input/50 px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring outline-none cursor-pointer transition-colors"
                >
                  <option value="">Selecione o colaborador...</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {`${emp.firstName} ${emp.lastName}`}
                    </option>
                  ))}
                </select>
                {errors.employeeId && (
                  <p className="text-xs text-destructive">{errors.employeeId.message}</p>
                )}
              </div>
            </div>

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setUploadModalOpen(false)}
                className="rounded-2xl border-0 bg-muted/40 hover:bg-muted/65"
              >
                {t("form.cancel")}
              </Button>
              <Button type="submit" disabled={uploadMutation.isPending} className="rounded-2xl">
                {uploadMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t("form.create")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* --- Delete Confirmation Dialog --- */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="border-0 shadow-2xl rounded-2xl max-w-sm">
          <DialogHeader>
            <DialogTitle>{t("table.deleteConfirmTitle")}</DialogTitle>
            <DialogDescription>{t("table.deleteConfirmDesc")}</DialogDescription>
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
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              disabled={deleteMutation.isPending}
              className="rounded-2xl"
            >
              {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("table.delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
