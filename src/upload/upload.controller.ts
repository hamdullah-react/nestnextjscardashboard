import {
  Controller,
  Post,
  Delete,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/svg+xml',
  'image/gif',
  'application/pdf',
  'video/mp4',
  'video/webm',
];

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: MAX_SIZE },
      fileFilter: (_req, file, cb) => {
        if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(
            new BadRequestException(
              `File type ${file.mimetype} is not allowed`,
            ),
            false,
          );
        }
      },
    }),
  )
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body('folder') folder?: string,
    @Body('bucket') bucket?: string,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }
    return this.uploadService.upload(file, folder, bucket);
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
