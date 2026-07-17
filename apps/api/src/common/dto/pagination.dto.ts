import { IsOptional, IsInt, Min, Max, IsString, IsIn } from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";

export class QueryPaginationDto {
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
    description: "Campo a ser ordenado",
    example: "createdAt",
    required: false,
  })
  @IsString()
  @IsOptional()
  sortBy?: string;

  @ApiProperty({
    description: "Ordem da ordenação",
    example: "asc",
    enum: ["asc", "desc"],
    required: false,
  })
  @IsString()
  @IsIn(["asc", "desc"])
  @IsOptional()
  sortOrder?: "asc" | "desc";
}
