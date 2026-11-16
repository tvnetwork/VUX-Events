import { uploadImageToR2 } from '../lib/mediaUpload';
import { supabase } from '../lib/supabase';

export class StorageService {
  private static BUCKET_NAME = 'vux-assets';

  /**
   * Uploads an image to Kontyra Cloudflare R2 CDN (standard) with Supabase fallback
   */
  static async uploadImage(
    file: File, 
    path: string, 
    bucketName: string = this.BUCKET_NAME
  ): Promise<string> {
    // 1. Primary: Cloudflare R2 Media Architecture (Kontyra Standard)
    try {
      let folder: 'banners' | 'avatars' | 'waitlists' | 'general' = 'general';
      if (path.includes('events') || path.includes('banners')) folder = 'banners';
      else if (path.includes('profiles') || path.includes('avatars')) folder = 'avatars';
      else if (path.includes('waitlists')) folder = 'waitlists';

      const sanitizedEntityId = path.split('/').pop() || 'anonymous';
      const result = await uploadImageToR2(file, sanitizedEntityId, folder);
      if (result && result.url) {
        return result.url;
      }
    } catch (r2Err) {
      console.warn('[StorageService] Cloudflare R2 upload attempt encountered fallback:', r2Err);
    }

    // 2. Secondary fallback: Supabase Storage if configured
    if (supabase && supabase.storage) {
      try {
        const fileExt = file.name.split('.').pop() || 'jpg';
        const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
        const filePath = `${path}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from(bucketName)
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: true
          });

        if (!uploadError) {
          const { data } = supabase.storage.from(bucketName).getPublicUrl(filePath);
          if (data?.publicUrl) return data.publicUrl;
        }
      } catch (supabaseErr) {
        console.warn('[StorageService] Supabase upload fallback error:', supabaseErr);
      }
    }

    // 3. Last-resort fallback: Base64 data URL
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  static async uploadProfileImage(file: File, userId: string): Promise<string> {
    return this.uploadImage(file, `profiles/${userId}`);
  }

  static async uploadEventBanner(file: File, eventId: string): Promise<string> {
    return this.uploadImage(file, `events/${eventId}`);
  }

  static async uploadWaitlistCover(file: File, waitlistId: string): Promise<string> {
    return this.uploadImage(file, `waitlists/${waitlistId}`);
  }
}
