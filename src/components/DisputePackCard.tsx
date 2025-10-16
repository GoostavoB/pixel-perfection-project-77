import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Mail, Download, Copy, Check, Shield, DollarSign, AlertTriangle, HelpCircle } from "lucide-react";
import { DisputePack, IssueBlock } from "@/types/disputePack";
import { generateBillingEmail, generateInsuranceEmail } from "@/utils/disputePackGenerator";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import html2pdf from "html2pdf.js";

interface DisputePackCardProps {
  disputePack: DisputePack;
  sessionId: string;
  fallbackSavings?: { low: number; high: number } | null;
  itemizationStatus?: string;
  nsaMissingData?: string[];
  nsaApplies?: 'protected' | 'not-protected' | 'unknown';
}

export const DisputePackCard = ({ 
  disputePack, 
  sessionId, 
  fallbackSavings, 
  itemizationStatus,
  nsaMissingData = [],
  nsaApplies = 'unknown'
}: DisputePackCardProps) => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedButton, setCopiedButton] = useState<'billing' | 'insurance' | 'nsa' | null>(null);

  const handleCopyBillingEmail = () => {
    const email = generateBillingEmail(disputePack);
    navigator.clipboard.writeText(email);
    setCopiedButton('billing');
    setTimeout(() => setCopiedButton(null), 2000);
    toast({
      title: "Copied!",
      description: "Billing email copied to clipboard",
    });
  };

  const handleCopyInsuranceEmail = () => {
    const email = generateInsuranceEmail(disputePack);
    navigator.clipboard.writeText(email);
    setCopiedButton('insurance');
    setTimeout(() => setCopiedButton(null), 2000);
    toast({
      title: "Copied!",
      description: "Insurance email copied to clipboard",
    });
  };

  const handleCopyNSAEmail = () => {
    const emailText = 
      `Subject: Request for Network Status and NSA Documentation\n\n` +
      `Dear Billing Department,\n\n` +
      `I am requesting the following information to determine No Surprises Act (NSA) protections for my recent medical bill:\n\n` +
      nsaMissingData.map(item => `• ${item}`).join('\n') +
      `\n\nPlease provide this information within 30 days as required by federal law.\n\n` +
      `Thank you,`;
    
    navigator.clipboard.writeText(emailText);
    setCopiedButton('nsa');
    setTimeout(() => setCopiedButton(null), 2000);
    
    toast({
      title: "Copied!",
      description: "NSA request email copied to clipboard",
    });
  };

  const handleDownloadPDF = async () => {
    setIsGenerating(true);
    try {
      console.log('Requesting dispute pack PDF generation...');
      const { data, error } = await supabase.functions.invoke('generate-dispute-pack-pdf', {
        body: { disputePack, sessionId, format: 'html' }
      });

      console.log('Response from edge function:', { data, error });

      if (error) {
        console.error('Edge function error:', error);
        throw error;
      }

      if (!data || !data.html_content) {
        throw new Error('No HTML content returned from edge function');
      }

      // Create a temporary div to hold the HTML
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = data.html_content;
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      document.body.appendChild(tempDiv);

      // Configure PDF options
      const opt = {
        margin: [0.5, 0.5, 0.5, 0.5],
        filename: `dispute-pack-${disputePack.report_id}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
      };

      // Generate and download PDF
      await html2pdf().set(opt).from(tempDiv).save();
      
      // Clean up
      document.body.removeChild(tempDiv);
      
      toast({
        title: "Success!",
        description: "PDF dispute pack downloaded successfully.",
      });
    } catch (error) {
      console.error("Error generating dispute pack:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate dispute pack",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadWord = async () => {
    setIsGenerating(true);
    try {
      console.log('Requesting Word document generation...');
      const { data, error } = await supabase.functions.invoke('generate-dispute-pack-pdf', {
        body: { disputePack, sessionId, format: 'docx' }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw error;
      }

      if (!data || !data.docx_base64) {
        throw new Error('No Word document data returned');
      }

      // Convert base64 to blob and download
      const byteCharacters = atob(data.docx_base64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dispute-pack-${disputePack.report_id}.docx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Success!",
        description: "Word document downloaded. You can now edit it as needed.",
      });
    } catch (error) {
      console.error("Error generating Word document:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate Word document",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const totalAmount = disputePack.issue_blocks
    .filter(b => b.amount !== null)
    .reduce((sum, b) => sum + (b.amount || 0), 0);
  
  const totalIssuesCount = disputePack.issue_blocks.length;

  // Helper function to categorize and get icons for issues
  const getIssueCategory = (issueType: IssueBlock['issue_type']) => {
    const categories = {
      'nsa_request': { icon: Shield, label: '🛡️ Insurance & Legal Protection', color: 'border-l-blue-500', bgColor: 'bg-blue-50' },
      'duplicate': { icon: AlertTriangle, label: '💰 Potential Overcharges', color: 'border-l-orange-500', bgColor: 'bg-orange-50' },
      'panel_unbundling': { icon: DollarSign, label: '💰 Potential Overcharges', color: 'border-l-orange-500', bgColor: 'bg-orange-50' },
      'pricing_high': { icon: DollarSign, label: '💰 Potential Overcharges', color: 'border-l-orange-500', bgColor: 'bg-orange-50' },
      'itemization': { icon: HelpCircle, label: '❓ Missing Information', color: 'border-l-purple-500', bgColor: 'bg-purple-50' },
      'lab_repeat': { icon: AlertTriangle, label: '💰 Potential Overcharges', color: 'border-l-orange-500', bgColor: 'bg-orange-50' },
      'pharmacy_itemization': { icon: HelpCircle, label: '❓ Missing Information', color: 'border-l-purple-500', bgColor: 'bg-purple-50' },
      'blood_services': { icon: DollarSign, label: '💰 Potential Overcharges', color: 'border-l-orange-500', bgColor: 'bg-orange-50' },
      'imaging_component': { icon: DollarSign, label: '💰 Potential Overcharges', color: 'border-l-orange-500', bgColor: 'bg-orange-50' },
      'room_day': { icon: AlertTriangle, label: '💰 Potential Overcharges', color: 'border-l-orange-500', bgColor: 'bg-orange-50' },
      'er_level': { icon: DollarSign, label: '💰 Potential Overcharges', color: 'border-l-orange-500', bgColor: 'bg-orange-50' },
      'anesthesia_time': { icon: AlertTriangle, label: '💰 Potential Overcharges', color: 'border-l-orange-500', bgColor: 'bg-orange-50' },
      'other': { icon: HelpCircle, label: '❓ Missing Information', color: 'border-l-gray-500', bgColor: 'bg-gray-50' }
    };
    return categories[issueType] || categories['other'];
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
      <div className="flex items-start gap-4 mb-6">
        <div className="p-3 bg-blue-100 rounded-lg">
          <FileText className="w-6 h-6 text-blue-700" />
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-blue-900 mb-2">Dispute Pack Ready</h2>
          <p className="text-sm text-blue-700 mb-3">
            Professional dispute documentation for {totalIssuesCount} issue
            {totalIssuesCount !== 1 ? 's' : ''} identified
          </p>
          <div className="flex flex-wrap gap-2">
            <Badge className="bg-blue-100 text-blue-700 border-blue-300">
              Report ID: {disputePack.report_id}
            </Badge>
            {disputePack.eob_present === 'no' && (
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
                EOB needed for savings calculation
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-white/50 rounded-lg">
        <div>
          <p className="text-xs text-muted-foreground mb-1">Provider</p>
          <p className="text-sm font-semibold">{disputePack.provider_name}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">Service Dates</p>
          <p className="text-sm font-semibold">{disputePack.service_dates}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">Bill Total</p>
          <p className="text-sm font-semibold">${disputePack.bill_total.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">Issues Amount</p>
          <p className="text-sm font-semibold text-destructive">
            {totalAmount > 0 
              ? `$${totalAmount.toFixed(2)}`
              : fallbackSavings 
                ? `$${fallbackSavings.low.toLocaleString()} - $${fallbackSavings.high.toLocaleString()}`
                : 'Pending itemization'
            }
          </p>
          {fallbackSavings && totalAmount === 0 && (
            <p className="text-xs text-muted-foreground mt-1">estimated range</p>
          )}
        </div>
      </div>

      {/* Issue Blocks Preview */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-foreground mb-2">Billing Problems We Found</h3>
        <p className="text-sm text-muted-foreground mb-4">
          These are specific billing issues identified in your analysis. Each represents a potential error 
          or missing information that could reduce your bill.
        </p>
        <div className="space-y-3">
          {disputePack.issue_blocks.map((block, idx) => {
            const category = getIssueCategory(block.issue_type);
            const IconComponent = category.icon;
            
            return (
              <div 
                key={idx} 
                className={`p-4 bg-white rounded-lg border-l-4 ${category.color} ${category.bgColor} border border-gray-200 shadow-sm`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <IconComponent className="w-5 h-5 text-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h4 className="text-sm font-bold text-foreground">{block.title}</h4>
                      {block.amount ? (
                        <div className="flex-shrink-0 text-right">
                          <p className="text-lg font-bold text-orange-700">
                            ${block.amount.toFixed(2)}
                          </p>
                          <p className="text-xs text-muted-foreground">potential savings</p>
                        </div>
                      ) : (
                        <div className="flex-shrink-0 text-right">
                          <p className="text-sm font-semibold text-amber-700">Pending</p>
                          <p className="text-xs text-muted-foreground">needs verification</p>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{block.why_flagged}</p>
                    {block.lines_in_question.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-gray-200">
                        <p className="text-xs font-semibold text-muted-foreground mb-1">
                          Affected line items:
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {block.lines_in_question.join(', ')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Checklist */}
      <div className="mb-6 p-4 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg border border-purple-200">
        <div className="flex items-start gap-2 mb-3">
          <FileText className="w-5 h-5 text-purple-700 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-bold text-foreground mb-1">Documents You'll Request</h3>
            <p className="text-xs text-muted-foreground">
              These documents will help prove the issues above and strengthen your dispute. 
              Request them using the email templates below.
            </p>
          </div>
        </div>
        <ul className="space-y-2 mt-3">
          {disputePack.checklist.map((item, idx) => (
            <li key={idx} className="text-sm text-foreground flex items-start gap-2 bg-white/60 p-2 rounded">
              <Check className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        {/* Recommendation Header */}
        <div className="p-4 bg-gradient-to-br from-blue-100 to-indigo-100 border-2 border-blue-300 rounded-lg">
          <div className="flex items-start gap-3">
            <Mail className="w-5 h-5 text-blue-700 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-bold text-blue-900 mb-2">📋 Recommended: Send All 3 Emails</h3>
              <p className="text-xs text-blue-800 mb-2">
                Before disputing charges, gather complete information by sending these three emails. 
                Each targets a different party and requests specific documentation that strengthens your case.
              </p>
              <p className="text-xs font-semibold text-blue-900">
                💡 Copy each email template below, paste into your email client, and send to the appropriate recipient.
              </p>
            </div>
          </div>
        </div>

        {/* Billing Email Section */}
        <div className="p-3 bg-blue-50/50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-2 mb-2">
            <Mail className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-blue-900 mb-1">Email to Hospital/Provider Billing Department</p>
              <p className="text-xs text-blue-700">
                Requests an itemized bill, documentation for flagged issues, and corrections to errors. 
                Creates a paper trail and may reveal additional billing mistakes.
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={handleCopyBillingEmail}
            className="w-full transition-all mt-2"
          >
            {copiedButton === 'billing' ? (
              <>
                <Check className="w-4 h-4 mr-2 animate-scale-in text-green-600" />
                <span className="text-green-600 font-semibold">Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" />
                Copy Email to Billing
              </>
            )}
          </Button>
        </div>

        {/* NSA Email Section - Only show if there's missing data */}
        {nsaMissingData.length > 0 && (
          <div className="p-3 bg-blue-50/50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-2 mb-2">
              <Shield className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-blue-900 mb-1">No Surprises Act Request Email</p>
                <p className="text-xs text-blue-700">
                  Email to Hospital/Provider Billing Department requesting information to determine if you're protected from balance billing under federal law. 
                  Could save you significant money if NSA protections apply.
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={handleCopyNSAEmail}
              className="w-full transition-all mt-2"
            >
              {copiedButton === 'nsa' ? (
                <>
                  <Check className="w-4 h-4 mr-2 animate-scale-in text-green-600" />
                  <span className="text-green-600 font-semibold">Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy NSA Request Email
                </>
              )}
            </Button>
          </div>
        )}

        {/* Insurance Email Section */}
        <div className="p-3 bg-blue-50/50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-2 mb-2">
            <Mail className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-blue-900 mb-1">Email to Your Insurance Company</p>
              <p className="text-xs text-blue-700">
                Requests the Explanation of Benefits (EOB), review of potential duplicate charges, and clarification on denied items. 
                Alerts insurance to errors and may trigger their own review.
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={handleCopyInsuranceEmail}
            className="w-full transition-all mt-2"
          >
            {copiedButton === 'insurance' ? (
              <>
                <Check className="w-4 h-4 mr-2 animate-scale-in text-green-600" />
                <span className="text-green-600 font-semibold">Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" />
                Copy Email to Insurance
              </>
            )}
          </Button>
        </div>
        
        <Button
          onClick={handleDownloadWord}
          disabled={isGenerating}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          {isGenerating ? (
            <>Generating...</>
          ) : (
            <>
              <Download className="w-4 h-4 mr-2" />
              Download Word Document
            </>
          )}
        </Button>

        {/* Why Copy Section */}
        <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg mt-4">
          <h4 className="text-sm font-semibold text-green-900 mb-2">💡 Why Copy Instead of Sending?</h4>
          <p className="text-xs text-green-800 mb-2">
            All buttons copy text to your clipboard so you can:
          </p>
          <ul className="text-xs text-green-700 space-y-1 mb-3 ml-4">
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-0.5">•</span>
              <span>Paste into your own email client</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-0.5">•</span>
              <span>Add your contact information</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-0.5">•</span>
              <span>Attach any supporting documents</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-0.5">•</span>
              <span>Send from your personal email (creates better record-keeping)</span>
            </li>
          </ul>
          <p className="text-xs font-semibold text-green-900">
            <span className="text-green-600">💪 Pro tip:</span> Send all three emails! They work together to give you maximum leverage and documentation for your dispute.
          </p>
        </div>
      </div>

      {disputePack.eob_present === 'no' && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-xs text-yellow-800">
            <strong>Note:</strong> Savings unknown until EOB. Upload EOB to unlock precise savings calculations.
          </p>
        </div>
      )}
    </Card>
  );
};
