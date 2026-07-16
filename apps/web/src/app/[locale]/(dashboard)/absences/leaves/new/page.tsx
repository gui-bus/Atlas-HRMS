"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CircleNotch, FileText } from "@phosphor-icons/react";

import { useAuthStore } from "@/store/useAuthStore";
import { employeeService } from "@/services/employee.service";
import { vacationService } from "@/services/vacation.service";
import { leaveRequestSchema, LeaveRequestValues } from "@/schemas/vacation.schema";
import { RbacGuard } from "@/components/rbac-guard";
import { Button } from "@/components/ui/button";
import { Select, Option } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormSectionHeader } from "@/components/form-section-header";

export default function NewLeaveRequestPage() {
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
  } = useForm<LeaveRequestValues>({
    resolver: zodResolver(leaveRequestSchema),
  });

  const mutation = useMutation({
    mutationFn: (data: LeaveRequestValues) => {
      if (!employeeId) throw new Error("ID de colaborador não encontrado.");
      return vacationService.createLeave({
        employeeId,
        type: data.type,
        startDate: new Date(data.startDate).toISOString(),
        endDate: new Date(data.endDate).toISOString(),
        reason: data.reason,
      });
    },
    onSuccess: () => {
      router.push(`/${locale}/absences/my-requests`);
    },
  });

  const onSubmit = (data: LeaveRequestValues) => {
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
            <h1 className="text-2xl font-bold tracking-tight">Solicitar Atestado / Licença</h1>
            <p className="text-muted-foreground text-sm">
              Registre atestados médicos ou licenças legais regulamentares.
            </p>
            <p className="text-xs text-destructive/80 mt-1.5">* Indica campos obrigatórios</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 w-full">
          <div className="space-y-4">
            <FormSectionHeader
              title="Informações de Afastamento"
              description="Defina as datas e a categoria legal/médica para o seu afastamento."
              icon={FileText}
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

              <div className="space-y-2">
                <Label htmlFor="type">
                  Tipo de Licença <span className="text-destructive">*</span>
                </Label>
                <Select
                  id="type"
                  {...register("type")}
                  className="flex h-8 w-full rounded-2xl border border-transparent bg-input/50 px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring outline-none cursor-pointer transition-colors"
                >
                  <Option value="MEDICAL">Médica (Atestado)</Option>
                  <Option value="PARENTAL">Parental (Maternidade/Paternidade)</Option>
                  <Option value="LEGAL">Legal (Casamento, Óbito, etc.)</Option>
                  <Option value="UNPAID">Não Remunerada</Option>
                  <Option value="OTHER">Outros Afastamentos</Option>
                </Select>
                {errors.type && <p className="text-xs text-destructive">{errors.type.message}</p>}
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="reason">
                  Motivo / Justificativa <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="reason"
                  placeholder="Ex: Cirurgia programada de vesícula..."
                  {...register("reason")}
                />
                {errors.reason && (
                  <p className="text-xs text-destructive">{errors.reason.message}</p>
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
              Solicitar Licença
            </Button>
          </div>
        </form>
      </div>
    </RbacGuard>
  );
}
