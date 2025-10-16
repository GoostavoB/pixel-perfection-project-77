/**
 * Seven specific duplicate detection rules (R1-R7)
 */

import { normalizeDescription, parseMoney, normalizeDate, amountsMatch } from './normalization-utils.ts';
import { detectDepartment } from './department-detector.ts';
import { groupCharges, GroupedCharges } from './charge-grouper.ts';
import { buildChargeKey, ChargeKey } from './charge-key-builder.ts';

export type RuleType = 'R1' | 'R2' | 'R3' | 'R4' | 'R5' | 'R6' | 'R7';
export type Category = 'P1' | 'P2' | 'P3' | 'P4';

export interface RuleMatch {
  rule: RuleType;
  category: Category;
  lineIds: string[];
  evidence: {
    dates: string[];
    descriptions: string[];
    amounts: number[];
    departments: string[];
    providers?: string[];
  };
  reason: string;
  confidence: 'high' | 'medium' | 'low';
  potentialSavings: number;
}

interface BillLine {
  line_id?: string;
  description: string;
  date_of_service?: string | Date;
  revenue_code?: string;
  cpt_code?: string;
  provider?: string;
  charged: number | string;
  units?: number;
}

/**
 * R1: Exact Repeat
 * Same date, same normalized description, same amount, same provider
 * Classification: P1 (Definite Duplicate)
 */
export function detectR1(lines: BillLine[]): RuleMatch[] {
  const matches: RuleMatch[] = [];
  const seen = new Map<string, BillLine[]>();
  
  for (const line of lines) {
    const normalizedDesc = normalizeDescription(line.description);
    const date = normalizeDate(line.date_of_service || '');
    const amount = parseMoney(line.charged);
    const provider = line.provider?.trim() || 'unknown';
    
    const key = `${date}|${normalizedDesc}|${amount.toFixed(2)}|${provider}`;
    
    if (!seen.has(key)) {
      seen.set(key, []);
    }
    seen.get(key)!.push(line);
  }
  
  // Find groups with 2+ items
  for (const [key, group] of seen.entries()) {
    if (group.length >= 2) {
      const amount = parseMoney(group[0].charged);
      const totalDuplicates = group.length - 1; // Keep one as valid
      
      matches.push({
        rule: 'R1',
        category: 'P1',
        lineIds: group.map(l => l.line_id || ''),
        evidence: {
          dates: group.map(l => normalizeDate(l.date_of_service || '')),
          descriptions: group.map(l => l.description),
          amounts: group.map(l => parseMoney(l.charged)),
          departments: group.map(l => detectDepartment(l.description, l.revenue_code, l.cpt_code).department),
          providers: group.map(l => l.provider || 'unknown'),
        },
        reason: `Exact repeat: same date, description, amount ($${amount.toFixed(2)}), and provider appearing ${group.length} times`,
        confidence: 'high',
        potentialSavings: amount * totalDuplicates,
      });
    }
  }
  
  return matches;
}

/**
 * R2: Split Units by Copy
 * Same date, same description, same amount appears 2+ times
 * Classification: P1 if units absent, P2 if description suggests quantity
 */
export function detectR2(lines: BillLine[]): RuleMatch[] {
  const matches: RuleMatch[] = [];
  const seen = new Map<string, BillLine[]>();
  
  for (const line of lines) {
    const normalizedDesc = normalizeDescription(line.description);
    const date = normalizeDate(line.date_of_service || '');
    const amount = parseMoney(line.charged);
    
    const key = `${date}|${normalizedDesc}|${amount.toFixed(2)}`;
    
    if (!seen.has(key)) {
      seen.set(key, []);
    }
    seen.get(key)!.push(line);
  }
  
  for (const [key, group] of seen.entries()) {
    if (group.length >= 2) {
      const hasUnits = group.some(l => l.units && l.units > 0);
      const descSuggestsQuantity = /\b(each|per|unit|dose|push|injection)\b/i.test(group[0].description);
      
      const amount = parseMoney(group[0].charged);
      const totalDuplicates = group.length - 1;
      
      matches.push({
        rule: 'R2',
        category: hasUnits || descSuggestsQuantity ? 'P2' : 'P1',
        lineIds: group.map(l => l.line_id || ''),
        evidence: {
          dates: group.map(l => normalizeDate(l.date_of_service || '')),
          descriptions: group.map(l => l.description),
          amounts: group.map(l => parseMoney(l.charged)),
          departments: group.map(l => detectDepartment(l.description, l.revenue_code, l.cpt_code).department),
        },
        reason: `Split units: same amount ($${amount.toFixed(2)}) appears ${group.length} times on same date${hasUnits ? ' (units present)' : ''}${descSuggestsQuantity ? ' (description suggests quantity)' : ''}`,
        confidence: hasUnits || descSuggestsQuantity ? 'medium' : 'high',
        potentialSavings: amount * totalDuplicates,
      });
    }
  }
  
  return matches;
}

