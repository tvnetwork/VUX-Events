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
      variant="glass"
      onClick={onClick}
      disabled={loading}
      className="w-full h-12 justify-center gap-3 border-white/5 bg-white/2 hover:bg-white/5 text-white/70 hover:text-white rounded-xl group"
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Key className="w-4 h-4 transition-transform group-hover:rotate-12" />
      )}
      <span className="font-bold">Sign in with Passkey</span>
    </Button>
  );
}
