/**
 * Production-Ready Medical Bill Savings Calculation Engine
 * 
 * Calculates potential savings from:
 * 1. NSA violations (highest priority)
 * 2. Duplicate charges (medium priority)
 * 3. Overcharges vs baseline (lowest priority)
 * 
 * Prevents double counting by processing in priority order.
 */

export interface BillLine {
  line_id: string;
  cpt_or_hcpcs?: string;
  revenue_code?: string;
  description: string;
  billed_amount: number;
  quantity?: number;
  units?: number;
  patient_cost_share_charged?: number;
  expected_in_network_cost_share?: number;
  provider_id_ref?: string;
  date_of_service?: string;
  modifier?: string;
}

export interface NSAFlag {
  violation: boolean;
  type?: string; // '149.110', '149.420.b', etc.
  clause_refs?: string[];
  explicit_balance_bill?: number;
}

export interface BaselineSource {
  plan_allowed?: number;
  medicare_allowed?: number;
  regional_benchmark?: number;
  chargemaster_median?: number;
  category_benchmark?: number; // NEW: for aggregated bills without codes
  state?: string; // NEW: state for regional adjustments
}

export interface LineSavings {
  line_id: string;
  allowed_baseline: number;
  baseline_source: string;
  nsa_flag?: string;
  nsa_savings: number;
  duplicate_cluster_id?: string;
  duplicate_savings: number;
  overcharge_savings: number;
  confidence: number;
  weighted_contribution: number;
  total_line_savings: number;
}

export interface SavingsTotals {
  total_potential_savings_gross: number;
  total_potential_savings_likely: number;
  nsa_savings_subtotal: number;
  duplicate_savings_subtotal: number;
  overcharge_savings_subtotal: number;
  lines_with_issues: number;
  total_lines: number;
  issue_ratio: number;
  color: 'green' | 'yellow' | 'orange' | 'red';
  confidence_bands: {
    high_confidence: number; // confidence >= 0.8
    medium_confidence: number; // 0.5 <= confidence < 0.8
    low_confidence: number; // confidence < 0.5
  };
  top_drivers: Array<{
    cpt_code: string;
    description: string;
    amount: number;
    category: 'nsa' | 'duplicate' | 'overcharge';
  }>;
  line_details: LineSavings[];
}

/**
 * Conservative baseline: Use smallest credible allowed price
 * NEW: Supports category-based benchmarks for aggregated bills
 */
export function computeAllowedBaseline(
  line: BillLine,
  sources: BaselineSource,
  medicare_multiplier: number = 1.5
): { baseline: number; source: string; confidence_adjustment: number } {
  const candidates: Array<{ value: number; label: string; weight: number }> = [];

  // Plan allowed (highest quality)
  if (sources.plan_allowed && sources.plan_allowed > 0) {
    candidates.push({ value: sources.plan_allowed, label: 'plan_allowed', weight: 0.3 });
  }

  // Medicare × multiplier
  if (sources.medicare_allowed && sources.medicare_allowed > 0) {
    const medicare_baseline = sources.medicare_allowed * medicare_multiplier;
    candidates.push({ value: medicare_baseline, label: `${medicare_multiplier}x_medicare`, weight: 0.2 });
  }

  // Regional benchmark (good quality)
  if (sources.regional_benchmark && sources.regional_benchmark > 0) {
    candidates.push({ value: sources.regional_benchmark, label: 'regional_50th', weight: 0.25 });
  }

  // Category benchmark (for aggregated bills without codes)
  if (sources.category_benchmark && sources.category_benchmark > 0) {
    candidates.push({ value: sources.category_benchmark, label: 'category_avg', weight: 0.2 });
  }

  // Chargemaster median (lower quality but useful)
  if (sources.chargemaster_median && sources.chargemaster_median > 0) {
    candidates.push({ value: sources.chargemaster_median, label: 'chargemaster_median', weight: 0.15 });
  }

  // NEW: If no candidates BUT we have a category, estimate from description
  if (candidates.length === 0) {
    const categoryBaseline = estimateBaselineFromCategory(line, sources.state);
    if (categoryBaseline > 0) {
      return {
        baseline: categoryBaseline,
        source: 'category_estimate',
        confidence_adjustment: -0.3 // Moderate penalty for estimation
      };
    }
    
    // Final fallback: use billed amount (very low confidence)
    return {
      baseline: line.billed_amount,
      source: 'billed_amount_fallback',
      confidence_adjustment: -0.5 // Major confidence penalty
    };
  }

  // Use minimum of available candidates (conservative approach)
  const sorted = candidates.sort((a, b) => a.value - b.value);
  const baseline = sorted[0].value;
  
  // Build source description
  const sourceLabels = candidates.map(c => c.label).join(', ');
  const source = `min(${sourceLabels})`;

  // Confidence adjustment based on number of sources
  let confidence_adjustment = 0;
  if (candidates.length >= 3) confidence_adjustment = 0.2; // Multiple sources
  else if (candidates.length === 2) confidence_adjustment = 0.1; // Two sources
  else if (candidates.length === 1) confidence_adjustment = -0.2; // Single source

  return { baseline, source, confidence_adjustment };
}

