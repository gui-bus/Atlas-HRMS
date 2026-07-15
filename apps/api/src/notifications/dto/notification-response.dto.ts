import { ApiProperty } from "@nestjs/swagger";

export class NotificationResponseDto {
  @ApiProperty({
    description: "Identificador único da notificação",
    example: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  })
  id!: string;

  @ApiProperty({
    description: "Mensagem contida na notificação",
    example: "Suas férias de agosto foram aprovadas!",
  })
  message!: string;

  @ApiProperty({
    description: "Estado de leitura da notificação",
    example: false,
  })
  read!: boolean;

  @ApiProperty({
    description: "ID do usuário associado",
    example: "d3b07384-d113-4a0b-bc11-ce1338dfd1d2",
  })
  userId!: string;

  @ApiProperty({
    description: "Data de criação da notificação",
    example: "2026-07-15T12:00:00.000Z",
  })
  createdAt!: Date;
}
