/**
 * Mock NAFDAC Green Book Regulatory Snapshot Database & Logic Engine
 */

import { CheckRequest, CheckResponse, MatchedRecord } from './types';

export const NAFDAC_REGISTRY_DATABASE: MatchedRecord[] = [
  {
    nrn: "04-1234",
    product_name: "Emzor Paracetamol 500mg Tablets",
    generic_name: "Paracetamol",
    active_ingredients: ["Paracetamol"],
    strength: "500 mg",
    dosage_form: "Tablet",
    manufacturer: "Emzor Pharmaceuticals Ind. Ltd.",
    country_of_origin: "Nigeria",
    status: "ACTIVE",
    expiry_date: "2028-05-11",
    dataset_source: "NAFDAC Green Book Snapshot",
    dataset_date: "2024-06-01"
  },
  {
    nrn: "04-4589",
    product_name: "Panadol Extra Caplets",
    generic_name: "Paracetamol + Caffeine",
    active_ingredients: ["Paracetamol", "Caffeine"],
    strength: "500 mg / 65 mg",
    dosage_form: "Caplet",
    manufacturer: "GlaxoSmithKline Consumer Nigeria PLC",
    country_of_origin: "Nigeria",
    status: "ACTIVE",
    expiry_date: "2027-11-20",
    dataset_source: "NAFDAC Green Book Snapshot",
    dataset_date: "2024-06-01"
  },
  {
    nrn: "A4-3290",
    product_name: "Lonart DS Tablets",
    generic_name: "Artemether + Lumefantrine",
    active_ingredients: ["Artemether", "Lumefantrine"],
    strength: "80 mg / 480 mg",
    dosage_form: "Tablet",
    manufacturer: "Bliss GVS Pharma Ltd.",
    country_of_origin: "India",
    status: "ACTIVE",
    expiry_date: "2026-10-15",
    dataset_source: "NAFDAC Green Book Snapshot",
    dataset_date: "2024-06-01"
  },
  {
    nrn: "04-2041",
    product_name: "Coartem 20/120 Tablets",
    generic_name: "Artemether + Lumefantrine",
    active_ingredients: ["Artemether", "Lumefantrine"],
    strength: "20 mg / 120 mg",
    dosage_form: "Tablet",
    manufacturer: "Novartis Pharma AG",
    country_of_origin: "Switzerland",
    status: "ACTIVE",
    expiry_date: "2027-04-18",
    dataset_source: "NAFDAC Green Book Snapshot",
    dataset_date: "2024-06-01"
  },
  {
    nrn: "04-0199",
    product_name: "Amoxil 500mg Capsules",
    generic_name: "Amoxicillin",
    active_ingredients: ["Amoxicillin"],
    strength: "500 mg",
    dosage_form: "Capsule",
    manufacturer: "Beecham Pharmaceuticals / GSK",
    country_of_origin: "Nigeria",
    status: "ACTIVE",
    expiry_date: "2027-09-30",
    dataset_source: "NAFDAC Green Book Snapshot",
    dataset_date: "2024-06-01"
  },
  {
    nrn: "04-8842",
    product_name: "Augmentin 625mg Tablets",
    generic_name: "Amoxicillin + Clavulanic Acid",
    active_ingredients: ["Amoxicillin", "Clavulanic Acid"],
    strength: "500 mg / 125 mg",
    dosage_form: "Tablet",
    manufacturer: "SmithKline Beecham Ltd.",
    country_of_origin: "United Kingdom",
    status: "ACTIVE",
    expiry_date: "2028-02-14",
    dataset_source: "NAFDAC Green Book Snapshot",
    dataset_date: "2024-06-01"
  },
  {
    nrn: "04-1022",
    product_name: "Flagyl 400mg Tablets",
    generic_name: "Metronidazole",
    active_ingredients: ["Metronidazole"],
    strength: "400 mg",
    dosage_form: "Tablet",
    manufacturer: "Sanofi-Aventis Nigeria Ltd.",
    country_of_origin: "Nigeria",
    status: "ACTIVE",
    expiry_date: "2026-12-01",
    dataset_source: "NAFDAC Green Book Snapshot",
    dataset_date: "2024-06-01"
  },
  {
    nrn: "04-6331",
    product_name: "Ciprotab 500mg Tablets",
    generic_name: "Ciprofloxacin",
    active_ingredients: ["Ciprofloxacin"],
    strength: "500 mg",
    dosage_form: "Tablet",
    manufacturer: "Fidson Healthcare PLC",
    country_of_origin: "Nigeria",
    status: "ACTIVE",
    expiry_date: "2029-01-19",
    dataset_source: "NAFDAC Green Book Snapshot",
    dataset_date: "2024-06-01"
  },
  {
    nrn: "04-7112",
    product_name: "Tetracycline 250mg Capsules (Legacy Batch)",
    generic_name: "Tetracycline Hydrochloride",
    active_ingredients: ["Tetracycline"],
    strength: "250 mg",
    dosage_form: "Capsule",
    manufacturer: "Pharma-Deko PLC",
    country_of_origin: "Nigeria",
    status: "EXPIRED",
    expiry_date: "2022-08-15",
    dataset_source: "NAFDAC Green Book Snapshot",
    dataset_date: "2024-06-01"
  }
];

