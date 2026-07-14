import { ApiProperty } from "@nestjs/swagger";

class ManagerSummaryDto {
  @ApiProperty({ example: "c7b6a4a6-7a13-43ef-b209-efdb17eddfb1" })
  id!: string;

  @ApiProperty({ example: "João" })
  firstName!: string;

  @ApiProperty({ example: "Silva" })
  lastName!: string;

  @ApiProperty({ example: "joao.silva@atlas.com" })
  email!: string;
}

class CountSummaryDto {
  @ApiProperty({ example: 12 })
  employees!: number;

  @ApiProperty({ example: 4 })
  positions!: number;
}

export class DepartmentResponseDto {
  @ApiProperty({ example: "b109efdb-17ed-dfb1-c7b6-a4a67a1343ef" })
  id!: string;

  @ApiProperty({ example: "Recursos Humanos" })
  name!: string;

  @ApiProperty({ example: "RH" })
  code!: string;

  @ApiProperty({
    example: "Responsável pelo recrutamento, onboarding e benefícios.",
    nullable: true,
  })
  description!: string | null;

  @ApiProperty({ example: true })
  active!: boolean;

  @ApiProperty({ example: "2026-07-13T18:00:00.000Z" })
  createdAt!: Date;

  @ApiProperty({ example: "2026-07-13T18:30:00.000Z" })
  updatedAt!: Date;

  @ApiProperty({ type: ManagerSummaryDto, nullable: true })
  manager!: ManagerSummaryDto | null;

  @ApiProperty({ type: CountSummaryDto })
  _count!: CountSummaryDto;
}
export class DepartmentDetailsResponseDto extends DepartmentResponseDto {
  @ApiProperty({ example: [] })
  employees!: any[];

  @ApiProperty({ example: [] })
  positions!: any[];
}
