import { IsEnum, IsNotEmpty, IsString, IsOptional } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { ApplicationStatus } from "@prisma/client";

export class UpdateApplicationStatusDto {
  @ApiProperty({
    description: "Novo status da candidatura no pipeline de recrutamento",
    enum: ApplicationStatus,
    example: ApplicationStatus.SCREENING,
  })
  @IsEnum(ApplicationStatus, {
    message: `Status inválido. Valores aceitos: ${Object.values(ApplicationStatus).join(", ")}`,
  })
  @IsNotEmpty()
  status!: ApplicationStatus;

  @ApiProperty({
    description: "Feedback ou observação sobre a mudança de status",
    example: "Candidato aprovado para entrevista com RH.",
    required: false,
  })
  @IsString()
  @IsOptional()
  feedback?: string;
}
