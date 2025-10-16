/**
 * Multi-level grouping system for bill line items
 */

import { buildChargeKey, chargeKeyToString, ChargeKey } from './charge-key-builder.ts';

export interface GroupedCharges {
  groupA: Map<string, ChargeKey[]>; // Same date + dept + detail
  groupB: Map<string, ChargeKey[]>; // Same date + dept
  groupC: Map<string, ChargeKey[]>; // Daily fees by date
  groupD: Map<string, ChargeKey[]>; // High-value episodes
}

/**
 * Group bill lines using multi-level strategy
 */
export function groupCharges(lines: any[]): GroupedCharges {
  const groupA = new Map<string, ChargeKey[]>();
  const groupB = new Map<string, ChargeKey[]>();
  const groupC = new Map<string, ChargeKey[]>();
  const groupD = new Map<string, ChargeKey[]>();
  
  for (const line of lines) {
    const key = buildChargeKey(line);
    
    // Group A: date + dept + detail
    const keyA = chargeKeyToString(key, 'A');
    if (keyA) {
      if (!groupA.has(keyA)) groupA.set(keyA, []);
      groupA.get(keyA)!.push(key);
    }
    
    // Group B: date + dept
    const keyB = chargeKeyToString(key, 'B');
    if (keyB) {
      if (!groupB.has(keyB)) groupB.set(keyB, []);
      groupB.get(keyB)!.push(key);
    }
    
    // Group C: daily fees
    const keyC = chargeKeyToString(key, 'C');
    if (keyC) {
      if (!groupC.has(keyC)) groupC.set(keyC, []);
      groupC.get(keyC)!.push(key);
    }
    
    // Group D: high-value episodes
    const keyD = chargeKeyToString(key, 'D');
    if (keyD) {
      if (!groupD.has(keyD)) groupD.set(keyD, []);
      groupD.get(keyD)!.push(key);
    }
  }
  
  return { groupA, groupB, groupC, groupD };
}
