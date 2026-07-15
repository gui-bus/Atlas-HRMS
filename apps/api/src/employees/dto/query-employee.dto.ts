import { IsOptional, IsString, IsInt, Min, Max } from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";

export class QueryEmployeeDto {
  @ApiProperty({
    description: "Página atual do resultado",
    example: 1,
    required: false,
    default: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiProperty({
    description: "Tamanho da página do resultado",
    example: 10,
    required: false,
    default: 10,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number = 10;

  @ApiProperty({
    description: "Pesquisa por nome, sobrenome ou e-mail",
    example: "João",
    required: false,
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiProperty({
    description: "Filtrar por departamento específico",
    example: "c7b6a4a6-7a13-43ef-b209-efdb17eddfb1",
    required: false,
  })
  @IsString()
  @IsOptional()
  departmentId?: string;

  @ApiProperty({
    description: "Filtrar por status corporativo do funcionário",
    example: "ACTIVE",
    required: false,
  })
  @IsString()
  @IsOptional()
  status?: string;
}
