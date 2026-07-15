import { IsOptional, IsString, IsDateString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class QueryDashboardDto {
  @ApiProperty({
    description: "Filtrar as métricas gerais por um departamento específico",
    example: "c7b6a4a6-7a13-43ef-b209-efdb17eddfb1",
    required: false,
  })
  @IsString()
  @IsOptional()
  departmentId?: string;

  @ApiProperty({
    description: "Data inicial da janela de ausências (ISO Date)",
    example: "2026-07-01",
    required: false,
  })
  @IsDateString({}, { message: "A data de início deve estar no formato ISO (ex: YYYY-MM-DD)" })
  @IsOptional()
  startDate?: string;

  @ApiProperty({
    description: "Data final da janela de ausências (ISO Date)",
    example: "2026-07-31",
    required: false,
  })
  @IsDateString({}, { message: "A data de término deve estar no formato ISO (ex: YYYY-MM-DD)" })
  @IsOptional()
  endDate?: string;
}
