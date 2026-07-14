import { ApiProperty } from "@nestjs/swagger";
import { DocumentType } from "./create-document.dto";

export class DocumentResponseDto {
  @ApiProperty({
    description: "Identificador único do documento",
    example: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  })
  id!: string;

  @ApiProperty({
    description: "Nome descritivo do documento",
    example: "RG - João da Silva",
  })
  name!: string;

  @ApiProperty({
    description: "Tipo/categoria do documento",
    enum: DocumentType,
    example: DocumentType.IDENTIFICATION,
  })
  type!: string;

  @ApiProperty({
    description: "URL do arquivo hospedado no UploadThing",
    example: "https://utfs.io/f/abc123-rg-joao.pdf",
  })
  url!: string;

  @ApiProperty({
    description: "ID do funcionário proprietário do documento",
    example: "d3b07384-d113-4a0b-bc11-ce1338dfd1d2",
  })
  employeeId!: string;

  @ApiProperty({
    description: "Data e hora de criação do registro",
    example: "2026-07-14T12:00:00.000Z",
  })
  createdAt!: Date;

  @ApiProperty({
    description: "Data e hora da última atualização",
    example: "2026-07-14T12:00:00.000Z",
  })
  updatedAt!: Date;
}
