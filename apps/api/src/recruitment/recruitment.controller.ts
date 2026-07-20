import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from "@nestjs/swagger";
import { FileInterceptor } from "@nestjs/platform-express";
import { UserRole } from "@prisma/client";
import { AuthGuard } from "../auth/auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "../auth/roles.decorator";
import { CurrentUser } from "../auth/current-user.decorator";
import { RecruitmentService } from "./recruitment.service";
import { CreateRecruitmentDto } from "./dto/create-recruitment.dto";
import { UpdateRecruitmentDto } from "./dto/update-recruitment.dto";
import { QueryRecruitmentDto } from "./dto/query-recruitment.dto";
import { ApplyToRecruitmentDto } from "./dto/apply-recruitment.dto";
import { UpdateApplicationStatusDto } from "./dto/update-application-status.dto";
import {
  RecruitmentResponseDto,
  PublicRecruitmentResponseDto,
  PaginatedRecruitmentResponseDto,
} from "./dto/recruitment-response.dto";
import {
  ApplicationResponseDto,
  PaginatedApplicationResponseDto,
} from "./dto/application-response.dto";
import {
  ValidationErrorResponseDto,
  UnauthorizedErrorResponseDto,
  ForbiddenErrorResponseDto,
  NotFoundErrorResponseDto,
  ConflictErrorResponseDto,
} from "../common/dto/error-responses.dto";

@ApiTags("Recruitments")
@Controller("recruitments")
export class RecruitmentController {
  constructor(private readonly recruitmentService: RecruitmentService) {}

  
  
  

  @Get()
  @ApiOperation({
    summary: "Listar vagas abertas com paginação e filtros (Público)",
  })
  @ApiResponse({
    status: 200,
    description: "Lista paginada de vagas abertas",
    type: PaginatedRecruitmentResponseDto,
  })
  async findAllPublic(@Query() query: QueryRecruitmentDto) {
    return this.recruitmentService.findAllPublic(query);
  }

