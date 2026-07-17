import { ApiProperty } from "@nestjs/swagger";

class UpcomingVacationDto {
  @ApiProperty({ description: "ID único das férias", example: "a1b2c3d4-..." })
  id!: string;

  @ApiProperty({ description: "Data de início das férias", example: "2026-08-01T00:00:00.000Z" })
  startDate!: string;

  @ApiProperty({ description: "Data de término das férias", example: "2026-08-30T00:00:00.000Z" })
  endDate!: string;

  @ApiProperty({ description: "Status das férias", example: "APPROVED" })
  status!: string;
}

export class EmployeeDashboardSummaryResponseDto {
  @ApiProperty({
    description: "Saldo atual do banco de horas em minutos (positivo = crédito, negativo = débito)",
    example: 120,
  })
  hourBankBalance!: number;

  @ApiProperty({
    description: "Número de solicitações de férias pendentes de aprovação",
    example: 1,
  })
  pendingVacationsCount!: number;

  @ApiProperty({
    description: "Número de solicitações de licença pendentes de aprovação",
    example: 0,
  })
  pendingLeavesCount!: number;

  @ApiProperty({
    description: "Quantidade de registros de ponto realizados hoje (0 a 4)",
    example: 2,
  })
  todayRecordsCount!: number;

  @ApiProperty({
    description: "Próximas férias aprovadas (até 3 registros futuros)",
    type: [UpcomingVacationDto],
  })
  upcomingVacations!: UpcomingVacationDto[];
}
