import { ApiProperty } from "@nestjs/swagger";
import { VacationStatus, LeaveStatus, LeaveType } from "@prisma/client";

export class VacationResponseDto {
  @ApiProperty({ example: "52219d3e-9bf8-466d-9653-efad87d55986" })
  id!: string;

  @ApiProperty({ example: "2026-08-01T00:00:00.000Z" })
  startDate!: Date;

  @ApiProperty({ example: "2026-08-15T00:00:00.000Z" })
  endDate!: Date;

  @ApiProperty({ enum: VacationStatus, example: VacationStatus.PENDING })
  status!: VacationStatus;

  @ApiProperty({ example: "Período conflitante", required: false })
  rejectionReason?: string;

  @ApiProperty({ example: "c7b6a4a6-7a13-43ef-b209-efdb17eddfb1" })
  employeeId!: string;

  @ApiProperty({ example: "d7b6a4a6-7a13-43ef-b209-efdb17eddfb1", required: false })
  approvedById?: string;

  @ApiProperty({ example: "2026-07-14T00:00:00.000Z" })
  createdAt!: Date;

  @ApiProperty({ example: "2026-07-14T00:00:00.000Z" })
  updatedAt!: Date;
}

export class LeaveResponseDto {
  @ApiProperty({ example: "63219d3e-9bf8-466d-9653-efad87d55987" })
  id!: string;

  @ApiProperty({ example: "2026-09-10T00:00:00.000Z" })
  startDate!: Date;

  @ApiProperty({ example: "2026-09-15T00:00:00.000Z" })
  endDate!: Date;

  @ApiProperty({ enum: LeaveType, example: LeaveType.MEDICAL })
  type!: LeaveType;

  @ApiProperty({ example: "Cirurgia de apêndice", required: false })
  description?: string;

  @ApiProperty({ enum: LeaveStatus, example: LeaveStatus.PENDING })
  status!: LeaveStatus;

  @ApiProperty({ example: "Documento ilegível", required: false })
  rejectionReason?: string;

  @ApiProperty({ example: "https://utfs.io/f/atestado.pdf", required: false })
  attachmentUrl?: string;

  @ApiProperty({ example: "Curso de capacitação", required: false })
  customType?: string;

  @ApiProperty({ example: "c7b6a4a6-7a13-43ef-b209-efdb17eddfb1" })
  employeeId!: string;

  @ApiProperty({ example: "d7b6a4a6-7a13-43ef-b209-efdb17eddfb1", required: false })
  approvedById?: string;

  @ApiProperty({ example: "2026-07-14T00:00:00.000Z" })
  createdAt!: Date;

  @ApiProperty({ example: "2026-07-14T00:00:00.000Z" })
  updatedAt!: Date;
}
