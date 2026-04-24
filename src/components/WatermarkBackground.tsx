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
    "Entry",
    "Cool Shot Systems",
    "Tech Visionaries Network",
    "Professor",
    "Events"
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

  // We'll create a grid of these elements
  const pattern = [];
  for (let i = 0; i < 120; i++) {
    const word = words[i % words.length];
    const icon = icons[i % icons.length];
    pattern.push({ word, icon, id: i });
  }

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 opacity-[0.06] select-none">
      <div className="flex flex-wrap gap-x-32 gap-y-24 rotate-[-15deg] scale-125 origin-center justify-center p-20">
        {pattern.map((item, idx) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: [0.3, 0.6, 0.3],
              y: [0, -10, 0],
              x: [0, 5, 0]
            }}
            transition={{ 
              duration: 10 + (idx % 10), 
              repeat: Infinity, 
              delay: idx * 0.1,
              ease: "easeInOut" 
            }}
            className="flex items-center gap-4 whitespace-nowrap"
          >
            <div className="text-white">
              {item.icon}
            </div>
            <span className="text-2xl font-black tracking-tighter uppercase italic text-white leading-none">
              {item.word}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
