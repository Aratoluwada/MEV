import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

export interface AccordionItemData {
  id: string;
  question: string;
  answer: string | React.ReactNode;
  tag?: string;
}

interface AccordionProps {
  items: AccordionItemData[];
  defaultOpenIndex?: number;
}

export const Accordion: React.FC<AccordionProps> = ({ items, defaultOpenIndex = -1 }) => {
  const [openIndex, setOpenIndex] = useState<number>(defaultOpenIndex);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? -1 : idx);
  };

  return (
    <div className="space-y-3">
      {items.map((item, idx) => {
        const isOpen = openIndex === idx;
        return (
          <div
            key={item.id || idx}
            className={`border-2 border-[#171717] transition-all ${
              isOpen
                ? 'bg-white shadow-[4px_4px_0px_#171717]'
                : 'bg-white shadow-[2px_2px_0px_#171717] hover:shadow-[3px_3px_0px_#171717]'
            }`}
          >
            <button
              type="button"
              onClick={() => toggle(idx)}
              aria-expanded={isOpen}
              className="w-full p-4 sm:p-5 text-left flex items-start justify-between gap-4 font-heading font-bold text-base sm:text-lg text-[#171717] cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-black px-2 py-0.5 bg-[#F5E947] border border-[#171717] text-[#171717]">
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <span>{item.question}</span>
              </div>
              <div className={`p-1.5 border border-[#171717] shrink-0 transition-colors ${
                isOpen ? 'bg-[#F5E947]' : 'bg-[#FFF9ED]'
              }`}>
                {isOpen ? <Minus className="w-4 h-4 stroke-[3]" /> : <Plus className="w-4 h-4 stroke-[3]" />}
              </div>
            </button>

            {isOpen && (
              <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-0 text-xs sm:text-sm text-[#333333] leading-relaxed border-t-2 border-[#171717]/10 animate-fade-in">
                {item.tag && (
                  <span className="inline-block mb-2 font-mono text-[10px] uppercase font-bold px-2 py-0.5 bg-slate-100 border border-slate-300">
                    {item.tag}
                  </span>
                )}
                <div>{item.answer}</div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
