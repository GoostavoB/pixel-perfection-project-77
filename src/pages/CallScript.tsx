import { Phone, Mic, CheckCircle2, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import { Link } from "react-router-dom";

const CallScript = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 animate-fade-in">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Phone className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Voice Call Script
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Professional scripts for disputing medical bills by phone
            </p>
          </div>

          <div className="space-y-8">
            <Card className="p-6 md:p-8 border-primary/20 bg-primary/5">
              <div className="flex items-start gap-3">
                <Mic className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h2 className="text-xl font-bold text-foreground mb-2">Before You Call</h2>
                  <p className="text-foreground/90 mb-4">
                    Preparation is key to a successful phone dispute. Having the right information ready increases your chances of getting charges corrected on the first call.
                  </p>
                  <ul className="space-y-2 text-foreground/80">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>Have your account number, dates of service, and patient ID ready</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>Keep your itemized bill and insurance EOB in front of you</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>Note specific line items and amounts you're disputing</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>Be in a quiet place where you can take notes</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>Call during business hours when senior staff are available</span>
                    </li>
                  </ul>
                </div>
              </div>
            </Card>

            <Card className="p-6 md:p-8 bg-card">
              <h2 className="text-2xl font-bold text-foreground mb-4">Opening Script</h2>
              <div className="bg-muted/50 p-5 rounded-lg border-l-4 border-primary">
                <p className="text-foreground/90 mb-3">
                  "Hello, my name is [Your Name]. I'm calling about account number [Account #] for services on [Date]. I've reviewed my itemized bill and found some discrepancies I need to discuss with the billing manager or a senior billing specialist. Can you connect me with someone who can help resolve billing errors?"
                </p>
                <p className="text-sm text-muted-foreground italic">
                  Note: Ask for a manager or specialist immediately. First-tier representatives often lack authority to make corrections.
                </p>
              </div>
            </Card>

            <Card className="p-6 md:p-8 bg-card">
              <h2 className="text-2xl font-bold text-foreground mb-6">Specific Dispute Scripts</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-sm">1</span>
                    Duplicate Charges
                  </h3>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <p className="text-foreground/90">
                      "I'm looking at my itemized bill and I see charge code [Code] appears on both [Date 1] and [Date 2] for $[Amount]. This appears to be a duplicate charge as I only received this service once on [Date]. Can you review the records and remove the duplicate charge from [Date 2]? I'll send written confirmation of this error via certified mail today."
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-sm">2</span>
                    Services Not Received
                  </h3>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <p className="text-foreground/90">
                      "I'm disputing the charge for [Service/Procedure] listed as code [Code] for $[Amount]. According to my medical records and my recollection, I did not receive this service during my visit on [Date]. Can you verify with the medical staff whether this service was actually provided? I'd like this charge investigated and removed if it cannot be verified."
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-sm">3</span>
                    No Surprises Act Violation
                  </h3>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <p className="text-foreground/90">
                      "I received emergency care on [Date] at your in-network facility, but I'm being billed out-of-network rates for [Service] by [Provider]. Under the No Surprises Act, which took effect January 1, 2022, I should only be responsible for in-network cost-sharing for emergency services. This bill violates federal law. I'm requesting you rebill this at in-network rates immediately."
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-sm">4</span>
                    Overpriced Services
                  </h3>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <p className="text-foreground/90">
                      "I'm concerned about the charge for [Service/Item] listed at $[Amount]. I've researched typical costs for this service in [City/State] and found the average is $[Average Amount]. Your charge is [X]% higher than the regional average. Can you explain this price difference? I'm requesting you adjust this charge to match the fair market rate for this area."
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-sm">5</span>
                    Incorrect Quantities
                  </h3>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <p className="text-foreground/90">
                      "The bill shows [Number] units of [Item/Service] at $[Amount] each. However, according to my medical records, I only received [Actual Number] units. Can you verify the quantity in your system? I'm requesting correction of this quantity error, which would reduce the charge from $[Billed Amount] to $[Correct Amount]."
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6 md:p-8 bg-card">
              <h2 className="text-2xl font-bold text-foreground mb-4">Closing Script</h2>
              <div className="bg-muted/50 p-5 rounded-lg border-l-4 border-primary">
                <p className="text-foreground/90 mb-4">
                  "Thank you for reviewing these issues with me. To confirm, you're going to [summary of agreed actions] and I should expect [outcome] within [timeframe]. Can I have your name, title, and a direct phone number in case I need to follow up? I'm also sending a written dispute letter via certified mail today to document this conversation. Can you confirm the correct mailing address?"
                </p>
                <p className="text-sm text-muted-foreground italic">
                  Always get: Representative's name, direct contact info, ticket/case number, expected timeline, and written confirmation.
                </p>
              </div>
            </Card>

            <Card className="p-6 md:p-8 border-destructive/20 bg-destructive/5">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-6 w-6 text-destructive mt-0.5 flex-shrink-0" />
                <div>
                  <h2 className="text-xl font-bold text-foreground mb-3">Important Do's and Don'ts</h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-bold text-foreground mb-2 text-sm">✓ DO</h3>
                      <ul className="space-y-1 text-sm text-foreground/80">
                        <li>• Stay calm and professional</li>
                        <li>• Take detailed notes during the call</li>
                        <li>• Get everything in writing</li>
                        <li>• Record date, time, and who you spoke with</li>
                        <li>• Ask for a supervisor if needed</li>
                        <li>• Follow up in writing</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground mb-2 text-sm">✗ DON'T</h3>
                      <ul className="space-y-1 text-sm text-foreground/80">
                        <li>• Make payment during the dispute</li>
                        <li>• Accept vague promises</li>
                        <li>• Get emotional or aggressive</li>
                        <li>• Accept "computer says no" answers</li>
                        <li>• Forget to document everything</li>
                        <li>• Give up after the first call</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6 md:p-8 bg-primary/5 border-primary/20">
              <h3 className="text-xl font-bold text-foreground mb-4">Prepare for Your Call</h3>
              <p className="text-foreground/90 mb-6">
                Get a detailed analysis of your bill first, including specific errors, overcharges, and legal violations. Our free analysis provides all the facts you need for a successful phone dispute.
              </p>
              <Link to="/upload">
                <Button size="lg" className="w-full sm:w-auto">
                  Analyze My Bill First
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CallScript;
