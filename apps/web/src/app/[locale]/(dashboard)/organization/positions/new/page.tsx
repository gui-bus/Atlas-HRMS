"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Briefcase } from "lucide-react";

import { positionService } from "@/services/position.service";
import { departmentService } from "@/services/department.service";
import { positionSchema, PositionFormValues } from "@/schemas/position.schema";
import { RbacGuard } from "@/components/rbac-guard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormSectionHeader } from "@/components/form-section-header";

export default function NewPositionPage() {
  const t = useTranslations("Organization");
  const params = useParams();
  const router = useRouter();
  const locale = params?.locale || "pt";

  const { data: departments = [] } = useQuery({
    queryKey: ["departments"],
    queryFn: () => departmentService.getDepartments(),
  });

  const {
    register,
    handleSubmit,
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
            <h1 className="text-2xl font-bold tracking-tight">Novo Cargo</h1>
            <p className="text-muted-foreground text-sm">
              Registre um novo cargo e defina o teto e piso salarial correspondente.
            </p>
            <p className="text-xs text-destructive/80 mt-1.5">* Indica campos obrigatórios</p>
          </div>
        </div>

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
                <select
                  id="departmentId"
                  {...register("departmentId")}
                  className="flex h-8 w-full rounded-2xl border border-transparent bg-input/50 px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring outline-none cursor-pointer transition-colors"
                >
                  <option value="">Selecione um departamento</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
                {errors.departmentId && (
                  <p className="text-xs text-destructive">{errors.departmentId.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="active">Status</Label>
                <select
                  id="active"
                  {...register("active", { setValueAs: (v) => v === "true" })}
                  className="flex h-8 w-full rounded-2xl border border-transparent bg-input/50 px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring outline-none cursor-pointer transition-colors"
                >
                  <option value="true">Ativo</option>
                  <option value="false">Inativo</option>
                </select>
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
              Salvar Cargo
            </Button>
          </div>
        </form>
      </div>
    </RbacGuard>
  );
}
