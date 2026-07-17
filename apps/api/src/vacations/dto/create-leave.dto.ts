import { IsString, IsNotEmpty, IsDateString, IsEnum, IsOptional, IsUrl } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { LeaveType } from "@prisma/client";

export class CreateLeaveDto {
  @ApiProperty({
    description: "Data de início da licença/afastamento",
    example: "2026-09-10",
  })
  @IsDateString({}, { message: "Data de início inválida" })
  @IsNotEmpty()
  startDate!: string;

  @ApiProperty({
    description: "Data de término da licença/afastamento",
    example: "2026-09-15",
  })
  @IsDateString({}, { message: "Data de término inválida" })
  @IsNotEmpty()
  endDate!: string;

  @ApiProperty({
    enum: LeaveType,
    description: "Tipo do afastamento/licença",
    example: LeaveType.MEDICAL,
  })
  @IsEnum(LeaveType)
  @IsNotEmpty()
  type!: LeaveType;

  @ApiProperty({
    description: "Descrição ou justificativa da solicitação",
    example: "Apresentação de atestado para cirurgia eletiva de apêndice.",
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: "Link/URL do arquivo comprovante carregado no UploadThing",
    example: "https://utfs.io/f/atestado_medico_hash.pdf",
    required: false,
  })
  @IsUrl()
  @IsOptional()
  attachmentUrl?: string;

  @ApiProperty({
    description: "Nome customizado do tipo do afastamento (necessário quando tipo for OTHER)",
    example: "Licença Capacitação",
    required: false,
  })
  @IsString()
  @IsOptional()
  customType?: string;

  @ApiProperty({
    description: "ID do funcionário solicitante da licença",
    example: "c7b6a4a6-7a13-43ef-b209-efdb17eddfb1",
  })
  @IsString()
  @IsNotEmpty()
  employeeId!: string;
}
