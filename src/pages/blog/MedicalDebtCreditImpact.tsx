import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { ArrowLeft, TrendingDown, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Header from "@/components/Header";

const MedicalDebtCreditImpact = () => {
  return (
    <>
      <Helmet>
        <title>Medical Debt and Your Credit Report: What You Need to Know in 2025</title>
        <meta name="description" content="Understand how medical debt affects your credit score, from hospital bills to collections. Learn about FICO scoring, recent policy changes, and your consumer rights." />
        <meta name="keywords" content="medical debt credit score, medical bills credit report, FICO medical debt, credit scoring medical collections" />
        <link rel="canonical" href={window.location.href} />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />
        
        <article className="container mx-auto px-4 py-12 max-w-4xl">
          <Link to="/blog">
            <Button variant="ghost" size="sm" className="mb-6">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Blog
            </Button>
          </Link>

          <header className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Medical Debt and Your Credit Report: What You Need to Know
            </h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                7 min read
              </span>
              <span>•</span>
              <span>Updated October 2025</span>
            </div>
            <p className="text-lg text-muted-foreground">
              Medical debt is unique - no one plans to get sick or injured, yet unpaid medical bills are among the most common debts on Americans' credit reports. Here's everything you need to know about how medical debt impacts your credit score in 2025.
            </p>
          </header>

          <Separator className="my-8" />

          <section className="prose prose-lg max-w-none">
            <h2 className="text-3xl font-bold text-foreground mt-8 mb-4">How Medical Debt Impacts Your Credit Score</h2>
            
            <p>
              When a medical bill goes unpaid long enough to reach a collection agency, it can eventually be reported as a collection account on your credit report. However, credit scoring models have evolved to treat medical collections more leniently than other debts.
            </p>

            <Card className="p-6 my-6 bg-muted/30">
              <h3 className="text-xl font-semibold text-foreground mb-4">Older vs. Newer Scoring Models</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-warning" />
                    Traditional FICO 8
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Weighs medical collections like other debts</li>
                    <li>• Can drop score by dozens of points</li>
                    <li>• Paid collections still count negatively</li>
                    <li>• Used by many lenders currently</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-success" />
                    FICO 9/10 & VantageScore 4.0
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Ignores paid collections entirely</li>
                    <li>• Gives less weight to medical debt</li>
                    <li>• Smaller negative impact overall</li>
                    <li>• Becoming more common</li>
                  </ul>
                </div>
              </div>
            </Card>

            <h3 className="text-2xl font-semibold text-foreground mt-8 mb-3">Credit Score Impact in Numbers</h3>
            <p>
              The CFPB notes that removing medical collections could raise affected consumers' scores by an average of ~20 points. Conversely, a new medical collection could drop your score by a similar magnitude. The impact is higher if you had a good credit score to begin with.
            </p>

            <h2 className="text-3xl font-bold text-foreground mt-12 mb-4">Timeline: From Hospital Bill to Credit Report</h2>

            <Card className="p-6 my-6 border-l-4 border-l-primary">
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Day 0 – Medical Service</h4>
                  <p className="text-sm text-muted-foreground">You receive treatment. The full bill comes later. This is the best time to arrange payment plans if needed.</p>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="font-semibold text-foreground mb-1">3-6 Months – Follow-ups and Warnings</h4>
                  <p className="text-sm text-muted-foreground">Providers send follow-up bills and warnings. Nonprofit hospitals must wait 120 days before collections actions per IRS rules.</p>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="font-semibold text-foreground mb-1">6+ Months – Sent to Collections</h4>
                  <p className="text-sm text-muted-foreground">Debt assigned or sold to collection agency. However, they cannot report to credit bureaus yet.</p>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="font-semibold text-foreground mb-1">12 Months – Eligible for Credit Reporting</h4>
                  <p className="text-sm text-muted-foreground">After one year from service date, collection agencies can report the debt. Debts under $500 still won't appear.</p>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Beyond 1 Year – Credit Report Effects</h4>
                  <p className="text-sm text-muted-foreground">Collection can remain for up to 7 years from first delinquency. Pay it off and it should be removed within 1-2 months.</p>
                </div>
              </div>
            </Card>

            <h2 className="text-3xl font-bold text-foreground mt-12 mb-4">Recent Policy Changes That Help Consumers</h2>

            <div className="space-y-4 my-6">
              <Card className="p-5 bg-success/10 border-success/20">
                <h3 className="font-semibold text-foreground mb-2">✓ Paid Medical Debts No Longer Appear (July 2022)</h3>
                <p className="text-sm text-muted-foreground">
                  All three credit bureaus now remove medical collections that have been paid off, rather than leaving them on your report for years.
                </p>
              </Card>
              
              <Card className="p-5 bg-success/10 border-success/20">
                <h3 className="font-semibold text-foreground mb-2">✓ One-Year Waiting Period</h3>
                <p className="text-sm text-muted-foreground">
                  Collectors must wait 12 months from the date of service before reporting medical debt, up from 6 months previously.
                </p>
              </Card>
              
              <Card className="p-5 bg-success/10 border-success/20">
                <h3 className="font-semibold text-foreground mb-2">✓ Under $500 Rule (2023)</h3>
                <p className="text-sm text-muted-foreground">
                  Medical collection accounts under $500 are no longer reported. This change alone eliminated about half of all reported medical collections.
                </p>
              </Card>
              
              <Card className="p-5 bg-success/10 border-success/20">
                <h3 className="font-semibold text-foreground mb-2">✓ Scoring Model Adjustments</h3>
                <p className="text-sm text-muted-foreground">
                  FICO 9/10 and VantageScore 4.0 ignore paid collections and down-weight unpaid medical debt significantly.
                </p>
              </Card>
            </div>

            <h2 className="text-3xl font-bold text-foreground mt-12 mb-4">Why Medical Debt Is Treated Differently</h2>

            <p>Several factors make medical debt unique:</p>

            <div className="grid md:grid-cols-2 gap-4 my-6">
              <Card className="p-5">
                <h4 className="font-semibold text-foreground mb-2">Involuntary and Unpredictable</h4>
                <p className="text-sm text-muted-foreground">
                  Unlike loans or credit cards, you don't choose to "borrow" medical debt. It arises from accidents or illness before you know the cost.
                </p>
              </Card>
              
              <Card className="p-5">
                <h4 className="font-semibold text-foreground mb-2">Billing Complexity and Errors</h4>
                <p className="text-sm text-muted-foreground">
                  Medical billing is notoriously error-prone. The $1,000 collection might actually be erroneous due to insurance mistakes.
                </p>
              </Card>
              
              <Card className="p-5">
                <h4 className="font-semibold text-foreground mb-2">High Dispute Rates</h4>
                <p className="text-sm text-muted-foreground">
                  Medical collections have high dispute rates, making them less reliable credit information.
                </p>
              </Card>
              
              <Card className="p-5">
                <h4 className="font-semibold text-foreground mb-2">Limited Predictive Value</h4>
                <p className="text-sm text-muted-foreground">
                  CFPB research shows medical debt isn't a good predictor of whether someone will repay other loans.
                </p>
              </Card>
            </div>

            <h2 className="text-3xl font-bold text-foreground mt-12 mb-4">Tips for Protecting Your Credit</h2>

            <ul className="space-y-3 my-6">
              <li className="flex gap-3">
                <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-1" />
                <div>
                  <strong className="text-foreground">Communicate with Providers:</strong> Talk to hospitals about payment plans or hardship programs before bills go to collections.
                </div>
              </li>
              <li className="flex gap-3">
                <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-1" />
                <div>
                  <strong className="text-foreground">Leverage the 1-Year Grace Period:</strong> Use those 12 months to check for insurance errors or apply for charity care.
                </div>
              </li>
              <li className="flex gap-3">
                <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-1" />
                <div>
                  <strong className="text-foreground">Check Your Credit Reports:</strong> Review reports several times a year to catch medical collections early.
                </div>
              </li>
              <li className="flex gap-3">
                <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-1" />
                <div>
                  <strong className="text-foreground">Know Insurance Protections:</strong> The No Surprises Act prevents most out-of-network ER bills from becoming collections.
                </div>
              </li>
              <li className="flex gap-3">
                <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-1" />
                <div>
                  <strong className="text-foreground">Keep Documentation:</strong> Save payment confirmations and negotiation agreements.
                </div>
              </li>
            </ul>

            <h2 className="text-3xl font-bold text-foreground mt-12 mb-4">Frequently Asked Questions</h2>

            <div className="space-y-4 my-6">
              <Card className="p-6">
                <h4 className="font-semibold text-foreground mb-2">Will medical debt affect my ability to get a loan or mortgage?</h4>
                <p className="text-sm text-muted-foreground">
                  It can, but less than in the past. Many mortgage underwriters understand medical debt nuances and some programs ignore small medical collections. If your only negative is a medical collection, your score might still be relatively high under newer models. Pay off debts before applying for major loans to improve your chances.
                </p>
              </Card>

              <Card className="p-6">
                <h4 className="font-semibold text-foreground mb-2">What if I never received a bill and a medical debt shows up?</h4>
                <p className="text-sm text-muted-foreground">
                  This happens often. Contact the collection agency for debt validation. If valid, explain you never received the bill and offer to pay in exchange for removal. If something looks wrong, dispute it with credit bureaus. You have rights under the FDCPA.
                </p>
              </Card>

              <Card className="p-6">
                <h4 className="font-semibold text-foreground mb-2">Why is my sub-$500 medical debt still on my report?</h4>
                <p className="text-sm text-muted-foreground">
                  By policy (as of 2023), it shouldn't be. Pull your most recent credit reports and dispute it, citing the bureaus' under-$500 exclusion policy. The CFPB has confirmed these should be removed.
                </p>
              </Card>
            </div>

            <h2 className="text-3xl font-bold text-foreground mt-12 mb-4">Conclusion</h2>
            <p>
              Medical debt and credit reports have historically been a painful combination, but the landscape is improving dramatically. Key takeaways:
            </p>
            <ul className="list-disc pl-6 space-y-2 my-4">
              <li>Unpaid medical bills typically won't hit your credit for at least 12 months</li>
              <li>Paid or small medical collections aren't factored into modern credit scores</li>
              <li>If medical debt appears on your report, you can pay it (then it disappears) or dispute errors</li>
              <li>Your financial future shouldn't be derailed by medical emergencies</li>
            </ul>

            <Card className="p-6 my-8 bg-primary/10 border-primary/20">
              <div className="flex gap-3">
                <TrendingDown className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Take Action Now</h4>
                  <p className="text-sm text-muted-foreground">
                    Stay informed of your rights and proactive in addressing bills before they reach collections. With knowledge and action, you can ensure a health crisis doesn't turn into a long-term credit crisis.
                  </p>
                </div>
              </div>
            </Card>
          </section>

          <Separator className="my-12" />

          <div className="text-center">
            <h3 className="text-2xl font-bold text-foreground mb-4">Check Your Medical Bills for Errors</h3>
            <p className="text-muted-foreground mb-6">
              Our AI-powered analyzer identifies overcharges and billing mistakes that could save you thousands.
            </p>
            <Link to="/">
              <Button size="lg" className="bg-accent hover:bg-accent/90">
                Analyze Your Bill
              </Button>
            </Link>
          </div>
        </article>
      </div>
    </>
  );
};

export default MedicalDebtCreditImpact;