import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { ThrottlerModule, ThrottlerGuard } from "@nestjs/throttler";
import { validateEnv } from "./common/env.validation";
import { CommonModule } from "./common/common.module";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { EmployeesModule } from "./employees/employees.module";
import { DepartmentsModule } from "./departments/departments.module";
import { PositionsModule } from "./positions/positions.module";
import { VacationsModule } from "./vacations/vacations.module";
import { DocumentsModule } from "./documents/documents.module";
import { RecruitmentModule } from "./recruitment/recruitment.module";
import { DashboardModule } from "./dashboard/dashboard.module";
import { AuditModule } from "./audit/audit.module";
import { NotificationsModule } from "./notifications/notifications.module";
import { UploadthingModule } from "./common/uploadthing/uploadthing.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 60 seconds
        limit: 100, // Limit each IP to 100 requests per ttl
      },
    ]),
    CommonModule,
    AuthModule,
    UsersModule,
    EmployeesModule,
    DepartmentsModule,
    PositionsModule,
    VacationsModule,
    DocumentsModule,
    RecruitmentModule,
    DashboardModule,
    AuditModule,
    NotificationsModule,
    UploadthingModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