/**
 * R3: Daily Fee Counted Twice
 * Two room, observation, or recovery charges on one calendar day
 * Classification: P1 unless transfer or midnight crossover documented
 */
export function detectR3(lines: BillLine[]): RuleMatch[] {
  const matches: RuleMatch[] = [];
  const dailyFees = new Map<string, BillLine[]>();
  
  for (const line of lines) {
    const dept = detectDepartment(line.description, line.revenue_code, line.cpt_code);
    if (['room and board', 'observation', 'recovery room'].includes(dept.department)) {
      const date = normalizeDate(line.date_of_service || '');
      const key = `${date}|${dept.department}`;
      
      if (!dailyFees.has(key)) {
        dailyFees.set(key, []);
      }
      dailyFees.get(key)!.push(line);
    }
  }
  
  for (const [key, group] of dailyFees.entries()) {
    if (group.length >= 2) {
      const hasTransferNote = group.some(l => /transfer|moved|midnight|crossover/i.test(l.description));
      
      if (!hasTransferNote) {
        const totalAmount = group.reduce((sum, l) => sum + parseMoney(l.charged), 0);
        const duplicateAmount = totalAmount - parseMoney(group[0].charged); // Keep one as valid
        
        matches.push({
          rule: 'R3',
          category: 'P1',
          lineIds: group.map(l => l.line_id || ''),
          evidence: {
            dates: group.map(l => normalizeDate(l.date_of_service || '')),
            descriptions: group.map(l => l.description),
            amounts: group.map(l => parseMoney(l.charged)),
            departments: group.map(l => detectDepartment(l.description, l.revenue_code, l.cpt_code).department),
          },
          reason: `Daily fee duplicate: ${group.length} room/observation/recovery charges on same calendar day`,
          confidence: 'high',
          potentialSavings: duplicateAmount,
        });
      }
    }
  }
  
  return matches;
}

/**
 * R4: Price Fingerprint Repeat
 * Same date and dept, amounts match to the cent, text slightly different
 * Classification: P2
 */
export function detectR4(lines: BillLine[]): RuleMatch[] {
  const matches: RuleMatch[] = [];
  const byDateDept = new Map<string, BillLine[]>();
  
  for (const line of lines) {
    const dept = detectDepartment(line.description, line.revenue_code, line.cpt_code);
    const date = normalizeDate(line.date_of_service || '');
    const key = `${date}|${dept.department}`;
    
    if (!byDateDept.has(key)) {
      byDateDept.set(key, []);
    }
    byDateDept.get(key)!.push(line);
  }
  
  for (const [key, group] of byDateDept.entries()) {
    // Find items with matching amounts but different descriptions
    const amountGroups = new Map<string, BillLine[]>();
    
    for (const line of group) {
      const amount = parseMoney(line.charged).toFixed(2);
      if (!amountGroups.has(amount)) {
        amountGroups.set(amount, []);
      }
      amountGroups.get(amount)!.push(line);
    }
    
    for (const [amount, sameAmountLines] of amountGroups.entries()) {
      if (sameAmountLines.length >= 2) {
        // Check if descriptions are actually different
        const normalizedDescs = sameAmountLines.map(l => normalizeDescription(l.description));
        const uniqueDescs = new Set(normalizedDescs);
        
        if (uniqueDescs.size >= 2) {
          const totalDuplicates = sameAmountLines.length - 1;
          const amountNum = parseFloat(amount);
          
          matches.push({
            rule: 'R4',
            category: 'P2',
            lineIds: sameAmountLines.map(l => l.line_id || ''),
            evidence: {
              dates: sameAmountLines.map(l => normalizeDate(l.date_of_service || '')),
              descriptions: sameAmountLines.map(l => l.description),
              amounts: sameAmountLines.map(l => parseMoney(l.charged)),
              departments: sameAmountLines.map(l => detectDepartment(l.description, l.revenue_code, l.cpt_code).department),
            },
            reason: `Price fingerprint: same amount ($${amount}) with slightly different descriptions in same department on same date`,
            confidence: 'medium',
            potentialSavings: amountNum * totalDuplicates,
          });
        }
      }
    }
  }
  
  return matches;
}

