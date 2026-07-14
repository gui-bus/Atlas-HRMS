import { Module } from "@nestjs/common";
import { VacationsService } from "./vacations.service";
import { VacationsController } from "./vacations.controller";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [AuthModule],
  controllers: [VacationsController],
  providers: [VacationsService],
  exports: [VacationsService],
})
export class VacationsModule {}
