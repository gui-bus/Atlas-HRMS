"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CircleNotch, XCircle } from "@phosphor-icons/react";
import { z } from "zod";

import { vacationService } from "@/services/vacation.service";
import { RbacGuard } from "@/components/rbac-guard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormSectionHeader } from "@/components/form-section-header";

const rejectSchema = z.object({
  reason: z.string().min(3, "O motivo deve conter ao menos 3 caracteres"),
});

type RejectFormValues = z.infer<typeof rejectSchema>;

export default function RejectVacationPage() {
  const t = useTranslations("Absences");
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const locale = params?.locale || "pt";

  const { data: vacation, isLoading } = useQuery({
    queryKey: ["vacation", id],
    queryFn: () => vacationService.getVacations().then((list) => list.find((v) => v.id === id)),
    enabled: !!id,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RejectFormValues>({
    resolver: zodResolver(rejectSchema),
  });

  const mutation = useMutation({
    mutationFn: (data: RejectFormValues) => {
      return vacationService.updateVacationStatus(id, "REJECTED", data.reason);
    },
    onSuccess: () => {
      router.push(`/${locale}/absences/vacations`);
    },
  });

  const onSubmit = (data: RejectFormValues) => {
    mutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <CircleNotch className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

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
            <h1 className="text-2xl font-bold tracking-tight">Rejeitar Solicitação de Férias</h1>
            <p className="text-muted-foreground text-sm">
              Explique o motivo de indeferimento do pedido de férias.
            </p>
            <p className="text-xs text-destructive/80 mt-1.5">
              * Os campos marcados com * são obrigatórios
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 w-full">
          <div className="space-y-4">
            <FormSectionHeader
              title="Justificativa da Rejeição"
              description="Aponte de forma clara e formal o motivo para a rejeição do período."
              icon={XCircle}
            />

            <div className="space-y-2 max-w-xl">
              <Label htmlFor="reason">
                Motivo / Justificativa <span className="text-destructive">*</span>
              </Label>
              <Input
                id="reason"
                placeholder="Ex: Choque de datas com o período de fechamento de balanço..."
                {...register("reason")}
              />
              {errors.reason && <p className="text-xs text-destructive">{errors.reason.message}</p>}
            </div>
          </div>

          <div className="flex gap-3 pt-6 border-t border-transparent">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="rounded-2xl border-0 bg-muted/40 hover:bg-muted/65 transition-colors"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={mutation.isPending}
              className="rounded-2xl"
            >
              {mutation.isPending && <CircleNotch className="mr-2 h-4 w-4 animate-spin" />}
              Confirmar Rejeição
            </Button>
          </div>
        </form>
      </div>
    </RbacGuard>
  );
}
