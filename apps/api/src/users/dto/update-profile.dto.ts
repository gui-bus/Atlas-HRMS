import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsOptional } from "class-validator";

export class UpdateProfileDto {
  @ApiProperty({ example: "João", required: false })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiProperty({ example: "Silva", required: false })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiProperty({ example: "(11) 99999-9999", required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ example: "https://utfs.io/f/...jpg", required: false })
  @IsString()
  @IsOptional()
  avatarUrl?: string;

  
  @ApiProperty({ example: "12.345.678-9", required: false })
  @IsString()
  @IsOptional()
  rg?: string;

  @ApiProperty({ example: "1990-01-01", required: false })
  @IsString()
  @IsOptional()
  birthDate?: string;

  @ApiProperty({ example: "MALE", required: false })
  @IsString()
  @IsOptional()
  gender?: string;

  @ApiProperty({ example: "MARRIED", required: false })
  @IsString()
  @IsOptional()
  maritalStatus?: string;

  
  @ApiProperty({ example: "01001-000", required: false })
  @IsString()
  @IsOptional()
  cep?: string;

  @ApiProperty({ example: "Praça da Sé", required: false })
  @IsString()
  @IsOptional()
  street?: string;

  @ApiProperty({ example: "123", required: false })
  @IsString()
  @IsOptional()
  number?: string;

  @ApiProperty({ example: "Apto 45", required: false })
  @IsString()
  @IsOptional()
  complement?: string;

  @ApiProperty({ example: "Sé", required: false })
  @IsString()
  @IsOptional()
  neighborhood?: string;

  @ApiProperty({ example: "São Paulo", required: false })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiProperty({ example: "SP", required: false })
  @IsString()
  @IsOptional()
  state?: string;

  
  @ApiProperty({ example: "341", required: false })
  @IsString()
  @IsOptional()
  bankCode?: string;

  @ApiProperty({ example: "1234", required: false })
  @IsString()
  @IsOptional()
  bankAgency?: string;

  @ApiProperty({ example: "12345-6", required: false })
  @IsString()
  @IsOptional()
  bankAccount?: string;

  @ApiProperty({ example: "SAVINGS", required: false })
  @IsString()
  @IsOptional()
  accountType?: string;
}
