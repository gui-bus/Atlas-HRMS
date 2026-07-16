import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsOptional } from "class-validator";

export class UpdateProfileDto {
  @ApiProperty({ example: "João", required: false })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiProperty({ example: "Silva", required: false })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiProperty({ example: "(11) 99999-9999", required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ example: "https://utfs.io/f/...jpg", required: false })
  @IsString()
  @IsOptional()
  avatarUrl?: string;
}
