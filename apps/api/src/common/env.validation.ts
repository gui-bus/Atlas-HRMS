import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().default(3001),
  DATABASE_URL: z.string().min(1, "A variável DATABASE_URL é obrigatória no ambiente").url(),
  JWT_SECRET: z.string().min(10, "A chave JWT_SECRET deve ter no mínimo 10 caracteres"),
  JWT_REFRESH_SECRET: z
    .string()
    .min(10, "A chave JWT_REFRESH_SECRET deve ter no mínimo 10 caracteres"),
  JWT_EXPIRATION: z.string().default("15m"),
  JWT_REFRESH_EXPIRATION: z.string().default("7d"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

export function validateEnv(config: Record<string, any>) {
  const result = envSchema.safeParse(config);

  if (!result.success) {
    console.error("❌ Erro de validação das variáveis de ambiente:");
    console.error(JSON.stringify(result.error.format(), null, 2));
    throw new Error("Variáveis de ambiente inválidas ou ausentes");
  }

  return result.data;
}
