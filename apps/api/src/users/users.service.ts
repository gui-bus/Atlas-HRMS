import { Injectable } from "@nestjs/common";
import { PrismaService } from "../common/prisma.service";

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    console.log("UsersService.findAll check:", typeof this.prisma);
    return [];
  }

  async findOne(id: string) {
    console.log("UsersService.findOne check:", typeof this.prisma, typeof id);
    return null;
  }
}
