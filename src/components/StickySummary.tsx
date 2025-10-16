import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingDown } from "lucide-react";

interface StickySummaryProps {
  currentTotal: number;
  selectedReductions: number;
  estimatedNewTotal: number;
  savingsPercentage: number;
}

export const StickySummary = ({ 
  currentTotal, 
  selectedReductions, 
  estimatedNewTotal, 
  savingsPercentage 
}: StickySummaryProps) => {
  return (
    <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 py-4">
      <Card className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-muted-foreground">Current bill total:</span>
          <span className="text-lg font-semibold text-foreground">
            ${currentTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
        
        {selectedReductions > 0 && (
          <div className="flex items-center justify-between mb-3 pb-3 border-b border-green-200">
            <span className="text-sm text-muted-foreground">Selected reductions:</span>
            <span className="text-lg font-semibold text-red-600">
              -${selectedReductions.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        )}

        {selectedReductions > 0 && (
          <div className="flex items-end justify-between">
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-foreground mb-1">Estimated new total:</span>
              <Badge className="bg-green-100 text-green-700 border-green-300 w-fit">
                <TrendingDown className="w-3 h-3 mr-1" />
                {savingsPercentage.toFixed(1)}% savings
              </Badge>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-green-700">
                ${estimatedNewTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
