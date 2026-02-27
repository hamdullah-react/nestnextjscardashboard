import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UploadService } from '../upload/upload.service';
import { CreateMediaDto } from './dto/create-media.dto';

@Injectable()
export class MediaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly uploadService: UploadService,
  ) {}

  create(dto: CreateMediaDto) {
    return this.prisma.media.create({ data: dto });
  }

  async findAll(
    search?: string,
    mimetype?: string,
    page?: number,
    limit?: number,
  ) {
    const where: Record<string, unknown> = {};

    if (search) {
      where.filename = { contains: search, mode: 'insensitive' };
    }

    if (mimetype) {
      where.mimetype = { startsWith: mimetype };
    }

    // If no pagination params, return all (for gallery picker)
    if (!page || !limit) {
      return this.prisma.media.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      });
    }

    const [data, total] = await Promise.all([
      this.prisma.media.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.media.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: number) {
    const media = await this.prisma.media.findUnique({ where: { id } });
    if (!media) {
      throw new NotFoundException(`Media #${id} not found`);
    }
    return media;
  }

  async findByUrl(url: string) {
    return this.prisma.media.findFirst({ where: { url } });
  }

  async remove(id: number) {
    const media = await this.findOne(id);

    try {
      await this.uploadService.delete(media.url);
    } catch {
      // best-effort — don't block deletion if file cleanup fails
    }

    return this.prisma.media.delete({ where: { id } });
  }
}
