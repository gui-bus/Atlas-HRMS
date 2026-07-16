"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CircleNotch, Briefcase } from "@phosphor-icons/react";

import { recruitmentService } from "@/services/recruitment.service";
import { departmentService } from "@/services/department.service";
import { positionService } from "@/services/position.service";
import { recruitmentSchema, RecruitmentFormValues } from "@/schemas/recruitment.schema";
import { RbacGuard } from "@/components/rbac-guard";
import { Button } from "@/components/ui/button";
import { Select, Option } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormSectionHeader } from "@/components/form-section-header";

export default function EditVacancyPage() {
  const t = useTranslations("Recruitment");
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = params?.id as string;
  const locale = params?.locale || "pt";

  // Fetch lists
  const { data: vacancy, isLoading: loadingVacancy } = useQuery({
    queryKey: ["vacancy", id],
    queryFn: () =>
      recruitmentService.getRecruitments().then((list) => list.find((v) => v.id === id)),
    enabled: !!id,
  });

  const { data: departments = [] } = useQuery({
    queryKey: ["departments"],
    queryFn: () => departmentService.getDepartments(),
  });

  const { data: positions = [] } = useQuery({
    queryKey: ["positions"],
    queryFn: () => positionService.getPositions(),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RecruitmentFormValues>({
    resolver: zodResolver(recruitmentSchema),
  });

  useEffect(() => {
    if (vacancy) {
      reset({
        title: vacancy.title,
        description: vacancy.description,
        employmentType: vacancy.employmentType as any,
        workModel: vacancy.workModel as any,
        seniority: vacancy.seniority as any,
        vacancies: vacancy.vacancies,
        salaryMin: vacancy.salaryMin || "",
        salaryMax: vacancy.salaryMax || "",
        requirements: vacancy.requirements || "",
        departmentId: vacancy.departmentId,
        positionId: vacancy.positionId,
        status: vacancy.status as any,
      });
    }
  }, [vacancy, reset]);

  const mutation = useMutation({
    mutationFn: (data: RecruitmentFormValues) => {
      return recruitmentService.updateRecruitment(id, {
        ...data,
        vacancies: Number(data.vacancies),
        salaryMin: data.salaryMin || undefined,
        salaryMax: data.salaryMax || undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recruitments"] });
      queryClient.invalidateQueries({ queryKey: ["vacancy", id] });
      router.push(`/${locale}/recruitment`);
    },
  });

  const onSubmit = (d: RecruitmentFormValues) => {
    mutation.mutate(d);
  };

  if (loadingVacancy) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <CircleNotch className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
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
            <h1 className="text-2xl font-bold tracking-tight">Editar Vaga</h1>
            <p className="text-muted-foreground text-sm">
              Modifique as informações do processo seletivo estruturado.
            </p>
            <p className="text-xs text-destructive/80 mt-1.5">* Indica campos obrigatórios</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 w-full">
          <div className="space-y-4">
            <FormSectionHeader
              title={t("title")}
              description="Informações de cargo, senioridade e descrição da oportunidade."
              icon={Briefcase}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 w-full">
              <div className="space-y-2 col-span-2">
                <Label htmlFor="title">
                  {t("form.title")} <span className="text-destructive">*</span>
                </Label>
                <Input id="title" {...register("title")} />
                {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="description">
                  {t("form.description")} <span className="text-destructive">*</span>
                </Label>
                <Input id="description" {...register("description")} />
                {errors.description && (
                  <p className="text-xs text-destructive">{errors.description.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="employmentType">
                  {t("form.employmentType")} <span className="text-destructive">*</span>
                </Label>
                <Select
                  id="employmentType"
                  {...register("employmentType")}
                  className="flex h-8 w-full rounded-2xl border border-transparent bg-input/50 px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring outline-none cursor-pointer transition-colors"
                >
                  <Option value="CLT">CLT</Option>
                  <Option value="PJ">PJ</Option>
                  <Option value="CONTRACTOR">Prestador de Serviço</Option>
                  <Option value="INTERNSHIP">Estágio</Option>
                  <Option value="TEMPORARY">Temporário</Option>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="workModel">
                  {t("form.workModel")} <span className="text-destructive">*</span>
                </Label>
                <Select
                  id="workModel"
                  {...register("workModel")}
                  className="flex h-8 w-full rounded-2xl border border-transparent bg-input/50 px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring outline-none cursor-pointer transition-colors"
                >
                  <Option value="REMOTE">Remoto</Option>
                  <Option value="HYBRID">Híbrido</Option>
                  <Option value="ONSITE">Presencial</Option>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="seniority">
                  {t("form.seniority")} <span className="text-destructive">*</span>
                </Label>
                <Select
                  id="seniority"
                  {...register("seniority")}
                  className="flex h-8 w-full rounded-2xl border border-transparent bg-input/50 px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring outline-none cursor-pointer transition-colors"
                >
                  <Option value="JUNIOR">Júnior</Option>
                  <Option value="MID">Pleno</Option>
                  <Option value="SENIOR">Sênior</Option>
                  <Option value="LEAD">Tech Lead</Option>
                  <Option value="EXECUTIVE">Diretoria / Executivo</Option>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="vacancies">
                  {t("form.vacancies")} <span className="text-destructive">*</span>
                </Label>
                <Input id="vacancies" type="number" {...register("vacancies")} />
                {errors.vacancies && (
                  <p className="text-xs text-destructive">{errors.vacancies.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="salaryMin">{t("form.salaryMin")}</Label>
                <Input id="salaryMin" placeholder="5000.00" {...register("salaryMin")} />
                {errors.salaryMin && (
                  <p className="text-xs text-destructive">{errors.salaryMin.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="salaryMax">{t("form.salaryMax")}</Label>
                <Input id="salaryMax" placeholder="9000.00" {...register("salaryMax")} />
                {errors.salaryMax && (
                  <p className="text-xs text-destructive">{errors.salaryMax.message}</p>
                )}
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="requirements">{t("form.requirements")}</Label>
                <Input
                  id="requirements"
                  placeholder="NestJS, PostgreSQL, React..."
                  {...register("requirements")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="departmentId">
                  {t("form.department")} <span className="text-destructive">*</span>
                </Label>
                <Select
                  id="departmentId"
                  {...register("departmentId")}
                  className="flex h-8 w-full rounded-2xl border border-transparent bg-input/50 px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring outline-none cursor-pointer transition-colors"
                >
                  <Option value="">Selecione o departamento</Option>
                  {departments.map((dept) => (
                    <Option key={dept.id} value={dept.id}>
                      {dept.name}
                    </Option>
                  ))}
                </Select>
                {errors.departmentId && (
                  <p className="text-xs text-destructive">{errors.departmentId.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="positionId">
                  {t("form.position")} <span className="text-destructive">*</span>
                </Label>
                <Select
                  id="positionId"
                  {...register("positionId")}
                  className="flex h-8 w-full rounded-2xl border border-transparent bg-input/50 px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring outline-none cursor-pointer transition-colors"
                >
                  <Option value="">Selecione o cargo correspondente</Option>
                  {positions.map((pos) => (
                    <Option key={pos.id} value={pos.id}>
                      {pos.title}
                    </Option>
                  ))}
                </Select>
                {errors.positionId && (
                  <p className="text-xs text-destructive">{errors.positionId.message}</p>
                )}
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="status">Status da Vaga</Label>
                <Select
                  id="status"
                  {...register("status")}
                  className="flex h-8 w-full rounded-2xl border border-transparent bg-input/50 px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring outline-none cursor-pointer transition-colors"
                >
                  <Option value="OPEN">Aberta</Option>
                  <Option value="ON_HOLD">Em Espera</Option>
                  <Option value="CLOSED">Encerrada</Option>
                  <Option value="CANCELLED">Cancelada</Option>
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
              Salvar Alterações
            </Button>
          </div>
        </form>
      </div>
    </RbacGuard>
  );
}
