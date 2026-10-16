import React, { useState, useRef } from 'react';
import { Camera, Upload, Mic, Search, X, Image as ImageIcon, Sparkles, RefreshCw } from 'lucide-react';
import { CheckRequest, LanguageCode, SamplePack } from '../types';
import { SAMPLE_PACKS } from '../mockRegistry';

interface CheckFormProps {
  onCheck: (request: CheckRequest) => void;
  onPhotoUploaded: (file: File) => void;
  onOpenVoiceModal: () => void;
  isLoading: boolean;
  language: LanguageCode;
  activeQuery: string;
  onQueryChange: (q: string) => void;
  uploadedPhotoPreview: string | null;
  onClearPhoto: () => void;
  onSelectSample: (sample: SamplePack) => void;
}

export const CheckForm: React.FC<CheckFormProps> = ({
  onCheck,
  onPhotoUploaded,
  onOpenVoiceModal,
  isLoading,
  language,
  activeQuery,
  onQueryChange,
  uploadedPhotoPreview,
  onClearPhoto,
  onSelectSample,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleSubmitText = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = activeQuery.trim();
    if (!clean) return;

    // Detect if input looks like an NRN format (e.g., 04-1234 or A4-3290)
    const isNrnPattern = /^[A-Za-z0-9]{2,4}-[0-9]{4,6}$/i.test(clean) || /^[0-9]{2,4}-[0-9]{4,6}$/.test(clean);

    if (isNrnPattern) {
      onCheck({ nrn: clean });
    } else {
      onCheck({ product_name: clean });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      onPhotoUploaded(file);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 sm:p-5 space-y-4">
      {/* Title & Instructions */}
      <div>
        <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
          {language === 'pcm' ? 'Check your medicine pack' : 'Check a medicine against NAFDAC registry'}
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          {language === 'pcm'
            ? 'Snap pack photo, type di name or NRN, or use your voice.'
            : 'Verify registration details via camera photo, typed name/NRN, or voice.'}
        </p>
      </div>

      {/* INPUT 1: CAMERA OR UPLOAD (with capture="environment") */}
      <div className="space-y-2">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
          {language === 'pcm' ? '1. Snap or Upload Photo' : '1. Camera or Upload'}
        </label>

        {uploadedPhotoPreview ? (
          <div className="relative rounded-xl border-2 border-emerald-500 bg-emerald-50/40 p-2.5 flex items-center justify-between gap-3 animate-fade-in">
            <div className="flex items-center gap-3 min-w-0">
              <img
                src={uploadedPhotoPreview}
                alt="Pack preview"
                className="w-14 h-14 object-cover rounded-lg border border-emerald-300 shrink-0 bg-white shadow-xs"
              />
              <div className="min-w-0">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full mb-1">
                  <Camera className="w-3 h-3" />
                  {language === 'pcm' ? 'Photo uploaded' : 'Pack Photo Ready'}
                </span>
                <p className="text-xs text-slate-700 font-medium truncate">
                  Ready for registry cross-check
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClearPhoto}
              className="px-2.5 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg shrink-0 flex items-center gap-1 transition-colors"
              title="Retake photo"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{language === 'pcm' ? 'Retake' : 'Retake photo'}</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {/* Native Camera with capture="environment" */}
            <input
              type="file"
              ref={cameraInputRef}
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleFileChange}
            />
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="py-3 px-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl font-bold text-xs sm:text-sm flex flex-col items-center justify-center gap-1.5 shadow-xs transition-all active:scale-[0.98]"
            >
              <Camera className="w-5 h-5" />
              <span>{language === 'pcm' ? 'Snap Camera' : 'Snap Photo'}</span>
            </button>

            {/* Standard File Upload */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="py-3 px-3 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 border border-slate-200 rounded-xl font-bold text-xs sm:text-sm flex flex-col items-center justify-center gap-1.5 transition-all active:scale-[0.98]"
            >
              <Upload className="w-5 h-5 text-slate-600" />
              <span>{language === 'pcm' ? 'Upload Picture' : 'Upload Image'}</span>
            </button>
          </div>
        )}
      </div>

      <div className="relative flex py-1 items-center">
        <div className="flex-grow border-t border-slate-200"></div>
        <span className="shrink-0 px-2 text-[10px] uppercase font-bold text-slate-400 bg-white">
          {language === 'pcm' ? 'Or type / talk' : 'Or enter details'}
        </span>
        <div className="flex-grow border-t border-slate-200"></div>
      </div>

      {/* INPUT 2 & 3: TEXT BOX + VOICE RECORD BUTTON */}
      <div className="space-y-1.5">
        <label htmlFor="medicine-input" className="block text-xs font-bold uppercase tracking-wider text-slate-600">
          {language === 'pcm' ? '2 & 3. Type Name / NRN or Voice' : '2 & 3. Medicine Name or NRN + Voice'}
        </label>

        <form onSubmit={handleSubmitText} className="relative flex items-center">
          <div className="relative flex-1">
            <input
              id="medicine-input"
              type="text"
              value={activeQuery}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder={
                language === 'pcm'
                  ? 'E.g. Emzor Paracetamol or 04-1234'
                  : 'Enter name or NAFDAC No. (e.g. 04-1234)'
              }
              className="w-full pl-3.5 pr-20 py-3 bg-slate-50 border border-slate-300 focus:border-emerald-600 focus:bg-white rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none transition-colors"
            />

            {/* Clear Query Button */}
            {activeQuery && (
              <button
                type="button"
                onClick={() => onQueryChange('')}
                className="absolute right-10 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                aria-label="Clear input"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {/* INPUT 3: RECORD VOICE BUTTON */}
            <button
              type="button"
              onClick={onOpenVoiceModal}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg text-emerald-700 bg-emerald-50 hover:bg-emerald-100 active:bg-emerald-200 transition-colors"
              title={language === 'pcm' ? 'Record voice' : 'Record voice to search'}
              aria-label="Record voice to search"
            >
              <Mic className="w-4 h-4" />
            </button>
          </div>

          <button
            type="submit"
            disabled={!activeQuery.trim() || isLoading}
            className="ml-2 px-3.5 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center shrink-0 shadow-xs transition-colors"
          >
            <Search className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* QUICK PRESET SAMPLES (Ensures instant 1-tap testing without requiring a physical Nigerian pill pack) */}
      <div className="pt-2 border-t border-slate-100">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            {language === 'pcm' ? 'Test with sample packs:' : 'Quick Test Scenarios:'}
          </span>
          <span className="text-[10px] text-slate-400">Tap to load</span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {SAMPLE_PACKS.map((sample: any) => (
            <button
              key={sample.id}
              type="button"
              onClick={() => onSelectSample(sample)}
              className="text-left bg-slate-50 hover:bg-emerald-50 active:bg-emerald-100 border border-slate-200/90 hover:border-emerald-300 rounded-lg px-2.5 py-1.5 transition-all text-xs font-medium text-slate-700 flex items-center gap-1.5"
            >
              <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-sm border ${sample.badgeColor}`}>
                {sample.badge}
              </span>
              <span className="font-semibold text-slate-900">{sample.title}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
