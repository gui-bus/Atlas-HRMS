import { ApiProperty } from "@nestjs/swagger";
import { ApplicationStatus } from "@prisma/client";

export class CandidateResponseDto {
  @ApiProperty({ description: "ID do candidato", example: "f47ac10b-58cc-4372-a567-0e02b2c3d479" })
  id!: string;

  @ApiProperty({ description: "Primeiro nome", example: "Maria" })
  firstName!: string;

  @ApiProperty({ description: "Sobrenome", example: "Oliveira" })
  lastName!: string;

  @ApiProperty({ description: "E-mail", example: "maria@gmail.com" })
  email!: string;

  @ApiProperty({ description: "Telefone", example: "(31) 99999-0000" })
  phone!: string;

  @ApiProperty({ description: "LinkedIn", required: false })
  linkedinUrl?: string;

  @ApiProperty({ description: "GitHub", required: false })
  githubUrl?: string;

  @ApiProperty({ description: "Portfólio", required: false })
  portfolioUrl?: string;
}

export class ApplicationResponseDto {
  @ApiProperty({
    description: "ID da candidatura",
    example: "a1b2c3d4-e5f6-4a0b-bc11-000000000001",
  })
  id!: string;

  @ApiProperty({ description: "URL do currículo", example: "https://utfs.io/f/resume.pdf" })
  resumeUrl!: string;

  @ApiProperty({ description: "Carta de apresentação", required: false })
  coverLetter?: string;

  @ApiProperty({
    description: "Status da candidatura",
    enum: ApplicationStatus,
    example: ApplicationStatus.SUBMITTED,
  })
  status!: ApplicationStatus;

  @ApiProperty({ description: "Feedback do recrutador", required: false })
  feedback?: string;

  @ApiProperty({ description: "Data de contratação", required: false })
  hiredAt?: Date;

  @ApiProperty({ description: "Data de envio" })
  createdAt!: Date;

  @ApiProperty({ description: "Dados do candidato", type: CandidateResponseDto })
  candidate?: CandidateResponseDto;
}

export class PaginatedApplicationResponseDto {
  @ApiProperty({ type: [ApplicationResponseDto] })
  data!: ApplicationResponseDto[];

  @ApiProperty({ example: 25 })
  total!: number;

  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 10 })
  limit!: number;

  @ApiProperty({ example: 3 })
  totalPages!: number;
}