/**
 * Estimate baseline from category for aggregated bills without codes
 */
function estimateBaselineFromCategory(line: BillLine, state?: string): number {
  const desc = line.description.toLowerCase();
  const amount = line.billed_amount;
  
  // Category detection based on keywords
  if (desc.includes('pharmacy') || desc.includes('medication') || desc.includes('drug')) {
    // Pharmacy typically 200-400% markup, estimate fair price at 35% of billed
    return Math.round(amount * 0.35 * 100) / 100;
  }
  
  if (desc.includes('laboratory') || desc.includes('lab') || desc.includes('test')) {
    // Labs typically 100-300% markup, estimate at 40% of billed
    return Math.round(amount * 0.40 * 100) / 100;
  }
  
  if (desc.includes('imaging') || desc.includes('radiology') || desc.includes('ct') || 
      desc.includes('mri') || desc.includes('x-ray') || desc.includes('ultrasound')) {
    // Imaging typically 150-350% markup, estimate at 35% of billed
    return Math.round(amount * 0.35 * 100) / 100;
  }
  
  if (desc.includes('surgery') || desc.includes('operating room') || desc.includes('or time')) {
    // Surgery typically 100-250% markup, estimate at 45% of billed
    return Math.round(amount * 0.45 * 100) / 100;
  }
  
  if (desc.includes('room') || desc.includes('bed') || desc.includes('icu') || desc.includes('ward')) {
    // Room & board typically 80-200% markup, estimate at 50% of billed
    return Math.round(amount * 0.50 * 100) / 100;
  }
  
  if (desc.includes('emergency') || desc.includes('er ') || desc.includes('ed ')) {
    // ER typically 150-300% markup, estimate at 40% of billed
    return Math.round(amount * 0.40 * 100) / 100;
  }
  
  if (desc.includes('supplies') || desc.includes('medical supplies')) {
    // Supplies typically 200-500% markup, estimate at 30% of billed
    return Math.round(amount * 0.30 * 100) / 100;
  }
  
  // Default conservative estimate: 60% of billed amount (40% potential overcharge)
  return Math.round(amount * 0.60 * 100) / 100;
}

/**
 * Calculate NSA savings for a line
 */
export function computeNSASavings(
  line: BillLine,
  nsa_flag: NSAFlag | null,
  allowed_baseline: number,
  default_coinsurance: number = 0.2
): number {
  if (!nsa_flag || !nsa_flag.violation) {
    return 0;
  }

  // Estimate in-network cost share if not provided
  let expected_cost_share = line.expected_in_network_cost_share;
  if (expected_cost_share === undefined || expected_cost_share === null) {
    expected_cost_share = allowed_baseline * default_coinsurance;
  }

  const charged_cost_share = line.patient_cost_share_charged || 0;
  const balance_component = Math.max(0, charged_cost_share - expected_cost_share);
  const explicit_balance = nsa_flag.explicit_balance_bill || 0;
  
  // Cap at billed amount
  const nsa_savings = Math.min(
    line.billed_amount,
    balance_component + explicit_balance
  );

  return nsa_savings;
}

