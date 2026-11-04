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
      type="button"
      variant="passkey"
      onClick={onClick}
      disabled={loading}
      className="w-full h-12 rounded-xl flex items-center justify-between px-4 text-sm font-medium border border-amber-500/20 bg-amber-500/[0.06] hover:bg-amber-500/[0.12] active:scale-[0.98] transition-all duration-200"
    >
      <div className="flex items-center gap-2.5">
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
        ) : (
          <Key className="w-4 h-4 text-amber-400" />
        )}
        <span className="text-white text-xs sm:text-sm font-semibold">Sign in with Passkey</span>
      </div>
      <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
        Biometric
      </span>
    </Button>
  );
}
