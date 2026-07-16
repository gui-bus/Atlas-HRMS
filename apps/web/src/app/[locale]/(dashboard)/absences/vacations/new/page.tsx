"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CircleNotch, Calendar } from "@phosphor-icons/react";

import { useAuthStore } from "@/store/useAuthStore";
import { employeeService } from "@/services/employee.service";
import { vacationService } from "@/services/vacation.service";
import { vacationRequestSchema, VacationRequestValues } from "@/schemas/vacation.schema";
import { RbacGuard } from "@/components/rbac-guard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormSectionHeader } from "@/components/form-section-header";

export default function NewVacationRequestPage() {
  const t = useTranslations("Absences");
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const locale = params?.locale || "pt";

  // Fetch the Employee matching the logged-in user email
  const { data: employeesData } = useQuery({
    queryKey: ["employees", { search: user?.email }],
    queryFn: () => employeeService.getEmployees({ search: user?.email }),
    enabled: !!user?.email,
  });

  const employee = employeesData?.data?.[0];
  const employeeId = employee?.id || "";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VacationRequestValues>({
    resolver: zodResolver(vacationRequestSchema),
    defaultValues: { comments: "" },
  });

  const mutation = useMutation({
    mutationFn: (data: VacationRequestValues) => {
      if (!employeeId) throw new Error("ID de colaborador não encontrado.");
      return vacationService.createVacation({
        employeeId,
        startDate: new Date(data.startDate).toISOString(),
        endDate: new Date(data.endDate).toISOString(),
        comments: data.comments || undefined,
      });
    },
    onSuccess: () => {
      router.push(`/${locale}/absences/my-requests`);
    },
  });

  const onSubmit = (data: VacationRequestValues) => {
    mutation.mutate(data);
  };

  return (
    <RbacGuard allowedRoles={["ADMIN", "HR", "MANAGER", "EMPLOYEE"]}>
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
            <h1 className="text-2xl font-bold tracking-tight">Solicitar Férias</h1>
            <p className="text-muted-foreground text-sm">
              Registre um período planejado de férias para aprovação gestora.
            </p>
            <p className="text-xs text-destructive/80 mt-1.5">* Indica campos obrigatórios</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 w-full">
          <div className="space-y-4">
            <FormSectionHeader
              title="Período de Descanso"
              description="Especifique as datas de início e término desejadas para suas férias anuais."
              icon={Calendar}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 w-full">
              <div className="space-y-2">
                <Label htmlFor="startDate">
                  Data de Início <span className="text-destructive">*</span>
                </Label>
                <Input id="startDate" type="date" {...register("startDate")} />
                {errors.startDate && (
                  <p className="text-xs text-destructive">{errors.startDate.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">
                  Data de Fim <span className="text-destructive">*</span>
                </Label>
                <Input id="endDate" type="date" {...register("endDate")} />
                {errors.endDate && (
                  <p className="text-xs text-destructive">{errors.endDate.message}</p>
                )}
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="comments">Observações / Comentários</Label>
                <Input
                  id="comments"
                  placeholder="Ex: Desejo adiantamento de décimo terceiro salário..."
                  {...register("comments")}
                />
                {errors.comments && (
                  <p className="text-xs text-destructive">{errors.comments.message}</p>
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
              Solicitar Férias
            </Button>
          </div>
        </form>
      </div>
    </RbacGuard>
  );
}
