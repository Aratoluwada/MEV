import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowUpRight, 
  Camera, 
  Search, 
  Mic, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  FileCheck, 
  Lock, 
  Pill,
  Sparkles,
  HelpCircle,
  Clock,
  ArrowRight
} from 'lucide-react';
import { Accordion, AccordionItemData } from '../components/ui/Accordion';
import { LanguageCode } from '../types';

interface HomeProps {
  language: LanguageCode;
}

export const Home: React.FC<HomeProps> = ({ language }) => {
  const faqItems: AccordionItemData[] = [
    {
      id: 'faq-1',
      question: 'Does a matching registration record prove a medicine is authentic?',
      tag: 'CRITICAL REGULATORY RULE',
      answer: (
        <div className="space-y-2">
          <p>
            <strong>No.</strong> A registration lookup confirms that the submitted details (such as NAFDAC Registration Number, manufacturer, strength, and active ingredients) correspond to an existing regulatory entry in the NAFDAC Green Book snapshot.
          </p>
          <p>
            It does not verify that the physical packaging in your hands came from the registered factory, that the chemical contents are unadulterated, or that the packaging has not been tampered with. For complete certainty, inspect physical tamper-evident seals and purchase only from registered pharmacies.
          </p>
        </div>
      )
    },
    {
      id: 'faq-2',
      question: 'What if no matching record is found?',
      tag: 'SEARCH OUTCOME',
      answer: (
        <div className="space-y-2">
          <p>
            If no record is found, it means the entered NRN or brand name is not recorded in our regulatory dataset snapshot. This does not automatically declare the product counterfeit; the registration could have been issued after this snapshot date, or there may be a typographical error in the number.
          </p>
          <p>
            We recommend double-checking the exact spelling and numbers on the pack, or consulting your pharmacist before taking the medication.
          </p>
        </div>
      )
    },
    {
      id: 'faq-3',
      question: 'What if the medicine name is spelled slightly differently?',
      tag: 'LABEL VARIATION',
      answer: (
        <p>
          Regulatory records often include the full proprietary and generic naming (for example, "Emzor Paracetamol 500mg Tablets" rather than simply "Emzor Paracetamol"). Our lookup engine highlights exact vs fuzzy matches and flags whether differences are minor naming variations or critical product mismatches.
        </p>
      )
    },
    {
      id: 'faq-4',
      question: 'Can I check using a photo of the pack?',
      tag: 'IMAGE RECOGNITION',
      answer: (
        <p>
          Yes. You can take a photo directly with your mobile camera (using the camera capture mode) or upload an existing photo. The tool will parse the label text, extract identifying details such as the NRN and dosage, and compare them against the registry snapshot.
        </p>
      )
    },
    {
      id: 'faq-5',
      question: 'What happens if the registry service is unavailable?',
      tag: 'SYSTEM RESILIENCE',
      answer: (
        <p>
          MEV includes an internal verified regulatory snapshot of popular registered medicines in Nigeria (Green Book records), ensuring you receive instant, offline-capable verification feedback even if live external networks experience downtime.
        </p>
      )
    },
    {
      id: 'faq-6',
      question: 'What should I do if an information mismatch is flagged?',
      tag: 'ACTION PROTOCOL',
      answer: (
        <p>
          If an NRN is registered to a different medicine (e.g., an antimalarial bearing a paracetamol NRN) or if strength/manufacturer discrepancies are identified, do not consume the product. Take the pack to a licensed pharmacist or contact NAFDAC directly for investigation.
        </p>
      )
    }
  ];

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      
      {/* 1. HERO SECTION — BOLD EDITORIAL COMPOSITION */}
      <section className="pt-6 sm:pt-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Editorial Headline & Actions */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border-2 border-[#171717] shadow-[2px_2px_0px_#171717] text-xs font-mono font-black uppercase tracking-wider text-[#171717]">
              <span className="w-2 h-2 bg-[#A9F04D] border border-[#171717]" />
              <span>NAFDAC REGULATORY CROSS-REFERENCE</span>
            </div>

            <h1 className="font-heading font-black text-4xl sm:text-6xl lg:text-7xl leading-[0.95] tracking-tight text-[#171717]">
              KNOW WHAT THE <br />
              <span className="bg-[#F5E947] px-2 border-2 border-[#171717] inline-block shadow-[4px_4px_0px_#171717] mt-1">
                RECORDS SAY.
              </span>
            </h1>

            <p className="text-base sm:text-xl text-[#222222] font-medium leading-relaxed max-w-xl">
              {language === 'pcm'
                ? 'Check medicine pack details against available NAFDAC Green Book registration records. Spot discrepancies and cloned registration numbers before you take assumptions.'
                : 'Check a medicine against available NAFDAC registration information. Spot inconsistencies, cloned numbers, and formulation mismatches before you make assumptions.'}
            </p>

            {/* CTA Group */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <Link
                to="/check"
                className="neo-btn-primary px-7 py-4 text-sm sm:text-base uppercase tracking-wider gap-2 text-center"
              >
                <span>{language === 'pcm' ? 'CHECK A MEDICINE NOW' : 'CHECK A MEDICINE'}</span>
                <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />
              </Link>
              <Link
                to="/how-it-works"
                className="neo-btn-secondary px-6 py-4 text-sm sm:text-base uppercase tracking-wider text-center"
              >
                <span>{language === 'pcm' ? 'SEE HOW E DEY WORK' : 'HOW IT WORKS'}</span>
              </Link>
            </div>

            {/* Small Safety Note */}
            <div className="pt-2 flex items-start gap-2.5 text-xs text-[#555555] font-mono">
              <ShieldAlert className="w-4 h-4 text-[#171717] shrink-0 mt-0.5" />
              <span>
                <strong>Important Notice:</strong> Registration checks confirm regulatory documentation records. They do not constitute physical chemical analysis or guarantee package authenticity.
              </span>
            </div>
          </div>

          {/* Right Column: Layered Neo-Brutalist Visual Artboard */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Decorative Accent Background Box */}
              <div className="absolute -top-3 -right-3 w-full h-full bg-[#4169F5] border-3 border-[#171717] shadow-[6px_6px_0px_#171717]" />
              
              {/* Secondary Accent Box */}
              <div className="absolute -bottom-3 -left-3 w-32 h-32 bg-[#A9F04D] border-3 border-[#171717] shadow-[4px_4px_0px_#171717] hidden sm:block" />

              {/* Foreground Technical Specimen Card */}
              <div className="relative bg-white border-3 border-[#171717] shadow-[8px_8px_0px_#171717] p-5 sm:p-6 space-y-4">
                
                {/* Header Strip */}
                <div className="flex items-center justify-between border-b-2 border-[#171717] pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-[#FF7B70] border border-[#171717]" />
                    <span className="font-mono text-xs font-black uppercase tracking-wider text-[#171717]">
                      REGISTRY SPECIMEN
                    </span>
                  </div>
                  <span className="neo-badge bg-[#F5E947] text-[#171717]">
                    DEMO DATA
                  </span>
                </div>

                {/* Simulated Pack Blueprint */}
                <div className="bg-[#FFF9ED] border-2 border-[#171717] p-4 space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[#888888]">PRODUCT_NAME</span>
                    <span className="font-bold text-[#171717]">Emzor Paracetamol 500mg</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#888888]">REG_NRN</span>
                    <span className="font-bold text-[#4169F5] bg-blue-50 px-1.5 py-0.5 border border-[#4169F5]">04-1234</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#888888]">ACTIVE_ING</span>
                    <span className="font-bold text-[#171717]">Paracetamol 500mg</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#888888]">STATUS</span>
                    <span className="font-bold text-[#171717] bg-[#A9F04D] px-1.5 py-0.5 border border-[#171717]">
                      RECORD FOUND [ACTIVE]
                    </span>
                  </div>
                </div>

                {/* Verification Checkmark Indicators */}
                <div className="space-y-1.5 pt-1 text-xs font-mono">
                  <div className="flex items-center gap-2 text-[#171717]">
                    <span className="w-4 h-4 bg-[#A9F04D] border border-[#171717] flex items-center justify-center font-black text-[10px]">✓</span>
                    <span>NRN Format: 04-XXXX compliant</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#171717]">
                    <span className="w-4 h-4 bg-[#A9F04D] border border-[#171717] flex items-center justify-center font-black text-[10px]">✓</span>
                    <span>Manufacturer matched to license record</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#171717]">
                    <span className="w-4 h-4 bg-[#F5E947] border border-[#171717] flex items-center justify-center font-black text-[10px]">!</span>
                    <span>Checks regulatory entry, not physical contents</span>
                  </div>
                </div>

                {/* Technical Annotation Footer */}
                <div className="pt-2 border-t-2 border-[#171717] flex items-center justify-between text-[10px] font-mono text-[#666666]">
                  <span>CODE: NRN-VERIFY-2024</span>
                  <span>MEV ENGINE SNAPSHOT</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. TRUST AND TRANSPARENCY STRIP */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 border-3 border-[#171717] bg-[#F5E947] shadow-[6px_6px_0px_#171717] divide-y-2 md:divide-y-0 md:divide-x-2 divide-[#171717]">
          
          <div className="p-6 bg-white space-y-2">
            <div className="font-mono text-xs font-bold text-[#4169F5] uppercase">
              [ 01 TRANSPARENCY ]
            </div>
            <h3 className="font-heading font-black text-lg text-[#171717]">
              Registry information, clearly explained
            </h3>
            <p className="text-xs sm:text-sm text-[#444444] leading-relaxed">
              We translate regulatory database fields into readable comparisons without confusing technical jargon.
            </p>
          </div>

          <div className="p-6 bg-[#FFF9ED] space-y-2">
            <div className="font-mono text-xs font-bold text-[#A9F04D] bg-[#171717] px-1.5 py-0.5 inline-block uppercase">
              [ 02 ACCESSIBILITY ]
            </div>
            <h3 className="font-heading font-black text-lg text-[#171717]">
              Three ways to check
            </h3>
            <p className="text-xs sm:text-sm text-[#444444] leading-relaxed">
              Scan packaging with your camera, type the NAFDAC number manually, or speak the medicine name aloud.
            </p>
          </div>

          <div className="p-6 bg-white space-y-2">
            <div className="font-mono text-xs font-bold text-[#FF7B70] uppercase">
              [ 03 INTEGRITY ]
            </div>
            <h3 className="font-heading font-black text-lg text-[#171717]">
              Transparent about uncertainty
            </h3>
            <p className="text-xs sm:text-sm text-[#444444] leading-relaxed">
              We never guess or declare a medicine "genuine" or "fake". We highlight exact records and report ambiguities honestly.
            </p>
          </div>

        </div>
      </section>

      {/* 3. HOW IT WORKS PREVIEW (3 Numbered Steps) */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b-2 border-[#171717] pb-4">
          <div>
            <div className="font-mono text-xs font-black uppercase text-[#4169F5] mb-1">
              [ INSPECTION PROCESS ]
            </div>
            <h2 className="font-heading font-black text-2xl sm:text-4xl text-[#171717]">
              HOW IT WORKS IN 3 STEPS
            </h2>
          </div>
          <Link
            to="/how-it-works"
            className="text-xs sm:text-sm font-heading font-bold text-[#171717] hover:underline flex items-center gap-1 shrink-0"
          >
            <span>Read full methodology</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Step 01 */}
          <div className="bg-white border-3 border-[#171717] p-6 shadow-[5px_5px_0px_#171717] space-y-4">
            <div className="w-12 h-12 bg-[#F5E947] border-2 border-[#171717] flex items-center justify-center font-heading font-black text-xl text-[#171717]">
              01
            </div>
            <h3 className="font-heading font-black text-xl text-[#171717]">
              Provide Medicine Details
            </h3>
            <p className="text-xs sm:text-sm text-[#444444] leading-relaxed">
              Snap a clear photo of the packaging label, enter the NRN registration number (e.g. 04-1234), or use voice input to state the brand name.
            </p>
            <div className="pt-2 text-xs font-mono font-bold text-[#4169F5]">
              CAMERA • TEXT • VOICE
            </div>
          </div>

          {/* Step 02 */}
          <div className="bg-white border-3 border-[#171717] p-6 shadow-[5px_5px_0px_#171717] space-y-4">
            <div className="w-12 h-12 bg-[#A9F04D] border-2 border-[#171717] flex items-center justify-center font-heading font-black text-xl text-[#171717]">
              02
            </div>
            <h3 className="font-heading font-black text-xl text-[#171717]">
              Cross-Compare Registry Records
            </h3>
            <p className="text-xs sm:text-sm text-[#444444] leading-relaxed">
              The engine queries the NAFDAC Green Book snapshot, checking the registered brand owner, strength, dosage form, active ingredients, and authorization date.
            </p>
            <div className="pt-2 text-xs font-mono font-bold text-[#171717]">
              SNAPSHOT CROSS-REFERENCE
            </div>
          </div>

          {/* Step 03 */}
          <div className="bg-white border-3 border-[#171717] p-6 shadow-[5px_5px_0px_#171717] space-y-4">
            <div className="w-12 h-12 bg-[#FF7B70] border-2 border-[#171717] flex items-center justify-center font-heading font-black text-xl text-[#171717]">
              03
            </div>
            <h3 className="font-heading font-black text-xl text-[#171717]">
              Review Matches & Discrepancies
            </h3>
            <p className="text-xs sm:text-sm text-[#444444] leading-relaxed">
              Inspect an itemized side-by-side table. If an NRN belongs to another medicine or if manufacturer details clash, discrepancies are clearly flagged.
            </p>
            <div className="pt-2 text-xs font-mono font-bold text-[#FF7B70]">
              CLEAR ACTION GUIDELINES
            </div>
          </div>

        </div>
      </section>

      {/* 4. ASYMMETRIC EDITORIAL FEATURE GRID */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
        <div className="border-b-2 border-[#171717] pb-4">
          <div className="font-mono text-xs font-black uppercase text-[#FF7B70] mb-1">
            [ SYSTEM CAPABILITIES ]
          </div>
          <h2 className="font-heading font-black text-2xl sm:text-4xl text-[#171717]">
            DESIGNED FOR RIGOROUS REGULATORY CHECKS
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Feature 1: Camera & Image Scan (Large Span 7) */}
          <div className="md:col-span-7 bg-[#FFF9ED] border-3 border-[#171717] p-6 sm:p-8 shadow-[6px_6px_0px_#171717] space-y-4">
            <div className="p-3 bg-[#F5E947] border-2 border-[#171717] inline-block">
              <Camera className="w-6 h-6 text-[#171717]" />
            </div>
            <h3 className="font-heading font-black text-2xl text-[#171717]">
              Camera & High-Contrast Packaging OCR
            </h3>
            <p className="text-xs sm:text-sm text-[#333333] leading-relaxed">
              Use your mobile camera directly in the browser with environment-capture mode. The system locates label text, extracts the NAFDAC registration code and manufacturer markings, and prepares them for verification.
            </p>
            <div className="pt-2 flex flex-wrap gap-2 text-xs font-mono">
              <span className="neo-badge bg-white">CAMERA CAPTURE</span>
              <span className="neo-badge bg-white">LABEL PARSING</span>
              <span className="neo-badge bg-white">RETAKE CONTROL</span>
            </div>
          </div>

          {/* Feature 2: Cloned NRN Detection (Span 5) */}
          <div className="md:col-span-5 bg-white border-3 border-[#171717] p-6 sm:p-8 shadow-[6px_6px_0px_#171717] space-y-4">
            <div className="p-3 bg-[#FF7B70] border-2 border-[#171717] inline-block">
              <AlertTriangle className="w-6 h-6 text-[#171717]" />
            </div>
            <h3 className="font-heading font-black text-xl text-[#171717]">
              Cloned Registration Number Flagging
            </h3>
            <p className="text-xs sm:text-sm text-[#333333] leading-relaxed">
              A major vulnerability is packaging that copies a legitimate NRN from an unrelated product (e.g. putting a paracetamol NRN onto an antimalarial). MEV instantly flags this conflict.
            </p>
          </div>

          {/* Feature 3: Voice Assisted Input (Span 4) */}
          <div className="md:col-span-4 bg-white border-3 border-[#171717] p-6 shadow-[5px_5px_0px_#171717] space-y-3">
            <div className="p-2.5 bg-[#4169F5] text-white border-2 border-[#171717] inline-block">
              <Mic className="w-5 h-5" />
            </div>
            <h3 className="font-heading font-black text-lg text-[#171717]">
              Voice-Assisted Input
            </h3>
            <p className="text-xs text-[#444444] leading-relaxed">
              Speak the medicine name or NAFDAC code. Speech recognition transcribes your input with editable previews and fallback options.
            </p>
          </div>

          {/* Feature 4: Side-by-Side Verification Table (Span 4) */}
          <div className="md:col-span-4 bg-white border-3 border-[#171717] p-6 shadow-[5px_5px_0px_#171717] space-y-3">
            <div className="p-2.5 bg-[#A9F04D] text-[#171717] border-2 border-[#171717] inline-block">
              <FileCheck className="w-5 h-5" />
            </div>
            <h3 className="font-heading font-black text-lg text-[#171717]">
              Side-by-Side Comparison
            </h3>
            <p className="text-xs text-[#444444] leading-relaxed">
              Inspect submitted packaging attributes directly opposite registered database fields. Every discrepancy is explicitly marked.
            </p>
          </div>

          {/* Feature 5: Duplicate Ingredient Warning Basket (Span 4) */}
          <div className="md:col-span-4 bg-[#F5E947] border-3 border-[#171717] p-6 shadow-[5px_5px_0px_#171717] space-y-3">
            <div className="p-2.5 bg-[#171717] text-[#F5E947] border-2 border-[#171717] inline-block font-mono font-bold text-xs">
              BASKET
            </div>
            <h3 className="font-heading font-black text-lg text-[#171717]">
              Duplicate Ingredient Warning
            </h3>
            <p className="text-xs text-[#222222] leading-relaxed">
              Add multiple checked packs to your basket. The system warns if you are combining medicines containing identical active pharmaceutical ingredients.
            </p>
          </div>

        </div>
      </section>

      {/* 5. VISUALLY PROMINENT SAFETY BANNER */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="bg-[#FF7B70] border-4 border-[#171717] p-6 sm:p-10 shadow-[8px_8px_0px_#171717] text-[#171717] space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#171717] text-white border-2 border-[#171717]">
              <ShieldAlert className="w-6 h-6 text-[#F5E947]" />
            </div>
            <h3 className="font-heading font-black text-xl sm:text-3xl uppercase tracking-tight">
              Safety Constitution: Registration ≠ Physical Authenticity
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 text-xs sm:text-sm font-medium leading-relaxed">
            <p>
              A matching registration record indicates that the manufacturer submitted proper regulatory paperwork and holds a valid NAFDAC authorization code for this formulation. It <strong>cannot</strong> prove that the specific physical bottle or blister strip in your hands was manufactured by that licensed entity.
            </p>
            <p>
              Likewise, a missing or unlocated record does not automatically prove a medicine is illicit. In all situations involving doubt, suspicious packaging, unsealed caps, or adverse drug effects, consult a registered pharmacist or report the product directly to NAFDAC.
            </p>
          </div>

          <div className="pt-2 border-t-2 border-[#171717] flex flex-wrap items-center justify-between gap-3 font-mono text-xs font-bold">
            <span>NEVER USE AS A SUBSTITUTE FOR MEDICAL OR PHARMACEUTICAL COUNSEL</span>
            <Link to="/safety" className="underline hover:text-white flex items-center gap-1">
              <span>Read complete Safety Guide</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* 6. FAQ ACCORDION SECTION */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-6">
        <div className="border-b-2 border-[#171717] pb-3 text-center sm:text-left">
          <div className="font-mono text-xs font-black uppercase text-[#4169F5] mb-1">
            [ FREQUENTLY ASKED QUESTIONS ]
          </div>
          <h2 className="font-heading font-black text-2xl sm:text-4xl text-[#171717]">
            CLARITY BEFORE ASSUMPTIONS
          </h2>
        </div>

        <Accordion items={faqItems} defaultOpenIndex={0} />
      </section>

      {/* 7. FINAL HIGH-CONTRAST CTA SECTION */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="bg-[#171717] text-[#FFF9ED] border-4 border-[#171717] p-8 sm:p-14 shadow-[8px_8px_0px_#F5E947] text-center space-y-6">
          <div className="inline-block px-3 py-1 bg-[#F5E947] text-[#171717] font-mono text-xs font-black uppercase border border-white">
            OPEN REGULATORY WORKSPACE
          </div>

          <h2 className="font-heading font-black text-3xl sm:text-5xl lg:text-6xl text-white max-w-2xl mx-auto leading-tight">
            CHECK A MEDICINE AGAINST THE NAFDAC REGISTRY.
          </h2>

          <p className="text-sm sm:text-base text-[#CCCCCC] max-w-lg mx-auto leading-relaxed">
            Ready to inspect your medicine pack? Use camera capture, text search, or voice to examine registration records immediately.
          </p>

          <div className="pt-4 flex justify-center">
            <Link
              to="/check"
              className="neo-btn-primary px-8 py-4 text-base uppercase tracking-wider gap-2 shadow-[4px_4px_0px_#FFFFFF]"
            >
              <span>{language === 'pcm' ? 'OPEN MEDICINE CHECKER' : 'OPEN MEDICINE CHECKER'}</span>
              <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};
