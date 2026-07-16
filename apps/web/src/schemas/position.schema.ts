import { z } from "zod";

export const positionSchema = z
  .object({
    title: z.string().min(1, "Título do cargo é obrigatório"),
    description: z.string().optional(),
    salaryRangeMin: z.string().min(1, "Salário mínimo é obrigatório"),
    salaryRangeMax: z.string().min(1, "Salário máximo é obrigatório"),
    departmentId: z.string().min(1, "Departamento é obrigatório"),
    active: z.boolean(),
  })
  .refine(
    (data) => {
      const min = parseFloat(data.salaryRangeMin);
      const max = parseFloat(data.salaryRangeMax);
      if (isNaN(min) || isNaN(max)) return true;
      return max >= min;
    },
    {
      message: "O salário máximo deve ser maior ou igual ao mínimo",
      path: ["salaryRangeMax"],
    },
  );

export type PositionFormValues = z.infer<typeof positionSchema>;