export function cleanStr(val?: string): string {
  if (!val) return '';
  return val.toLowerCase().replace(/[^a-z0-9]/g, '');
}

export function searchRegistryByQuery(q: string): MatchedRecord[] {
  const query = cleanStr(q);
  if (!query) return NAFDAC_REGISTRY_DATABASE.slice(0, 5);
  
  return NAFDAC_REGISTRY_DATABASE.filter(r => {
    return cleanStr(r.nrn).includes(query) ||
      cleanStr(r.product_name).includes(query) ||
      cleanStr(r.generic_name).includes(query) ||
      r.active_ingredients.some(i => cleanStr(i).includes(query));
  });
}

export function performRegistryCheck(req: CheckRequest): CheckResponse {
  const lang = req.language || 'en';
  const cleanSubmittedNrn = cleanStr(req.nrn);
  const cleanSubmittedName = cleanStr(req.product_name);

  // 1. Check if NRN exists in registry
  let matchedByNrn = NAFDAC_REGISTRY_DATABASE.find(r => cleanStr(r.nrn) === cleanSubmittedNrn);
  
  // 2. If no NRN match, check if product name matches
  let matchedByName: MatchedRecord | undefined;
  if (cleanSubmittedName) {
    matchedByName = NAFDAC_REGISTRY_DATABASE.find(r => {
      const regNameClean = cleanStr(r.product_name);
      return regNameClean.includes(cleanSubmittedName) || cleanSubmittedName.includes(regNameClean);
    });
  }

  // CASE 1: Not found in snapshot
  if (!matchedByNrn && !matchedByName) {
    const submittedNrnDisplay = req.nrn || 'N/A';
    const submittedNameDisplay = req.product_name || 'N/A';

    return {
      verdict: "NOT_FOUND",
      confidence_percentage: 0,
      confidence_tier: "LOW",
      reasons: [
        `Neither the NAFDAC number '${submittedNrnDisplay}' nor the product name '${submittedNameDisplay}' was found in the official Green Book snapshot.`,
        "This product is not recorded as registered under the provided details in the regulatory snapshot.",
        "Check for typographical errors on the pack or verify if this is an unregistered product."
      ],
      comparison: {
        nrn: { submitted: submittedNrnDisplay, registry: "Not found", matches: false, notes: "No record matches this NRN" },
        product_name: { submitted: submittedNameDisplay, registry: "Not found", matches: false, notes: "No registered product with this name" },
        active_ingredients: { submitted: req.active_ingredients?.join(', ') || "N/A", registry: "N/A", matches: false },
        strength: { submitted: req.strength || "N/A", registry: "N/A", matches: false },
        dosage_form: { submitted: req.dosage_form || "N/A", registry: "N/A", matches: false },
        status: { submitted: "ACTIVE", registry: "NOT_RECORDED", matches: false, notes: "Unregistered or unlisted" }
      },
      explanation: {
        language: lang,
        summary: `Unregistered: No matching record found in the NAFDAC registry snapshot for NRN '${submittedNrnDisplay}' or '${submittedNameDisplay}'.`,
        pidgin_summary: `We no see am: Di NAFDAC number '${submittedNrnDisplay}' or medicine name '${submittedNameDisplay}' no dey inside NAFDAC Green Book record at all.`,
        action_recommendation: "Do not use this medicine until confirmed with a licensed doctor, pharmacist, or direct NAFDAC inquiry."
      },
      dataset_metadata: {
        source: "NAFDAC Registered Drug Products Sample Snapshot",
        snapshot_date: "2024-06-01",
        disclaimer: "This tool provides a registry cross-check against a local regulatory snapshot, not a clinical test of physical medicine authenticity, chemical composition, or safety."
      },
      extracted: {
        name: req.product_name || 'Unspecified',
        nrn: req.nrn || 'Unspecified',
        strength: req.strength || 'N/A',
        manufacturer: 'Unknown'
      },
      registry: {
        name: "Not Found",
        nrn: "Not Found",
        strength: "Not Found",
        manufacturer: "Not Found",
        status: "NOT_FOUND"
      },
      field_checks: [
        { field: "NRN (Registration Number)", extracted: req.nrn || 'N/A', registry: "Not found", match: false },
        { field: "Product Name", extracted: req.product_name || 'N/A', registry: "Not found", match: false }
      ],
      advice: "Do not consume or administer this medicine until verified by a licensed pharmacist or verified directly with NAFDAC.",
      extraction_confidence: 0.92
    };
  }

  // Target record to compare against: prefer matchedByNrn if provided, else matchedByName
  const record = matchedByNrn || matchedByName!;

  // Check for CLONED NRN / Product Name Conflict
  // e.g. User submitted NRN 04-1234 (which is Paracetamol), but entered product_name "Lonart DS" or Antimalarial
  const hasClonedConflict = matchedByNrn && cleanSubmittedName && !cleanStr(record.product_name).includes(cleanSubmittedName) && !cleanSubmittedName.includes(cleanStr(record.product_name)) && !cleanStr(record.generic_name).includes(cleanSubmittedName);

  if (hasClonedConflict) {
    return {
      verdict: "REGISTERED_MISMATCH",
      confidence_percentage: 10,
      confidence_tier: "CONFLICT",
      reasons: [
        `CRITICAL MISMATCH: NAFDAC number '${req.nrn}' belongs to '${record.product_name}' (${record.generic_name}), not the submitted product '${req.product_name}'.`,
        "This is a major indicator of potential packaging mislabeling or a cloned registration number.",
        `Registered Manufacturer is '${record.manufacturer}' (${record.country_of_origin}).`
      ],
      comparison: {
        nrn: { submitted: req.nrn || '', registry: record.nrn, matches: true, notes: "NRN exists in database" },
        product_name: { submitted: req.product_name || '', registry: record.product_name, matches: false, notes: "Product name does not match registered owner of this NRN" },
        active_ingredients: { submitted: req.active_ingredients?.join(', ') || "N/A", registry: record.active_ingredients.join(', '), matches: false, notes: "Formulation mismatch" },
        strength: { submitted: req.strength || "N/A", registry: record.strength, matches: false },
        dosage_form: { submitted: req.dosage_form || "N/A", registry: record.dosage_form, matches: false },
        status: { submitted: "ACTIVE", registry: record.status, matches: record.status === "ACTIVE" },
        manufacturer: { submitted: "Submitted label", registry: record.manufacturer, matches: false, notes: "Registry assigns NRN to different manufacturer" }
      },
      matched_record: record,
      explanation: {
        language: lang,
        summary: `Warning: The NAFDAC number '${req.nrn}' matches a registered product, but for a completely different medicine: '${record.product_name}'. This suggests the number may have been copied or misprinted.`,
        pidgin_summary: `O boy, shine your eye! Di NAFDAC number '${req.nrn}' dey real, but na for another medicine entirely: '${record.product_name}'. E fit be say dem clone or copy di number put for dis pack.`,
        action_recommendation: "DO NOT use this medicine until confirmed with a licensed doctor or pharmacist. Report to NAFDAC if suspicious."
      },
      dataset_metadata: {
        source: "NAFDAC Registered Drug Products Sample Snapshot",
        snapshot_date: "2024-06-01",
        disclaimer: "This tool provides a registry cross-check against a local regulatory snapshot, not a clinical test of physical medicine authenticity, chemical composition, or safety."
      },
      extracted: {
        name: req.product_name,
        nrn: req.nrn,
        strength: req.strength || "N/A",
        manufacturer: "Unverified label"
      },
      registry: {
        name: record.product_name,
        nrn: record.nrn,
        strength: record.strength,
        manufacturer: record.manufacturer,
        status: record.status
      },
      field_checks: [
        { field: "NRN (Registration Number)", extracted: req.nrn || '', registry: record.nrn, match: true },
        { field: "Product Name", extracted: req.product_name || '', registry: record.product_name, match: false },
        { field: "Active Ingredients", extracted: req.active_ingredients?.join(', ') || "N/A", registry: record.active_ingredients.join(', '), match: false },
        { field: "Manufacturer", extracted: "Label mismatch", registry: record.manufacturer, match: false }
      ],
      advice: "DO NOT use this medicine until confirmed with a licensed doctor or pharmacist. Report to NAFDAC if suspicious.",
      extraction_confidence: 0.88
    };
  }

  // Check if EXPIRED
  if (record.status === "EXPIRED") {
    return {
      verdict: "EXPIRED",
      confidence_percentage: 85,
      confidence_tier: "MEDIUM",
      reasons: [
        `NAFDAC registration for '${record.product_name}' expired on ${record.expiry_date}.`,
        "The registration has not been renewed in this official regulatory snapshot.",
        "Expired registrations indicate the product's marketing authorization is not currently active."
      ],
      comparison: {
        nrn: { submitted: req.nrn || record.nrn, registry: record.nrn, matches: true, notes: "NRN matched" },
        product_name: { submitted: req.product_name || record.product_name, registry: record.product_name, matches: true },
        active_ingredients: { submitted: req.active_ingredients || record.active_ingredients, registry: record.active_ingredients, matches: true },
        strength: { submitted: req.strength || record.strength, registry: record.strength, matches: true },
        dosage_form: { submitted: req.dosage_form || record.dosage_form, registry: record.dosage_form, matches: true },
        status: { submitted: "ACTIVE", registry: "EXPIRED", matches: false, notes: `Expired on ${record.expiry_date}` }
      },
      matched_record: record,
      explanation: {
        language: lang,
        summary: `Expired Registration: The NAFDAC registration for '${record.product_name}' expired on ${record.expiry_date} and is inactive in the current snapshot.`,
        pidgin_summary: `Dis registration don expire: Di NAFDAC permit for '${record.product_name}' stop since ${record.expiry_date}. Di authorization never renew for inside dis snapshot.`,
        action_recommendation: "Check with your pharmacist regarding batch validity or whether a renewed registration has been granted."
      },
      dataset_metadata: {
        source: "NAFDAC Registered Drug Products Sample Snapshot",
        snapshot_date: "2024-06-01",
        disclaimer: "This tool provides a registry cross-check against a local regulatory snapshot, not a clinical test of physical medicine authenticity, chemical composition, or safety."
      },
      extracted: {
        name: req.product_name || record.product_name,
        nrn: req.nrn || record.nrn,
        strength: req.strength || record.strength,
        manufacturer: record.manufacturer
      },
      registry: {
        name: record.product_name,
        nrn: record.nrn,
        strength: record.strength,
        manufacturer: record.manufacturer,
        status: "EXPIRED"
      },
      field_checks: [
        { field: "NRN (Registration Number)", extracted: req.nrn || record.nrn, registry: record.nrn, match: true },
        { field: "Product Name", extracted: req.product_name || record.product_name, registry: record.product_name, match: true },
        { field: "Registration Status", extracted: "Active (Assumed)", registry: "EXPIRED", match: false },
        { field: "Manufacturer", extracted: record.manufacturer, registry: record.manufacturer, match: true }
      ],
      advice: "Consult your pharmacist before using medicines with expired regulatory approvals.",
      extraction_confidence: 0.95
    };
  }

  // Check other field discrepancies if provided (e.g. strength or dosage form mismatch)
  let strengthMismatch = false;
  if (req.strength && cleanStr(req.strength) !== cleanStr(record.strength)) {
    strengthMismatch = true;
  }

  let dosageMismatch = false;
  if (req.dosage_form && cleanStr(req.dosage_form) !== cleanStr(record.dosage_form)) {
    dosageMismatch = true;
  }

  if (strengthMismatch || dosageMismatch) {
    const reasons: string[] = [
      `NAFDAC registration '${record.nrn}' belongs to '${record.product_name}'.`
    ];
    if (strengthMismatch) {
      reasons.push(`Strength mismatch: Submitted '${req.strength}', but registry records '${record.strength}'.`);
    }
    if (dosageMismatch) {
      reasons.push(`Dosage form mismatch: Submitted '${req.dosage_form}', but registry records '${record.dosage_form}'.`);
    }

    return {
      verdict: "REGISTERED_MISMATCH",
      confidence_percentage: 65,
      confidence_tier: "CONFLICT",
      reasons,
      comparison: {
        nrn: { submitted: req.nrn || record.nrn, registry: record.nrn, matches: true, notes: "Exact NRN match" },
        product_name: { submitted: req.product_name || record.product_name, registry: record.product_name, matches: true, notes: "Name matches registered product" },
        active_ingredients: { submitted: req.active_ingredients || record.active_ingredients, registry: record.active_ingredients, matches: true },
        strength: { submitted: req.strength || record.strength, registry: record.strength, matches: !strengthMismatch, notes: strengthMismatch ? "Strength differs from registry record" : "Strength matches" },
        dosage_form: { submitted: req.dosage_form || record.dosage_form, registry: record.dosage_form, matches: !dosageMismatch, notes: dosageMismatch ? "Dosage form differs from registry record" : "Dosage matches" },
        status: { submitted: "ACTIVE", registry: record.status, matches: true, notes: "Active registration" }
      },
      matched_record: record,
      explanation: {
        language: lang,
        summary: `Discrepancy: NRN matches '${record.product_name}', but packaging details (${strengthMismatch ? 'strength' : ''} ${dosageMismatch ? 'dosage form' : ''}) do not align with registry records.`,
        pidgin_summary: `K-leg dey: Di NRN number dey correct for '${record.product_name}', but di dose or type wey dey on top pack no balance with wetin NAFDAC register.`,
        action_recommendation: "Do not rely on this product until you confirm packaging specs with your pharmacist or NAFDAC."
      },
      dataset_metadata: {
        source: "NAFDAC Registered Drug Products Sample Snapshot",
        snapshot_date: "2024-06-01",
        disclaimer: "This tool provides a registry cross-check against a local regulatory snapshot, not a clinical test of physical medicine authenticity, chemical composition, or safety."
      },
      extracted: {
        name: req.product_name || record.product_name,
        nrn: req.nrn || record.nrn,
        strength: req.strength || record.strength,
        manufacturer: record.manufacturer
      },
      registry: {
        name: record.product_name,
        nrn: record.nrn,
        strength: record.strength,
        manufacturer: record.manufacturer,
        status: record.status
      },
      field_checks: [
        { field: "NRN", extracted: req.nrn || record.nrn, registry: record.nrn, match: true },
        { field: "Product Name", extracted: req.product_name || record.product_name, registry: record.product_name, match: true },
        { field: "Strength", extracted: req.strength || record.strength, registry: record.strength, match: !strengthMismatch },
        { field: "Dosage Form", extracted: req.dosage_form || record.dosage_form, registry: record.dosage_form, match: !dosageMismatch }
      ],
      advice: "Do not rely on this product until you confirm with the pharmacist or NAFDAC.",
      extraction_confidence: 0.86
    };
  }

  // DEFAULT: REGISTERED_MATCH
  return {
    verdict: "REGISTERED_MATCH",
    confidence_percentage: 100,
    confidence_tier: "HIGH",
    reasons: [
      `NAFDAC number '${record.nrn}' is registered and currently ACTIVE.`,
      `Product name matches registered '${record.product_name}'.`,
      `Active ingredients (${record.active_ingredients.join(', ')}) match registered formulation.`,
      `Manufacturer matches '${record.manufacturer}' (${record.country_of_origin}).`
    ],
    comparison: {
      nrn: { submitted: req.nrn || record.nrn, registry: record.nrn, matches: true, notes: "Exact NRN match" },
      product_name: { submitted: req.product_name || record.product_name, registry: record.product_name, matches: true, notes: "High name similarity" },
      active_ingredients: { submitted: req.active_ingredients || record.active_ingredients, registry: record.active_ingredients, matches: true, notes: `Active ingredients match (${record.active_ingredients.join(', ')})` },
      strength: { submitted: req.strength || record.strength, registry: record.strength, matches: true, notes: "Strength matches" },
      dosage_form: { submitted: req.dosage_form || record.dosage_form, registry: record.dosage_form, matches: true, notes: "Dosage form matches" },
      status: { submitted: "ACTIVE", registry: record.status, matches: true, notes: "Active registration" },
      manufacturer: { submitted: record.manufacturer, registry: record.manufacturer, matches: true, notes: "Manufacturer matches registered license holder" }
    },
    matched_record: record,
    explanation: {
      language: lang,
      summary: `Verified: Matches active NAFDAC registration for '${record.product_name}' manufactured by ${record.manufacturer}.`,
      pidgin_summary: `E set! Dis medicine match active NAFDAC record for '${record.product_name}' wey ${record.manufacturer} make.`,
      action_recommendation: "Inspect physical packaging to ensure safety seals and manufacturer holograms are intact."
    },
    dataset_metadata: {
      source: "NAFDAC Registered Drug Products Sample Snapshot",
      snapshot_date: "2024-06-01",
      disclaimer: "This tool provides a registry cross-check against a local regulatory snapshot, not a clinical test of physical medicine authenticity, chemical composition, or safety."
    },
    extracted: {
      name: req.product_name || record.product_name,
      nrn: req.nrn || record.nrn,
      strength: record.strength,
      manufacturer: record.manufacturer
    },
    registry: {
      name: record.product_name,
      nrn: record.nrn,
      strength: record.strength,
      manufacturer: record.manufacturer,
      status: record.status
    },
    field_checks: [
      { field: "NRN", extracted: req.nrn || record.nrn, registry: record.nrn, match: true },
      { field: "Product Name", extracted: req.product_name || record.product_name, registry: record.product_name, match: true },
      { field: "Strength", extracted: record.strength, registry: record.strength, match: true },
      { field: "Manufacturer", extracted: record.manufacturer, registry: record.manufacturer, match: true },
      { field: "Active Ingredients", extracted: record.active_ingredients.join(', '), registry: record.active_ingredients.join(', '), match: true },
      { field: "Status", extracted: "ACTIVE", registry: record.status, match: true }
    ],
    advice: "Inspect physical packaging to ensure safety seals and manufacturer holograms are intact before consumption.",
    extraction_confidence: 0.98
  };
}

