"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { Check, X, Loader2, Calendar, FileText } from "lucide-react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";

import { vacationService, Vacation, Leave } from "@/services/vacation.service";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FormSectionHeader } from "@/components/form-section-header";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const formatDate = (dateString: string) => {
  try {
    return new Date(dateString).toLocaleDateString();
  } catch {
    return dateString;
  }
};

export default function AbsencesDashboardPage() {
  const t = useTranslations("Absences");
  const params = useParams();
  const queryClient = useQueryClient();
  const locale = params?.locale || "pt";

  // --- Fetch Lists ---
  const { data: vacations = [], isLoading: loadingVacations } = useQuery({
    queryKey: ["vacations"],
    queryFn: () => vacationService.getVacations(),
  });

  const { data: leaves = [], isLoading: loadingLeaves } = useQuery({
    queryKey: ["leaves"],
    queryFn: () => vacationService.getLeaves(),
  });

  // --- State for Action Dialogs ---
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectTarget, setRejectTarget] = useState<{
    type: "vacation" | "leave";
    id: string;
  } | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectionError, setRejectionError] = useState("");

  // --- Mutations ---
  const updateVacationStatusMutation = useMutation({
    mutationFn: (args: {
      id: string;
      status: "APPROVED" | "REJECTED";
      rejectionReason?: string;
    }) => {
      return vacationService.updateVacationStatus(args.id, {
        status: args.status,
        rejectionReason: args.rejectionReason,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vacations"] });
      setRejectDialogOpen(false);
      setRejectTarget(null);
      setRejectionReason("");
    },
  });

  const updateLeaveStatusMutation = useMutation({
    mutationFn: (args: {
      id: string;
      status: "APPROVED" | "REJECTED";
      rejectionReason?: string;
    }) => {
      return vacationService.updateLeaveStatus(args.id, {
        status: args.status,
        rejectionReason: args.rejectionReason,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leaves"] });
      setRejectDialogOpen(false);
      setRejectTarget(null);
      setRejectionReason("");
    },
  });

  const handleApprove = (type: "vacation" | "leave", id: string) => {
    if (type === "vacation") {
      updateVacationStatusMutation.mutate({ id, status: "APPROVED" });
    } else {
      updateLeaveStatusMutation.mutate({ id, status: "APPROVED" });
    }
  };

  const handleRejectClick = (type: "vacation" | "leave", id: string) => {
    setRejectTarget({ type, id });
    setRejectionReason("");
    setRejectionError("");
    setRejectDialogOpen(true);
  };

  const submitRejection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectionReason.trim()) {
      setRejectionError("Motivo de reprovação é obrigatório");
      return;
    }
    if (!rejectTarget) return;

    if (rejectTarget.type === "vacation") {
      updateVacationStatusMutation.mutate({
        id: rejectTarget.id,
        status: "REJECTED",
        rejectionReason,
      });
    } else {
      updateLeaveStatusMutation.mutate({
        id: rejectTarget.id,
        status: "REJECTED",
        rejectionReason,
      });
    }
  };

  // --- Columns Helper ---
  const vColumnHelper = createColumnHelper<Vacation>();
  const vacationColumns = [
    vColumnHelper.accessor((row) => `${row.employee?.firstName} ${row.employee?.lastName}`, {
      id: "employee",
      header: "Colaborador",
      cell: (info) => <span className="font-semibold text-foreground">{info.getValue()}</span>,
    }),
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
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 text-emerald-500 hover:bg-emerald-500/10 rounded-xl border-0"
              onClick={() => handleApprove("vacation", row.id)}
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 text-destructive hover:bg-destructive/10 rounded-xl border-0"
              onClick={() => handleRejectClick("vacation", row.id)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    }),
  ];

  const lColumnHelper = createColumnHelper<Leave>();
  const leaveColumns = [
    lColumnHelper.accessor((row) => `${row.employee?.firstName} ${row.employee?.lastName}`, {
      id: "employee",
      header: "Colaborador",
      cell: (info) => <span className="font-semibold text-foreground">{info.getValue()}</span>,
    }),
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
    lColumnHelper.accessor("attachmentUrl", {
      header: t("attachment"),
      cell: (info) => {
        const url = info.getValue();
        return url ? (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline font-medium text-xs inline-flex items-center gap-1"
          >
            Ver Anexo
          </a>
        ) : (
          <span className="text-muted-foreground/60">—</span>
        );
      },
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
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 text-emerald-500 hover:bg-emerald-500/10 rounded-xl border-0"
              onClick={() => handleApprove("leave", row.id)}
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 text-destructive hover:bg-destructive/10 rounded-xl border-0"
              onClick={() => handleRejectClick("leave", row.id)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    }),
  ];

  const vacationTable = useReactTable({
    data: vacations,
    columns: vacationColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  const leaveTable = useReactTable({
    data: leaves,
    columns: leaveColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="p-6 md:p-8 space-y-12 w-full">
      {/* Title Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground text-sm">{t("subTitle")}</p>
      </div>

      {/* SECTION 1: VACATIONS */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold tracking-tight text-foreground">{t("vacations")}</h2>

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
                ) : vacations.length === 0 ? (
                  <tr className="border-0">
                    <td
                      colSpan={vacationColumns.length}
                      className="h-24 text-center text-muted-foreground border-0"
                    >
                      Nenhuma solicitação de férias cadastrada.
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

      {/* SECTION 2: LEAVES */}
      <div className="space-y-4 pt-4">
        <h2 className="text-lg font-bold tracking-tight text-foreground">{t("leaves")}</h2>

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
                ) : leaves.length === 0 ? (
                  <tr className="border-0">
                    <td
                      colSpan={leaveColumns.length}
                      className="h-24 text-center text-muted-foreground border-0"
                    >
                      Nenhuma licença ou atestado cadastrado.
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

      {/* --- Reject Dialog with Rejection Reason --- */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="border-0 shadow-2xl rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle>{t("reject")}</DialogTitle>
            <DialogDescription className="text-xs text-destructive/80 mt-1">
              * {t("requiredFieldsNotice")}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={submitRejection} className="space-y-4 pt-2">
            <FormSectionHeader
              title={t("rejectionReason")}
              description="Escreva detalhadamente o motivo pelo qual esta ausência está sendo recusada."
              icon={FileText}
            />

            <div className="space-y-2">
              <Label htmlFor="rejection-input">
                {t("rejectionReason")} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="rejection-input"
                value={rejectionReason}
                onChange={(e) => {
                  setRejectionReason(e.target.value);
                  setRejectionError("");
                }}
              />
              {rejectionError && <p className="text-xs text-destructive">{rejectionError}</p>}
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setRejectDialogOpen(false)}
                className="rounded-2xl border-0 bg-muted/40 hover:bg-muted/65"
              >
                {t("cancel")}
              </Button>
              <Button
                type="submit"
                variant="destructive"
                className="rounded-2xl"
                disabled={
                  updateVacationStatusMutation.isPending || updateLeaveStatusMutation.isPending
                }
              >
                {(updateVacationStatusMutation.isPending ||
                  updateLeaveStatusMutation.isPending) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {t("reject")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
