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
  Query,
} from "@nestjs/common";
import { QueryPaginationDto } from "../common/dto/pagination.dto";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger";
import { UserRole } from "@prisma/client";
import { AuthGuard } from "../auth/auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "../auth/roles.decorator";
import { VacationsService } from "./vacations.service";
import { CreateLeaveDto } from "./dto/create-leave.dto";
import { UpdateLeaveStatusDto } from "./dto/update-leave-status.dto";
import { LeaveResponseDto } from "./dto/vacations-response.dto";
import {
  UnauthorizedErrorResponseDto,
  ForbiddenErrorResponseDto,
  BadRequestErrorResponseDto,
} from "../common/dto/error-responses.dto";

@ApiTags("Leaves")
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Controller("vacations/leaves")
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
export class LeavesController {
  constructor(private readonly vacationsService: VacationsService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.HR, UserRole.MANAGER)
  @ApiOperation({ summary: "Listar todas as licenças e atestados pendentes/ativos" })
  @ApiResponse({ status: 200, type: [LeaveResponseDto] })
  async findAllLeaves(@Query() query: QueryPaginationDto) {
    return this.vacationsService.findAllLeaves(query);
  }

  @Get("employee/:employeeId")
  @Roles(UserRole.ADMIN, UserRole.HR, UserRole.MANAGER, UserRole.EMPLOYEE)
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

  @Post()
  @Roles(UserRole.ADMIN, UserRole.HR, UserRole.EMPLOYEE)
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

  @Put(":id/status")
  @Roles(UserRole.ADMIN, UserRole.HR, UserRole.MANAGER)
  @ApiOperation({ summary: "Aprovar ou rejeitar licença/atestado" })
  @ApiResponse({ status: 200, type: LeaveResponseDto })
  async updateLeaveStatus(
    @Param("id") id: string,
    @Body() dto: UpdateLeaveStatusDto,
    @Req() req: any,
  ) {
    return this.vacationsService.updateLeaveStatus(id, dto, req.user.sub);
  }

  @Delete(":id")
  @Roles(UserRole.ADMIN, UserRole.HR, UserRole.EMPLOYEE)
  @ApiOperation({ summary: "Cancelar solicitação de licença" })
  @ApiResponse({ status: 200, type: LeaveResponseDto })
  async cancelLeave(@Param("id") id: string, @Req() req: any) {
    const isHrOrAdmin = req.user.role === UserRole.ADMIN || req.user.role === UserRole.HR;
    return this.vacationsService.cancelLeave(id, req.user.sub, isHrOrAdmin);
  }

  private async checkEmployeeOwnership(employeeId: string, userId: string): Promise<boolean> {
    const employee = await this.vacationsService["prisma"].employee.findUnique({
      where: { id: employeeId },
      select: { userId: true },
    });
    return employee?.userId === userId;
  }
}
