import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UploadService } from '../upload/upload.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { Prisma } from '../../generated/prisma/client';

@Injectable()
export class BrandService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly uploadService: UploadService,
  ) {}

  create(dto: CreateBrandDto) {
    return this.prisma.brand.create({ data: dto as Prisma.BrandCreateInput });
  }

  async findAll(
    include?: string,
    search?: string,
    page = 1,
    limit = 10,
  ) {
    const includeRelations = this.parseInclude(include);

    // Build where clause for search
    let allBrands = await this.prisma.brand.findMany({
      include: includeRelations,
      orderBy: { id: 'desc' },
    });

    if (search) {
      const lower = search.toLowerCase();
      allBrands = allBrands.filter((brand) => {
        if (!brand.name || typeof brand.name !== 'object') return false;
        return Object.values(brand.name as Record<string, string>).some(
          (v) => typeof v === 'string' && v.toLowerCase().includes(lower),
        );
      });
    }

    const total = allBrands.length;
    const totalPages = Math.ceil(total / limit);
    const skip = (page - 1) * limit;
    const data = allBrands.slice(skip, skip + limit);

    return { data, total, page, limit, totalPages };
  }

  async findOne(id: number, include?: string) {
    const includeRelations = this.parseInclude(include);
    const brand = await this.prisma.brand.findUnique({
      where: { id },
      include: includeRelations,
    });
    if (!brand) {
      throw new NotFoundException(`Brand #${id} not found`);
    }
    return brand;
  }

  async findBySlug(slug: string, include?: string) {
    const includeRelations = this.parseInclude(include);
    const brand = await this.prisma.brand.findFirst({
      where: { slug },
      include: includeRelations,
    });
    if (!brand) {
      throw new NotFoundException(`Brand with slug "${slug}" not found`);
    }
    return brand;
  }

  async update(id: number, dto: UpdateBrandDto) {
    await this.findOne(id);
    return this.prisma.brand.update({
      where: { id },
      data: dto as Prisma.BrandUpdateInput,
    });
  }

  async remove(id: number) {
    const brand = await this.findOne(id);

    if (brand.logo) {
      try {
        await this.uploadService.delete(brand.logo as string);
      } catch {
        // best-effort — don't block deletion if file cleanup fails
      }
    }

    return this.prisma.brand.delete({ where: { id } });
  }

  private parseInclude(include?: string): Prisma.BrandInclude | undefined {
    if (!include) return undefined;
    const allowed = ['models', 'cars', 'carVariants'];
    const result: Prisma.BrandInclude = {};
    for (const rel of include.split(',')) {
      const trimmed = rel.trim();
      if (allowed.includes(trimmed)) {
        result[trimmed] = true;
      }
    }
    return Object.keys(result).length > 0 ? result : undefined;
  }
}
