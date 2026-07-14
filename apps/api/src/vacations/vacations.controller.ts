import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
  ForbiddenException,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger";
import { UserRole } from "@prisma/client";
import { AuthGuard } from "../auth/auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "../auth/roles.decorator";
import { VacationsService } from "./vacations.service";
import { CreateVacationDto } from "./dto/create-vacation.dto";
import { UpdateVacationStatusDto } from "./dto/update-vacation-status.dto";
import { CreateLeaveDto } from "./dto/create-leave.dto";
import { UpdateLeaveStatusDto } from "./dto/update-leave-status.dto";
import { VacationResponseDto, LeaveResponseDto } from "./dto/vacations-response.dto";
import {
  UnauthorizedErrorResponseDto,
  ForbiddenErrorResponseDto,
  BadRequestErrorResponseDto,
} from "../common/dto/error-responses.dto";

@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Controller("vacations")
@ApiResponse({
  status: 401,
  description: "Não autenticado",
  type: UnauthorizedErrorResponseDto,
})
@ApiResponse({
  status: 403,
  description: "Acesso negado",
  type: ForbiddenErrorResponseDto,
})
export class VacationsController {
  constructor(private readonly vacationsService: VacationsService) {}

  // ==========================================
  // VACATIONS ENDPOINTS
  // ==========================================

  @Get()
  @Roles(UserRole.ADMIN, UserRole.HR, UserRole.MANAGER)
  @ApiTags("Vacations")
  @ApiOperation({ summary: "Listar todas as solicitações de férias (Apenas Admin, RH e Gestores)" })
  @ApiResponse({ status: 200, type: [VacationResponseDto] })
  async findAllVacations() {
    return this.vacationsService.findAllVacations();
  }

  @Get("employee/:employeeId")
  @Roles(UserRole.ADMIN, UserRole.HR, UserRole.MANAGER, UserRole.EMPLOYEE)
  @ApiTags("Vacations")
  @ApiOperation({ summary: "Listar férias de um funcionário específico" })
  @ApiResponse({ status: 200, type: [VacationResponseDto] })
  async findVacationsByEmployee(@Param("employeeId") employeeId: string, @Req() req: any) {
    // Employees can only read their own vacations
    const user = req.user;
    if (user.role === UserRole.EMPLOYEE) {
      const isOwner = await this.checkEmployeeOwnership(employeeId, user.sub);
      if (!isOwner) {
        throw new ForbiddenException("Você não tem acesso às férias deste funcionário");
      }
    }
    return this.vacationsService.findVacationsByEmployee(employeeId);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.HR, UserRole.EMPLOYEE)
  @ApiTags("Vacations")
  @ApiOperation({ summary: "Solicitar férias (Funcionários, Admin, RH)" })
  @ApiResponse({ status: 201, type: VacationResponseDto })
  @ApiResponse({ status: 400, type: BadRequestErrorResponseDto })
  async createVacation(@Body() dto: CreateVacationDto, @Req() req: any) {
    const user = req.user;
    if (user.role === UserRole.EMPLOYEE) {
      const isOwner = await this.checkEmployeeOwnership(dto.employeeId, user.sub);
      if (!isOwner) {
        throw new ForbiddenException("Não é permitido solicitar férias para outro funcionário");
      }
    }
    return this.vacationsService.createVacation(dto);
  }

  @Put(":id/status")
  @Roles(UserRole.ADMIN, UserRole.HR, UserRole.MANAGER)
  @ApiTags("Vacations")
  @ApiOperation({ summary: "Aprovar ou Rejeitar solicitação de férias (Admin, RH, Gestores)" })
  @ApiResponse({ status: 200, type: VacationResponseDto })
  @ApiResponse({ status: 400, type: BadRequestErrorResponseDto })
  async updateVacationStatus(
    @Param("id") id: string,
    @Body() dto: UpdateVacationStatusDto,
    @Req() req: any,
  ) {
    return this.vacationsService.updateVacationStatus(id, dto, req.user.sub);
  }

