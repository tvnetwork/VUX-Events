import { motion } from 'motion/react';
import { 
  Sparkles, 
  Zap, 
  Crown, 
  Star, 
  Trophy, 
  Cpu, 
  Globe, 
  Palette,
  Mic,
  Music,
  Camera,
  Ticket,
  MapPin,
  Users,
  Rocket,
  Flame
} from 'lucide-react';

export function WatermarkBackground() {
  const words = [
    "VUX Events",
    "Discovery",
    "Community",
    "Pulse",
    "Moments",
    "Tickets",
    "Social",
    "Live"
  ];

  const icons = [
    <Sparkles className="w-5 h-5" />,
    <Zap className="w-5 h-5" />,
    <Crown className="w-5 h-5" />,
    <Star className="w-5 h-5" />,
    <Trophy className="w-5 h-5" />,
    <Cpu className="w-5 h-5" />,
    <Globe className="w-5 h-5" />,
    <Palette className="w-5 h-5" />,
    <Mic className="w-5 h-5" />,
    <Music className="w-5 h-5" />,
    <Camera className="w-5 h-5" />,
    <Ticket className="w-5 h-5" />,
    <MapPin className="w-5 h-5" />,
    <Users className="w-5 h-5" />,
    <Rocket className="w-5 h-5" />,
    <Flame className="w-5 h-5" />
  ];

  // PERFORMANCE FIX: Reduce the massive number of DOM nodes from 120 to 30.
  // 120 continuously animating Framer Motion components causes severe CPU/GPU bottlenecking.
  const pattern = [];
  for (let i = 0; i < 30; i++) {
    const word = words[i % words.length];
    const icon = icons[i % icons.length];
    pattern.push({ word, icon, id: i });
  }

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-[1] select-none opacity-50">
      <div className="flex flex-wrap gap-x-32 gap-y-24 rotate-[-15deg] scale-125 origin-center justify-center p-20 min-w-[200vw] min-h-[200vh] -translate-x-1/4 -translate-y-1/4">
        {pattern.map((item, idx) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: [0.05, 0.1, 0.05],
            }}
            transition={{ 
              duration: 20 + (idx % 10), 
              repeat: Infinity, 
              delay: idx * 0.1,
              ease: "linear" 
            }}
            className="flex items-center gap-4 whitespace-nowrap"
          >
            <div className="text-white/30">
              {item.icon}
            </div>
            <span className="text-xl font-semibold tracking-widest uppercase text-white/20 leading-none">
              {item.word}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
