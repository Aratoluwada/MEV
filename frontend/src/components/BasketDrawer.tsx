import React, { useMemo } from 'react';
import { X, Trash2, AlertTriangle, CheckCircle, Pill, ArrowRight, ShieldAlert } from 'lucide-react';
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
  // Compute duplicate active ingredients across all basket items
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
    <div className="fixed inset-0 z-50 flex justify-end bg-[#171717]/60 backdrop-blur-xs animate-fade-in">
      <div 
        className="w-full max-w-md bg-[#FFF9ED] h-full border-l-4 border-[#171717] shadow-[-8px_0px_0px_#171717] flex flex-col animate-slide-left"
        role="dialog"
        aria-modal="true"
        aria-labelledby="basket-drawer-title"
      >
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b-3 border-[#171717] flex items-center justify-between bg-[#F5E947]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-[#171717] text-[#F5E947] border-2 border-[#171717] flex items-center justify-center font-black">
              <Pill className="w-5 h-5 -rotate-45" />
            </div>
            <div>
              <h2 id="basket-drawer-title" className="font-heading font-black text-lg text-[#171717] leading-tight">
                {language === 'pcm' ? 'MEDICINE BASKET' : 'MEDICATION BASKET'}
              </h2>
              <p className="font-mono text-[11px] font-bold text-[#171717]/80">
                {items.length} {items.length === 1 ? 'PACK RECORD' : 'PACK RECORDS'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 bg-white border-2 border-[#171717] shadow-[2px_2px_0px_#171717] hover:bg-[#FFF9ED] cursor-pointer"
            aria-label="Close basket"
          >
            <X className="w-5 h-5 text-[#171717]" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          
          {/* DUPLICATE ACTIVE INGREDIENT WARNING BANNER */}
          {duplicateAlerts.length > 0 && (
            <div 
              className="bg-[#FF7B70] border-3 border-[#171717] p-4 shadow-[4px_4px_0px_#171717] space-y-3"
              role="alert"
            >
              <div className="flex items-start gap-2.5">
                <div className="p-1.5 bg-[#171717] text-[#FF7B70] border border-[#171717] shrink-0 mt-0.5">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-heading font-black text-sm text-[#171717] uppercase tracking-tight">
                    {language === 'pcm'
                      ? '⚠️ DUPLICATE CHEMICAL OVERLAP ALERT!'
                      : '⚠️ DUPLICATE ACTIVE INGREDIENT WARNING'}
                  </h4>
                  <p className="text-xs text-[#171717] font-medium mt-1 leading-relaxed">
                    {language === 'pcm' ? (
                      <>
                        Shine your eye! Di same active chemical dey appear inside multiple medicines for your basket:
                      </>
                    ) : (
                      <>
                        Potential medication overlap detected. The following active ingredient is present across multiple checked products:
                      </>
                    )}
                  </p>
                </div>
              </div>

              {/* Duplicate Ingredient Breakdown */}
              <div className="space-y-2">
                {duplicateAlerts.map((dup) => (
                  <div
                    key={dup.ingredient}
                    className="bg-white border-2 border-[#171717] p-3 text-xs text-[#171717] space-y-1"
                  >
                    <div className="flex items-center justify-between font-mono font-bold">
                      <span className="text-[#171717] uppercase underline">
                        • {dup.ingredient}
                      </span>
                      <span className="neo-badge bg-[#F5E947] text-[#171717]">
                        {dup.medicines.length} PRODUCTS
                      </span>
                    </div>
                    <p className="text-[11px] text-[#444444] font-medium">
                      Present in: <strong>{dup.medicines.join(' & ')}</strong>
                    </p>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t-2 border-[#171717] text-[11px] font-mono font-bold text-[#171717] leading-snug">
                {language === 'pcm'
                  ? 'No take these medicines together without asking your pharmacist, make overdose no affect your liver!'
                  : 'Taking multiple products containing identical active ingredients risks accidental overdose (e.g. acute liver injury with paracetamol). Consult a pharmacist.'}
              </div>
            </div>
          )}

          {/* Empty Basket State */}
          {items.length === 0 && (
            <div className="py-16 text-center space-y-3">
              <div className="w-14 h-14 bg-white border-2 border-[#171717] shadow-[3px_3px_0px_#171717] flex items-center justify-center mx-auto text-[#171717]">
                <Pill className="w-7 h-7" />
              </div>
              <h3 className="font-heading font-black text-base text-[#171717]">
                BASKET IS CURRENTLY EMPTY
              </h3>
              <p className="text-xs text-[#555555] max-w-xs mx-auto leading-relaxed">
                Check any medicine and click <strong>"ADD TO BASKET"</strong> to compare multiple packs and verify for dangerous duplicate ingredients.
              </p>
            </div>
          )}

          {/* List of Basket Items */}
          {items.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-mono font-bold text-[#171717] px-1">
                <span>CHECKED MEDICINES IN BASKET:</span>
                <button
                  type="button"
                  onClick={onClearBasket}
                  className="text-rose-700 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>CLEAR ALL</span>
                </button>
              </div>

              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border-2 border-[#171717] p-3.5 shadow-[3px_3px_0px_#171717] space-y-2 relative"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-heading font-black text-sm text-[#171717] leading-snug">
                        {item.product_name}
                      </h4>
                      <p className="font-mono text-xs text-[#4169F5] font-bold mt-0.5">
                        NRN: {item.nrn}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => onRemoveItem(item.id)}
                      className="p-1 bg-[#FFF9ED] border border-[#171717] text-[#171717] hover:bg-[#FF7B70] transition-colors cursor-pointer"
                      title="Remove from basket"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono">
                    <span className="neo-badge bg-[#FFF9ED] text-[#171717]">
                      {item.strength}
                    </span>
                    <span className="neo-badge bg-[#FFF9ED] text-[#171717]">
                      {item.dosage_form}
                    </span>
                    {item.active_ingredients.map((ing) => (
                      <span
                        key={ing}
                        className="neo-badge bg-[#A9F04D] text-[#171717]"
                      >
                        {ing}
                      </span>
                    ))}
                  </div>

                  <div className="text-[10px] font-mono text-[#777777] pt-1 border-t border-slate-200">
                    Manufacturer: {item.manufacturer}
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

        {/* Drawer Footer */}
        {items.length > 0 && (
          <div className="p-4 border-t-3 border-[#171717] bg-white space-y-2">
            <button
              type="button"
              onClick={onClose}
              className="neo-btn-primary w-full py-3 text-xs sm:text-sm uppercase tracking-wider cursor-pointer"
            >
              <span>CONTINUE CHECKING MEDICINES</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
