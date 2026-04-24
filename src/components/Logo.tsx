import { cn } from '../lib/utils';
import logoUrl from '../assets/logo.jpg';

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function Logo({ className, showText = true, size = 'md' }: LogoProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-16 h-16'
  };

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className={cn(
        "flex items-center justify-center overflow-hidden rounded-xl bg-white shadow-lg relative group transition-transform hover:scale-105",
        sizeClasses[size]
      )}>
        <img 
          src={logoUrl} 
          alt="VUX Events" 
          className="w-full h-full object-contain p-1"
          referrerPolicy="no-referrer"
        />
      </div>
      {showText && (
        <span className={cn(
          "font-black tracking-tighter italic uppercase text-white",
          size === 'lg' ? 'text-4xl' : size === 'md' ? 'text-xl' : 'text-lg'
        )}>
          VUX Events
        </span>
      )}
    </div>
  );
}