/**
 * R5: Blood Service Aggregates
 * Two blood administration or storage aggregates in same stay, units not shown
 * Classification: P2
 */
export function detectR5(lines: BillLine[]): RuleMatch[] {
  const matches: RuleMatch[] = [];
  const bloodServices: BillLine[] = [];
  
  for (const line of lines) {
    const dept = detectDepartment(line.description, line.revenue_code, line.cpt_code);
    if (dept.department === 'blood services') {
      bloodServices.push(line);
    }
  }
  
  // Group by similar amounts
  const amountGroups = new Map<string, BillLine[]>();
  for (const line of bloodServices) {
    const amount = parseMoney(line.charged).toFixed(2);
    if (!amountGroups.has(amount)) {
      amountGroups.set(amount, []);
    }
    amountGroups.get(amount)!.push(line);
  }
  
  for (const [amount, group] of amountGroups.entries()) {
    if (group.length >= 2) {
      const hasUnits = group.some(l => l.units && l.units > 0);
      
      if (!hasUnits) {
        const totalDuplicates = group.length - 1;
        const amountNum = parseFloat(amount);
        
        matches.push({
          rule: 'R5',
          category: 'P2',
          lineIds: group.map(l => l.line_id || ''),
          evidence: {
            dates: group.map(l => normalizeDate(l.date_of_service || '')),
            descriptions: group.map(l => l.description),
            amounts: group.map(l => parseMoney(l.charged)),
            departments: group.map(l => 'blood services'),
          },
          reason: `Blood service aggregates: ${group.length} blood charges with same amount ($${amount}) without unit breakdown`,
          confidence: 'medium',
          potentialSavings: amountNum * totalDuplicates,
        });
      }
    }
  }
  
  return matches;
}

/**
 * R6: Pharmacy Aggregates Duplicate
 * Two pharmacy aggregates on same date with same amount
 * Classification: P1 if amounts match, P3 if differ
 */
export function detectR6(lines: BillLine[]): RuleMatch[] {
  const matches: RuleMatch[] = [];
  const pharmacyByDate = new Map<string, BillLine[]>();
  
  for (const line of lines) {
    const dept = detectDepartment(line.description, line.revenue_code, line.cpt_code);
    if (dept.department === 'pharmacy') {
      const date = normalizeDate(line.date_of_service || '');
      if (!pharmacyByDate.has(date)) {
        pharmacyByDate.set(date, []);
      }
      pharmacyByDate.get(date)!.push(line);
    }
  }
  
  for (const [date, group] of pharmacyByDate.entries()) {
    // Group by amounts
    const amountGroups = new Map<string, BillLine[]>();
    for (const line of group) {
      const amount = parseMoney(line.charged).toFixed(2);
      if (!amountGroups.has(amount)) {
        amountGroups.set(amount, []);
      }
      amountGroups.get(amount)!.push(line);
    }
    
    for (const [amount, sameAmountLines] of amountGroups.entries()) {
      if (sameAmountLines.length >= 2) {
        const totalDuplicates = sameAmountLines.length - 1;
        const amountNum = parseFloat(amount);
        
        matches.push({
          rule: 'R6',
          category: 'P1',
          lineIds: sameAmountLines.map(l => l.line_id || ''),
          evidence: {
            dates: sameAmountLines.map(l => normalizeDate(l.date_of_service || '')),
            descriptions: sameAmountLines.map(l => l.description),
            amounts: sameAmountLines.map(l => parseMoney(l.charged)),
            departments: sameAmountLines.map(l => 'pharmacy'),
          },
          reason: `Pharmacy aggregates: ${sameAmountLines.length} pharmacy charges with same amount ($${amount}) on same date`,
          confidence: 'high',
          potentialSavings: amountNum * totalDuplicates,
        });
      }
    }
    
    // Check for different amounts (P3 - needs review)
    if (group.length >= 2 && amountGroups.size === group.length) {
      matches.push({
        rule: 'R6',
        category: 'P3',
        lineIds: group.map(l => l.line_id || ''),
        evidence: {
          dates: group.map(l => date),
          descriptions: group.map(l => l.description),
          amounts: group.map(l => parseMoney(l.charged)),
          departments: group.map(l => 'pharmacy'),
        },
        reason: `Pharmacy aggregates with different amounts on same date - request itemized detail`,
        confidence: 'low',
        potentialSavings: 0, // Unknown until review
      });
    }
  }
  
  return matches;
}

