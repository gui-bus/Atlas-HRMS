import { IsOptional, IsString, IsInt, Min, Max } from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";

export class QueryAuditLogDto {
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
    example: 20,
    required: false,
    default: 20,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number = 20;

  @ApiProperty({
    description: "Pesquisa textual no campo de ação ou nos detalhes do log",
    example: "JOB_CREATED",
    required: false,
  })
  @IsString()
  @IsOptional()
  search?: string;
}
