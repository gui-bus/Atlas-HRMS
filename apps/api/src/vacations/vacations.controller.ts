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
import { CreateVacationDto } from "./dto/create-vacation.dto";
import { UpdateVacationStatusDto } from "./dto/update-vacation-status.dto";
import { VacationResponseDto } from "./dto/vacations-response.dto";
import {
  UnauthorizedErrorResponseDto,
  ForbiddenErrorResponseDto,
  BadRequestErrorResponseDto,
} from "../common/dto/error-responses.dto";

@ApiTags("Vacations")
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

  @Get()
  @Roles(UserRole.ADMIN, UserRole.HR, UserRole.MANAGER)
  @ApiOperation({ summary: "Listar todas as solicitações de férias (Apenas Admin, RH e Gestores)" })
  @ApiResponse({ status: 200, type: [VacationResponseDto] })
  async findAllVacations(@Query() query: QueryPaginationDto) {
    return this.vacationsService.findAllVacations(query);
  }

  @Get("employee/:employeeId")
  @Roles(UserRole.ADMIN, UserRole.HR, UserRole.MANAGER, UserRole.EMPLOYEE)
  @ApiOperation({ summary: "Listar férias de um funcionário específico" })
  @ApiResponse({ status: 200, type: [VacationResponseDto] })
  async findVacationsByEmployee(@Param("employeeId") employeeId: string, @Req() req: any) {
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
  @ApiOperation({ summary: "Cancelar solicitação de férias" })
  @ApiResponse({ status: 200, type: VacationResponseDto })
  async cancelVacation(@Param("id") id: string, @Req() req: any) {
    const isHrOrAdmin = req.user.role === UserRole.ADMIN || req.user.role === UserRole.HR;
    return this.vacationsService.cancelVacation(id, req.user.sub, isHrOrAdmin);
  }

  private async checkEmployeeOwnership(employeeId: string, userId: string): Promise<boolean> {
    const employee = await this.vacationsService["prisma"].employee.findUnique({
      where: { id: employeeId },
      select: { userId: true },
    });
    return employee?.userId === userId;
  }
}
