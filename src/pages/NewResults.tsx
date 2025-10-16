import { CheckCircle, AlertCircle, AlertTriangle, Database, FileText, ArrowRight, Calendar, FileBarChart, TrendingDown, DollarSign, Loader2 } from "lucide-react";
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

const NewResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { analysis, sessionId } = (location.state as { analysis?: any; sessionId?: string }) || {};
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

  // Parse ui_summary if it comes as string
  const uiSummary = typeof analysis.ui_summary === 'string' 
    ? JSON.parse(analysis.ui_summary) 
    : analysis.ui_summary || {};
  
  const rawFull = analysis.full_analysis ?? analysis.analysis_result ?? {};
  const fullAnalysis = typeof rawFull === 'string'
    ? JSON.parse(rawFull)
    : rawFull || {};

  const criticalIssues = uiSummary.high_priority_count || fullAnalysis.high_priority_issues?.length || 0;
  const moderateIssues = uiSummary.potential_issues_count || fullAnalysis.potential_issues?.length || 0;
  
  // ✅ UNIFIED: Calculate savings from all sources including recommendations
  const savingsFromRecommendations = fullAnalysis.recommendations?.reduce((sum: number, rec: any) => sum + (rec.total || 0), 0) || 0;
  const estimatedSavings = Math.max(
    uiSummary.estimated_savings_if_corrected || 0,
    fullAnalysis.estimated_savings || 0,
    fullAnalysis.savings_total || 0,
    savingsFromRecommendations
  );
  const hospitalName = analysis.hospital_name || '';
  const dataSources = uiSummary.data_sources_used || fullAnalysis.data_sources || [];
  const tags = uiSummary.tags || fullAnalysis.tags || [];
  const emailSent = analysis.email_sent || false;

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
                Medical Bill Analysis Report
              </h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Analysis Date: {analysisDate}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileBarChart className="w-4 h-4" />
                  <span>Session ID: {sessionId?.substring(0, 8)}</span>
                </div>
              </div>
            </div>
            <Badge className="bg-success/10 text-success border-success/20 px-4 py-2 text-sm font-semibold">
              <CheckCircle className="w-4 h-4 mr-2" />
              Analysis Complete
            </Badge>
          </div>
          <Separator className="my-4" />
        </div>

        {/* Email Sent Confirmation */}
        {emailSent && (
          <Card className="mb-6 p-6 border-l-4 border-l-success shadow-card bg-success/5">
            <div className="flex items-start gap-4 mb-4">
              <div className="p-2 bg-success/10 rounded">
                <CheckCircle className="w-5 h-5 text-success" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground mb-1">Report Delivered Successfully</h2>
                <p className="text-sm text-muted-foreground">
                  Your comprehensive PDF analysis report has been sent to <span className="font-semibold text-success">your registered email address</span>. 
                  Please check your inbox for the complete report with detailed CPT code explanations, pricing breakdowns, and actionable recommendations.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Key Metrics Grid */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-foreground mb-4">Summary of Findings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* High Priority Issues */}
            <Card className="p-5 border-l-4 border-l-destructive hover:shadow-card-hover transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-destructive/10 rounded">
                  <AlertCircle className="w-5 h-5 text-destructive" />
                </div>
                <span className="text-3xl font-bold text-destructive">{criticalIssues}</span>
              </div>
              <h3 className="text-sm font-semibold text-foreground mb-1">Critical Issues</h3>
              <p className="text-xs text-muted-foreground">Require immediate attention</p>
            </Card>

            {/* Potential Issues */}
            <Card className="p-5 border-l-4 border-l-warning hover:shadow-card-hover transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-warning/10 rounded">
                  <AlertTriangle className="w-5 h-5 text-warning" />
                </div>
                <span className="text-3xl font-bold text-warning">{moderateIssues}</span>
              </div>
              <h3 className="text-sm font-semibold text-foreground mb-1">Moderate Concerns</h3>
              <p className="text-xs text-muted-foreground">For further review</p>
            </Card>

            {/* Savings Potential */}
            <Card className="p-5 border-l-4 border-l-success hover:shadow-card-hover transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-success/10 rounded">
                  <TrendingDown className="w-5 h-5 text-success" />
                </div>
                <span className="text-3xl font-bold text-success">${estimatedSavings.toLocaleString()}</span>
              </div>
              <h3 className="text-sm font-semibold text-foreground mb-1">Est. Savings</h3>
              <p className="text-xs text-muted-foreground">Potential cost reduction</p>
            </Card>

            {/* Data Sources */}
            <Card className="p-5 border-l-4 border-l-secondary hover:shadow-card-hover transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-secondary/10 rounded">
                  <Database className="w-5 h-5 text-secondary" />
                </div>
                <span className="text-3xl font-bold text-secondary">{dataSources.length}</span>
              </div>
              <h3 className="text-sm font-semibold text-foreground mb-1">Data Sources</h3>
              <p className="text-xs text-muted-foreground">{dataSources.join(', ') || 'Referenced databases'}</p>
            </Card>
          </div>
        </div>

        {/* Tags/Issues Summary */}
        {tags.length > 0 && (
          <Card className="mb-6 p-6 shadow-card">
            <h2 className="text-xl font-bold text-foreground mb-4">Identified Issues</h2>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag: string, index: number) => (
                <Badge key={index} variant="outline" className="text-sm px-3 py-1">
                  {tag}
                </Badge>
              ))}
            </div>
          </Card>
        )}

        {hospitalName && (
          <Card className="mb-6 p-6 border-l-4 border-l-secondary shadow-card">
            <div className="flex items-start gap-3">
              <Database className="w-5 h-5 text-secondary mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-1">Facility Information</h3>
                <p className="text-sm text-muted-foreground">{hospitalName}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Included in Report */}
        <Card className="mb-6 p-6 border-secondary/20 shadow-card">
          <h2 className="text-xl font-bold text-foreground mb-4">Your Detailed Report Includes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex gap-3">
              <div className="w-1.5 bg-secondary rounded-full flex-shrink-0" />
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-1">Complete Itemized Analysis</h3>
                <p className="text-sm text-muted-foreground">Line-by-line breakdown of every charge with justification</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-1.5 bg-secondary rounded-full flex-shrink-0" />
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-1">Medicare Benchmark Comparison</h3>
                <p className="text-sm text-muted-foreground">How your charges compare to standard allowable rates</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-1.5 bg-secondary rounded-full flex-shrink-0" />
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-1">Specific Action Items</h3>
                <p className="text-sm text-muted-foreground">Prioritized recommendations for each finding</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-1.5 bg-secondary rounded-full flex-shrink-0" />
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-1">Dispute Letter Templates</h3>
                <p className="text-sm text-muted-foreground">Pre-filled forms ready for submission</p>
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
              Download Full Report
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Get your complete comprehensive analysis report with detailed CPT code explanations, pricing breakdowns, and actionable recommendations
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
                  Generating PDF...
                </>
              ) : (
                <>
                  <FileBarChart className="mr-2 w-5 h-5" />
                  Download Detailed Report
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
              Generate Dispute Letter
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create a professional dispute letter based on your analysis findings
            </p>
            <Link 
              to="/generate-letter"
              state={{
                issues: tags.map((tag: string) => ({
                  category: "Billing Issue",
                  finding: tag,
                  severity: "Review Required",
                  impact: `Part of $${estimatedSavings.toLocaleString()} total savings`
                })),
                totalSavings: `$${estimatedSavings.toLocaleString()}`,
                sessionId
              }}
            >
              <Button 
                size="lg"
                className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold group"
              >
                Generate Letter
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default NewResults;
