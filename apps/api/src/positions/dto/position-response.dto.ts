import { ApiProperty } from "@nestjs/swagger";

class DepartmentSummaryDto {
  @ApiProperty({ example: "b109efdb-17ed-dfb1-c7b6-a4a67a1343ef" })
  id!: string;

  @ApiProperty({ example: "Recursos Humanos" })
  name!: string;

  @ApiProperty({ example: "RH" })
  code!: string;
}

class CountSummaryDto {
  @ApiProperty({ example: 5 })
  employees!: number;
}

export class PositionResponseDto {
  @ApiProperty({ example: "a4a67a13-7a13-43ef-b209-efdb17eddfb1" })
  id!: string;

  @ApiProperty({ example: "Desenvolvedor Backend Pleno" })
  title!: string;

  @ApiProperty({
    example: "Desenvolvimento de APIs em NestJS e sustentação de banco de dados PostgreSQL.",
    nullable: true,
  })
  description!: string | null;

  @ApiProperty({ example: 6000.0 })
  salaryRangeMin!: number;

  @ApiProperty({ example: 9000.0 })
  salaryRangeMax!: number;

  @ApiProperty({ example: true })
  active!: boolean;

  @ApiProperty({ example: "2026-07-13T18:00:00.000Z" })
  createdAt!: Date;

  @ApiProperty({ example: "2026-07-13T18:30:00.000Z" })
  updatedAt!: Date;

  @ApiProperty({ type: DepartmentSummaryDto })
  department!: DepartmentSummaryDto;

  @ApiProperty({ type: CountSummaryDto })
  _count!: CountSummaryDto;
}

export class PositionDetailsResponseDto extends PositionResponseDto {
  @ApiProperty({ example: [] })
  employees!: any[];
}
