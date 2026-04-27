/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Mail, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Logo } from '../Logo';

interface EmailStepProps {
  email: string;
  setEmail: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
}

export function EmailStep({ email, setEmail, onSubmit, loading }: EmailStepProps) {
  return (
    <div className="space-y-8 py-4">
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="relative group">
          <Input 
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="h-16 bg-white/[0.02] border-white/5 text-white placeholder:text-white/10 rounded-2xl px-14 focus:border-indigo-500/40 transition-all font-bold italic text-lg"
          />
          <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-white/10 group-focus-within:text-indigo-400 transition-colors" />
        </div>
        
        <Button 
          type="submit" 
          variant="vux"
          disabled={loading || !email}
          className="w-full h-16 text-sm font-black rounded-2xl group shadow-xl shadow-indigo-500/10"
        >
          {loading ? (
            <Loader2 className="w-6 h-6 animate-spin mx-auto" />
          ) : (
            <div className="flex items-center justify-center gap-3">
              <span>CONTINUE</span>
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-2" />
            </div>
          )}
        </Button>
      </form>
    </div>
  );
}
