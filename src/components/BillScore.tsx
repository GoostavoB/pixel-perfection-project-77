import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, CheckCircle, TrendingDown } from "lucide-react";

interface BillScoreProps {
  score: number;
  totalCharged: number;
  estimatedSavings: number;
  criticalIssues: number;
  moderateIssues: number;
}

export const BillScore = ({ 
  score, 
  totalCharged, 
  estimatedSavings, 
  criticalIssues, 
  moderateIssues 
}: BillScoreProps) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Good Transparency";
    if (score >= 60) return "Needs Review";
    return "Multiple Issues";
  };

  const savingsPercentage = totalCharged > 0 
    ? ((estimatedSavings / totalCharged) * 100).toFixed(1) 
    : "0";

  return (
    <Card className="p-6 bg-gradient-to-br from-background to-muted/20">
      <div className="space-y-6">
        {/* Score principal */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className={`text-6xl font-bold ${getScoreColor(score)}`}>
              {score}
            </div>
            <div className="text-muted-foreground text-sm">/ 100</div>
          </div>
          <p className="text-sm font-medium text-muted-foreground">
            {getScoreLabel(score)}
          </p>
          <Progress value={score} className="mt-4 h-3" />
        </div>

        {/* Resumo financeiro */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span className="text-2xl font-bold text-red-600">
                {criticalIssues}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">Critical Issues</p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <CheckCircle className="h-4 w-4 text-yellow-500" />
              <span className="text-2xl font-bold text-yellow-600">
                {moderateIssues}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">To Review</p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <TrendingDown className="h-4 w-4 text-green-500" />
              <span className="text-2xl font-bold text-green-600">
                {savingsPercentage}%
              </span>
            </div>
            <p className="text-xs text-muted-foreground">Potential Savings</p>
          </div>
        </div>

        {/* Mensagem empática */}
        {estimatedSavings > 0 && (
          <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <p className="text-sm text-green-800 dark:text-green-200">
              <span className="font-semibold">Good news!</span> We found questionable charges. If confirmed, you could save up to {" "}
              <span className="font-bold">${estimatedSavings.toFixed(2)}</span>. 
              We'll help you resolve this step by step.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};
