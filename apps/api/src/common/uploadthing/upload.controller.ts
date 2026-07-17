import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { UploadthingService } from "./uploadthing.service";
import { ApiConsumes, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

@ApiTags("upload")
@Controller("upload")
export class UploadController {
  constructor(private readonly uploadthingService: UploadthingService) {}

  @Post()
  @UseInterceptors(FileInterceptor("file"))
  @ApiConsumes("multipart/form-data")
  @ApiOperation({ summary: "Upload a file to UploadThing" })
  @ApiResponse({ status: 201, description: "File uploaded successfully" })
  async uploadFile(@UploadedFile() file?: any) {
    if (!file) {
      throw new BadRequestException("Nenhum arquivo enviado");
    }
    try {
      const result = await this.uploadthingService.uploadFile(file);
      const url = result?.data?.url ?? result?.url;
      if (!url) {
        throw new BadRequestException("Falha ao obter URL do upload");
      }
      return { url };
    } catch (error: any) {
      throw new BadRequestException(error.message || "Erro no upload");
    }
  }
}
