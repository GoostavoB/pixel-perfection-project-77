/**
 * Generate charge keys for grouping bill line items
 */

import { normalizeDate, parseMoney } from './normalization-utils.ts';
import { detectDepartment, DepartmentInfo } from './department-detector.ts';

export interface ChargeKey {
  date: string;
  department: string;
  detail?: string;
  provider?: string;
  amount: number;
  rawLineId?: string;
}

export interface BillLineForKey {
  line_id?: string;
  description: string;
  date_of_service?: string | Date;
  revenue_code?: string;
  cpt_code?: string;
  provider?: string;
  charged: number | string;
}

/**
 * Build a charge key from a bill line
 */
export function buildChargeKey(line: BillLineForKey): ChargeKey {
  const deptInfo = detectDepartment(
    line.description,
    line.revenue_code,
    line.cpt_code
  );
  
  return {
    date: normalizeDate(line.date_of_service || ''),
    department: deptInfo.department,
    detail: deptInfo.detail,
    provider: line.provider?.trim(),
    amount: parseMoney(line.charged),
    rawLineId: line.line_id,
  };
}

/**
 * Generate a string representation of the charge key for grouping
 */
export function chargeKeyToString(key: ChargeKey, level: 'A' | 'B' | 'C' | 'D'): string {
  switch (level) {
    case 'A': // Strictest: date + dept + detail
      return `${key.date}|${key.department}|${key.detail || 'no-detail'}`;
    
    case 'B': // Medium: date + dept
      return `${key.date}|${key.department}`;
    
    case 'C': // Daily fees: date + dept (for room/observation/recovery)
      if (['room and board', 'observation', 'recovery room'].includes(key.department)) {
        return `${key.date}|${key.department}`;
      }
      return '';
    
    case 'D': // High-value episodes: dept only (for ct, or, anesthesia, blood)
      if (['ct scan', 'mri', 'operating room', 'anesthesia', 'blood services'].includes(key.department)) {
        return key.department;
      }
      return '';
    
    default:
      return '';
  }
}
