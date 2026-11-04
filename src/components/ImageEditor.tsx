import { useState, useCallback } from 'react';
import Cropper, { Area, Point } from 'react-easy-crop';
import { motion } from 'motion/react';
import { Check, X, RotateCw, Wand2 } from 'lucide-react';
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

    const croppedCanvas = document.createElement('canvas');
    const croppedCtx = croppedCanvas.getContext('2d');

    if (!croppedCtx) throw new Error('No 2d context');

    croppedCanvas.width = pixelCrop.width;
    croppedCanvas.height = pixelCrop.height;

    // Apply CSS-like filter effect to canvas
    if (filterClass.includes('grayscale')) {
      croppedCtx.filter = 'grayscale(100%) contrast(125%)';
    } else if (filterClass.includes('sepia')) {
      croppedCtx.filter = 'sepia(100%) contrast(110%) brightness(90%)';
    } else if (filterClass.includes('hue-rotate-240')) {
      croppedCtx.filter = 'hue-rotate(240deg) saturate(150%) contrast(125%)';
    } else if (filterClass.includes('hue-rotate-15')) {
      croppedCtx.filter = 'hue-rotate(15deg) saturate(50%) contrast(110%) brightness(110%)';
    } else if (filterClass.includes('saturate-0')) {
      croppedCtx.filter = 'contrast(150%) saturate(0%) brightness(75%)';
    }

    croppedCtx.drawImage(
      canvas,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );

    return new Promise((resolve, reject) => {
      croppedCanvas.toBlob((file) => {
        if (file) resolve(file);
        else reject(new Error('Canvas is empty'));
      }, 'image/jpeg', 0.9);
    });
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
      const croppedBlob = await getCroppedImg(image, croppedAreaPixels, rotation, activeFilter.class);
      onConfirm(croppedBlob);
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
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md overflow-hidden"
    >
      <div className="w-full max-w-5xl h-[94dvh] sm:h-[88vh] bg-[#0c0e17]/95 rounded-t-[28px] sm:rounded-2xl border-t sm:border border-white/10 overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-white/[0.08] flex items-center justify-between shrink-0 bg-[#0c0e17]">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">Crop & Filter Image</h3>
            <p className="text-xs text-zinc-400">Position and enhance your cover photo</p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={onCancel} variant="ghost" size="sm" className="rounded-xl h-9 px-3 text-xs text-zinc-400 hover:text-white">
              Cancel
            </Button>
            <Button onClick={handleConfirm} disabled={processing} variant="kontyra" size="sm" className="rounded-xl h-9 px-4 text-xs font-semibold gap-1.5 shadow-md shadow-blue-900/20">
              {processing ? 'Processing...' : <><Check className="w-3.5 h-3.5" /> Save</>}
            </Button>
          </div>
        </div>

        {/* Workspace */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Primary viewport */}
          <div className="flex-1 relative bg-black/60 min-h-[220px]">
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
                containerClassName: "bg-black/40",
                mediaClassName: activeFilter.class
              }}
            />
          </div>

          {/* Controls Bar / Sidebar */}
          <div className="w-full lg:w-72 border-t lg:border-t-0 lg:border-l border-white/[0.08] p-4 sm:p-6 space-y-4 overflow-y-auto bg-white/[0.02] shrink-0">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-zinc-400 font-semibold">
                <span>Zoom Level</span>
                <span className="font-mono text-zinc-500">{zoom.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                value={zoom}
                min={1}
                max={3}
                step={0.1}
                aria-labelledby="Zoom"
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full accent-blue-500 cursor-pointer"
              />
              
              <div className="pt-1">
                <Button 
                  onClick={() => setRotation((r) => r + 90)}
                  variant="ghost" 
                  size="sm"
                  className="w-full rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] h-9 text-xs text-zinc-300 font-medium"
                >
                  <RotateCw className="w-3.5 h-3.5 mr-1.5" /> Rotate 90°
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-400 block">Color Preset</label>
              <div className="flex lg:grid lg:grid-cols-2 gap-2 overflow-x-auto scrollbar-hide py-1">
                {FILTERS.map((f) => (
                  <button
                    key={f.name}
                    type="button"
                    onClick={() => setActiveFilter(f)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      activeFilter.name === f.name 
                        ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20" 
                        : "bg-white/[0.03] border border-white/[0.06] text-zinc-400 hover:text-white hover:bg-white/[0.06]"
                    }`}
                  >
                    {f.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
