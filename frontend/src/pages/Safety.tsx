import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldAlert, 
  Check, 
  X, 
  HelpCircle, 
  ArrowRight, 
  Pill, 
  AlertTriangle,
  UserCheck
} from 'lucide-react';
import { Accordion, AccordionItemData } from '../components/ui/Accordion';
import { LanguageCode } from '../types';

interface SafetyProps {
  language: LanguageCode;
}

export const Safety: React.FC<SafetyProps> = ({ language }) => {
  const safetyFaqs: AccordionItemData[] = [
    {
      id: 'safety-faq-1',
      question: 'Why does a matching registration record NOT prove physical authenticity?',
      tag: 'AUTHENTICITY BOUNDARY',
      answer: (
        <div className="space-y-2">
          <p>
            An official registration number is public information. While legitimate manufacturers print their assigned NRN on authentic products, any unauthorized entity could potentially copy and print that exact same valid number onto packaging.
          </p>
          <p>
            Therefore, confirming that "04-1234 belongs to Emzor Paracetamol" proves only that the registration entry exists on paper. It cannot verify whether the physical tablet or blister pack came from Emzor's approved factory. Authenticity requires examining tamper-evident holograms, batch verification systems, and purchasing through licensed pharmacy chains.
          </p>
        </div>
      )
    },
    {
      id: 'safety-faq-2',
      question: 'Why does "No Record Found" NOT automatically mean a medicine is counterfeit?',
      tag: 'SNAPSHOT LIMITATION',
      answer: (
        <div className="space-y-2">
          <p>
            Our tool cross-references against periodic regulatory snapshots (such as the 2024 NAFDAC Green Book export). A medicine could be completely legal and registered if:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Its marketing authorization was granted recently, after our snapshot export date.</li>
            <li>There was a typographical error in the NRN or brand spelling entered into the search.</li>
            <li>The product is an emergency authorization or specialized institutional import.</li>
          </ul>
        </div>
      )
    },
    {
      id: 'safety-faq-3',
      question: 'What should I do if a check flags an Information Mismatch?',
      tag: 'RECOMMENDED PROTOCOL',
      answer: (
        <div className="space-y-2">
          <p>
            If the NRN is registered to a different active substance, dosage, or manufacturer, do <strong>not</strong> consume the medicine.
          </p>
          <ol className="list-decimal pl-5 space-y-1">
            <li>Keep the packaging, receipt, and purchase location details intact.</li>
            <li>Take the pack to a registered pharmacist or doctor for visual inspection.</li>
            <li>Contact NAFDAC Consumer Safety / Pharmacovigilance desk or your local regulatory office.</li>
          </ol>
        </div>
      )
    },
    {
      id: 'safety-faq-4',
      question: 'Can this tool diagnose or prescribe medicine?',
      tag: 'CLINICAL BOUNDARY',
      answer: (
        <p>
          <strong>Absolutely not.</strong> MEV is strictly an informational data cross-referencing tool. It does not provide medical diagnoses, treatment recommendations, dosage calculators, or clinical safety assurances. Always follow prescription guidelines issued by a licensed physician.
        </p>
      )
    }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14 space-y-14">
      
      {/* HEADER */}
      <div className="border-b-3 border-[#171717] pb-6 space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FF7B70] border-2 border-[#171717] shadow-[2px_2px_0px_#171717] text-xs font-mono font-black uppercase tracking-wider text-[#171717]">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>TRANSPARENCY & CLINICAL SAFETY CONSTITUTION</span>
        </div>

        <h1 className="font-heading font-black text-3xl sm:text-5xl text-[#171717] tracking-tight">
          SAFETY & LIMITATIONS
        </h1>

        <p className="text-sm sm:text-base text-[#444444] font-medium max-w-2xl leading-relaxed">
          Healthcare technology must never overpromise. Here is an explicit, transparent breakdown of what this tool can do, what it cannot do, and why regulatory checks are not proof of physical authenticity.
        </p>
      </div>

      {/* CORE COMPARISON: CAN DO VS CANNOT DO */}
      <div className="space-y-4">
        <h2 className="font-heading font-black text-2xl text-[#171717]">
          CAPABILITIES & SCOPE BOUNDARIES
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* What This Tool CAN Do */}
          <div className="bg-[#A9F04D]/30 border-3 border-[#171717] p-6 shadow-[5px_5px_0px_#171717] space-y-4">
            <div className="flex items-center gap-2 border-b-2 border-[#171717] pb-3">
              <span className="w-8 h-8 bg-[#A9F04D] border-2 border-[#171717] flex items-center justify-center font-black">
                <Check className="w-5 h-5 stroke-[3]" />
              </span>
              <h3 className="font-heading font-black text-lg text-[#171717] uppercase">
                What This Tool CAN Do
              </h3>
            </div>

            <ul className="space-y-3 text-xs sm:text-sm text-[#171717] font-medium">
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-[#171717] shrink-0 mt-0.5 stroke-[3]" />
                <span>Verify if an NRN exists in public NAFDAC Green Book snapshot datasets.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-[#171717] shrink-0 mt-0.5 stroke-[3]" />
                <span>Highlight discrepancies when an NRN belongs to a completely different medicine.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-[#171717] shrink-0 mt-0.5 stroke-[3]" />
                <span>Confirm if the registered brand name, strength, dosage form, and manufacturer align.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-[#171717] shrink-0 mt-0.5 stroke-[3]" />
                <span>Alert users if a registration permit has passed its regulatory expiration date.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-[#171717] shrink-0 mt-0.5 stroke-[3]" />
                <span>Flag duplicate active pharmaceutical ingredients across multiple checked medicines in your basket.</span>
              </li>
            </ul>
          </div>

          {/* What This Tool CANNOT Do */}
          <div className="bg-[#FF7B70]/30 border-3 border-[#171717] p-6 shadow-[5px_5px_0px_#171717] space-y-4">
            <div className="flex items-center gap-2 border-b-2 border-[#171717] pb-3">
              <span className="w-8 h-8 bg-[#FF7B70] border-2 border-[#171717] flex items-center justify-center font-black">
                <X className="w-5 h-5 stroke-[3]" />
              </span>
              <h3 className="font-heading font-black text-lg text-[#171717] uppercase">
                What This Tool CANNOT Do
              </h3>
            </div>

            <ul className="space-y-3 text-xs sm:text-sm text-[#171717] font-medium">
              <li className="flex items-start gap-2.5">
                <X className="w-4 h-4 text-[#171717] shrink-0 mt-0.5 stroke-[3]" />
                <span>It CANNOT test the chemical composition or purity of physical tablets or liquids.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <X className="w-4 h-4 text-[#171717] shrink-0 mt-0.5 stroke-[3]" />
                <span>It CANNOT guarantee that packaging has not been tampered with or refilled.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <X className="w-4 h-4 text-[#171717] shrink-0 mt-0.5 stroke-[3]" />
                <span>It CANNOT declare a physical product "authentic", "genuine", "counterfeit", or "safe".</span>
              </li>
              <li className="flex items-start gap-2.5">
                <X className="w-4 h-4 text-[#171717] shrink-0 mt-0.5 stroke-[3]" />
                <span>It CANNOT replace diagnostic guidance, medical consultations, or prescription advice.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <X className="w-4 h-4 text-[#171717] shrink-0 mt-0.5 stroke-[3]" />
                <span>It CANNOT guarantee real-time updates for approvals granted after the snapshot date.</span>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* WHY A MATCH DOES NOT EQUAL AUTHENTICITY */}
      <div className="bg-white border-3 border-[#171717] p-6 sm:p-8 shadow-[6px_6px_0px_#171717] space-y-4">
        <h3 className="font-heading font-black text-xl sm:text-2xl text-[#171717]">
          WHY REGISTRATION MATCH ≠ PHYSICAL PACK AUTHENTICITY
        </h3>
        <p className="text-xs sm:text-sm text-[#333333] leading-relaxed">
          Regulatory registration is a legal license awarded by NAFDAC to a pharmaceutical company allowing them to manufacture or import a specific drug formulation into Nigeria.
        </p>
        <p className="text-xs sm:text-sm text-[#333333] leading-relaxed">
          Because NAFDAC numbers are visibly printed on legitimate cartons, unauthorized actors can simply print an existing, active registration number onto unauthorized packaging. Therefore, confirming that a registration number exists in the Green Book is an essential prerequisite, but never sufficient on its own to confirm physical product legitimacy.
        </p>
      </div>

      {/* SAFE MEDICATION CHECKLIST */}
      <div className="bg-[#FFF9ED] border-3 border-[#171717] p-6 sm:p-8 shadow-[6px_6px_0px_#171717] space-y-4">
        <div className="flex items-center gap-2">
          <UserCheck className="w-6 h-6 text-[#4169F5]" />
          <h3 className="font-heading font-black text-xl text-[#171717]">
            PRACTICAL SAFETY MEASURES FOR PATIENTS
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="bg-white border-2 border-[#171717] p-4 space-y-1.5 shadow-[2px_2px_0px_#171717]">
            <span className="font-mono text-xs font-black text-[#4169F5]">01 SEAL & TAMPER</span>
            <h4 className="font-heading font-bold text-sm text-[#171717]">Inspect Physical Seals</h4>
            <p className="text-xs text-[#555555] leading-relaxed">
              Verify that bottle security caps, blister foils, and holographic seals are intact and unpierced.
            </p>
          </div>

          <div className="bg-white border-2 border-[#171717] p-4 space-y-1.5 shadow-[2px_2px_0px_#171717]">
            <span className="font-mono text-xs font-black text-[#4169F5]">02 LICENSED SOURCING</span>
            <h4 className="font-heading font-bold text-sm text-[#171717]">Buy From Licensed Pharmacies</h4>
            <p className="text-xs text-[#555555] leading-relaxed">
              Purchase medications only from registered premises registered with the Pharmacists Council of Nigeria (PCN).
            </p>
          </div>

          <div className="bg-white border-2 border-[#171717] p-4 space-y-1.5 shadow-[2px_2px_0px_#171717]">
            <span className="font-mono text-xs font-black text-[#4169F5]">03 PHARMACIST COUNSEL</span>
            <h4 className="font-heading font-bold text-sm text-[#171717]">When in Doubt, Ask</h4>
            <p className="text-xs text-[#555555] leading-relaxed">
              Never take medicine that appears discolored, crumbly, foul-smelling, or inconsistent with your usual prescription.
            </p>
          </div>
        </div>
      </div>

      {/* SAFETY FAQS */}
      <div className="space-y-4">
        <h2 className="font-heading font-black text-2xl text-[#171717]">
          SAFETY & REGULATORY FAQS
        </h2>
        <Accordion items={safetyFaqs} defaultOpenIndex={0} />
      </div>

      {/* PROCEED CTA */}
      <div className="pt-2 text-center">
        <Link
          to="/check"
          className="neo-btn-primary px-8 py-3.5 text-sm uppercase tracking-wider gap-2 inline-flex"
        >
          <span>PROCEED WITH INFORMED CAUTION</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

    </div>
  );
};
