import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class ForgotPasswordDto {
  @ApiProperty({
    description: "E-mail cadastrado no sistema para receber o token de recuperação",
    example: "colaborador@empresa.com",
  })
  @IsEmail({}, { message: "Informe um e-mail válido" })
  @IsNotEmpty({ message: "E-mail é obrigatório" })
  email!: string;
}

export class ResetPasswordDto {
  @ApiProperty({
    description: "Token hexadecimal recebido por e-mail",
    example: "a8f3b2d1c9e8",
  })
  @IsString()
  @IsNotEmpty({ message: "O token é obrigatório" })
  token!: string;

  @ApiProperty({
    description: "Nova senha do usuário",
    example: "SenhaSegura456",
  })
  @IsString()
  @MinLength(6, { message: "A nova senha deve ter no mínimo 6 caracteres" })
  @IsNotEmpty({ message: "Nova senha é obrigatória" })
  password!: string;
}
