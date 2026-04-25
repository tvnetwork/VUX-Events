import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getAvatarUrl(seed: string | undefined, version: number = 7) {
  const collections = [
    'fun-emoji',
    'bottts',
    'adventurer',
    'avataaars',
    'pixel-art',
    'notionists',
    'lorelei',
    'shapes',
    'big-smile',
    'micah'
  ];
  
  const s = seed || 'guest';
  
  // Simple hash to consistently pick a collection for the same seed
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    hash = s.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const index = Math.abs(hash) % collections.length;
  const collection = collections[index];
  
  return `https://api.dicebear.com/${version}.x/${collection}/svg?seed=${s}&backgroundColor=c084fc`;
}

export function formatDate(dateString: string | undefined | null, options?: Intl.DateTimeFormatOptions) {
  if (!dateString) return 'TBA';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'TBA';
  
  return date.toLocaleDateString('en-US', options || {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}
