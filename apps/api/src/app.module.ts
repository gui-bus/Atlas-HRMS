import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
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

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
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
  ],
})
export class AppModule {}
