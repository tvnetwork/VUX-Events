import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export function Countdown({ targetDate, className = "", compact = false }: { targetDate: string; className?: string; compact?: boolean }) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +new Date(targetDate) - +new Date();
      let timeLeft: TimeLeft | null = null;

      if (difference > 0) {
        timeLeft = {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        };
      }

      setTimeLeft(timeLeft);
    };

    const timer = setInterval(calculateTimeLeft, 1000);
    calculateTimeLeft();

    return () => clearInterval(timer);
  }, [targetDate]);

  if (!timeLeft) return null;

  if (compact) {
    return (
      <div className={`flex gap-3 text-[10px] font-black italic tracking-tighter text-white ${className}`}>
        <span>{timeLeft.days}D</span>
        <span className="text-white/20">:</span>
        <span>{timeLeft.hours}H</span>
        <span className="text-white/20">:</span>
        <span>{timeLeft.minutes}M</span>
      </div>
    );
  }

  return (
    <div className={`flex gap-4 md:gap-8 ${className}`}>
      <CountdownItem value={timeLeft.days} label="DAYS" />
      <CountdownItem value={timeLeft.hours} label="HRS" />
      <CountdownItem value={timeLeft.minutes} label="MIN" />
      <CountdownItem value={timeLeft.seconds} label="SEC" />
    </div>
  );
}

function CountdownItem({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="relative group">
        <div className="absolute -inset-2 bg-indigo-500/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
        <AnimatePresence mode="wait">
          <motion.span
            key={value}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className="text-2xl md:text-5xl font-black italic tracking-tighter text-white tabular-nums relative block"
          >
            {value.toString().padStart(2, '0')}
          </motion.span>
        </AnimatePresence>
      </div>
      <span className="text-[8px] md:text-[10px] font-black tracking-[0.3em] text-white/40 mt-1 md:mt-2">{label}</span>
    </div>
  );
}
