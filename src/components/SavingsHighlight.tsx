import { TrendingDown, DollarSign, CheckCircle } from "lucide-react";
import { Card } from "@/components/ui/card";

interface SavingsHighlightProps {
  totalSavings: number;
  issuesFound: number;
}

export const SavingsHighlight = ({ totalSavings, issuesFound }: SavingsHighlightProps) => {
  return (
    <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-green-100 rounded-lg">
          <TrendingDown className="h-8 w-8 text-green-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-green-900 mb-2">
            Good News! We Found Potential Savings
          </h3>
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-4xl font-bold text-green-600">
              ${totalSavings.toLocaleString()}
            </span>
            <span className="text-lg text-green-700">
              in overcharges
            </span>
          </div>
          <p className="text-green-800 mb-4">
            We identified <strong>{issuesFound} items</strong> on your bill that deserve a second look. 
            These aren't just random charges - they're specific, negotiable overcharges that you can dispute.
          </p>
          <div className="flex items-center gap-2 text-green-700">
            <CheckCircle className="h-5 w-5" />
            <span className="font-medium">These savings are realistic and achievable</span>
          </div>
        </div>
      </div>
    </Card>
  );
};
