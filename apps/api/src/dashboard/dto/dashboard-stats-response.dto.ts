import { ApiProperty } from "@nestjs/swagger";

export class DashboardStatsResponseDto {
  @ApiProperty({ description: "Total de funcionários ativos no sistema", example: 142 })
  totalEmployees!: number;

  @ApiProperty({ description: "Total de departamentos ativos no sistema", example: 12 })
  totalDepartments!: number;

  @ApiProperty({ description: "Solicitações de férias pendentes de aprovação", example: 8 })
  pendingVacations!: number;

  @ApiProperty({ description: "Solicitações de licença pendentes de aprovação", example: 3 })
  pendingLeaves!: number;

  @ApiProperty({
    description: "Total de funcionários ausentes hoje (férias + licenças aprovadas em vigência)",
    example: 15,
  })
  activeAbsences!: number;

  @ApiProperty({ description: "Vagas de emprego abertas no módulo de recrutamento", example: 5 })
  openJobs!: number;

  @ApiProperty({
    description: "Total de candidaturas ativas (excluindo desistências)",
    example: 87,
  })
  totalApplications!: number;

  @ApiProperty({
    description: "Total de candidatos admitidos via fluxo de recrutamento",
    example: 12,
  })
  hiredCount!: number;

  @ApiProperty({
    description: "Novos colaboradores admitidos no mês corrente",
    example: 4,
  })
  newHiresThisMonth!: number;

  @ApiProperty({
    description: "Solicitações de correção de ponto aguardando aprovação",
    example: 3,
  })
  pendingCorrections!: number;

  @ApiProperty({
    description: "Candidaturas agrupadas por estágio do funil de recrutamento",
    example: {
      SUBMITTED: 20,
      SCREENING: 15,
      HR_INTERVIEW: 10,
      TECHNICAL_TEST: 8,
      TECHNICAL_INTERVIEW: 5,
      FINAL_INTERVIEW: 4,
      OFFER: 3,
      HIRED: 12,
      REJECTED: 10,
    },
  })
  applicationsByStage!: Record<string, number>;
}
