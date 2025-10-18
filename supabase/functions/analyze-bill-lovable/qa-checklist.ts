/**
 * Automated Quality Assurance Checklist
 * Validates analysis results before returning to user
 */

export function runQAChecklist(analysis: any): void {
  console.log('[QA] === Running Quality Assurance ===');
  
  // Check 1: All flagged lines have baseline
  const flaggedWithoutBaseline = analysis.high_priority_issues?.filter(
    (issue: any) => !issue.medicare_benchmark && !issue.reasonable_rate
  ) || [];
  
  if (flaggedWithoutBaseline.length > 0) {
    console.warn(`[QA] ⚠️ ${flaggedWithoutBaseline.length} flagged issues missing baseline`);
    flaggedWithoutBaseline.forEach((issue: any) => {
      console.warn(`[QA]   - Line ${issue.line_id}: ${issue.issue_type}`);
    });
  }
  
  // Check 2: All duplicate flags have matching_criteria
  const duplicatesWithoutCriteria = analysis.high_priority_issues?.filter(
    (issue: any) => issue.issue_type === 'duplicate' && !issue.evidence?.matching_criteria
  ) || [];
  
  if (duplicatesWithoutCriteria.length > 0) {
    console.warn(`[QA] ⚠️ ${duplicatesWithoutCriteria.length} duplicates missing matching criteria`);
  }
  
  // Check 3: Modifier justification for duplicate flags
  const modifierIssues = analysis.duplicate_findings?.flags?.filter(
    (flag: any) => flag.evidence?.modifiers && !flag.evidence?.modifier_justification
  ) || [];
  
  if (modifierIssues.length > 0) {
    console.warn(`[QA] ⚠️ ${modifierIssues.length} flags with modifiers but no justification`);
  }
  
  // Check 4: Verify savings don't exceed billed amounts
  const invalidSavings = analysis.high_priority_issues?.filter(
    (issue: any) => issue.overcharge_amount > issue.billed_amount
  ) || [];
  
  if (invalidSavings.length > 0) {
    console.error(`[QA] ❌ ${invalidSavings.length} issues with savings > billed amount (logic error)`);
  }
  
  // Check 5: Verify total savings match sum of line items
  const totalFromLines = (analysis.high_priority_issues || []).reduce(
    (sum: number, issue: any) => sum + (issue.overcharge_amount || 0),
    0
  );
  
  const totalReported = analysis.savings_total || 0;
  const savingsDiff = Math.abs(totalFromLines - totalReported);
  
  if (savingsDiff > 1) {
    console.warn(`[QA] ⚠️ Savings mismatch: sum of lines ($${totalFromLines}) vs reported ($${totalReported}), diff=$${savingsDiff}`);
  }
  
  // Summary
  const passedChecks = [
    flaggedWithoutBaseline.length === 0,
    duplicatesWithoutCriteria.length === 0,
    modifierIssues.length === 0,
    invalidSavings.length === 0,
    savingsDiff <= 1
  ].filter(Boolean).length;
  
  console.log(`[QA] QA complete: ${passedChecks}/5 checks passed`);
}
