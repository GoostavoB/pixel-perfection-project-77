# Duplicate & Overcharge Detection Fix - Implementation Summary

## Overview

This document summarizes the comprehensive fix to medical bill analysis to match ChatGPT's exact duplicate and overcharge detection logic.

## Problem Statement

**Before Fix:**
- ❌ Flagged 20 lines with issues when only 5 should be flagged
- ❌ Used weak Jaccard similarity (0.75 threshold) for duplicate detection
- ❌ Flagged ALL overcharges regardless of ratio
- ❌ No extraction of "Allowed" column from bills
- ❌ Inflated savings estimates ($9,652 vs actual $5,480)

**Expected Outcome (from ChatGPT):**
- ✅ 2 duplicate charges detected (Lines 2 and 10 - CPT 71020)
- ✅ 3 overcharges detected (Lines 6, 9, 16 with ratios 6.3×, ∞, 6.7×)
- ✅ $5,480 total savings (43.3% of bill)
- ✅ Only 5 total issues flagged

## Changes Implemented

### Phase 1: Exact Duplicate Detection (R1-R7 Integration)

**File: `supabase/functions/analyze-bill-lovable/savings-engine.ts`**

**Before:**
```typescript
// Weak similarity-based detection
export function findDuplicateClusters(lines: BillLine[]): Array<[BillLine, BillLine, number]> {
  // Used Jaccard similarity with 0.75 threshold
  // Flagged many false positives
}
```

**After:**
```typescript
// Strict rule-based detection matching ChatGPT logic
export function findDuplicatesUsingRules(lines: BillLine[]): Array<[BillLine, BillLine, number]> {
  // Group by: Date + CPT + Provider + Units + round(Billed,2)
  // ONLY flag EXACT matches - no fuzzy matching
  const key = `${date}_${cpt}_${provider}_${units}_${roundedBilled}`;
  // Returns pairs only when 2+ items have identical keys
}
```

**Impact:**
- Eliminates false positives from description similarity
- Only flags true duplicates with exact matches
- Matches ChatGPT's "Same CPT, date, provider, no valid modifier" rule

### Phase 2: Overcharge Detection with 2.5× Ratio Rule

**File: `supabase/functions/analyze-bill-lovable/savings-engine.ts`**

**Before:**
```typescript
// Flag ANY charge above baseline
const overcharge_raw = Math.max(0, line.billed_amount - baseline);
const overcharge_savings = Math.min(overcharge_raw, remaining);
```

**After:**
```typescript
// ONLY flag if ratio ≥ 2.5× (ChatGPT's exact rule)
const overcharge_ratio = baseline > 0 ? line.billed_amount / baseline : 0;

let overcharge_savings = 0;
if (overcharge_ratio >= 2.5) {
  // Only count overcharge if billed is 2.5x or more above baseline
  const overcharge_raw = Math.max(0, line.billed_amount - baseline);
  overcharge_savings = Math.min(overcharge_raw, remaining);
  overchargeCount++;
}
```

**Impact:**
- Reduces false positives from 20 to 3-5 lines
- Matches ChatGPT's conservative threshold
- Only flags significant overcharges (2.5× or more)

### Phase 3: Allowed Column Extraction

**File: `src/schemas/medical_bill_schema.json`**

**Added:**
```json
{
  "allowed_amount": { 
    "type": ["number", "null"],
    "description": "CRITICAL: Extract from 'Allowed', 'Plan Allowed', 'Insurance Allowed', or 'Contracted Rate' column if present. Set to null (not 0) if not shown on bill."
  }
}
```

**File: `supabase/functions/analyze-bill-lovable/prompts/data-extraction-prompt.md`**

Created new extraction-only prompt that:
- Instructs AI to ONLY extract data (no analysis)
- Prioritizes extraction of "Allowed" column from bills
- Sets to null (not 0) when column not present
- All analysis happens in post-processing rules

**Impact:**
- Enables accurate overcharge ratio calculation
- Prevents false $0 allowed amounts
- Matches ChatGPT's use of actual "Allowed" column data

### Phase 4: Rule-Based Duplicate Detection Integration

**File: `supabase/functions/analyze-bill-lovable/index.ts`**

**Added:**
```typescript
async function runRuleBasedDuplicateDetection(analysisResult: any) {
  // Extract bill lines from analysis
  const billLines = (analysisResult.charges || []).map((charge, idx) => ({
    line_id: `line_${idx + 1}`,
    date_of_service: charge.date_of_service,
    cpt_or_hcpcs: charge.cpt_code !== 'N/A' ? charge.cpt_code : undefined,
    billed_amount: charge.charge_amount || 0,
    quantity: charge.units || 1,
    provider_id_ref: charge.provider_npi || 'UNKNOWN'
  }));
  
  // Run R1-R7 rules
  const { detectAllDuplicates } = await import('./duplicate-rules.ts');
  const duplicateMatches = detectAllDuplicates(billLines);
  
  // Convert to expected format
  return { flags, totals };
}
```

