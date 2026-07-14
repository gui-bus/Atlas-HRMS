import { IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { VacationStatus } from "@prisma/client";

export class UpdateVacationStatusDto {
  @ApiProperty({
    enum: VacationStatus,
    description: "Status da aprovação de férias",
    example: VacationStatus.APPROVED,
  })
  @IsEnum(VacationStatus)
  @IsNotEmpty()
  status!: VacationStatus;

  @ApiProperty({
    description: "Motivo em caso de rejeição",
    example: "Período incompatível com as demandas do departamento",
    required: false,
  })
  @IsString()
  @IsOptional()
  rejectionReason?: string;
}
