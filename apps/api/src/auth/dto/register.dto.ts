import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, MinLength, IsEnum, IsOptional, Matches } from "class-validator";
import { UserRole } from "@prisma/client";

export class RegisterDto {
  @ApiProperty({
    example: "usuario@atlas.com",
    description: "Endereço de e-mail do usuário",
  })
  @IsEmail({}, { message: "E-mail inválido" })
  email!: string;

  @ApiProperty({
    example: "SenhaFort3!",
    description:
      "Senha de acesso (mínimo 8 caracteres, contendo pelo menos uma letra maiúscula, uma minúscula, um número e um caractere especial)",
  })
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

  @ApiProperty({
    example: "SenhaFort3!",
    description: "Confirmação da senha (deve ser idêntica à senha informada)",
  })
  @IsString()
  confirmPassword!: string;

  @ApiProperty({
    enum: UserRole,
    example: UserRole.EMPLOYEE,
    description: "Cargo organizacional do usuário",
    required: false,
  })
  @IsOptional()
  @IsEnum(UserRole, { message: "Cargo inválido" })
  role?: UserRole;
}
