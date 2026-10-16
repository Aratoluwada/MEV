import React from 'react';
import { Pill, ShoppingBag, Globe2 } from 'lucide-react';
import { LanguageCode } from '../types';

interface HeaderProps {
  language: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  basketCount: number;
  onOpenBasket: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  language,
  onLanguageChange,
  basketCount,
  onOpenBasket,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-between">
        {/* Brand / Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-xs font-black text-xs tracking-wider">
            MEV
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-slate-900 tracking-tight text-base leading-tight">
                MEV
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                NAFDAC Check
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium leading-none">
              {language === 'pcm' ? 'Medicine Verification' : 'Medicine Evidence & Verification'}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Language Toggle: EN / PCM */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-semibold">
            <button
              type="button"
              onClick={() => onLanguageChange('en')}
              className={`px-2 py-1 rounded-md transition-all ${
                language === 'en'
                  ? 'bg-white text-emerald-800 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Standard English"
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => onLanguageChange('pcm')}
              className={`px-2 py-1 rounded-md transition-all ${
                language === 'pcm'
                  ? 'bg-white text-emerald-800 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Nigerian Pidgin"
            >
              PCM
            </button>
          </div>

          {/* Basket Trigger */}
          <button
            type="button"
            onClick={onOpenBasket}
            aria-label="View Medication Basket"
            className="relative p-2 rounded-lg text-slate-700 hover:bg-slate-100 active:bg-slate-200 transition-colors border border-slate-200/60"
          >
            <ShoppingBag className="w-4 h-4 text-slate-800" />
            {basketCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-emerald-600 text-white font-extrabold text-[10px] w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white animate-scale-in">
                {basketCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
