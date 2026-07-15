import { Controller, Get, UseGuards, Query } from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { UserRole } from "@prisma/client";
import { AuthGuard } from "../auth/auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "../auth/roles.decorator";
import { AuditService } from "./audit.service";
import { AuditLogResponseDto } from "./dto/audit-log-response.dto";
import { QueryAuditLogDto } from "./dto/query-audit-log.dto";

@ApiTags("Audit")
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Controller("audit")
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.HR)
  @ApiOperation({
    summary: "Listar todos os logs de auditoria com paginação e filtros (Apenas Admin e RH)",
  })
  @ApiResponse({
    status: 200,
    description: "Lista paginada de logs de auditoria ordenados do mais recente ao mais antigo",
  })
  @ApiResponse({
    status: 401,
    description: "Não autenticado — token JWT ausente ou inválido",
  })
  @ApiResponse({
    status: 403,
    description: "Permissão insuficiente — apenas ADMIN e HR podem acessar",
  })
  async findAll(@Query() query: QueryAuditLogDto) {
    return this.auditService.findAll(query);
  }
}
