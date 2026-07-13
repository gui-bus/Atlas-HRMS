import "reflect-metadata";
import * as dotenv from "dotenv";
import * as path from "path";
import * as fs from "fs";

const apiEnvPath = path.join(process.cwd(), "apps/api/.env");
if (fs.existsSync(apiEnvPath)) {
  dotenv.config({ path: apiEnvPath });
} else {
  dotenv.config();
}

import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { apiReference } from "@scalar/nestjs-api-reference";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { AppModule } from "./app.module";
import { AllExceptionsFilter } from "./common/http-exception.filter";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable cookie parsing
  app.use(cookieParser());

  // Security headers with Content Security Policy for Scalar API Docs
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: [
            "'self'",
            "'unsafe-inline'",
            "cdn.jsdelivr.net",
            "unpkg.com",
            "fonts.googleapis.com",
          ],
          fontSrc: ["'self'", "fonts.gstatic.com", "cdn.jsdelivr.net", "unpkg.com"],
          imgSrc: ["'self'", "data:", "cdn.jsdelivr.net", "unpkg.com"],
          scriptSrc: [
            "'self'",
            "'unsafe-inline'",
            "cdn.jsdelivr.net",
            "unpkg.com",
            "'unsafe-eval'",
          ],
        },
      },
    }),
  );

  // Enable CORS with credentials support for frontend local dev
  app.enableCors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Global exception filter for rich error presentation
  app.useGlobalFilters(new AllExceptionsFilter());

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle("Atlas HRMS API")
    .setDescription("The Atlas HRMS Corporate API description")
    .setVersion("1.0")
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // Scalar API Docs
  app.use(
    "/docs",
    apiReference({
      spec: {
        content: document,
      },
    }),
  );

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`API Documentation available at: http://localhost:${port}/docs`);
}
bootstrap();
