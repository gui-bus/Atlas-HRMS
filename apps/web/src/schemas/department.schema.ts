import { z } from "zod";

export const departmentSchema = z.object({
  name: z.string().min(1, "Nome do departamento é obrigatório"),
  code: z.string().min(1, "Código do departamento é obrigatório"),
  description: z.string().optional(),
  managerId: z.string().nullable().optional().or(z.literal("")),
  active: z.boolean(),
});

export type DepartmentFormValues = z.infer<typeof departmentSchema>;
