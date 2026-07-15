import { IsString, IsNotEmpty, IsUUID } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateNotificationDto {
  @ApiProperty({
    description: "ID do usuário destinatário da notificação",
    example: "d3b07384-d113-4a0b-bc11-ce1338dfd1d2",
  })
  @IsUUID("4", { message: "O ID do usuário deve ser um UUID válido" })
  @IsNotEmpty()
  userId!: string;

  @ApiProperty({
    description: "Mensagem descritiva da notificação",
    example: "Suas férias foram aprovadas com sucesso pelo departamento de RH.",
  })
  @IsString()
  @IsNotEmpty()
  message!: string;
}
