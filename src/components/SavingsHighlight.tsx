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
            Good News - We Found Ways to Potentially Lower Your Bill
          </h3>
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-4xl font-bold text-green-600">
              ${totalSavings.toLocaleString()}
            </span>
            <span className="text-lg text-green-700">
              in questionable charges
            </span>
          </div>
          <p className="text-green-800 mb-4">
            We identified <strong>{issuesFound} specific item{issuesFound !== 1 ? 's' : ''}</strong> on your bill that you should ask questions about. 
            These aren't random guesses - they're specific charges that either appear twice, seem overpriced compared to standard rates, 
            or may violate federal billing protections.
          </p>
          <p className="text-sm text-green-700 mb-4">
            <strong>What "questionable charges" means:</strong> These are charges that, based on standard billing rules and 
            medical pricing benchmarks, deserve a second look. Some might be legitimate, some might be errors. 
            Either way, you have every right to ask the hospital to explain and justify them.
          </p>
          <div className="flex items-center gap-2 text-green-700">
            <CheckCircle className="h-5 w-5" />
            <span className="font-medium">These potential savings are based on real billing patterns and industry standards</span>
          </div>
        </div>
      </div>
    </Card>
  );
};
