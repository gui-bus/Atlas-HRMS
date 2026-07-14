import { Module } from "@nestjs/common";
import { PositionsService } from "./positions.service";
import { PositionsController } from "./positions.controller";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [AuthModule],
  controllers: [PositionsController],
  providers: [PositionsService],
  exports: [PositionsService],
})
export class PositionsModule {}
