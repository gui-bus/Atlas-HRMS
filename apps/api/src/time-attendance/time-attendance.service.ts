import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { PrismaService } from "../common/prisma.service";
import { TimeRecordType, TimeRecordSource, RequestStatus } from "@prisma/client";

@Injectable()
export class TimeAttendanceService {
  constructor(private readonly prisma: PrismaService) {}

  
  
  

  async clockIn(
    userId: string,
    source: TimeRecordSource,
    ipAddress?: string,
    userAgent?: string,
    latitude?: number,
    longitude?: number,
    comments?: string,
  ) {
    const employee = await this.prisma.employee.findUnique({
      where: { userId },
    });
    if (!employee) {
      throw new ForbiddenException("Este usuário não está vinculado a um colaborador cadastrado.");
    }
    if (employee.status !== "ACTIVE") {
      throw new BadRequestException("Funcionário inativo ou desligado.");
    }

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    
    const activeVacation = await this.prisma.vacation.findFirst({
      where: {
        employeeId: employee.id,
        status: "APPROVED",
        startDate: { lte: todayEnd },
        endDate: { gte: todayStart },
        deletedAt: null,
      },
    });
    if (activeVacation) {
      throw new BadRequestException("Não é permitido registrar ponto durante férias aprovadas.");
    }

    
    const activeLeave = await this.prisma.leave.findFirst({
      where: {
        employeeId: employee.id,
        status: "APPROVED",
        startDate: { lte: todayEnd },
        endDate: { gte: todayStart },
        deletedAt: null,
      },
    });
    if (activeLeave) {
      throw new BadRequestException(
        "Não é permitido registrar ponto durante afastamento/licença ativa.",
      );
    }

    
    const todayRecords = await this.prisma.timeRecord.findMany({
      where: {
        employeeId: employee.id,
        timestamp: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
      orderBy: { timestamp: "asc" },
    });

    
    if (todayRecords.length > 0) {
      const lastRecord = todayRecords[todayRecords.length - 1];
      const diffMs = now.getTime() - new Date(lastRecord.timestamp).getTime();
      if (diffMs < 60000) {
        throw new BadRequestException(
          "Aguarde pelo menos 1 minuto antes de registrar o ponto novamente.",
        );
      }
    }

    
    let type: TimeRecordType;
    if (todayRecords.length === 0) {
      type = TimeRecordType.ENTRY;
    } else if (todayRecords.length === 1) {
      type = TimeRecordType.INTERVAL_OUT;
    } else if (todayRecords.length === 2) {
      type = TimeRecordType.INTERVAL_IN;
    } else if (todayRecords.length === 3) {
      type = TimeRecordType.EXIT;
    } else {
      throw new BadRequestException(
        "Todos os registros de ponto previstos para a jornada de hoje já foram realizados.",
      );
    }

    
    const record = await this.prisma.timeRecord.create({
      data: {
        employeeId: employee.id,
        timestamp: now,
        type,
        source,
        ipAddress,
        userAgent,
        latitude,
        longitude,
        comments,
      },
    });

    
    if (type === TimeRecordType.EXIT) {
      await this.calculateAndSaveDailySummary(employee.id, now);
    }

    return record;
  }

  async getTodayRecords(userId: string) {
    const employee = await this.prisma.employee.findUnique({
      where: { userId },
    });
    if (!employee) return [];

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    return this.prisma.timeRecord.findMany({
      where: {
        employeeId: employee.id,
        timestamp: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
      orderBy: { timestamp: "asc" },
    });
  }

  async getMyHistory(userId: string) {
    const employee = await this.prisma.employee.findUnique({
      where: { userId },
    });
    if (!employee) return [];

    return this.prisma.timeRecord.findMany({
      where: { employeeId: employee.id },
      orderBy: { timestamp: "desc" },
    });
  }

  
  
  

  async requestCorrection(
    userId: string,
    dateStr: string,
    targetType: TimeRecordType,
    timeStr: string,
    reason: string,
  ) {
    const employee = await this.prisma.employee.findUnique({
      where: { userId },
    });
    if (!employee) throw new ForbiddenException("Usuário não possui colaborador.");

    const date = new Date(dateStr);
    return this.prisma.timeCorrectionRequest.create({
      data: {
        employeeId: employee.id,
        date,
        targetType,
        time: timeStr,
        reason,
        status: RequestStatus.PENDING,
      },
    });
  }

  async getPendingCorrections() {
    return this.prisma.timeCorrectionRequest.findMany({
      where: { status: RequestStatus.PENDING },
      include: { employee: true },
    });
  }

  async handleCorrection(id: string, status: RequestStatus, notes?: string) {
    const request = await this.prisma.timeCorrectionRequest.findUnique({
      where: { id },
    });
    if (!request) throw new NotFoundException("Solicitação não encontrada.");

    const updated = await this.prisma.timeCorrectionRequest.update({
      where: { id },
      data: { status, notes },
    });

    if (status === RequestStatus.APPROVED) {
      
      const [hours, minutes] = request.time.split(":").map(Number);
      const targetTimestamp = new Date(request.date);
      targetTimestamp.setHours(hours, minutes, 0, 0);

      
      const existing = await this.prisma.timeRecord.findFirst({
        where: {
          employeeId: request.employeeId,
          type: request.targetType,
          timestamp: {
            gte: new Date(
              request.date.getFullYear(),
              request.date.getMonth(),
              request.date.getDate(),
              0,
              0,
              0,
              0,
            ),
            lte: new Date(
              request.date.getFullYear(),
              request.date.getMonth(),
              request.date.getDate(),
              23,
              59,
              59,
              999,
            ),
          },
        },
      });

      if (existing) {
        await this.prisma.timeRecord.update({
          where: { id: existing.id },
          data: { timestamp: targetTimestamp, source: TimeRecordSource.ADMIN },
        });
      } else {
        await this.prisma.timeRecord.create({
          data: {
            employeeId: request.employeeId,
            timestamp: targetTimestamp,
            type: request.targetType,
            source: TimeRecordSource.ADMIN,
            comments: `Corrigido: ${request.reason}`,
          },
        });
      }

      
      await this.calculateAndSaveDailySummary(request.employeeId, targetTimestamp);
    }

    return updated;
  }

  
  
  

  async getHourBankBalance(userId: string) {
    const employee = await this.prisma.employee.findUnique({
      where: { userId },
    });
    if (!employee) return 0;

    const lastLedger = await this.prisma.hourBankLedger.findFirst({
      where: { employeeId: employee.id },
      orderBy: { date: "desc" },
    });

    return lastLedger?.balance || 0;
  }

  
  
  

  private async calculateAndSaveDailySummary(employeeId: string, day: Date) {
    const todayStart = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 0, 0, 0, 0);
    const todayEnd = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 23, 59, 59, 999);

    const records = await this.prisma.timeRecord.findMany({
      where: {
        employeeId,
        timestamp: { gte: todayStart, lte: todayEnd },
      },
      orderBy: { timestamp: "asc" },
    });

    const entry = records.find((r) => r.type === TimeRecordType.ENTRY);
    const intOut = records.find((r) => r.type === TimeRecordType.INTERVAL_OUT);
    const intIn = records.find((r) => r.type === TimeRecordType.INTERVAL_IN);
    const exit = records.find((r) => r.type === TimeRecordType.EXIT);

    if (!entry || !exit) return;

    const expectedWorkMinutes = 480; 

    
    const morningMs =
      intOut && entry
        ? new Date(intOut.timestamp).getTime() - new Date(entry.timestamp).getTime()
        : 0;
    const afternoonMs =
      exit && intIn ? new Date(exit.timestamp).getTime() - new Date(intIn.timestamp).getTime() : 0;
    const netMinutes = Math.max(0, Math.floor((morningMs + afternoonMs) / 60000));

    
    const intervalMs =
      intIn && intOut
        ? new Date(intIn.timestamp).getTime() - new Date(intOut.timestamp).getTime()
        : 0;
    const intervalMinutes = Math.max(0, Math.floor(intervalMs / 60000));
    const grossMinutes = netMinutes + intervalMinutes;

    
    let overtimeMinutes = 0;
    let debtMinutes = 0;

    if (netMinutes > expectedWorkMinutes) {
      overtimeMinutes = netMinutes - expectedWorkMinutes;
    } else if (netMinutes < expectedWorkMinutes) {
      debtMinutes = expectedWorkMinutes - netMinutes;
    }

    
    await this.prisma.timeDaySummary.upsert({
      where: {
        employeeId_date: {
          employeeId,
          date: todayStart,
        },
      },
      update: {
        grossMinutes,
        intervalMinutes,
        netMinutes,
        expectedMinutes: expectedWorkMinutes,
        overtimeMinutes,
        debtMinutes,
      },
      create: {
        employeeId,
        date: todayStart,
        grossMinutes,
        intervalMinutes,
        netMinutes,
        expectedMinutes: expectedWorkMinutes,
        overtimeMinutes,
        debtMinutes,
      },
    });

    
    const netDelta = overtimeMinutes - debtMinutes;
    if (netDelta !== 0) {
      const lastLedger = await this.prisma.hourBankLedger.findFirst({
        where: { employeeId },
        orderBy: { date: "desc" },
      });
      const previousBalance = lastLedger?.balance || 0;
      await this.prisma.hourBankLedger.create({
        data: {
          employeeId,
          date: todayStart,
          amount: netDelta,
          reason:
            netDelta > 0
              ? "Crédito: Horas excedentes de expediente"
              : "Débito: Carga horária incompleta",
          balance: previousBalance + netDelta,
        },
      });
    }
  }
}
