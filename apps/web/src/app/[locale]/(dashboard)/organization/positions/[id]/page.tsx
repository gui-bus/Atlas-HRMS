"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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

export default function EditPositionPage() {
  const t = useTranslations("Organization");
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = params?.id as string;
  const locale = params?.locale || "pt";

  // Fetch current position data
  const {
    data: position,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["position", id],
    queryFn: () => positionService.getPosition(id),
    enabled: !!id,
  });

  const { data: departments = [] } = useQuery({
    queryKey: ["departments"],
    queryFn: () => departmentService.getDepartments(),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PositionFormValues>({
    resolver: zodResolver(positionSchema),
  });

  useEffect(() => {
    if (position) {
      reset({
        title: position.title,
        departmentId: position.departmentId,
        salaryRangeMin: position.salaryRangeMin || "",
        salaryRangeMax: position.salaryRangeMax || "",
        active: position.active,
      });
    }
  }, [position, reset]);

  const mutation = useMutation({
    mutationFn: (data: PositionFormValues) => positionService.updatePosition(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["positions"] });
      queryClient.invalidateQueries({ queryKey: ["position", id] });
      router.push(`/${locale}/organization/positions`);
    },
  });

  const onSubmit = (data: PositionFormValues) => {
    mutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <CircleNotch className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !position) {
    return (
      <div className="p-8 text-center text-destructive font-medium">Cargo não encontrado.</div>
    );
  }

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
            <h1 className="text-2xl font-bold tracking-tight">Editar Cargo</h1>
            <p className="text-muted-foreground text-sm">
              Modifique as informações e faixas de remuneração do cargo.
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
                <Select
                  id="departmentId"
                  {...register("departmentId")}
                  className="flex h-8 w-full rounded-2xl border border-transparent bg-input/50 px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring outline-none cursor-pointer transition-colors"
                >
                  <Option value="">Selecione um departamento</Option>
                  {departments.map((d) => (
                    <Option key={d.id} value={d.id}>
                      {d.name}
                    </Option>
                  ))}
                </Select>
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
              Salvar Alterações
            </Button>
          </div>
        </form>
      </div>
    </RbacGuard>
  );
}
