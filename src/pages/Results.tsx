import { AlertCircle, Calendar, Loader2, Mail, ArrowRight, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Header from "@/components/Header";
import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ChargeMapTable } from "@/components/ChargeMapTable";
import { StatusPills } from "@/components/StatusPills";
import { DuplicatesHighlight } from "@/components/DuplicatesHighlight";
import { NSATriage } from "@/components/NSATriage";
import { ActionPlanCard } from "@/components/ActionPlanCard";
import { WhatIfCalculator } from "@/components/WhatIfCalculator";
import { generateDisputePack } from "@/utils/disputePackGenerator";
import { DisputePackCard } from "@/components/DisputePackCard";
import { StickySummary } from "@/components/StickySummary";
import { ComprehensiveSavings } from "@/components/ComprehensiveSavings";
import { ItemizationAlert } from "@/components/ItemizationAlert";
import { MedicalBillingGlossary } from "@/components/MedicalBillingGlossary";

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { analysis: passedAnalysis, sessionId } = (location.state as { analysis?: any; sessionId?: string }) || {};
  
  const [analysis] = useState(passedAnalysis);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [selectedReductions, setSelectedReductions] = useState(0);
  
  useEffect(() => {
    if (!analysis || !sessionId) {
      navigate('/upload');
    }
  }, [analysis, sessionId, navigate]);

  if (!analysis) return null;

  const num = (x: any): number => {
    if (x == null) return NaN;
    const n = Number(String(x).replace(/[,$\s]/g, ""));
    return Number.isFinite(n) ? n : NaN;
  };

  const fullAnalysis = (() => {
    try {
      const raw = analysis.full_analysis ?? analysis.analysis_result ?? {};
      if (typeof raw === 'string') return JSON.parse(raw);
      return raw || {};
    } catch {
      return {};
    }
  })();

  const a = fullAnalysis ?? analysis ?? {};
  const totalCharged = num(a.total_bill_amount);

  if (!Number.isFinite(totalCharged) || totalCharged <= 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-16">
          <Card className="max-w-2xl mx-auto p-8 border-destructive">
            <div className="text-center">
              <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Unable to Parse Bill Total</h2>
              <p className="text-muted-foreground mb-6">Please reupload or try another file.</p>
              <Button onClick={() => navigate('/upload')}>Return to Upload</Button>
            </div>
          </Card>
        </main>
      </div>
    );
  }

  const hospitalName = a.hospital_name ?? 'Provider';
  const analysisDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  // Get issues from backend for calculations
  const hi = Array.isArray(a.high_priority_issues) ? a.high_priority_issues : [];
  const pi = Array.isArray(a.potential_issues) ? a.potential_issues : [];
  const recommendations = Array.isArray(a.recommendations) ? a.recommendations : [];
  const lineItems = Array.isArray(a.line_items) ? a.line_items : [];
  
  // ✅ UNIFIED LOGIC: Calculate from ALL sources
  const itemizationStatus = a.itemization_status || 'unknown';
  
  // Map recommendations to issue-like items and unify itemsWithIssues
  const itemsFromRecommendations = recommendations?.map((rec: any) => ({
    description: rec.description || rec.type,
    billed_amount: rec.total,
    issue_type: 'issue',
    savings: rec.total
  })) || [];

  const itemsWithIssues = lineItems.length > 0
    ? lineItems.filter((item: any) => item.issue_type && item.issue_type !== 'normal')
    : itemsFromRecommendations;
  
  // Count issues from all possible sources
  const issuesFromHighPriority = hi.length;
  const issuesFromPotential = pi.length;
  const issuesFromRecommendations = recommendations.length;
  const issuesFromLineItems = itemsWithIssues.length;
  const totalIssuesCount = Math.max(
    a.total_issues_count || 0,
    issuesFromHighPriority + issuesFromPotential,
    issuesFromRecommendations,
    issuesFromLineItems
  );
  
  // Calculate savings from all possible sources
  const savingsFromIssues = [...hi, ...pi].reduce((sum: number, issue: any) => sum + num(issue.overcharge_amount || 0), 0);
  const savingsFromRecommendations = recommendations.reduce((sum: number, rec: any) => sum + num(rec.total || 0), 0);
  const estimatedSavings = Math.max(
    a.savings_total || 0,
    a.estimated_total_savings || 0,
    savingsFromIssues,
    savingsFromRecommendations
  );
  const whatIfItems = a.what_if_calculator_items || [];
  
  // Calculate fallback savings estimate based on categories when real savings are $0
  const calculateFallbackSavings = (totalBill: number, tags: string[]): { low: number; high: number } => {
    let savingsPercentLow = 0.20;
    let savingsPercentHigh = 0.30;
    
    if (tags.some(t => t.toLowerCase().includes('emergency') || t.toLowerCase().includes('er'))) {
      savingsPercentLow = 0.35;
      savingsPercentHigh = 0.40;
    } else if (tags.some(t => t.toLowerCase().includes('surgery') || t.toLowerCase().includes('operating'))) {
      savingsPercentLow = 0.30;
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

  const tags = a.tags || [];
  const fallbackSavings = (estimatedSavings === 0 && totalCharged > 0) 
    ? calculateFallbackSavings(totalCharged, tags)
    : null;
  
  // ✅ NEW: Comprehensive savings from savings engine
  const savingsTotals = a._savings_details || null;

  // Debug: savings reconciliation
  useEffect(() => {
    if (analysis) {
      const recTotal = recommendations?.reduce((s: number, r: any) => s + (num(r.total || 0)), 0) || 0;
      console.log('🔴 CORREÇÃO SAVINGS:', {
        original_savings_total: a.savings_total,
        recommendations_total: recTotal,
        should_display: Math.max(a.savings_total || 0, recTotal),
        recommendations_count: recommendations?.length,
        raw_analysis: a
      });
    }
  }, [analysis, recommendations]);
  
  // Build charge categories for charge map (from backend data)
  const chargeCategories = (a.charges || []).map((charge: any) => ({
    category: charge.description || 'Unknown',
    amount: num(charge.charge_amount || 0),
    shareOfTotal: (num(charge.charge_amount || 0) / totalCharged) * 100,
    riskTags: [
      ...(charge.cpt_code === 'N/A' || !charge.cpt_code ? ['Missing code'] : []),
      ...(charge.overcharge_amount > 0 ? ['High price'] : []),
      ...(charge.description?.toLowerCase().includes('general') || charge.description?.toLowerCase().includes('aggregate') ? ['Aggregate'] : []),
    ]
  })).filter((c: any) => c.amount > 0);

  // Extract duplicates from backend analysis
  const duplicateFindings = fullAnalysis.duplicate_findings?.flags || [];
  const duplicates = duplicateFindings
    .filter((flag: any) => flag.category === 'P1' || flag.category === 'P2')
    .map((flag: any) => ({
      description: flag.reason || 'Duplicate charge',
      amount: flag.evidence?.prices?.reduce((sum: number, p: number) => sum + p, 0) || 0,
      confidence: flag.confidence || 'medium',
      details: flag.evidence?.codes?.map((c: any) => c.value).join(', ') || 'Missing codes',
      disputeText: flag.dispute_text || 'Please provide details.'
    }));

  // NSA status from backend
  const nsaReview = fullAnalysis.duplicate_findings?.nsa_review || {};
  const nsaApplies = nsaReview.applies === 'yes' ? 'protected' : nsaReview.applies === 'no' ? 'not-protected' : 'unknown';
  
  // Generate dispute pack
  const disputePack = useMemo(() => generateDisputePack(analysis), [analysis]);

  const handleEmailReport = async () => {
    setIsGeneratingPDF(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({ variant: "destructive", title: "Authentication Required" });
        return;
      }
      await supabase.functions.invoke('generate-pdf-report', { body: { sessionId: analysis.session_id } });
      toast({ title: "Success!", description: "Report sent to your email" });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to send report" });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const callScript = `Hi, I'm requesting an itemized bill for account ${a.account_number || '[ID]'}, dates ${a.date_of_service || '[range]'}. Please include CPT or HCPCS for each service, modifiers, units, revenue codes, provider NPI or tax ID, and for medications the NDC, dose, and quantity. For blood services, include product codes, units transfused, and the medication administration record with times.`;

  const handleSelectionsChange = (totalReduction: number) => {
    setSelectedReductions(totalReduction);
  };

  const estimatedNewTotal = totalCharged - selectedReductions;
  const savingsPercentage = totalCharged > 0 ? (selectedReductions / totalCharged) * 100 : 0;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Sticky Summary */}
      <StickySummary 
        currentTotal={totalCharged}
        selectedReductions={selectedReductions}
        estimatedNewTotal={estimatedNewTotal}
        savingsPercentage={savingsPercentage}
      />
      
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold">Your Medical Bill Analysis</h1>
            <MedicalBillingGlossary />
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>{analysisDate}</span>
          </div>
          <Separator className="my-4" />
        </div>

        {/* Top Section: Provider info and Status */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-2 p-6">
            <div className="flex justify-between items-start gap-4">
              <div>
                <p className="text-sm font-semibold text-muted-foreground uppercase mb-2">Provider</p>
                <h2 className="text-2xl font-bold">{hospitalName}</h2>
                {a.date_of_service && (
                  <p className="text-sm text-muted-foreground mt-2">
                    <span className="font-semibold">Service Date:</span> {a.date_of_service}
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-muted-foreground uppercase mb-2">Total Bill Amount</p>
                <div className="text-3xl font-bold text-destructive">${totalCharged.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
              </div>
            </div>
          </Card>

        </div>

        {/* Critical Alert: Missing Itemization - MOST PROMINENT CTA */}
        {itemizationStatus === 'missing' && (
          <div className="mb-8">
            <Card className="p-8 bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-400 shadow-lg">
              <div className="text-center mb-6">
                <AlertCircle className="w-16 h-16 text-yellow-600 mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-yellow-900 mb-3">🚨 #1 Priority Action Required</h2>
                <p className="text-lg text-yellow-800 mb-4">
                  <strong>Your bill is not itemized.</strong> This significantly limits the accuracy of our analysis.
                </p>
                <div className="p-4 bg-yellow-100 border border-yellow-300 rounded-lg mb-6">
                  <p className="text-sm text-yellow-900">
                    <strong>⚠️ Important:</strong> Bills/reports of non-itemized bills are <strong>less likely to be accurate</strong>. 
                    Our estimates are conservative and based on typical patterns. For precise calculations, you MUST request an itemized bill.
                  </p>
                </div>
              </div>
              <ItemizationAlert 
                totalBill={totalCharged}
                callScript={callScript}
              />
            </Card>
          </div>
        )}

        {/* Decision Summary - 3 metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="p-6 text-center">
            <p className="text-xs text-muted-foreground mb-3">We found</p>
            <p className={`text-5xl font-bold mb-3 ${
              totalIssuesCount === 0 ? 'text-success' : 
              totalIssuesCount <= 3 ? 'text-warning' : 
              'text-destructive'
            }`}>
              {totalIssuesCount}
            </p>
            <p className="text-sm text-foreground font-medium">
              line{totalIssuesCount !== 1 ? 's' : ''} with potential issues
            </p>
          </Card>
          <Card className="p-6 text-center relative">
            <div className="flex items-center justify-center gap-2 mb-1">
              <p className="text-sm text-muted-foreground">
                {fallbackSavings ? 'Conservative Estimated Savings' : 'Potential Savings'}
              </p>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="w-4 h-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-sm">
                      {fallbackSavings 
                        ? "Based on typical overcharge patterns for your bill's categories. Request an itemized bill for precise calculations."
                        : "Savings estimation includes all potential reductions: duplicate charges, NSA protections, code anomalies, and overcharges. If itemized details are missing, this number may increase once full data is provided."
                      }
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            
            {fallbackSavings ? (
              <>
                <p className="text-3xl font-bold text-success">
                  ${fallbackSavings.low.toLocaleString()} - ${fallbackSavings.high.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground mt-1">conservative range</p>
              </>
            ) : (
              <>
                <p className="text-3xl font-bold text-success">
                  {estimatedSavings > 0
                    ? `$${estimatedSavings.toLocaleString('en-US', { minimumFractionDigits: 2 })}` 
                    : itemizationStatus === 'missing' ? 'Unknown' : '$0.00'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {itemizationStatus === 'missing' ? 'itemization required' : 'estimated'}
                </p>
              </>
            )}
            
            {itemizationStatus === 'missing' && !fallbackSavings && (
              <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-900 text-left">
                <strong>Note:</strong> Request an itemized bill from the hospital to calculate accurate savings.
              </div>
            )}
          </Card>
          <Card className="p-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <p className="text-sm text-muted-foreground">Confidence</p>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="w-4 h-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-sm">"Mixed" means we have varying confidence levels across different findings - some are highly confident (clear overcharges), while others need more information. Check individual badges for details.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <p className="text-3xl font-bold text-foreground">Mixed</p>
            <p className="text-xs text-muted-foreground mt-1">see badges below for details</p>
          </Card>
        </div>

        {/* Comprehensive Savings Display */}
        {savingsTotals && (
          <div className="mb-8">
            <ComprehensiveSavings 
              savings={savingsTotals} 
              computedIssuesCount={Math.max(
                savingsTotals.lines_with_issues || 0,
                totalIssuesCount || 0,
                pi.length || 0,
                recommendations.length || 0
              )}
              totalBilled={totalCharged}
              tags={tags}
            />
          </div>
        )}

        {/* Charge Map */}
        {chargeCategories.length > 0 && (
          <div className="mb-8">
            <ChargeMapTable charges={chargeCategories} totalBill={totalCharged} />
          </div>
        )}

        {/* Possible Duplicates - Above the fold */}
        {duplicates.length > 0 && (
          <div className="mb-8">
            <DuplicatesHighlight duplicates={duplicates} />
          </div>
        )}

        {/* NSA Triage - Early and simple */}
        <div className="mb-8">
          <NSATriage 
            applies={nsaApplies}
            scenarios={nsaReview.scenarios || []}
            missingData={nsaReview.missing_for_nsa || []}
            prelimAssessment={nsaReview.prelim_assessment || 'Unable to determine NSA protection without additional information.'}
          />
        </div>

        {/* Dispute Pack */}
        <div className="mb-8">
          <DisputePackCard 
            disputePack={disputePack} 
            sessionId={sessionId || ''}
            fallbackSavings={fallbackSavings}
            itemizationStatus={itemizationStatus}
          />
        </div>

        {/* Action Plan - Strong, specific */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Action Plan</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ActionPlanCard
              title="Call billing"
              description="Request a complete itemized bill with all codes and details"
              script={callScript}
              icon="phone"
              accountId={a.account_number}
              dateRange={a.date_of_service}
            />
            <ActionPlanCard
              title="Request itemized bill"
              description="Send a formal written request for detailed billing information"
              script={`Dear Billing Department,\n\nI am formally requesting a complete itemized bill for account ${a.account_number || '[ID]'}, service dates ${a.date_of_service || '[range]'}. Please provide CPT/HCPCS codes, modifiers, units, revenue codes, provider NPIs, and medication NDCs with quantities.\n\nThank you.`}
              icon="mail"
              accountId={a.account_number}
              dateRange={a.date_of_service}
            />
          </div>
        </div>

        {/* What-If Calculator */}
        {whatIfItems.length > 0 && (
          <div className="mb-8">
            <WhatIfCalculator 
              items={whatIfItems}
              currentTotal={totalCharged}
              hasEOB={!!a.has_eob}
              onSelectionsChange={handleSelectionsChange}
              fallbackSavings={fallbackSavings}
            />
          </div>
        )}

        {/* Export buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="p-6 text-center">
            <h3 className="text-lg font-bold mb-2">Download Full Report</h3>
            <p className="text-sm text-muted-foreground mb-4">Get your comprehensive analysis with all details</p>
            <Button size="lg" onClick={handleEmailReport} disabled={isGeneratingPDF} className="w-full">
              {isGeneratingPDF ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Sending...</> : <><Mail className="mr-2 w-5 h-5" />Email Report</>}
            </Button>
          </Card>
          <Card className="p-6 text-center">
            <h3 className="text-lg font-bold mb-2">Generate Dispute Letter</h3>
            <p className="text-sm text-muted-foreground mb-4">Create a professional dispute letter</p>
            <Link to="/generate-letter" state={{ issues: [...hi, ...pi], totalSavings: `$${estimatedSavings.toLocaleString()}`, sessionId, hospitalName, analysisDate }}>
              <Button size="lg" className="w-full">Generate Letter<ArrowRight className="ml-2 w-5 h-5" /></Button>
            </Link>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Results;
