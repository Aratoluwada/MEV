/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Header } from './components/Header';
import { PermanentDisclaimer } from './components/PermanentDisclaimer';
import { CheckForm } from './components/CheckForm';
import { ResultCard } from './components/ResultCard';
import { BasketDrawer } from './components/BasketDrawer';
import { VoiceModal } from './components/VoiceModal';
import { 
  CheckRequest, 
  CheckResponse, 
  LanguageCode, 
  BasketItem, 
  SamplePack 
} from './types';
import { checkMedicine, extractFromImage } from './api';
import { 
  AlertCircle, 
  RotateCcw, 
  Loader2, 
  ScanLine, 
  Sparkles, 
  BookOpen,
  HelpCircle,
  ShieldCheck
} from 'lucide-react';

export default function App() {
  const [language, setLanguage] = useState<LanguageCode>('en');
  const [activeQuery, setActiveQuery] = useState('');
  const [uploadedPhotoPreview, setUploadedPhotoPreview] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CheckResponse | null>(null);

  // Voice Modal State
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);

  // Medication Check Basket
  const [basket, setBasket] = useState<BasketItem[]>([]);
  const [isBasketOpen, setIsBasketOpen] = useState(false);

  // Core Check Handler
  const handlePerformCheck = async (req: CheckRequest) => {
    setIsLoading(true);
    setError(null);
    setLoadingMessage(
      language === 'pcm'
        ? 'Dey query NAFDAC Green Book snapshot...'
        : 'Querying NAFDAC Green Book registry snapshot...'
    );

    try {
      const payload: CheckRequest = {
        ...req,
        language,
      };

      const res = await checkMedicine(payload);
      setResult(res);
    } catch (err: any) {
      console.error('Check error:', err);
      setError(
        language === 'pcm'
          ? 'Network problem or system slow. Try again small time.'
          : 'Failed to verify registry snapshot. Please check your connection and retry.'
      );
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  // Image Upload & OCR Extraction Handler
  const handlePhotoUploaded = async (file: File) => {
    setUploadedFile(file);
    const previewUrl = URL.createObjectURL(file);
    setUploadedPhotoPreview(previewUrl);

    setIsLoading(true);
    setError(null);
    setLoadingMessage(
      language === 'pcm'
        ? 'Dey read text on top pack photo...'
        : 'Scanning packaging label & extracting NRN...'
    );

    try {
      const { extractedData } = await extractFromImage(file);
      if (extractedData.product_name) {
        setActiveQuery(extractedData.product_name);
      } else if (extractedData.nrn) {
        setActiveQuery(extractedData.nrn);
      }

      setLoadingMessage(
        language === 'pcm'
          ? 'Dey match extracted text with NAFDAC records...'
          : 'Cross-referencing extracted details against NAFDAC database...'
      );

      const res = await checkMedicine({
        ...extractedData,
        language,
      });
      setResult(res);
    } catch (err: any) {
      console.error('Image analysis error:', err);
      setError(
        language === 'pcm'
          ? 'Photo clear no reach to read text. Try snap again with good light.'
          : 'Unable to extract legible label text from image. Please retake with clearer lighting or type the name.'
      );
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  const handleClearPhoto = () => {
    if (uploadedPhotoPreview) {
      URL.revokeObjectURL(uploadedPhotoPreview);
    }
    setUploadedPhotoPreview(null);
    setUploadedFile(null);
  };

  const handleRetakePhoto = () => {
    handleClearPhoto();
    setResult(null);
    setError(null);
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
    setActiveQuery('');
    handleClearPhoto();
  };

  const handleSelectSample = (sample: SamplePack) => {
    setActiveQuery(sample.request.product_name || sample.request.nrn || '');
    handleClearPhoto();
    handlePerformCheck(sample.request);
  };

  const handleVoiceTranscript = (transcript: string) => {
    setActiveQuery(transcript);
    const isNrn = /^[A-Za-z0-9]{2,4}-[0-9]{4,6}$/i.test(transcript.trim());
    if (isNrn) {
      handlePerformCheck({ nrn: transcript.trim() });
    } else {
      handlePerformCheck({ product_name: transcript.trim() });
    }
  };

  const handleAddToBasket = (item: BasketItem) => {
    if (!basket.some((b) => b.id === item.id || (b.nrn === item.nrn && b.nrn !== 'N/A'))) {
      setBasket((prev) => [item, ...prev]);
    }
  };

  const handleRemoveFromBasket = (id: string) => {
    setBasket((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearBasket = () => {
    setBasket([]);
  };

  const isCurrentResultInBasket = Boolean(
    result &&
    basket.some(
      (b) =>
        b.nrn === result.matched_record?.nrn ||
        b.product_name === result.matched_record?.product_name ||
        b.product_name === result.extracted?.name
    )
  );

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* 1. Header with Language Toggle & Basket Counter */}
      <Header
        language={language}
        onLanguageChange={setLanguage}
        basketCount={basket.length}
        onOpenBasket={() => setIsBasketOpen(true)}
      />

      {/* 2. Permanent Disclaimer (Mandatory Regulatory Requirement) */}
      <PermanentDisclaimer language={language} />

      {/* 3. Main Container (Optimized for 360px mobile viewport) */}
      <main className="flex-1 max-w-md w-full mx-auto px-3.5 py-4 sm:px-4 sm:py-5 flex flex-col gap-4">
        
        {/* CHECK INPUT FORM */}
        <CheckForm
          onCheck={handlePerformCheck}
          onPhotoUploaded={handlePhotoUploaded}
          onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
          isLoading={isLoading}
          language={language}
          activeQuery={activeQuery}
          onQueryChange={setActiveQuery}
          uploadedPhotoPreview={uploadedPhotoPreview}
          onClearPhoto={handleClearPhoto}
          onSelectSample={handleSelectSample}
        />

        {/* LOADING STATE */}
        {isLoading && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center space-y-3 shadow-xs animate-fade-in">
            <div className="relative inline-flex items-center justify-center">
              <span className="w-12 h-12 rounded-full border-4 border-emerald-100 border-t-emerald-600 animate-spin" />
              <ScanLine className="w-5 h-5 text-emerald-600 absolute animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                {language === 'pcm' ? 'Dey verify with NAFDAC...' : 'Cross-checking with NAFDAC Registry...'}
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-[280px] mx-auto">
                {loadingMessage || (language === 'pcm' ? 'Hold on small make we check record.' : 'Comparing submitted data against active regulatory snapshot.')}
              </p>
            </div>
          </div>
        )}

        {/* ERROR STATE */}
        {error && !isLoading && (
          <div 
            className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-xs text-rose-900 flex items-start justify-between gap-3 shadow-xs animate-fade-in"
            role="alert"
          >
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-rose-950">
                  {language === 'pcm' ? 'Checking wahala' : 'Verification Error'}
                </p>
                <p className="mt-0.5 text-rose-800/90 leading-relaxed">{error}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setError(null);
                if (activeQuery) {
                  handlePerformCheck({ product_name: activeQuery });
                }
              }}
              className="p-1.5 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-lg shrink-0"
              title="Retry check"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* RESULT CARD STATE */}
        {result && !isLoading && (
          <ResultCard
            result={result}
            language={language}
            onReset={handleReset}
            onRetakePhoto={handleRetakePhoto}
            hasPhoto={Boolean(uploadedPhotoPreview)}
            onAddToBasket={handleAddToBasket}
            isAlreadyInBasket={isCurrentResultInBasket}
          />
        )}

        {/* INFORMATIONAL ACCORDION / REGULATORY GUIDELINES */}
        {!result && !isLoading && (
          <div className="bg-white/80 rounded-2xl border border-slate-200/80 p-4 text-xs text-slate-600 space-y-2.5">
            <div className="flex items-center gap-1.5 font-bold text-slate-800 text-[11px] uppercase tracking-wider">
              <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
              <span>{language === 'pcm' ? 'How NAFDAC Check dey work:' : 'How this verification works:'}</span>
            </div>
            <ul className="space-y-1.5 text-slate-600 pl-4 list-disc">
              <li>
                {language === 'pcm'
                  ? 'NRN na standard code wey NAFDAC dey give every approved medicine (e.g. 04-1234 or A4-3290).'
                  : 'NRN is the registered number issued by NAFDAC for licensed medicines (e.g., 04-1234 or A4-3290).'}
              </li>
              <li>
                {language === 'pcm'
                  ? 'If NRN balance but medicine name different, e fit mean say person copy di number put for another drug.'
                  : 'If the NRN is registered to a different drug name or formulation, a cloned or copied registration is flagged.'}
              </li>
              <li>
                {language === 'pcm'
                  ? 'Always check expiration date, manufacturer seal, and buy from licensed registered pharmacy.'
                  : 'Always inspect tamper-evident seals and purchase from licensed pharmacies.'}
              </li>
            </ul>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-4 px-4 text-center text-slate-400 text-[11px]">
        <div className="max-w-md mx-auto space-y-1">
          <p className="font-semibold text-slate-500">
            MEV • NAFDAC Green Book Snapshot Cross-Check
          </p>
          <p className="text-[10px] text-slate-400">
            {language === 'pcm'
              ? 'Regulatory check against 2024 NAFDAC dataset. Not a clinical laboratory analysis.'
              : 'Regulatory verification tool against official NAFDAC dataset snapshot. Not a clinical laboratory test.'}
          </p>
        </div>
      </footer>

      {/* VOICE SEARCH MODAL */}
      <VoiceModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onTranscriptReady={handleVoiceTranscript}
        language={language}
      />

      {/* MEDICATION BASKET & DUPLICATE INGREDIENT WARNING DRAWER */}
      <BasketDrawer
        isOpen={isBasketOpen}
        onClose={() => setIsBasketOpen(false)}
        items={basket}
        onRemoveItem={handleRemoveFromBasket}
        onClearBasket={handleClearBasket}
        language={language}
      />
    </div>
  );
}
