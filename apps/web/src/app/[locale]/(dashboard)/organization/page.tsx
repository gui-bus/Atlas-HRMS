"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash, Pencil, Loader2, Building, Briefcase } from "lucide-react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";

import { departmentService, Department } from "@/services/department.service";
import { positionService, Position } from "@/services/position.service";
import { employeeService } from "@/services/employee.service";
import { departmentSchema, DepartmentFormValues } from "@/schemas/department.schema";
import { positionSchema, PositionFormValues } from "@/schemas/position.schema";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormSectionHeader } from "@/components/form-section-header";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function OrganizationPage() {
  const t = useTranslations("Organization");
  const params = useParams();
  const queryClient = useQueryClient();
  const locale = params?.locale || "pt";

  // Fetch Lists
  const { data: departments = [], isLoading: loadingDepts } = useQuery({
    queryKey: ["departments"],
    queryFn: () => departmentService.getDepartments(),
  });

  const { data: positions = [], isLoading: loadingPositions } = useQuery({
    queryKey: ["positions"],
    queryFn: () => positionService.getPositions(),
  });

  // Fetch Employees for manager selection
  const { data: employeesData } = useQuery({
    queryKey: ["employees", { page: 1, limit: 100 }],
    queryFn: () => employeeService.getEmployees({ page: 1, limit: 100 }),
  });
  const employees = employeesData?.data || [];

  // --- Modals State ---
  const [deptModalOpen, setDeptModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);

  const [posModalOpen, setPosModalOpen] = useState(false);
  const [editingPos, setEditingPos] = useState<Position | null>(null);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: "dept" | "pos"; id: string } | null>(
    null,
  );

  // --- React Hook Forms ---
  const {
    register: registerDept,
    handleSubmit: handleSubmitDept,
    formState: { errors: errorsDept },
    reset: resetDept,
  } = useForm<DepartmentFormValues>({
    resolver: zodResolver(departmentSchema),
    defaultValues: { name: "", code: "", description: "", managerId: "", active: true },
  });

  const {
    register: registerPos,
    handleSubmit: handleSubmitPos,
    formState: { errors: errorsPos },
    reset: resetPos,
  } = useForm<PositionFormValues>({
    resolver: zodResolver(positionSchema),
    defaultValues: {
      title: "",
      description: "",
      salaryRangeMin: "",
      salaryRangeMax: "",
      departmentId: "",
      active: true,
    },
  });

  // --- Mutations ---
  const saveDeptMutation = useMutation({
    mutationFn: (data: DepartmentFormValues) => {
      const payload = {
        name: data.name,
        code: data.code,
        description: data.description || "",
        managerId: data.managerId || null,
        active: data.active,
      };
      return editingDept
        ? departmentService.updateDepartment(editingDept.id, payload)
        : departmentService.createDepartment(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      setDeptModalOpen(false);
      setEditingDept(null);
      resetDept();
    },
  });

  const savePosMutation = useMutation({
    mutationFn: (data: PositionFormValues) => {
      const payload = {
        title: data.title,
        description: data.description || "",
        salaryRangeMin: data.salaryRangeMin,
        salaryRangeMax: data.salaryRangeMax,
        departmentId: data.departmentId,
        active: data.active,
      };
      return editingPos
        ? positionService.updatePosition(editingPos.id, payload)
        : positionService.createPosition(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["positions"] });
      setPosModalOpen(false);
      setEditingPos(null);
      resetPos();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!deleteTarget) return;
      if (deleteTarget.type === "dept") {
        await departmentService.deleteDepartment(deleteTarget.id);
      } else {
        await positionService.deletePosition(deleteTarget.id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      queryClient.invalidateQueries({ queryKey: ["positions"] });
      setDeleteConfirmOpen(false);
      setDeleteTarget(null);
    },
  });

  // --- Open Modals ---
  const handleOpenDeptModal = (dept: Department | null = null) => {
    setEditingDept(dept);
    if (dept) {
      resetDept({
        name: dept.name,
        code: dept.code,
        description: dept.description || "",
        managerId: dept.managerId || "",
        active: dept.active,
      });
    } else {
      resetDept({ name: "", code: "", description: "", managerId: "", active: true });
    }
    setDeptModalOpen(true);
  };

  const handleOpenPosModal = (pos: Position | null = null) => {
    setEditingPos(pos);
    if (pos) {
      resetPos({
        title: pos.title,
        description: pos.description || "",
        salaryRangeMin: pos.salaryRangeMin,
        salaryRangeMax: pos.salaryRangeMax,
        departmentId: pos.departmentId,
        active: pos.active,
      });
    } else {
      resetPos({
        title: "",
        description: "",
        salaryRangeMin: "",
        salaryRangeMax: "",
        departmentId: "",
        active: true,
      });
    }
    setPosModalOpen(true);
  };

  const handleOpenDeleteConfirm = (type: "dept" | "pos", id: string) => {
    setDeleteTarget({ type, id });
    setDeleteConfirmOpen(true);
  };

  // --- Tables Setup ---
  const deptColumnHelper = createColumnHelper<Department>();
  const deptColumns = [
    deptColumnHelper.accessor("code", {
      header: t("table.code"),
      cell: (info) => <span className="font-semibold text-foreground">{info.getValue()}</span>,
    }),
    deptColumnHelper.accessor("name", {
      header: t("table.name"),
      cell: (info) => <span className="font-medium">{info.getValue()}</span>,
    }),
    deptColumnHelper.accessor("manager", {
      header: t("table.manager"),
      cell: (info) => {
        const mgr = info.getValue();
        return mgr ? (
          <span className="text-muted-foreground">{`${mgr.firstName} ${mgr.lastName}`}</span>
        ) : (
          <span className="text-muted-foreground/60">—</span>
        );
      },
    }),
    deptColumnHelper.accessor("employeesCount", {
      header: t("table.employeesCount"),
      cell: (info) => <span className="text-muted-foreground">{info.getValue() || 0}</span>,
    }),
    deptColumnHelper.accessor("active", {
      header: t("table.status"),
      cell: (info) => (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${info.getValue() ? "bg-emerald-500/10 text-emerald-500" : "bg-muted text-muted-foreground"}`}
        >
          {info.getValue() ? t("active") : t("inactive")}
        </span>
      ),
    }),
    deptColumnHelper.display({
      id: "actions",
      header: t("table.actions"),
      cell: (info) => {
        const dept = info.row.original;
        return (
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-xl border-0 bg-muted/40 hover:bg-muted/65"
              onClick={() => handleOpenDeptModal(dept)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 text-destructive hover:bg-destructive/10 rounded-xl border-0"
              onClick={() => handleOpenDeleteConfirm("dept", dept.id)}
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    }),
  ];

  const posColumnHelper = createColumnHelper<Position>();
  const posColumns = [
    posColumnHelper.accessor("title", {
      header: t("table.title"),
      cell: (info) => <span className="font-medium text-foreground">{info.getValue()}</span>,
    }),
    posColumnHelper.accessor("department", {
      header: t("form.department"),
      cell: (info) => <span className="text-muted-foreground">{info.getValue()?.name || "—"}</span>,
    }),
    posColumnHelper.accessor(
      (row) =>
        `R$ ${parseFloat(row.salaryRangeMin).toFixed(2)} - R$ ${parseFloat(row.salaryRangeMax).toFixed(2)}`,
      {
        id: "salaryRange",
        header: t("table.salaryRange"),
        cell: (info) => (
          <span className="text-muted-foreground font-mono text-xs">{info.getValue()}</span>
        ),
      },
    ),
    posColumnHelper.accessor("employeesCount", {
      header: t("table.employeesCount"),
      cell: (info) => <span className="text-muted-foreground">{info.getValue() || 0}</span>,
    }),
    posColumnHelper.accessor("active", {
      header: t("table.status"),
      cell: (info) => (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${info.getValue() ? "bg-emerald-500/10 text-emerald-500" : "bg-muted text-muted-foreground"}`}
        >
          {info.getValue() ? t("active") : t("inactive")}
        </span>
      ),
    }),
    posColumnHelper.display({
      id: "actions",
      header: t("table.actions"),
      cell: (info) => {
        const pos = info.row.original;
        return (
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-xl border-0 bg-muted/40 hover:bg-muted/65"
              onClick={() => handleOpenPosModal(pos)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 text-destructive hover:bg-destructive/10 rounded-xl border-0"
              onClick={() => handleOpenDeleteConfirm("pos", pos.id)}
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    }),
  ];

  const deptTable = useReactTable({
    data: departments,
    columns: deptColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  const posTable = useReactTable({
    data: positions,
    columns: posColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="p-6 md:p-8 space-y-12 w-full">
      {/* Title Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground text-sm">{t("subTitle")}</p>
      </div>

      {/* SECTION 1: DEPARTMENTS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold tracking-tight text-foreground">{t("departments")}</h2>
          <Button onClick={() => handleOpenDeptModal(null)} className="gap-2 rounded-2xl">
            <Plus className="h-4 w-4" />
            {t("addDepartment")}
          </Button>
        </div>

        <div className="w-full bg-transparent overflow-hidden">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-sm border-collapse text-left border-0">
              <thead>
                {deptTable.getHeaderGroups().map((headerGroup) => (
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
                {loadingDepts ? (
                  <tr className="border-0">
                    <td colSpan={deptColumns.length} className="h-24 text-center border-0">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                    </td>
                  </tr>
                ) : departments.length === 0 ? (
                  <tr className="border-0">
                    <td
                      colSpan={deptColumns.length}
                      className="h-24 text-center text-muted-foreground border-0"
                    >
                      Nenhum departamento cadastrado.
                    </td>
                  </tr>
                ) : (
                  deptTable.getRowModel().rows.map((row) => (
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

      {/* SECTION 2: POSITIONS */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold tracking-tight text-foreground">{t("positions")}</h2>
          <Button onClick={() => handleOpenPosModal(null)} className="gap-2 rounded-2xl">
            <Plus className="h-4 w-4" />
            {t("addPosition")}
          </Button>
        </div>

        <div className="w-full bg-transparent overflow-hidden">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-sm border-collapse text-left border-0">
              <thead>
                {posTable.getHeaderGroups().map((headerGroup) => (
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
                {loadingPositions ? (
                  <tr className="border-0">
                    <td colSpan={posColumns.length} className="h-24 text-center border-0">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                    </td>
                  </tr>
                ) : positions.length === 0 ? (
                  <tr className="border-0">
                    <td
                      colSpan={posColumns.length}
                      className="h-24 text-center text-muted-foreground border-0"
                    >
                      Nenhum cargo cadastrado.
                    </td>
                  </tr>
                ) : (
                  posTable.getRowModel().rows.map((row) => (
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

      {/* --- Department Modal (Dialog) --- */}
      <Dialog open={deptModalOpen} onOpenChange={setDeptModalOpen}>
        <DialogContent className="border-0 shadow-2xl rounded-2xl max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingDept ? t("editDepartment") : t("addDepartment")}</DialogTitle>
            <DialogDescription className="text-xs text-destructive/80 mt-1">
              * {t("requiredFieldsNotice")}
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={handleSubmitDept((d) => saveDeptMutation.mutate(d))}
            className="space-y-4 pt-2"
          >
            <FormSectionHeader
              title={t("departments")}
              description="Informações cadastrais e gerência do departamento."
              icon={Building}
            />

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="dept-name">
                  {t("form.name")} <span className="text-destructive">*</span>
                </Label>
                <Input id="dept-name" {...registerDept("name")} />
                {errorsDept.name && (
                  <p className="text-xs text-destructive">{errorsDept.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="dept-code">
                  {t("form.code")} <span className="text-destructive">*</span>
                </Label>
                <Input id="dept-code" placeholder="DP-TI" {...registerDept("code")} />
                {errorsDept.code && (
                  <p className="text-xs text-destructive">{errorsDept.code.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="dept-description">{t("form.description")}</Label>
                <Input id="dept-description" {...registerDept("description")} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dept-manager">{t("form.manager")}</Label>
                <select
                  id="dept-manager"
                  {...registerDept("managerId")}
                  className="flex h-8 w-full rounded-2xl border border-transparent bg-input/50 px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring outline-none cursor-pointer transition-colors"
                >
                  <option value="">Selecione um gerente...</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {`${emp.firstName} ${emp.lastName}`}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDeptModalOpen(false)}
                className="rounded-2xl border-0 bg-muted/40 hover:bg-muted/65"
              >
                {t("form.cancel")}
              </Button>
              <Button type="submit" disabled={saveDeptMutation.isPending} className="rounded-2xl">
                {saveDeptMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingDept ? t("form.save") : t("form.create")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* --- Position Modal (Dialog) --- */}
      <Dialog open={posModalOpen} onOpenChange={setPosModalOpen}>
        <DialogContent className="border-0 shadow-2xl rounded-2xl max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingPos ? t("editPosition") : t("addPosition")}</DialogTitle>
            <DialogDescription className="text-xs text-destructive/80 mt-1">
              * {t("requiredFieldsNotice")}
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={handleSubmitPos((d) => savePosMutation.mutate(d))}
            className="space-y-4 pt-2"
          >
            <FormSectionHeader
              title={t("positions")}
              description="Informações funcionais e faixa salarial do cargo."
              icon={Briefcase}
            />

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pos-title">
                  {t("form.title")} <span className="text-destructive">*</span>
                </Label>
                <Input id="pos-title" {...registerPos("title")} />
                {errorsPos.title && (
                  <p className="text-xs text-destructive">{errorsPos.title.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="pos-description">{t("form.description")}</Label>
                <Input id="pos-description" {...registerPos("description")} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pos-min">
                    {t("form.salaryMin")} <span className="text-destructive">*</span>
                  </Label>
                  <Input id="pos-min" placeholder="2500.00" {...registerPos("salaryRangeMin")} />
                  {errorsPos.salaryRangeMin && (
                    <p className="text-xs text-destructive">{errorsPos.salaryRangeMin.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pos-max">
                    {t("form.salaryMax")} <span className="text-destructive">*</span>
                  </Label>
                  <Input id="pos-max" placeholder="6000.00" {...registerPos("salaryRangeMax")} />
                  {errorsPos.salaryRangeMax && (
                    <p className="text-xs text-destructive">{errorsPos.salaryRangeMax.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pos-department">
                  {t("form.department")} <span className="text-destructive">*</span>
                </Label>
                <select
                  id="pos-department"
                  {...registerPos("departmentId")}
                  className="flex h-8 w-full rounded-2xl border border-transparent bg-input/50 px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring outline-none cursor-pointer transition-colors"
                >
                  <option value="">Selecione um departamento...</option>
                  {departments
                    .filter((d) => d.active)
                    .map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                </select>
                {errorsPos.departmentId && (
                  <p className="text-xs text-destructive">{errorsPos.departmentId.message}</p>
                )}
              </div>
            </div>

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setPosModalOpen(false)}
                className="rounded-2xl border-0 bg-muted/40 hover:bg-muted/65"
              >
                {t("form.cancel")}
              </Button>
              <Button type="submit" disabled={savePosMutation.isPending} className="rounded-2xl">
                {savePosMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingPos ? t("form.save") : t("form.create")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* --- Delete Confirmation Dialog --- */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="border-0 shadow-2xl rounded-2xl max-w-sm">
          <DialogHeader>
            <DialogTitle>{t("table.deleteConfirmTitle")}</DialogTitle>
            <DialogDescription>{t("table.deleteConfirmDesc")}</DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-2">
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmOpen(false)}
              disabled={deleteMutation.isPending}
              className="rounded-2xl border-0 bg-muted/40 hover:bg-muted/65"
            >
              {t("form.cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
              className="rounded-2xl"
            >
              {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("table.delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
