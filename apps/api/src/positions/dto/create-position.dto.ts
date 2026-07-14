import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsNumber, Min } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreatePositionDto {
  @ApiProperty({
    description: "Título descritivo do cargo",
    example: "Desenvolvedor Backend Pleno",
  })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({
    description: "Descrição das atribuições do cargo",
    example: "Desenvolvimento de APIs em NestJS e sustentação de banco de dados PostgreSQL.",
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: "Valor mínimo da faixa salarial do cargo",
    example: 6000.0,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  salaryRangeMin!: number;

  @ApiProperty({
    description: "Valor máximo da faixa salarial do cargo",
    example: 9000.0,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  salaryRangeMax!: number;

  @ApiProperty({
    description: "Determina se o cargo está ativo",
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  active?: boolean;

  @ApiProperty({
    description: "ID do departamento ao qual o cargo pertence",
    example: "b109efdb-17ed-dfb1-c7b6-a4a67a1343ef",
  })
  @IsString()
  @IsNotEmpty()
  departmentId!: string;
}
