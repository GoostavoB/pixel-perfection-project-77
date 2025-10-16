import { CheckCircle, AlertCircle, AlertTriangle, Database, FileText, ArrowRight, Calendar, FileBarChart, TrendingDown, DollarSign, Loader2, RefreshCw } from "lucide-react";
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
import { PricingInsightsCard } from '@/components/PricingInsightsCard';

const NewResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { analysis, sessionId } = (location.state as { analysis?: any; sessionId?: string }) || {};
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isReanalyzing, setIsReanalyzing] = useState(false);
  
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

  // Calculate fallback savings estimate based on categories when real savings are $0
  const calculateFallbackSavings = (totalBill: number, tags: string[]): { low: number; high: number } => {
    // Start with conservative 20-30% range
    let savingsPercentLow = 0.20;
    let savingsPercentHigh = 0.30;
    
    // Adjust based on detected categories (uses same logic as savings-engine.ts lines 157-200)
    if (tags.some(t => t.toLowerCase().includes('emergency') || t.toLowerCase().includes('er'))) {
      savingsPercentLow = 0.35; // 65% fair price, 35% potential savings
      savingsPercentHigh = 0.40;
    } else if (tags.some(t => t.toLowerCase().includes('surgery') || t.toLowerCase().includes('operating'))) {
      savingsPercentLow = 0.30; // 70% fair price, 30% savings
      savingsPercentHigh = 0.35;
    } else if (tags.some(t => t.toLowerCase().includes('imaging') || t.toLowerCase().includes('radiology'))) {
      savingsPercentLow = 0.30;
      savingsPercentHigh = 0.35;
    } else if (tags.some(t => t.toLowerCase().includes('lab') || t.toLowerCase().includes('test'))) {
      savingsPercentLow = 0.25;
      savingsPercentHigh = 0.30;
    } else if (tags.some(t => t.toLowerCase().includes('pharmacy') || t.toLowerCase().includes('medication'))) {
      savingsPercentLow = 0.25;
      savingsPercentHigh = 0.30;
    } else if (tags.some(t => t.toLowerCase().includes('room') || t.toLowerCase().includes('bed'))) {
      savingsPercentLow = 0.20;
      savingsPercentHigh = 0.25;
    }
    
    return {
      low: Math.round(totalBill * savingsPercentLow),
      high: Math.round(totalBill * savingsPercentHigh)
    };
  };

  // Use fallback if savings are $0 but we have a bill amount
  const fallbackSavings = (estimatedSavings === 0 && (uiSummary.total_billed || 0) > 0) 
    ? calculateFallbackSavings(uiSummary.total_billed || 0, tags)
    : null;

  // ⚡ PHASE 2B: Calculate pricing insights from analysis
  const calculatePricingInsights = () => {
    const allIssues = [
      ...(fullAnalysis.high_priority_issues || []),
      ...(fullAnalysis.potential_issues || [])
    ];
    
    const codesWithFairPrices = allIssues.filter((issue: any) => 
      issue.fair_price && issue.fair_price > 0
    );
    
    const highConfidence = codesWithFairPrices.filter((issue: any) => 
      issue.fair_price_confidence === 'high'
    ).length;
    
    const mediumConfidence = codesWithFairPrices.filter((issue: any) => 
      issue.fair_price_confidence === 'medium'
    ).length;
    
    const lowConfidence = codesWithFairPrices.filter((issue: any) => 
      issue.fair_price_confidence === 'low'
    ).length;
    
    const totalOvercharges = codesWithFairPrices.reduce((sum: number, issue: any) => 
      sum + Math.max(0, issue.billed_amount - issue.fair_price), 
      0
    );
    
    const averageMarkup = codesWithFairPrices.length > 0
      ? Math.round(
          codesWithFairPrices.reduce((sum: number, issue: any) => {
            if (issue.medicare_benchmark && issue.medicare_benchmark > 0) {
              return sum + ((issue.billed_amount / issue.medicare_benchmark - 1) * 100);
            }
            return sum;
          }, 0) / codesWithFairPrices.length
        )
      : 0;
    
    return {
      totalCodes: allIssues.length,
      codesWithFairPrices: codesWithFairPrices.length,
      highConfidence,
      mediumConfidence,
      lowConfidence,
      totalFairPriceData: codesWithFairPrices.length,
      totalOvercharges,
      averageMarkup
    };
  };

  const pricingInsights = calculatePricingInsights();

  const handleReanalyze = async () => {
    if (!analysis.file_url) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Original bill file not available"
      });
      return;
    }

    setIsReanalyzing(true);

    try {
      // Fetch the original file
      const fileResponse = await fetch(analysis.file_url);
      const fileBlob = await fileResponse.blob();
      const fileName = analysis.file_name || 'medical-bill.pdf';
      const file = new File([fileBlob], fileName, { type: fileBlob.type });

      // Create form data
      const formData = new FormData();
      formData.append('file', file);

      // Use direct fetch with query parameter to bypass cache (invoke doesn't support FormData properly)
      const { data: { session } } = await supabase.auth.getSession();
      const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-bill-lovable?fresh=true`;
      
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Analysis failed');
      }

      const data = await response.json();

      toast({
        title: "Re-analysis Complete!",
        description: "Bill analyzed with latest estimation logic"
      });

      // Navigate to processing page
      navigate('/processing', { 
        state: { 
          sessionId: data.session_id 
        } 
      });
    } catch (error) {
      console.error('Re-analysis Error:', error);
      toast({
        variant: "destructive",
        title: "Re-analysis Failed",
        description: error instanceof Error ? error.message : "Failed to re-analyze bill"
      });
    } finally {
      setIsReanalyzing(false);
    }
  };

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

        {/* Re-analyze Notice - Show if savings are $0 or analysis is cached */}
        {(tags.includes('cached') || estimatedSavings === 0) && (
          <Card className="mb-6 p-6 border-l-4 border-l-warning shadow-card bg-warning/5">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-warning/10 rounded">
                <AlertTriangle className="w-5 h-5 text-warning" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold text-foreground mb-1">
                  {tags.includes('cached') ? 'Cached Analysis Detected' : 'Enhanced Estimation Available'}
                </h2>
                <p className="text-sm text-muted-foreground mb-3">
                  {tags.includes('cached')
                    ? "You're viewing cached results from a previous analysis. Recent improvements to our estimation engine may provide more accurate savings calculations."
                    : "Your bill shows $0 savings because it lacks CPT codes. Our new estimation engine can now calculate potential savings using category-based benchmarks, even without itemization."
                  }
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReanalyze}
                  disabled={isReanalyzing}
                  className="border-warning text-warning hover:bg-warning hover:text-warning-foreground"
                >
                  {isReanalyzing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Re-analyzing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Re-analyze with Latest Logic
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>
        )}

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
                <span className="text-3xl font-bold text-success">
                  {fallbackSavings 
                    ? `$${fallbackSavings.low.toLocaleString()}-$${fallbackSavings.high.toLocaleString()}`
                    : `$${estimatedSavings.toLocaleString()}`
                  }
                </span>
              </div>
              <h3 className="text-sm font-semibold text-foreground mb-1">Est. Savings</h3>
              <p className="text-xs text-muted-foreground">
                {fallbackSavings ? 'Conservative estimate range' : 'Potential cost reduction'}
              </p>
              {fallbackSavings && (
                <Badge variant="outline" className="mt-2 text-xs">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Pending detailed analysis
                </Badge>
              )}
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

        {/* ⚡ PHASE 2B: Real-Time Pricing Insights */}
        {pricingInsights.codesWithFairPrices > 0 && (
          <div className="mb-6">
            <PricingInsightsCard insights={pricingInsights} />
          </div>
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
