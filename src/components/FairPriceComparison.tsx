import { TrendingDown, CheckCircle, DollarSign, Info } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface FairPriceComparisonProps {
  billedAmount: number;
  fairPrice: number;
  medicareRate?: number;
  confidence: 'high' | 'medium' | 'low';
  source?: string;
  description?: string;
  compact?: boolean;
}

export const FairPriceComparison = ({ 
  billedAmount, 
  fairPrice, 
  medicareRate,
  confidence,
  source = 'CMS Medicare Data',
  description,
  compact = false
}: FairPriceComparisonProps) => {
  const overcharge = Math.max(0, billedAmount - fairPrice);
  const savingsPercent = billedAmount > 0 ? Math.round((overcharge / billedAmount) * 100) : 0;
  const markup = medicareRate && medicareRate > 0 
    ? Math.round((billedAmount / medicareRate) * 100) - 100 
    : 0;

  const confidenceColor = {
    high: 'text-green-600 bg-green-50 border-green-200',
    medium: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    low: 'text-gray-600 bg-gray-50 border-gray-200'
  }[confidence];

  const confidenceLabel = {
    high: 'High Confidence',
    medium: 'Medium Confidence',
    low: 'Estimated'
  }[confidence];

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 text-sm">
          <span className="text-muted-foreground">Billed:</span>
          <span className="font-semibold text-red-600">${billedAmount.toLocaleString()}</span>
        </div>
        <div className="text-muted-foreground">→</div>
        <div className="flex items-center gap-1 text-sm">
          <span className="text-muted-foreground">Fair:</span>
          <span className="font-semibold text-green-600">${fairPrice.toLocaleString()}</span>
        </div>
        {overcharge > 0 && (
          <Badge variant="destructive" className="ml-2">
            Save ${overcharge.toLocaleString()}
          </Badge>
        )}
      </div>
    );
  }

  return (
    <Card className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
      <div className="space-y-3">
        {/* Header with confidence badge */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <DollarSign className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Price Comparison</h4>
              {description && (
                <p className="text-xs text-gray-600 mt-0.5">{description}</p>
              )}
            </div>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge className={confidenceColor} variant="outline">
                  {confidenceLabel}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Based on {source}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Price bars visualization */}
        <div className="space-y-2">
          {/* Billed amount bar */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Hospital Bill</span>
              <span className="font-semibold text-red-600">${billedAmount.toLocaleString()}</span>
            </div>
            <div className="h-8 bg-red-100 rounded-lg flex items-center px-3 border border-red-200">
              <div 
                className="h-6 bg-gradient-to-r from-red-500 to-red-600 rounded shadow-sm transition-all"
                style={{ width: '100%' }}
              />
            </div>
          </div>

          {/* Fair price bar */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Fair Market Price</span>
              <span className="font-semibold text-green-600">${fairPrice.toLocaleString()}</span>
            </div>
            <div className="h-8 bg-green-100 rounded-lg flex items-center px-3 border border-green-200">
              <div 
                className="h-6 bg-gradient-to-r from-green-500 to-green-600 rounded shadow-sm transition-all"
                style={{ width: `${Math.min(100, (fairPrice / billedAmount) * 100)}%` }}
              />
            </div>
          </div>

          {/* Medicare baseline (if available) */}
          {medicareRate && medicareRate > 0 && (
            <div>
              <div className="flex justify-between text-sm mb-1">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="text-gray-600 flex items-center gap-1 cursor-help">
                        Medicare Rate
                        <Info className="h-3 w-3" />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">What Medicare would pay for this service</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <span className="font-medium text-blue-600">${medicareRate.toLocaleString()}</span>
              </div>
              <div className="h-6 bg-blue-100 rounded-lg flex items-center px-3 border border-blue-200">
                <div 
                  className="h-4 bg-gradient-to-r from-blue-400 to-blue-500 rounded shadow-sm transition-all"
                  style={{ width: `${Math.min(100, (medicareRate / billedAmount) * 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Summary metrics */}
        <div className="flex gap-2 pt-2 border-t border-blue-200">
          {overcharge > 0 && (
            <div className="flex-1 p-2 bg-white rounded-lg border border-gray-200">
              <div className="flex items-center gap-1 text-xs text-gray-600 mb-0.5">
                <TrendingDown className="h-3 w-3" />
                Potential Savings
              </div>
              <div className="font-bold text-green-600">
                ${overcharge.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500">
                {savingsPercent}% reduction
              </div>
            </div>
          )}
          
          {markup > 0 && (
            <div className="flex-1 p-2 bg-white rounded-lg border border-gray-200">
              <div className="text-xs text-gray-600 mb-0.5">
                Medicare Markup
              </div>
              <div className="font-bold text-red-600">
                {markup}%
              </div>
              <div className="text-xs text-gray-500">
                above baseline
              </div>
            </div>
          )}

          {fairPrice === billedAmount && (
            <div className="flex-1 p-2 bg-green-50 rounded-lg border border-green-200 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <div>
                <div className="text-xs font-semibold text-green-700">Fair Price</div>
                <div className="text-xs text-green-600">No overcharge detected</div>
              </div>
            </div>
          )}
        </div>

        {/* Data source footer */}
        <div className="text-xs text-gray-500 flex items-center gap-1">
          <Info className="h-3 w-3" />
          <span>Pricing from {source}</span>
        </div>
      </div>
    </Card>
  );
};