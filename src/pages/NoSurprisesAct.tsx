import { Shield, AlertTriangle, FileText, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import { Link } from "react-router-dom";

const NoSurprisesAct = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 animate-fade-in">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              The No Surprises Act
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Federal law protecting you from unexpected out-of-network medical bills
            </p>
          </div>

          <div className="space-y-8">
            <Card className="p-6 md:p-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">What Is the No Surprises Act?</h2>
              <p className="text-foreground/90 mb-4">
                The No Surprises Act is a federal law that went into effect on January 1, 2022. It protects consumers from surprise medical bills when receiving emergency care or certain types of non-emergency care from out-of-network providers at in-network facilities.
              </p>
              <p className="text-foreground/90">
                Before this law, patients could receive unexpectedly high bills from out-of-network providers they didn't choose, even when visiting in-network hospitals. The No Surprises Act eliminates most of these surprise bills.
              </p>
            </Card>

            <Card className="p-6 md:p-8 bg-primary/5 border-primary/20">
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                <CheckCircle2 className="h-6 w-6 text-primary" />
                What the Act Protects You From
              </h2>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-foreground/90">
                    <strong>Emergency services:</strong> You can't be billed more than in-network cost-sharing amounts for emergency care, even at out-of-network facilities
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-foreground/90">
                    <strong>Ancillary care:</strong> Certain out-of-network services (anesthesiology, radiology, labs) at in-network facilities are protected
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-foreground/90">
                    <strong>Air ambulance services:</strong> Out-of-network air ambulance services are covered under the Act
                  </span>
                </li>
              </ul>
            </Card>

            <Card className="p-6 md:p-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">Common Scenarios Where You're Protected</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h3 className="font-bold text-foreground mb-2">Emergency Room Visits</h3>
                  <p className="text-sm text-foreground/80">
                    All ER care is treated as in-network, regardless of which hospital you go to or which providers treat you.
                  </p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h3 className="font-bold text-foreground mb-2">Scheduled Surgery</h3>
                  <p className="text-sm text-foreground/80">
                    When you have surgery at an in-network hospital, you're protected from surprise bills from out-of-network anesthesiologists or surgeons you didn't select.
                  </p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h3 className="font-bold text-foreground mb-2">Lab Work</h3>
                  <p className="text-sm text-foreground/80">
                    Lab tests ordered during your visit to an in-network facility are covered at in-network rates.
                  </p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h3 className="font-bold text-foreground mb-2">Radiology Services</h3>
                  <p className="text-sm text-foreground/80">
                    X-rays, MRIs, and other imaging at in-network facilities cannot result in surprise out-of-network bills.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 md:p-8 border-destructive/20 bg-destructive/5">
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                <AlertTriangle className="h-6 w-6 text-destructive" />
                Red Flags: Possible Violations
              </h2>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-destructive font-bold text-lg">•</span>
                  <span className="text-foreground/90">
                    You received an emergency bill higher than your in-network cost-sharing
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-destructive font-bold text-lg">•</span>
                  <span className="text-foreground/90">
                    You were charged out-of-network rates for ancillary services at an in-network facility
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-destructive font-bold text-lg">•</span>
                  <span className="text-foreground/90">
                    You didn't receive a notice and consent form when required for non-emergency out-of-network care
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-destructive font-bold text-lg">•</span>
                  <span className="text-foreground/90">
                    Air ambulance service charged you balance billing amounts
                  </span>
                </li>
              </ul>
            </Card>

            <Card className="p-6 md:p-8">
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                <FileText className="h-6 w-6 text-primary" />
                What to Do If You Receive a Surprise Bill
              </h2>
              <ol className="space-y-4">
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center">1</span>
                  <div>
                    <h3 className="font-bold text-foreground mb-1">Don't Pay Immediately</h3>
                    <p className="text-foreground/80">Review the bill carefully first. Paying may be seen as accepting the charges.</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center">2</span>
                  <div>
                    <h3 className="font-bold text-foreground mb-1">Check Your Bill</h3>
                    <p className="text-foreground/80">Use Hospital Bill Checker to analyze your bill for No Surprises Act violations.</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center">3</span>
                  <div>
                    <h3 className="font-bold text-foreground mb-1">Contact Your Insurer</h3>
                    <p className="text-foreground/80">Your insurance company should handle the dispute with the provider on your behalf.</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center">4</span>
                  <div>
                    <h3 className="font-bold text-foreground mb-1">File a Complaint</h3>
                    <p className="text-foreground/80">If unresolved, file a complaint with the Centers for Medicare & Medicaid Services at cms.gov/nosurprises.</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center">5</span>
                  <div>
                    <h3 className="font-bold text-foreground mb-1">Consider the Dispute Resolution Process</h3>
                    <p className="text-foreground/80">You have the right to initiate a federal independent dispute resolution process within 120 days.</p>
                  </div>
                </li>
              </ol>
            </Card>

            <Card className="p-6 md:p-8 bg-primary/5 border-primary/20">
              <h3 className="text-xl font-bold text-foreground mb-4">Get Your Bill Analyzed Now</h3>
              <p className="text-foreground/90 mb-6">
                Our free tool automatically checks your medical bill for No Surprises Act violations and other billing errors. Get your analysis in minutes.
              </p>
              <Link to="/upload">
                <Button size="lg" className="w-full sm:w-auto">
                  Upload Your Bill
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NoSurprisesAct;
