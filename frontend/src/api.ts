/**
 * API client for NAFDAC Medicine Registry Verification
 * Connects directly to the FastAPI verification backend (/api/v1)
 * with graceful fallback to local registry engine if backend is unreachable.
 */

import { CheckRequest, CheckResponse, MatchedRecord, LanguageCode } from './types';
import { performRegistryCheck, searchRegistryByQuery, NAFDAC_REGISTRY_DATABASE } from './mockRegistry';

const BACKEND_BASE_URL = (import.meta.env.API_BASE_URL || import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');

export async function checkMedicine(request: CheckRequest): Promise<CheckResponse> {
  try {
    const controller = new AbortController();
    // 15s timeout to allow Gemma 4 text/explainer generation if enabled
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(`${BACKEND_BASE_URL}/api/v1/check`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      return data as CheckResponse;
    }
    console.warn(`Backend responded with ${response.status}, falling back to built-in registry engine.`);
    return fallbackCheck(request);
  } catch (err) {
    // Network failure / offline / backend not running yet
    console.warn('Backend verification call failed, falling back to local database:', err);
    return fallbackCheck(request);
  }
}

async function fallbackCheck(request: CheckRequest): Promise<CheckResponse> {
  await new Promise((r) => setTimeout(r, 450));
  return performRegistryCheck(request);
}

export async function checkText(query: string, language: LanguageCode = 'en'): Promise<CheckResponse> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(`${BACKEND_BASE_URL}/api/v1/check-text`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, language }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      return (await response.json()) as CheckResponse;
    }
  } catch (err) {
    console.warn('Backend /check-text call failed:', err);
  }

  // Fallback: parse basic NRN from text
  const match = query.match(/[A-Za-z0-9]{2,4}-[0-9]{4,6}/);
  const fallbackReq: CheckRequest = {
    nrn: match ? match[0] : undefined,
    product_name: query,
    language,
  };
  return fallbackCheck(fallbackReq);
}

export async function searchRegistry(query: string): Promise<MatchedRecord[]> {
  try {
    const res = await fetch(`${BACKEND_BASE_URL}/api/v1/registry/search?q=${encodeURIComponent(query)}`);
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // ignore
  }
  return searchRegistryByQuery(query);
}

export async function getRegistryRecord(nrn: string): Promise<MatchedRecord | null> {
  try {
    const res = await fetch(`${BACKEND_BASE_URL}/api/v1/product/${encodeURIComponent(nrn)}`);
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // ignore
  }
  const clean = nrn.toLowerCase().replace(/[^a-z0-9]/g, '');
  return NAFDAC_REGISTRY_DATABASE.find(r => r.nrn.toLowerCase().replace(/[^a-z0-9]/g, '') === clean) || null;
}

export async function getRegistrySampleList(limit = 20): Promise<MatchedRecord[]> {
  try {
    const res = await fetch(`${BACKEND_BASE_URL}/api/v1/registry?limit=${limit}`);
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // ignore
  }
  return NAFDAC_REGISTRY_DATABASE.slice(0, limit);
}

/**
 * Multimodal Image Analysis / OCR extraction
 * Sends packaging photo to backend /api/v1/scan-label (Gemini Vision + fail-closed).
 * Fails closed as unreadable rather than fabricating hardcoded medicine brands.
 */
export async function extractFromImage(file: File): Promise<{
  extractedData: CheckRequest;
  rawText: string;
  confidence: number;
}> {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);

    const response = await fetch(`${BACKEND_BASE_URL}/api/v1/scan-label`, {
      method: 'POST',
      body: formData,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      const hasAnyField = Boolean(
        data.nrn ||
        data.product_name ||
        (data.active_ingredients && data.active_ingredients.length > 0) ||
        data.strength ||
        data.dosage_form
      );

      return {
        extractedData: {
          nrn: data.nrn || '',
          product_name: data.product_name || '',
          strength: data.strength || '',
          dosage_form: data.dosage_form || '',
          active_ingredients: data.active_ingredients || [],
        },
        rawText: data.raw_text || (hasAnyField ? `${data.product_name || ''} ${data.nrn || ''}`.trim() : 'No legible medicine identifiers found on packaging.'),
        confidence: hasAnyField ? 0.95 : 0.0,
      };
    }
  } catch (err) {
    console.warn('Backend /scan-label call failed or timed out:', err);
  }

  // Fail-closed fallback: never return a fake brand or fabricated match
  return {
    extractedData: {
      nrn: '',
      product_name: '',
      strength: '',
      dosage_form: '',
      active_ingredients: [],
    },
    rawText: 'Could not extract readable text from packaging photo.',
    confidence: 0.0,
  };
}
