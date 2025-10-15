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
import { AnalysisQualityBadge } from "@/components/AnalysisQualityBadge";
import { SavingsHighlight } from "@/components/SavingsHighlight";
import { FriendlyIssueCard } from "@/components/FriendlyIssueCard";
import { NextStepsGuide } from "@/components/NextStepsGuide";

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
      return;
    }
    
    // Check if this was a scanned PDF and show helpful message
    if (analysis.extracted_text?.includes('SCANNED PDF')) {
      toast({
        title: "Scanned PDF Detected",
        description: "For better accuracy with scanned documents, consider uploading photos (JPG/PNG) of each page instead.",
        duration: 8000,
      });
    }
  }, [analysis, sessionId, navigate, toast]);

  if (!analysis) return null;

  // Safe number parser
  const num = (x: any): number => {
    if (x == null) return NaN;
    const n = Number(String(x).replace(/[,$\s]/g, ""));
    return Number.isFinite(n) ? n : NaN;
  };

  const analysisDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  // Parse ui_summary - try multiple locations
  let uiSummary = analysis.ui_summary || {};
  if (typeof uiSummary === 'string') {
    try {
      uiSummary = JSON.parse(uiSummary);
    } catch (e) {
      console.error('Failed to parse ui_summary:', e);
      uiSummary = {};
    }
  }
  
  // Parse full analysis from analysis (supports both legacy and new fields)
  const fullAnalysis = (() => {
    try {
      const raw = analysis.full_analysis ?? analysis.analysis_result ?? {};
      if (typeof raw === 'string') return JSON.parse(raw);
      return raw || {};
    } catch {
      return {};
    }
  })();

  // Unified analysis object - check all possible locations
  const a = fullAnalysis ?? analysis.analysis_result ?? analysis ?? {};

  // Safe extraction with hard guards
  const totalChargedRaw = 
    num(a.total_bill_amount);
  const totalCharged = Number.isFinite(totalChargedRaw) && totalChargedRaw > 0
    ? totalChargedRaw
    : (Number.isFinite(num(a.total_charged)) && num(a.total_charged) > 0
      ? num(a.total_charged)
      : (Number.isFinite(num(uiSummary?.total_bill_amount)) && num(uiSummary?.total_bill_amount) > 0
        ? num(uiSummary?.total_bill_amount)
        : NaN));

  const savingsRaw = num(a.total_potential_savings);
  const savings = Number.isFinite(savingsRaw)
    ? savingsRaw
    : (Number.isFinite(num(uiSummary?.estimated_savings_if_corrected))
      ? num(uiSummary?.estimated_savings_if_corrected)
      : NaN);

  const hi = Array.isArray(a.high_priority_issues) ? a.high_priority_issues : [];
  const pi = Array.isArray(a.potential_issues) ? a.potential_issues : [];

  // Guard before render - show error banner if invalid data
  if (!Number.isFinite(totalCharged) || totalCharged <= 0) {
    console.error("Invalid totalCharged payload", { a, uiSummary, analysis, fullAnalysis });
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-16">
          <Card className="max-w-2xl mx-auto p-8 border-destructive">
            <div className="text-center">
              <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Unable to Parse Bill Total
              </h2>
              <p className="text-muted-foreground mb-6">
                We could not parse the bill total. Please reupload or try another file.
              </p>
              <Button onClick={() => navigate('/upload')}>
                Return to Upload
              </Button>
            </div>
          </Card>
        </main>
      </div>
    );
  }

  // Normalize issues list from full_analysis
  const issues = [
    ...hi,
    ...pi,
  ].map((it: any) => ({
    category: it.type || it.category,
    description: it.line_description || it.description,
    finding: it.explanation_for_user || it.finding,
    impact: it.overcharge_amount != null
      ? `$${Number(it.overcharge_amount).toFixed(2)}`
      : (it.billed_amount != null
        ? `$${Number(it.billed_amount).toFixed(2)}`
        : (it.impact || '$0')),
    cpt_code: it.cpt_code || 'N/A',
    suggested_action: it.suggested_action,
    confidence_score: it.confidence_score,
    accuracy_label: it.confidence_score != null
      ? (it.confidence_score >= 0.95 ? 'High Confidence' : it.confidence_score >= 0.8 ? 'Moderate Confidence' : 'Needs Review')
      : undefined,
  }));
  
  // Calculate estimated savings from actual issue amounts
  const calculatedSavings = issues.reduce((sum: number, issue: any) => {
    const amountStr = issue.impact?.replace(/[^0-9.]/g, '') || '0';
    const amount = parseFloat(amountStr);
    return sum + (isNaN(amount) ? 0 : amount);
  }, 0);
  
  // Extract values with fallbacks
  const criticalIssues = uiSummary.high_priority_count ?? hi.length;
  const moderateIssues = uiSummary.potential_issues_count ?? pi.length;
  const estimatedSavings = calculatedSavings > 0 ? calculatedSavings : (Number.isFinite(savings) ? savings : 0);
  
  const hospitalName = a.hospital_name ?? analysis.hospital_name ?? 'Hospital';
  const emailSent = analysis.email_sent || false;

  console.log('Parsed values:', {
    criticalIssues,
    moderateIssues,
    estimatedSavings,
    totalCharged,
    hasIssues: issues.length
  });

  console.log('Parsed values:', {
    criticalIssues,
    moderateIssues,
    estimatedSavings,
    totalCharged,
    hasIssues: (analysis.issues || []).length
  });

  // Calculate Bill Score (0-100)
  const totalIssues = criticalIssues + moderateIssues;
  const savingsPercentage = totalCharged > 0 ? (estimatedSavings / totalCharged) * 100 : 0;
  
  // Score calculation: Start at 100, deduct points for issues
  let billScore = 100;
  billScore -= criticalIssues * 15; // -15 points per critical issue
  billScore -= moderateIssues * 8;  // -8 points per moderate issue
  billScore -= Math.min(savingsPercentage * 0.5, 20); // Up to -20 for high savings %
  billScore = Math.max(0, Math.min(100, Math.round(billScore))); // Clamp 0-100

  console.log('Bill Score calculated:', billScore, 'from', criticalIssues, 'critical +', moderateIssues, 'moderate');

  const handleEmailReport = async () => {
    setIsGeneratingPDF(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          variant: "destructive",
          title: "Authentication Required",
          description: "Please sign in to receive your report via email"
        });
        return;
      }

      if (!analysis?.session_id) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Session ID not found"
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('generate-pdf-report', {
        body: { sessionId: analysis.session_id }
      });

      if (error) {
        throw error;
      }

      if (data?.email_sent) {
        toast({
          title: "Success!",
          description: "Your detailed report has been sent to your email"
        });
      } else {
        toast({
          title: "Report Generated",
          description: "Your report is ready. Check your email shortly."
        });
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send report. Please try again."
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
                Your Medical Bill Analysis
              </h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Analysis Date: {analysisDate}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileBarChart className="w-4 h-4" />
                  <span>Session: {sessionId?.substring(0, 12)}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <MedicalGlossary />
              <Badge className="bg-success/10 text-success border-success/20 px-4 py-2 text-sm font-semibold">
                <CheckCircle className="w-4 h-4 mr-2" />
                Analysis Complete
              </Badge>
            </div>
          </div>
          <Separator className="my-4" />
        </div>

        {/* Analysis Quality Indicator */}
        <AnalysisQualityBadge
          hasDetailedIssues={issues.length > 0}
          hasSavingsCalculation={estimatedSavings > 0}
          hasConfidenceScores={issues.length > 0 && issues[0]?.confidence_score !== undefined}
          issuesCount={issues.length}
        />

        {/* 🔧 FIX 7: UI Safety Net - Warning if savings exceed bill */}
        {calculatedSavings > totalCharged && totalCharged > 0 && (
          <div className="bg-destructive/10 border-2 border-destructive/50 p-6 rounded-lg mb-8">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-destructive/20 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-destructive mb-2">Data Validation Issue Detected</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  The calculated potential savings (${calculatedSavings.toLocaleString()}) exceed the total bill amount (${
                    Number(totalCharged || 0).toLocaleString()
                  }). 
                  This indicates a calculation anomaly that needs to be recalculated.
                </p>
                <Button
                  onClick={() => {
                    navigate('/upload', { state: { fresh: true } });
                  }}
                  variant="destructive"
                  size="sm"
                >
                  Re-run Analysis (Fresh)
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Friendly Savings Highlight - NEW */}
        {estimatedSavings > 0 && (
          <div className="mb-8">
            <SavingsHighlight 
              totalSavings={estimatedSavings}
              issuesFound={issues.length}
            />
          </div>
        )}

        {/* Bill Score Card - ALWAYS SHOW */}
        <div className="mb-8">
          <BillScore 
            score={billScore}
            totalCharged={totalCharged}
            estimatedSavings={estimatedSavings}
            criticalIssues={criticalIssues}
            moderateIssues={moderateIssues}
          />
        </div>

        {/* Friendly Summary from AI */}
        {fullAnalysis.summary_for_user && (
          <Card className="mb-8 p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
            <h3 className="text-xl font-bold text-purple-900 mb-3">
              📋 Here's What We Found
            </h3>
            <p className="text-purple-800 text-lg leading-relaxed">
              {fullAnalysis.summary_for_user}
            </p>
          </Card>
        )}

        {/* Executive Summary */}
        {emailSent && (
          <Card className="mb-6 p-6 border-l-4 border-l-success shadow-card bg-success/5">
            <div className="flex items-start gap-4 mb-4">
              <div className="p-2 bg-success/10 rounded">
                <CheckCircle className="w-5 h-5 text-success" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground mb-1">Report Sent Successfully</h2>
                <p className="text-sm text-muted-foreground">
                  Your full PDF analysis report has been sent to your <span className="font-semibold text-success">registered email</span>.
                  Please check your inbox for the detailed report with CPT explanations, price breakdowns, and practical recommendations.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Detailed Issues - Friendly Cards */}
        {issues.length > 0 ? (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-red-600" />
              Let's Break Down These Charges
            </h2>
            
            {/* High Priority Issues */}
            {fullAnalysis.high_priority_issues && fullAnalysis.high_priority_issues.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-red-700 mb-4 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Major Overcharges (These Need Your Attention)
                </h3>
                <div className="space-y-4">
                  {fullAnalysis.high_priority_issues.map((issue: any, idx: number) => (
                    <FriendlyIssueCard key={`high-${idx}`} issue={issue} isPriority={true} />
                  ))}
                </div>
              </div>
            )}

            {/* Potential Issues */}
            {fullAnalysis.potential_issues && fullAnalysis.potential_issues.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-yellow-700 mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Worth Double-Checking (Lower Priority)
                </h3>
                <div className="space-y-4">
                  {fullAnalysis.potential_issues.map((issue: any, idx: number) => (
                    <FriendlyIssueCard key={`pot-${idx}`} issue={issue} isPriority={false} />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <Card className="mb-6 p-6 shadow-card bg-green-50 dark:bg-green-950/20">
            <div className="text-center py-4">
              <p className="text-lg font-semibold text-green-700 dark:text-green-300 mb-2">
                ✅ No critical issues detected!
              </p>
              <p className="text-sm text-muted-foreground">
                Your bill appears accurate, but we still recommend reviewing it with a professional.
              </p>
            </div>
          </Card>
        )}

        {/* Action Plan */}
        {issues.length > 0 && (
          <div className="mb-8">
            <NextStepsGuide 
              nextSteps={fullAnalysis.next_steps}
              hospitalName={hospitalName}
            />
          </div>
        )}

        {/* Original Detailed Issues List (fallback) */}
        {issues.length > 0 && (!fullAnalysis.high_priority_issues && !fullAnalysis.potential_issues) && (
          <Card className="mb-6 p-6 shadow-card">
            <h2 className="text-xl font-bold text-foreground mb-4">Detailed Identified Issues</h2>
            <div className="space-y-4">
              {issues.map((issue: any, index: number) => {
                const chargedAmount = parseFloat(issue.impact?.replace(/[^0-9.]/g, '') || '0');
                
                return (
                  <div key={index} className="border-l-4 border-l-destructive pl-4 py-3 bg-muted/20 rounded-r">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="font-semibold text-sm">
                            {issue.category || "Problema de Cobrança"}
                          </h3>
                          {issue.confidence_score && issue.accuracy_label && (
                            <ConfidenceBadge 
                              score={issue.confidence_score} 
                              label={issue.accuracy_label}
                            />
                          )}
                          {issue.cpt_code && issue.cpt_code !== "N/A" && chargedAmount > 0 && (
                            <CPTExplainer
                              cptCode={issue.cpt_code}
                              description={issue.description || issue.finding}
                              chargedAmount={chargedAmount}
                              category={issue.category}
                            />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {issue.details || issue.finding}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-destructive">{issue.impact || '$0'}</p>
                        {issue.cpt_code && issue.cpt_code !== "N/A" && (
                          <p className="text-xs text-muted-foreground">CPT: {issue.cpt_code}</p>
                        )}
                      </div>
                    </div>
                    {issue.suggested_action && (
                      <div className="mt-2 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded p-2">
                        <p className="text-xs text-blue-800 dark:text-blue-200">
                          <span className="font-semibold">Recommended Action:</span> {issue.suggested_action}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {/* Before/After Comparison Simulator - SHOW IF SAVINGS > 0 */}
        {estimatedSavings > 0 && issues.length > 0 && (
          <div className="mb-6">
            <BeforeAfterComparison
              charges={issues.map((issue: any, idx: number) => {
                const chargedAmountStr = issue.impact?.replace(/[^0-9.]/g, '') || '0';
                const chargedAmount = parseFloat(chargedAmountStr);
                const isDuplicate = issue.category?.toLowerCase().includes('duplicate');
                const isNotRendered = issue.category?.toLowerCase().includes('not rendered');
                const isRemovable = isDuplicate || isNotRendered;
                
                // Conservative correction estimate
                const correctedAmount = isRemovable ? 0 : chargedAmount * 0.4;
                const difference = chargedAmount - correctedAmount;
                
                return {
                  line: idx + 1,
                  description: issue.description || issue.finding || issue.category,
                  original: chargedAmount,
                  corrected: correctedAmount,
                  difference: difference,
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
                <h3 className="text-sm font-semibold text-foreground mb-1">Facility Information</h3>
                <p className="text-sm text-muted-foreground">{hospitalName}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Know Your Rights Section - ALWAYS SHOW */}
        <div className="mb-6">
          <KnowYourRights />
        </div>

        {/* Privacy & Security Disclaimer - ALWAYS SHOW */}
        <div className="mb-6">
          <PrivacyDisclaimer />
        </div>

        {/* Included in Report */}
        <Card className="mb-6 p-6 border-secondary/20 shadow-card">
          <h2 className="text-xl font-bold text-foreground mb-4">Your Detailed Report Includes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex gap-3">
              <div className="w-1.5 bg-secondary rounded-full flex-shrink-0" />
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-1">Complete Itemized Analysis</h3>
                <p className="text-sm text-muted-foreground">Line-by-line breakdown of each charge with justification</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-1.5 bg-secondary rounded-full flex-shrink-0" />
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-1">Medicare Comparison</h3>
                <p className="text-sm text-muted-foreground">How your charges compare to standard allowed rates</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-1.5 bg-secondary rounded-full flex-shrink-0" />
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-1">Actionable Items</h3>
                <p className="text-sm text-muted-foreground">Prioritized recommendations for each finding</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-1.5 bg-secondary rounded-full flex-shrink-0" />
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-1">Dispute Letter Templates</h3>
                <p className="text-sm text-muted-foreground">Pre-filled forms ready to send</p>
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
              Get your comprehensive analysis report with detailed CPT explanations, pricing breakdowns, and practical recommendations
            </p>
            <Button 
              size="lg"
              variant="outline"
              className="border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground font-semibold group"
              onClick={handleEmailReport}
              disabled={isGeneratingPDF}
            >
              {isGeneratingPDF ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending Report...
                </>
              ) : (
                <>
                  <Mail className="mr-2 w-5 h-5" />
                  Email Detailed Report
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
              Create a professional dispute letter based on your analysis results
            </p>
            <Link 
              to="/generate-letter"
              state={{
                issues: (analysis.issues || []).length > 0 
                  ? analysis.issues 
                  : [{
                      category: "Billing Issue",
                      finding: "Review needed",
                      severity: "Review Required",
                      impact: `Part of $${estimatedSavings.toLocaleString()} total savings`,
                      cpt_code: "N/A",
                      description: "Billing review recommended",
                      details: "Please review this charge for accuracy and compliance with billing standards."
                    }],
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
                Generate Dispute Letter
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
