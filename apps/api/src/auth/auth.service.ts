import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "../common/prisma.service";

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(dto: any) {
    if (!dto.email || !dto.password) {
      throw new UnauthorizedException("Credenciais inválidas");
    }

    console.log(
      "AuthService.login dependencies check:",
      typeof this.prisma,
      typeof this.jwtService,
    );

    return {
      accessToken: "access_token_stub",
      refreshToken: "refresh_token_stub",
      user: { email: dto.email, role: "ADMIN" },
    };
  }

  async register(dto: any) {
    console.log("AuthService.register dependencies check:", typeof this.prisma);
    return { id: "user_id_stub", email: dto.email };
  }

  async refreshToken(token: string) {
    console.log(
      "AuthService.refreshToken dependencies check:",
      typeof this.jwtService,
      typeof token,
    );
    return {
      accessToken: `new_access_token_${token.substring(0, 5)}`,
      refreshToken: "new_refresh_token_stub",
    };
  }
}
