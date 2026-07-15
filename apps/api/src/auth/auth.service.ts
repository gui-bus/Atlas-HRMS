import { Injectable, UnauthorizedException, ConflictException, BadRequestException, NotFoundException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { PrismaService } from "../common/prisma.service";
import { AuditService } from "../audit/audit.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private auditService: AuditService,
  ) {}

  async register(dto: RegisterDto) {
    if (dto.password !== dto.confirmPassword) {
      throw new BadRequestException("As senhas não coincidem");
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException("E-mail já cadastrado");
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        role: dto.role || "EMPLOYEE",
      },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    // Log registration
    await this.auditService.logAction(
      user.id,
      "USER_REGISTER",
      `Usuário cadastrado com e-mail: ${dto.email} e cargo: ${dto.role || "EMPLOYEE"}`,
    );

    return user;
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email, deletedAt: null },
    });

    if (!user || !user.isActive) {
      // Log failed login due to invalid email
      await this.auditService.logAction(
        null,
        "USER_LOGIN_INVALID_EMAIL",
        `Tentativa de login malsucedida para e-mail inexistente ou inativo: ${dto.email}`,
      );
      throw new UnauthorizedException("Credenciais inválidas");
    }

    // Check account lockout status
    if (user.lockoutUntil && user.lockoutUntil > new Date()) {
      const minutesLeft = Math.ceil((user.lockoutUntil.getTime() - Date.now()) / (60 * 1000));
      // Log blocked attempt
      await this.auditService.logAction(
        user.id,
        "USER_LOGIN_LOCKED",
        `Tentativa de login negada. Conta bloqueada temporariamente.`,
      );
      throw new UnauthorizedException(
        `Esta conta está bloqueada temporariamente. Tente novamente em ${minutesLeft} minutos.`,
      );
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      const updatedFailedAttempts = user.failedAttempts + 1;
      let lockoutUntil: Date | null = null;
      let message = "Credenciais inválidas";
      let action = "USER_LOGIN_FAILURE";

      if (updatedFailedAttempts >= 10) {
        lockoutUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes lockout
        message = "Conta bloqueada por 30 minutos devido a 10 tentativas falhas consecutivas.";
        action = "USER_LOCKOUT_MAX";
      } else if (updatedFailedAttempts >= 5) {
        lockoutUntil = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes lockout
        message = "Conta bloqueada por 10 minutos devido a 5 tentativas falhas consecutivas.";
        action = "USER_LOCKOUT_WARN";
      } else {
        const remaining = 5 - updatedFailedAttempts;
        message = `Credenciais inválidas. Você tem mais ${remaining} tentativas antes do bloqueio da conta.`;
      }

      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          failedAttempts: updatedFailedAttempts,
          lockoutUntil,
        },
      });

      // Log failure/lockout
      await this.auditService.logAction(
        user.id,
        action,
        `Senha incorreta. Tentativa falha número ${updatedFailedAttempts}`,
      );

      throw new UnauthorizedException(message);
    }

    // Reset lockout parameters on success
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        failedAttempts: 0,
        lockoutUntil: null,
      },
    });

    // Log successful login
    await this.auditService.logAction(
      user.id,
      "USER_LOGIN_SUCCESS",
      `Login efetuado com sucesso para o e-mail: ${user.email}`,
    );

    const tokens = await this.generateTokens(user.id, user.email, user.role);

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      ...tokens,
    };
  }

  async refreshToken(token: string) {
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_REFRESH_SECRET || "super-secret-refresh-jwt-key",
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub, deletedAt: null },
      });

      if (!user || !user.isActive) {
        throw new UnauthorizedException("Usuário inválido ou inativo");
      }

      const tokens = await this.generateTokens(user.id, user.email, user.role);
      return tokens;
    } catch {
      throw new UnauthorizedException("Token de atualização inválido");
    }
  }

  async findMe(userId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
      include: {
        employee: {
          include: {
            personalData: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException("Usuário inválido ou inexistente");
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      employee: user.employee
        ? {
            id: user.employee.id,
            firstName: user.employee.firstName,
            lastName: user.employee.lastName,
            avatarUrl: user.employee.personalData?.avatarUrl || null,
          }
        : null,
    };
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email, deletedAt: null },
    });

    if (!user) {
      throw new NotFoundException("E-mail não cadastrado");
    }

    const crypto = await import("crypto");
    const token = crypto.randomBytes(20).toString("hex");
    const expiration = new Date();
    expiration.setMinutes(expiration.getMinutes() + 15); // 15 mins validity

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: token,
        resetTokenExp: expiration,
      },
    });

    try {
      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY || "re_TiJDQ5q8_CjTiDPPAUKxcEJYx29N1r5GF");
      await resend.emails.send({
        from: "onboarding@resend.dev",
        to: email,
        subject: "Atlas HRMS - Recuperação de Senha",
        html: `<p>Você solicitou a alteração de sua senha no Atlas HRMS.</p>
               <p>Use o seguinte token para redefinir sua senha: <strong>${token}</strong></p>
               <p>Este token expira em 15 minutos.</p>`,
      });
    } catch (err) {
      console.error("Falha ao enviar e-mail via Resend:", err);
    }

    return { message: "Token enviado para o e-mail informado" };
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExp: { gte: new Date() },
        deletedAt: null,
      },
    });

    if (!user) {
      throw new BadRequestException("Token inválido ou expirado");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExp: null,
        failedAttempts: 0,
        lockoutUntil: null,
      },
    });

    await this.auditService.logAction(
      user.id,
      "USER_PASSWORD_RESET",
      `Senha redefinida com sucesso para o e-mail ${user.email}`,
    );

    return { message: "Senha alterada com sucesso" };
  }

  private async generateTokens(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_SECRET || "super-secret-jwt-key",
        expiresIn: (process.env.JWT_EXPIRATION as any) || "15m",
      }),
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_REFRESH_SECRET || "super-secret-refresh-jwt-key",
        expiresIn: (process.env.JWT_REFRESH_EXPIRATION as any) || "7d",
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }
}
