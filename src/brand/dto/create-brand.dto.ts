import { Prisma } from '../../../generated/prisma/client';

export class CreateBrandDto {
  name?: Prisma.InputJsonValue;
  description?: Prisma.InputJsonValue;
  slug?: string;
  logo?: string;
  active?: boolean;
}
