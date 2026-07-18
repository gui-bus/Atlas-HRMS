import { ApiProperty } from "@nestjs/swagger";
import { RecruitmentStatus, EmploymentType, WorkModel, Seniority } from "@prisma/client";

export class RecruitmentResponseDto {
  @ApiProperty({
    description: "Identificador único da vaga",
    example: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  })
  id!: string;

  @ApiProperty({
    description: "Título da vaga",
    example: "Desenvolvedor Backend Sênior",
  })
  title!: string;

  @ApiProperty({
    description: "Slug único da vaga para URL pública",
    example: "desenvolvedor-backend-senior-a1b2c3",
  })
  slug!: string;

  @ApiProperty({
    description: "Descrição detalhada da vaga",
    example: "Estamos buscando um desenvolvedor backend sênior...",
  })
  description!: string;

  @ApiProperty({
    description: "Status atual da vaga no pipeline",
    enum: RecruitmentStatus,
    example: RecruitmentStatus.OPEN,
  })
  status!: RecruitmentStatus;

  @ApiProperty({
    description: "Tipo de contratação",
    enum: EmploymentType,
    example: EmploymentType.CLT,
  })
  employmentType!: EmploymentType;

  @ApiProperty({
    description: "Modelo de trabalho",
    enum: WorkModel,
    example: WorkModel.HYBRID,
  })
  workModel!: WorkModel;

  @ApiProperty({
    description: "Nível de senioridade",
    enum: Seniority,
    example: Seniority.SENIOR,
  })
  seniority!: Seniority;

  @ApiProperty({ description: "Número de vagas", example: 2 })
  vacancies!: number;

  @ApiProperty({
    description: "Salário mínimo da faixa",
    example: "8000.00",
    required: false,
  })
  salaryMin?: string;

  @ApiProperty({
    description: "Salário máximo da faixa",
    example: "15000.00",
    required: false,
  })
  salaryMax?: string;

  @ApiProperty({
    description: "Exibição pública da faixa salarial",
    example: true,
  })
  isSalaryVisible!: boolean;

  @ApiProperty({ description: "Cidade", example: "Belo Horizonte", required: false })
  city?: string;

  @ApiProperty({ description: "Estado", example: "MG", required: false })
  state?: string;

  @ApiProperty({ description: "País", example: "Brasil", required: false })
  country?: string;

  @ApiProperty({ description: "Requisitos da vaga", required: false })
  requirements?: string;

  @ApiProperty({ description: "Responsabilidades da vaga", required: false })
  responsibilities?: string;

  @ApiProperty({ description: "Benefícios oferecidos", required: false })
  benefits?: string;

  @ApiProperty({ description: "Número de visualizações", example: 150 })
  views!: number;

  @ApiProperty({ description: "Data de publicação", required: false })
  publishedAt?: Date;

  @ApiProperty({ description: "Data de expiração", required: false })
  expiresAt?: Date;

  @ApiProperty({ description: "ID do departamento" })
  departmentId!: string;

  @ApiProperty({ description: "ID do cargo" })
  positionId!: string;

  @ApiProperty({ description: "ID do criador da vaga" })
  createdById!: string;

  @ApiProperty({ description: "Data de criação" })
  createdAt!: Date;

  @ApiProperty({ description: "Data da última atualização" })
  updatedAt!: Date;
}

export class PublicRecruitmentResponseDto {
  @ApiProperty({
    description: "Identificador único da vaga",
    example: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  })
  id!: string;

  @ApiProperty({ description: "Título da vaga", example: "Desenvolvedor Backend Sênior" })
  title!: string;

  @ApiProperty({
    description: "Slug único da vaga",
    example: "desenvolvedor-backend-senior-a1b2c3",
  })
  slug!: string;

  @ApiProperty({ description: "Descrição detalhada da vaga" })
  description!: string;

  @ApiProperty({ enum: EmploymentType, example: EmploymentType.CLT })
  employmentType!: EmploymentType;

  @ApiProperty({ enum: WorkModel, example: WorkModel.HYBRID })
  workModel!: WorkModel;

  @ApiProperty({ enum: Seniority, example: Seniority.SENIOR })
  seniority!: Seniority;

  @ApiProperty({ description: "Número de vagas", example: 2 })
  vacancies!: number;

  @ApiProperty({ description: "Salário mínimo (null se oculto)", required: false })
  salaryMin?: string | null;

  @ApiProperty({ description: "Salário máximo (null se oculto)", required: false })
  salaryMax?: string | null;

  @ApiProperty({ description: "Cidade", required: false })
  city?: string;

  @ApiProperty({ description: "Estado", required: false })
  state?: string;

  @ApiProperty({ description: "País", required: false })
  country?: string;

  @ApiProperty({ description: "Requisitos da vaga", required: false })
  requirements?: string;

  @ApiProperty({ description: "Responsabilidades da vaga", required: false })
  responsibilities?: string;

  @ApiProperty({ description: "Benefícios oferecidos", required: false })
  benefits?: string;

  @ApiProperty({ description: "Data de publicação" })
  publishedAt?: Date;

  @ApiProperty({
    description: "Nome do departamento",
    example: "Tecnologia",
    nullable: true,
    required: false,
  })
  departmentName?: string | null;

  @ApiProperty({
    description: "Nome do cargo",
    example: "Desenvolvedor Backend",
    nullable: true,
    required: false,
  })
  positionTitle?: string | null;

  @ApiProperty({
    description: "Departamento aninhado",
    nullable: true,
    required: false,
    example: { name: "Tecnologia" },
  })
  department?: { name: string } | null;

  @ApiProperty({
    description: "Cargo aninhado",
    nullable: true,
    required: false,
    example: { title: "Desenvolvedor Backend" },
  })
  position?: { title: string } | null;
}

export class PaginatedRecruitmentResponseDto {
  @ApiProperty({
    description: "Lista de vagas",
    type: [PublicRecruitmentResponseDto],
  })
  data!: PublicRecruitmentResponseDto[];

  @ApiProperty({ description: "Total de registros encontrados", example: 42 })
  total!: number;

  @ApiProperty({ description: "Página atual", example: 1 })
  page!: number;

  @ApiProperty({ description: "Itens por página", example: 10 })
  limit!: number;

  @ApiProperty({ description: "Total de páginas", example: 5 })
  totalPages!: number;
}
