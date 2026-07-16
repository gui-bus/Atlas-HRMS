import { Controller, Get, Post, Put, Body, Param, UseGuards, Req } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { UserRole, TimeRecordType, RequestStatus } from "@prisma/client";
import { AuthGuard } from "../auth/auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "../auth/roles.decorator";
import { CurrentUser } from "../auth/current-user.decorator";
import { TimeAttendanceService } from "./time-attendance.service";

@ApiTags("TimeAttendance")
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Controller("time-attendance")
export class TimeAttendanceController {
  constructor(private readonly service: TimeAttendanceService) {}

  @Post("clock-in")
  @ApiOperation({ summary: "Registrar batida de ponto (Entrada/Intervalo/Saída)" })
  async clockIn(
    @CurrentUser() user: { sub: string },
    @Body("source") source: "WEB" | "MOBILE" | "ADMIN" = "WEB",
    @Body("comments") comments?: string,
    @Body("latitude") latitude?: number,
    @Body("longitude") longitude?: number,
    @Req() req?: any,
  ) {
    const ip = req?.ip || "127.0.0.1";
    const userAgent = req?.headers?.["user-agent"] || "Unknown";
    return this.service.clockIn(user.sub, source, ip, userAgent, latitude, longitude, comments);
  }

  @Get("records/today")
  @ApiOperation({ summary: "Listar batidas de hoje do funcionário logado" })
  async getTodayRecords(@CurrentUser() user: { sub: string }) {
    return this.service.getTodayRecords(user.sub);
  }

  @Get("records/my-history")
  @ApiOperation({ summary: "Listar histórico geral de pontos do funcionário logado" })
  async getMyHistory(@CurrentUser() user: { sub: string }) {
    return this.service.getMyHistory(user.sub);
  }

  @Get("hour-bank/balance")
  @ApiOperation({ summary: "Saldo acumulado do banco de horas do funcionário logado" })
  async getHourBankBalance(@CurrentUser() user: { sub: string }) {
    return this.service.getHourBankBalance(user.sub);
  }

  @Post("corrections")
  @ApiOperation({ summary: "Solicitar correção de ponto retroativo" })
  async requestCorrection(
    @CurrentUser() user: { sub: string },
    @Body("date") date: string,
    @Body("targetType") targetType: TimeRecordType,
    @Body("time") time: string,
    @Body("reason") reason: string,
  ) {
    return this.service.requestCorrection(user.sub, date, targetType, time, reason);
  }

  @Get("corrections/pending")
  @Roles(UserRole.ADMIN, UserRole.HR, UserRole.MANAGER)
  @ApiOperation({ summary: "Listar solicitações de correção pendentes (Apenas gestores/RH)" })
  async getPendingCorrections() {
    return this.service.getPendingCorrections();
  }

  @Put("corrections/:id/approve")
  @Roles(UserRole.ADMIN, UserRole.HR, UserRole.MANAGER)
  @ApiOperation({ summary: "Aprovar uma solicitação de correção de ponto" })
  async approveCorrection(@Param("id") id: string, @Body("notes") notes?: string) {
    return this.service.handleCorrection(id, RequestStatus.APPROVED, notes);
  }

  @Put("corrections/:id/reject")
  @Roles(UserRole.ADMIN, UserRole.HR, UserRole.MANAGER)
  @ApiOperation({ summary: "Rejeitar uma solicitação de correção de ponto" })
  async rejectCorrection(@Param("id") id: string, @Body("notes") notes?: string) {
    return this.service.handleCorrection(id, RequestStatus.REJECTED, notes);
  }
}
