import { IsString, IsNotEmpty, IsOptional, IsEmail } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class ApplyToRecruitmentDto {
  @ApiProperty({
    description: "Primeiro nome do candidato",
    example: "Maria",
  })
  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @ApiProperty({
    description: "Sobrenome do candidato",
    example: "Oliveira",
  })
  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @ApiProperty({
    description: "E-mail do candidato",
    example: "maria.oliveira@gmail.com",
  })
  @IsEmail({}, { message: "E-mail do candidato inválido" })
  @IsNotEmpty()
  email!: string;

  @ApiProperty({
    description: "Telefone de contato",
    example: "(31) 99999-0000",
  })
  @IsString()
  @IsNotEmpty()
  phone!: string;

  @ApiProperty({
    description: "URL do perfil LinkedIn",
    example: "https://linkedin.com/in/maria-oliveira",
    required: false,
  })
  @IsString()
  @IsOptional()
  linkedinUrl?: string;

  @ApiProperty({
    description: "URL do perfil GitHub",
    example: "https://github.com/maria-oliveira",
    required: false,
  })
  @IsString()
  @IsOptional()
  githubUrl?: string;

  @ApiProperty({
    description: "URL do portfólio pessoal",
    example: "https://maria.dev",
    required: false,
  })
  @IsString()
  @IsOptional()
  portfolioUrl?: string;

  @ApiProperty({
    description: "Salário atual do candidato",
    example: "7000.00",
    required: false,
  })
  @IsString()
  @IsOptional()
  currentSalary?: string;

  @ApiProperty({
    description: "Pretensão salarial do candidato",
    example: "10000.00",
    required: false,
  })
  @IsString()
  @IsOptional()
  expectedSalary?: string;

  @ApiProperty({
    description: "Carta de apresentação do candidato",
    example: "Olá, tenho 5 anos de experiência com NestJS...",
    required: false,
  })
  @IsString()
  @IsOptional()
  coverLetter?: string;
}
