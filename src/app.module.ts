import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { BrandModule } from './brand/brand.module';

@Module({
  imports: [ConfigModule.forRoot(), PrismaModule, BrandModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
