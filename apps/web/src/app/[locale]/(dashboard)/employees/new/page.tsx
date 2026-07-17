"use client";

import React from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { CircleNotch, ArrowLeft, Plus, Trash } from "@phosphor-icons/react";
import { Briefcase, User, MapPin, CreditCard, PhoneCall } from "@phosphor-icons/react";

import { employeeService } from "@/services/employee.service";
import { RbacGuard } from "@/components/rbac-guard";
import { employeeSchema, EmployeeFormValues } from "@/schemas/employee.schema";
import { Button } from "@/components/ui/button";
import { Select, Option } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormSectionHeader } from "@/components/form-section-header";
import { FormHeader } from "@/components/form-header";
import { FormActions } from "@/components/form-actions";

export default function NewEmployeePage() {
  const t = useTranslations("Employees");
  const params = useParams();
  const router = useRouter();
  const locale = params?.locale || "pt";

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      status: "ACTIVE",
      personalData: { cpf: "", rg: "", birthDate: "", gender: "", maritalStatus: "" },
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
      emergencyContacts: [{ name: "", phone: "", relationship: "", isPrimary: true }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "emergencyContacts",
  });

  const cep = watch("address.cep");
  React.useEffect(() => {
    const cleanCep = (cep || "").replace(/[^\d]/g, "");
    if (cleanCep.length === 8) {
      fetch(`https://viacep.com.br/ws/${cleanCep}/json/`)
        .then((res) => res.json())
        .then((data) => {
          if (!data.erro) {
            setValue("address.street", data.logradouro || "");
            setValue("address.neighborhood", data.bairro || "");
            setValue("address.city", data.localidade || "");
            setValue("address.state", data.uf || "");
          }
        })
        .catch((err) => console.error("Error fetching CEP:", err));
    }
  }, [cep, setValue]);

  const mutation = useMutation({
    mutationFn: (data: EmployeeFormValues) => {
      const sanitizedAddress = data.address?.cep ? data.address : undefined;
      const sanitizedBankAccount = data.bankAccount?.bankCode ? data.bankAccount : undefined;

      return employeeService.createEmployee({
        ...data,
        salary: String(data.salary),
        personalData: {
          ...data.personalData,
          birthDate: new Date(data.personalData.birthDate).toISOString(),
        },
        address: sanitizedAddress,
        bankAccount: sanitizedBankAccount,
        hireDate: new Date(data.hireDate).toISOString(),
      });
    },
    onSuccess: () => {
      router.push(`/${locale}/employees`);
    },
  });

  const onSubmit = (data: EmployeeFormValues) => {
    mutation.mutate(data);
  };

  return (
    <RbacGuard allowedRoles={["ADMIN", "HR"]}>
      <div className="p-6 md:p-8 space-y-6 w-full">
        <FormHeader
          title={t("addEmployee")}
          subTitle={t("subTitle")}
          requiredNotice={t("requiredFieldsNotice")}
        />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 w-full">
          <div className="space-y-4">
            <FormSectionHeader
              title={t("tabs.professional")}
              description={t("tabsDescriptions.professional")}
              icon={Briefcase}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 w-full">
              <div className="space-y-2">
                <Label htmlFor="firstName">
                  {t("form.firstName")} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="firstName"
                  placeholder={t("form.firstName")}
                  {...register("firstName")}
                />
                {errors.firstName && (
                  <p className="text-xs text-destructive">{errors.firstName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">
                  {t("form.lastName")} <span className="text-destructive">*</span>
                </Label>
                <Input id="lastName" placeholder={t("form.lastName")} {...register("lastName")} />
                {errors.lastName && (
                  <p className="text-xs text-destructive">{errors.lastName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">
                  {t("form.email")} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t("form.email")}
                  {...register("email")}
                />
                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">
                  {t("form.phone")} <span className="text-destructive">*</span>
                </Label>
                <Input id="phone" placeholder={t("form.phone")} {...register("phone")} />
                {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">
                  {t("form.status")} <span className="text-destructive">*</span>
                </Label>
                <Select
                  id="status"
                  {...register("status")}
                  className="flex h-10 w-full rounded-2xl border border-transparent bg-muted/45 px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring outline-none cursor-pointer transition-colors"
                >
                  <Option value="ACTIVE">{t("statusActive")}</Option>
                  <Option value="INACTIVE">{t("statusInactive")}</Option>
                  <Option value="ON_LEAVE">{t("statusOnLeave")}</Option>
                  <Option value="SUSPENDED">{t("statusSuspended")}</Option>
                </Select>
                {errors.status && (
                  <p className="text-xs text-destructive">{errors.status.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="hireDate">
                  {t("form.hireDate")} <span className="text-destructive">*</span>
                </Label>
                <Input id="hireDate" type="date" {...register("hireDate")} />
                {errors.hireDate && (
                  <p className="text-xs text-destructive">{errors.hireDate.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="salary">
                  {t("form.salary")} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="salary"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...register("salary")}
                />
                {errors.salary && (
                  <p className="text-xs text-destructive">{errors.salary.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="terminationDate">{t("form.terminationDate")}</Label>
                <Input id="terminationDate" type="date" {...register("terminationDate")} />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <FormSectionHeader
              title={t("tabs.personal")}
              description={t("tabsDescriptions.personal")}
              icon={User}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 w-full">
              <div className="space-y-2">
                <Label htmlFor="personalData.cpf">
                  {t("form.cpf")} <span className="text-destructive">*</span>
                </Label>
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
                <Input
                  id="personalData.rg"
                  placeholder={t("form.rg")}
                  {...register("personalData.rg")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="personalData.birthDate">
                  {t("form.birthDate")} <span className="text-destructive">*</span>
                </Label>
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
                <Input
                  id="personalData.gender"
                  placeholder={t("form.gender")}
                  {...register("personalData.gender")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="personalData.maritalStatus">{t("form.maritalStatus")}</Label>
                <Input
                  id="personalData.maritalStatus"
                  placeholder={t("form.maritalStatus")}
                  {...register("personalData.maritalStatus")}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <FormSectionHeader
              title={t("tabs.address")}
              description={t("tabsDescriptions.address")}
              icon={MapPin}
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4 w-full">
              <div className="space-y-2">
                <Label htmlFor="address.cep">
                  {t("form.cep")} <span className="text-destructive">*</span>
                </Label>
                <Input id="address.cep" placeholder="00000-000" {...register("address.cep")} />
                {errors.address?.cep && (
                  <p className="text-xs text-destructive">{errors.address.cep.message}</p>
                )}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address.street">
                  {t("form.street")} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="address.street"
                  placeholder={t("form.street")}
                  {...register("address.street")}
                />
                {errors.address?.street && (
                  <p className="text-xs text-destructive">{errors.address.street.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="address.number">
                  {t("form.number")} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="address.number"
                  placeholder={t("form.number")}
                  {...register("address.number")}
                />
                {errors.address?.number && (
                  <p className="text-xs text-destructive">{errors.address.number.message}</p>
                )}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address.complement">{t("form.complement")}</Label>
                <Input
                  id="address.complement"
                  placeholder={t("form.complement")}
                  {...register("address.complement")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address.neighborhood">
                  {t("form.neighborhood")} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="address.neighborhood"
                  placeholder={t("form.neighborhood")}
                  {...register("address.neighborhood")}
                />
                {errors.address?.neighborhood && (
                  <p className="text-xs text-destructive">{errors.address.neighborhood.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="address.city">
                  {t("form.city")} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="address.city"
                  placeholder={t("form.city")}
                  {...register("address.city")}
                />
                {errors.address?.city && (
                  <p className="text-xs text-destructive">{errors.address.city.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="address.state">
                  {t("form.state")} <span className="text-destructive">*</span>
                </Label>
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
            </div>
          </div>

          <div className="space-y-4">
            <FormSectionHeader
              title={t("tabs.bank")}
              description={t("tabsDescriptions.bank")}
              icon={CreditCard}
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4 w-full">
              <div className="space-y-2">
                <Label htmlFor="bankAccount.bankCode">
                  {t("form.bankCode")} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="bankAccount.bankCode"
                  placeholder="341"
                  {...register("bankAccount.bankCode")}
                />
                {errors.bankAccount?.bankCode && (
                  <p className="text-xs text-destructive">{errors.bankAccount.bankCode.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="bankAccount.bankAgency">
                  {t("form.bankAgency")} <span className="text-destructive">*</span>
                </Label>
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
                <Label htmlFor="bankAccount.bankAccount">
                  {t("form.bankAccount")} <span className="text-destructive">*</span>
                </Label>
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
                <Label htmlFor="bankAccount.accountType">
                  {t("form.accountType")} <span className="text-destructive">*</span>
                </Label>
                <Select
                  id="bankAccount.accountType"
                  {...register("bankAccount.accountType")}
                  className="flex h-8 w-full rounded-2xl border border-transparent bg-input/50 px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring outline-none cursor-pointer transition-colors"
                >
                  <Option value="CORRENTE">CORRENTE</Option>
                  <Option value="POUPANCA">POUPANÇA</Option>
                  <Option value="SALARIO">SALÁRIO</Option>
                </Select>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <FormSectionHeader
              title={t("tabs.emergency")}
              description={t("tabsDescriptions.emergency")}
              icon={PhoneCall}
            />
            <div className="space-y-4 w-full">
              {fields.map((item, index) => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl relative space-y-4 bg-muted/20 border-0"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold">Contato #{index + 1}</span>
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:bg-destructive/10 rounded-xl"
                        onClick={() => remove(index)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
                    <div className="space-y-2">
                      <Label>
                        {t("form.emergencyName")} <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        placeholder={t("form.emergencyName")}
                        {...register(`emergencyContacts.${index}.name` as const)}
                      />
                      {errors.emergencyContacts?.[index]?.name && (
                        <p className="text-xs text-destructive">
                          {errors.emergencyContacts[index]?.name?.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>
                        {t("form.emergencyPhone")} <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        placeholder={t("form.emergencyPhone")}
                        {...register(`emergencyContacts.${index}.phone` as const)}
                      />
                      {errors.emergencyContacts?.[index]?.phone && (
                        <p className="text-xs text-destructive">
                          {errors.emergencyContacts[index]?.phone?.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>
                        {t("form.emergencyRelationship")}{" "}
                        <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        placeholder={t("form.emergencyRelationship")}
                        {...register(`emergencyContacts.${index}.relationship` as const)}
                      />
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
                className="w-full gap-2 rounded-2xl border-0 bg-muted/40 hover:bg-muted/65 transition-colors h-10"
                onClick={() => append({ name: "", phone: "", relationship: "", isPrimary: false })}
              >
                <Plus className="h-4 w-4" />
                {t("form.emergencyName")}
              </Button>
            </div>
          </div>

          {mutation.isError && (
            <p className="text-sm text-destructive font-medium">
              Erro ao criar funcionário. CPF ou e-mail já existentes.
            </p>
          )}

          <FormActions
            cancelText={t("table.cancel")}
            submitText={t("form.create")}
            isSubmitting={mutation.isPending}
          />
        </form>
      </div>
    </RbacGuard>
  );
}
