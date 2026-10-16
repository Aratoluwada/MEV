import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, X, Volume2, Sparkles, Check } from 'lucide-react';
import { LanguageCode } from '../types';

interface VoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTranscriptReady: (transcript: string) => void;
  language: LanguageCode;
}

export const VoiceModal: React.FC<VoiceModalProps> = ({
  isOpen,
  onClose,
  onTranscriptReady,
  language,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(true);
  const [statusMessage, setStatusMessage] = useState('');
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (!isOpen) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
      setIsListening(false);
      setTranscript('');
      return;
    }

    // Check SpeechRecognition support
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      setStatusMessage(
        language === 'pcm'
          ? 'Your browser microphone API no dey ready. You fit click any of di voice phrases below.'
          : 'Speech recognition API is unavailable in this browser. You can select a spoken query below.'
      );
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = language === 'pcm' ? 'en-NG' : 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setStatusMessage(
          language === 'pcm'
            ? 'Dey speak now, we dey listen...'
            : 'Listening... speak the medicine name or NAFDAC number'
        );
      };

      recognition.onresult = (event: any) => {
        let currentText = '';
        for (let i = 0; i < event.results.length; i++) {
          currentText += event.results[i][0].transcript;
        }
        setTranscript(currentText);
      };

      recognition.onerror = (event: any) => {
        console.warn('SpeechRecognition error:', event.error);
        setIsListening(false);
        setStatusMessage(
          language === 'pcm'
            ? 'Microphone no catch word clear. Try again or pick one sample phrase.'
            : 'Could not capture voice audio. Tap below to speak again or use sample phrase.'
        );
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.warn('Speech recognition start failed:', err);
      setIsSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
    };
  }, [isOpen, language]);

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setTranscript('');
      try {
        recognitionRef.current.start();
      } catch {
        // Already started
      }
    }
  };

  const handleConfirm = () => {
    if (transcript.trim()) {
      onTranscriptReady(transcript.trim());
      onClose();
    }
  };

  const handleSelectSamplePhrase = (phrase: string) => {
    setTranscript(phrase);
    onTranscriptReady(phrase);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
      <div 
        className="w-full max-w-sm bg-white rounded-2xl p-5 shadow-2xl border border-slate-200 relative animate-slide-up"
        role="dialog"
        aria-modal="true"
        aria-labelledby="voice-search-heading"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center pt-2 pb-4">
          <div className="relative inline-flex items-center justify-center mb-4">
            {isListening && (
              <>
                <span className="absolute w-20 h-20 rounded-full bg-emerald-400/20 animate-ping" />
                <span className="absolute w-16 h-16 rounded-full bg-emerald-400/30 animate-pulse" />
              </>
            )}
            <button
              type="button"
              onClick={toggleListening}
              className={`w-14 h-14 rounded-full flex items-center justify-center text-white transition-all shadow-md relative z-10 ${
                isListening
                  ? 'bg-rose-500 hover:bg-rose-600 ring-4 ring-rose-200'
                  : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
            >
              {isListening ? <Mic className="w-6 h-6 animate-pulse" /> : <MicOff className="w-6 h-6" />}
            </button>
          </div>

          <h3 id="voice-search-heading" className="text-base font-bold text-slate-900">
            {language === 'pcm' ? 'Talk di Medicine Name' : 'Speak Medicine Name or NRN'}
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-[260px] mx-auto">
            {statusMessage ||
              (language === 'pcm'
                ? 'E.g. "Emzor Paracetamol" or "NAFDAC 04-1234"'
                : 'Say e.g. "Emzor Paracetamol" or NAFDAC number "04-1234"')}
          </p>
        </div>

        {/* Live Transcript Display */}
        <div className="min-h-[64px] bg-slate-50 border border-slate-200 rounded-xl p-3 text-center mb-4 flex items-center justify-center">
          {transcript ? (
            <p className="text-sm font-semibold text-slate-900 break-words italic">
              "{transcript}"
            </p>
          ) : (
            <p className="text-xs text-slate-400 italic">
              {isListening
                ? language === 'pcm'
                  ? 'Talk make we hear...'
                  : 'Listening for speech...'
                : language === 'pcm'
                ? 'Tap mic to talk'
                : 'Tap microphone to start'}
            </p>
          )}
        </div>

        {transcript ? (
          <button
            type="button"
            onClick={handleConfirm}
            className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition-colors mb-3"
          >
            <Check className="w-4 h-4" />
            {language === 'pcm' ? 'Use Dis Voice Search' : 'Search with Voice Input'}
          </button>
        ) : null}

        {/* Quick Voice Demo Suggestions */}
        <div className="pt-2 border-t border-slate-100">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            {language === 'pcm' ? 'Or tap quick spoken phrase:' : 'Or tap a sample spoken phrase:'}
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              'Emzor Paracetamol 500mg',
              '04-1234',
              'Lonart DS Tablets',
              'Amoxil 500mg'
            ].map((phrase) => (
              <button
                key={phrase}
                type="button"
                onClick={() => handleSelectSamplePhrase(phrase)}
                className="text-left text-xs bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 border border-slate-200/80 px-2.5 py-1.5 rounded-lg text-slate-700 transition-colors font-medium truncate flex items-center gap-1.5"
              >
                <Volume2 className="w-3 h-3 text-slate-400 shrink-0" />
                <span className="truncate">{phrase}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
