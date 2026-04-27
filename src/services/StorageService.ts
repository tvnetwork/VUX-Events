import { supabase } from '../lib/supabase';

export class StorageService {
  private static BUCKET_NAME = 'vux-assets';

  /**
   * Uploads an image to Supabase storage and returns the public URL
   */
  static async uploadImage(file: File, path: string, bucketName: string = this.BUCKET_NAME): Promise<string> {
    if (!supabase.storage) {
      throw new Error('Supabase Storage is not initialized properly. Check your environment variables.');
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
    const filePath = `${path}/${fileName}`;

    // Enable upsert to allow overwriting existing files
    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (uploadError) {
      console.error('Supabase Upload Error:', uploadError);
      
      let errorMessage = uploadError.message;
      if (errorMessage.includes('bucket_not_found') || errorMessage.includes('Bucket not found')) {
        errorMessage = `Supabase bucket "${bucketName}" not found. Please ensure this bucket exists in your Supabase dashboard and is set to "Public".`;
      } else if (errorMessage.includes('row-level security')) {
        errorMessage = `Upload failed: Permission denied (RLS). 
        Please ensure your Supabase bucket "${bucketName}" has policies allowing anonymous or authenticated uploads.`;
      }
      
      throw new Error(errorMessage);
    }

    const { data } = supabase.storage
      .from(bucketName)
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
