import { FileText, Download, CheckCircle2, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import { Link } from "react-router-dom";

const DisputeLetter = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 animate-fade-in">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <FileText className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Medical Bill Dispute Letter
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Professional templates to dispute incorrect charges and overcharges
            </p>
          </div>

          <div className="space-y-8">
            <Card className="p-6 md:p-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">Why You Need a Dispute Letter</h2>
              <p className="text-foreground/90 mb-4">
                A well-written dispute letter is your most powerful tool for challenging incorrect medical bills. It creates an official paper trail, legally protects your rights, and significantly increases your chances of getting charges reduced or removed.
              </p>
              <p className="text-foreground/90">
                Studies show that patients who submit formal dispute letters are 3x more likely to receive billing corrections than those who only make phone calls.
              </p>
            </Card>

            <Card className="p-6 md:p-8 bg-primary/5 border-primary/20">
              <h2 className="text-2xl font-bold text-foreground mb-4">What Makes an Effective Dispute Letter</h2>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-foreground/90">
                    <strong>Professional format:</strong> Formal business letter structure with clear organization
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-foreground/90">
                    <strong>Specific details:</strong> Account numbers, dates of service, and exact charges being disputed
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-foreground/90">
                    <strong>Evidence-based:</strong> References to itemized bills, insurance EOBs, and relevant laws
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-foreground/90">
                    <strong>Clear request:</strong> Explicit statement of what correction you're seeking
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-foreground/90">
                    <strong>Deadline:</strong> Reasonable timeframe for response (typically 30 days)
                  </span>
                </li>
              </ul>
            </Card>

            <Card className="p-6 md:p-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">Common Reasons to Dispute</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h3 className="font-bold text-foreground mb-2">Duplicate Charges</h3>
                  <p className="text-sm text-foreground/80">
                    Same service billed multiple times or on multiple dates
                  </p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h3 className="font-bold text-foreground mb-2">Services Not Received</h3>
                  <p className="text-sm text-foreground/80">
                    Charges for treatments, tests, or procedures you never had
                  </p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h3 className="font-bold text-foreground mb-2">Upcoding</h3>
                  <p className="text-sm text-foreground/80">
                    Billing for a more expensive service than what was provided
                  </p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h3 className="font-bold text-foreground mb-2">Balance Billing</h3>
                  <p className="text-sm text-foreground/80">
                    Out-of-network charges that violate the No Surprises Act
                  </p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h3 className="font-bold text-foreground mb-2">Pricing Errors</h3>
                  <p className="text-sm text-foreground/80">
                    Charges significantly higher than regional averages
                  </p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h3 className="font-bold text-foreground mb-2">Incorrect Quantities</h3>
                  <p className="text-sm text-foreground/80">
                    Wrong number of units or days billed for services
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 md:p-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">How to Use Your Dispute Letter</h2>
              <ol className="space-y-4">
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center">1</span>
                  <div>
                    <h3 className="font-bold text-foreground mb-1">Analyze Your Bill First</h3>
                    <p className="text-foreground/80">Use our bill checker to identify specific errors and get a customized dispute letter.</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center">2</span>
                  <div>
                    <h3 className="font-bold text-foreground mb-1">Gather Supporting Documents</h3>
                    <p className="text-foreground/80">Collect your itemized bill, insurance EOB, medical records, and any correspondence.</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center">3</span>
                  <div>
                    <h3 className="font-bold text-foreground mb-1">Send via Certified Mail</h3>
                    <p className="text-foreground/80">Always use certified mail with return receipt to prove delivery and create a paper trail.</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center">4</span>
                  <div>
                    <h3 className="font-bold text-foreground mb-1">Keep Detailed Records</h3>
                    <p className="text-foreground/80">Maintain copies of all letters, receipts, and responses for your records.</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center">5</span>
                  <div>
                    <h3 className="font-bold text-foreground mb-1">Follow Up</h3>
                    <p className="text-foreground/80">If you don't receive a response within 30 days, send a follow-up letter and consider escalating.</p>
                  </div>
                </li>
              </ol>
            </Card>

            <Card className="p-6 md:p-8 border-destructive/20 bg-destructive/5">
              <div className="flex items-start gap-3 mb-4">
                <AlertCircle className="h-6 w-6 text-destructive mt-0.5 flex-shrink-0" />
                <div>
                  <h2 className="text-xl font-bold text-foreground mb-2">Important Tips</h2>
                  <ul className="space-y-2 text-foreground/80">
                    <li>• Never pay a disputed amount before resolution</li>
                    <li>• Send copies, never originals, of supporting documents</li>
                    <li>• Be professional and factual, avoid emotional language</li>
                    <li>• Address the letter to the billing department manager</li>
                    <li>• Include all relevant account and patient ID numbers</li>
                  </ul>
                </div>
              </div>
            </Card>

            <Card className="p-6 md:p-8 bg-primary/5 border-primary/20">
              <h3 className="text-xl font-bold text-foreground mb-4">Get Your Custom Dispute Letter</h3>
              <p className="text-foreground/90 mb-6">
                Upload your medical bill to receive a professionally formatted dispute letter customized with your specific billing errors and overcharges. Ready to send in minutes.
              </p>
              <Link to="/upload">
                <Button size="lg" className="w-full sm:w-auto">
                  <Download className="mr-2 h-5 w-5" />
                  Generate My Dispute Letter
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DisputeLetter;
