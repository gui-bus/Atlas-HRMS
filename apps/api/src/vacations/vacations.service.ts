import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from "@nestjs/common";
import { PrismaService } from "../common/prisma.service";
import { CreateVacationDto } from "./dto/create-vacation.dto";
import { UpdateVacationStatusDto } from "./dto/update-vacation-status.dto";
import { CreateLeaveDto } from "./dto/create-leave.dto";
import { UpdateLeaveStatusDto } from "./dto/update-leave-status.dto";
import { VacationStatus, LeaveStatus } from "@prisma/client";
import { NotificationsService } from "../notifications/notifications.service";
import { UploadthingService } from "../common/uploadthing/uploadthing.service";

@Injectable()
export class VacationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
    private readonly uploadthingService: UploadthingService,
  ) {}

  // ==========================================
  // VACATIONS LOR / BUSINESS LOGIC
  // ==========================================

  async findAllVacations() {
    return this.prisma.vacation.findMany({
      where: { deletedAt: null },
      include: { employee: true },
    });
  }

  async findVacationsByEmployee(employeeId: string) {
    return this.prisma.vacation.findMany({
      where: { employeeId, deletedAt: null },
    });
  }

  async createVacation(dto: CreateVacationDto) {
    const employee = await this.prisma.employee.findUnique({
      where: { id: dto.employeeId },
    });
    if (!employee) {
      throw new NotFoundException("Funcionário não encontrado");
    }

    const start = new Date(dto.startDate);
    const end = new Date(dto.endDate);

    if (start >= end) {
      throw new BadRequestException("A data de início deve ser anterior à data de término");
    }

    // Verify 12 months working history (CLT period rule)
    const diffTime = Math.abs(new Date().getTime() - new Date(employee.hireDate).getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 365) {
      throw new BadRequestException(
        "O funcionário ainda não completou o período aquisitivo de 12 meses",
      );
    }

    // Check overlap vacations
    const overlapping = await this.prisma.vacation.findFirst({
      where: {
        employeeId: dto.employeeId,
        deletedAt: null,
        status: { in: [VacationStatus.PENDING, VacationStatus.APPROVED] },
        OR: [{ startDate: { lte: end }, endDate: { gte: start } }],
      },
    });

    if (overlapping) {
      throw new BadRequestException(
        "Já existe uma solicitação de férias aprovada ou pendente para este período",
      );
    }

    return this.prisma.vacation.create({
      data: {
        startDate: start,
        endDate: end,
        employeeId: dto.employeeId,
      },
    });
  }

  async updateVacationStatus(id: string, dto: UpdateVacationStatusDto, approvedById: string) {
    const vacation = await this.prisma.vacation.findUnique({
      where: { id },
    });
    if (!vacation || vacation.deletedAt) {
      throw new NotFoundException("Solicitação de férias não encontrada");
    }

    if (vacation.status !== VacationStatus.PENDING) {
      throw new BadRequestException("Apenas solicitações pendentes podem ter seu status alterado");
    }

    if (dto.status === VacationStatus.REJECTED && !dto.rejectionReason) {
      throw new BadRequestException("É necessário informar o motivo da rejeição");
    }

    const updated = await this.prisma.vacation.update({
      where: { id },
      data: {
        status: dto.status,
        rejectionReason: dto.status === VacationStatus.REJECTED ? dto.rejectionReason : null,
        approvedById,
      },
      include: { employee: true },
    });

    const statusText = dto.status === VacationStatus.APPROVED ? "aprovada" : "rejeitada";
    const reasonText =
      dto.status === VacationStatus.REJECTED ? ` Motivo: ${dto.rejectionReason}` : "";
    if (updated.employee.userId) {
      await this.notificationsService.create(
        updated.employee.userId,
        `Sua solicitação de férias para o período de ${updated.startDate.toLocaleDateString()} a ${updated.endDate.toLocaleDateString()} foi ${statusText}.${reasonText}`,
      );
    }

    return updated;
  }

  async cancelVacation(id: string, requesterUserId: string, isHrOrAdmin: boolean) {
    const vacation = await this.prisma.vacation.findUnique({
      where: { id },
      include: { employee: true },
    });

    if (!vacation || vacation.deletedAt) {
      throw new NotFoundException("Férias não encontradas");
    }

    // Verify ownership
    if (!isHrOrAdmin && vacation.employee.userId !== requesterUserId) {
      throw new ForbiddenException("Você não tem permissão para cancelar estas férias");
    }

    return this.prisma.vacation.update({
      where: { id },
      data: {
        status: VacationStatus.CANCELLED,
        deletedAt: new Date(),
      },
    });
  }

  // ==========================================
  // LEAVES LOR / BUSINESS LOGIC (ATTESTED / REASONS)
  // ==========================================

  async findAllLeaves() {
    return this.prisma.leave.findMany({
      where: { deletedAt: null },
      include: { employee: true },
    });
  }

  async findLeavesByEmployee(employeeId: string) {
    return this.prisma.leave.findMany({
      where: { employeeId, deletedAt: null },
    });
  }

  async createLeave(dto: CreateLeaveDto) {
    const employee = await this.prisma.employee.findUnique({
      where: { id: dto.employeeId },
    });
    if (!employee) {
      throw new NotFoundException("Funcionário não encontrado");
    }

    const start = new Date(dto.startDate);
    const end = new Date(dto.endDate);

    if (start >= end) {
      throw new BadRequestException("A data de início deve ser anterior à data de término");
    }

    // Check overlap leaves
    const overlapping = await this.prisma.leave.findFirst({
      where: {
        employeeId: dto.employeeId,
        deletedAt: null,
        status: { in: [LeaveStatus.PENDING, LeaveStatus.APPROVED] },
        OR: [{ startDate: { lte: end }, endDate: { gte: start } }],
      },
    });

    if (overlapping) {
      throw new BadRequestException("Já existe uma licença ativa ou pendente para este período");
    }

    return this.prisma.leave.create({
      data: {
        startDate: start,
        endDate: end,
        type: dto.type,
        customType: dto.customType || null,
        description: dto.description || null,
        attachmentUrl: dto.attachmentUrl || null,
        employeeId: dto.employeeId,
      },
    });
  }

  async updateLeaveStatus(id: string, dto: UpdateLeaveStatusDto, approvedById: string) {
    const leave = await this.prisma.leave.findUnique({
      where: { id },
    });
    if (!leave || leave.deletedAt) {
      throw new NotFoundException("Solicitação de licença não encontrada");
    }

    if (leave.status !== LeaveStatus.PENDING) {
      throw new BadRequestException("Apenas solicitações pendentes podem ter seu status alterado");
    }

    if (dto.status === LeaveStatus.REJECTED && !dto.rejectionReason) {
      throw new BadRequestException("É necessário informar o motivo da rejeição");
    }

    const updated = await this.prisma.leave.update({
      where: { id },
      data: {
        status: dto.status,
        rejectionReason: dto.status === LeaveStatus.REJECTED ? dto.rejectionReason : null,
        approvedById,
      },
      include: { employee: true },
    });

    const statusText = dto.status === LeaveStatus.APPROVED ? "aprovada" : "rejeitada";
    const reasonText = dto.status === LeaveStatus.REJECTED ? ` Motivo: ${dto.rejectionReason}` : "";
    if (updated.employee.userId) {
      await this.notificationsService.create(
        updated.employee.userId,
        `Sua solicitação de licença/afastamento para o período de ${updated.startDate.toLocaleDateString()} a ${updated.endDate.toLocaleDateString()} foi ${statusText}.${reasonText}`,
      );
    }

    // If rejected and had an attachment, delete it from UploadThing
    if (dto.status === LeaveStatus.REJECTED && updated.attachmentUrl) {
      try {
        const fileKey = updated.attachmentUrl.split("/f/").pop();
        if (fileKey) {
          await this.uploadthingService.deleteFile(fileKey);
        }
      } catch (err) {
        console.error("Falha ao deletar arquivo de licença rejeitada do UploadThing", err);
      }
    }

    return updated;
  }

  async cancelLeave(id: string, requesterUserId: string, isHrOrAdmin: boolean) {
    const leave = await this.prisma.leave.findUnique({
      where: { id },
      include: { employee: true },
    });

    if (!leave || leave.deletedAt) {
      throw new NotFoundException("Licença não encontrada");
    }

    // Verify ownership
    if (!isHrOrAdmin && leave.employee.userId !== requesterUserId) {
      throw new ForbiddenException("Você não tem permissão para cancelar esta licença");
    }

    const updated = await this.prisma.leave.update({
      where: { id },
      data: {
        status: LeaveStatus.CANCELLED,
        deletedAt: new Date(),
      },
    });

    // Delete attachment if cancelled
    if (updated.attachmentUrl) {
      try {
        const fileKey = updated.attachmentUrl.split("/f/").pop();
        if (fileKey) {
          await this.uploadthingService.deleteFile(fileKey);
        }
      } catch (err) {
        console.error("Falha ao deletar arquivo de licença cancelada do UploadThing", err);
      }
    }

    return updated;
  }
}
