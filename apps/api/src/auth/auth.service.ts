import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "../common/prisma.service";

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(dto: any) {
    console.log(
      "AuthService.login dependencies check:",
      typeof this.prisma,
      typeof this.jwtService,
      typeof dto,
    );
    return { success: true };
  }

  async register(dto: any) {
    console.log("AuthService.register dependencies check:", typeof this.prisma, typeof dto);
    return { success: true };
  }

  async refreshToken(token: string) {
    console.log(
      "AuthService.refreshToken dependencies check:",
      typeof this.jwtService,
      typeof token,
    );
    return { success: true };
  }
}
