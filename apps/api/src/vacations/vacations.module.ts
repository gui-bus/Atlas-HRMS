import { Module } from "@nestjs/common";
import { VacationsService } from "./vacations.service";
import { VacationsController } from "./vacations.controller";
import { LeavesController } from "./leaves.controller";
import { AuthModule } from "../auth/auth.module";
import { NotificationsModule } from "../notifications/notifications.module";
import { UploadthingModule } from "../common/uploadthing/uploadthing.module";

@Module({
  imports: [AuthModule, NotificationsModule, UploadthingModule],
  controllers: [VacationsController, LeavesController],
  providers: [VacationsService],
  exports: [VacationsService],
})
export class VacationsModule {}
