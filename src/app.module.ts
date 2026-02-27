import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { BrandModule } from './brand/brand.module';
import { UploadModule } from './upload/upload.module';
import { MediaModule } from './media/media.module';

@Module({
  imports: [ConfigModule.forRoot(), PrismaModule, BrandModule, UploadModule, MediaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
