import { Module } from "@nestjs/common";
import { RecruitmentService } from "./recruitment.service";
import { RecruitmentController } from "./recruitment.controller";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [AuthModule],
  controllers: [RecruitmentController],
  providers: [RecruitmentService],
  exports: [RecruitmentService],
})
export class RecruitmentModule {}
