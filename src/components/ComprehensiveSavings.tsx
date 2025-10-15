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
}

export const ComprehensiveSavings = ({ savings }: ComprehensiveSavingsProps) => {
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
    <div className="space-y-6">
      {/* Main Savings Card */}
      <Card className={`p-6 ${colorMap[color].bg} ${colorMap[color].border} border-2`}>
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-lg ${colorMap[color].bg}`}>
            <TrendingDown className={`h-8 w-8 ${colorMap[color].text}`} />
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold mb-2">
              We Found {lines_with_issues}/{total_lines} Lines with Potential Issues
            </h3>
            
            {/* Gross vs Likely Savings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm text-muted-foreground">Total Potential (Gross)</p>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="w-4 h-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="text-sm">Maximum possible savings if all identified issues are resolved. This is the upper bound.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <p className="text-3xl font-bold text-foreground">
                  ${total_potential_savings_gross.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
              </div>
              
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm text-muted-foreground">Likely Savings (Weighted)</p>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="w-4 h-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="text-sm">Realistic savings estimate weighted by confidence. This is what you can reasonably expect to save.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <p className="text-3xl font-bold text-success">
                  ${total_potential_savings_likely.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>

            {/* Issue Ratio Badge */}
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="outline" className={`${colorMap[color].text} ${colorMap[color].border}`}>
                {(issue_ratio * 100).toFixed(0)}% of bill has issues
              </Badge>
              <span className="text-sm text-muted-foreground">
                ({lines_with_issues} of {total_lines} line items)
              </span>
            </div>

            <p className="text-sm text-muted-foreground">
              These savings calculations prevent double-counting by processing NSA violations first, then duplicates, then overcharges.
            </p>
          </div>
        </div>
      </Card>

      {/* Breakdown by Category */}
      <Card className="p-6">
        <h3 className="text-lg font-bold mb-4">Savings Breakdown by Category</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* NSA Savings */}
          {nsa_savings_subtotal > 0 && (
            <div className="p-4 bg-destructive/5 border border-destructive/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-5 h-5 text-destructive" />
                <span className="font-semibold text-sm">NSA Violations</span>
              </div>
              <p className="text-2xl font-bold text-destructive">
                ${nsa_savings_subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Balance billing protections
              </p>
            </div>
          )}

          {/* Duplicate Savings */}
          {duplicate_savings_subtotal > 0 && (
            <div className="p-4 bg-warning/5 border border-warning/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-warning" />
                <span className="font-semibold text-sm">Duplicate Charges</span>
              </div>
              <p className="text-2xl font-bold text-warning">
                ${duplicate_savings_subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Identical or similar charges
              </p>
            </div>
          )}

          {/* Overcharge Savings */}
          {overcharge_savings_subtotal > 0 && (
            <div className="p-4 bg-secondary/5 border border-secondary/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="w-5 h-5 text-secondary" />
                <span className="font-semibold text-sm">Overcharges</span>
              </div>
              <p className="text-2xl font-bold text-secondary">
                ${overcharge_savings_subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Above baseline pricing
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Confidence Bands */}
      <Card className="p-6">
        <h3 className="text-lg font-bold mb-4">Confidence Breakdown</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-5 h-5 text-success" />
              <span className="font-semibold text-sm">High Confidence</span>
            </div>
            <p className="text-2xl font-bold">
              ${confidence_bands.high_confidence.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              ≥80% certainty
            </p>
          </div>

          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-warning" />
              <span className="font-semibold text-sm">Medium Confidence</span>
            </div>
            <p className="text-2xl font-bold">
              ${confidence_bands.medium_confidence.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              50-80% certainty
            </p>
          </div>

          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-5 h-5 text-muted-foreground" />
              <span className="font-semibold text-sm">Low Confidence</span>
            </div>
            <p className="text-2xl font-bold">
              ${confidence_bands.low_confidence.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              &lt;50% certainty
            </p>
          </div>
        </div>
      </Card>

      {/* Top 3 Drivers */}
      {top_drivers && top_drivers.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4">Top 3 Savings Opportunities</h3>
          <div className="space-y-3">
            {top_drivers.map((driver, idx) => {
              const categoryInfo = categoryLabels[driver.category];
              const CategoryIcon = categoryInfo.icon;
              
              return (
                <div key={idx} className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className={`p-2 rounded ${colorMap[color].bg}`}>
                    <CategoryIcon className={`w-5 h-5 ${categoryInfo.color}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">
                        {driver.cpt_code}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {categoryInfo.label}
                      </Badge>
                    </div>
                    <p className="text-sm font-medium">{driver.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-success">
                      ${driver.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
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
