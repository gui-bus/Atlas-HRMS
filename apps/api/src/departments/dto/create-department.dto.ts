import { IsString, IsNotEmpty, IsOptional, IsBoolean } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateDepartmentDto {
  @ApiProperty({
    description: "Nome exclusivo do departamento",
    example: "Recursos Humanos",
  })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({
    description: "Código identificador do departamento",
    example: "RH",
  })
  @IsString()
  @IsNotEmpty()
  code!: string;

  @ApiProperty({
    description: "Descrição detalhada do departamento",
    example: "Responsável pelo recrutamento, onboarding e benefícios.",
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: "Determina se o departamento está ativo",
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  active?: boolean;

  @ApiProperty({
    description: "ID do funcionário gerente do departamento",
    example: "c7b6a4a6-7a13-43ef-b209-efdb17eddfb1",
    required: false,
  })
  @IsString()
  @IsOptional()
  managerId?: string;
}