/**
 * R7: Cross-Section Mirror
 * A line appears in a later section with same amount, not a credit
 * Classification: P1
 */
export function detectR7(lines: BillLine[]): RuleMatch[] {
  const matches: RuleMatch[] = [];
  const seen = new Map<string, BillLine[]>();
  
  for (const line of lines) {
    const normalizedDesc = normalizeDescription(line.description);
    const amount = parseMoney(line.charged);
    
    // Skip credits (negative amounts)
    if (amount < 0) continue;
    
    const key = `${normalizedDesc}|${amount.toFixed(2)}`;
    
    if (!seen.has(key)) {
      seen.set(key, []);
    }
    seen.get(key)!.push(line);
  }
  
  for (const [key, group] of seen.entries()) {
    if (group.length >= 2) {
      // Check if they appear in different "sections" (different dates or departments)
      const dates = new Set(group.map(l => normalizeDate(l.date_of_service || '')));
      const depts = new Set(group.map(l => detectDepartment(l.description, l.revenue_code, l.cpt_code).department));
      
      if (dates.size > 1 || depts.size > 1) {
        const amount = parseMoney(group[0].charged);
        const totalDuplicates = group.length - 1;
        
        matches.push({
          rule: 'R7',
          category: 'P1',
          lineIds: group.map(l => l.line_id || ''),
          evidence: {
            dates: group.map(l => normalizeDate(l.date_of_service || '')),
            descriptions: group.map(l => l.description),
            amounts: group.map(l => parseMoney(l.charged)),
            departments: group.map(l => detectDepartment(l.description, l.revenue_code, l.cpt_code).department),
          },
          reason: `Cross-section mirror: same charge ($${amount.toFixed(2)}) appears in different bill sections`,
          confidence: 'high',
          potentialSavings: amount * totalDuplicates,
        });
      }
    }
  }
  
  return matches;
}

/**
 * Valid case exclusions - should NOT be flagged as duplicates
 */
export function isValidCase(line1: BillLine, line2: BillLine): boolean {
  // Different dates - valid
  const date1 = normalizeDate(line1.date_of_service || '');
  const date2 = normalizeDate(line2.date_of_service || '');
  if (date1 !== date2) {
    // Exception: ER -> Observation -> Inpatient progression is valid on adjacent days
    const dept1 = detectDepartment(line1.description, line1.revenue_code, line1.cpt_code);
    const dept2 = detectDepartment(line2.description, line2.revenue_code, line2.cpt_code);
    const validProgression = ['emergency room', 'observation', 'room and board'];
    if (validProgression.includes(dept1.department) && validProgression.includes(dept2.department)) {
      return true;
    }
  }
  
  // Different providers or tax IDs - valid (facility vs professional)
  if (line1.provider && line2.provider && line1.provider !== line2.provider) {
    return true;
  }
  
  // Pharmacy totals by category with different amounts - valid
  const dept1 = detectDepartment(line1.description, line1.revenue_code, line1.cpt_code);
  const dept2 = detectDepartment(line2.description, line2.revenue_code, line2.cpt_code);
  if (dept1.department === 'pharmacy' && dept2.department === 'pharmacy') {
    if (dept1.detail !== dept2.detail) {
      return true;
    }
  }
  
  // Labs by category with different amounts - valid
  if (dept1.department === 'laboratory' && dept2.department === 'laboratory') {
    if (dept1.detail !== dept2.detail) {
      return true;
    }
  }
  
  return false;
}

/**
 * Run all duplicate detection rules
 */
export function detectAllDuplicates(lines: BillLine[]): RuleMatch[] {
  const allMatches: RuleMatch[] = [];
  
  allMatches.push(...detectR1(lines));
  allMatches.push(...detectR2(lines));
  allMatches.push(...detectR3(lines));
  allMatches.push(...detectR4(lines));
  allMatches.push(...detectR5(lines));
  allMatches.push(...detectR6(lines));
  allMatches.push(...detectR7(lines));
  
  // Deduplicate matches (same line IDs)
  const seen = new Set<string>();
  const uniqueMatches: RuleMatch[] = [];
  
  for (const match of allMatches) {
    const key = match.lineIds.sort().join(',');
    if (!seen.has(key)) {
      seen.add(key);
      uniqueMatches.push(match);
    }
  }
  
  // Sort by potential savings (highest first)
  return uniqueMatches.sort((a, b) => b.potentialSavings - a.potentialSavings);
}
