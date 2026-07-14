import { IsString, IsNotEmpty, IsDateString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateVacationDto {
  @ApiProperty({
    description: "Data de início das férias",
    example: "2026-08-01",
  })
  @IsDateString({}, { message: "Data de início inválida" })
  @IsNotEmpty()
  startDate!: string;

  @ApiProperty({
    description: "Data de término das férias",
    example: "2026-08-15",
  })
  @IsDateString({}, { message: "Data de término inválida" })
  @IsNotEmpty()
  endDate!: string;

  @ApiProperty({
    description: "ID do funcionário solicitante das férias",
    example: "c7b6a4a6-7a13-43ef-b209-efdb17eddfb1",
  })
  @IsString()
  @IsNotEmpty()
  employeeId!: string;
}
