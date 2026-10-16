import React, { useMemo } from 'react';
import { X, Trash2, AlertTriangle, CheckCircle, ShieldCheck, Pill, ArrowRight } from 'lucide-react';
import { BasketItem, LanguageCode } from '../types';

interface BasketDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: BasketItem[];
  onRemoveItem: (id: string) => void;
  onClearBasket: () => void;
  language: LanguageCode;
}

export const BasketDrawer: React.FC<BasketDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onRemoveItem,
  onClearBasket,
  language,
}) => {
  // Compute duplicate active ingredients across basket items
  const duplicateAlerts = useMemo(() => {
    const ingredientMap: Record<string, string[]> = {};

    items.forEach((item) => {
      item.active_ingredients.forEach((ing) => {
        const clean = ing.trim().toLowerCase();
        if (!clean) return;
        if (!ingredientMap[clean]) {
          ingredientMap[clean] = [];
        }
        if (!ingredientMap[clean].includes(item.product_name)) {
          ingredientMap[clean].push(item.product_name);
        }
      });
    });

    const duplicates: { ingredient: string; medicines: string[] }[] = [];
    Object.entries(ingredientMap).forEach(([ing, meds]) => {
      if (meds.length > 1) {
        // Format title case
        const formatted = ing.charAt(0).toUpperCase() + ing.slice(1);
        duplicates.push({
          ingredient: formatted,
          medicines: meds,
        });
      }
    });

    return duplicates;
  }, [items]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div 
        className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-slide-left"
        role="dialog"
        aria-modal="true"
        aria-labelledby="basket-drawer-title"
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <Pill className="w-4 h-4" />
            </div>
            <div>
              <h2 id="basket-drawer-title" className="text-base font-bold text-slate-900">
                {language === 'pcm' ? 'Your Medicine Basket' : 'Medicine Check Basket'}
              </h2>
              <p className="text-xs text-slate-500">
                {items.length === 0
                  ? language === 'pcm' ? 'Empty basket' : '0 medicines added'
                  : language === 'pcm'
                  ? `${items.length} medicine dey inside`
                  : `${items.length} pack${items.length > 1 ? 's' : ''} under review`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60"
            aria-label="Close basket"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* DUPLICATE INGREDIENT WARNING BANNER */}
          {duplicateAlerts.length > 0 && (
            <div 
              className="bg-amber-50 border-2 border-amber-300 rounded-xl p-3.5 shadow-xs animate-pulse-once"
              role="alert"
            >
              <div className="flex items-start gap-2.5">
                <div className="p-1.5 rounded-lg bg-amber-500 text-white shrink-0 mt-0.5">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-amber-950">
                    {language === 'pcm'
                      ? '⚠️ Duplicate Active Chemical Warning!'
                      : '⚠️ Duplicate Active Ingredient Warning'}
                  </h4>
                  <p className="text-xs text-amber-900/90 mt-1 leading-relaxed">
                    {language === 'pcm' ? (
                      <>
                        Shine your eye well well! Di same active chemical dey appear inside multiple medicines for your basket:
                      </>
                    ) : (
                      <>
                        Potential medication overlap detected. The following active ingredient(s) are present across multiple checked products:
                      </>
                    )}
                  </p>

                  <div className="mt-2 space-y-2">
                    {duplicateAlerts.map((dup) => (
                      <div
                        key={dup.ingredient}
                        className="bg-white/90 rounded-lg p-2.5 border border-amber-200 text-xs text-slate-800"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-amber-900 uppercase tracking-wide">
                            • {dup.ingredient}
                          </span>
                          <span className="text-[10px] font-semibold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-sm">
                            {dup.medicines.length} products
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-1">
                          Present in: <strong className="text-slate-800">{dup.medicines.join(' & ')}</strong>
                        </p>
                      </div>
                    ))}
                  </div>

                  <p className="text-[11px] font-medium text-amber-950/80 mt-2.5 pt-2 border-t border-amber-200">
                    {language === 'pcm'
                      ? 'No take these medicines together without asking your pharmacist, make overdose no affect your liver or body!'
                      : 'Taking multiple medications containing the same active ingredient increases the risk of toxicity or accidental overdose. Consult a pharmacist before combining.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Empty State */}
          {items.length === 0 && (
            <div className="py-12 text-center text-slate-500">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
                <Pill className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-slate-800 text-sm">
                {language === 'pcm' ? 'Your basket dey empty' : 'Your basket is empty'}
              </h3>
              <p className="text-xs text-slate-500 max-w-[260px] mx-auto mt-1">
                {language === 'pcm'
                  ? 'Check any medicine and tap "Add to Basket" to compare multiple drugs and check for duplicate chemicals.'
                  : 'Check a medicine and click "Add to Basket" to cross-verify multiple medications for dangerous ingredient overlaps.'}
              </p>
            </div>
          )}

          {/* List of Basket Items */}
          {items.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
                <span>{language === 'pcm' ? 'Medicines inside basket:' : 'Checked Medicines:'}</span>
                <button
                  type="button"
                  onClick={onClearBasket}
                  className="text-rose-600 hover:text-rose-700 hover:underline flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  {language === 'pcm' ? 'Clear all' : 'Clear basket'}
                </button>
              </div>

              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs relative group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 leading-snug">
                        {item.product_name}
                      </h4>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">
                        NRN: {item.nrn}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => onRemoveItem(item.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded-md hover:bg-slate-100 transition-colors"
                      aria-label={`Remove ${item.product_name}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-wrap items-center gap-1.5 text-[11px]">
                    <span className="font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                      {item.strength}
                    </span>
                    <span className="font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                      {item.dosage_form}
                    </span>
                    {item.active_ingredients.map((ing) => (
                      <span
                        key={ing}
                        className="font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md"
                      >
                        {ing}
                      </span>
                    ))}
                  </div>

                  <div className="mt-2 text-[10px] text-slate-400">
                    Manufacturer: {item.manufacturer}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-4 border-t border-slate-200 bg-slate-50">
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 bg-slate-900 text-white font-bold rounded-xl text-sm hover:bg-slate-800 transition-colors"
            >
              {language === 'pcm' ? 'Done / Back to check' : 'Done / Continue Checking'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
