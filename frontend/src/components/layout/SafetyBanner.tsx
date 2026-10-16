import React from 'react';
import { AlertTriangle, ExternalLink } from 'lucide-react';
import { LanguageCode } from '../../types';

interface SafetyBannerProps {
  language: LanguageCode;
}

export const SafetyBanner: React.FC<SafetyBannerProps> = ({ language }) => {
  return (
    <aside 
      aria-label="Critical Regulatory Safety Notice"
      className="w-full bg-[#F5E947] border-b-2 sm:border-b-[3px] border-[#171717] px-3.5 py-2 sm:py-2.5 text-[#171717] text-xs sm:text-sm font-bold flex items-center justify-between gap-3"
    >
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="shrink-0 px-1.5 py-0.5 bg-[#171717] text-[#F5E947] text-[10px] font-mono uppercase tracking-wider font-extrabold">
            SAFETY NOTICE
          </span>
          <span className="truncate leading-tight font-heading sm:font-sans">
            {language === 'pcm' ? (
              <span>Dis tool dey check registration only, e no fit prove say dis exact pack authentic.</span>
            ) : (
              <span>This checks registration, not whether this exact pack is authentic.</span>
            )}
          </span>
        </div>
        <div className="hidden md:flex items-center gap-1 shrink-0 text-[11px] font-mono uppercase text-[#171717]/80">
          <span>INFORMATIONAL ONLY • NOT MEDICAL ADVICE</span>
        </div>
      </div>
    </aside>
  );
};
