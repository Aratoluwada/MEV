import React, { useState } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  AlertCircle, 
  Clock, 
  Check, 
  X, 
  Plus, 
  CheckCircle2, 
  ArrowRight, 
  RefreshCw,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  FileText
} from 'lucide-react';
import { CheckResponse, LanguageCode, VerdictType, BasketItem } from '../types';

interface ResultCardProps {
  result: CheckResponse;
  language: LanguageCode;
  onReset: () => void;
  onRetakePhoto?: () => void;
  hasPhoto: boolean;
  onAddToBasket: (item: BasketItem) => void;
  isAlreadyInBasket: boolean;
}

export const ResultCard: React.FC<ResultCardProps> = ({
  result,
  language,
  onReset,
  onRetakePhoto,
  hasPhoto,
  onAddToBasket,
  isAlreadyInBasket,
}) => {
  const [addedAnimation, setAddedAnimation] = useState(false);
  const [showRawDetails, setShowRawDetails] = useState(false);

  // Verdict configuration - Strictly NO "genuine" or "fake" phrasing
  const getVerdictConfig = (verdict: VerdictType) => {
    switch (verdict) {
      case 'REGISTERED_MATCH':
        return {
          title: language === 'pcm' ? 'E Set: Details Match' : 'Registered • Details Match',
          subtitle: language === 'pcm' 
            ? 'NAFDAC registration active and pack details agree with record' 
            : 'Active registration found with consistent packaging fields',
          bgColor: 'bg-emerald-50',
          borderColor: 'border-emerald-300',
          textColor: 'text-emerald-950',
          badgeBg: 'bg-emerald-600',
          badgeText: 'text-white',
          icon: ShieldCheck,
          iconColor: 'text-emerald-600',
        };
      case 'REGISTERED_MISMATCH':
        return {
          title: language === 'pcm' ? 'K-Leg Dey: Discrepancy Flagged' : 'Registered • Discrepancy Flagged',
          subtitle: language === 'pcm'
            ? 'Dis NRN dey registered, but pack details conflict with official record'
            : 'Registration exists, but submitted packaging details conflict with registry',
          bgColor: 'bg-rose-50/80',
          borderColor: 'border-rose-300',
          textColor: 'text-rose-950',
          badgeBg: 'bg-rose-600',
          badgeText: 'text-white',
          icon: AlertTriangle,
          iconColor: 'text-rose-600',
        };
      case 'EXPIRED':
        return {
          title: language === 'pcm' ? 'Registration Don Expire' : 'Registration Inactive / Expired',
          subtitle: language === 'pcm'
            ? 'Dis medicine registration authorization don elapse'
            : 'Marketing authorization has expired and is not active in this snapshot',
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-300',
          textColor: 'text-amber-950',
          badgeBg: 'bg-amber-600',
          badgeText: 'text-white',
          icon: Clock,
          iconColor: 'text-amber-600',
        };
      case 'NOT_FOUND':
      default:
        return {
          title: language === 'pcm' ? 'No Dey Record: Not Found' : 'Not Found in Registry Snapshot',
          subtitle: language === 'pcm'
            ? 'We no see dis NRN or medicine name inside Green Book snapshot'
            : 'No matching regulatory record found in the Green Book snapshot',
          bgColor: 'bg-slate-50',
          borderColor: 'border-slate-300',
          textColor: 'text-slate-900',
          badgeBg: 'bg-slate-700',
          badgeText: 'text-white',
          icon: AlertCircle,
          iconColor: 'text-slate-600',
        };
    }
  };

  const config = getVerdictConfig(result.verdict);
  const VerdictIcon = config.icon;

  // Build field comparison list
  const comparisonList: {
    label: string;
    submitted: string;
    registry: string;
    matches: boolean;
    notes?: string;
  }[] = [];

  if (result.comparison) {
    if (result.comparison.nrn) {
      comparisonList.push({
        label: 'NRN (Reg No.)',
        submitted: String(result.comparison.nrn.submitted || 'N/A'),
        registry: String(result.comparison.nrn.registry || 'N/A'),
        matches: result.comparison.nrn.matches,
        notes: result.comparison.nrn.notes,
      });
    }
    if (result.comparison.product_name) {
      comparisonList.push({
        label: 'Product Name',
        submitted: String(result.comparison.product_name.submitted || 'N/A'),
        registry: String(result.comparison.product_name.registry || 'N/A'),
        matches: result.comparison.product_name.matches,
        notes: result.comparison.product_name.notes,
      });
    }
    if (result.comparison.active_ingredients) {
      const sub = Array.isArray(result.comparison.active_ingredients.submitted) 
        ? result.comparison.active_ingredients.submitted.join(', ')
        : String(result.comparison.active_ingredients.submitted || 'N/A');
      const reg = Array.isArray(result.comparison.active_ingredients.registry)
        ? result.comparison.active_ingredients.registry.join(', ')
        : String(result.comparison.active_ingredients.registry || 'N/A');
      comparisonList.push({
        label: 'Active Ingredients',
        submitted: sub,
        registry: reg,
        matches: result.comparison.active_ingredients.matches,
        notes: result.comparison.active_ingredients.notes,
      });
    }
    if (result.comparison.strength) {
      comparisonList.push({
        label: 'Strength',
        submitted: String(result.comparison.strength.submitted || 'N/A'),
        registry: String(result.comparison.strength.registry || 'N/A'),
        matches: result.comparison.strength.matches,
        notes: result.comparison.strength.notes,
      });
    }
    if (result.comparison.dosage_form) {
      comparisonList.push({
        label: 'Dosage Form',
        submitted: String(result.comparison.dosage_form.submitted || 'N/A'),
        registry: String(result.comparison.dosage_form.registry || 'N/A'),
        matches: result.comparison.dosage_form.matches,
        notes: result.comparison.dosage_form.notes,
      });
    }
    if (result.comparison.status) {
      comparisonList.push({
        label: 'Registry Status',
        submitted: String(result.comparison.status.submitted || 'ACTIVE'),
        registry: String(result.comparison.status.registry || 'N/A'),
        matches: result.comparison.status.matches,
        notes: result.comparison.status.notes,
      });
    }
    if (result.comparison.manufacturer) {
      comparisonList.push({
        label: 'Manufacturer',
        submitted: String(result.comparison.manufacturer.submitted || 'N/A'),
        registry: String(result.comparison.manufacturer.registry || 'N/A'),
        matches: result.comparison.manufacturer.matches,
        notes: result.comparison.manufacturer.notes,
      });
    }
  } else if (result.field_checks) {
    result.field_checks.forEach((fc) => {
      comparisonList.push({
        label: fc.field,
        submitted: fc.extracted,
        registry: fc.registry,
        matches: fc.match,
      });
    });
  }

  const handleAdd = () => {
    const record = result.matched_record;
    const name = record?.product_name || result.extracted?.name || 'Checked Medicine';
    const nrn = record?.nrn || result.extracted?.nrn || 'N/A';
    const activeIngredients = record?.active_ingredients || result.extracted?.active_ingredients || [];
    const strength = record?.strength || result.extracted?.strength || 'Unspecified';
    const dosageForm = record?.dosage_form || result.extracted?.dosage_form || 'Form';
    const manufacturer = record?.manufacturer || result.extracted?.manufacturer || 'Unknown';

    onAddToBasket({
      id: `${nrn}-${Date.now()}`,
      addedAt: Date.now(),
      product_name: name,
      nrn,
      active_ingredients: activeIngredients.length > 0 ? activeIngredients : [name],
      strength,
      dosage_form: dosageForm,
      manufacturer,
      verdict: result.verdict,
    });

    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 2000);
  };

  const adviceText = 
    result.explanation?.action_recommendation || 
    result.advice || 
    'Consult your healthcare provider or pharmacist regarding medication safety.';

  const summaryText = language === 'pcm' 
    ? (result.explanation?.pidgin_summary || result.explanation?.summary)
    : result.explanation?.summary;

  return (
    <div className="space-y-4 animate-fade-in">
      {/* MAIN RESULT CARD */}
      <div className={`rounded-2xl border-2 ${config.borderColor} ${config.bgColor} p-4 sm:p-5 shadow-sm space-y-4`}>
        
        {/* VERDICT BADGE & HEADER */}
        <div className="flex items-start gap-3">
          <div className={`p-2.5 rounded-xl ${config.badgeBg} text-white shrink-0 shadow-xs mt-0.5`}>
            <VerdictIcon className="w-6 h-6" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className={`inline-flex items-center text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${config.badgeBg} ${config.badgeText}`}>
                {result.verdict.replace('_', ' ')}
              </span>

              {/* Confidence Badge */}
              <span className="text-[11px] font-semibold text-slate-600 bg-white/80 border border-slate-200 px-2 py-0.5 rounded-full">
                {result.confidence_percentage}% {language === 'pcm' ? 'sureness' : 'confidence'}
              </span>
            </div>

            <h3 className={`text-base sm:text-lg font-black tracking-tight ${config.textColor}`}>
              {config.title}
            </h3>
            <p className="text-xs text-slate-600 font-medium leading-relaxed mt-0.5">
              {config.subtitle}
            </p>
          </div>
        </div>

        {/* SUMMARY CALLOUT */}
        {summaryText && (
          <div className="bg-white/90 rounded-xl p-3 border border-slate-200/80 shadow-2xs">
            <p className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed">
              {summaryText}
            </p>
          </div>
        )}

        {/* SIDE-BY-SIDE EXTRACTED VS REGISTRY COMPARISON TABLE */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="px-3.5 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              {language === 'pcm' ? 'Pack Details vs NAFDAC Record' : 'Extracted vs. Registry Record'}
            </span>
            <span className="text-[10px] font-semibold text-slate-500">
              {comparisonList.filter(c => c.matches).length}/{comparisonList.length} {language === 'pcm' ? 'match' : 'matches'}
            </span>
          </div>

          {/* Responsive Comparison Grid */}
          <div className="divide-y divide-slate-100">
            {comparisonList.map((item, idx) => (
              <div 
                key={idx} 
                className={`p-3 text-xs transition-colors ${
                  item.matches ? 'hover:bg-slate-50/50' : 'bg-rose-50/40 hover:bg-rose-50/70'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-700 uppercase tracking-tight text-[11px]">
                    {item.label}
                  </span>
                  {item.matches ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                      <Check className="w-3 h-3 stroke-[3]" />
                      {language === 'pcm' ? 'Match' : 'Match'}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-800 bg-rose-100 px-2 py-0.5 rounded-full">
                      <X className="w-3 h-3 stroke-[3]" />
                      {language === 'pcm' ? 'Mismatch' : 'Mismatch'}
                    </span>
                  )}
                </div>

                {/* Side-by-side values */}
                <div className="grid grid-cols-2 gap-2 mt-1.5 pt-1 border-t border-slate-100 text-xs">
                  <div className="bg-slate-50/80 rounded-lg p-2 border border-slate-200/60">
                    <span className="block text-[9px] uppercase font-bold text-slate-400">
                      {language === 'pcm' ? 'On Pack (Extracted)' : 'Submitted / Extracted'}
                    </span>
                    <span className="font-semibold text-slate-900 break-words leading-tight block mt-0.5">
                      {item.submitted || '—'}
                    </span>
                  </div>

                  <div className="bg-emerald-50/40 rounded-lg p-2 border border-emerald-200/60">
                    <span className="block text-[9px] uppercase font-bold text-emerald-700">
                      {language === 'pcm' ? 'NAFDAC Record' : 'Registry Record'}
                    </span>
                    <span className="font-semibold text-slate-900 break-words leading-tight block mt-0.5">
                      {item.registry || '—'}
                    </span>
                  </div>
                </div>

                {item.notes && (
                  <p className="text-[11px] text-slate-500 mt-1.5 italic">
                    Note: {item.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* LIST OF REASONS */}
        {result.reasons && result.reasons.length > 0 && (
          <div className="bg-white rounded-xl p-3.5 border border-slate-200/90 shadow-2xs space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              {language === 'pcm' ? 'Key Reasons & Observations:' : 'Findings & Observations:'}
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-700">
              {result.reasons.map((reason, idx) => (
                <li key={idx} className="flex items-start gap-2 leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0 mt-1.5" />
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* WHAT TO DO NEXT (Advice Line) */}
        <div className="bg-slate-900 text-white rounded-xl p-3.5 shadow-sm space-y-1.5">
          <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-black uppercase tracking-wider">
            <ArrowRight className="w-3.5 h-3.5" />
            <span>{language === 'pcm' ? 'Wetin you suppose do next:' : 'What to do next:'}</span>
          </div>
          <p className="text-xs sm:text-sm font-medium text-slate-100 leading-snug">
            {adviceText}
          </p>
        </div>

        {/* SNAPSHOT METADATA FOOTNOTE */}
        <div className="text-[10px] text-slate-500 flex flex-wrap items-center justify-between gap-1 pt-1 border-t border-slate-200/60">
          <span>Source: {result.dataset_metadata?.source || 'NAFDAC Green Book Snapshot'}</span>
          <span>Snapshot Date: {result.dataset_metadata?.snapshot_date || '2024-06-01'}</span>
        </div>
      </div>

      {/* ACTION TOOLBAR: ADD TO BASKET, RETAKE PHOTO, CHECK ANOTHER */}
      <div className="space-y-2">
        <button
          type="button"
          onClick={handleAdd}
          disabled={isAlreadyInBasket}
          className={`w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-all ${
            isAlreadyInBasket
              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 cursor-default'
              : addedAnimation
              ? 'bg-emerald-600 text-white scale-[1.01]'
              : 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white active:scale-[0.98]'
          }`}
        >
          {isAlreadyInBasket ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              <span>{language === 'pcm' ? 'Already in your basket' : 'Added to Medication Basket'}</span>
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              <span>{language === 'pcm' ? 'Put inside Basket (Check duplicate drugs)' : 'Add to Basket (Check Duplicate Ingredients)'}</span>
            </>
          )}
        </button>

        <div className="grid grid-cols-2 gap-2">
          {hasPhoto && onRetakePhoto && (
            <button
              type="button"
              onClick={onRetakePhoto}
              className="py-2.5 px-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
              <span>{language === 'pcm' ? 'Retake Photo' : 'Retake Photo'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={onReset}
            className={`py-2.5 px-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-colors ${
              !hasPhoto ? 'col-span-2' : ''
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            <span>{language === 'pcm' ? 'Check Another Medicine' : 'Check Another Medicine'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
