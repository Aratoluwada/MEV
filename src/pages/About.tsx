import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Pill, 
  ShieldCheck, 
  Target, 
  Eye, 
  Terminal, 
  ArrowUpRight, 
  Heart,
  Scale
} from 'lucide-react';
import { LanguageCode } from '../types';

interface AboutProps {
  language: LanguageCode;
}

export const About: React.FC<AboutProps> = ({ language }) => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14 space-y-12">
      
      {/* HEADER */}
      <div className="border-b-3 border-[#171717] pb-6 space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#A9F04D] border-2 border-[#171717] shadow-[2px_2px_0px_#171717] text-xs font-mono font-black uppercase tracking-wider text-[#171717]">
          <span>PRODUCT MISSION & ETHICAL PRINCIPLES</span>
        </div>

        <h1 className="font-heading font-black text-3xl sm:text-5xl text-[#171717] tracking-tight">
          ABOUT MEV
        </h1>

        <p className="text-sm sm:text-base text-[#444444] font-medium max-w-2xl leading-relaxed">
          Democratizing access to public regulatory drug records while maintaining an uncompromising commitment to honest, non-misleading healthcare communication.
        </p>
      </div>

      {/* THE PROBLEM & PURPOSE GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* The Problem */}
        <div className="bg-white border-3 border-[#171717] p-6 sm:p-8 shadow-[5px_5px_0px_#171717] space-y-3">
          <div className="w-10 h-10 bg-[#FF7B70] border-2 border-[#171717] flex items-center justify-center font-bold text-lg">
            !
          </div>
          <h2 className="font-heading font-black text-xl text-[#171717]">
            The Problem of Registry Opacity
          </h2>
          <p className="text-xs sm:text-sm text-[#444444] leading-relaxed">
            In Nigeria and many emerging healthcare markets, millions of patients purchase pharmaceuticals daily without easy means to verify whether the printed registration markings correspond to authentic regulatory authorizations.
          </p>
          <p className="text-xs sm:text-sm text-[#444444] leading-relaxed">
            When illicit actors copy legitimate registration codes from common analgesics onto high-risk antimalarials or antibiotics, the untrained eye cannot detect the discrepancy without referencing regulatory database entries.
          </p>
        </div>

        {/* The Purpose */}
        <div className="bg-white border-3 border-[#171717] p-6 sm:p-8 shadow-[5px_5px_0px_#171717] space-y-3">
          <div className="w-10 h-10 bg-[#F5E947] border-2 border-[#171717] flex items-center justify-center font-bold text-lg">
            <Target className="w-5 h-5 text-[#171717]" />
          </div>
          <h2 className="font-heading font-black text-xl text-[#171717]">
            Our Engineering Purpose
          </h2>
          <p className="text-xs sm:text-sm text-[#444444] leading-relaxed">
            MEV bridges this gap by indexing the <strong>NAFDAC Green Book Snapshot</strong> into a responsive, mobile-first workspace.
          </p>
          <p className="text-xs sm:text-sm text-[#444444] leading-relaxed">
            Whether through phone cameras, voice dictation, or text search, anyone can inspect regulatory fields, verify active authorizations, and spot information conflicts in seconds.
          </p>
        </div>

      </div>

      {/* EDITORIAL CONSTITUTION */}
      <div className="bg-[#FFF9ED] border-3 border-[#171717] p-6 sm:p-8 shadow-[6px_6px_0px_#171717] space-y-4">
        <div className="flex items-center gap-2">
          <Scale className="w-6 h-6 text-[#171717]" />
          <h2 className="font-heading font-black text-xl sm:text-2xl text-[#171717]">
            OUR ETHICAL COMMUNICATION RULES
          </h2>
        </div>

        <p className="text-xs sm:text-sm text-[#333333] leading-relaxed">
          Too many digital health applications mislead users with bold claims of "100% verified authentic" or "fake detected" based on superficial barcode scans. We reject this dangerous simplification:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="bg-white border-2 border-[#171717] p-4 space-y-1 shadow-[2px_2px_0px_#171717]">
            <h3 className="font-heading font-bold text-sm text-[#171717]">
              1. Never Say "Genuine" or "Fake"
            </h3>
            <p className="text-xs text-[#555555] leading-relaxed">
              We describe exact regulatory statuses: "Record Found", "Information Mismatch Detected", or "No Matching Record". We never claim to test physical pill contents.
            </p>
          </div>

          <div className="bg-white border-2 border-[#171717] p-4 space-y-1 shadow-[2px_2px_0px_#171717]">
            <h3 className="font-heading font-bold text-sm text-[#171717]">
              2. Transparent Uncertainties
            </h3>
            <p className="text-xs text-[#555555] leading-relaxed">
              When a medicine cannot be located, we explain that it could be a newer batch or typographical variance, rather than creating panic.
            </p>
          </div>

          <div className="bg-white border-2 border-[#171717] p-4 space-y-1 shadow-[2px_2px_0px_#171717]">
            <h3 className="font-heading font-bold text-sm text-[#171717]">
              3. Independent & Unendorsed
            </h3>
            <p className="text-xs text-[#555555] leading-relaxed">
              We do not fabricate partnerships or claim official regulatory representation. We are an independent open-access utility built on public regulatory data.
            </p>
          </div>

          <div className="bg-white border-2 border-[#171717] p-4 space-y-1 shadow-[2px_2px_0px_#171717]">
            <h3 className="font-heading font-bold text-sm text-[#171717]">
              4. Patient Safety Above Engagement
            </h3>
            <p className="text-xs text-[#555555] leading-relaxed">
              Our advice lines consistently urge patients to verify with licensed pharmacists and PCN-accredited dispensaries.
            </p>
          </div>
        </div>
      </div>

      {/* PROJECT CONTEXT & OPEN TECH */}
      <div className="bg-[#171717] text-white border-3 border-[#171717] p-6 sm:p-8 shadow-[6px_6px_0px_#F5E947] space-y-4">
        <div className="flex items-center gap-2 text-[#F5E947]">
          <Terminal className="w-5 h-5" />
          <h3 className="font-mono text-xs font-black uppercase tracking-wider">
            HACKATHON & REPOSITORY ATTRIBUTION
          </h3>
        </div>

        <h2 className="font-heading font-black text-2xl text-white">
          MEV (Medicine Evidence & Verification)
        </h2>

        <p className="text-xs sm:text-sm text-[#CCCCCC] leading-relaxed">
          Developed as a healthcare hackathon initiative to demonstrate how bold neo-brutalist UX, responsive optical recognition, and regulatory APIs can empower citizens and healthcare practitioners in Nigeria.
        </p>

        <div className="pt-2 flex flex-wrap items-center gap-3 font-mono text-xs text-[#AAAAAA]">
          <span className="px-2 py-1 bg-[#262626] border border-[#444444] text-[#A9F04D]">
            STACK: REACT • TAILWIND • VITE
          </span>
          <span className="px-2 py-1 bg-[#262626] border border-[#444444] text-[#F5E947]">
            API: /api/v1/check SPEC
          </span>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center pt-2">
        <Link
          to="/check"
          className="neo-btn-primary px-8 py-4 text-sm sm:text-base uppercase tracking-wider gap-2 inline-flex"
        >
          <span>TRY THE MEDICINE CHECKER</span>
          <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />
        </Link>
      </div>

    </div>
  );
};
