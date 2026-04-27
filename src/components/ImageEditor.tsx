import { useState, useCallback } from 'react';
import Cropper, { Area, Point } from 'react-easy-crop';
import { motion, AnimatePresence } from 'motion/react';
import { Check, X, RotateCw, Contrast, Sun, Ghost, Wand2 } from 'lucide-react';
import { Button } from './ui/Button';

interface ImageEditorProps {
  image: string;
  onConfirm: (blob: Blob) => void;
  onCancel: () => void;
  aspect?: number;
}

const FILTERS = [
  { name: 'None', class: '' },
  { name: 'Noir', class: 'grayscale contrast-125' },
  { name: 'Dracula', class: 'contrast-150 saturate-0 brightness-75' },
  { name: 'Arctic', class: 'saturate-50 contrast-110 brightness-110 hue-rotate-15' },
  { name: 'Vintage', class: 'sepia contrast-110 brightness-90' },
  { name: 'Ultraviolet', class: 'hue-rotate-240 saturate-150 contrast-125' }
];

export function ImageEditor({ image, onConfirm, onCancel, aspect = 16 / 9 }: ImageEditorProps) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [activeFilter, setActiveFilter] = useState(FILTERS[0]);
  const [processing, setProcessing] = useState(false);

  const onCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', (error) => reject(error));
      image.setAttribute('crossOrigin', 'anonymous');
      image.src = url;
    });

  const getCroppedImg = async (imageSrc: string, pixelCrop: Area, rotation: number, filterClass: string): Promise<Blob> => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) throw new Error('No 2d context');

    const rotRad = (rotation * Math.PI) / 180;
    const { width: bBoxWidth, height: bBoxHeight } = rotateSize(image.width, image.height, rotation);

    canvas.width = bBoxWidth;
    canvas.height = bBoxHeight;

    ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
    ctx.rotate(rotRad);
    ctx.translate(-image.width / 2, -image.height / 2);
    ctx.drawImage(image, 0, 0);

    const data = ctx.getImageData(pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height);

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;
    ctx.putImageData(data, 0, 0);

    // Apply Filter at final canvas level
    ctx.filter = filterToCanvasFilter(filterClass);
    ctx.drawImage(canvas, 0, 0);

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Canvas is empty'));
          return;
        }
        resolve(blob);
      }, 'image/jpeg', 0.95);
    });
  };

  const filterToCanvasFilter = (filterClass: string) => {
    let filter = '';
    if (filterClass.includes('grayscale')) filter += 'grayscale(100%) ';
    if (filterClass.includes('contrast-125')) filter += 'contrast(125%) ';
    if (filterClass.includes('contrast-150')) filter += 'contrast(150%) ';
    if (filterClass.includes('contrast-110')) filter += 'contrast(110%) ';
    if (filterClass.includes('brightness-75')) filter += 'brightness(75%) ';
    if (filterClass.includes('brightness-90')) filter += 'brightness(90%) ';
    if (filterClass.includes('brightness-110')) filter += 'brightness(110%) ';
    if (filterClass.includes('saturate-0')) filter += 'saturate(0%) ';
    if (filterClass.includes('saturate-50')) filter += 'saturate(50%) ';
    if (filterClass.includes('saturate-150')) filter += 'saturate(150%) ';
    if (filterClass.includes('sepia')) filter += 'sepia(100%) ';
    if (filterClass.includes('hue-rotate-15')) filter += 'hue-rotate(15deg) ';
    if (filterClass.includes('hue-rotate-240')) filter += 'hue-rotate(240deg) ';
    return filter || 'none';
  };

  const rotateSize = (width: number, height: number, rotation: number) => {
    const rotRad = (rotation * Math.PI) / 180;
    return {
      width: Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
      height: Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
    };
  };

  const handleConfirm = async () => {
    if (!croppedAreaPixels) return;
    try {
      setProcessing(true);
      const blob = await getCroppedImg(image, croppedAreaPixels, rotation, activeFilter.class);
      onConfirm(blob);
    } catch (e) {
      console.error(e);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl"
    >
      <div className="w-full max-w-5xl h-[90vh] bg-[#0b0b0f] rounded-[40px] border border-white/10 overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-8 border-b border-white/5 flex items-center justify-between">
           <div>
              <h3 className="text-2xl font-black italic uppercase tracking-tighter">IMAGE EDITOR</h3>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Crop and filter your photo</p>
           </div>
           <div className="flex gap-3">
              <Button onClick={onCancel} variant="ghost" className="rounded-2xl border-white/5 h-12 px-6">
                 <X className="w-4 h-4 mr-2" /> CANCEL
              </Button>
              <Button onClick={handleConfirm} disabled={processing} className="rounded-2xl bg-white text-black hover:bg-white/90 h-12 px-8 shadow-xl shadow-white/10">
                 {processing ? 'SAVING...' : <><Check className="w-4 h-4 mr-2" /> SAVE PHOTO</>}
              </Button>
           </div>
        </div>

        {/* Workspace */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
           {/* Primary viewport */}
           <div className="flex-1 relative bg-black/40">
              <Cropper
                image={image}
                crop={crop}
                zoom={zoom}
                rotation={rotation}
                aspect={aspect}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
                classes={{
                  containerClassName: "bg-black/20",
                  mediaClassName: activeFilter.class
                }}
              />
           </div>

           {/* Sidebar Controls */}
           <div className="w-full lg:w-80 border-l border-white/5 p-8 space-y-10 overflow-y-auto bg-white/[0.01]">
              <div className="space-y-6">
                 <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">CROP & SCALE</label>
                    <span className="text-[10px] font-mono text-white/20">{zoom.toFixed(2)}X</span>
                 </div>
                 <input
                   type="range"
                   value={zoom}
                   min={1}
                   max={3}
                   step={0.1}
                   aria-labelledby="Zoom"
                   onChange={(e) => setZoom(Number(e.target.value))}
                   className="w-full accent-white"
                 />
                 
                 <div className="flex gap-2">
                    <Button 
                      onClick={() => setRotation((r) => r + 90)}
                      variant="ghost" 
                      className="flex-1 rounded-2xl bg-white/5 hover:bg-white/10 h-12"
                    >
                       <RotateCw className="w-4 h-4 mr-2" /> ROTATE
                    </Button>
                 </div>
              </div>

              <div className="space-y-6">
                 <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">FILTERS</label>
                 <div className="grid grid-cols-2 gap-3">
                    {FILTERS.map((f) => (
                      <button
                        key={f.name}
                        onClick={() => setActiveFilter(f)}
                        className={`p-3 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all ${
                          activeFilter.name === f.name 
                            ? "bg-white text-black border-white" 
                            : "bg-white/5 border-white/5 text-white/40 hover:border-white/20"
                        }`}
                      >
                         {f.name}
                      </button>
                    ))}
                 </div>
              </div>

              <div className="p-6 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 space-y-4">
                 <div className="flex items-center gap-3">
                    <Wand2 className="w-4 h-4 text-indigo-400" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-300">Optimization</span>
                 </div>
                 <p className="text-[9px] font-medium text-indigo-300/60 leading-relaxed italic">
                   Images are automatically optimized for fast loading.
                 </p>
              </div>
           </div>
        </div>
      </div>
    </motion.div>
  );
}
