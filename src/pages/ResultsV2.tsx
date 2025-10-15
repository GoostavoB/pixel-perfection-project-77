import { AlertCircle, Calendar, FileBarChart, Loader2, Mail, ArrowRight } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Header from "@/components/Header";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ChargeMapTable } from "@/components/ChargeMapTable";
import { StatusPills } from "@/components/StatusPills";
import { DuplicatesHighlight } from "@/components/DuplicatesHighlight";
import { NSATriage } from "@/components/NSATriage";
import { ActionPlanCard } from "@/components/ActionPlanCard";
import { WhatIfCalculator } from "@/components/WhatIfCalculator";
import { FriendlyIssueCard } from "@/components/FriendlyIssueCard";

const ResultsV2 = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { analysis: passedAnalysis, sessionId } = (location.state as { analysis?: any; sessionId?: string }) || {};
  
  const [analysis] = useState(passedAnalysis);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  
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

  const chargeCategories = (a.charges || []).map((charge: any) => ({
    category: charge.description || 'Unknown',
    amount: num(charge.charge_amount || 0),
    shareOfTotal: (num(charge.charge_amount || 0) / totalCharged) * 100,
    riskTags: [
      ...(charge.cpt_code === 'N/A' ? ['Missing code'] : []),
      ...(charge.overcharge_amount > 0 ? ['High price'] : []),
    ]
  })).filter((c: any) => c.amount > 0);

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

  const nsaReview = fullAnalysis.duplicate_findings?.nsa_review || {};
  const nsaApplies = nsaReview.applies === 'yes' ? 'yes' : nsaReview.applies === 'no' ? 'no' : 'unknown';

  const hasAllCodes = (a.charges || []).every((c: any) => c.cpt_code && c.cpt_code !== 'N/A');
  const hasSomeCodes = (a.charges || []).some((c: any) => c.cpt_code && c.cpt_code !== 'N/A');
  const itemizationStatus = hasAllCodes ? 'complete' : hasSomeCodes ? 'partial' : 'missing';

  const hi = Array.isArray(a.high_priority_issues) ? a.high_priority_issues : [];
  const pi = Array.isArray(a.potential_issues) ? a.potential_issues : [];

  const estimatedSavings = [...hi, ...pi].reduce((sum: number, issue: any) => sum + num(issue.overcharge_amount || 0), 0);

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

  const callScript = `Hi, I'm requesting an itemized bill for account ${a.account_number || '[ID]'}, dates ${a.date_of_service || '[range]'}. Please include CPT or HCPCS for each service, modifiers, units, revenue codes, provider NPI or tax ID, and for medications the NDC, dose, and quantity.`;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Your Medical Bill Analysis</h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>{analysisDate}</span>
          </div>
          <Separator className="my-4" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-2 p-6">
            <div className="flex justify-between items-start gap-4">
              <div>
                <p className="text-sm font-semibold text-muted-foreground uppercase mb-2">Provider</p>
                <h2 className="text-2xl font-bold">{hospitalName}</h2>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-muted-foreground uppercase mb-2">Current Balance</p>
                <div className="text-3xl font-bold text-primary">${totalCharged.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-3">Data Status</h3>
            <StatusPills itemizationStatus={itemizationStatus} nsaStatus={nsaApplies} duplicatesCount={duplicates.length} />
          </Card>
        </div>

        {chargeCategories.length > 0 && <div className="mb-8"><ChargeMapTable charges={chargeCategories} totalBill={totalCharged} /></div>}
        {duplicates.length > 0 && <div className="mb-8"><DuplicatesHighlight duplicates={duplicates} /></div>}
        <div className="mb-8">
          <NSATriage applies={nsaApplies} scenarios={nsaReview.scenarios || []} missingData={nsaReview.missing_for_nsa || []} prelimAssessment={nsaReview.prelim_assessment || 'Unable to determine.'} />
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Action Plan</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ActionPlanCard title="Call billing" description="Request itemized bill" script={callScript} icon="phone" accountId={a.account_number} dateRange={a.date_of_service} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 text-center">
            <h3 className="text-lg font-bold mb-2">Download Report</h3>
            <Button size="lg" onClick={handleEmailReport} disabled={isGeneratingPDF} className="w-full">
              {isGeneratingPDF ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Sending...</> : <><Mail className="mr-2 w-5 h-5" />Email Report</>}
            </Button>
          </Card>
          <Card className="p-6 text-center">
            <h3 className="text-lg font-bold mb-2">Dispute Letter</h3>
            <Link to="/generate-letter" state={{ issues: [...hi, ...pi], totalSavings: `$${estimatedSavings.toLocaleString()}`, sessionId, hospitalName, analysisDate }}>
              <Button size="lg" className="w-full">Generate Letter<ArrowRight className="ml-2 w-5 h-5" /></Button>
            </Link>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default ResultsV2;
