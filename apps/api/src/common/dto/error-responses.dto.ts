import { ApiProperty } from "@nestjs/swagger";

export class ValidationErrorResponseDto {
  @ApiProperty({
    example: ["name must be a string", "code must be a string"],
    description: "Lista de mensagens de validação com os erros encontrados no payload",
  })
  message!: string[];

  @ApiProperty({
    example: "Bad Request",
    description: "Classificação do erro HTTP",
  })
  error!: string;

  @ApiProperty({ example: 400, description: "Código do status HTTP correspondente" })
  statusCode!: number;
}

export class UnauthorizedErrorResponseDto {
  @ApiProperty({
    example: "Token de acesso ausente",
    description: "Mensagem descritiva da falha de autenticação",
  })
  message!: string;

  @ApiProperty({
    example: "Unauthorized",
    description: "Classificação do erro HTTP",
  })
  error!: string;

  @ApiProperty({ example: 401, description: "Código do status HTTP correspondente" })
  statusCode!: number;
}

export class ForbiddenErrorResponseDto {
  @ApiProperty({
    example: "Acesso negado. Esta rota exige privilégios de [ADMIN, HR]",
    description: "Mensagem de restrição de privilégios ou papéis",
  })
  message!: string;

  @ApiProperty({
    example: "Forbidden",
    description: "Classificação do erro HTTP",
  })
  error!: string;

  @ApiProperty({ example: 403, description: "Código do status HTTP correspondente" })
  statusCode!: number;
}

export class NotFoundErrorResponseDto {
  @ApiProperty({
    example: "Recurso solicitado não encontrado",
    description: "Mensagem descritiva do recurso ausente no banco de dados",
  })
  message!: string;

  @ApiProperty({
    example: "Not Found",
    description: "Classificação do erro HTTP",
  })
  error!: string;

  @ApiProperty({ example: 404, description: "Código do status HTTP correspondente" })
  statusCode!: number;
}

export class ConflictErrorResponseDto {
  @ApiProperty({
    example: "Este recurso já existe com este identificador único",
    description: "Mensagem indicando violação de chave ou conflito de estados",
  })
  message!: string;

  @ApiProperty({
    example: "Conflict",
    description: "Classificação do erro HTTP",
  })
  error!: string;

  @ApiProperty({ example: 409, description: "Código do status HTTP correspondente" })
  statusCode!: number;
}
export class BadRequestErrorResponseDto {
  @ApiProperty({
    example: "Não é possível excluir um departamento que possui funcionários ativos",
    description: "Mensagem descritiva do erro de negócio",
  })
  message!: string;

  @ApiProperty({
    example: "Bad Request",
    description: "Classificação do erro HTTP",
  })
  error!: string;

  @ApiProperty({ example: 400, description: "Código do status HTTP correspondente" })
  statusCode!: number;
}
