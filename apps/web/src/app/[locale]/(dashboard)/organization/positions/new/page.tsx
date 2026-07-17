"use client";

import React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CircleNotch, Briefcase } from "@phosphor-icons/react";

import { positionService } from "@/services/position.service";
import { departmentService } from "@/services/department.service";
import { positionSchema, PositionFormValues } from "@/schemas/position.schema";
import { RbacGuard } from "@/components/rbac-guard";
import { Button } from "@/components/ui/button";
import { Select, Option } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormSectionHeader } from "@/components/form-section-header";
import { FormHeader } from "@/components/form-header";
import { FormActions } from "@/components/form-actions";
import { Combobox } from "@/components/ui/combobox";

export default function NewPositionPage() {
  const t = useTranslations("Organization");
  const tCommon = useTranslations("Common");
  const params = useParams();
  const router = useRouter();
  const locale = params?.locale || "pt";

  const { data: departmentsData } = useQuery({
    queryKey: ["departments"],
    queryFn: () => departmentService.getDepartments(),
  });
  const departments = Array.isArray(departmentsData)
    ? departmentsData
    : departmentsData?.data || [];

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<PositionFormValues>({
    resolver: zodResolver(positionSchema),
    defaultValues: { title: "", active: true },
  });

  const mutation = useMutation({
    mutationFn: (data: PositionFormValues) => positionService.createPosition(data),
    onSuccess: () => {
      router.push(`/${locale}/organization/positions`);
    },
  });

  const onSubmit = (data: PositionFormValues) => {
    mutation.mutate(data);
  };

  return (
    <RbacGuard allowedRoles={["ADMIN", "HR"]}>
      <div className="p-6 md:p-8 space-y-6 w-full animate-fade-in">
        <FormHeader
          title="Novo Cargo"
          subTitle="Registre um novo cargo e defina o teto e piso salarial correspondente."
          requiredNotice={true}
        />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 w-full">
          <div className="space-y-4">
            <FormSectionHeader
              title="Informações do Cargo"
              description="Defina o título profissional, o departamento de vinculação e a remuneração base."
              icon={Briefcase}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 w-full">
              <div className="space-y-2 col-span-2">
                <Label htmlFor="title">
                  Título do Cargo <span className="text-destructive">*</span>
                </Label>
                <Input id="title" {...register("title")} />
                {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="departmentId">
                  Departamento de Lotação <span className="text-destructive">*</span>
                </Label>
                <Controller
                  control={control}
                  name="departmentId"
                  render={({ field }) => (
                    <Combobox
                      options={departments.map((d) => ({
                        value: d.id,
                        label: d.name,
                      }))}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Selecione um departamento"
                      searchPlaceholder={tCommon("searchPlaceholder")}
                      emptyMessage={tCommon("noResults")}
                    />
                  )}
                />
                {errors.departmentId && (
                  <p className="text-xs text-destructive">{errors.departmentId.message}</p>
                )}
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

              <div className="space-y-2">
                <Label htmlFor="salaryRangeMin">Faixa Salarial Mínima</Label>
                <Input
                  id="salaryRangeMin"
                  type="number"
                  placeholder="Ex: 3500"
                  {...register("salaryRangeMin")}
                />
                {errors.salaryRangeMin && (
                  <p className="text-xs text-destructive">{errors.salaryRangeMin.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="salaryRangeMax">Faixa Salarial Máxima</Label>
                <Input
                  id="salaryRangeMax"
                  type="number"
                  placeholder="Ex: 7500"
                  {...register("salaryRangeMax")}
                />
                {errors.salaryRangeMax && (
                  <p className="text-xs text-destructive">{errors.salaryRangeMax.message}</p>
                )}
              </div>
            </div>
          </div>

          <FormActions
            cancelText="Cancelar"
            submitText="Salvar Cargo"
            isSubmitting={mutation.isPending}
          />
        </form>
      </div>
    </RbacGuard>
  );
}
