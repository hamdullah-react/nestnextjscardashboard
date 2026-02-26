import {
  Controller,
  Post,
  Delete,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { UploadService } from './upload.service';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('signed-url')
  async createSignedUrl(
    @Body('filename') filename: string,
    @Body('contentType') contentType: string,
    @Body('folder') folder?: string,
    @Body('bucket') bucket?: string,
  ) {
    if (!filename || !contentType) {
      throw new BadRequestException('filename and contentType are required');
    }
    return this.uploadService.createSignedUploadUrl(
      filename,
      contentType,
      folder,
      bucket,
    );
  }

  @Delete()
  async delete(
    @Body('url') url: string,
    @Body('bucket') bucket?: string,
  ) {
    if (!url) {
      throw new BadRequestException('No URL provided');
    }
    await this.uploadService.delete(url, bucket);
    return { success: true };
  }
}
