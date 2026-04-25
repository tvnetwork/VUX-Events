/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useMemo } from 'react';
import QRCode from 'qrcode';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface VUXQRCodeProps {
  value: string;
  size?: number;
  className?: string;
  showMicrocopy?: boolean;
}

export function VUXQRCode({ value, size = 280, className, showMicrocopy = true }: VUXQRCodeProps) {
  // Generate QR matrix
  const matrix = useMemo(() => {
    const qr = QRCode.create(value, { errorCorrectionLevel: 'H' });
    const count = qr.modules.size;
    const data: boolean[][] = [];
    for (let i = 0; i < count; i++) {
        const row: boolean[] = [];
        for (let j = 0; j < count; j++) {
            row.push(qr.modules.get(i, j) === 1);
        }
        data.push(row);
    }
    return data;
  }, [value]);

  const moduleCount = matrix.length;
  const cellSize = size / moduleCount;

  // Identify position detection markers (7x7 squares at corners)
  const isPositionMarker = (row: number, col: number) => {
    if (row < 7 && col < 7) return true; // Top left
    if (row < 7 && col >= moduleCount - 7) return true; // Top right
    if (row >= moduleCount - 7 && col < 7) return true; // Bottom left
    return false;
  };

  // Identify center area for the "V" logo (roughly middle 5x5 - 7x7)
  const isCenterArea = (row: number, col: number) => {
    const margin = Math.floor(moduleCount * 0.35);
    return row >= margin && row < moduleCount - margin && 
           col >= margin && col < moduleCount - margin;
  };

  return (
    <div className={cn("relative group p-8 rounded-[48px] bg-black border border-white/10 shadow-2xl overflow-hidden", className)}>
        {/* Animated Background Aura */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-cyan-500/5 to-purple-600/10 opacity-50 group-hover:opacity-80 transition-opacity duration-1000" />
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-blue-500/10 blur-[120px] animate-pulse" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-purple-500/10 blur-[120px] animate-pulse [animation-delay:2s]" />

        {/* The QR UI Card */}
        <div className="relative z-10 flex flex-col items-center gap-8">
            <div className="relative p-6 rounded-[40px] bg-white/[0.02] border border-white/10 shadow-inner backdrop-blur-3xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
                
                <svg
                    width={size}
                    height={size}
                    viewBox={`0 0 ${size} ${size}`}
                    className="overflow-visible"
                >
                    <defs>
                        <linearGradient id="qr-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#3b82f6" />
                            <stop offset="50%" stopColor="#06b6d4" />
                            <stop offset="100%" stopColor="#a855f7" />
                        </linearGradient>
                        <filter id="glow">
                            <feGaussianBlur stdDeviation="1.5" result="blur" />
                            <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>
                    </defs>

                    {/* QR Modules (Dots) */}
                    {matrix.map((row, r) => 
                        row.map((active, c) => {
                            if (!active || isPositionMarker(r, c) || isCenterArea(r, c)) return null;

                            // Custom "Structured" Pattern - small rounded rects or dots
                            const x = c * cellSize;
                            const y = r * cellSize;
                            const dotSize = cellSize * 0.85;
                            const offset = (cellSize - dotSize) / 2;

                            return (
                                <rect
                                    key={`${r}-${c}`}
                                    x={x + offset}
                                    y={y + offset}
                                    width={dotSize}
                                    height={dotSize}
                                    rx={dotSize * 0.4}
                                    fill="url(#qr-gradient)"
                                    opacity={0.8}
                                />
                            );
                        })
                    )}

                    {/* Orbital Corner Markers */}
                    {[
                        { x: 0, y: 0 },
                        { x: (moduleCount - 7) * cellSize, y: 0 },
                        { x: 0, y: (moduleCount - 7) * cellSize }
                    ].map((pos, i) => {
                        const centerX = pos.x + (3.5 * cellSize);
                        const centerY = pos.y + (3.5 * cellSize);
                        const outerRadius = 3 * cellSize;
                        const innerRadius = 1.2 * cellSize;

                        return (
                            <g key={i}>
                                {/* Outer Orbital Ring */}
                                <circle 
                                    cx={centerX} cy={centerY} r={outerRadius}
                                    fill="none" stroke="url(#qr-gradient)" strokeWidth={cellSize * 0.8}
                                    className="opacity-90"
                                />
                                {/* Middle Glow Ring */}
                                <circle 
                                    cx={centerX} cy={centerY} r={outerRadius}
                                    fill="none" stroke="white" strokeWidth={1}
                                    opacity={0.1}
                                />
                                {/* Inner Orb */}
                                <circle 
                                    cx={centerX} cy={centerY} r={innerRadius}
                                    fill="url(#qr-gradient)"
                                    filter="url(#glow)"
                                />
                            </g>
                        );
                    })}

                    {/* Center VUX Logo integration with Glassmorphism */}
                    <g transform={`translate(${size/2 - 25}, ${size/2 - 25})`}>
                         <rect 
                            width="50" height="50" rx="15" 
                            fill="white" fillOpacity="0.05" 
                            stroke="white" strokeOpacity="0.1" 
                            strokeWidth="1"
                         />
                         <path 
                            d="M15 15L25 35L35 15" 
                            stroke="url(#qr-gradient)" 
                            strokeWidth="4" 
                            strokeLinecap="round" strokeLinejoin="round" 
                            fill="none"
                            filter="url(#glow)"
                         />
                    </g>
                </svg>
            </div>

            {showMicrocopy && (
                <div className="flex flex-col items-center gap-2">
                    <p className="text-[10px] font-black uppercase tracking-[0.6em] text-white/30 animate-pulse">Scan to enter VUX</p>
                    <div className="h-px w-12 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                </div>
            )}
        </div>
    </div>
  );
}
