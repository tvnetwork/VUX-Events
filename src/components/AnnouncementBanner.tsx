/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Megaphone, X, ArrowRight } from 'lucide-react';
import { SiteConfig, SiteConfigService } from '../services/SiteConfigService';
import { Link } from 'react-router-dom';

export function AnnouncementBanner() {
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    SiteConfigService.getConfig().then(setConfig);
  }, []);

  if (!config?.announcement?.enabled || !visible) return null;

  const isExternal = config.announcement.link?.startsWith('http');

  const content = (
    <div className="flex items-center gap-3">
      <Megaphone className="w-4 h-4 text-indigo-400 group-hover:rotate-12 transition-transform" />
      <span className="text-[10px] font-black uppercase tracking-[0.2em]">{config.announcement.text}</span>
      {config.announcement.link && <ArrowRight className="w-3 h-3 text-white/40 group-hover:translate-x-1 transition-transform" />}
    </div>
  );

  return (
    <motion.div 
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      className="bg-indigo-600/20 border-b border-indigo-500/20 relative group z-[70]"
    >
      <div className="max-w-[1400px] mx-auto px-6 h-12 flex items-center justify-between">
        <div className="flex-1 flex justify-center">
          {config.announcement.link ? (
            isExternal ? (
              <a href={config.announcement.link} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-400 transition-colors">
                {content}
              </a>
            ) : (
              <Link to={config.announcement.link} className="hover:text-indigo-400 transition-colors">
                {content}
              </Link>
            )
          ) : (
            content
          )}
        </div>
        
        <button 
          onClick={() => setVisible(false)}
          className="p-1 hover:bg-white/10 rounded-full transition-colors"
        >
          <X className="w-4 h-4 text-white/20" />
        </button>
      </div>
    </motion.div>
  );
}
