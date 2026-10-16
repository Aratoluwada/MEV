import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowUpRight, 
  Camera, 
  Search, 
  Database, 
  AlertTriangle, 
  Check, 
  X, 
  FileCheck, 
  ShieldAlert,
  ArrowRight,
  Info
} from 'lucide-react';
import { LanguageCode } from '../types';

interface HowItWorksProps {
  language: LanguageCode;
}

export const HowItWorks: React.FC<HowItWorksProps> = ({ language }) => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14 space-y-12">
      
      {/* HEADER */}
      <div className="border-b-3 border-[#171717] pb-6 space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#F5E947] border-2 border-[#171717] shadow-[2px_2px_0px_#171717] text-xs font-mono font-black uppercase tracking-wider text-[#171717]">
          <span>REGULATORY INSPECTION ARCHITECTURE</span>
        </div>

        <h1 className="font-heading font-black text-3xl sm:text-5xl text-[#171717] tracking-tight">
          HOW IT WORKS
        </h1>

        <p className="text-sm sm:text-base text-[#444444] font-medium max-w-2xl leading-relaxed">
          Understanding how MEV queries official regulatory snapshots, handles optical character recognition, analyzes cloned NRN patterns, and maintains strict safety boundaries.
        </p>
      </div>

      {/* 5-STEP NUMBERED VISUAL PROCESS */}
      <div className="space-y-6">
        <h2 className="font-heading font-black text-2xl text-[#171717] flex items-center gap-2">
          <span>THE 5-STAGE VERIFICATION PIPELINE</span>
        </h2>

        <div className="space-y-4">
          
          {/* Stage 1 */}
          <div className="bg-white border-3 border-[#171717] p-6 shadow-[5px_5px_0px_#171717] grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            <div className="md:col-span-2 flex items-center md:flex-col justify-between md:justify-center gap-2">
              <span className="w-12 h-12 bg-[#F5E947] border-2 border-[#171717] flex items-center justify-center font-heading font-black text-xl text-[#171717]">
                01
              </span>
              <span className="font-mono text-[10px] font-bold text-[#888888] uppercase">
                INGESTION
              </span>
            </div>
            <div className="md:col-span-10 space-y-1.5">
              <h3 className="font-heading font-black text-lg text-[#171717]">
                User Provides Medicine Packaging Data
              </h3>
              <p className="text-xs sm:text-sm text-[#444444] leading-relaxed">
                The user captures a high-resolution photo of the drug carton or blister pack, types the brand name and NAFDAC registration number (NRN), or utilizes browser speech recognition to dictate details.
              </p>
            </div>
          </div>

          {/* Stage 2 */}
          <div className="bg-white border-3 border-[#171717] p-6 shadow-[5px_5px_0px_#171717] grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            <div className="md:col-span-2 flex items-center md:flex-col justify-between md:justify-center gap-2">
              <span className="w-12 h-12 bg-[#A9F04D] border-2 border-[#171717] flex items-center justify-center font-heading font-black text-xl text-[#171717]">
                02
              </span>
              <span className="font-mono text-[10px] font-bold text-[#888888] uppercase">
                EXTRACTION
              </span>
            </div>
            <div className="md:col-span-10 space-y-1.5">
              <h3 className="font-heading font-black text-lg text-[#171717]">
                Label Parsing & Information Normalization
              </h3>
              <p className="text-xs sm:text-sm text-[#444444] leading-relaxed">
                Text recognition scans the label for standardized regulatory patterns, isolating the NRN (e.g. <code>04-1234</code> or <code>A4-3290</code>), dosage forms (tablet, caplet, syrup), metric strengths (500mg), and active chemical names.
              </p>
            </div>
          </div>

          {/* Stage 3 */}
          <div className="bg-white border-3 border-[#171717] p-6 shadow-[5px_5px_0px_#171717] grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            <div className="md:col-span-2 flex items-center md:flex-col justify-between md:justify-center gap-2">
              <span className="w-12 h-12 bg-[#4169F5] text-white border-2 border-[#171717] flex items-center justify-center font-heading font-black text-xl">
                03
              </span>
              <span className="font-mono text-[10px] font-bold text-[#888888] uppercase">
                CROSS-CHECK
              </span>
            </div>
            <div className="md:col-span-10 space-y-1.5">
              <h3 className="font-heading font-black text-lg text-[#171717]">
                Regulatory Snapshot Query (Green Book Dataset)
              </h3>
              <p className="text-xs sm:text-sm text-[#444444] leading-relaxed">
                The normalized information is queried against the official NAFDAC Green Book snapshot database containing licensed pharmaceutical formulations, licensed manufacturers, country of origin, and registration expiration schedules.
              </p>
            </div>
          </div>

          {/* Stage 4 */}
          <div className="bg-white border-3 border-[#171717] p-6 shadow-[5px_5px_0px_#171717] grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            <div className="md:col-span-2 flex items-center md:flex-col justify-between md:justify-center gap-2">
              <span className="w-12 h-12 bg-[#FF7B70] border-2 border-[#171717] flex items-center justify-center font-heading font-black text-xl text-[#171717]">
                04
              </span>
              <span className="font-mono text-[10px] font-bold text-[#888888] uppercase">
                COMPARISON
              </span>
            </div>
            <div className="md:col-span-10 space-y-1.5">
              <h3 className="font-heading font-black text-lg text-[#171717]">
                Discrepancy & Cloned Number Analysis
              </h3>
              <p className="text-xs sm:text-sm text-[#444444] leading-relaxed">
                The engine evaluates each field. If an NRN registered to an analgesic is printed on an antimalarial pack, or if the manufacturer differs from the license holder, a critical conflict is recorded.
              </p>
            </div>
          </div>

          {/* Stage 5 */}
          <div className="bg-white border-3 border-[#171717] p-6 shadow-[5px_5px_0px_#171717] grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            <div className="md:col-span-2 flex items-center md:flex-col justify-between md:justify-center gap-2">
              <span className="w-12 h-12 bg-[#171717] text-white border-2 border-[#171717] flex items-center justify-center font-heading font-black text-xl">
                05
              </span>
              <span className="font-mono text-[10px] font-bold text-[#888888] uppercase">
                ACTION
              </span>
            </div>
            <div className="md:col-span-10 space-y-1.5">
              <h3 className="font-heading font-black text-lg text-[#171717]">
                Objective Report & Recommended Protocol
              </h3>
              <p className="text-xs sm:text-sm text-[#444444] leading-relaxed">
                The user receives a structured side-by-side table with transparent findings, clear next-step guidance (e.g. consulting a licensed pharmacist), and the option to add the pack to the duplicate-ingredient checker basket.
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* ILLUSTRATIVE COMPARISON TABLE (Clearly labeled) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-heading font-black text-2xl text-[#171717]">
            HOW DISCREPANCIES ARE DISPLAYED
          </h2>
          <span className="neo-badge bg-[#F5E947] text-[#171717]">
            ILLUSTRATIVE EXAMPLE — NOT A LIVE LOOKUP
          </span>
        </div>

        <div className="bg-white border-3 border-[#171717] p-6 shadow-[6px_6px_0px_#171717] space-y-4">
          <div className="p-3 bg-blue-50 border-2 border-[#4169F5] text-xs font-mono text-[#171717]">
            <strong>EXAMPLE SCENARIO:</strong> Cloned NRN Detection (Packaging displays NRN 04-1234, but claims to be Lonart DS Antimalarial)
          </div>

          <div className="overflow-x-auto border-2 border-[#171717]">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#FFF9ED] border-b-2 border-[#171717] font-mono uppercase text-[#171717]">
                  <th className="p-3 border-r-2 border-[#171717]">FIELD</th>
                  <th className="p-3 border-r-2 border-[#171717]">ON PACK LABEL</th>
                  <th className="p-3 border-r-2 border-[#171717]">NAFDAC REGISTRY RECORD</th>
                  <th className="p-3">EVALUATION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#171717]">
                <tr>
                  <td className="p-3 border-r-2 border-[#171717] font-mono font-bold">NRN</td>
                  <td className="p-3 border-r-2 border-[#171717]">04-1234</td>
                  <td className="p-3 border-r-2 border-[#171717]">04-1234</td>
                  <td className="p-3">
                    <span className="neo-badge bg-[#A9F04D] text-[#171717]">✓ NUMBER EXISTS</span>
                  </td>
                </tr>
                <tr className="bg-[#FF7B70]/20">
                  <td className="p-3 border-r-2 border-[#171717] font-mono font-bold">PRODUCT NAME</td>
                  <td className="p-3 border-r-2 border-[#171717] font-bold">Lonart DS Tablets</td>
                  <td className="p-3 border-r-2 border-[#171717] font-bold">Emzor Paracetamol 500mg Tablets</td>
                  <td className="p-3">
                    <span className="neo-badge bg-[#FF7B70] text-[#171717]">✗ CRITICAL MISMATCH</span>
                  </td>
                </tr>
                <tr className="bg-[#FF7B70]/20">
                  <td className="p-3 border-r-2 border-[#171717] font-mono font-bold">ACTIVE INGREDIENTS</td>
                  <td className="p-3 border-r-2 border-[#171717]">Artemether + Lumefantrine</td>
                  <td className="p-3 border-r-2 border-[#171717]">Paracetamol</td>
                  <td className="p-3">
                    <span className="neo-badge bg-[#FF7B70] text-[#171717]">✗ CONFLICT DETECTED</span>
                  </td>
                </tr>
                <tr>
                  <td className="p-3 border-r-2 border-[#171717] font-mono font-bold">STATUS</td>
                  <td className="p-3 border-r-2 border-[#171717]">ACTIVE</td>
                  <td className="p-3 border-r-2 border-[#171717]">ACTIVE</td>
                  <td className="p-3">
                    <span className="neo-badge bg-[#A9F04D] text-[#171717]">✓ ACTIVE PERMIT</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="p-3 bg-[#FFF9ED] border-2 border-[#171717] text-xs text-[#444444] font-medium leading-relaxed">
            <strong>System Interpretation:</strong> In this illustrative scenario, the NRN belongs to an active licensed paracetamol product, not an antimalarial. The system flags this as an immediate information conflict, warning the user against using the pack.
          </div>
        </div>
      </div>

      {/* LIMITATIONS OF DATASETS */}
      <div className="bg-[#FFF9ED] border-3 border-[#171717] p-6 sm:p-8 shadow-[5px_5px_0px_#171717] space-y-4">
        <h3 className="font-heading font-black text-xl text-[#171717] flex items-center gap-2">
          <Info className="w-5 h-5 text-[#4169F5]" />
          <span>DATASET SOURCES & LIMITATIONS</span>
        </h3>
        <p className="text-xs sm:text-sm text-[#333333] leading-relaxed">
          The records in MEV are derived from public snapshots of the <strong>NAFDAC Registered Drug Products (Green Book)</strong> dataset. While this covers tens of thousands of approved formulations, regulatory agencies regularly update statuses, renew expirations, and grant new marketing authorizations.
        </p>
        <p className="text-xs sm:text-sm text-[#333333] leading-relaxed">
          Consequently, a record not present in a local snapshot does not automatically prove a drug is unregistered or illicit. Always verify recent approvals with official health authorities when necessary.
        </p>
      </div>

      {/* FINAL CTA */}
      <div className="pt-4 text-center">
        <Link
          to="/check"
          className="neo-btn-primary px-8 py-4 text-base uppercase tracking-wider gap-2 inline-flex"
        >
          <span>PROCEED TO MEDICINE CHECKER</span>
          <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />
        </Link>
      </div>

    </div>
  );
};
