/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Mail, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';

interface EmailStepProps {
  email: string;
  setEmail: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
}

export function EmailStep({ email, setEmail, onSubmit, loading }: EmailStepProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-3.5">
      <div className="relative group">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500 group-focus-within:text-blue-400 transition-colors">
          <Mail className="w-4 h-4" />
        </div>
        <input
          type="email"
          placeholder="name@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoFocus
          autoComplete="email"
          className="w-full h-12 pl-10 pr-4 bg-white/[0.03] border border-white/10 rounded-xl text-white placeholder:text-zinc-500 text-sm sm:text-base focus:outline-none focus:border-blue-500/70 focus:bg-white/[0.06] focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
        />
      </div>

      <Button
        type="submit"
        variant="kontyra"
        disabled={loading || !email.trim()}
        className="w-full h-12 rounded-xl text-sm font-semibold gap-2 shadow-lg shadow-blue-900/20 active:scale-[0.98] transition-all"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Sending code...</span>
          </>
        ) : (
          <>
            <span>Continue with Email</span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </Button>
    </form>
  );
}
