"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  CircleNotch,
  FileText,
  UploadSimple,
  Trash,
  CheckCircle,
} from "@phosphor-icons/react";

import { api } from "@/lib/api";
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

  // State for upload management
  const [uploading, setUploading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState("");

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
    setValue,
    watch,
    formState: { errors },
  } = useForm<LeaveRequestValues>({
    resolver: zodResolver(leaveRequestSchema),
    defaultValues: {
      employeeId: "",
      type: "MEDICAL",
      startDate: "",
      endDate: "",
      reason: "",
      attachmentUrl: "",
      customType: "",
    },
  });

  // Watch type changes to conditionally display customType input
  const selectedType = watch("type");

  // Keep employeeId updated in form state
  useEffect(() => {
    if (employeeId) {
      setValue("employeeId", employeeId);
    }
  }, [employeeId, setValue]);

  const mutation = useMutation({
    mutationFn: (data: LeaveRequestValues) => {
      if (!employeeId) throw new Error("ID de colaborador não encontrado.");
      return vacationService.createLeave({
        employeeId,
        type: data.type,
        customType: data.type === "OTHER" ? data.customType : undefined,
        startDate: new Date(data.startDate).toISOString(),
        endDate: new Date(data.endDate).toISOString(),
        reason: data.reason,
        attachmentUrl: data.attachmentUrl || undefined,
      });
    },
    onSuccess: () => {
      router.push(`/${locale}/absences/leaves/my-requests`);
    },
  });

  const onSubmit = (data: LeaveRequestValues) => {
    mutation.mutate(data);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await api.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const url = response.data.url;
      setValue("attachmentUrl", url);
      setUploadedFileName(file.name);
    } catch (err) {
      console.error("Upload error:", err);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveFile = () => {
    setValue("attachmentUrl", "");
    setUploadedFileName("");
  };

  const attachmentUrl = watch("attachmentUrl");

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
            <p className="text-xs text-destructive/80 mt-1.5">
              * Os campos marcados com * são obrigatórios
            </p>
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
                  className="flex h-10 w-full rounded-2xl border border-transparent bg-muted/45 px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring outline-none cursor-pointer transition-colors"
                >
                  <Option value="MEDICAL">Médica (Atestado)</Option>
                  <Option value="PARENTAL">Parental (Maternidade/Paternidade)</Option>
                  <Option value="LEGAL">Legal (Casamento, Óbito, etc.)</Option>
                  <Option value="UNPAID">Não Remunerada</Option>
                  <Option value="OTHER">Outros Afastamentos</Option>
                </Select>
                {errors.type && <p className="text-xs text-destructive">{errors.type.message}</p>}
              </div>

              {selectedType === "OTHER" && (
                <div className="space-y-2">
                  <Label htmlFor="customType">
                    Nome do Tipo de Afastamento <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="customType"
                    placeholder="Ex: Licença nojo, casamento, etc."
                    {...register("customType")}
                  />
                  {errors.customType && (
                    <p className="text-xs text-destructive">{errors.customType.message}</p>
                  )}
                </div>
              )}

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

              {/* Upload Dropzone */}
              <div className="space-y-2 col-span-2">
                <Label>{t("attachment")}</Label>
                {attachmentUrl ? (
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/20 border border-muted/30">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-emerald-500" />
                      <span className="text-sm font-medium">
                        {uploadedFileName || "Documento anexado"}
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={handleRemoveFile}
                      className="rounded-xl text-xs font-semibold text-destructive hover:bg-destructive/10"
                    >
                      <Trash className="w-4 h-4 mr-1" />
                      Remover
                    </Button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-36 rounded-2xl border border-dashed border-muted/40 bg-muted/10 hover:bg-muted/20 cursor-pointer transition-all">
                    {uploading ? (
                      <div className="flex flex-col items-center gap-2">
                        <CircleNotch className="w-8 h-8 animate-spin text-primary" />
                        <span className="text-xs text-muted-foreground">
                          Fazendo upload do arquivo...
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-center p-4">
                        <UploadSimple className="w-8 h-8 text-muted-foreground/80" />
                        <span className="text-sm font-semibold">Anexar atestado / comprovante</span>
                        <span className="text-xs text-muted-foreground">
                          Clique ou arraste e solte o arquivo aqui
                        </span>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                  </label>
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
            <Button
              type="submit"
              disabled={mutation.isPending || uploading}
              className="rounded-2xl bg-primary text-primary-foreground hover:bg-primary/95 transition-all"
            >
              {mutation.isPending && <CircleNotch className="mr-2 h-4 w-4 animate-spin" />}
              Solicitar Licença
            </Button>
          </div>
        </form>
      </div>
    </RbacGuard>
  );
}
