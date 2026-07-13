import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from "@nestjs/common";
import { Response } from "express";

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    // Build a descriptive, structured error response
    const responseBody =
      exception instanceof HttpException
        ? exception.getResponse()
        : {
            statusCode: status,
            error: exception?.name || "InternalServerError",
            message: exception?.message || "Erro interno no servidor",
            stack: process.env.NODE_ENV !== "production" ? exception?.stack : undefined,
          };

    response
      .status(status)
      .json(
        typeof responseBody === "string"
          ? { statusCode: status, message: responseBody }
          : responseBody,
      );
  }
}
