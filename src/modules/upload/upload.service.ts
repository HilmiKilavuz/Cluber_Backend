import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { Readable } from 'stream';

export interface UploadResult {
  url: string;
  publicId: string;
}

/**
 * Upload Service
 *
 * Configures Cloudinary on initialization and provides
 * a method to upload file buffers received from multer.
 *
 * The file buffer is piped through a readable stream directly
 * to Cloudinary's upload_stream — no temp files created.
 */
@Injectable()
export class UploadService {
  constructor(private readonly config: ConfigService) {
    // Configure Cloudinary SDK from environment variables
    cloudinary.config({
      cloud_name: this.config.getOrThrow<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.config.getOrThrow<string>('CLOUDINARY_API_KEY'),
      api_secret: this.config.getOrThrow<string>('CLOUDINARY_API_SECRET'),
    });
  }

  /**
   * Uploads a multer file buffer to Cloudinary.
   * Returns the secure CDN URL and the public_id for future deletion.
   */
  async uploadToCloudinary(
    file: Express.Multer.File,
  ): Promise<UploadResult> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'cluber',
          resource_type: 'image',
          transformation: [
            { quality: 'auto', fetch_format: 'auto' }, // auto-format optimization
          ],
        },
        (error: Error | undefined, result: UploadApiResponse | undefined) => {
          if (error || !result) {
            reject(
              new InternalServerErrorException(
                'Failed to upload image to Cloudinary.',
              ),
            );
          } else {
            resolve({
              url: result.secure_url,
              publicId: result.public_id,
            });
          }
        },
      );

      // Pipe the in-memory buffer to Cloudinary's upload stream
      const readable = new Readable();
      readable.push(file.buffer);
      readable.push(null);
      readable.pipe(uploadStream);
    });
  }
}
