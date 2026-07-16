import { ApiProperty } from "@nestjs/swagger";
import { UserRole } from "@prisma/client";
import { IsEnum, IsBoolean, IsOptional } from "class-validator";

export class UpdateUserDto {
  @ApiProperty({ enum: UserRole, required: false, description: "Nível de acesso do usuário" })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiProperty({ type: Boolean, required: false, description: "Status ativo/inativo" })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
