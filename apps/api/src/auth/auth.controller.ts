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
import {
  UserResponseDto,
  LoginResponseDto,
  RefreshResponseDto,
  LogoutResponseDto,
} from "./dto/responses.dto";
import {
  ValidationErrorResponseDto,
  ConflictErrorResponseDto,
  UnauthorizedErrorResponseDto,
} from "../common/dto/error-responses.dto";

@ApiTags("Auth")
@Controller("auth")
@ApiResponse({
  status: 400,
  description: "Dados de requisição inválidos no payload",
  type: ValidationErrorResponseDto,
})
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({ summary: "Cadastrar um novo usuário no sistema" })
  @ApiResponse({ status: 201, description: "Usuário criado com sucesso", type: UserResponseDto })
  @ApiResponse({
    status: 409,
    description: "E-mail já cadastrado no banco de dados",
    type: ConflictErrorResponseDto,
  })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post("login")
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Realizar login obtendo token de acesso e cookie de atualização" })
  @ApiResponse({ status: 200, description: "Login efetuado com sucesso", type: LoginResponseDto })
  @ApiResponse({
    status: 401,
    description: "Credenciais inválidas fornecidas",
    type: UnauthorizedErrorResponseDto,
  })
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) response: Response) {
    const result = await this.authService.login(dto);

    response.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return {
      user: result.user,
      accessToken: result.accessToken,
    };
  }

  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Renovar o token de acesso utilizando o refresh token do cookie" })
  @ApiResponse({ status: 200, description: "Token renovado com sucesso", type: RefreshResponseDto })
  @ApiResponse({
    status: 401,
    description: "Token de atualização inválido ou ausente",
    type: UnauthorizedErrorResponseDto,
  })
  async refresh(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
    const refreshToken = request.cookies?.refreshToken;
    if (!refreshToken) {
      throw new UnauthorizedException("Token de atualização ausente");
    }

    const result = await this.authService.refreshToken(refreshToken);

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
  @ApiResponse({ status: 200, description: "Logout concluído", type: LogoutResponseDto })
  async logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });
    return { success: true };
  }
}
