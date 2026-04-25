import { supabase } from '../lib/supabase';

export class StorageService {
  private static BUCKET_NAME = 'vux-assets';

  /**
   * Uploads an image to Supabase storage and returns the public URL
   */
  static async uploadImage(file: File, path: string): Promise<string> {
    if (!supabase.storage) {
      throw new Error('Supabase Storage is not initialized properly. Check your environment variables.');
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
    const filePath = `${path}/${fileName}`;

    // Enable upsert to allow overwriting existing files (vital for profile pictures)
    const { error: uploadError } = await supabase.storage
      .from(this.BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (uploadError) {
      console.error('Supabase Upload Error:', uploadError);
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    const { data } = supabase.storage
      .from(this.BUCKET_NAME)
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  static async uploadProfileImage(file: File, userId: string): Promise<string> {
    return this.uploadImage(file, `profiles/${userId}`);
  }

  static async uploadEventBanner(file: File, eventId: string): Promise<string> {
    return this.uploadImage(file, `events/${eventId}`);
  }
}