/**
 * Find duplicate clusters using similarity matching
 */
export function findDuplicateClusters(lines: BillLine[]): Array<[BillLine, BillLine, number]> {
  const buckets = new Map<string, BillLine[]>();

  // Group by CPT + revenue code + date
  for (const line of lines) {
    const key = `${line.cpt_or_hcpcs || 'N/A'}_${line.revenue_code || 'N/A'}_${line.date_of_service || 'N/A'}`;
    if (!buckets.has(key)) {
      buckets.set(key, []);
    }
    buckets.get(key)!.push(line);
  }

  const pairs: Array<[BillLine, BillLine, number]> = [];

  // For each bucket, find similar pairs
  for (const [key, group] of buckets.entries()) {
    if (group.length < 2) continue;

    for (let i = 0; i < group.length; i++) {
      for (let j = i + 1; j < group.length; j++) {
        const lj = group[i];
        const lk = group[j];

        // IMPROVED: Check for exact description match first (100% duplicate)
        const exactMatch = lj.description.toLowerCase().trim() === lk.description.toLowerCase().trim();
        
        // IMPROVED: Check if description contains duplicate markers
        const hasDuplicateMarker = 
          lj.description.toLowerCase().includes('(duplicate') ||
          lj.description.toLowerCase().includes('duplicate entry') ||
          lk.description.toLowerCase().includes('(duplicate') ||
          lk.description.toLowerCase().includes('duplicate entry');
        
        // IMPROVED: Lowered threshold from 0.9 to 0.75 for better duplicate catching
        const desc_sim = jaccardSimilarity(lj.description, lk.description);
        const similarityThreshold = exactMatch ? 1.0 : (hasDuplicateMarker ? 0.85 : 0.75);
        
        if (!exactMatch && desc_sim < similarityThreshold) continue;

        // IMPROVED: For exact matches or duplicate markers, skip price check
        if (!exactMatch && !hasDuplicateMarker) {
          // Check unit price similarity (within 20%)
          const uj = lj.billed_amount / Math.max(1, lj.quantity || lj.units || 1);
          const uk = lk.billed_amount / Math.max(1, lk.quantity || lk.units || 1);
          const price_diff = Math.abs(uj - uk) / Math.max(uj, uk);
          if (price_diff > 0.2) continue;
        }

        // Valid duplicate candidate
        const savings = computeDuplicateSavings(lj, lk);
        pairs.push([lj, lk, savings]);
      }
    }
  }

  return pairs;
}

/**
 * Compute savings for a duplicate pair
 */
function computeDuplicateSavings(lj: BillLine, lk: BillLine): number {
  const qj = lj.quantity || lj.units || 1;
  const qk = lk.quantity || lk.units || 1;

  // Equal quantities: take minimum billed amount
  if (qj === qk) {
    return Math.min(lj.billed_amount, lk.billed_amount);
  }

  // Different quantities: compute overlap
  const uj = lj.billed_amount / Math.max(1, qj);
  const uk = lk.billed_amount / Math.max(1, qk);
  const u_avg = (uj + uk) / 2;
  const q_overlap = Math.min(qj, qk);
  
  return u_avg * q_overlap;
}

/**
 * Jaccard similarity for strings (normalized)
 */
function jaccardSimilarity(s1: string, s2: string): number {
  const normalize = (s: string) => 
    s.toLowerCase()
     .replace(/[^\w\s]/g, '')
     .split(/\s+/)
     .filter(w => w.length > 2); // Filter stopwords/short words

  const tokens1 = new Set(normalize(s1));
  const tokens2 = new Set(normalize(s2));

  const intersection = new Set([...tokens1].filter(x => tokens2.has(x)));
  const union = new Set([...tokens1, ...tokens2]);

  return union.size === 0 ? 0 : intersection.size / union.size;
}

