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
import { FormHeader } from "@/components/form-header";
import { FormActions } from "@/components/form-actions";

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
        <FormHeader
          title="Novo Departamento"
          subTitle="Registre um novo setor estrutural no organograma da empresa."
          requiredNotice={true}
        />

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

          <FormActions
            cancelText="Cancelar"
            submitText="Salvar Departamento"
            isSubmitting={mutation.isPending}
          />
        </form>
      </div>
    </RbacGuard>
  );
}
