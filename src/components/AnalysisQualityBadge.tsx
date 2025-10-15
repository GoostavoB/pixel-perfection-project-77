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

  return (
    <Alert className="mb-6 border-yellow-300 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-950/20">
      <AlertTriangle className="h-4 w-4 text-yellow-600" />
      <AlertDescription>
        <div className="space-y-2">
          <p className="font-semibold text-sm">
            📊 Análise em Modo Simplificado
          </p>
          <p className="text-xs text-muted-foreground">
            Esta análise foi gerada com uma versão anterior do sistema. 
            Para obter análise completa com todas as novas funcionalidades 
            (auditoria clínica, simulador de conta corrigida, explicações interativas), 
            faça upload novamente da sua conta médica.
          </p>
          <div className="flex flex-wrap gap-2 mt-2">
            <Badge variant={hasDetailedIssues ? "default" : "secondary"} className="text-xs">
              {hasDetailedIssues ? <CheckCircle className="w-3 h-3 mr-1" /> : <Info className="w-3 h-3 mr-1" />}
              {hasDetailedIssues ? "Issues Detalhados ✓" : "Issues Básicos"}
            </Badge>
            <Badge variant={hasSavingsCalculation ? "default" : "secondary"} className="text-xs">
              {hasSavingsCalculation ? <CheckCircle className="w-3 h-3 mr-1" /> : <Info className="w-3 h-3 mr-1" />}
              {hasSavingsCalculation ? "Cálculo de Savings ✓" : "Sem Cálculo de Savings"}
            </Badge>
            <Badge variant={hasConfidenceScores ? "default" : "secondary"} className="text-xs">
              {hasConfidenceScores ? <CheckCircle className="w-3 h-3 mr-1" /> : <Info className="w-3 h-3 mr-1" />}
              {hasConfidenceScores ? "Scores de Confiança ✓" : "Sem Scores de Confiança"}
            </Badge>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
};