/**
 * Compute confidence score for a line
 */
export function computeConfidence(
  line: BillLine,
  sources: BaselineSource,
  nsa_flag: NSAFlag | null,
  baseline_confidence_adj: number
): number {
  let confidence = 0.7; // Start at moderate baseline

  // Data quality component (0.6 to 1.0)
  let data_quality = 0.6;
  if (line.cpt_or_hcpcs && line.cpt_or_hcpcs !== 'N/A') data_quality += 0.1;
  if (line.quantity || line.units) data_quality += 0.1;
  if (line.billed_amount > 0) data_quality += 0.1;
  if (line.description && line.description.length > 10) data_quality += 0.1;

  // Benchmark quality component
  let benchmark_quality = 0;
  if (sources.plan_allowed) benchmark_quality += 0.3;
  if (sources.medicare_allowed) benchmark_quality += 0.2;
  if (sources.regional_benchmark) benchmark_quality += 0.25;
  if (sources.chargemaster_median) benchmark_quality += 0.15;
  
  // Multiple sources bonus
  const source_count = [
    sources.plan_allowed,
    sources.medicare_allowed,
    sources.regional_benchmark,
    sources.chargemaster_median
  ].filter(s => s && s > 0).length;
  
  if (source_count >= 2) benchmark_quality += 0.1;

  // NSA rule certainty
  let nsa_certainty = 0.5;
  if (nsa_flag?.violation) {
    const type = nsa_flag.type || '';
    if (type.includes('149.110') || type.includes('149.420.b') || type.includes('149.440')) {
      nsa_certainty = 1.0; // Hard violation
    } else if (type.includes('149.420.c') || type.includes('149.430')) {
      nsa_certainty = 0.7; // Risk
    }
  }

  // Weighted average
  confidence = (data_quality * 0.3 + benchmark_quality * 0.4 + nsa_certainty * 0.3);
  
  // Apply baseline confidence adjustment
  confidence += baseline_confidence_adj;

  // Clamp to [0.5, 1.0]
  return Math.max(0.5, Math.min(1.0, confidence));
}

/**
 * Main analysis engine
 */
