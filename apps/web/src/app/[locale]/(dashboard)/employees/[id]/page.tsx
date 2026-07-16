"use client";

import React, { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { Loader2, ArrowLeft, Plus, Trash } from "lucide-react";

import { employeeService } from "@/services/employee.service";
import { employeeSchema, EmployeeFormValues } from "@/schemas/employee.schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const formatDateForInput = (dateString?: string | Date) => {
  if (!dateString) return "";
  try {
    return new Date(dateString).toISOString().split("T")[0];
  } catch {
    return "";
  }
};

export default function EmployeeDetailsPage() {
  const t = useTranslations("Employees");
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = params?.id as string;
  const locale = params?.locale || "pt";

  // Fetch data
  const {
    data: employee,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["employee", id],
    queryFn: () => employeeService.getEmployee(id),
    enabled: !!id,
  });

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      status: "ACTIVE",
      hireDate: "",
      salary: "",
      personalData: {
        cpf: "",
        rg: "",
        birthDate: "",
        gender: "",
        maritalStatus: "",
        avatarUrl: "",
      },
      address: {
        cep: "",
        street: "",
        number: "",
        complement: "",
        neighborhood: "",
        city: "",
        state: "",
      },
      bankAccount: { bankCode: "", bankAgency: "", bankAccount: "", accountType: "CORRENTE" },
      emergencyContacts: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "emergencyContacts",
  });

  // Prepopulate form when data arrives
  useEffect(() => {
    if (employee) {
      reset({
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email,
        phone: employee.phone,
        status: employee.status,
        hireDate: formatDateForInput(employee.hireDate),
        terminationDate: formatDateForInput(employee.terminationDate || undefined),
        salary: employee.salary,
        userId: employee.userId,
        departmentId: employee.departmentId,
        positionId: employee.positionId,
        personalData: {
          cpf: employee.personalData?.cpf || "",
          rg: employee.personalData?.rg || "",
          birthDate: formatDateForInput(employee.personalData?.birthDate),
          gender: employee.personalData?.gender || "",
          maritalStatus: employee.personalData?.maritalStatus || "",
          avatarUrl: employee.personalData?.avatarUrl || "",
        },
        address: {
          cep: employee.address?.cep || "",
          street: employee.address?.street || "",
          number: employee.address?.number || "",
          complement: employee.address?.complement || "",
          neighborhood: employee.address?.neighborhood || "",
          city: employee.address?.city || "",
          state: employee.address?.state || "",
        },
        bankAccount: {
          bankCode: employee.bankAccount?.bankCode || "",
          bankAgency: employee.bankAccount?.bankAgency || "",
          bankAccount: employee.bankAccount?.bankAccount || "",
          accountType: employee.bankAccount?.accountType || "CORRENTE",
        },
        emergencyContacts:
          employee.emergencyContacts?.map((c) => ({
            id: c.id,
            name: c.name,
            phone: c.phone,
            relationship: c.relationship,
            isPrimary: c.isPrimary,
          })) || [],
      });
    }
  }, [employee, reset]);

  const updateMutation = useMutation({
    mutationFn: (data: EmployeeFormValues) => {
      return employeeService.updateEmployee(id, {
        ...data,
        salary: String(data.salary),
        personalData: {
          ...data.personalData,
          birthDate: new Date(data.personalData.birthDate).toISOString(),
        },
        hireDate: new Date(data.hireDate).toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      queryClient.invalidateQueries({ queryKey: ["employee", id] });
      router.push(`/${locale}/employees`);
    },
  });

  const onSubmit = (data: EmployeeFormValues) => {
    updateMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !employee) {
    return <div className="p-8 text-center text-destructive font-medium">{t("form.notFound")}</div>;
  }

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {employee.firstName} {employee.lastName}
          </h1>
          <p className="text-muted-foreground text-sm">{t("subTitle")}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Tabs defaultValue="professional" className="w-full">
          <TabsList className="grid grid-cols-5 w-full">
            <TabsTrigger value="professional">{t("tabs.professional")}</TabsTrigger>
            <TabsTrigger value="personal">{t("tabs.personal")}</TabsTrigger>
            <TabsTrigger value="address">{t("tabs.address")}</TabsTrigger>
            <TabsTrigger value="bank">{t("tabs.bank")}</TabsTrigger>
            <TabsTrigger value="emergency">{t("tabs.emergency")}</TabsTrigger>
          </TabsList>

          {/* Professional Info */}
          <TabsContent value="professional" className="space-y-4 pt-4">
            <Card>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6">
                <div className="space-y-2">
                  <Label htmlFor="firstName">{t("form.firstName")}</Label>
                  <Input id="firstName" {...register("firstName")} />
                  {errors.firstName && (
                    <p className="text-xs text-destructive">{errors.firstName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">{t("form.lastName")}</Label>
                  <Input id="lastName" {...register("lastName")} />
                  {errors.lastName && (
                    <p className="text-xs text-destructive">{errors.lastName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">{t("form.email")}</Label>
                  <Input id="email" type="email" {...register("email")} />
                  {errors.email && (
                    <p className="text-xs text-destructive">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">{t("form.phone")}</Label>
                  <Input id="phone" {...register("phone")} />
                  {errors.phone && (
                    <p className="text-xs text-destructive">{errors.phone.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hireDate">{t("form.hireDate")}</Label>
                  <Input id="hireDate" type="date" {...register("hireDate")} />
                  {errors.hireDate && (
                    <p className="text-xs text-destructive">{errors.hireDate.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="salary">{t("form.salary")}</Label>
                  <Input id="salary" placeholder="5500.00" {...register("salary")} />
                  {errors.salary && (
                    <p className="text-xs text-destructive">{errors.salary.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">{t("form.status")}</Label>
                  <select
                    id="status"
                    {...register("status")}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="ACTIVE">{t("statusActive")}</option>
                    <option value="INACTIVE">{t("statusInactive")}</option>
                    <option value="ON_LEAVE">{t("statusOnLeave")}</option>
                    <option value="SUSPENDED">{t("statusSuspended")}</option>
                  </select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Personal Info */}
          <TabsContent value="personal" className="space-y-4 pt-4">
            <Card>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6">
                <div className="space-y-2">
                  <Label htmlFor="personalData.cpf">{t("form.cpf")}</Label>
                  <Input
                    id="personalData.cpf"
                    placeholder="000.000.000-00"
                    {...register("personalData.cpf")}
                  />
                  {errors.personalData?.cpf && (
                    <p className="text-xs text-destructive">{errors.personalData.cpf.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="personalData.rg">{t("form.rg")}</Label>
                  <Input id="personalData.rg" {...register("personalData.rg")} />
                  {errors.personalData?.rg && (
                    <p className="text-xs text-destructive">{errors.personalData.rg.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="personalData.birthDate">{t("form.birthDate")}</Label>
                  <Input
                    id="personalData.birthDate"
                    type="date"
                    {...register("personalData.birthDate")}
                  />
                  {errors.personalData?.birthDate && (
                    <p className="text-xs text-destructive">
                      {errors.personalData.birthDate.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="personalData.gender">{t("form.gender")}</Label>
                  <Input id="personalData.gender" {...register("personalData.gender")} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="personalData.maritalStatus">{t("form.maritalStatus")}</Label>
                  <Input
                    id="personalData.maritalStatus"
                    {...register("personalData.maritalStatus")}
                  />
                </div>

                <div className="space-y-2 col-span-2">
                  <Label htmlFor="personalData.avatarUrl">{t("form.avatarUrl")}</Label>
                  <Input
                    id="personalData.avatarUrl"
                    placeholder="https://example.com/avatar.png"
                    {...register("personalData.avatarUrl")}
                  />
                  {errors.personalData?.avatarUrl && (
                    <p className="text-xs text-destructive">
                      {errors.personalData.avatarUrl.message}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Address */}
          <TabsContent value="address" className="space-y-4 pt-4">
            <Card>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
                <div className="space-y-2">
                  <Label htmlFor="address.cep">{t("form.cep")}</Label>
                  <Input id="address.cep" placeholder="00000-000" {...register("address.cep")} />
                  {errors.address?.cep && (
                    <p className="text-xs text-destructive">{errors.address.cep.message}</p>
                  )}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address.street">{t("form.street")}</Label>
                  <Input id="address.street" {...register("address.street")} />
                  {errors.address?.street && (
                    <p className="text-xs text-destructive">{errors.address.street.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address.number">{t("form.number")}</Label>
                  <Input id="address.number" {...register("address.number")} />
                  {errors.address?.number && (
                    <p className="text-xs text-destructive">{errors.address.number.message}</p>
                  )}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address.complement">{t("form.complement")}</Label>
                  <Input id="address.complement" {...register("address.complement")} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address.neighborhood">{t("form.neighborhood")}</Label>
                  <Input id="address.neighborhood" {...register("address.neighborhood")} />
                  {errors.address?.neighborhood && (
                    <p className="text-xs text-destructive">
                      {errors.address.neighborhood.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address.city">{t("form.city")}</Label>
                  <Input id="address.city" {...register("address.city")} />
                  {errors.address?.city && (
                    <p className="text-xs text-destructive">{errors.address.city.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address.state">{t("form.state")}</Label>
                  <Input
                    id="address.state"
                    placeholder="MG"
                    maxLength={2}
                    {...register("address.state")}
                  />
                  {errors.address?.state && (
                    <p className="text-xs text-destructive">{errors.address.state.message}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bank details */}
          <TabsContent value="bank" className="space-y-4 pt-4">
            <Card>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6">
                <div className="space-y-2">
                  <Label htmlFor="bankAccount.bankCode">{t("form.bankCode")}</Label>
                  <Input
                    id="bankAccount.bankCode"
                    placeholder="341"
                    {...register("bankAccount.bankCode")}
                  />
                  {errors.bankAccount?.bankCode && (
                    <p className="text-xs text-destructive">
                      {errors.bankAccount.bankCode.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bankAccount.bankAgency">{t("form.bankAgency")}</Label>
                  <Input
                    id="bankAccount.bankAgency"
                    placeholder="0001"
                    {...register("bankAccount.bankAgency")}
                  />
                  {errors.bankAccount?.bankAgency && (
                    <p className="text-xs text-destructive">
                      {errors.bankAccount.bankAgency.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bankAccount.bankAccount">{t("form.bankAccount")}</Label>
                  <Input
                    id="bankAccount.bankAccount"
                    placeholder="12345-6"
                    {...register("bankAccount.bankAccount")}
                  />
                  {errors.bankAccount?.bankAccount && (
                    <p className="text-xs text-destructive">
                      {errors.bankAccount.bankAccount.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bankAccount.accountType">{t("form.accountType")}</Label>
                  <select
                    id="bankAccount.accountType"
                    {...register("bankAccount.accountType")}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="CORRENTE">CORRENTE</option>
                    <option value="POUPANCA">POUPANÇA</option>
                    <option value="SALARIO">SALÁRIO</option>
                  </select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Emergency contacts */}
          <TabsContent value="emergency" className="space-y-4 pt-4">
            <Card>
              <CardContent className="space-y-4 pt-6">
                {fields.map((item, index) => (
                  <div
                    key={item.id}
                    className="border p-4 rounded-md relative space-y-4 bg-muted/20"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold">Contato #{index + 1}</span>
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => remove(index)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>{t("form.emergencyName")}</Label>
                        <Input {...register(`emergencyContacts.${index}.name` as const)} />
                        {errors.emergencyContacts?.[index]?.name && (
                          <p className="text-xs text-destructive">
                            {errors.emergencyContacts[index]?.name?.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label>{t("form.emergencyPhone")}</Label>
                        <Input {...register(`emergencyContacts.${index}.phone` as const)} />
                        {errors.emergencyContacts?.[index]?.phone && (
                          <p className="text-xs text-destructive">
                            {errors.emergencyContacts[index]?.phone?.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label>{t("form.emergencyRelationship")}</Label>
                        <Input {...register(`emergencyContacts.${index}.relationship` as const)} />
                        {errors.emergencyContacts?.[index]?.relationship && (
                          <p className="text-xs text-destructive">
                            {errors.emergencyContacts[index]?.relationship?.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() =>
                    append({ name: "", phone: "", relationship: "", isPrimary: false })
                  }
                >
                  <Plus className="h-4 w-4" />
                  {t("form.emergencyName")}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {updateMutation.isError && (
          <p className="text-sm text-destructive font-medium">
            Erro ao atualizar funcionário. CPF ou e-mail já existentes.
          </p>
        )}

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            {t("table.cancel")}
          </Button>
          <Button type="submit" disabled={updateMutation.isPending}>
            {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t("form.save")}
          </Button>
        </div>
      </form>
    </div>
  );
}
