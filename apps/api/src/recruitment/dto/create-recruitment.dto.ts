import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsInt,
  IsBoolean,
  IsDateString,
  Min,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { RecruitmentStatus, EmploymentType, WorkModel, Seniority } from "@prisma/client";

export class CreateRecruitmentDto {
  @ApiProperty({
    description: "Título da vaga de emprego",
    example: "Desenvolvedor Backend Sênior",
  })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({
    description: "Descrição detalhada da vaga",
    example:
      "Estamos buscando um desenvolvedor backend sênior com experiência em NestJS e PostgreSQL.",
  })
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiProperty({
    description: "Tipo de contratação",
    enum: EmploymentType,
    example: EmploymentType.CLT,
  })
  @IsEnum(EmploymentType)
  @IsNotEmpty()
  employmentType!: EmploymentType;

  @ApiProperty({
    description: "Modelo de trabalho",
    enum: WorkModel,
    example: WorkModel.HYBRID,
  })
  @IsEnum(WorkModel)
  @IsNotEmpty()
  workModel!: WorkModel;

  @ApiProperty({
    description: "Nível de senioridade da vaga",
    enum: Seniority,
    example: Seniority.SENIOR,
  })
  @IsEnum(Seniority)
  @IsNotEmpty()
  seniority!: Seniority;

  @ApiProperty({
    description: "Número de vagas disponíveis",
    example: 2,
    required: false,
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  vacancies?: number;

  @ApiProperty({
    description: "Salário mínimo da faixa salarial",
    example: "8000.00",
    required: false,
  })
  @IsString()
  @IsOptional()
  salaryMin?: string;

  @ApiProperty({
    description: "Salário máximo da faixa salarial",
    example: "15000.00",
    required: false,
  })
  @IsString()
  @IsOptional()
  salaryMax?: string;

  @ApiProperty({
    description: "Controle de exibição pública da faixa salarial",
    example: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isSalaryVisible?: boolean;

  @ApiProperty({
    description: "Cidade da vaga",
    example: "Belo Horizonte",
    required: false,
  })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiProperty({
    description: "Estado (UF) da vaga",
    example: "MG",
    required: false,
  })
  @IsString()
  @IsOptional()
  state?: string;

  @ApiProperty({
    description: "País da vaga",
    example: "Brasil",
    required: false,
  })
  @IsString()
  @IsOptional()
  country?: string;

  @ApiProperty({
    description: "Requisitos técnicos e comportamentais",
    example: "Experiência com NestJS, TypeScript, PostgreSQL e Docker.",
    required: false,
  })
  @IsString()
  @IsOptional()
  requirements?: string;

  @ApiProperty({
    description: "Responsabilidades do cargo",
    example: "Desenvolver e manter APIs REST, participar de code reviews.",
    required: false,
  })
  @IsString()
  @IsOptional()
  responsibilities?: string;

  @ApiProperty({
    description: "Benefícios oferecidos",
    example: "Vale refeição, plano de saúde, home office flexível.",
    required: false,
  })
  @IsString()
  @IsOptional()
  benefits?: string;

  @ApiProperty({
    description: "Data de expiração da vaga",
    example: "2026-12-31",
    required: false,
  })
  @IsDateString()
  @IsOptional()
  expiresAt?: string;

  @ApiProperty({
    description: "ID do departamento vinculado à vaga",
    example: "a7b6a4a6-7a13-43ef-b209-efdb17eddfb1",
  })
  @IsString()
  @IsNotEmpty()
  departmentId!: string;

  @ApiProperty({
    description: "ID do cargo vinculado à vaga",
    example: "b7b6a4a6-7a13-43ef-b209-efdb17eddfb1",
  })
  @IsString()
  @IsNotEmpty()
  positionId!: string;

  @ApiProperty({
    description: "Status inicial da vaga",
    enum: RecruitmentStatus,
    example: RecruitmentStatus.DRAFT,
    required: false,
  })
  @IsEnum(RecruitmentStatus)
  @IsOptional()
  status?: RecruitmentStatus;
}
