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
      <div className="flex flex-col items-center text-center space-y-6">
        <Logo showText={false} className="scale-150" />
        <div className="space-y-1">
          <h2 className="text-2xl font-black tracking-tight text-white uppercase italic">Welcome to VUX Events</h2>
          <p className="text-white/40 text-sm font-medium">Enter your email to join the community</p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="relative group">
          <Input 
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="h-14 bg-white/5 border-white/10 text-white placeholder:text-white/20 rounded-xl px-12 group-focus-within:border-purple-400/50 transition-all font-medium"
          />
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-purple-400 transition-colors" />
        </div>
        
        <Button 
          type="submit"
          disabled={loading || !email}
          className="w-full h-14 text-base font-black bg-white text-black hover:bg-white/90 rounded-2xl shadow-xl shadow-white/5 group"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin mx-auto text-black" />
          ) : (
            <div className="flex items-center justify-center gap-2">
              <span>Continue</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
          )}
        </Button>
      </form>
    </div>
  );
}
