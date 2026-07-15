import { ApiProperty } from "@nestjs/swagger";

class AuditLogUserDto {
  @ApiProperty({
    description: "ID do usuário que executou a ação",
    example: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  })
  id!: string;

  @ApiProperty({
    description: "E-mail do usuário",
    example: "admin@atlas.com",
  })
  email!: string;

  @ApiProperty({
    description: "Papel do usuário no sistema",
    example: "ADMIN",
  })
  role!: string;
}

export class AuditLogResponseDto {
  @ApiProperty({
    description: "Identificador único do registro de auditoria",
    example: "a1b2c3d4-e5f6-4a0b-bc11-ce1338dfd1d2",
  })
  id!: string;

  @ApiProperty({
    description: "Ação registrada no sistema",
    example: "JOB_CREATED",
  })
  action!: string;

  @ApiProperty({
    description: "Detalhes descritivos da ação realizada",
    example: 'Vaga "Desenvolvedor Backend Sênior" criada com status DRAFT',
  })
  details!: string;

  @ApiProperty({
    description: "Data e hora em que a ação foi registrada",
    example: "2026-07-15T14:30:00.000Z",
  })
  timestamp!: Date;

  @ApiProperty({
    description: "Usuário que executou a ação (null para ações públicas/anônimas)",
    type: AuditLogUserDto,
    nullable: true,
    required: false,
    example: { id: "f47ac10b-58cc-4372-a567-0e02b2c3d479", email: "admin@atlas.com", role: "ADMIN" },
  })
  user!: AuditLogUserDto | null;
}
