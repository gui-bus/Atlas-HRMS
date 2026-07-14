import { Module, Global } from "@nestjs/common";
import { UploadthingService } from "./uploadthing.service";

@Global()
@Module({
  providers: [UploadthingService],
  exports: [UploadthingService],
})
export class UploadthingModule {}
