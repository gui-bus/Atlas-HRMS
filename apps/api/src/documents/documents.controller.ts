import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes } from "@nestjs/swagger";
import { UserRole } from "@prisma/client";
import { AuthGuard } from "../auth/auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "../auth/roles.decorator";
import { CurrentUser } from "../auth/current-user.decorator";
import { DocumentsService } from "./documents.service";
import { UploadthingService } from "../common/uploadthing/uploadthing.service";
import { CreateDocumentDto } from "./dto/create-document.dto";
import { DocumentResponseDto } from "./dto/document-response.dto";
import {
  ValidationErrorResponseDto,
  UnauthorizedErrorResponseDto,
  ForbiddenErrorResponseDto,
  NotFoundErrorResponseDto,
} from "../common/dto/error-responses.dto";

@ApiTags("Documents")
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Controller("documents")
@ApiResponse({
  status: 401,
  description: "Não autenticado (token ausente ou inválido)",
  type: UnauthorizedErrorResponseDto,
})
export class DocumentsController {
  constructor(
    private readonly documentsService: DocumentsService,
    private readonly uploadthingService: UploadthingService,
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor("file"))
  @ApiConsumes("multipart/form-data")
  @ApiOperation({
    summary: "Criar registro de documento para um funcionário (Todos os cargos autenticados)",
  })
  @ApiResponse({
    status: 201,
    description: "Documento criado com sucesso",
    type: DocumentResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: "Dados inválidos fornecidos no payload",
    type: ValidationErrorResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: "Acesso proibido (funcionário tentou enviar documento para outro funcionário)",
    type: ForbiddenErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: "Funcionário informado não encontrado",
    type: NotFoundErrorResponseDto,
  })
  async create(
    @Body() dto: CreateDocumentDto,
    @CurrentUser() user: { sub: string; role: UserRole },
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (!file && !dto.url) {
      throw new BadRequestException("O arquivo do documento ou a URL é obrigatória");
    }
    if (file) {
      const uploadResult = await this.uploadthingService.uploadFile(file);
      dto.url = uploadResult?.data?.url ?? uploadResult?.url ?? "";
    }
    return this.documentsService.create(dto, user);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.HR, UserRole.MANAGER)
  @ApiOperation({
    summary: "Listar todos os documentos do sistema (Apenas Admin, RH e Gestores)",
  })
  @ApiResponse({
    status: 200,
    description: "Lista de documentos recuperada com sucesso",
    type: [DocumentResponseDto],
  })
  @ApiResponse({
    status: 403,
    description: "Acesso proibido (permissão insuficiente)",
    type: ForbiddenErrorResponseDto,
  })
  async findAll() {
    return this.documentsService.findAll();
  }

  @Get("employee/:employeeId")
  @ApiOperation({
    summary: "Listar documentos de um funcionário específico (Todos os cargos autenticados)",
  })
  @ApiResponse({
    status: 200,
    description: "Lista de documentos do funcionário recuperada com sucesso",
    type: [DocumentResponseDto],
  })
  @ApiResponse({
    status: 403,
    description: "Acesso proibido (funcionário tentou acessar documentos de outro)",
    type: ForbiddenErrorResponseDto,
  })
  async findByEmployee(
    @Param("employeeId") employeeId: string,
    @CurrentUser() user: { sub: string; role: UserRole },
  ) {
    return this.documentsService.findByEmployee(employeeId, user);
  }

  @Get(":id")
  @ApiOperation({
    summary: "Recuperar detalhes de um documento específico (Todos os cargos autenticados)",
  })
  @ApiResponse({
    status: 200,
    description: "Documento encontrado e retornado com sucesso",
    type: DocumentResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: "Acesso proibido (funcionário tentou acessar documento de outro)",
    type: ForbiddenErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: "Documento não encontrado",
    type: NotFoundErrorResponseDto,
  })
  async findOne(@Param("id") id: string, @CurrentUser() user: { sub: string; role: UserRole }) {
    return this.documentsService.findOne(id, user);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.ADMIN, UserRole.HR)
  @ApiOperation({
    summary: "Excluir um documento permanentemente (Apenas Admin e RH)",
  })
  @ApiResponse({
    status: 200,
    description:
      "Documento excluído com sucesso (registro marcado e arquivo removido do UploadThing)",
    type: DocumentResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: "Acesso proibido (permissão insuficiente)",
    type: ForbiddenErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: "Documento não encontrado",
    type: NotFoundErrorResponseDto,
  })
  async remove(@Param("id") id: string) {
    return this.documentsService.remove(id);
  }
}
