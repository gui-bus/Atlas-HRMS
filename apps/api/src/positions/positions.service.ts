import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../common/prisma.service";
import { CreatePositionDto } from "./dto/create-position.dto";
import { UpdatePositionDto } from "./dto/update-position.dto";

import { QueryPaginationDto } from "../common/dto/pagination.dto";

@Injectable()
export class PositionsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query?: QueryPaginationDto) {
    const page = query?.page;
    const limit = query?.limit;

    let orderBy: any = undefined;
    if (query?.sortBy) {
      const order = query.sortOrder || "asc";
      if (query.sortBy === "department") {
        orderBy = { department: { name: order } };
      } else if (
        [
          "title",
          "description",
          "salaryRangeMin",
          "salaryRangeMax",
          "active",
          "createdAt",
        ].includes(query.sortBy)
      ) {
        orderBy = { [query.sortBy]: order };
      }
    }

    if (!page && !limit) {
      return this.prisma.position.findMany({
        where: { deletedAt: null },
        include: {
          department: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          _count: {
            select: {
              employees: true,
            },
          },
        },
        ...(orderBy ? { orderBy } : {}),
      });
    }

    const currentPage = page ?? 1;
    const currentLimit = limit ?? 10;
    const skip = (currentPage - 1) * currentLimit;

    const [data, total] = await Promise.all([
      this.prisma.position.findMany({
        where: { deletedAt: null },
        include: {
          department: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          _count: {
            select: {
              employees: true,
            },
          },
        },
        skip,
        take: currentLimit,
        orderBy: orderBy || { createdAt: "desc" },
      }),
      this.prisma.position.count({ where: { deletedAt: null } }),
    ]);

    return {
      data,
      total,
      page: currentPage,
      limit: currentLimit,
      totalPages: Math.ceil(total / currentLimit),
    };
  }

  async findOne(id: string) {
    const position = await this.prisma.position.findFirst({
      where: { id, deletedAt: null },
      include: {
        department: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        employees: {
          where: { deletedAt: null },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            status: true,
          },
        },
      },
    });

    if (!position) {
      throw new NotFoundException("Cargo não encontrado");
    }

    return position;
  }

  async create(dto: CreatePositionDto) {
    const departmentExists = await this.prisma.department.findFirst({
      where: { id: dto.departmentId, deletedAt: null },
    });
    if (!departmentExists) {
      throw new NotFoundException("Departamento indicado não encontrado");
    }

    if (dto.salaryRangeMin > dto.salaryRangeMax) {
      throw new BadRequestException("O salário mínimo não pode ser maior que o salário máximo");
    }

    const activePosition = await this.prisma.position.findFirst({
      where: {
        title: dto.title,
        departmentId: dto.departmentId,
        deletedAt: null,
      },
    });
    if (activePosition) {
      throw new ConflictException("Já existe um cargo ativo com este título neste departamento");
    }

    const softDeleted = await this.prisma.position.findFirst({
      where: {
        title: dto.title,
        departmentId: dto.departmentId,
        NOT: { deletedAt: null },
      },
    });

    if (softDeleted) {
      return this.prisma.position.update({
        where: { id: softDeleted.id },
        data: {
          title: dto.title,
          description: dto.description,
          salaryRangeMin: dto.salaryRangeMin,
          salaryRangeMax: dto.salaryRangeMax,
          active: dto.active ?? true,
          deletedAt: null,
        },
      });
    }

    return this.prisma.position.create({
      data: {
        title: dto.title,
        description: dto.description,
        salaryRangeMin: dto.salaryRangeMin,
        salaryRangeMax: dto.salaryRangeMax,
        active: dto.active ?? true,
        departmentId: dto.departmentId,
      },
    });
  }

  async update(id: string, dto: UpdatePositionDto) {
    const position = await this.prisma.position.findFirst({
      where: { id, deletedAt: null },
    });
    if (!position) {
      throw new NotFoundException("Cargo não encontrado");
    }

    const targetDeptId = dto.departmentId ?? position.departmentId;

    if (dto.departmentId && dto.departmentId !== position.departmentId) {
      const departmentExists = await this.prisma.department.findFirst({
        where: { id: dto.departmentId, deletedAt: null },
      });
      if (!departmentExists) {
        throw new NotFoundException("Departamento indicado não encontrado");
      }
    }

    const minSalary =
      dto.salaryRangeMin !== undefined ? dto.salaryRangeMin : Number(position.salaryRangeMin);
    const maxSalary =
      dto.salaryRangeMax !== undefined ? dto.salaryRangeMax : Number(position.salaryRangeMax);

    if (minSalary > maxSalary) {
      throw new BadRequestException("O salário mínimo não pode ser maior que o salário máximo");
    }

    if (dto.title || dto.departmentId) {
      const targetTitle = dto.title ?? position.title;
      const duplicate = await this.prisma.position.findFirst({
        where: {
          title: targetTitle,
          departmentId: targetDeptId,
          NOT: { id },
        },
      });
      if (duplicate) {
        throw new ConflictException(
          duplicate.deletedAt === null
            ? "Já existe um cargo ativo com este título neste departamento"
            : "Já existe um cargo excluído com este título neste departamento",
        );
      }
    }

    return this.prisma.position.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        salaryRangeMin: dto.salaryRangeMin,
        salaryRangeMax: dto.salaryRangeMax,
        active: dto.active,
        departmentId: dto.departmentId,
      },
    });
  }

  async remove(id: string) {
    const position = await this.prisma.position.findFirst({
      where: { id, deletedAt: null },
      include: {
        _count: {
          select: {
            employees: true,
          },
        },
      },
    });

    if (!position) {
      throw new NotFoundException("Cargo não encontrado");
    }

    if (position._count.employees > 0) {
      throw new BadRequestException(
        "Não é possível excluir um cargo que possui funcionários ativos vinculados",
      );
    }

    return this.prisma.position.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