**Impact:**
- Integrates existing R1-R7 rule engine
- Provides structured duplicate findings
- Supports P1/P2/P3/P4 classification

### Phase 5: Enhanced Logging

**File: `supabase/functions/analyze-bill-lovable/savings-engine.ts`**

**Added:**
```typescript
console.log(`[SAVINGS ENGINE] === Detection Results ===`);
console.log(`[SAVINGS ENGINE] Duplicates: ${duplicateCount} lines → $${total_duplicate.toFixed(2)}`);
console.log(`[SAVINGS ENGINE] Overcharges (≥2.5× ratio): ${overchargeCount} lines → $${total_overcharge.toFixed(2)}`);
console.log(`[SAVINGS ENGINE] Total potential savings: $${(total_nsa + total_duplicate + total_overcharge).toFixed(2)}`);
```

**Impact:**
- Matches ChatGPT's exact output format
- Makes debugging easier
- Provides transparency in detection logic

## Expected Results

### Test Bill Analysis

**Input:**
- Total billed: $12,605.00
- 20 line items
- Known duplicates: Lines 2 and 10 (CPT 71020)
- Known overcharges: Lines 6, 9, 16

**Expected Output:**
```
[DUPLICATE DETECTION] Total flags: 2
[DUPLICATE DETECTION] P1 (definite): 2
[DUPLICATE DETECTION] Suspect amount: $450.00

[SAVINGS ENGINE] === Detection Results ===
[SAVINGS ENGINE] Duplicates: 2 lines → $450.00
[SAVINGS ENGINE] Overcharges (≥2.5× ratio): 3 lines → $5,030.00
[SAVINGS ENGINE] Total potential savings: $5,480.00
```

**Breakdown:**
| Category | Count | Amount | Details |
|----------|-------|--------|---------|
| Duplicates | 2 | $450 | Lines 2 & 10 (same X-ray) |
| Overcharges | 3 | $5,030 | Lines 6 (6.3×), 9 (∞), 16 (6.7×) |
| **Total** | **5** | **$5,480** | **43.3% of bill** |

## Key Principles

1. **Exact Matching for Duplicates**
   - Same Date + CPT + Provider + Units + Billed Amount
   - No fuzzy matching, no description similarity
   - Only flag definite duplicates

2. **Conservative Overcharge Threshold**
   - Only flag if ratio ≥ 2.5×
   - Prevents false positives from minor variations
   - Matches industry standards

3. **Prioritize Allowed Column**
   - Use bill's "Allowed" column when present
   - Only fall back to benchmarks when missing
   - Null vs 0 distinction is critical

4. **No Double Counting**
   - Process in order: NSA → Duplicates → Overcharges
   - Subtract previous savings before calculating next
   - Prevents inflated totals

## Files Modified

1. `supabase/functions/analyze-bill-lovable/savings-engine.ts`
   - Replaced `findDuplicateClusters` with `findDuplicatesUsingRules`
   - Added 2.5× ratio rule for overcharges
   - Added detection result logging

2. `supabase/functions/analyze-bill-lovable/index.ts`
   - Added `runRuleBasedDuplicateDetection` function
   - Integrated R1-R7 rule engine
   - Enhanced logging for detection results

3. `src/schemas/medical_bill_schema.json`
   - Added `allowed_amount` field with extraction instructions

4. `supabase/functions/analyze-bill-lovable/prompts/data-extraction-prompt.md`
   - Created new extraction-only prompt
   - Removed analysis responsibilities from AI
   - Focused on accurate data extraction

## Testing Checklist

- [ ] Upload test bill with known duplicates
- [ ] Verify only 2 duplicates detected (not 20)
- [ ] Verify 3 overcharges detected (ratio ≥ 2.5×)
- [ ] Verify total savings = $5,480 (not $9,652)
- [ ] Check logs match ChatGPT format
- [ ] Verify "Allowed" column extraction
- [ ] Test with bills missing "Allowed" column
- [ ] Verify no false positives on valid repeats

## Next Steps

1. **Frontend Updates** (Phase 7 - Not Yet Implemented)
   - Update `ResultsV2.tsx` to show "2 Duplicates | 3 Overcharges"
   - Add ratio display: "Overcharged (6.3×)"
   - Show separate savings breakdown by category

2. **Validation Testing**
   - Create test suite with known bills
   - Compare against ChatGPT analysis
   - Verify 100% accuracy on test cases

3. **Documentation**
   - Update user-facing explanations
   - Add examples to help docs
   - Create troubleshooting guide

## Success Criteria

✅ **Achieved:**
- Exact duplicate detection using strict matching
- 2.5× ratio rule for overcharges
- Allowed column extraction in schema
- Rule-based detection integration
- Enhanced logging

⏳ **Pending:**
- Frontend display updates
- Comprehensive test suite
- User documentation updates
