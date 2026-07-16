import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../common/prisma.service";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import { ChangePasswordDto } from "./dto/change-password.dto";
import { UploadthingService } from "../common/uploadthing/uploadthing.service";
import * as bcrypt from "bcrypt";

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly uploadthingService: UploadthingService,
  ) {}

  async findAll() {
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
      finalAvatarUrl = uploadResult?.data?.url ?? uploadResult?.url ?? "";
    }

    if (user.employee) {
      const employeeId = user.employee.id;
      await this.prisma.$transaction(async (tx) => {
        await tx.employee.update({
          where: { id: employeeId },
          data: {
            firstName: dto.firstName !== undefined ? dto.firstName : undefined,
            lastName: dto.lastName !== undefined ? dto.lastName : undefined,
            phone: dto.phone !== undefined ? dto.phone : undefined,
            personalData: {
              update: {
                avatarUrl: finalAvatarUrl !== undefined ? finalAvatarUrl : undefined,
              },
            },
          },
        });
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
}
