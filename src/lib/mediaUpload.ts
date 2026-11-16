/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Kontyra Brand Standard: 07-cloudflare-r2-media-storage.md
 * Dedicated App Folder: images/vux/
 * Public Edge CDN: https://pub-ca36ec775bc2411db57b100352558ed3.r2.dev
 */

export interface UploadResult {
  url: string;
  objectKey: string;
  fileName: string;
  contentType: string;
  size: number;
}

export async function uploadImageToR2(
  file: File,
  userId: string = 'anonymous',
  folder: 'banners' | 'avatars' | 'waitlists' | 'general' = 'general'
): Promise<UploadResult> {
  const base64Data = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.includes(',') ? result.split(',')[1] : result;
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const response = await fetch('/api/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fileBase64: base64Data,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      userId,
      folder
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Upload failed' }));
    throw new Error(errorData.error || `Upload failed with HTTP ${response.status}`);
  }

  return await response.json();
}