  @Get("admin")
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.HR, UserRole.MANAGER)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Listar todas as vagas com todos os status (Admin, RH e Gerente)",
  })
  @ApiResponse({
    status: 200,
    description: "Lista paginada de vagas (todos os status)",
    type: PaginatedRecruitmentResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: "Não autenticado",
    type: UnauthorizedErrorResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: "Permissão insuficiente",
    type: ForbiddenErrorResponseDto,
  })
  async findAllAdmin(@Query() query: QueryRecruitmentDto) {
    return this.recruitmentService.findAllAdmin(query);
  }

  @Get(":slug")
  @ApiOperation({
    summary: "Detalhar uma vaga por slug e incrementar visualizações (Público)",
  })
  @ApiResponse({
    status: 200,
    description: "Detalhes da vaga retornados com sucesso",
    type: PublicRecruitmentResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: "Vaga não encontrada ou indisponível",
    type: NotFoundErrorResponseDto,
  })
  async findBySlug(@Param("slug") slug: string) {
    return this.recruitmentService.findBySlugPublic(slug);
  }

  @Post(":slug/apply")
  @UseInterceptors(FileInterceptor("resume"))
  @ApiConsumes("multipart/form-data")
  @ApiOperation({
    summary: "Candidatar-se a uma vaga enviando currículo (Público / Multipart)",
  })
  @ApiBody({
    description: "Dados do candidato + arquivo de currículo",
    schema: {
      type: "object",
      properties: {
        firstName: { type: "string", example: "Maria" },
        lastName: { type: "string", example: "Oliveira" },
        email: { type: "string", example: "maria@gmail.com" },
        phone: { type: "string", example: "(31) 99999-0000" },
        linkedinUrl: { type: "string" },
        githubUrl: { type: "string" },
        portfolioUrl: { type: "string" },
        currentSalary: { type: "string" },
        expectedSalary: { type: "string" },
        coverLetter: { type: "string" },
        resume: { type: "string", format: "binary" },
      },
      required: ["firstName", "lastName", "email", "phone", "resume"],
    },
  })
  @ApiResponse({
    status: 201,
    description: "Candidatura enviada com sucesso",
    type: ApplicationResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: "Dados inválidos ou vaga expirada",
    type: ValidationErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: "Vaga não encontrada ou indisponível",
    type: NotFoundErrorResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: "Candidatura duplicada para esta vaga",
    type: ConflictErrorResponseDto,
  })
  async apply(
    @Param("slug") slug: string,
    @Body() dto: ApplyToRecruitmentDto,
    @UploadedFile() resume: Express.Multer.File,
  ) {
    return this.recruitmentService.applyToRecruitment(slug, dto, resume);
  }

  
  
  

  @Post("admin")
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.HR)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Criar uma nova vaga de emprego (Apenas Admin e RH)",
  })
  @ApiResponse({
    status: 201,
    description: "Vaga criada com sucesso",
    type: RecruitmentResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: "Dados inválidos fornecidos",
    type: ValidationErrorResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: "Não autenticado",
    type: UnauthorizedErrorResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: "Permissão insuficiente",
    type: ForbiddenErrorResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: "Conflito de slug duplicado",
    type: ConflictErrorResponseDto,
  })
  async create(@Body() dto: CreateRecruitmentDto, @CurrentUser("sub") userId: string) {
    return this.recruitmentService.create(dto, userId);
  }

  @Put("admin/:id")
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.HR)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Atualizar dados de uma vaga existente (Apenas Admin e RH)",
  })
  @ApiResponse({
    status: 200,
    description: "Vaga atualizada com sucesso",
    type: RecruitmentResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: "Não autenticado",
    type: UnauthorizedErrorResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: "Permissão insuficiente",
    type: ForbiddenErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: "Vaga não encontrada",
    type: NotFoundErrorResponseDto,
  })
  async update(
    @Param("id") id: string,
    @Body() dto: UpdateRecruitmentDto,
    @CurrentUser("sub") userId: string,
  ) {
    return this.recruitmentService.update(id, dto, userId);
  }

  @Delete("admin/:id")
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.HR)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Excluir uma vaga (soft delete) (Apenas Admin e RH)",
  })
  @ApiResponse({
    status: 200,
    description: "Vaga excluída (soft delete) com sucesso",
    type: RecruitmentResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: "Não autenticado",
    type: UnauthorizedErrorResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: "Permissão insuficiente",
    type: ForbiddenErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: "Vaga não encontrada",
    type: NotFoundErrorResponseDto,
  })
  async remove(@Param("id") id: string, @CurrentUser("sub") userId: string) {
    return this.recruitmentService.remove(id, userId);
  }

  @Get("admin/:id/applications")
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.HR, UserRole.MANAGER)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Listar candidaturas de uma vaga (Admin, RH e Gestores)",
  })
  @ApiResponse({
    status: 200,
    description: "Lista paginada de candidaturas",
    type: PaginatedApplicationResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: "Não autenticado",
    type: UnauthorizedErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: "Vaga não encontrada",
    type: NotFoundErrorResponseDto,
  })
  async findApplications(
    @Param("id") id: string,
    @Query("page") page?: number,
    @Query("limit") limit?: number,
  ) {
    return this.recruitmentService.findApplications(
      id,
      page ? Number(page) : 1,
      limit ? Number(limit) : 10,
    );
  }

  @Put("applications/:applicationId/status")
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.HR)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Atualizar status de uma candidatura no pipeline (Admin e RH)",
  })
  @ApiResponse({
    status: 200,
    description: "Status da candidatura atualizado com sucesso",
    type: ApplicationResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: "Não autenticado",
    type: UnauthorizedErrorResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: "Permissão insuficiente",
    type: ForbiddenErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: "Candidatura não encontrada",
    type: NotFoundErrorResponseDto,
  })
  async updateApplicationStatus(
    @Param("applicationId") applicationId: string,
    @Body() dto: UpdateApplicationStatusDto,
    @CurrentUser("sub") userId: string,
  ) {
    return this.recruitmentService.updateApplicationStatus(applicationId, dto, userId);
  }

  @Post("applications/:applicationId/hire")
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.HR)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Converter candidato em funcionário (Ação de admissão) (Admin e RH)",
  })
  @ApiResponse({
    status: 201,
    description: "Candidato convertido em funcionário com sucesso",
  })
  @ApiResponse({
    status: 401,
    description: "Não autenticado",
    type: UnauthorizedErrorResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: "Permissão insuficiente",
    type: ForbiddenErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: "Candidatura não encontrada",
    type: NotFoundErrorResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: "Candidato já contratado ou e-mail já cadastrado",
    type: ConflictErrorResponseDto,
  })
  async hireCandidate(
    @Param("applicationId") applicationId: string,
    @CurrentUser("sub") userId: string,
  ) {
    return this.recruitmentService.hireCandidate(applicationId, userId);
  }
}