  @Delete(":id")
  @Roles(UserRole.ADMIN, UserRole.HR, UserRole.EMPLOYEE)
  @ApiTags("Vacations")
  @ApiOperation({ summary: "Cancelar solicitação de férias" })
  @ApiResponse({ status: 200, type: VacationResponseDto })
  async cancelVacation(@Param("id") id: string, @Req() req: any) {
    const isHrOrAdmin = req.user.role === UserRole.ADMIN || req.user.role === UserRole.HR;
    return this.vacationsService.cancelVacation(id, req.user.sub, isHrOrAdmin);
  }

  // ==========================================
  // LEAVES ENDPOINTS (ATTESTED / FASTANDO)
  // ==========================================

  @Get("leaves")
  @Roles(UserRole.ADMIN, UserRole.HR, UserRole.MANAGER)
  @ApiTags("Leaves")
  @ApiOperation({ summary: "Listar todas as licenças e atestados pendentes/ativos" })
  @ApiResponse({ status: 200, type: [LeaveResponseDto] })
  async findAllLeaves() {
    return this.vacationsService.findAllLeaves();
  }

  @Get("leaves/employee/:employeeId")
  @Roles(UserRole.ADMIN, UserRole.HR, UserRole.MANAGER, UserRole.EMPLOYEE)
  @ApiTags("Leaves")
  @ApiOperation({ summary: "Listar atestados e licenças de um funcionário" })
  @ApiResponse({ status: 200, type: [LeaveResponseDto] })
  async findLeavesByEmployee(@Param("employeeId") employeeId: string, @Req() req: any) {
    const user = req.user;
    if (user.role === UserRole.EMPLOYEE) {
      const isOwner = await this.checkEmployeeOwnership(employeeId, user.sub);
      if (!isOwner) {
        throw new ForbiddenException("Você não tem acesso aos atestados deste funcionário");
      }
    }
    return this.vacationsService.findLeavesByEmployee(employeeId);
  }

  @Post("leaves")
  @Roles(UserRole.ADMIN, UserRole.HR, UserRole.EMPLOYEE)
  @ApiTags("Leaves")
  @ApiOperation({ summary: "Enviar atestado/solicitar licença (Funcionários, Admin, RH)" })
  @ApiResponse({ status: 201, type: LeaveResponseDto })
  @ApiResponse({ status: 400, type: BadRequestErrorResponseDto })
  async createLeave(@Body() dto: CreateLeaveDto, @Req() req: any) {
    const user = req.user;
    if (user.role === UserRole.EMPLOYEE) {
      const isOwner = await this.checkEmployeeOwnership(dto.employeeId, user.sub);
      if (!isOwner) {
        throw new ForbiddenException("Não é permitido enviar atestados para outro funcionário");
      }
    }
    return this.vacationsService.createLeave(dto);
  }

  @Put("leaves/:id/status")
  @Roles(UserRole.ADMIN, UserRole.HR, UserRole.MANAGER)
  @ApiTags("Leaves")
  @ApiOperation({ summary: "Aprovar ou rejeitar licença/atestado" })
  @ApiResponse({ status: 200, type: LeaveResponseDto })
  async updateLeaveStatus(
    @Param("id") id: string,
    @Body() dto: UpdateLeaveStatusDto,
    @Req() req: any,
  ) {
    return this.vacationsService.updateLeaveStatus(id, dto, req.user.sub);
  }

  @Delete("leaves/:id")
  @Roles(UserRole.ADMIN, UserRole.HR, UserRole.EMPLOYEE)
  @ApiTags("Leaves")
  @ApiOperation({ summary: "Cancelar solicitação de licença" })
  @ApiResponse({ status: 200, type: LeaveResponseDto })
  async cancelLeave(@Param("id") id: string, @Req() req: any) {
    const isHrOrAdmin = req.user.role === UserRole.ADMIN || req.user.role === UserRole.HR;
    return this.vacationsService.cancelLeave(id, req.user.sub, isHrOrAdmin);
  }

  // ==========================================
  // HELPER OWNERSHIP METHOD
  // ==========================================
  private async checkEmployeeOwnership(employeeId: string, userId: string): Promise<boolean> {
    // Avoid circular import issues by querying directly via service database accessor
    const employee = await this.vacationsService["prisma"].employee.findUnique({
      where: { id: employeeId },
      select: { userId: true },
    });
    return employee?.userId === userId;
  }
}
