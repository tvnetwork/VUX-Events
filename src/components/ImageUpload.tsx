import { useState, useRef } from 'react';
import { Upload, X, Loader2, Image as ImageIcon, Wand2 } from 'lucide-react';
import { StorageService } from '../services/StorageService';
import toast from 'react-hot-toast';
import { cn } from '../lib/utils';
import { ImageEditor } from './ImageEditor';
import { AnimatePresence } from 'motion/react';

interface ImageUploadProps {
  onUpload: (url: string) => void;
  defaultValue?: string;
  label?: string;
  bucket?: string;
  className?: string;
  aspect?: number;
}

export function ImageUpload({ onUpload, defaultValue, label, bucket = 'vux-assets', className, aspect = 16 / 9 }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(defaultValue);
  const [editingImage, setEditingImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size too large. Max 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setEditingImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleEditorConfirm = async (blob: Blob) => {
    setEditingImage(null);
    try {
      setUploading(true);
      // Create a file from blob for upload
      const file = new File([blob], 'edited_image.jpg', { type: 'image/jpeg' });
      const publicUrl = await StorageService.uploadImage(file, 'uploads', bucket);

      setPreview(publicUrl);
      onUpload(publicUrl);
      toast.success('Image uploaded successfully');
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast.error(error.message || 'Error uploading image');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    setPreview(undefined);
    onUpload('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className={cn("space-y-3", className)}>
      {label && <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 px-1">{label}</label>}
      
      <div 
        onClick={() => !preview && !uploading && fileInputRef.current?.click()}
        className={cn(
          "relative group cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed transition-all duration-500",
          preview ? "border-white/20 aspect-video" : "border-white/5 hover:border-indigo-500/30 h-32 flex items-center justify-center bg-white/[0.02]",
          uploading && "opacity-50 cursor-wait"
        )}
      >
        {preview ? (
          <>
            <img src={preview} alt="Preview" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
              <button 
                onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20"
              >
                <Upload className="w-4 h-4" />
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); removeImage(); }}
                className="w-10 h-10 rounded-xl bg-red-500/20 backdrop-blur-md flex items-center justify-center text-red-400 hover:bg-red-500/40"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </>
        ) : (
          <div className="text-center space-y-2 group-hover:scale-105 transition-transform duration-500">
            {uploading ? (
              <Loader2 className="w-6 h-6 text-indigo-500 animate-spin mx-auto" />
            ) : (
              <ImageIcon className="w-6 h-6 text-white/10 mx-auto" />
            )}
            <p className="text-[9px] font-black uppercase tracking-widest text-white/20">
              {uploading ? "TRANSFUSING DATA..." : "DROP OR CLICK TO UPLOAD"}
            </p>
          </div>
        )}
      </div>

      <input 
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        onClick={(e) => { (e.target as HTMLInputElement).value = ''; }}
        accept="image/*"
        className="hidden"
      />

      <AnimatePresence>
        {editingImage && (
          <ImageEditor
            image={editingImage}
            aspect={aspect}
            onConfirm={handleEditorConfirm}
            onCancel={() => setEditingImage(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
