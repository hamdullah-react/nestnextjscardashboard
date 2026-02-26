import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class UploadService {
  private supabase: SupabaseClient;

  constructor(private config: ConfigService) {
    this.supabase = createClient(
      this.config.getOrThrow<string>('SUPABASE_URL'),
      this.config.getOrThrow<string>('SUPABASE_SERVICE_ROLE_KEY'),
    );
  }

  async upload(
    file: Express.Multer.File,
    folder = 'general',
    bucket = 'uploads',
  ): Promise<{ url: string }> {
    const sanitized = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    const path = `${folder}/${Date.now()}-${sanitized}`;

    const { error } = await this.supabase.storage
      .from(bucket)
      .upload(path, file.buffer, { contentType: file.mimetype });

    if (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }

    const {
      data: { publicUrl },
    } = this.supabase.storage.from(bucket).getPublicUrl(path);

    return { url: publicUrl };
  }

  async delete(url: string, bucket = 'uploads'): Promise<void> {
    const supabaseUrl = this.config.getOrThrow<string>('SUPABASE_URL');
    const prefix = `${supabaseUrl}/storage/v1/object/public/${bucket}/`;

    if (!url.startsWith(prefix)) {
      throw new Error('Invalid file URL');
    }

    const path = url.slice(prefix.length);

    const { error } = await this.supabase.storage.from(bucket).remove([path]);

    if (error) {
      throw new Error(`Delete failed: ${error.message}`);
    }
  }
}
