/**
 * Department and detail extraction from bill line items
 */

import { normalizeText } from './normalization-utils.ts';

export interface DepartmentInfo {
  department: string;
  detail?: string;
  confidence: number; // 0-1
}

// Revenue code to department mapping
const REVENUE_CODE_MAP: Record<string, string> = {
  // Pharmacy
  '025': 'pharmacy',
  '0250': 'pharmacy',
  '0251': 'pharmacy',
  '0252': 'pharmacy',
  '0255': 'pharmacy',
  '0257': 'pharmacy',
  '0258': 'pharmacy',
  '0259': 'pharmacy',
  
  // Laboratory
  '030': 'laboratory',
  '0300': 'laboratory',
  '0301': 'laboratory',
  '0302': 'laboratory',
  '0305': 'laboratory',
  '0306': 'laboratory',
  '0307': 'laboratory',
  '031': 'laboratory',
  
  // Radiology
  '032': 'radiology',
  '0320': 'radiology',
  '0324': 'radiology',
  '0329': 'radiology',
  '035': 'radiology',
  '0350': 'radiology',
  '0351': 'radiology',
  '0352': 'radiology',
  '0359': 'radiology',
  
  // MRI
  '061': 'mri',
  '0610': 'mri',
  '0611': 'mri',
  
  // Operating Room
  '036': 'operating room',
  '0360': 'operating room',
  '0361': 'operating room',
  '0362': 'operating room',
  '0367': 'operating room',
  '0369': 'operating room',
  
  // Recovery Room / Anesthesia (037x codes can be both)
  '0371': 'recovery room',
  '0372': 'recovery room',
  
  // Anesthesia
  '0374': 'anesthesia',
  
  // Emergency Room
  '045': 'emergency room',
  '0450': 'emergency room',
  '0451': 'emergency room',
  '0452': 'emergency room',
  '0456': 'emergency room',
  '0459': 'emergency room',
  
  // Room and Board
  '010': 'room and board',
  '0100': 'room and board',
  '0101': 'room and board',
  '0110': 'room and board',
  '0111': 'room and board',
  '012': 'room and board',
  '013': 'room and board',
  
  // Observation
  '076': 'observation',
  '0760': 'observation',
  
  // Blood Services
  '038': 'blood services',
  '0380': 'blood services',
  '0381': 'blood services',
  '0382': 'blood services',
  '0389': 'blood services',
  
  // Supplies
  '027': 'supplies',
  '0270': 'supplies',
  '0271': 'supplies',
  '0272': 'supplies',
  '0275': 'supplies',
  '0278': 'supplies',
};

// Description keywords to department mapping
const DESCRIPTION_KEYWORDS: Record<string, string[]> = {
  'pharmacy': ['pharmacy', 'drug', 'medication', 'rx', 'pharm', 'injectable', 'infusion'],
  'laboratory': ['laboratory', 'lab', 'chemistry', 'hematology', 'pathology', 'blood test', 'urinalysis', 'culture'],
  'radiology': ['radiology', 'x ray', 'imaging', 'fluoroscopy', 'ultrasound', 'mammography'],
  'ct scan': ['ct scan', 'ct', 'cat scan', 'computed tomography'],
  'mri': ['mri', 'magnetic resonance'],
  'operating room': ['operating room', 'surgery', 'surgical', 'or time', 'or services'],
  'recovery room': ['recovery room', 'pacu', 'post anesthesia', 'recovery'],
  'emergency room': ['emergency room', 'emergency', 'er', 'ed', 'emergency department'],
  'room and board': ['room and board', 'room charge', 'accommodation', 'bed', 'daily rate', 'semi private', 'private room'],
  'observation': ['observation', 'obs', 'observation room'],
  'anesthesia': ['anesthesia', 'anesthetic', 'anes'],
  'blood services': ['blood', 'blood administration', 'blood storage', 'blood transfusion', 'plasma', 'platelets'],
  'supplies': ['supplies', 'medical supplies', 'surgical supplies', 'dressing', 'catheter', 'tubing'],
};

// Detail keywords within departments
const DETAIL_KEYWORDS: Record<string, string[]> = {
  'iv solutions': ['iv solution', 'intravenous solution', 'iv fluid', 'saline', 'dextrose', 'lactated ringers'],
  'chemistry': ['chemistry', 'metabolic panel', 'bmp', 'cmp', 'glucose', 'electrolytes'],
  'hematology': ['hematology', 'cbc', 'complete blood count', 'hemoglobin', 'platelet'],
  'incident to radiology': ['incident to radiology', 'contrast', 'dye', 'injection procedure'],
  'contrast': ['contrast', 'dye', 'gadolinium', 'iodine'],
};

/**
 * Extract department from CPT code range
 */
function getDepartmentFromCPT(cptCode: string): string | null {
  if (!cptCode) return null;
  
  const code = parseInt(cptCode);
  if (isNaN(code)) return null;
  
  if (code >= 70000 && code <= 79999) return 'radiology';
  if (code >= 80000 && code <= 89999) return 'laboratory';
  if (code >= 90000 && code <= 99607) return 'medicine';
  if (code >= 100 && code <= 1999) return 'anesthesia';
  if (code >= 10000 && code <= 69990) return 'surgery';
  if (code >= 99281 && code <= 99285) return 'emergency room';
  
  return null;
}

/**
 * Extract detail from description
 */
function extractDetail(normalizedDesc: string): string | undefined {
  for (const [detail, keywords] of Object.entries(DETAIL_KEYWORDS)) {
    for (const keyword of keywords) {
      if (normalizedDesc.includes(keyword)) {
        return detail;
      }
    }
  }
  return undefined;
}

/**
 * Detect department and detail from a bill line
 */
export function detectDepartment(
  description: string,
  revenueCode?: string,
  cptCode?: string
): DepartmentInfo {
  const normalizedDesc = normalizeText(description);
  
  // Try revenue code first (highest confidence)
  if (revenueCode) {
    const revCode = revenueCode.replace(/\D/g, '');
    for (const [code, dept] of Object.entries(REVENUE_CODE_MAP)) {
      if (revCode.startsWith(code) || revCode === code) {
        return {
          department: dept,
          detail: extractDetail(normalizedDesc),
          confidence: 0.95,
        };
      }
    }
  }
  
  // Try CPT code (high confidence)
  if (cptCode) {
    const dept = getDepartmentFromCPT(cptCode);
    if (dept) {
      return {
        department: dept,
        detail: extractDetail(normalizedDesc),
        confidence: 0.85,
      };
    }
  }
  
  // Try description keywords (medium confidence)
  for (const [dept, keywords] of Object.entries(DESCRIPTION_KEYWORDS)) {
    for (const keyword of keywords) {
      if (normalizedDesc.includes(keyword)) {
        return {
          department: dept,
          detail: extractDetail(normalizedDesc),
          confidence: 0.75,
        };
      }
    }
  }
  
  // Default to unknown (low confidence)
  return {
    department: 'unknown',
    detail: undefined,
    confidence: 0.1,
  };
}
