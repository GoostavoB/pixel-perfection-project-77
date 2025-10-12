import { Clock, Calendar, CheckCircle2, AlertCircle, FileText } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import { Link } from "react-router-dom";

const HowLongMedicalBills = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-16">
        <article className="max-w-4xl mx-auto">
          <div className="text-center mb-12 animate-fade-in">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Clock className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              How Long Do Medical Bills Stay on Your Credit Report?
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Understanding the timeline for medical debt on credit reports and how recent changes protect consumers
            </p>
          </div>

          <div className="space-y-8">
            <Card className="p-6 md:p-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">The Traditional Rule: Seven Years</h2>
              <p className="text-foreground/90 mb-4">
                Under the Fair Credit Reporting Act (FCRA), most negative information, including medical collection accounts, can remain on a credit report for <strong>seven years from the date of the first delinquency</strong>. This has been the standard rule for decades, treating medical debt the same as other types of collections.
              </p>
              <p className="text-foreground/90">
                However, recent changes have significantly reduced how long medical bills actually stay on credit reports for most consumers, with some debts now removed much sooner or not appearing at all.
              </p>
            </Card>

            <Card className="p-6 md:p-8 bg-primary/5 border-primary/20">
              <h2 className="text-2xl font-bold text-foreground mb-4">Major Changes Since 2022-2023</h2>
              <p className="text-foreground/90 mb-6">
                The three major credit bureaus (Equifax, Experian, and TransUnion) implemented consumer-friendly changes that have removed approximately <strong>70% of medical debt</strong> from credit reports nationwide.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-foreground mb-2">Paid Medical Collections Removed Immediately</h3>
                    <p className="text-foreground/80">
                      Once you pay off a medical collection, it's automatically deleted from your credit report—no seven-year wait. This applies to collections of any amount, paid at any time.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-foreground mb-2">Medical Debts Under $500 Don't Appear</h3>
                    <p className="text-foreground/80">
                      Collections under $500 are excluded from credit reports entirely, regardless of whether they're paid or unpaid. Since the median medical collection is only $207, this helps millions of consumers.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-foreground mb-2">One-Year Grace Period Before Reporting</h3>
                    <p className="text-foreground/80">
                      Unpaid medical bills won't appear on your credit report until they've been in collections for at least one year. This gives you time to resolve insurance claims or set up payment plans.
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6 md:p-8">
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Calendar className="h-6 w-6 text-primary" />
                Timeline: From Medical Bill to Credit Report
              </h2>
              <div className="space-y-6">
                <div className="border-l-4 border-primary/20 pl-6">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-3 py-1 rounded-full bg-primary/10 text-primary font-bold text-sm">Day 1-30</span>
                    <h3 className="font-bold text-foreground">Bill Received</h3>
                  </div>
                  <p className="text-foreground/80">
                    You receive your medical bill. Payment typically due within 30 days. This is the best time to review for errors and set up payment plans if needed.
                  </p>
                </div>

                <div className="border-l-4 border-primary/20 pl-6">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-3 py-1 rounded-full bg-primary/10 text-primary font-bold text-sm">30-90 Days</span>
                    <h3 className="font-bold text-foreground">Reminder Phase</h3>
                  </div>
                  <p className="text-foreground/80">
                    Hospital sends multiple billing statements and phone calls. Still time to negotiate, dispute errors, or arrange payment plans. No credit impact yet.
                  </p>
                </div>

                <div className="border-l-4 border-destructive/20 pl-6">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-3 py-1 rounded-full bg-destructive/10 text-destructive font-bold text-sm">90-180 Days</span>
                    <h3 className="font-bold text-foreground">Sent to Collections</h3>
                  </div>
                  <p className="text-foreground/80">
                    Hospital may sell or assign debt to collection agency. Your account is now "in collections," but still not on your credit report. The one-year grace period starts here.
                  </p>
                </div>

                <div className="border-l-4 border-destructive/20 pl-6">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-3 py-1 rounded-full bg-destructive/10 text-destructive font-bold text-sm">1 Year</span>
                    <h3 className="font-bold text-foreground">May Appear on Credit Report</h3>
                  </div>
                  <p className="text-foreground/80">
                    If still unpaid and over $500, the debt may now appear on your credit report. This can drop your score by 50-100 points depending on your credit profile.
                  </p>
                </div>

                <div className="border-l-4 border-muted pl-6">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-3 py-1 rounded-full bg-muted text-foreground font-bold text-sm">7 Years</span>
                    <h3 className="font-bold text-foreground">Automatic Removal</h3>
                  </div>
                  <p className="text-foreground/80">
                    Even if unpaid, medical collections must be removed after seven years from the date of first delinquency. The account automatically drops off your report.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 md:p-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">When Does the Seven-Year Clock Start?</h2>
              <p className="text-foreground/90 mb-4">
                The seven-year countdown begins on the <strong>date of first delinquency</strong>—the date the bill was first due and not paid. This is important because:
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-foreground/80">
                    <strong>Clock doesn't restart:</strong> If your debt is sold to a different collector, the seven-year period does not restart. It always counts from the original delinquency date.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-foreground/80">
                    <strong>One-year grace period included:</strong> With the new one-year waiting period before reporting, a bill that becomes delinquent on January 1, 2025 won't appear until January 1, 2026, and will automatically drop off January 1, 2032.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-foreground/80">
                    <strong>Payment removes it sooner:</strong> Under the 2022 changes, paying the collection removes it immediately, eliminating the need to wait seven years.
                  </span>
                </li>
              </ul>
            </Card>

            <Card className="p-6 md:p-8 bg-muted/50">
              <h2 className="text-2xl font-bold text-foreground mb-4">State-Specific Protections</h2>
              <p className="text-foreground/90 mb-6">
                Some states offer even stronger protections beyond the federal rules:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-card rounded-lg border border-border">
                  <h3 className="font-bold text-foreground mb-2">New York (2023)</h3>
                  <p className="text-sm text-foreground/80">
                    Prohibits reporting medical debt under $500 and requires removal of paid medical collections
                  </p>
                </div>
                <div className="p-4 bg-card rounded-lg border border-border">
                  <h3 className="font-bold text-foreground mb-2">Colorado</h3>
                  <p className="text-sm text-foreground/80">
                    Regulates facility fees and requires transparency for out-of-network charges
                  </p>
                </div>
                <div className="p-4 bg-card rounded-lg border border-border">
                  <h3 className="font-bold text-foreground mb-2">Connecticut</h3>
                  <p className="text-sm text-foreground/80">
                    Requires hospitals to notify patients of facility fees before treatment
                  </p>
                </div>
                <div className="p-4 bg-card rounded-lg border border-border">
                  <h3 className="font-bold text-foreground mb-2">California</h3>
                  <p className="text-sm text-foreground/80">
                    Requires nonprofit hospitals to offer charity care and income-based assistance
                  </p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                Always check your state's specific medical debt protections for additional rights beyond federal law.
              </p>
            </Card>

            <Card className="p-6 md:p-8 border-destructive/20 bg-destructive/5">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-6 w-6 text-destructive mt-0.5 flex-shrink-0" />
                <div>
                  <h2 className="text-xl font-bold text-foreground mb-3">Watch Out for Re-Reporting Scams</h2>
                  <p className="text-foreground/80 mb-4">
                    Some unscrupulous debt buyers purchase old medical debt and attempt to "re-age" it by reporting it as a new collection. This is illegal under the FCRA.
                  </p>
                  <ul className="space-y-2 text-foreground/80">
                    <li>• Check your credit reports regularly for old debts reappearing</li>
                    <li>• Dispute any collection that's older than seven years</li>
                    <li>• Keep records of when debts originally became delinquent</li>
                    <li>• File complaints with the CFPB if collectors violate re-aging rules</li>
                  </ul>
                </div>
              </div>
            </Card>

            <Card className="p-6 md:p-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">How to Expedite Removal</h2>
              <ol className="space-y-4">
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center">1</span>
                  <div>
                    <h3 className="font-bold text-foreground mb-1">Pay the Collection</h3>
                    <p className="text-foreground/80">Once paid, the debt should be automatically removed. Send proof of payment to all three credit bureaus if it doesn't disappear within 30 days.</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center">2</span>
                  <div>
                    <h3 className="font-bold text-foreground mb-1">Dispute Inaccurate Debts</h3>
                    <p className="text-foreground/80">If the debt is incorrect, dispute it with the credit bureaus. They must investigate within 30 days and remove unverified debts.</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center">3</span>
                  <div>
                    <h3 className="font-bold text-foreground mb-1">Request Goodwill Deletion</h3>
                    <p className="text-foreground/80">After paying, write a goodwill letter to the original creditor asking them to remove the collection as a courtesy.</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center">4</span>
                  <div>
                    <h3 className="font-bold text-foreground mb-1">Negotiate Pay-for-Delete</h3>
                    <p className="text-foreground/80">Some collectors will agree to delete the entry in exchange for payment. Get this agreement in writing before paying.</p>
                  </div>
                </li>
              </ol>
            </Card>

            <Card className="p-6 md:p-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">Impact on Your Credit Score Over Time</h2>
              <div className="space-y-4">
                <p className="text-foreground/90">
                  If a medical collection does appear on your report, its impact diminishes over time:
                </p>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-destructive/5 rounded-lg border border-destructive/20">
                    <div className="text-3xl font-bold text-destructive mb-2">50-100</div>
                    <p className="text-sm font-semibold text-foreground mb-1">Points Lost (Year 1-2)</p>
                    <p className="text-xs text-muted-foreground">Maximum impact when first reported</p>
                  </div>
                  <div className="text-center p-4 bg-primary/5 rounded-lg border border-primary/20">
                    <div className="text-3xl font-bold text-primary mb-2">20-40</div>
                    <p className="text-sm font-semibold text-foreground mb-1">Points Lost (Year 3-5)</p>
                    <p className="text-xs text-muted-foreground">Impact lessens significantly</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg border border-border">
                    <div className="text-3xl font-bold text-foreground mb-2">5-15</div>
                    <p className="text-sm font-semibold text-foreground mb-1">Points Lost (Year 6-7)</p>
                    <p className="text-xs text-muted-foreground">Minimal impact before removal</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-4">
                  * Impact varies based on your overall credit profile. Consumers with excellent credit (720+) see the largest drops, while those with already-poor credit see smaller changes.
                </p>
              </div>
            </Card>

            <Card className="p-6 md:p-8 bg-primary/5 border-primary/20">
              <div className="flex items-start gap-3 mb-4">
                <FileText className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-3">Keep Detailed Records</h3>
                  <p className="text-foreground/90 mb-4">
                    Protecting yourself from medical debt on your credit report requires documentation:
                  </p>
                  <ul className="space-y-2 text-foreground/80">
                    <li>• Save all medical bills and itemized statements</li>
                    <li>• Keep insurance Explanation of Benefits (EOB) forms</li>
                    <li>• Document all payment confirmations and receipts</li>
                    <li>• Maintain correspondence with billing departments</li>
                    <li>• Take screenshots of online account balances showing $0</li>
                    <li>• Store certified mail receipts for dispute letters</li>
                  </ul>
                  <p className="text-sm text-muted-foreground mt-4">
                    You may need this evidence years later if a debt is incorrectly re-reported or if you need to prove a collection was paid.
                  </p>
                </div>
              </div>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-xl font-bold text-foreground mb-4">Related Resources</h3>
                <div className="space-y-3">
                  <Link to="/credit-report" className="block text-primary hover:underline">
                    → Medical Bills & Credit Reports: Complete Guide
                  </Link>
                  <Link to="/dispute-letter" className="block text-primary hover:underline">
                    → Download Dispute Letter Templates
                  </Link>
                  <Link to="/no-surprises-act" className="block text-primary hover:underline">
                    → Understanding the No Surprises Act
                  </Link>
                  <Link to="/blog/medical-debt-credit-report" className="block text-primary hover:underline">
                    → How Medical Debt Affects Your Credit Score
                  </Link>
                </div>
              </Card>

              <Card className="p-6 bg-primary/5 border-primary/20">
                <h3 className="text-xl font-bold text-foreground mb-4">Check Your Bill for Errors</h3>
                <p className="text-foreground/90 mb-6">
                  The best way to avoid medical debt on your credit report is to identify and dispute billing errors before they go to collections.
                </p>
                <Link to="/upload">
                  <Button size="lg" className="w-full">
                    Analyze Your Bill Now
                  </Button>
                </Link>
              </Card>
            </div>
          </div>
        </article>
      </main>
    </div>
  );
};

export default HowLongMedicalBills;
