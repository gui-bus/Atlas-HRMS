import { ApiProperty } from "@nestjs/swagger";
import { UserRole } from "@prisma/client";

export class UserResponseDto {
  @ApiProperty({ example: "d3b07384-d113-4a0b-bc11-ce1338dfd1d2", description: "ID único do usuário" })
  id!: string;

  @ApiProperty({ example: "usuario@atlas.com", description: "Endereço de e-mail do usuário" })
  email!: string;

  @ApiProperty({ enum: UserRole, example: UserRole.EMPLOYEE, description: "Cargo organizacional ou nível de permissão" })
  role!: UserRole;

  @ApiProperty({ example: true, description: "Indica se o usuário está ativo no sistema" })
  isActive!: boolean;

  @ApiProperty({ example: "2026-07-14T00:00:00.000Z", description: "Data de criação do registro" })
  createdAt!: Date;

  @ApiProperty({ example: "2026-07-14T00:00:00.000Z", description: "Data da última atualização" })
  updatedAt!: Date;
}
