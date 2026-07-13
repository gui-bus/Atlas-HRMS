import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, MinLength } from "class-validator";

export class LoginDto {
  @ApiProperty({
    example: "usuario@atlas.com",
    description: "Endereço de e-mail cadastrado",
  })
  @IsEmail({}, { message: "E-mail inválido" })
  email!: string;

  @ApiProperty({
    example: "SenhaFort3!",
    description: "Senha de acesso cadastrada",
  })
  @IsString()
  @MinLength(6, { message: "A senha deve conter no mínimo 6 caracteres" })
  password!: string;
}
