import { z } from "zod";

export const documentSchema = z.object({
  name: z.string().min(1, "Nome do documento é obrigatório"),
  type: z.enum(["CONTRACT", "IDENTIFICATION", "EDUCATION", "ADDRESS_PROOF", "OTHER"]),
  url: z.string().min(1, "Arquivo do documento é obrigatório").url("URL inválida"),
  employeeId: z.string().min(1, "Colaborador associado é obrigatório"),
});

export type DocumentFormValues = z.infer<typeof documentSchema>;
