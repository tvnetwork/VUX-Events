/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Key, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';

interface PasskeyButtonProps {
  onClick: () => void;
  loading?: boolean;
}

export function PasskeyButton({ onClick, loading }: PasskeyButtonProps) {
  return (
    <Button 
      variant="vux"
      onClick={onClick}
      disabled={loading}
      className="w-full h-16 justify-center gap-4 rounded-2xl group relative overflow-hidden shadow-xl shadow-amber-500/10"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
      {loading ? (
        <Loader2 className="w-6 h-6 animate-spin" />
      ) : (
        <div className="relative shrink-0">
          <Key className="w-6 h-6 text-amber-400 transition-transform group-hover:rotate-12 group-hover:scale-110" />
          <div className="absolute inset-0 blur-[4px] bg-amber-400/40 group-hover:bg-amber-400/60" />
        </div>
      )}
      <span className="font-black uppercase tracking-widest relative z-10 text-sm">AUTHENTICATE WITH PASSKEY</span>
    </Button>
  );
}
