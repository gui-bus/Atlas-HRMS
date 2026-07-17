import { z } from "zod";

const validateCPF = (cpf: string) => {
  const cleanCPF = cpf.replace(/[^\d]/g, "");

  if (cleanCPF.length !== 11) return false;

  if (/^(\d)\1{10}$/.test(cleanCPF)) return false;

  let sum = 0;
  let remainder;

  for (let i = 1; i <= 9; i++) {
    sum += parseInt(cleanCPF.substring(i - 1, i)) * (11 - i);
  }

  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.substring(9, 10))) return false;

  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(cleanCPF.substring(i - 1, i)) * (12 - i);
  }

  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.substring(10, 11))) return false;

  return true;
};

export const personalDataSchema = z.object({
  cpf: z.string().min(1, "CPF é obrigatório").refine(validateCPF, "CPF inválido"),
  rg: z.string().optional(),
  birthDate: z.string().min(1, "Data de nascimento é obrigatória"),
  gender: z.string().optional(),
  maritalStatus: z.string().optional(),
});

export const addressSchema = z
  .object({
    cep: z
      .string()
      .regex(/^\d{5}-?\d{3}$/, "CEP inválido. Ex: 00000-000")
      .optional()
      .or(z.literal("")),
    street: z.string().optional().or(z.literal("")),
    number: z.string().optional().or(z.literal("")),
    complement: z.string().optional().or(z.literal("")),
    neighborhood: z.string().optional().or(z.literal("")),
    city: z.string().optional().or(z.literal("")),
    state: z.string().optional().or(z.literal("")),
  })
  .optional()
  .nullable();

export const bankAccountSchema = z
  .object({
    bankCode: z.string().optional().or(z.literal("")),
    bankAgency: z.string().optional().or(z.literal("")),
    bankAccount: z.string().optional().or(z.literal("")),
    accountType: z.string().optional().or(z.literal("")),
  })
  .optional()
  .nullable();

export const emergencyContactSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Nome é obrigatório"),
  phone: z.string().min(1, "Telefone é obrigatório"),
  relationship: z.string().min(1, "Grau de parentesco é obrigatório"),
  isPrimary: z.boolean(),
});

export const employeeSchema = z.object({
  firstName: z.string().min(1, "Nome é obrigatório"),
  lastName: z.string().min(1, "Sobrenome é obrigatório"),
  email: z.string().min(1, "E-mail é obrigatório").email("E-mail inválido"),
  phone: z.string().min(1, "Telefone é obrigatório"),
  status: z.enum(["ACTIVE", "INACTIVE", "ON_LEAVE", "SUSPENDED"]),
  hireDate: z.string().min(1, "Data de contratação é obrigatória"),
  terminationDate: z.string().optional().nullable(),
  salary: z.string().min(1, "Salário é obrigatório"),
  userId: z.string().optional().nullable(),
  departmentId: z.string().optional().nullable(),
  positionId: z.string().optional().nullable(),
  personalData: personalDataSchema,
  address: addressSchema,
  bankAccount: bankAccountSchema,
  emergencyContacts: z.array(emergencyContactSchema),
});

export type EmployeeFormValues = z.infer<typeof employeeSchema>;
