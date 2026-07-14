import { IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { LeaveStatus } from "@prisma/client";

export class UpdateLeaveStatusDto {
  @ApiProperty({
    enum: LeaveStatus,
    description: "Status da aprovação da licença",
    example: LeaveStatus.APPROVED,
  })
  @IsEnum(LeaveStatus)
  @IsNotEmpty()
  status!: LeaveStatus;

  @ApiProperty({
    description: "Motivo em caso de rejeição",
    example: "Atestado ilegível ou sem assinatura médica",
    required: false,
  })
  @IsString()
  @IsOptional()
  rejectionReason?: string;
}
