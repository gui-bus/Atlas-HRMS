import { IsString, IsNotEmpty, IsEnum, IsUrl, IsUUID, IsOptional } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export enum DocumentType {
  CONTRACT = "CONTRACT",
  IDENTIFICATION = "IDENTIFICATION",
  EDUCATION = "EDUCATION",
  ADDRESS_PROOF = "ADDRESS_PROOF",
  OTHER = "OTHER",
}

export class CreateDocumentDto {
  @ApiProperty({
    description: "Nome descritivo do documento",
    example: "RG - João da Silva",
  })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({
    description: "Tipo/categoria do documento",
    enum: DocumentType,
    example: DocumentType.IDENTIFICATION,
  })
  @IsEnum(DocumentType, {
    message: `Tipo de documento inválido. Valores aceitos: ${Object.values(DocumentType).join(", ")}`,
  })
  @IsNotEmpty()
  type!: DocumentType;

  @ApiProperty({
    description: "URL do arquivo hospedado no UploadThing (preenchida automaticamente)",
    example: "https://utfs.io/f/abc123-rg-joao.pdf",
    required: false,
  })
  @IsUrl({}, { message: "URL do documento inválida" })
  @IsOptional()
  url?: string;

  @ApiProperty({
    description: "ID do funcionário ao qual o documento pertence",
    example: "d3b07384-d113-4a0b-bc11-ce1338dfd1d2",
  })
  @IsUUID("4", { message: "ID do funcionário deve ser um UUID válido" })
  @IsNotEmpty()
  employeeId!: string;
}
