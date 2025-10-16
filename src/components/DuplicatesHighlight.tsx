import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Mail, ClipboardCopy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DuplicateItem {
  description: string;
  amount: number;
  confidence: "high" | "medium" | "low";
  details: string;
  disputeText: string;
}

interface DuplicatesHighlightProps {
  duplicates: DuplicateItem[];
}

export const DuplicatesHighlight = ({ duplicates }: DuplicatesHighlightProps) => {
  const { toast } = useToast();

  const handleCopyDispute = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard!",
      description: "Paste this when calling billing",
    });
  };

  const handleEmailRequest = (duplicate: DuplicateItem) => {
    const subject = encodeURIComponent(`Question About My Medical Bill`);
    const body = encodeURIComponent(duplicate.disputeText);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  if (duplicates.length === 0) return null;

  const totalAmount = duplicates.reduce((sum, dup) => sum + dup.amount, 0);

  return (
    <Card className="p-6 bg-orange-50/50 border-orange-200">
      <div className="flex items-start gap-3 mb-4">
        <div className="p-2 bg-orange-100 rounded-lg">
          <Copy className="w-5 h-5 text-orange-700" />
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-orange-900 mb-1">Charges That Need Your Attention</h2>
          <p className="text-sm text-orange-700 mb-1">
            We found <strong>{duplicates.length} charge{duplicates.length > 1 ? 's' : ''}</strong> that you should ask about, 
            totaling <strong>${totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
          </p>
          <p className="text-xs text-orange-600">
            These might be billing errors, or they might be correct - but you need more information to verify them.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {duplicates.map((duplicate, idx) => (
          <div key={idx} className="bg-white rounded-lg p-4 border border-orange-200">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-1">{duplicate.description}</h3>
              </div>
              <div className="text-right ml-4">
                <div className="text-lg font-bold text-orange-700">
                  ${duplicate.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-400 p-3 mb-3 rounded">
              <p className="text-sm text-gray-700 leading-relaxed">{duplicate.details}</p>
            </div>

            <div className="bg-green-50 border-l-4 border-green-400 p-3 mb-3 rounded">
              <p className="text-xs font-semibold text-green-900 mb-1">
                📞 What to say when you call billing:
              </p>
              <p className="text-sm text-green-800 italic">"{duplicate.disputeText}"</p>
            </div>

            <div className="flex gap-2 mt-3">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleCopyDispute(duplicate.disputeText)}
                className="text-xs flex-1"
              >
                <ClipboardCopy className="w-3 h-3 mr-1" />
                Copy what to say
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleEmailRequest(duplicate)}
                className="text-xs flex-1"
              >
                <Mail className="w-3 h-3 mr-1" />
                Draft email
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-900">
          <strong>💡 Remember:</strong> Asking questions about your bill is completely normal and expected. 
          Hospitals have billing departments specifically to handle these questions. You're not being difficult - 
          you're being smart with your money.
        </p>
      </div>
    </Card>
  );
};
