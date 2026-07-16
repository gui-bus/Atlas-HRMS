import { ApiProperty } from "@nestjs/swagger";
import { IsString, MinLength, Matches } from "class-validator";

export class ChangePasswordDto {
  @ApiProperty({
    example: "SenhaAntiga1!",
    description: "Senha de acesso atual",
  })
  @IsString()
  currentPassword!: string;

  @ApiProperty({
    example: "SenhaFort3!",
    description:
      "Nova senha de acesso (mínimo 8 caracteres, contendo pelo menos uma letra maiúscula, uma minúscula, um número e um caractere especial)",
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
  newPassword!: string;

  @ApiProperty({
    example: "SenhaFort3!",
    description: "Confirmação da nova senha (deve ser idêntica)",
  })
  @IsString()
  confirmNewPassword!: string;
}
