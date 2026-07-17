import { IsOptional, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { QueryPaginationDto } from "../../common/dto/pagination.dto";

export class QueryEmployeeDto extends QueryPaginationDto {
  @ApiProperty({
    description: "Pesquisa por nome, sobrenome ou e-mail",
    example: "João",
    required: false,
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiProperty({
    description: "Filtrar por departamento específico",
    example: "c7b6a4a6-7a13-43ef-b209-efdb17eddfb1",
    required: false,
  })
  @IsString()
  @IsOptional()
  departmentId?: string;

  @ApiProperty({
    description: "Filtrar por status corporativo do funcionário",
    example: "ACTIVE",
    required: false,
  })
  @IsString()
  @IsOptional()
  status?: string;
}
