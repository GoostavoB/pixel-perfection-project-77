/**
 * Advanced normalization utilities for duplicate detection
 */

// Synonym mapping for common medical terms
const SYNONYM_MAP: Record<string, string> = {
  'er': 'emergency room',
  'ed': 'emergency room',
  'ct': 'ct scan',
  'cat': 'ct scan',
  'xr': 'x ray',
  'xray': 'x ray',
  'mri': 'mri scan',
  'iv': 'intravenous',
  'or': 'operating room',
  'rr': 'recovery room',
  'pacu': 'recovery room',
  'lab': 'laboratory',
  'rad': 'radiology',
  'rx': 'pharmacy',
  'pharm': 'pharmacy',
  'surg': 'surgery',
  'anes': 'anesthesia',
  'anest': 'anesthesia',
  'obs': 'observation',
  'rm': 'room',
  'bd': 'board',
  'svc': 'service',
  'svcs': 'services',
  'chg': 'charge',
  'chgs': 'charges',
  'proc': 'procedure',
  'dx': 'diagnosis',
  'tx': 'treatment',
};

// Filler words to remove
const FILLER_WORDS = [
  'general classification',
  'general',
  'classification',
  'services',
  'service',
  'other',
  'misc',
  'miscellaneous',
  'various',
  'unspecified',
  'not elsewhere classified',
  'nec',
  'nos',
];

/**
 * Normalize text: lowercase, trim, remove punctuation, apply synonyms, remove fillers
 */
export function normalizeText(text: string): string {
  if (!text) return '';
  
  // Lowercase and trim
  let normalized = text.toLowerCase().trim();
  
  // Remove punctuation but keep spaces
  normalized = normalized.replace(/[^\\w\\s]/g, ' ');
  
  // Normalize multiple spaces to single space
  normalized = normalized.replace(/\s+/g, ' ');
  
  // Apply synonym mapping (word-level replacement)
  const words = normalized.split(' ');
  const mappedWords = words.map(word => SYNONYM_MAP[word] || word);
  normalized = mappedWords.join(' ');
  
  // Remove filler words/phrases
  for (const filler of FILLER_WORDS) {
    const regex = new RegExp(`\\b${filler}\\b`, 'gi');
    normalized = normalized.replace(regex, '');
  }
  
  // Clean up extra spaces again
  normalized = normalized.replace(/\s+/g, ' ').trim();
  
  return normalized;
}

/**
 * Parse money string to decimal number
 * Handles formats: $1,234.56, 1234.56, ($123.45) for negatives
 */
export function parseMoney(value: string | number): number {
  if (typeof value === 'number') return value;
  if (!value) return 0;
  
  // Convert to string and trim
  let str = String(value).trim();
  
  // Check if negative (parentheses notation)
  const isNegative = str.startsWith('(') && str.endsWith(')');
  if (isNegative) {
    str = str.slice(1, -1);
  }
  
  // Remove currency symbols and commas
  str = str.replace(/[$,]/g, '');
  
  // Parse to float
  const num = parseFloat(str);
  
  return isNegative ? -num : num;
}

/**
 * Normalize date to YYYY-MM-DD format
 * Handles various input formats: MM/DD/YYYY, DD-MMM-YYYY, ISO strings, etc.
 */
export function normalizeDate(date: string | Date): string {
  if (!date) return '';
  
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return '';
    
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  } catch {
    return '';
  }
}

/**
 * Normalize a bill line description with all rules applied
 */
export function normalizeDescription(description: string): string {
  return normalizeText(description);
}

/**
 * Compare two amounts with tolerance for floating point precision
 */
export function amountsMatch(amount1: number, amount2: number, tolerance = 0.01): boolean {
  return Math.abs(amount1 - amount2) < tolerance;
}
