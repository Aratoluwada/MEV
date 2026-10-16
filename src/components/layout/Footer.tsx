import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, ArrowUpRight, Heart, ExternalLink } from 'lucide-react';
import { LanguageCode } from '../../types';

interface FooterProps {
  language: LanguageCode;
}

export const Footer: React.FC<FooterProps> = ({ language }) => {
  return (
    <footer className="bg-[#171717] text-[#FFF9ED] border-t-4 border-[#171717] pt-12 pb-8 px-4 sm:px-6 lg:px-8 mt-auto">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-10 border-b-2 border-[#333333]">
          
          {/* Brand Info & Mission */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-[#F5E947] text-[#171717] border-2 border-white flex items-center justify-center font-heading font-black text-sm">
                MEV
              </div>
              <span className="font-heading font-black text-2xl tracking-tight text-white">
                MEV
              </span>
              <span className="text-[10px] font-mono font-bold bg-[#A9F04D] text-[#171717] px-1.5 py-0.5 border border-white">
                v1.0
              </span>
            </div>

            <p className="text-xs sm:text-sm text-[#CCCCCC] leading-relaxed max-w-sm">
              {language === 'pcm'
                ? 'MEV na regulatory inspection tool wey dey cross-check wetin dey on top medicine pack against official NAFDAC Green Book snapshot data.'
                : 'MEV provides open regulatory cross-referencing against available NAFDAC drug registry snapshots. Designed to highlight discrepancies and promote medication transparency.'}
            </p>

            <div className="p-3 bg-[#262626] border-2 border-[#444444] text-[11px] font-mono text-[#F5E947] space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 bg-[#A9F04D] inline-block" />
                <span>SNAPSHOT REFERENCE: 2024-06-01</span>
              </div>
              <p className="text-[#AAAAAA]">
                Dataset: NAFDAC Registered Drug Products Sample Snapshot
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="font-heading font-black text-sm uppercase tracking-wider text-[#F5E947]">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm font-medium">
              <li>
                <Link to="/" className="text-[#CCCCCC] hover:text-white hover:underline flex items-center gap-1">
                  <span>Home</span>
                </Link>
              </li>
              <li>
                <Link to="/check" className="text-[#CCCCCC] hover:text-white hover:underline flex items-center gap-1">
                  <span>Check a Medicine</span>
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="text-[#CCCCCC] hover:text-white hover:underline flex items-center gap-1">
                  <span>How It Works</span>
                </Link>
              </li>
              <li>
                <Link to="/safety" className="text-[#CCCCCC] hover:text-white hover:underline flex items-center gap-1">
                  <span>Safety & Limitations</span>
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-[#CCCCCC] hover:text-white hover:underline flex items-center gap-1">
                  <span>About This Project</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Regulatory & Safety Policy */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="font-heading font-black text-sm uppercase tracking-wider text-[#FF7B70]">
              Safety Declaration
            </h4>
            <div className="p-3 bg-[#222222] border-2 border-[#FF7B70]/80 text-xs text-[#E0E0E0] space-y-2 leading-relaxed">
              <p className="font-bold text-white">
                Important Regulatory Notice:
              </p>
              <p>
                This application conducts an informational registry check. A registration match confirms that details match regulatory records, but cannot verify physical packaging integrity, tamper-evidence, or chemical composition.
              </p>
              <p className="text-[11px] text-[#FF7B70] font-mono">
                Always consult a licensed medical doctor or pharmacist before consuming any medicine.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Attribution */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-[#888888]">
          <div>
            © {new Date().getFullYear()} MEV • Independent Regulatory Inspection Project
          </div>

          <div className="flex items-center gap-4">
            <Link to="/safety" className="hover:text-white underline">
              Safety & Terms
            </Link>
            <span className="text-[#444444]">|</span>
            <span className="flex items-center gap-1">
              Built for Healthcare Transparency
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
