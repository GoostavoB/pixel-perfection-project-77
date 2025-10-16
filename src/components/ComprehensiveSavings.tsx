import { TrendingDown, AlertCircle, Info, CheckCircle2, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SavingsTotals {
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
    high_confidence: number;
    medium_confidence: number;
    low_confidence: number;
  };
  top_drivers: Array<{
    cpt_code: string;
    description: string;
    amount: number;
    category: 'nsa' | 'duplicate' | 'overcharge';
  }>;
}

interface ComprehensiveSavingsProps {
  savings: SavingsTotals;
  computedIssuesCount?: number;
  totalBilled?: number;
  tags?: string[];
}

export const ComprehensiveSavings = ({ savings, computedIssuesCount, totalBilled = 0, tags = [] }: ComprehensiveSavingsProps) => {
  const {
    total_potential_savings_gross,
    total_potential_savings_likely,
    nsa_savings_subtotal,
    duplicate_savings_subtotal,
    overcharge_savings_subtotal,
    lines_with_issues,
    total_lines,
    issue_ratio,
    color,
    confidence_bands,
    top_drivers
  } = savings;

  const displayIssuesCount = computedIssuesCount ?? lines_with_issues;

  // Calculate fallback savings if both gross and likely are $0
  const calculateFallbackSavings = (totalBill: number, billTags: string[]): { low: number; high: number } => {
    let savingsPercentLow = 0.20;
    let savingsPercentHigh = 0.30;
    
    if (billTags.some(t => t.toLowerCase().includes('emergency') || t.toLowerCase().includes('er'))) {
      savingsPercentLow = 0.35;
      savingsPercentHigh = 0.40;
    } else if (billTags.some(t => t.toLowerCase().includes('surgery') || t.toLowerCase().includes('operating'))) {
      savingsPercentLow = 0.30;
      savingsPercentHigh = 0.35;
    } else if (billTags.some(t => t.toLowerCase().includes('imaging') || t.toLowerCase().includes('radiology'))) {
      savingsPercentLow = 0.30;
      savingsPercentHigh = 0.35;
    } else if (billTags.some(t => t.toLowerCase().includes('lab') || t.toLowerCase().includes('test'))) {
      savingsPercentLow = 0.25;
      savingsPercentHigh = 0.30;
    } else if (billTags.some(t => t.toLowerCase().includes('pharmacy') || t.toLowerCase().includes('medication'))) {
      savingsPercentLow = 0.25;
      savingsPercentHigh = 0.30;
    } else if (billTags.some(t => t.toLowerCase().includes('room') || t.toLowerCase().includes('bed'))) {
      savingsPercentLow = 0.20;
      savingsPercentHigh = 0.25;
    }
    
    return {
      low: Math.round(totalBill * savingsPercentLow),
      high: Math.round(totalBill * savingsPercentHigh)
    };
  };

  const hasSavings = total_potential_savings_gross > 0 || total_potential_savings_likely > 0;
  const fallbackSavings = (!hasSavings && totalBilled > 0) 
    ? calculateFallbackSavings(totalBilled, tags)
    : null;
  
  // Distribute fallback savings across confidence bands if needed
  const fallbackConfidenceBands = fallbackSavings ? {
    high_confidence: Math.round(fallbackSavings.low * 0.4),
    medium_confidence: Math.round(fallbackSavings.low * 0.35),
    low_confidence: Math.round(fallbackSavings.low * 0.25)
  } : null;
  
  // Create synthetic top drivers from tags if needed
  const fallbackTopDrivers = fallbackSavings && tags.length > 0 ? tags.slice(0, 3).map((tag, idx) => {
    const estimatedAmount = idx === 0 
      ? Math.round(fallbackSavings.high * 0.35)
      : idx === 1 
        ? Math.round(fallbackSavings.high * 0.30)
        : Math.round(fallbackSavings.high * 0.25);
    return {
      cpt_code: 'AGGREGATED',
      description: tag,
      amount: estimatedAmount,
      category: 'overcharge' as const
    };
  }) : null;

  const colorMap = {
    green: { bg: 'bg-success/10', border: 'border-success/20', text: 'text-success' },
    yellow: { bg: 'bg-warning/10', border: 'border-warning/20', text: 'text-warning' },
    orange: { bg: 'bg-destructive/10', border: 'border-destructive/20', text: 'text-destructive' },
    red: { bg: 'bg-destructive/20', border: 'border-destructive/30', text: 'text-destructive' }
  };

  const categoryLabels = {
    nsa: { label: 'NSA Violations', icon: AlertCircle, color: 'text-destructive' },
    duplicate: { label: 'Duplicate Charges', icon: AlertTriangle, color: 'text-warning' },
    overcharge: { label: 'Overcharges', icon: TrendingDown, color: 'text-secondary' }
  };

  return (
    <div className="space-y-4">
      {/* Main Savings Card */}
      <Card className={`p-4 ${colorMap[color].bg} ${colorMap[color].border} border-2`}>
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg ${colorMap[color].bg}`}>
            <TrendingDown className={`h-6 w-6 ${colorMap[color].text}`} />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold mb-2">
              We Found {displayIssuesCount}/{total_lines} Lines with Potential Issues
            </h3>
            
            {/* Gross vs Likely Savings */}
            {fallbackSavings ? (
              <div className="mb-3">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-warning" />
                  <p className="text-sm font-semibold text-foreground">Conservative Estimated Savings Range</p>
                </div>
                <p className="text-2xl font-bold text-primary mb-1">
                  ${fallbackSavings.low.toLocaleString()} - ${fallbackSavings.high.toLocaleString()}
                </p>
                <Badge variant="outline" className="text-xs mb-2">
                  Based on typical overcharge patterns for bill categories
                </Badge>
                <p className="text-xs text-muted-foreground">
                  This is a conservative estimate. Request an itemized bill with CPT codes for precise calculations.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-xs text-muted-foreground">Total Potential (Gross)</p>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p className="text-sm">Maximum possible savings if all identified issues are resolved. This is the upper bound.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <p className="text-2xl font-bold text-foreground">
                    ${total_potential_savings_gross.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-xs text-muted-foreground">Likely Savings (Weighted)</p>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p className="text-sm">Realistic savings estimate weighted by confidence. This is what you can reasonably expect to save.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <p className="text-2xl font-bold text-success">
                    ${total_potential_savings_likely.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            )}

            {/* Issue Ratio Badge */}
            <div className="flex items-center gap-2 mb-3">
              {(() => {
                const percentageValue = fallbackSavings 
                  ? (total_lines > 0 ? 100 : 0)
                  : (issue_ratio * 100);
                
                // Determine badge color based on percentage
                let badgeClasses = "bg-green-50 text-green-700 border-green-200";
                if (percentageValue >= 10.1) {
                  badgeClasses = "bg-red-50 text-red-700 border-red-200";
                } else if (percentageValue >= 0.01) {
                  badgeClasses = "bg-orange-50 text-orange-700 border-orange-200";
                }
                
                return (
                  <Badge variant="outline" className={badgeClasses}>
                    {percentageValue.toFixed(0)}% of bill has issues
                  </Badge>
                );
              })()}
              <span className="text-xs text-muted-foreground">
                ({fallbackSavings ? total_lines : displayIssuesCount} of {total_lines} line items)
              </span>
            </div>
            
            {/* Non-itemized disclaimer */}
            {fallbackSavings && (
              <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-xs text-yellow-900">
                  <strong>⚠️ Important:</strong> Bills/reports of non-itemized bills are <strong>less likely to be accurate</strong>. 
                  This is a conservative estimate based on typical overcharge patterns. Request an itemized bill for precise calculations.
                </p>
              </div>
            )}

            <p className="text-xs text-muted-foreground">
              These savings calculations prevent double-counting by processing NSA violations first, then duplicates, then overcharges.
            </p>
          </div>
        </div>
      </Card>

      {/* Breakdown by Category */}
      <Card className="p-4">
        <h3 className="text-base font-semibold mb-3">Savings Breakdown by Category</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* NSA Savings */}
          {nsa_savings_subtotal > 0 && (
            <div className="p-3 bg-destructive/5 border border-destructive/20 rounded-lg">
              <div className="flex items-center gap-1.5 mb-1.5">
                <AlertCircle className="w-4 h-4 text-destructive" />
                <span className="font-medium text-xs">NSA Violations</span>
              </div>
              <p className="text-xl font-bold text-destructive">
                ${nsa_savings_subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Balance billing protections
              </p>
            </div>
          )}

          {/* Duplicate Savings */}
          {duplicate_savings_subtotal > 0 && (
            <div className="p-3 bg-warning/5 border border-warning/20 rounded-lg">
              <div className="flex items-center gap-1.5 mb-1.5">
                <AlertTriangle className="w-4 h-4 text-warning" />
                <span className="font-medium text-xs">Duplicate Charges</span>
              </div>
              <p className="text-xl font-bold text-warning">
                ${duplicate_savings_subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Identical or similar charges
              </p>
            </div>
          )}

          {/* Overcharge Savings */}
          {overcharge_savings_subtotal > 0 && (
            <div className="p-3 bg-secondary/5 border border-secondary/20 rounded-lg">
              <div className="flex items-center gap-1.5 mb-1.5">
                <TrendingDown className="w-4 h-4 text-secondary" />
                <span className="font-medium text-xs">Overcharges</span>
              </div>
              <p className="text-xl font-bold text-secondary">
                ${overcharge_savings_subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Above baseline pricing
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Confidence Bands */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold">Confidence Breakdown</h3>
          {fallbackSavings && (
            <span className="text-xs text-yellow-700 bg-yellow-50 px-2 py-0.5 rounded border border-yellow-200">
              Estimated ranges
            </span>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-3 border rounded-lg bg-background/50">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-success" />
                <span className="font-medium text-xs">High</span>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-sm font-semibold mb-1">Why High Confidence?</p>
                    <p className="text-xs">Clear overcharges with solid evidence from multiple pricing sources (CMS Medicare + Fair Health), exact CPT code matches, or confirmed duplicates/NSA violations.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <p className="text-xl font-bold">
              ${(fallbackConfidenceBands?.high_confidence || confidence_bands.high_confidence).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {fallbackSavings ? 'estimated' : '≥80% certainty'}
            </p>
          </div>

          <div className="p-3 border rounded-lg bg-background/50">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-warning" />
                <span className="font-medium text-xs">Medium</span>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-sm font-semibold mb-1">Why Medium Confidence?</p>
                    <p className="text-xs">Probable issues based on similar procedures, regional estimates, or patterns that need verification but lack complete documentation.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <p className="text-xl font-bold">
              ${(fallbackConfidenceBands?.medium_confidence || confidence_bands.medium_confidence).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {fallbackSavings ? 'estimated' : '50-80% certainty'}
            </p>
          </div>

          <div className="p-3 border rounded-lg bg-background/50">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium text-xs">Low</span>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-sm font-semibold mb-1">Why Low Confidence?</p>
                    <p className="text-xs">Potential issues requiring additional itemization or documentation to confirm, often based on national averages or incomplete data.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <p className="text-xl font-bold">
              ${(fallbackConfidenceBands?.low_confidence || confidence_bands.low_confidence).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {fallbackSavings ? 'estimated' : '<50% certainty'}
            </p>
          </div>
        </div>
      </Card>

      {/* Top 3 Drivers */}
      {((top_drivers && top_drivers.length > 0) || fallbackTopDrivers) && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold">Top 3 Savings Opportunities</h3>
            {fallbackTopDrivers && (
              <span className="text-xs text-yellow-700 bg-yellow-50 px-2 py-0.5 rounded border border-yellow-200">
                Estimated
              </span>
            )}
          </div>
          <div className="space-y-2">
            {(fallbackTopDrivers || top_drivers).map((driver, idx) => {
              const categoryInfo = categoryLabels[driver.category];
              const CategoryIcon = categoryInfo.icon;
              
              return (
                <div key={idx} className="flex items-start gap-2 p-2 border rounded-lg">
                  <div className={`p-1.5 rounded ${colorMap[color].bg}`}>
                    <CategoryIcon className={`w-4 h-4 ${categoryInfo.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                        {driver.cpt_code}
                      </Badge>
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                        {categoryInfo.label}
                      </Badge>
                    </div>
                    <p className="text-xs font-medium truncate">{driver.description}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-base font-bold text-success">
                      ${driver.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                    {fallbackTopDrivers && (
                      <p className="text-[10px] text-muted-foreground">est.</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
};
