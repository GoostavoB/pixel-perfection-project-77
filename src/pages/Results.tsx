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

  // Build charge categories for charge map
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

  // Extract duplicates
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

  // NSA status
  const nsaReview = fullAnalysis.duplicate_findings?.nsa_review || {};
  const nsaApplies = nsaReview.applies === 'yes' ? 'protected' : nsaReview.applies === 'no' ? 'not-protected' : 'unknown';

  // Itemization status
  const hasAllCodes = (a.charges || []).every((c: any) => c.cpt_code && c.cpt_code !== 'N/A');
  const hasSomeCodes = (a.charges || []).some((c: any) => c.cpt_code && c.cpt_code !== 'N/A');
  const itemizationStatus = hasAllCodes ? 'complete' : hasSomeCodes ? 'partial' : 'missing';

  const hi = Array.isArray(a.high_priority_issues) ? a.high_priority_issues : [];
  const pi = Array.isArray(a.potential_issues) ? a.potential_issues : [];

  // Calculate total duplicates amount
  const totalDuplicatesAmount = duplicates.reduce((sum: number, dup: any) => sum + num(dup.amount || 0), 0);
  
  // Calculate estimated savings including duplicates, NSA, and other issues
  const issuesSavings = [...hi, ...pi].reduce((sum: number, issue: any) => sum + num(issue.overcharge_amount || 0), 0);
  const estimatedSavings = issuesSavings + totalDuplicatesAmount;

  // Generate dispute pack
  const disputePack = useMemo(() => generateDisputePack(analysis), [analysis]);

  // What-if calculator items - include reason/category for each issue
  const whatIfItems = [
    // Add duplicate items
    ...duplicates.map((dup: any, idx: number) => ({
      id: `duplicate-${idx}`,
      description: dup.description,
      amount: num(dup.amount || 0),
      estimatedReduction: num(dup.amount || 0) * 0.8, // Higher reduction for duplicates
      reason: 'Potential duplicate charge'
    })),
    // Add other issues
    ...hi.map((issue: any, idx: number) => ({
      id: `hi-${idx}`,
      description: issue.line_description || issue.explanation_for_user || 'Unknown issue',
      amount: num(issue.billed_amount || issue.charge_amount || 0),
      estimatedReduction: num(issue.overcharge_amount || issue.billed_amount || 0) * 0.6,
      reason: issue.category || issue.issue_type || 'Overcharge detected'
    })),
    ...pi.map((issue: any, idx: number) => ({
      id: `pi-${idx}`,
      description: issue.line_description || issue.explanation_for_user || 'Unknown issue',
      amount: num(issue.billed_amount || issue.charge_amount || 0),
      estimatedReduction: num(issue.overcharge_amount || issue.billed_amount || 0) * 0.6,
      reason: issue.category || issue.issue_type || 'Potential overcharge'
    }))
  ].filter(item => item.amount > 0);
  
  // Total number of issues including duplicates
  const totalIssuesCount = hi.length + pi.length + duplicates.length;

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
          <h1 className="text-3xl font-bold mb-2">Your Medical Bill Analysis</h1>
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

          <Card className="p-6">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-3">Data Status</h3>
            <StatusPills itemizationStatus={itemizationStatus} nsaStatus={nsaApplies} duplicatesCount={duplicates.length} />
            <div className="mt-4 space-y-2">
              <p className="text-sm text-foreground">
                {itemizationStatus === 'complete' && '✓ Complete itemization available'}
                {itemizationStatus === 'partial' && '⚠ Partial itemization - request complete codes'}
                {itemizationStatus === 'missing' && '✗ Codes missing - savings unknown until itemized'}
              </p>
              <p className="text-xs text-muted-foreground">
                Hover over each badge above to learn what it means and how it affects your analysis.
              </p>
            </div>
          </Card>
        </div>

        {/* Banner: Data status message */}
        {itemizationStatus === 'missing' && (
          <Card className="p-4 mb-8 bg-yellow-50 border-yellow-200">
            <p className="text-sm text-yellow-900">
              <strong>Data status:</strong> Codes missing. Savings unknown until itemized. 
              {duplicates.length > 0 && ` ${duplicates.length} possible duplicate${duplicates.length > 1 ? 's' : ''} found.`}
              {' '}Several charges are aggregates without CPT codes, so savings cannot be calculated yet. 
              Follow the steps below to request an itemized bill. Then we will compute real savings.
            </p>
          </Card>
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
              <p className="text-sm text-muted-foreground">Potential Savings</p>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="w-4 h-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-sm">Savings estimation includes all potential reductions: duplicate charges, NSA protections, code anomalies, and overcharges. If itemized details are missing, this number may increase once full data is provided.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <p className="text-3xl font-bold text-success">
              {estimatedSavings > 0
                ? `$${estimatedSavings.toLocaleString('en-US', { minimumFractionDigits: 2 })}` 
                : itemizationStatus === 'missing' ? 'Unknown' : '$0.00'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {itemizationStatus === 'missing' ? 'itemization required' : 'estimated'}
            </p>
            {itemizationStatus === 'missing' && (
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
          <DisputePackCard disputePack={disputePack} sessionId={sessionId || ''} />
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
