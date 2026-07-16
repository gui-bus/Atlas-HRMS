"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, FilePlus } from "lucide-react";

import { documentService } from "@/services/document.service";
import { employeeService } from "@/services/employee.service";
import { documentSchema, DocumentFormValues } from "@/schemas/document.schema";
import { RbacGuard } from "@/components/rbac-guard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormSectionHeader } from "@/components/form-section-header";

export default function NewDocumentPage() {
  const t = useTranslations("Documents");
  const params = useParams();
  const router = useRouter();
  const locale = params?.locale || "pt";

  const { data: employeesData } = useQuery({
    queryKey: ["employees", { page: 1, limit: 100 }],
    queryFn: () => employeeService.getEmployees({ page: 1, limit: 100 }),
  });
  const employees = employeesData?.data || [];

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DocumentFormValues>({
    resolver: zodResolver(documentSchema),
    defaultValues: { name: "", type: "CONTRACT", url: "", employeeId: "" },
  });

  const mutation = useMutation({
    mutationFn: (data: DocumentFormValues) => documentService.createDocument(data),
    onSuccess: () => {
      router.push(`/${locale}/documents`);
    },
  });

  const onSubmit = (data: DocumentFormValues) => {
    mutation.mutate(data);
  };

  return (
    <RbacGuard allowedRoles={["ADMIN", "HR", "MANAGER"]}>
      <div className="p-6 md:p-8 space-y-6 w-full animate-fade-in">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.back()}
            className="rounded-2xl border-0 bg-muted/40 hover:bg-muted/65 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Adicionar Documento</h1>
            <p className="text-muted-foreground text-sm">
              Registre termos, contratos ou comprovantes de colaboradores.
            </p>
            <p className="text-xs text-destructive/80 mt-1.5">* Indica campos obrigatórios</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 w-full">
          <div className="space-y-4">
            <FormSectionHeader
              title="Upload & Metadados"
              description="Forneça o nome do arquivo, a URL do documento anexado e relacione ao funcionário."
              icon={FilePlus}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 w-full">
              <div className="space-y-2 col-span-2">
                <Label htmlFor="name">
                  Nome do Documento <span className="text-destructive">*</span>
                </Label>
                <Input id="name" {...register("name")} />
                {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="employeeId">
                  Colaborador Relacionado <span className="text-destructive">*</span>
                </Label>
                <select
                  id="employeeId"
                  {...register("employeeId")}
                  className="flex h-8 w-full rounded-2xl border border-transparent bg-input/50 px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring outline-none cursor-pointer transition-colors"
                >
                  <option value="">Selecione um funcionário</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName} ({emp.email})
                    </option>
                  ))}
                </select>
                {errors.employeeId && (
                  <p className="text-xs text-destructive">{errors.employeeId.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">
                  Tipo de Documento <span className="text-destructive">*</span>
                </Label>
                <select
                  id="type"
                  {...register("type")}
                  className="flex h-8 w-full rounded-2xl border border-transparent bg-input/50 px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring outline-none cursor-pointer transition-colors"
                >
                  <option value="CONTRACT">Contrato</option>
                  <option value="ID_CARD">Documento de Identidade</option>
                  <option value="CERTIFICATE">Certificado</option>
                  <option value="OTHER">Outros</option>
                </select>
                {errors.type && <p className="text-xs text-destructive">{errors.type.message}</p>}
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="url">
                  Link / URL do Arquivo <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="url"
                  placeholder="https://exemplo.com/documento.pdf"
                  {...register("url")}
                />
                {errors.url && <p className="text-xs text-destructive">{errors.url.message}</p>}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-transparent">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="rounded-2xl border-0 bg-muted/40 hover:bg-muted/65 transition-colors"
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={mutation.isPending} className="rounded-2xl">
              {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar Documento
            </Button>
          </div>
        </form>
      </div>
    </RbacGuard>
  );
}
