"use client";

import React, { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Calendar, FileText, Loader2, Plus, ArrowLeft } from "lucide-react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";

import { useAuthStore } from "@/store/useAuthStore";
import { employeeService } from "@/services/employee.service";
import { vacationService, Vacation, Leave } from "@/services/vacation.service";
import {
  vacationRequestSchema,
  leaveRequestSchema,
  VacationRequestValues,
  LeaveRequestValues,
} from "@/schemas/vacation.schema";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormSectionHeader } from "@/components/form-section-header";

const formatDate = (dateString: string) => {
  try {
    return new Date(dateString).toLocaleDateString();
  } catch {
    return dateString;
  }
};

export default function MyRequestsPage() {
  const t = useTranslations("Absences");
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const locale = params?.locale || "pt";

  // --- Fetch the Employee matching the logged-in user email ---
  const { data: employeesData, isLoading: loadingEmployee } = useQuery({
    queryKey: ["employees", { search: user?.email }],
    queryFn: () => employeeService.getEmployees({ search: user?.email }),
    enabled: !!user?.email,
  });

  const employee = employeesData?.data?.[0];
  const employeeId = employee?.id || "";

  // --- Fetch My History ---
  const { data: myVacations = [], isLoading: loadingVacations } = useQuery({
    queryKey: ["my-vacations", employeeId],
    queryFn: () => vacationService.getEmployeeVacations(employeeId),
    enabled: !!employeeId,
  });

  const { data: myLeaves = [], isLoading: loadingLeaves } = useQuery({
    queryKey: ["my-leaves", employeeId],
    queryFn: () => vacationService.getEmployeeLeaves(employeeId),
    enabled: !!employeeId,
  });

  // --- React Hook Forms ---
  const {
    register: registerVac,
    handleSubmit: handleSubmitVac,
    formState: { errors: errorsVac },
    reset: resetVac,
    setValue: setValVac,
  } = useForm<VacationRequestValues>({
    resolver: zodResolver(vacationRequestSchema),
    defaultValues: { employeeId: "", startDate: "", endDate: "", comments: "" },
  });

  const {
    register: registerLeave,
    handleSubmit: handleSubmitLeave,
    formState: { errors: errorsLeave },
    reset: resetLeave,
    setValue: setValLeave,
  } = useForm<LeaveRequestValues>({
    resolver: zodResolver(leaveRequestSchema),
    defaultValues: {
      employeeId: "",
      type: "MEDICAL",
      startDate: "",
      endDate: "",
      reason: "",
      attachmentUrl: "",
    },
  });

  // Set employeeId when employee is loaded
  useEffect(() => {
    if (employeeId) {
      setValVac("employeeId", employeeId);
      setValLeave("employeeId", employeeId);
    }
  }, [employeeId, setValVac, setValLeave]);

  // --- Mutations ---
  const requestVacationMutation = useMutation({
    mutationFn: (data: VacationRequestValues) => {
      return vacationService.createVacation({
        employeeId: data.employeeId,
        startDate: new Date(data.startDate).toISOString(),
        endDate: new Date(data.endDate).toISOString(),
        comments: data.comments,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-vacations", employeeId] });
      resetVac({ employeeId, startDate: "", endDate: "", comments: "" });
    },
  });

  const requestLeaveMutation = useMutation({
    mutationFn: (data: LeaveRequestValues) => {
      return vacationService.createLeave({
        employeeId: data.employeeId,
        type: data.type,
        startDate: new Date(data.startDate).toISOString(),
        endDate: new Date(data.endDate).toISOString(),
        reason: data.reason,
        attachmentUrl: data.attachmentUrl || "",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-leaves", employeeId] });
      resetLeave({
        employeeId,
        type: "MEDICAL",
        startDate: "",
        endDate: "",
        reason: "",
        attachmentUrl: "",
      });
    },
  });

  // --- Cancel Actions ---
  const cancelVacationMutation = useMutation({
    mutationFn: (id: string) => vacationService.cancelVacation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-vacations", employeeId] });
    },
  });

  const cancelLeaveMutation = useMutation({
    mutationFn: (id: string) => vacationService.cancelLeave(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-leaves", employeeId] });
    },
  });

  // --- Tables Setup ---
  const vColumnHelper = createColumnHelper<Vacation>();
  const vacationColumns = [
    vColumnHelper.accessor("startDate", {
      header: t("startDate"),
      cell: (info) => <span className="text-muted-foreground">{formatDate(info.getValue())}</span>,
    }),
    vColumnHelper.accessor("endDate", {
      header: t("endDate"),
      cell: (info) => <span className="text-muted-foreground">{formatDate(info.getValue())}</span>,
    }),
    vColumnHelper.accessor("comments", {
      header: t("comments"),
      cell: (info) => (
        <span className="text-muted-foreground text-xs">{info.getValue() || "—"}</span>
      ),
    }),
    vColumnHelper.accessor("status", {
      header: t("status"),
      cell: (info) => {
        const val = info.getValue();
        const colors = {
          PENDING: "bg-amber-500/10 text-amber-500",
          APPROVED: "bg-emerald-500/10 text-emerald-500",
          REJECTED: "bg-destructive/10 text-destructive",
          CANCELLED: "bg-muted text-muted-foreground",
        };
        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${colors[val]}`}
          >
            {t(
              `status${(val.charAt(0) + val.slice(1).toLowerCase()) as "Pending" | "Approved" | "Rejected" | "Cancelled"}`,
            )}
          </span>
        );
      },
    }),
    vColumnHelper.display({
      id: "actions",
      header: t("actions"),
      cell: (info) => {
        const row = info.row.original;
        if (row.status !== "PENDING")
          return <span className="text-muted-foreground/60 text-xs">—</span>;
        return (
          <Button
            variant="outline"
            size="sm"
            className="text-destructive hover:bg-destructive/10 border-0 h-7"
            disabled={cancelVacationMutation.isPending}
            onClick={() => cancelVacationMutation.mutate(row.id)}
          >
            {t("cancel")}
          </Button>
        );
      },
    }),
  ];

  const lColumnHelper = createColumnHelper<Leave>();
  const leaveColumns = [
    lColumnHelper.accessor("type", {
      header: t("type"),
      cell: (info) => {
        const typeMap = {
          MEDICAL: t("medical"),
          PARENTAL: t("parental"),
          LEGAL: t("legal"),
          UNPAID: t("unpaid"),
          OTHER: t("other"),
        };
        return <span className="font-medium text-foreground">{typeMap[info.getValue()]}</span>;
      },
    }),
    lColumnHelper.accessor("startDate", {
      header: t("startDate"),
      cell: (info) => <span className="text-muted-foreground">{formatDate(info.getValue())}</span>,
    }),
    lColumnHelper.accessor("endDate", {
      header: t("endDate"),
      cell: (info) => <span className="text-muted-foreground">{formatDate(info.getValue())}</span>,
    }),
    lColumnHelper.accessor("reason", {
      header: t("reason"),
      cell: (info) => <span className="text-muted-foreground text-xs">{info.getValue()}</span>,
    }),
    lColumnHelper.accessor("status", {
      header: t("status"),
      cell: (info) => {
        const val = info.getValue();
        const colors = {
          PENDING: "bg-amber-500/10 text-amber-500",
          APPROVED: "bg-emerald-500/10 text-emerald-500",
          REJECTED: "bg-destructive/10 text-destructive",
          CANCELLED: "bg-muted text-muted-foreground",
        };
        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${colors[val]}`}
          >
            {t(
              `status${(val.charAt(0) + val.slice(1).toLowerCase()) as "Pending" | "Approved" | "Rejected" | "Cancelled"}`,
            )}
          </span>
        );
      },
    }),
    lColumnHelper.display({
      id: "actions",
      header: t("actions"),
      cell: (info) => {
        const row = info.row.original;
        if (row.status !== "PENDING")
          return <span className="text-muted-foreground/60 text-xs">—</span>;
        return (
          <Button
            variant="outline"
            size="sm"
            className="text-destructive hover:bg-destructive/10 border-0 h-7"
            disabled={cancelLeaveMutation.isPending}
            onClick={() => cancelLeaveMutation.mutate(row.id)}
          >
            {t("cancel")}
          </Button>
        );
      },
    }),
  ];

  const vacationTable = useReactTable({
    data: myVacations,
    columns: vacationColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  const leaveTable = useReactTable({
    data: myLeaves,
    columns: leaveColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (loadingEmployee) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!employeeId) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Nenhum cadastro de colaborador encontrado para o seu usuário. Por favor, contate o RH.
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-12 w-full">
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
          <h1 className="text-2xl font-bold tracking-tight">{t("myRequests")}</h1>
          <p className="text-muted-foreground text-sm">
            Gerencie suas ausências, férias e atestados médicos.
          </p>
          <p className="text-xs text-destructive/80 mt-1.5">* Indica campos obrigatórios</p>
        </div>
      </div>

      {/* Stacked Forms Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 w-full pt-4">
        {/* Form 1: Request Vacation */}
        <form
          onSubmit={handleSubmitVac((d) => requestVacationMutation.mutate(d))}
          className="space-y-4"
        >
          <FormSectionHeader
            title={t("addVacation")}
            description="Solicite um período de descanso anual remunerado."
            icon={Calendar}
          />

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vac-start">
                  {t("startDate")} <span className="text-destructive">*</span>
                </Label>
                <Input id="vac-start" type="date" {...registerVac("startDate")} />
                {errorsVac.startDate && (
                  <p className="text-xs text-destructive">{errorsVac.startDate.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="vac-end">
                  {t("endDate")} <span className="text-destructive">*</span>
                </Label>
                <Input id="vac-end" type="date" {...registerVac("endDate")} />
                {errorsVac.endDate && (
                  <p className="text-xs text-destructive">{errorsVac.endDate.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="vac-comments">{t("comments")}</Label>
              <Input
                id="vac-comments"
                placeholder="Desejo antecipar 13º salário..."
                {...registerVac("comments")}
              />
            </div>

            <Button
              type="submit"
              disabled={requestVacationMutation.isPending}
              className="w-full rounded-2xl h-10"
            >
              {requestVacationMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {t("save")}
            </Button>
          </div>
        </form>

        {/* Form 2: Request Leave */}
        <form
          onSubmit={handleSubmitLeave((d) => requestLeaveMutation.mutate(d))}
          className="space-y-4"
        >
          <FormSectionHeader
            title={t("addLeave")}
            description="Envie atestados médicos ou solicite licenças legais."
            icon={FileText}
          />

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="leave-start">
                  {t("startDate")} <span className="text-destructive">*</span>
                </Label>
                <Input id="leave-start" type="date" {...registerLeave("startDate")} />
                {errorsLeave.startDate && (
                  <p className="text-xs text-destructive">{errorsLeave.startDate.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="leave-end">
                  {t("endDate")} <span className="text-destructive">*</span>
                </Label>
                <Input id="leave-end" type="date" {...registerLeave("endDate")} />
                {errorsLeave.endDate && (
                  <p className="text-xs text-destructive">{errorsLeave.endDate.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="leave-type">
                  {t("type")} <span className="text-destructive">*</span>
                </Label>
                <select
                  id="leave-type"
                  {...registerLeave("type")}
                  className="flex h-8 w-full rounded-2xl border border-transparent bg-input/50 px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring outline-none cursor-pointer transition-colors"
                >
                  <option value="MEDICAL">{t("medical")}</option>
                  <option value="PARENTAL">{t("parental")}</option>
                  <option value="LEGAL">{t("legal")}</option>
                  <option value="UNPAID">{t("unpaid")}</option>
                  <option value="OTHER">{t("other")}</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="leave-attachment">{t("attachment")}</Label>
                <Input
                  id="leave-attachment"
                  placeholder="https://uploadthing.com/..."
                  {...registerLeave("attachmentUrl")}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="leave-reason">
                {t("reason")} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="leave-reason"
                placeholder="Atestado odontológico de 2 dias..."
                {...registerLeave("reason")}
              />
              {errorsLeave.reason && (
                <p className="text-xs text-destructive">{errorsLeave.reason.message}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={requestLeaveMutation.isPending}
              className="w-full rounded-2xl h-10"
            >
              {requestLeaveMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("save")}
            </Button>
          </div>
        </form>
      </div>

      {/* SECTION 3: MY VACATIONS HISTORY */}
      <div className="space-y-4 pt-8">
        <h2 className="text-lg font-bold tracking-tight text-foreground">
          Meu Histórico de Férias
        </h2>

        <div className="w-full bg-transparent overflow-hidden">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-sm border-collapse text-left border-0">
              <thead>
                {vacationTable.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id} className="bg-muted/20 hover:bg-muted/20 border-0">
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="h-10 px-4 align-middle font-medium text-muted-foreground border-0"
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {loadingVacations ? (
                  <tr className="border-0">
                    <td colSpan={vacationColumns.length} className="h-24 text-center border-0">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                    </td>
                  </tr>
                ) : myVacations.length === 0 ? (
                  <tr className="border-0">
                    <td
                      colSpan={vacationColumns.length}
                      className="h-24 text-center text-muted-foreground border-0"
                    >
                      Você ainda não solicitou férias.
                    </td>
                  </tr>
                ) : (
                  vacationTable.getRowModel().rows.map((row) => (
                    <tr
                      key={row.id}
                      className="odd:bg-muted/15 even:bg-transparent transition-colors hover:bg-muted/25 border-0"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="p-4 align-middle border-0">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* SECTION 4: MY LEAVES HISTORY */}
      <div className="space-y-4 pt-4">
        <h2 className="text-lg font-bold tracking-tight text-foreground">
          Meu Histórico de Licenças / Atestados
        </h2>

        <div className="w-full bg-transparent overflow-hidden">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-sm border-collapse text-left border-0">
              <thead>
                {leaveTable.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id} className="bg-muted/20 hover:bg-muted/20 border-0">
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="h-10 px-4 align-middle font-medium text-muted-foreground border-0"
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {loadingLeaves ? (
                  <tr className="border-0">
                    <td colSpan={leaveColumns.length} className="h-24 text-center border-0">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                    </td>
                  </tr>
                ) : myLeaves.length === 0 ? (
                  <tr className="border-0">
                    <td
                      colSpan={leaveColumns.length}
                      className="h-24 text-center text-muted-foreground border-0"
                    >
                      Você ainda não enviou licenças ou atestados.
                    </td>
                  </tr>
                ) : (
                  leaveTable.getRowModel().rows.map((row) => (
                    <tr
                      key={row.id}
                      className="odd:bg-muted/15 even:bg-transparent transition-colors hover:bg-muted/25 border-0"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="p-4 align-middle border-0">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
