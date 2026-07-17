import { Injectable, NotFoundException, ForbiddenException } from "@nestjs/common";
import { PrismaService } from "../common/prisma.service";
import { UploadthingService } from "../common/uploadthing/uploadthing.service";
import { CreateDocumentDto } from "./dto/create-document.dto";
import { UserRole } from "@prisma/client";

@Injectable()
export class DocumentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly uploadthingService: UploadthingService,
  ) {}

  async create(dto: CreateDocumentDto, currentUser: { sub: string; role: UserRole }) {
    if (currentUser.role === UserRole.EMPLOYEE) {
      const employee = await this.prisma.employee.findFirst({
        where: { userId: currentUser.sub, deletedAt: null },
      });

      if (!employee || employee.id !== dto.employeeId) {
        throw new ForbiddenException("Funcionários só podem enviar documentos para si mesmos");
      }
    }

    const employeeExists = await this.prisma.employee.findFirst({
      where: { id: dto.employeeId, deletedAt: null },
    });

    if (!employeeExists) {
      throw new NotFoundException("Funcionário não encontrado");
    }

    return this.prisma.document.create({
      data: {
        name: dto.name,
        type: dto.type,
        url: dto.url!,
        employeeId: dto.employeeId,
      },
    });
  }

  async findAll() {
    return this.prisma.document.findMany({
      where: { deletedAt: null },
      include: { employee: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async findByEmployee(employeeId: string, currentUser: { sub: string; role: UserRole }) {
    if (currentUser.role === UserRole.EMPLOYEE) {
      const employee = await this.prisma.employee.findFirst({
        where: { userId: currentUser.sub, deletedAt: null },
      });

      if (!employee || employee.id !== employeeId) {
        throw new ForbiddenException("Funcionários só podem visualizar seus próprios documentos");
      }
    }

    return this.prisma.document.findMany({
      where: { employeeId, deletedAt: null },
      include: { employee: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async findOne(id: string, currentUser: { sub: string; role: UserRole }) {
    const document = await this.prisma.document.findFirst({
      where: { id, deletedAt: null },
    });

    if (!document) {
      throw new NotFoundException("Documento não encontrado");
    }

    if (currentUser.role === UserRole.EMPLOYEE) {
      const employee = await this.prisma.employee.findFirst({
        where: { userId: currentUser.sub, deletedAt: null },
      });

      if (!employee || employee.id !== document.employeeId) {
        throw new ForbiddenException("Funcionários só podem visualizar seus próprios documentos");
      }
    }

    return document;
  }

  async remove(id: string) {
    const document = await this.prisma.document.findFirst({
      where: { id, deletedAt: null },
    });

    if (!document) {
      throw new NotFoundException("Documento não encontrado");
    }

    const fileKey = this.extractFileKey(document.url);
    await this.uploadthingService.deleteFile(fileKey);

    return this.prisma.document.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  private extractFileKey(url: string): string {
    const parts = url.split("/f/");
    return parts[parts.length - 1];
  }
}
