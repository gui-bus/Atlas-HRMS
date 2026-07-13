import { Injectable, UnauthorizedException, ConflictException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { PrismaService } from "../common/prisma.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
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

    return user;
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email, deletedAt: null },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException("Credenciais inválidas");
    }

    // Check account lockout status
    if (user.lockoutUntil && user.lockoutUntil > new Date()) {
      const minutesLeft = Math.ceil((user.lockoutUntil.getTime() - Date.now()) / (60 * 1000));
      throw new UnauthorizedException(
        `Esta conta está bloqueada temporariamente. Tente novamente em ${minutesLeft} minutos.`,
      );
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      const updatedFailedAttempts = user.failedAttempts + 1;
      let lockoutUntil: Date | null = null;
      let message = "Credenciais inválidas";

      if (updatedFailedAttempts >= 10) {
        lockoutUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes lockout
        message = "Conta bloqueada por 30 minutos devido a 10 tentativas falhas consecutivas.";
      } else if (updatedFailedAttempts >= 5) {
        lockoutUntil = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes lockout
        message = "Conta bloqueada por 10 minutos devido a 5 tentativas falhas consecutivas.";
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
