import { IsEmail, IsString, MinLength, IsEnum, IsOptional } from "class-validator";
import { UserRole } from "@prisma/client";

export class RegisterDto {
  @IsEmail({}, { message: "E-mail inválido" })
  email!: string;

  @IsString()
  @MinLength(6, { message: "A senha deve conter no mínimo 6 caracteres" })
  password!: string;

  @IsOptional()
  @IsEnum(UserRole, { message: "Cargo inválido" })
  role?: UserRole;
}
