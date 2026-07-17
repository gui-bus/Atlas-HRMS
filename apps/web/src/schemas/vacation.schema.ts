import { z } from "zod";

export const vacationRequestSchema = z
  .object({
    employeeId: z.string().min(1, "Colaborador é obrigatório"),
    startDate: z.string().min(1, "Data de início é obrigatória"),
    endDate: z.string().min(1, "Data de término é obrigatória"),
    comments: z.string().optional(),
  })
  .refine(
    (data) => {
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      return end >= start;
    },
    {
      message: "A data de término deve ser posterior ou igual à data de início",
      path: ["endDate"],
    },
  );

export const leaveRequestSchema = z
  .object({
    employeeId: z.string().min(1, "Colaborador é obrigatório"),
    type: z.enum(["MEDICAL", "PARENTAL", "LEGAL", "UNPAID", "OTHER"]),
    startDate: z.string().min(1, "Data de início é obrigatória"),
    endDate: z.string().min(1, "Data de término é obrigatória"),
    reason: z.string().min(1, "Motivo é obrigatório"),
    attachmentUrl: z.string().optional().or(z.literal("")),
    customType: z.string().optional().or(z.literal("")),
  })
  .refine(
    (data) => {
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      return end >= start;
    },
    {
      message: "A data de término deve ser posterior ou igual à data de início",
      path: ["endDate"],
    },
  );

export type VacationRequestValues = z.infer<typeof vacationRequestSchema>;
export type LeaveRequestValues = z.infer<typeof leaveRequestSchema>;