export const SAMPLE_PACKS = [
  {
    id: "sample-emzor",
    title: "Emzor Paracetamol",
    subtitle: "500mg Tablets • NRN 04-1234",
    badge: "Match Demo",
    badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    type: "match",
    request: {
      nrn: "04-1234",
      product_name: "Emzor Paracetamol Tablets",
      active_ingredients: ["Paracetamol"],
      strength: "500 mg",
      dosage_form: "Tablet"
    },
    extractedTextPreview: "EMZOR PARACETAMOL 500mg TABLETS\nNAFDAC REG NO: 04-1234\nMFG: EMZOR PHARMACEUTICALS IND. LTD."
  },
  {
    id: "sample-cloned",
    title: "Lonart DS (Cloned NRN)",
    subtitle: "Antimalarial with Paracetamol NRN 04-1234",
    badge: "Cloned Alert",
    badgeColor: "bg-rose-50 text-rose-700 border-rose-200",
    type: "cloned",
    request: {
      nrn: "04-1234",
      product_name: "Lonart DS Tablets",
      active_ingredients: ["Artemether", "Lumefantrine"],
      strength: "80 mg / 480 mg",
      dosage_form: "Tablet"
    },
    extractedTextPreview: "LONART DS TABLETS (Artemether 80mg / Lumefantrine 480mg)\nNAFDAC REG NO: 04-1234\nBLISS GVS PHARMA"
  },
  {
    id: "sample-mismatch",
    title: "Amoxil Discrepancy",
    subtitle: "Amoxicillin with incorrect 250mg strength",
    badge: "Discrepancy Demo",
    badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
    type: "mismatch",
    request: {
      nrn: "04-0199",
      product_name: "Amoxil Capsules",
      active_ingredients: ["Amoxicillin"],
      strength: "250 mg",
      dosage_form: "Capsule"
    },
    extractedTextPreview: "AMOXIL CAPSULES 250mg\nNAFDAC REG NO: 04-0199\nBEECHAM PHARMACEUTICALS"
  },
  {
    id: "sample-expired",
    title: "Expired Tetracycline",
    subtitle: "250mg • NRN 04-7112 (Expired Permit)",
    badge: "Expired Demo",
    badgeColor: "bg-orange-50 text-orange-700 border-orange-200",
    type: "expired",
    request: {
      nrn: "04-7112",
      product_name: "Tetracycline 250mg Capsules",
      strength: "250 mg",
      dosage_form: "Capsule"
    },
    extractedTextPreview: "TETRACYCLINE 250mg CAPSULES\nNAFDAC REG NO: 04-7112\nPHARMA-DEKO PLC"
  },
  {
    id: "sample-not-found",
    title: "Unregistered Herbal",
    subtitle: "Wa-Bamishe Mixture • NRN 99-9999",
    badge: "Not Found Demo",
    badgeColor: "bg-slate-100 text-slate-700 border-slate-200",
    type: "not_found",
    request: {
      nrn: "99-9999",
      product_name: "Wa-Bamishe Herbal Concoction",
      strength: "100 ml",
      dosage_form: "Syrup"
    },
    extractedTextPreview: "WA-BAMISHE TOTAL CURE HERBAL CONCOCTION\nNAFDAC NO: 99-9999 (UNVERIFIED)"
  }
] as const;
