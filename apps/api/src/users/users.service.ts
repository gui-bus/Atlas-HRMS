import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../common/prisma.service";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import { ChangePasswordDto } from "./dto/change-password.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { UploadthingService } from "../common/uploadthing/uploadthing.service";
import * as bcrypt from "bcrypt";

import { QueryPaginationDto } from "../common/dto/pagination.dto";

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly uploadthingService: UploadthingService,
  ) {}

  async findAll(query?: QueryPaginationDto) {
    const page = query?.page;
    const limit = query?.limit;

    if (!page && !limit) {
      return this.prisma.user.findMany({
        where: { deletedAt: null },
        select: {
          id: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    }

    const currentPage = page ?? 1;
    const currentLimit = limit ?? 10;
    const skip = (currentPage - 1) * currentLimit;

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where: { deletedAt: null },
        select: {
          id: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
        skip,
        take: currentLimit,
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.user.count({ where: { deletedAt: null } }),
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
    const user = await this.prisma.user.findFirst({
      where: { id, deletedAt: null },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException("Usuário não encontrado");
    }

    return user;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto, avatar?: Express.Multer.File) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
      include: { employee: true },
    });

    if (!user) {
      throw new NotFoundException("Usuário não encontrado");
    }

    let finalAvatarUrl = dto.avatarUrl;
    if (avatar) {
      const uploadResult = await this.uploadthingService.uploadFile(avatar);
      console.log("uploadResult for avatar upload:", JSON.stringify(uploadResult));
      finalAvatarUrl = uploadResult?.data?.url ?? uploadResult?.url ?? "";
    }

    if (user.employee) {
      const employeeId = user.employee.id;
      await this.prisma.$transaction(async (tx) => {
        await tx.user.update({
          where: { id: userId },
          data: {
            firstName: dto.firstName !== undefined ? dto.firstName : undefined,
            lastName: dto.lastName !== undefined ? dto.lastName : undefined,
            avatarUrl: finalAvatarUrl !== undefined ? finalAvatarUrl : undefined,
          },
        });
        await tx.employee.update({
          where: { id: employeeId },
          data: {
            firstName: dto.firstName !== undefined ? dto.firstName : undefined,
            lastName: dto.lastName !== undefined ? dto.lastName : undefined,
            phone: dto.phone !== undefined ? dto.phone : undefined,
            personalData: {
              upsert: {
                create: {
                  cpf: user.id.replace(/[^\d]/g, "").slice(0, 11) || "00000000000",
                  avatarUrl: finalAvatarUrl || "",
                  rg: dto.rg || "",
                  birthDate: dto.birthDate ? new Date(dto.birthDate) : new Date("1970-01-01"),
                  gender: dto.gender || "OTHER",
                  maritalStatus: dto.maritalStatus || "SINGLE",
                },
                update: {
                  avatarUrl: finalAvatarUrl !== undefined ? finalAvatarUrl : undefined,
                  rg: dto.rg !== undefined ? dto.rg : undefined,
                  birthDate: dto.birthDate !== undefined ? new Date(dto.birthDate) : undefined,
                  gender: dto.gender !== undefined ? dto.gender : undefined,
                  maritalStatus: dto.maritalStatus !== undefined ? dto.maritalStatus : undefined,
                },
              },
            },
            address: {
              upsert: {
                create: {
                  cep: dto.cep?.replace(/[^\d]/g, "") || "",
                  street: dto.street || "",
                  number: dto.number || "",
                  complement: dto.complement || "",
                  neighborhood: dto.neighborhood || "",
                  city: dto.city || "",
                  state: dto.state?.toUpperCase() || "",
                },
                update: {
                  cep: dto.cep !== undefined ? dto.cep.replace(/[^\d]/g, "") : undefined,
                  street: dto.street !== undefined ? dto.street : undefined,
                  number: dto.number !== undefined ? dto.number : undefined,
                  complement: dto.complement !== undefined ? dto.complement : undefined,
                  neighborhood: dto.neighborhood !== undefined ? dto.neighborhood : undefined,
                  city: dto.city !== undefined ? dto.city : undefined,
                  state: dto.state !== undefined ? dto.state.toUpperCase() : undefined,
                },
              },
            },
            bankAccount: {
              upsert: {
                create: {
                  bankCode: dto.bankCode || "",
                  bankAgency: dto.bankAgency || "",
                  bankAccount: dto.bankAccount || "",
                  accountType: dto.accountType || "CHECKING",
                },
                update: {
                  bankCode: dto.bankCode !== undefined ? dto.bankCode : undefined,
                  bankAgency: dto.bankAgency !== undefined ? dto.bankAgency : undefined,
                  bankAccount: dto.bankAccount !== undefined ? dto.bankAccount : undefined,
                  accountType: dto.accountType !== undefined ? dto.accountType : undefined,
                },
              },
            },
          },
        });
      });
    } else {
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          firstName: dto.firstName !== undefined ? dto.firstName : undefined,
          lastName: dto.lastName !== undefined ? dto.lastName : undefined,
          avatarUrl: finalAvatarUrl !== undefined ? finalAvatarUrl : undefined,
        },
      });
    }

    return { success: true };
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
    });

    if (!user) {
      throw new NotFoundException("Usuário não encontrado");
    }

    if (dto.newPassword !== dto.confirmNewPassword) {
      throw new BadRequestException("A confirmação da nova senha não confere");
    }

    const isPasswordValid = await bcrypt.compare(dto.currentPassword, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException("Senha atual incorreta");
    }

    const hashedNewPassword = await bcrypt.hash(dto.newPassword, 10);

    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });

    return { success: true };
  }

  async update(id: string, dto: UpdateUserDto) {
    const user = await this.prisma.user.findFirst({
      where: { id, deletedAt: null },
    });

    if (!user) {
      throw new NotFoundException("Usuário não encontrado");
    }

    return this.prisma.user.update({
      where: { id },
      data: {
        role: dto.role !== undefined ? dto.role : undefined,
        isActive: dto.isActive !== undefined ? dto.isActive : undefined,
      },
    });
  }
}
