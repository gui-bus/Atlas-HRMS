import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../common/prisma.service";
import { UploadthingService } from "../common/uploadthing/uploadthing.service";
import { AuditService } from "../audit/audit.service";
import { AuditAction } from "../audit/audit-action.enum";
import { CreateRecruitmentDto } from "./dto/create-recruitment.dto";
import { UpdateRecruitmentDto } from "./dto/update-recruitment.dto";
import { QueryRecruitmentDto } from "./dto/query-recruitment.dto";
import { ApplyToRecruitmentDto } from "./dto/apply-recruitment.dto";
import { UpdateApplicationStatusDto } from "./dto/update-application-status.dto";
import { RecruitmentStatus, ApplicationStatus, Prisma } from "@prisma/client";
import { NotificationsService } from "../notifications/notifications.service";

@Injectable()
export class RecruitmentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly uploadthingService: UploadthingService,
    private readonly auditService: AuditService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(dto: CreateRecruitmentDto, userId: string) {
    const slug = this.generateSlug(dto.title);

    const slugExists = await this.prisma.recruitment.findUnique({
      where: { slug },
    });
    if (slugExists) {
      throw new ConflictException("Já existe uma vaga com slug gerado idêntico. Altere o título.");
    }

    const recruitment = await this.prisma.recruitment.create({
      data: {
        title: dto.title,
        slug,
        description: dto.description,
        status: dto.status ?? RecruitmentStatus.DRAFT,
        employmentType: dto.employmentType,
        workModel: dto.workModel,
        seniority: dto.seniority,
        vacancies: dto.vacancies ?? 1,
        salaryMin: dto.salaryMin ?? null,
        salaryMax: dto.salaryMax ?? null,
        isSalaryVisible: dto.isSalaryVisible ?? false,
        city: dto.city ?? null,
        state: dto.state ?? null,
        country: dto.country ?? "Brasil",
        requirements: dto.requirements ?? null,
        responsibilities: dto.responsibilities ?? null,
        benefits: dto.benefits ?? null,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
        publishedAt: dto.status === RecruitmentStatus.OPEN ? new Date() : null,
        departmentId: dto.departmentId,
        positionId: dto.positionId,
        createdById: userId,
      },
      include: { department: true, position: true },
    });

    await this.auditService.logAction(
      userId,
      AuditAction.JOB_CREATED,
      `Vaga "${recruitment.title}" criada com status ${recruitment.status}`,
    );

    return recruitment;
  }

  async update(id: string, dto: UpdateRecruitmentDto, userId: string) {
    const existing = await this.prisma.recruitment.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      throw new NotFoundException("Vaga não encontrada");
    }

    const updateData: any = { ...dto };

    if (dto.expiresAt) {
      updateData.expiresAt = new Date(dto.expiresAt);
    }

    if (dto.status === RecruitmentStatus.OPEN && !existing.publishedAt) {
      updateData.publishedAt = new Date();
    }

    const recruitment = await this.prisma.recruitment.update({
      where: { id },
      data: updateData,
      include: { department: true, position: true },
    });

    const action =
      dto.status === RecruitmentStatus.OPEN
        ? AuditAction.JOB_PUBLISHED
        : dto.status === RecruitmentStatus.CLOSED
          ? AuditAction.JOB_CLOSED
          : AuditAction.JOB_UPDATED;

    await this.auditService.logAction(userId, action, `Vaga "${recruitment.title}" atualizada`);

    return recruitment;
  }

  async remove(id: string, userId: string) {
    const existing = await this.prisma.recruitment.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      throw new NotFoundException("Vaga não encontrada");
    }

    const recruitment = await this.prisma.recruitment.update({
      where: { id },
      data: { deletedAt: new Date(), status: RecruitmentStatus.CLOSED },
    });

    await this.auditService.logAction(
      userId,
      AuditAction.JOB_CLOSED,
      `Vaga "${recruitment.title}" excluída (soft delete)`,
    );

    return recruitment;
  }

  async findAllAdmin(query: QueryRecruitmentDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: Prisma.RecruitmentWhereInput = { deletedAt: null };

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: "insensitive" } },
        { description: { contains: query.search, mode: "insensitive" } },
      ];
    }

    if (query.departmentId) where.departmentId = query.departmentId;
    if (query.seniority) where.seniority = query.seniority;
    if (query.workModel) where.workModel = query.workModel;
    if (query.employmentType) where.employmentType = query.employmentType;

    let orderBy: any = { createdAt: "desc" };
    if (query.sortBy) {
      const order = query.sortOrder || "asc";
      if (query.sortBy === "department" || query.sortBy === "departmentName") {
        orderBy = { department: { name: order } };
      } else if (
        ["title", "status", "workModel", "employmentType", "publishedAt", "createdAt"].includes(
          query.sortBy,
        )
      ) {
        orderBy = { [query.sortBy]: order };
      }
    }

    const [data, total] = await Promise.all([
      this.prisma.recruitment.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          department: { select: { name: true } },
          position: { select: { title: true } },
        },
      }),
      this.prisma.recruitment.count({ where }),
    ]);

    return {
      data: data.map((r) => ({
        id: r.id,
        title: r.title,
        slug: r.slug,
        status: r.status,
        employmentType: r.employmentType,
        workModel: r.workModel,
        seniority: r.seniority,
        vacancies: r.vacancies,
        salaryMin: r.salaryMin,
        salaryMax: r.salaryMax,
        city: r.city,
        state: r.state,
        country: r.country,
        publishedAt: r.publishedAt,
        createdAt: r.createdAt,
        departmentId: r.departmentId,
        positionId: r.positionId,
        department: r.department ? { name: r.department.name } : null,
        position: r.position ? { title: r.position.title } : null,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findAllPublic(query: QueryRecruitmentDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: Prisma.RecruitmentWhereInput = {
      deletedAt: null,
      status: RecruitmentStatus.OPEN,
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    };

    if (query.search) {
      where.AND = [
        {
          OR: [
            { title: { contains: query.search, mode: "insensitive" } },
            { description: { contains: query.search, mode: "insensitive" } },
          ],
        },
      ];
    }

    if (query.departmentId) where.departmentId = query.departmentId;
    if (query.seniority) where.seniority = query.seniority;
    if (query.workModel) where.workModel = query.workModel;
    if (query.employmentType) where.employmentType = query.employmentType;

    let orderBy: any = { publishedAt: "desc" };
    if (query.sortBy) {
      const order = query.sortOrder || "asc";
      if (query.sortBy === "department" || query.sortBy === "departmentName") {
        orderBy = { department: { name: order } };
      } else if (
        ["title", "workModel", "employmentType", "publishedAt", "createdAt"].includes(query.sortBy)
      ) {
        orderBy = { [query.sortBy]: order };
      }
    }

    const [data, total] = await Promise.all([
      this.prisma.recruitment.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          department: { select: { name: true } },
          position: { select: { title: true } },
        },
      }),
      this.prisma.recruitment.count({ where }),
    ]);

    const sanitized = data.map((r) => ({
      id: r.id,
      title: r.title,
      slug: r.slug,
      description: r.description,
      status: r.status,
      employmentType: r.employmentType,
      workModel: r.workModel,
      seniority: r.seniority,
      vacancies: r.vacancies,
      salaryMin: r.isSalaryVisible ? r.salaryMin : null,
      salaryMax: r.isSalaryVisible ? r.salaryMax : null,
      city: r.city,
      state: r.state,
      country: r.country,
      requirements: r.requirements,
      responsibilities: r.responsibilities,
      benefits: r.benefits,
      publishedAt: r.publishedAt,
      departmentName: r.department?.name ?? null,
      positionTitle: r.position?.title ?? null,
    }));

    return {
      data: sanitized,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findBySlugPublic(slugOrId: string) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slugOrId);
    const recruitment = await this.prisma.recruitment.findUnique({
      where: isUuid ? { id: slugOrId } : { slug: slugOrId },
      include: {
        department: { select: { name: true } },
        position: { select: { title: true } },
      },
    });

    if (!recruitment || recruitment.deletedAt) {
      throw new NotFoundException("Vaga não encontrada ou não está disponível");
    }

    if (!isUuid) {
      if (recruitment.status !== RecruitmentStatus.OPEN) {
        throw new NotFoundException("Vaga não encontrada ou não está disponível");
      }

      if (recruitment.expiresAt && recruitment.expiresAt < new Date()) {
        await this.prisma.recruitment.update({
          where: { id: recruitment.id },
          data: { status: RecruitmentStatus.CLOSED },
        });
        throw new NotFoundException("Esta vaga expirou e não está mais disponível");
      }

      await this.prisma.recruitment.update({
        where: { id: recruitment.id },
        data: { views: { increment: 1 } },
      });
    }

    return {
      id: recruitment.id,
      title: recruitment.title,
      slug: recruitment.slug,
      description: recruitment.description,
      departmentId: recruitment.departmentId,
      positionId: recruitment.positionId,
      employmentType: recruitment.employmentType,
      workModel: recruitment.workModel,
      seniority: recruitment.seniority,
      vacancies: recruitment.vacancies,
      salaryMin: recruitment.isSalaryVisible || isUuid ? recruitment.salaryMin : null,
      salaryMax: recruitment.isSalaryVisible || isUuid ? recruitment.salaryMax : null,
      city: recruitment.city,
      state: recruitment.state,
      country: recruitment.country,
      requirements: recruitment.requirements,
      responsibilities: recruitment.responsibilities,
      benefits: recruitment.benefits,
      publishedAt: recruitment.publishedAt,
      department: recruitment.department ? { name: recruitment.department.name } : null,
      position: recruitment.position ? { title: recruitment.position.title } : null,
      departmentName: recruitment.department?.name ?? null,
      positionTitle: recruitment.position?.title ?? null,
      status: recruitment.status,
    };
  }

  async applyToRecruitment(
    slug: string,
    dto: ApplyToRecruitmentDto,
    resumeFile: Express.Multer.File,
  ) {
    const recruitment = await this.prisma.recruitment.findUnique({
      where: { slug },
    });

    if (!recruitment || recruitment.deletedAt || recruitment.status !== RecruitmentStatus.OPEN) {
      throw new NotFoundException("Vaga não encontrada ou não está disponível para candidatura");
    }

    if (recruitment.expiresAt && recruitment.expiresAt < new Date()) {
      await this.prisma.recruitment.update({
        where: { id: recruitment.id },
        data: { status: RecruitmentStatus.CLOSED },
      });
      throw new BadRequestException("Esta vaga expirou e não aceita mais candidaturas");
    }

    const uploadResult = await this.uploadthingService.uploadFile(resumeFile);
    const resumeUrl = uploadResult?.data?.url ?? uploadResult?.url ?? "";

    return this.prisma.$transaction(async (tx) => {
      let candidate = await tx.candidate.findUnique({
        where: { email: dto.email },
      });

      if (!candidate) {
        candidate = await tx.candidate.create({
          data: {
            firstName: dto.firstName,
            lastName: dto.lastName,
            email: dto.email,
            phone: dto.phone,
            linkedinUrl: dto.linkedinUrl ?? null,
            githubUrl: dto.githubUrl ?? null,
            portfolioUrl: dto.portfolioUrl ?? null,
            currentSalary: dto.currentSalary ?? null,
            expectedSalary: dto.expectedSalary ?? null,
          },
        });
      } else {
        candidate = await tx.candidate.update({
          where: { id: candidate.id },
          data: {
            firstName: dto.firstName,
            lastName: dto.lastName,
            phone: dto.phone,
            linkedinUrl: dto.linkedinUrl ?? candidate.linkedinUrl,
            githubUrl: dto.githubUrl ?? candidate.githubUrl,
            portfolioUrl: dto.portfolioUrl ?? candidate.portfolioUrl,
            currentSalary: dto.currentSalary ?? candidate.currentSalary,
            expectedSalary: dto.expectedSalary ?? candidate.expectedSalary,
          },
        });
      }

      const existingApplication = await tx.application.findUnique({
        where: {
          candidateId_recruitmentId: {
            candidateId: candidate.id,
            recruitmentId: recruitment.id,
          },
        },
      });

      if (existingApplication) {
        throw new ConflictException("Você já enviou uma candidatura para esta vaga");
      }

      const application = await tx.application.create({
        data: {
          resumeUrl,
          coverLetter: dto.coverLetter ?? null,
          recruitmentId: recruitment.id,
          candidateId: candidate.id,
        },
        include: { candidate: true },
      });

      await this.auditService.logAction(
        null,
        AuditAction.APPLICATION_RECEIVED,
        `Candidatura recebida de ${candidate.firstName} ${candidate.lastName} (${candidate.email}) para a vaga "${recruitment.title}"`,
      );

      return application;
    });
  }

  async findApplications(recruitmentId: string, page: number = 1, limit: number = 10) {
    const recruitment = await this.prisma.recruitment.findFirst({
      where: { id: recruitmentId, deletedAt: null },
    });

    if (!recruitment) {
      throw new NotFoundException("Vaga não encontrada");
    }

    const skip = (page - 1) * limit;

    const where: Prisma.ApplicationWhereInput = {
      recruitmentId,
      deletedAt: null,
    };

    const [data, total] = await Promise.all([
      this.prisma.application.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: { candidate: true },
      }),
      this.prisma.application.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async updateApplicationStatus(
    applicationId: string,
    dto: UpdateApplicationStatusDto,
    userId: string,
  ) {
    const application = await this.prisma.application.findFirst({
      where: { id: applicationId, deletedAt: null },
      include: { candidate: true, recruitment: true },
    });

    if (!application) {
      throw new NotFoundException("Candidatura não encontrada");
    }

    const updated = await this.prisma.application.update({
      where: { id: applicationId },
      data: {
        status: dto.status,
        feedback: dto.feedback ?? application.feedback,
      },
      include: { candidate: true },
    });

    await this.auditService.logAction(
      userId,
      AuditAction.CANDIDATE_STATUS_CHANGED,
      `Status da candidatura de ${application.candidate.firstName} ${application.candidate.lastName} alterado de ${application.status} para ${dto.status} na vaga "${application.recruitment.title}"`,
    );

    return updated;
  }

  async hireCandidate(applicationId: string, userId: string) {
    const application = await this.prisma.application.findFirst({
      where: { id: applicationId, deletedAt: null },
      include: {
        candidate: true,
        recruitment: {
          include: { department: true, position: true },
        },
      },
    });

    if (!application) {
      throw new NotFoundException("Candidatura não encontrada");
    }

    if (application.status === ApplicationStatus.HIRED) {
      throw new ConflictException("Este candidato já foi contratado");
    }

    return this.prisma
      .$transaction(async (tx) => {
        const emailExists = await tx.employee.findUnique({
          where: { email: application.candidate.email },
        });

        if (emailExists) {
          throw new ConflictException(
            "Já existe um funcionário cadastrado com o e-mail deste candidato",
          );
        }

        const employee = await tx.employee.create({
          data: {
            firstName: application.candidate.firstName,
            lastName: application.candidate.lastName,
            email: application.candidate.email,
            phone: application.candidate.phone,
            hireDate: new Date(),
            salary: application.recruitment.position.salaryRangeMin,
            departmentId: application.recruitment.departmentId,
            positionId: application.recruitment.positionId,
          },
        });

        await tx.application.update({
          where: { id: applicationId },
          data: {
            status: ApplicationStatus.HIRED,
            hiredAt: new Date(),
          },
        });

        await this.auditService.logAction(
          userId,
          AuditAction.CANDIDATE_CONVERTED_TO_EMPLOYEE,
          `Candidato ${application.candidate.firstName} ${application.candidate.lastName} contratado como funcionário (Employee ID: ${employee.id}) via vaga "${application.recruitment.title}"`,
        );

        return employee;
      })
      .then(async (employee) => {
        
        const associatedUser = await this.prisma.user.findFirst({
          where: { email: employee.email, deletedAt: null },
        });
        if (associatedUser) {
          await this.notificationsService.create(
            associatedUser.id,
            `Boas-vindas ao Atlas HRMS! Sua admissão para o cargo de ${application.recruitment.position.title} foi concluída com sucesso.`,
          );
        }
        return employee;
      });
  }

  private generateSlug(title: string): string {
    const base = title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    const suffix = Math.random().toString(36).substring(2, 8);
    return `${base}-${suffix}`;
  }
}
