import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { UTApi } from "uploadthing/server";

@Injectable()
export class UploadthingService {
  private utapi: UTApi;

  constructor() {
    // Under the hood, UTApi reads UPLOADTHING_TOKEN/UPLOADTHING_SECRET from process.env
    this.utapi = new UTApi();
  }

  /**
   * Faz o upload de um arquivo passando um Buffer ou File direto para o UploadThing.
   * Útil para controllers HTTP que recebem o arquivo via Multipart/form-data.
   */
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

  /**
   * Remove um arquivo do UploadThing usando a chave única do arquivo (fileKey).
   */
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
