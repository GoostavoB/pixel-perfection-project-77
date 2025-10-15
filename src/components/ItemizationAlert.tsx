import { AlertTriangle, FileText, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ItemizationAlertProps {
  totalBill: number;
  callScript: string;
}

export const ItemizationAlert = ({ totalBill, callScript }: ItemizationAlertProps) => {
  const handleCopyScript = () => {
    navigator.clipboard.writeText(callScript);
  };

  return (
    <Card className="border-4 border-warning bg-warning/10 p-8 mb-8">
      <div className="flex items-start gap-6">
        <div className="p-4 bg-warning/20 rounded-full flex-shrink-0">
          <AlertTriangle className="h-12 w-12 text-warning" />
        </div>
        
        <div className="flex-1">
          <h2 className="text-3xl font-bold mb-4 text-foreground">
            ⚠️ CRITICAL: Request an Itemized Bill First
          </h2>
          
          <div className="space-y-4 mb-6">
            <Alert className="bg-destructive/10 border-destructive/30">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <AlertTitle className="text-lg font-bold">This Bill Is Incomplete and Cannot Be Verified</AlertTitle>
              <AlertDescription className="text-base mt-2">
                <strong>Total Charged: ${totalBill.toLocaleString()}</strong> - but without any way to verify what you're actually being charged for.
              </AlertDescription>
            </Alert>

            <div className="prose prose-sm max-w-none">
              <h3 className="text-xl font-bold mb-3">Why This Bill Is Unacceptable:</h3>
              <ul className="space-y-2 text-base">
                <li>
                  <strong>No CPT/HCPCS Codes:</strong> Medical billing codes are <em>required by law</em> to identify each service. 
                  Without them, you cannot verify if charges are legitimate, duplicate, or overpriced.
                </li>
                <li>
                  <strong>Aggregate Categories Only:</strong> Vague categories like "Room and Care: $428,733" or "Pharmacy: $60,637" 
                  hide the actual services provided. This prevents you from:
                  <ul className="ml-6 mt-2 space-y-1">
                    <li>• Identifying duplicate charges</li>
                    <li>• Comparing prices to Medicare rates</li>
                    <li>• Detecting services you never received</li>
                    <li>• Catching billing errors and overcharges</li>
                  </ul>
                </li>
                <li>
                  <strong>Impossible to Dispute:</strong> You have a legal right to know exactly what you're paying for. 
                  This bill format makes it impossible to challenge any charges.
                </li>
              </ul>

              <h3 className="text-xl font-bold mb-3 mt-6">What An Itemized Bill Must Include:</h3>
              <ul className="space-y-2 text-base">
                <li>✓ <strong>CPT or HCPCS code</strong> for every service, procedure, supply, and medication</li>
                <li>✓ <strong>Description</strong> of each service in plain English</li>
                <li>✓ <strong>Date</strong> each service was provided</li>
                <li>✓ <strong>Quantity/Units</strong> (how many times, how many units, duration)</li>
                <li>✓ <strong>Unit price</strong> and total charge for each line item</li>
                <li>✓ <strong>Provider name/NPI</strong> for each service</li>
                <li>✓ For medications: <strong>NDC code, dosage, and quantity</strong></li>
                <li>✓ For blood products: <strong>Product codes and units transfused</strong></li>
              </ul>
            </div>
          </div>

          <div className="bg-background/80 border-2 border-primary/30 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              How to Request an Itemized Bill (Copy This Script)
            </h3>
            <div className="bg-muted p-4 rounded border mb-3 text-sm font-mono whitespace-pre-wrap">
              {callScript}
            </div>
            <Button onClick={handleCopyScript} variant="outline" size="sm">
              Copy Script to Clipboard
            </Button>
          </div>

          <Alert className="bg-primary/10 border-primary/30">
            <ArrowRight className="h-5 w-5 text-primary" />
            <AlertTitle className="font-bold">Once You Get the Itemized Bill:</AlertTitle>
            <AlertDescription className="mt-2">
              Upload it back here and we'll analyze every line item to identify:
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>Duplicate charges (most common issue - 30-40% of bills)</li>
                <li>Overcharges vs Medicare benchmarks</li>
                <li>Unbundling fraud and upcoding</li>
                <li>No Surprises Act violations</li>
                <li>Services not rendered or incorrect quantities</li>
              </ul>
              <strong className="block mt-3">We'll show you EXACTLY how much you can save and how to dispute each issue.</strong>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </Card>
  );
};
