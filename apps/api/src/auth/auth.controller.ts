import {
  Controller,
  Post,
  Body,
  Req,
  Res,
  UnauthorizedException,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { Request, Response } from "express";
import { Throttle } from "@nestjs/throttler";
import { AuthService } from "./auth.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({ summary: "Cadastrar um novo usuário no sistema" })
  @ApiResponse({ status: 201, description: "Usuário criado com sucesso" })
  @ApiResponse({ status: 400, description: "Dados inválidos" })
  @ApiResponse({ status: 409, description: "E-mail já cadastrado" })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post("login")
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Realizar login obtendo token de acesso e cookie de atualização" })
  @ApiResponse({ status: 200, description: "Login efetuado com sucesso" })
  @ApiResponse({ status: 401, description: "Credenciais inválidas" })
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) response: Response) {
    const result = await this.authService.login(dto);

    // Save refresh token in a secure HttpOnly cookie
    response.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: true, // Requires HTTPS (should be true in production, works on localhost in dev)
      sameSite: "none", // Allows cross-site cookie sharing for separate Render domains
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days matching token expiration
    });

    return {
      user: result.user,
      accessToken: result.accessToken,
    };
  }

  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Renovar o token de acesso utilizando o refresh token do cookie" })
  @ApiResponse({ status: 200, description: "Token renovado com sucesso" })
  @ApiResponse({ status: 401, description: "Token de atualização inválido ou ausente" })
  async refresh(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
    const refreshToken = request.cookies?.refreshToken;
    if (!refreshToken) {
      throw new UnauthorizedException("Token de atualização ausente");
    }

    const result = await this.authService.refreshToken(refreshToken);

    // Rotate refresh token in cookie
    response.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return {
      accessToken: result.accessToken,
    };
  }

  @Post("logout")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Efetuar logout limpando o cookie de sessão" })
  @ApiResponse({ status: 200, description: "Logout concluído" })
  async logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });
    return { success: true };
  }
}
