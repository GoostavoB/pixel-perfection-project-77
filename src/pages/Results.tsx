import { CheckCircle, AlertCircle, AlertTriangle, DollarSign, Database, Mail, FileText, ArrowRight, Calendar, FileBarChart, TrendingDown, Loader2 } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { pdfGenerator } from '@/utils/pdfGenerator';
import { BillScore } from "@/components/BillScore";
import { MedicalGlossary } from "@/components/MedicalGlossary";
import { KnowYourRights } from "@/components/KnowYourRights";
import { ConfidenceBadge } from "@/components/ConfidenceBadge";
import { BeforeAfterComparison } from "@/components/BeforeAfterComparison";
import { CPTExplainer } from "@/components/CPTExplainer";
import { PrivacyDisclaimer } from "@/components/PrivacyDisclaimer";

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { analysis: passedAnalysis, sessionId } = (location.state as { analysis?: any; sessionId?: string }) || {};
  
  const [analysis, setAnalysis] = useState(passedAnalysis);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  
  useEffect(() => {
    if (!analysis || !sessionId) {
      navigate('/upload');
    }
  }, [analysis, sessionId, navigate]);

  if (!analysis) return null;

  const analysisDate = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  // Parse ui_summary se vier como string
  const uiSummary = typeof analysis.ui_summary === 'string' 
    ? JSON.parse(analysis.ui_summary) 
    : analysis.ui_summary || {};
  
  const fullAnalysis = typeof analysis.full_analysis === 'string'
    ? JSON.parse(analysis.full_analysis)
    : analysis.full_analysis || {};

  const criticalIssues = uiSummary.high_priority_count || fullAnalysis.high_priority_issues?.length || 0;
  const moderateIssues = uiSummary.potential_issues_count || fullAnalysis.potential_issues?.length || 0;
  const estimatedSavings = uiSummary.estimated_savings_if_corrected || fullAnalysis.estimated_savings || 0;
  const hospitalName = analysis.hospital_name || '';
  const dataSources = uiSummary.data_sources_used || fullAnalysis.data_sources || [];
  const tags = uiSummary.tags || fullAnalysis.tags || [];
  const emailSent = analysis.email_sent || false;

  // Calculate Bill Score (0-100)
  const totalIssues = criticalIssues + moderateIssues;
  const totalCharged = analysis.total_charged || 1000; // fallback
  const savingsPercentage = (estimatedSavings / totalCharged) * 100;
  
  // Score calculation: Start at 100, deduct points for issues
  let billScore = 100;
  billScore -= criticalIssues * 15; // -15 points per critical issue
  billScore -= moderateIssues * 8;  // -8 points per moderate issue
  billScore -= Math.min(savingsPercentage * 0.5, 20); // Up to -20 for high savings %
  billScore = Math.max(0, Math.min(100, Math.round(billScore))); // Clamp 0-100

  const handleDownloadPDF = async () => {
    if (!analysis) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Analysis data not available"
      });
      return;
    }

    setIsGeneratingPDF(true);

    try {
      // Prepare data for PDF generation
      const reportData = {
        job_id: sessionId,
        hospital_name: hospitalName,
        ui_summary: uiSummary,
        full_analysis: fullAnalysis
      };

      await pdfGenerator.generatePDF(
        reportData,
        `hospital-bill-analysis-${sessionId?.substring(0, 8)}.pdf`
      );
      
      toast({
        title: "Success!",
        description: "PDF downloaded successfully"
      });
    } catch (error) {
      console.error('PDF Generation Error:', error);
      toast({
        variant: "destructive",
        title: "Download Failed",
        description: error instanceof Error ? error.message : "Failed to generate PDF"
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Report Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Análise da Sua Conta Médica
              </h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Data da Análise: {analysisDate}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileBarChart className="w-4 h-4" />
                  <span>Sessão: {sessionId?.substring(0, 12)}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <MedicalGlossary />
              <Badge className="bg-success/10 text-success border-success/20 px-4 py-2 text-sm font-semibold">
                <CheckCircle className="w-4 h-4 mr-2" />
                Análise Completa
              </Badge>
            </div>
          </div>
          <Separator className="my-4" />
        </div>

        {/* Bill Score Card */}
        <div className="mb-8">
          <BillScore 
            score={billScore}
            totalCharged={totalCharged}
            estimatedSavings={estimatedSavings}
            criticalIssues={criticalIssues}
            moderateIssues={moderateIssues}
          />
        </div>

        {/* Executive Summary */}
        {emailSent && (
          <Card className="mb-6 p-6 border-l-4 border-l-success shadow-card bg-success/5">
            <div className="flex items-start gap-4 mb-4">
              <div className="p-2 bg-success/10 rounded">
                <CheckCircle className="w-5 h-5 text-success" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground mb-1">Relatório Enviado com Sucesso</h2>
                <p className="text-sm text-muted-foreground">
                  Seu relatório de análise completo em PDF foi enviado para <span className="font-semibold text-success">seu email cadastrado</span>. 
                  Por favor, verifique sua caixa de entrada para o relatório completo com explicações detalhadas dos códigos CPT, detalhamento de preços e recomendações práticas.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Detailed Issues with Confidence Badges */}
        {(analysis.issues || []).length > 0 && (
          <Card className="mb-6 p-6 shadow-card">
            <h2 className="text-xl font-bold text-foreground mb-4">Problemas Identificados</h2>
            <div className="space-y-4">
              {analysis.issues.map((issue: any, index: number) => (
                <div key={index} className="border-l-4 border-l-destructive pl-4 py-3 bg-muted/20 rounded-r">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-sm">
                          {issue.category || "Problema de Cobrança"}
                        </h3>
                        {issue.confidence_score && issue.accuracy_label && (
                          <ConfidenceBadge 
                            score={issue.confidence_score} 
                            label={issue.accuracy_label}
                          />
                        )}
                        {issue.cpt_code && issue.cpt_code !== "N/A" && (
                          <CPTExplainer
                            cptCode={issue.cpt_code}
                            description={issue.description || issue.finding}
                            chargedAmount={parseFloat(issue.impact?.replace(/[^0-9.]/g, '') || '0')}
                            category={issue.category}
                          />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {issue.details || issue.finding}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-destructive">{issue.impact}</p>
                      {issue.cpt_code && issue.cpt_code !== "N/A" && (
                        <p className="text-xs text-muted-foreground">CPT: {issue.cpt_code}</p>
                      )}
                    </div>
                  </div>
                  {issue.suggested_action && (
                    <div className="mt-2 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded p-2">
                      <p className="text-xs text-blue-800 dark:text-blue-200">
                        <span className="font-semibold">Ação Recomendada:</span> {issue.suggested_action}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Before/After Comparison Simulator */}
        {(analysis.issues || []).length > 0 && estimatedSavings > 0 && (
          <div className="mb-6">
            <BeforeAfterComparison
              charges={(analysis.issues || []).map((issue: any, idx: number) => {
                const chargedAmount = parseFloat(issue.impact?.replace(/[^0-9.]/g, '') || '0');
                const isDuplicate = issue.category?.toLowerCase().includes('duplicate');
                const isRemovable = issue.category?.toLowerCase().includes('not rendered') || isDuplicate;
                
                return {
                  line: idx + 1,
                  description: issue.description || issue.finding,
                  original: chargedAmount,
                  corrected: isRemovable ? 0 : chargedAmount * 0.4, // Conservative estimate
                  difference: isRemovable ? chargedAmount : chargedAmount * 0.6,
                  reason: issue.category
                };
              })}
              originalTotal={totalCharged}
              correctedTotal={totalCharged - estimatedSavings}
              totalSavings={estimatedSavings}
            />
          </div>
        )}

        {hospitalName && (
          <Card className="mb-6 p-6 border-l-4 border-l-secondary shadow-card">
            <div className="flex items-start gap-3">
              <Database className="w-5 h-5 text-secondary mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-1">Informações da Instituição</h3>
                <p className="text-sm text-muted-foreground">{hospitalName}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Know Your Rights Section */}
        <div className="mb-6">
          <KnowYourRights />
        </div>

        {/* Included in Report */}
        <Card className="mb-6 p-6 border-secondary/20 shadow-card">
          <h2 className="text-xl font-bold text-foreground mb-4">Seu Relatório Detalhado Inclui</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex gap-3">
              <div className="w-1.5 bg-secondary rounded-full flex-shrink-0" />
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-1">Análise Itemizada Completa</h3>
                <p className="text-sm text-muted-foreground">Detalhamento linha por linha de cada cobrança com justificativa</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-1.5 bg-secondary rounded-full flex-shrink-0" />
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-1">Comparação com Medicare</h3>
                <p className="text-sm text-muted-foreground">Como suas cobranças se comparam às taxas padrão permitidas</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-1.5 bg-secondary rounded-full flex-shrink-0" />
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-1">Itens de Ação Específicos</h3>
                <p className="text-sm text-muted-foreground">Recomendações priorizadas para cada descoberta</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-1.5 bg-secondary rounded-full flex-shrink-0" />
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-1">Modelos de Carta de Contestação</h3>
                <p className="text-sm text-muted-foreground">Formulários pré-preenchidos prontos para envio</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Download Comprehensive Report */}
          <Card className="p-6 text-center border-secondary/20 bg-gradient-to-br from-secondary/5 to-secondary/10 shadow-card">
            <div className="flex justify-center mb-3">
              <div className="p-3 bg-secondary/10 rounded-lg">
                <FileBarChart className="w-7 h-7 text-secondary" />
              </div>
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">
              Baixar Relatório Completo
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Obtenha seu relatório de análise abrangente com explicações detalhadas de códigos CPT, detalhamento de preços e recomendações práticas
            </p>
            <Button 
              size="lg"
              variant="outline"
              className="border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground font-semibold group"
              onClick={handleDownloadPDF}
              disabled={isGeneratingPDF}
            >
              {isGeneratingPDF ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Gerando PDF...
                </>
              ) : (
                <>
                  <FileBarChart className="mr-2 w-5 h-5" />
                  Baixar Relatório Detalhado
                </>
              )}
            </Button>
          </Card>

          {/* Generate Dispute Letter */}
          <Card className="p-6 text-center border-accent/20 bg-gradient-to-br from-accent/5 to-accent/10 shadow-card">
            <div className="flex justify-center mb-3">
              <div className="p-3 bg-accent/10 rounded-lg">
                <FileText className="w-7 h-7 text-accent" />
              </div>
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">
              Gerar Carta de Contestação
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Crie uma carta profissional de contestação baseada nos resultados da sua análise
            </p>
            <Link 
              to="/generate-letter"
              state={{
                issues: (analysis.issues || []).length > 0 
                  ? analysis.issues 
                  : tags.map((tag: string) => ({
                      category: "Billing Issue",
                      finding: tag,
                      severity: "Review Required",
                      impact: `Part of $${estimatedSavings.toLocaleString()} total savings`,
                      cpt_code: "N/A",
                      description: tag,
                      details: "Please review this charge for accuracy and compliance with billing standards."
                    })),
                totalSavings: `$${estimatedSavings.toLocaleString()}`,
                sessionId,
                hospitalName: hospitalName || "Hospital",
                analysisDate: analysisDate
              }}
            >
              <Button 
                size="lg"
                className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold group"
              >
                Gerar Carta de Contestação
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </Card>
        </div>

        {/* Privacy & Security Disclaimer */}
        <div className="mb-6">
          <PrivacyDisclaimer />
        </div>
      </main>
    </div>
  );
};

export default Results;
