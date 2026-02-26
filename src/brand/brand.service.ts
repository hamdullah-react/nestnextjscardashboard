import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { Prisma } from '../../generated/prisma/client';

@Injectable()
export class BrandService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateBrandDto) {
    return this.prisma.brand.create({ data: dto as Prisma.BrandCreateInput });
  }

  findAll(include?: string) {
    const includeRelations = this.parseInclude(include);
    return this.prisma.brand.findMany({ include: includeRelations });
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
    await this.findOne(id);
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