export function analyzeBillSavings(
  lines: BillLine[],
  nsa_flags: Map<string, NSAFlag>,
  baseline_sources: Map<string, BaselineSource>,
  total_billed: number
): SavingsTotals {
  const line_savings: LineSavings[] = [];
  
  // Step 1: Find duplicate clusters
  const duplicate_pairs = findDuplicateClusters(lines);
  const duplicate_allocation = new Map<string, number>();
  
  for (const [lj, lk, savings] of duplicate_pairs) {
    // Allocate half to each line (conservative)
    const half_savings = savings / 2;
    duplicate_allocation.set(lj.line_id, (duplicate_allocation.get(lj.line_id) || 0) + half_savings);
    duplicate_allocation.set(lk.line_id, (duplicate_allocation.get(lk.line_id) || 0) + half_savings);
  }

  // Step 2: Process each line
  let total_nsa = 0;
  let total_duplicate = 0;
  let total_overcharge = 0;
  let total_weighted = 0;

  for (const line of lines) {
    const sources = baseline_sources.get(line.line_id) || {};
    const nsa_flag = nsa_flags.get(line.line_id) || null;

    // Compute allowed baseline
    const { baseline, source, confidence_adjustment } = computeAllowedBaseline(line, sources);

    // NSA savings (priority 1)
    const nsa_savings = computeNSASavings(line, nsa_flag, baseline);

    // Duplicate savings (priority 2)
    const dup_savings = duplicate_allocation.get(line.line_id) || 0;

    // Overcharge savings (priority 3)
    const remaining = Math.max(0, line.billed_amount - nsa_savings - dup_savings);
    const overcharge_raw = Math.max(0, line.billed_amount - baseline);
    const overcharge_savings = Math.min(overcharge_raw, remaining);

    // Confidence
    const confidence = computeConfidence(line, sources, nsa_flag, confidence_adjustment);

    // Weighted contribution
    const total_line = nsa_savings + dup_savings + overcharge_savings;
    const weighted = total_line * confidence;

    // Accumulate
    total_nsa += nsa_savings;
    total_duplicate += dup_savings;
    total_overcharge += overcharge_savings;
    total_weighted += weighted;

    line_savings.push({
      line_id: line.line_id,
      allowed_baseline: baseline,
      baseline_source: source,
      nsa_flag: nsa_flag?.type,
      nsa_savings,
      duplicate_savings: dup_savings,
      overcharge_savings,
      confidence,
      weighted_contribution: weighted,
      total_line_savings: total_line
    });
  }

  // Step 3: Cap at total billed
  const gross_total = total_nsa + total_duplicate + total_overcharge;
  const capped_gross = Math.min(gross_total, total_billed);
  const capped_weighted = Math.min(total_weighted, total_billed);

  // Step 4: Lines with issues and color
  const lines_with_issues = line_savings.filter(
    ls => ls.nsa_savings > 0 || ls.duplicate_savings > 0 || ls.overcharge_savings > 0
  ).length;
  
  const issue_ratio = lines.length > 0 ? lines_with_issues / lines.length : 0;
  const color = getColorForRatio(issue_ratio, lines.length);

  // Step 5: Confidence bands
  const high_conf = line_savings.filter(ls => ls.confidence >= 0.8).reduce((sum, ls) => sum + ls.total_line_savings, 0);
  const med_conf = line_savings.filter(ls => ls.confidence >= 0.5 && ls.confidence < 0.8).reduce((sum, ls) => sum + ls.total_line_savings, 0);
  const low_conf = line_savings.filter(ls => ls.confidence < 0.5).reduce((sum, ls) => sum + ls.total_line_savings, 0);

  // Step 6: Top drivers
  const drivers = line_savings
    .map(ls => {
      let category: 'nsa' | 'duplicate' | 'overcharge' = 'overcharge';
      let amount = ls.overcharge_savings;
      
      if (ls.nsa_savings > 0) {
        category = 'nsa';
        amount = ls.nsa_savings;
      } else if (ls.duplicate_savings > 0) {
        category = 'duplicate';
        amount = ls.duplicate_savings;
      }

      const line = lines.find(l => l.line_id === ls.line_id);
      return {
        cpt_code: line?.cpt_or_hcpcs || 'N/A',
        description: line?.description || 'Unknown',
        amount,
        category
      };
    })
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 3);

  return {
    total_potential_savings_gross: Math.round(capped_gross * 100) / 100,
    total_potential_savings_likely: Math.round(capped_weighted * 100) / 100,
    nsa_savings_subtotal: Math.round(total_nsa * 100) / 100,
    duplicate_savings_subtotal: Math.round(total_duplicate * 100) / 100,
    overcharge_savings_subtotal: Math.round(total_overcharge * 100) / 100,
    lines_with_issues,
    total_lines: lines.length,
    issue_ratio: Math.round(issue_ratio * 100) / 100,
    color,
    confidence_bands: {
      high_confidence: Math.round(high_conf * 100) / 100,
      medium_confidence: Math.round(med_conf * 100) / 100,
      low_confidence: Math.round(low_conf * 100) / 100
    },
    top_drivers: drivers,
    line_details: line_savings
  };
}

/**
 * Get color based on issue ratio
 */
function getColorForRatio(ratio: number, total_lines: number): 'green' | 'yellow' | 'orange' | 'red' {
  // Relax thresholds for small samples
  const adjustment = total_lines < 6 ? 0.1 : 0;

  if (ratio === 0) return 'green';
  if (ratio <= 0.25 + adjustment) return 'yellow';
  if (ratio <= 0.50 + adjustment) return 'orange';
  return 'red';
}
