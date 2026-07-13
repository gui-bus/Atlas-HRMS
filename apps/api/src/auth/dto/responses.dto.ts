import { ApiProperty } from "@nestjs/swagger";
import { UserRole } from "@prisma/client";

export class UserResponseDto {
  @ApiProperty({ example: "user-uuid-1234", description: "ID único do usuário" })
  id!: string;

  @ApiProperty({ example: "usuario@atlas.com", description: "Endereço de e-mail" })
  email!: string;

  @ApiProperty({ enum: UserRole, example: UserRole.EMPLOYEE, description: "Cargo atribuído" })
  role!: UserRole;

  @ApiProperty({ example: true, description: "Indica se o usuário está ativo no sistema" })
  isActive!: boolean;

  @ApiProperty({ example: "2026-07-13T17:00:00.000Z", description: "Data de criação da conta" })
  createdAt!: Date;
}

export class UserLoginData {
  @ApiProperty({ example: "user-uuid-1234", description: "ID único do usuário" })
  id!: string;

  @ApiProperty({ example: "usuario@atlas.com", description: "Endereço de e-mail" })
  email!: string;

  @ApiProperty({ enum: UserRole, example: UserRole.EMPLOYEE, description: "Cargo atribuído" })
  role!: UserRole;
}

export class LoginResponseDto {
  @ApiProperty({ type: UserLoginData, description: "Dados simplificados do usuário autenticado" })
  user!: UserLoginData;

  @ApiProperty({
    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    description: "Access Token JWT usado para autenticar chamadas protegidas",
  })
  accessToken!: string;
}

export class RefreshResponseDto {
  @ApiProperty({
    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    description: "Novo Access Token JWT gerado a partir do token de atualização",
  })
  accessToken!: string;
}

export class LogoutResponseDto {
  @ApiProperty({
    example: true,
    description: "Indica se o encerramento da sessão foi concluído com sucesso",
  })
  success!: boolean;
}

export class ErrorResponseDto {
  @ApiProperty({
    example: "E-mail inválido",
    description: "Mensagem descritiva do erro (pode ser uma string ou array de erros de validação)",
  })
  message!: string | string[];

  @ApiProperty({
    example: "Bad Request",
    description: "Classificação do erro de acordo com o status HTTP",
  })
  error!: string;

  @ApiProperty({ example: 400, description: "Código numérico do status HTTP" })
  statusCode!: number;
}
