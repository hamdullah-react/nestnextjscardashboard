import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

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

@Injectable()
export class UploadService {
  private supabase: SupabaseClient;
  private supabaseUrl: string;

  constructor(private config: ConfigService) {
    this.supabaseUrl = this.config.getOrThrow<string>('SUPABASE_URL');
    this.supabase = createClient(
      this.supabaseUrl,
      this.config.getOrThrow<string>('SUPABASE_SERVICE_ROLE_KEY'),
    );
  }

  async createSignedUploadUrl(
    filename: string,
    contentType: string,
    folder = 'general',
    bucket = 'uploads',
  ): Promise<{ signedUrl: string; path: string; publicUrl: string }> {
    if (!ALLOWED_MIME_TYPES.includes(contentType)) {
      throw new BadRequestException(
        `File type ${contentType} is not allowed`,
      );
    }

    const sanitized = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
    const path = `${folder}/${Date.now()}-${sanitized}`;

    const { data, error } = await this.supabase.storage
      .from(bucket)
      .createSignedUploadUrl(path);

    if (error || !data) {
      throw new Error(`Failed to create signed URL: ${error?.message}`);
    }

    const {
      data: { publicUrl },
    } = this.supabase.storage.from(bucket).getPublicUrl(path);

    return {
      signedUrl: data.signedUrl,
      path,
      publicUrl,
    };
  }

  async delete(url: string, bucket = 'uploads'): Promise<void> {
    const prefix = `${this.supabaseUrl}/storage/v1/object/public/${bucket}/`;

    if (!url.startsWith(prefix)) {
      throw new BadRequestException('Invalid file URL');
    }

    const path = url.slice(prefix.length);

    const { error } = await this.supabase.storage.from(bucket).remove([path]);

    if (error) {
      throw new Error(`Delete failed: ${error.message}`);
    }
  }
}
