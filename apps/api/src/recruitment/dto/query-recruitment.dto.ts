import { IsOptional, IsString, IsEnum, IsInt, Min } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { EmploymentType, WorkModel, Seniority } from "@prisma/client";

export class QueryRecruitmentDto {
  @ApiProperty({
    description: "Número da página",
    example: 1,
    required: false,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number;

  @ApiProperty({
    description: "Quantidade de itens por página",
    example: 10,
    required: false,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  limit?: number;

  @ApiProperty({
    description: "Busca textual no título ou descrição da vaga",
    example: "NestJS",
    required: false,
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiProperty({
    description: "Filtro por ID do departamento",
    example: "a7b6a4a6-7a13-43ef-b209-efdb17eddfb1",
    required: false,
  })
  @IsString()
  @IsOptional()
  departmentId?: string;

  @ApiProperty({
    description: "Filtro por nível de senioridade",
    enum: Seniority,
    required: false,
  })
  @IsEnum(Seniority)
  @IsOptional()
  seniority?: Seniority;

  @ApiProperty({
    description: "Filtro por modelo de trabalho",
    enum: WorkModel,
    required: false,
  })
  @IsEnum(WorkModel)
  @IsOptional()
  workModel?: WorkModel;

  @ApiProperty({
    description: "Filtro por tipo de contratação",
    enum: EmploymentType,
    required: false,
  })
  @IsEnum(EmploymentType)
  @IsOptional()
  employmentType?: EmploymentType;
}
