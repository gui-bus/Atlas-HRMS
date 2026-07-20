import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { UTApi } from "uploadthing/server";

@Injectable()
export class UploadthingService {
  private utapi: UTApi;

  constructor() {
    
    this.utapi = new UTApi();
  }

  
  async uploadFile(file: any) {
    try {
      let fileToUpload = file;
      if (file.buffer) {
        fileToUpload = new File([file.buffer], file.originalname, {
          type: file.mimetype,
        });
      }
      const response = await this.utapi.uploadFiles(fileToUpload);
      if (Array.isArray(response)) {
        return response[0];
      }
      return response;
    } catch (error: any) {
      throw new InternalServerErrorException(
        `Falha no upload do arquivo para o UploadThing: ${error.message}`,
      );
    }
  }

  
  async deleteFile(fileKey: string) {
    try {
      await this.utapi.deleteFiles(fileKey);
      return { success: true };
    } catch (error: any) {
      throw new InternalServerErrorException(
        `Falha ao excluir arquivo no UploadThing: ${error.message}`,
      );
    }
  }
}
