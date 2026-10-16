/**
 * Type definitions for NAFDAC Medicine Registry Checker
 * Adheres strictly to the Frontend <-> Backend Communication Contract
 */

export type VerdictType = 
  | 'REGISTERED_MATCH'
  | 'REGISTERED_MISMATCH'
  | 'NOT_FOUND'
  | 'EXPIRED'
  | 'INACTIVE'
  | 'UNREADABLE';

export type ConfidenceTier = 'HIGH' | 'MEDIUM' | 'LOW' | 'CONFLICT';

export type LanguageCode = 'en' | 'pcm';

export interface CheckRequest {
  nrn?: string;
  product_name?: string;
  active_ingredients?: string[];
  strength?: string;
  dosage_form?: string;
  language?: LanguageCode;
}

export interface FieldComparison {
  submitted?: string | string[];
  registry?: string | string[];
  matches: boolean;
  notes?: string;
}

export interface MatchedRecord {
  nrn: string;
  product_name: string;
  generic_name?: string;
  active_ingredients: string[];
  strength: string;
  dosage_form: string;
  manufacturer: string;
  country_of_origin: string;
  status: 'ACTIVE' | 'EXPIRED' | 'SUSPENDED' | 'NOT_FOUND';
  expiry_date?: string;
  dataset_source: string;
  dataset_date: string;
}

export interface LegacyFieldCheck {
  field: string;
  extracted: string;
  registry: string;
  match: boolean;
}

export interface CheckResponse {
  verdict: VerdictType;
  confidence_percentage: number;
  confidence_tier: ConfidenceTier;
  reasons: string[];
  comparison: {
    nrn: FieldComparison;
    product_name: FieldComparison;
    active_ingredients: FieldComparison;
    strength: FieldComparison;
    dosage_form: FieldComparison;
    status: FieldComparison;
    manufacturer?: FieldComparison;
    [key: string]: FieldComparison | undefined;
  };
  matched_record?: MatchedRecord;
  explanation: {
    language: LanguageCode;
    summary: string;
    pidgin_summary: string;
    action_recommendation: string;
  };
  dataset_metadata: {
    source: string;
    snapshot_date: string;
    disclaimer: string;
  };
  // Alternative shape fields supported for legacy/flexible view
  extracted?: {
    name?: string;
    nrn?: string;
    strength?: string;
    manufacturer?: string;
    dosage_form?: string;
    active_ingredients?: string[];
  };
  registry?: {
    name?: string;
    nrn?: string;
    strength?: string;
    manufacturer?: string;
    status?: string;
    dosage_form?: string;
  };
  field_checks?: LegacyFieldCheck[];
  advice?: string;
  extraction_confidence?: number;
}

export interface BasketItem {
  id: string;
  addedAt: number;
  product_name: string;
  nrn: string;
  active_ingredients: string[];
  strength: string;
  dosage_form: string;
  manufacturer: string;
  verdict: VerdictType;
}

export interface SamplePack {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  badgeColor: string;
  type: 'match' | 'mismatch' | 'cloned' | 'expired' | 'not_found';
  request: CheckRequest;
  imageUrl?: string;
  extractedTextPreview?: string;
}
