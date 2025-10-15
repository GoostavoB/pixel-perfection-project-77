import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertTriangle, Info } from "lucide-react";

interface AnalysisQualityBadgeProps {
  hasDetailedIssues: boolean;
  hasSavingsCalculation: boolean;
  hasConfidenceScores: boolean;
  issuesCount: number;
}

export const AnalysisQualityBadge = ({ 
  hasDetailedIssues, 
  hasSavingsCalculation, 
  hasConfidenceScores,
  issuesCount 
}: AnalysisQualityBadgeProps) => {
  const isFullAnalysis = hasDetailedIssues && hasSavingsCalculation && hasConfidenceScores;
  
  // Don't show if perfect analysis
  if (isFullAnalysis) return null;

  // Check if this is a lack of itemization issue (bill's fault, not system's fault)
  const isLackOfItemization = !hasSavingsCalculation && hasDetailedIssues && hasConfidenceScores;

  if (isLackOfItemization) {
    return (
      <Alert className="mb-6 border-orange-300 dark:border-orange-700 bg-orange-50 dark:bg-orange-950/20">
        <Info className="h-4 w-4 text-orange-600" />
        <AlertDescription>
          <div className="space-y-2">
            <p className="font-semibold text-sm">
              📋 Bill Lacks Itemization
            </p>
            <p className="text-xs text-muted-foreground">
              Your bill shows general categories (e.g., "Laboratory Services", "Pharmacy") without specific CPT codes or line-item details. 
              This makes it impossible to calculate exact overcharges. <strong>Request an itemized bill from your provider</strong> to get a detailed savings analysis.
            </p>
            <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded mt-2">
              <p className="text-xs font-medium text-orange-900 dark:text-orange-100">
                💡 What to do: Call your billing department and say: "I need an itemized bill with CPT codes for each service."
              </p>
            </div>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className="mb-6 border-yellow-300 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-950/20">
      <AlertTriangle className="h-4 w-4 text-yellow-600" />
      <AlertDescription>
        <div className="space-y-2">
          <p className="font-semibold text-sm">
            📊 Limited Analysis Data
          </p>
          <p className="text-xs text-muted-foreground">
            Some analysis features are missing. This could be due to bill format limitations or incomplete data extraction.
          </p>
          <div className="flex flex-wrap gap-2 mt-2">
            <Badge variant={hasDetailedIssues ? "default" : "secondary"} className="text-xs">
              {hasDetailedIssues ? <CheckCircle className="w-3 h-3 mr-1" /> : <Info className="w-3 h-3 mr-1" />}
              {hasDetailedIssues ? "Detailed Issues ✓" : "Basic Issues"}
            </Badge>
            <Badge variant={hasSavingsCalculation ? "default" : "secondary"} className="text-xs">
              {hasSavingsCalculation ? <CheckCircle className="w-3 h-3 mr-1" /> : <Info className="w-3 h-3 mr-1" />}
              {hasSavingsCalculation ? "Savings Calculation ✓" : "No Savings Calculation"}
            </Badge>
            <Badge variant={hasConfidenceScores ? "default" : "secondary"} className="text-xs">
              {hasConfidenceScores ? <CheckCircle className="w-3 h-3 mr-1" /> : <Info className="w-3 h-3 mr-1" />}
              {hasConfidenceScores ? "Confidence Scores ✓" : "No Confidence Scores"}
            </Badge>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
};
