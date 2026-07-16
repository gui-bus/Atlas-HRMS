import { z } from "zod";

export const recruitmentSchema = z
  .object({
    title: z.string().min(1, "Título da vaga é obrigatório"),
    description: z.string().min(1, "Descrição é obrigatória"),
    employmentType: z.enum(["CLT", "PJ", "CONTRACTOR", "INTERNSHIP", "TEMPORARY"]),
    workModel: z.enum(["REMOTE", "HYBRID", "ONSITE"]),
    seniority: z.enum(["JUNIOR", "MID", "SENIOR", "LEAD", "EXECUTIVE"]),
    vacancies: z.string().min(1, "Quantidade de vagas é obrigatória"),
    salaryMin: z.string().optional().or(z.literal("")),
    salaryMax: z.string().optional().or(z.literal("")),
    requirements: z.string().optional(),
    departmentId: z.string().min(1, "Departamento é obrigatório"),
    positionId: z.string().min(1, "Cargo é obrigatório"),
    status: z.enum(["DRAFT", "OPEN", "CLOSED", "CANCELLED"]),
  })
  .refine(
    (data) => {
      if (!data.salaryMin || !data.salaryMax) return true;
      const min = parseFloat(data.salaryMin);
      const max = parseFloat(data.salaryMax);
      if (isNaN(min) || isNaN(max)) return true;
      return max >= min;
    },
    {
      message: "O salário máximo deve ser maior ou igual ao mínimo",
      path: ["salaryMax"],
    },
  );

export type RecruitmentFormValues = z.infer<typeof recruitmentSchema>;
