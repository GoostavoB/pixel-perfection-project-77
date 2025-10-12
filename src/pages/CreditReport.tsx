import { TrendingDown, FileText, AlertCircle, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import { Link } from "react-router-dom";

const CreditReport = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 animate-fade-in">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <TrendingDown className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Medical Bills & Credit Reports
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Protecting your credit score from medical debt
            </p>
          </div>

          <div className="space-y-8">
            <Card className="p-6 md:p-8 bg-primary/5 border-primary/20">
              <h2 className="text-2xl font-bold text-foreground mb-4">Good News: Recent Changes Help Patients</h2>
              <p className="text-foreground/90 mb-4">
                As of 2023, the three major credit bureaus have implemented consumer-friendly changes that significantly reduce the impact of medical debt on credit scores.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-foreground/90">
                    <strong>Paid medical debt removed:</strong> Once you pay off medical collections, they're removed from your credit report entirely
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-foreground/90">
                    <strong>$500 minimum threshold:</strong> Medical debts under $500 don't appear on credit reports at all
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-foreground/90">
                    <strong>One-year grace period:</strong> Unpaid medical debt won't appear for a full year (up from 6 months)
                  </span>
                </li>
              </ul>
            </Card>

            <Card className="p-6 md:p-8">
              <h2 className="text-2xl font-bold text-foreground mb-6">Timeline: From Bill to Credit Report</h2>
              <div className="space-y-6">
                <div className="flex gap-6">
                  <div className="flex-shrink-0 w-24 pt-1">
                    <span className="text-sm font-bold text-primary">Day 1</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-foreground mb-1">You receive medical bill</h3>
                    <p className="text-muted-foreground text-sm">Payment typically due within 30 days. Set up payment plan if needed.</p>
                  </div>
                </div>

                <div className="flex gap-6">
                  <div className="flex-shrink-0 w-24 pt-1">
                    <span className="text-sm font-bold text-primary">30-90<br/>days</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-foreground mb-1">Hospital sends reminders</h3>
                    <p className="text-muted-foreground text-sm">Multiple billing statements and phone calls. Still time to negotiate or dispute.</p>
                  </div>
                </div>

                <div className="flex gap-6">
                  <div className="flex-shrink-0 w-24 pt-1">
                    <span className="text-sm font-bold text-destructive">90-120<br/>days</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-foreground mb-1">Sent to collections</h3>
                    <p className="text-muted-foreground text-sm">Hospital may sell debt to collection agency. Your account is now "in collections."</p>
                  </div>
                </div>

                <div className="flex gap-6">
                  <div className="flex-shrink-0 w-24 pt-1">
                    <span className="text-sm font-bold text-destructive">1 year</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-foreground mb-1">Appears on credit report</h3>
                    <p className="text-muted-foreground text-sm">If still unpaid and over $500, the debt now appears on your credit report.</p>
                  </div>
                </div>

                <div className="flex gap-6">
                  <div className="flex-shrink-0 w-24 pt-1">
                    <span className="text-sm font-bold text-muted-foreground">7 years</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-foreground mb-1">Automatically removed</h3>
                    <p className="text-muted-foreground text-sm">Even if unpaid, medical collections are removed from your report after 7 years.</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6 md:p-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">How Much Does It Hurt Your Score?</h2>
              <p className="text-foreground/90 mb-4">
                The impact depends on your current credit profile and score:
              </p>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 bg-muted/50 rounded-lg text-center">
                  <p className="text-2xl font-bold text-foreground mb-2">50-100</p>
                  <p className="text-sm font-semibold text-foreground mb-1">Points Lost</p>
                  <p className="text-xs text-muted-foreground">For first collection with good credit (720+)</p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg text-center">
                  <p className="text-2xl font-bold text-foreground mb-2">30-50</p>
                  <p className="text-sm font-semibold text-foreground mb-1">Points Lost</p>
                  <p className="text-xs text-muted-foreground">For fair credit (620-719)</p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg text-center">
                  <p className="text-2xl font-bold text-foreground mb-2">10-30</p>
                  <p className="text-sm font-semibold text-foreground mb-1">Points Lost</p>
                  <p className="text-xs text-muted-foreground">For poor credit (&lt;620)</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 md:p-8">
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                <FileText className="h-6 w-6 text-primary" />
                How to Prevent Medical Bills from Affecting Your Credit
              </h2>
              <ol className="space-y-4">
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center">1</span>
                  <div>
                    <h3 className="font-bold text-foreground mb-1">Review bills immediately</h3>
                    <p className="text-foreground/80">Check for errors within 30 days. 80% of bills contain mistakes that could be removed.</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center">2</span>
                  <div>
                    <h3 className="font-bold text-foreground mb-1">Set up payment plans</h3>
                    <p className="text-foreground/80">Most hospitals offer interest-free payment plans. As long as you're making payments, the bill won't go to collections.</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center">3</span>
                  <div>
                    <h3 className="font-bold text-foreground mb-1">Negotiate before collections</h3>
                    <p className="text-foreground/80">Hospitals often accept reduced payments if you can pay a lump sum before the debt is sold.</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center">4</span>
                  <div>
                    <h3 className="font-bold text-foreground mb-1">Dispute errors aggressively</h3>
                    <p className="text-foreground/80">Use professional dispute letters and don't accept incorrect charges. Many hospitals will write off disputed amounts.</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center">5</span>
                  <div>
                    <h3 className="font-bold text-foreground mb-1">Apply for financial assistance</h3>
                    <p className="text-foreground/80">Most hospitals have charity care programs. You may qualify for reduced or eliminated bills based on income.</p>
                  </div>
                </li>
              </ol>
            </Card>

            <Card className="p-6 md:p-8 border-destructive/20 bg-destructive/5">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-6 w-6 text-destructive mt-0.5 flex-shrink-0" />
                <div>
                  <h2 className="text-xl font-bold text-foreground mb-3">If Medical Debt Is Already on Your Report</h2>
                  <ul className="space-y-2 text-foreground/80">
                    <li>• <strong>Pay it off:</strong> Once paid, it's automatically removed from your report</li>
                    <li>• <strong>Verify accuracy:</strong> Request debt validation from the collector</li>
                    <li>• <strong>Negotiate removal:</strong> Some collectors will delete the entry if you pay in full</li>
                    <li>• <strong>Dispute if incorrect:</strong> File disputes with credit bureaus for any inaccuracies</li>
                    <li>• <strong>Consider goodwill deletion:</strong> After paying, write to request voluntary removal</li>
                  </ul>
                </div>
              </div>
            </Card>

            <Card className="p-6 md:p-8 bg-primary/5 border-primary/20">
              <h3 className="text-xl font-bold text-foreground mb-4">Protect Your Credit Score Today</h3>
              <p className="text-foreground/90 mb-6">
                Don't let billing errors ruin your credit. Check your medical bill for overcharges and mistakes before they become collections. Our free analysis takes minutes and could save you thousands.
              </p>
              <Link to="/upload">
                <Button size="lg" className="w-full sm:w-auto">
                  Analyze My Bill Now
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreditReport;
