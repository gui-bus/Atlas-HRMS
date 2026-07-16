"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CircleNotch, Bank } from "@phosphor-icons/react";

import { departmentService } from "@/services/department.service";
import { departmentSchema, DepartmentFormValues } from "@/schemas/department.schema";
import { RbacGuard } from "@/components/rbac-guard";
import { Button } from "@/components/ui/button";
import { Select, Option } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormSectionHeader } from "@/components/form-section-header";

export default function NewDepartmentPage() {
  const t = useTranslations("Organization");
  const params = useParams();
  const router = useRouter();
  const locale = params?.locale || "pt";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DepartmentFormValues>({
    resolver: zodResolver(departmentSchema),
    defaultValues: { name: "", code: "", active: true },
  });

  const mutation = useMutation({
    mutationFn: (data: DepartmentFormValues) => departmentService.createDepartment(data),
    onSuccess: () => {
      router.push(`/${locale}/organization/departments`);
    },
  });

  const onSubmit = (data: DepartmentFormValues) => {
    mutation.mutate(data);
  };

  return (
    <RbacGuard allowedRoles={["ADMIN", "HR"]}>
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
            <h1 className="text-2xl font-bold tracking-tight">Novo Departamento</h1>
            <p className="text-muted-foreground text-sm">
              Registre um novo setor estrutural no organograma da empresa.
            </p>
            <p className="text-xs text-destructive/80 mt-1.5">* Indica campos obrigatórios</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 w-full">
          <div className="space-y-4">
            <FormSectionHeader
              title="Informações do Setor"
              description="Defina a nomenclatura, código de custos e status operacional do departamento."
              icon={Bank}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 w-full">
              <div className="space-y-2 col-span-2">
                <Label htmlFor="name">
                  Nome do Departamento <span className="text-destructive">*</span>
                </Label>
                <Input id="name" {...register("name")} />
                {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="code">
                  Código Identificador <span className="text-destructive">*</span>
                </Label>
                <Input id="code" placeholder="Ex: FIN, MKT, TI" {...register("code")} />
                {errors.code && <p className="text-xs text-destructive">{errors.code.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="active">Status</Label>
                <Select
                  id="active"
                  {...register("active", { setValueAs: (v) => v === "true" })}
                  className="flex h-8 w-full rounded-2xl border border-transparent bg-input/50 px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring outline-none cursor-pointer transition-colors"
                >
                  <Option value="true">Ativo</Option>
                  <Option value="false">Inativo</Option>
                </Select>
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
              {mutation.isPending && <CircleNotch className="mr-2 h-4 w-4 animate-spin" />}
              Salvar Departamento
            </Button>
          </div>
        </form>
      </div>
    </RbacGuard>
  );
}
