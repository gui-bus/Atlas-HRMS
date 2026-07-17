import { IsOptional, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { QueryPaginationDto } from "../../common/dto/pagination.dto";

export class QueryAuditLogDto extends QueryPaginationDto {
  @ApiProperty({
    description: "Pesquisa textual no campo de ação ou nos detalhes do log",
    example: "JOB_CREATED",
    required: false,
  })
  @IsString()
  @IsOptional()
  search?: string;
}
