import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Mail, Download, Copy, Check } from "lucide-react";
import { DisputePack } from "@/types/disputePack";
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
}

export const DisputePackCard = ({ disputePack, sessionId, fallbackSavings, itemizationStatus }: DisputePackCardProps) => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedButton, setCopiedButton] = useState<'billing' | 'insurance' | null>(null);

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
        <h3 className="text-sm font-semibold text-foreground mb-3">Issues Included:</h3>
        <div className="space-y-2">
          {disputePack.issue_blocks.map((block, idx) => (
            <div key={idx} className="p-3 bg-white rounded-lg border border-blue-200">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">{block.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{block.why_flagged}</p>
                </div>
                {block.amount && (
                  <p className="text-sm font-bold text-orange-700 ml-4">
                    ${block.amount.toFixed(2)}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Checklist */}
      <div className="mb-6 p-4 bg-white/50 rounded-lg">
        <h3 className="text-sm font-semibold text-foreground mb-2">Documents Requested:</h3>
        <ul className="space-y-1">
          {disputePack.checklist.map((item, idx) => (
            <li key={idx} className="text-xs text-muted-foreground flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Button
            variant="outline"
            onClick={handleCopyBillingEmail}
            className="w-full transition-all"
          >
            {copiedButton === 'billing' ? (
              <>
                <Check className="w-4 h-4 mr-2 animate-scale-in text-green-600" />
                <span className="text-green-600 font-semibold">Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Mail className="w-4 h-4 mr-2" />
                Copy Email to Billing
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={handleCopyInsuranceEmail}
            className="w-full transition-all"
          >
            {copiedButton === 'insurance' ? (
              <>
                <Check className="w-4 h-4 mr-2 animate-scale-in text-green-600" />
                <span className="text-green-600 font-semibold">Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Mail className="w-4 h-4 mr-2" />
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
