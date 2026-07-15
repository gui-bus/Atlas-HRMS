import { Controller, Get, UseGuards, Query } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger";
import { UserRole } from "@prisma/client";
import { AuthGuard } from "../auth/auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "../auth/roles.decorator";
import { DashboardService } from "./dashboard.service";
import { DashboardStatsResponseDto } from "./dto/dashboard-stats-response.dto";
import { QueryDashboardDto } from "./dto/query-dashboard.dto";

@ApiTags("Dashboard")
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Controller("dashboard")
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.HR, UserRole.MANAGER)
  @ApiOperation({
    summary:
      "Obter métricas consolidadas do painel administrativo com filtros (Admin, RH e Gestores)",
  })
  @ApiResponse({
    status: 200,
    description: "Métricas agregadas retornadas com sucesso",
    type: DashboardStatsResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: "Não autenticado — token JWT ausente ou inválido",
  })
  @ApiResponse({
    status: 403,
    description: "Permissão insuficiente — funcionários comuns (EMPLOYEE) são bloqueados",
  })
  async getStats(@Query() query: QueryDashboardDto) {
    return this.dashboardService.getStats(query);
  }
}
