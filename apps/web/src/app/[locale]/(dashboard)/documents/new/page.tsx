"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CircleNotch, FileArrowUp } from "@phosphor-icons/react";

import { documentService } from "@/services/document.service";
import { employeeService } from "@/services/employee.service";
import { documentSchema, DocumentFormValues } from "@/schemas/document.schema";
import { RbacGuard } from "@/components/rbac-guard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, Option } from "@/components/ui/select";
import { FormSectionHeader } from "@/components/form-section-header";
import { useToast } from "@/components/ui/toast";

export default function NewDocumentPage() {
  const t = useTranslations("Documents");
  const params = useParams();
  const router = useRouter();
  const locale = params?.locale || "pt";
  const { toast } = useToast();

  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const { data: employeesData } = useQuery({
    queryKey: ["employees", { page: 1, limit: 100 }],
    queryFn: () => employeeService.getEmployees({ page: 1, limit: 100 }),
  });
  const employees = employeesData?.data || [];

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DocumentFormValues>({
    resolver: zodResolver(documentSchema),
    defaultValues: { name: "", type: "CONTRACT", employeeId: "" },
  });

  const mutation = useMutation({
    mutationFn: (formData: FormData) => documentService.createDocument(formData),
    onSuccess: () => {
      toast("Documento adicionado com sucesso!", "success");
      router.push(`/${locale}/documents`);
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || "Erro ao adicionar documento.";
      toast(msg, "error");
    },
  });

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const onSubmit = (data: DocumentFormValues) => {
    if (!file) {
      toast("Por favor, selecione um arquivo de documento para upload.", "error");
      return;
    }
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("type", data.type);
    formData.append("employeeId", data.employeeId);
    formData.append("file", file);

    mutation.mutate(formData);
  };

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
            <h1 className="text-2xl font-bold tracking-tight">{t("addDocument")}</h1>
            <p className="text-muted-foreground text-sm">{t("addDocumentDesc")}</p>
            <p className="text-xs text-destructive/80 mt-1.5">* {t("requiredFieldsNotice")}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 w-full">
          <div className="space-y-4">
            <FormSectionHeader
              title={t("uploadSectionTitle")}
              description={t("uploadSectionDesc")}
              icon={FileArrowUp}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 w-full">
              <div className="space-y-2 col-span-2">
                <Label htmlFor="name">
                  {t("form.name")} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  {...register("name")}
                  className="h-10 rounded-2xl bg-muted/20 border-0 focus-visible:ring-1"
                />
                {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="employeeId">
                  {t("form.employee")} <span className="text-destructive">*</span>
                </Label>
                <Select id="employeeId" {...register("employeeId")}>
                  <Option value="">{t("employeeSelectPlaceholder")}</Option>
                  {employees.map((emp) => (
                    <Option key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName} ({emp.email})
                    </Option>
                  ))}
                </Select>
                {errors.employeeId && (
                  <p className="text-xs text-destructive">{errors.employeeId.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">
                  {t("form.type")} <span className="text-destructive">*</span>
                </Label>
                <Select id="type" {...register("type")}>
                  <Option value="CONTRACT">Contrato</Option>
                  <Option value="IDENTIFICATION">Documento de Identidade</Option>
                  <Option value="EDUCATION">Certificado / Educação</Option>
                  <Option value="ADDRESS_PROOF">Comprovante de Residência</Option>
                  <Option value="OTHER">Outros</Option>
                </Select>
                {errors.type && <p className="text-xs text-destructive">{errors.type.message}</p>}
              </div>

              {/* Native Drag and Drop upload area */}
              <div className="space-y-2 col-span-2">
                <Label>
                  Arquivo do Documento <span className="text-destructive">*</span>
                </Label>
                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  className={`relative border-2 border-dashed transition-all rounded-3xl p-8 flex flex-col items-center justify-center gap-2 cursor-pointer text-center bg-muted/10 min-h-[160px] ${
                    dragActive
                      ? "border-primary bg-primary/5"
                      : "border-muted-foreground/30 hover:border-primary/50"
                  }`}
                >
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <FileArrowUp className="w-8 h-8 text-muted-foreground/75" />
                  <span className="text-sm font-semibold text-foreground/90">
                    {file ? file.name : t("uploadArea")}
                  </span>
                  <span className="text-xs text-muted-foreground">{t("uploadHint")}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-muted/20">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="rounded-2xl border-0 bg-muted/40 hover:bg-muted/65 transition-colors"
            >
              {t("form.cancel")}
            </Button>
            <Button
              type="submit"
              disabled={mutation.isPending}
              className="rounded-2xl border-0 bg-primary hover:bg-primary/95 text-primary-foreground font-semibold px-6"
            >
              {mutation.isPending && <CircleNotch className="mr-2 h-4 w-4 animate-spin" />}
              {t("form.create")}
            </Button>
          </div>
        </form>
      </div>
    </RbacGuard>
  );
}
