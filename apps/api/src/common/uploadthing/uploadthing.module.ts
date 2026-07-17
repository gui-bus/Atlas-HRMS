import { Module, Global } from "@nestjs/common";
import { UploadthingService } from "./uploadthing.service";
import { UploadController } from "./upload.controller";

@Global()
@Module({
  controllers: [UploadController],
  providers: [UploadthingService],
  exports: [UploadthingService],
})
export class UploadthingModule {}
