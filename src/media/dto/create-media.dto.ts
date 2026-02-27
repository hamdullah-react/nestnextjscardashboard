export class CreateMediaDto {
  url: string;
  path: string;
  filename: string;
  mimetype: string;
  size: number;
  folder?: string;
  alt?: string;
}
