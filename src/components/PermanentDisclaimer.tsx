import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { LanguageCode } from '../types';

interface PermanentDisclaimerProps {
  language: LanguageCode;
}

export const PermanentDisclaimer: React.FC<PermanentDisclaimerProps> = ({ language }) => {
  return (
    <aside 
      aria-label="Regulatory Disclaimer"
      className="w-full bg-amber-50 border-y border-amber-200/80 px-3.5 py-2.5 sm:px-4 text-amber-900 text-xs sm:text-sm font-medium flex items-center gap-2.5 shadow-xs"
    >
      <div className="shrink-0 p-1 bg-amber-100/90 rounded-md text-amber-800">
        <ShieldAlert className="w-4 h-4 text-amber-700" aria-hidden="true" />
      </div>
      <div className="leading-snug">
        <span className="font-bold tracking-tight">Notice: </span>
        {language === 'pcm' ? (
          <span>
            Dis tool dey check registration for NAFDAC Green Book record only, e no fit prove say dis exact pack authentic.
          </span>
        ) : (
          <span>
            This checks registration, not whether this exact pack is authentic.
          </span>
        )}
      </div>
    </aside>
  );
};
