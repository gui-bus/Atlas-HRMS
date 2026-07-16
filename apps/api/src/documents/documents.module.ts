import { Module } from "@nestjs/common";
import { DocumentsService } from "./documents.service";
import { DocumentsController } from "./documents.controller";
import { AuthModule } from "../auth/auth.module";
import { UploadthingModule } from "../common/uploadthing/uploadthing.module";

@Module({
  imports: [AuthModule, UploadthingModule],
  controllers: [DocumentsController],
  providers: [DocumentsService],
  exports: [DocumentsService],
})
export class DocumentsModule {}
