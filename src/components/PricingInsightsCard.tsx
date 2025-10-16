import { Database, AlertCircle, Info } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface PricingInsight {
  totalCodes: number;
  codesWithFairPrices: number;
  highConfidence: number;
  mediumConfidence: number;
  lowConfidence: number;
  totalFairPriceData: number;
  totalOvercharges: number;
  averageMarkup: number;
}

interface PricingInsightsCardProps {
  insights: PricingInsight;
}

export const PricingInsightsCard = ({ insights }: PricingInsightsCardProps) => {
  return (
    <TooltipProvider>
      <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Database className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Real-Time Pricing Data
                </h3>
              </div>
              <p className="text-sm text-gray-600">
                Powered by CMS Medicare & Fair Health APIs
              </p>
            </div>
            <Badge variant="outline" className="bg-white">
              {insights.codesWithFairPrices} codes priced
            </Badge>
          </div>

          {/* Confidence breakdown */}
          <div className="space-y-2">
          <div className="text-sm font-medium text-gray-700 mb-2">Pricing Quality:</div>
          
          {insights.highConfidence > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-green-500 h-full transition-all"
                  style={{ width: `${(insights.highConfidence / insights.codesWithFairPrices) * 100}%` }}
                />
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="outline" className="text-green-700 bg-green-50 border-green-200 cursor-help">
                    {insights.highConfidence} High
                    <Info className="h-3 w-3 ml-1" />
                  </Badge>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="text-sm">
                    Pricing data from multiple reliable sources (CMS Medicare + Fair Health). High accuracy for your area and procedure type.
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
          )}
          
          {insights.mediumConfidence > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-yellow-500 h-full transition-all"
                  style={{ width: `${(insights.mediumConfidence / insights.codesWithFairPrices) * 100}%` }}
                />
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="outline" className="text-yellow-700 bg-yellow-50 border-yellow-200 cursor-help">
                    {insights.mediumConfidence} Medium
                    <Info className="h-3 w-3 ml-1" />
                  </Badge>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="text-sm">
                    Pricing based on similar procedures or regional estimates. Good reliability but may vary slightly.
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
          )}
          
          {insights.lowConfidence > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-gray-500 h-full transition-all"
                  style={{ width: `${(insights.lowConfidence / insights.codesWithFairPrices) * 100}%` }}
                />
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="outline" className="text-gray-700 bg-gray-50 border-gray-200 cursor-help">
                    {insights.lowConfidence} Estimated
                    <Info className="h-3 w-3 ml-1" />
                  </Badge>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="text-sm">
                    Conservative estimate based on national averages. Actual fair price may differ - we recommend additional verification.
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
          )}
        </div>

          {/* Summary stats */}
          {insights.averageMarkup > 0 && (
            <div className="pt-3 border-t border-blue-200 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-orange-500 mt-0.5" />
              <div className="text-sm">
                <span className="text-gray-700">Average markup over Medicare: </span>
                <span className="font-bold text-orange-600">{insights.averageMarkup}%</span>
              </div>
            </div>
          )}
        </div>
      </Card>
    </TooltipProvider>
  );
};