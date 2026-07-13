import { IsEmail, IsString, MinLength, IsEnum, IsOptional, Matches } from "class-validator";
import { UserRole } from "@prisma/client";

export class RegisterDto {
  @IsEmail({}, { message: "E-mail inválido" })
  email!: string;

  @IsString()
  @MinLength(8, { message: "A senha deve conter no mínimo 8 caracteres" })
  @Matches(/(?=.*[a-z])/, {
    message: "A senha deve conter pelo menos uma letra minúscula",
  })
  @Matches(/(?=.*[A-Z])/, {
    message: "A senha deve conter pelo menos uma letra maiúscula",
  })
  @Matches(/(?=.*[0-9])/, {
    message: "A senha deve conter pelo menos um número",
  })
  @Matches(/(?=.*[!@#$%^&*(),.?":{}|<>])/, {
    message: "A senha deve conter pelo menos um caractere especial (símbolo)",
  })
  password!: string;

  @IsOptional()
  @IsEnum(UserRole, { message: "Cargo inválido" })
  role?: UserRole;
}
