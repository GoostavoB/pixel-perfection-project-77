import { Link } from "react-router-dom";
import { ArrowLeft, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Header from "@/components/Header";

const MedicalDebtCreditReport = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <article className="container mx-auto px-4 py-16 max-w-4xl">
        <Link to="/blog">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blog
          </Button>
        </Link>

        <header className="mb-8">
          <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-primary/10 text-primary mb-4">
            Credit & Debt
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            How Medical Debt Affects Your Credit Report
          </h1>
          <div className="flex items-center gap-4 text-muted-foreground">
            <time>October 10, 2025</time>
            <span>•</span>
            <span>5 min read</span>
          </div>
        </header>

        <div className="prose prose-lg max-w-none">
          <p className="text-lg text-muted-foreground mb-6">
            Medical debt is one of the most common types of debt affecting Americans' credit scores. Understanding how it impacts your credit report and what rights you have is crucial for protecting your financial health.
          </p>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">
            Recent Changes to Medical Debt Reporting
          </h2>
          <p className="text-foreground/90 mb-4">
            As of 2023, the three major credit bureaus (Equifax, Experian, and TransUnion) have implemented significant changes to how medical debt appears on credit reports:
          </p>

          <Card className="p-6 mb-6 bg-primary/5 border-primary/20">
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-foreground/90">Paid medical collection debt no longer appears on credit reports</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-foreground/90">Medical debts under $500 are not reported</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-foreground/90">One-year waiting period before unpaid medical debt appears (previously 6 months)</span>
              </li>
            </ul>
          </Card>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">
            How Medical Collections Impact Your Score
          </h2>
          <p className="text-foreground/90 mb-4">
            When medical debt does appear on your credit report, it can significantly impact your credit score:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li className="text-foreground/90">A single medical collection can drop your score by 50-100 points</li>
            <li className="text-foreground/90">The impact lessens over time but can remain for up to 7 years</li>
            <li className="text-foreground/90">Multiple collections compound the negative effect</li>
            <li className="text-foreground/90">Newer credit scoring models weigh medical debt less than other types</li>
          </ul>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">
            Protecting Yourself from Medical Debt Collections
          </h2>
          
          <div className="space-y-4 mb-6">
            <Card className="p-5">
              <h3 className="font-bold text-foreground mb-2">1. Review Your Bills Carefully</h3>
              <p className="text-foreground/80">
                Up to 80% of medical bills contain errors. Use tools like Hospital Bill Checker to identify overcharges before they go to collections.
              </p>
            </Card>

            <Card className="p-5">
              <h3 className="font-bold text-foreground mb-2">2. Negotiate Payment Plans</h3>
              <p className="text-foreground/80">
                Most hospitals offer interest-free payment plans. Setting up a plan prevents bills from going to collections.
              </p>
            </Card>

            <Card className="p-5">
              <h3 className="font-bold text-foreground mb-2">3. Dispute Inaccurate Charges</h3>
              <p className="text-foreground/80">
                If you identify errors, dispute them immediately in writing. Keep all documentation and follow up regularly.
              </p>
            </Card>

            <Card className="p-5">
              <h3 className="font-bold text-foreground mb-2">4. Request Itemized Bills</h3>
              <p className="text-foreground/80">
                Always ask for a detailed, itemized bill. This makes it easier to spot duplicate charges and services you didn't receive.
              </p>
            </Card>
          </div>

          <Card className="p-6 mb-6 bg-destructive/5 border-destructive/20">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-foreground mb-2">Important Notice</h3>
                <p className="text-foreground/80">
                  Never ignore medical bills. Even if you can't pay immediately, contact the billing department to discuss your options. Ignoring bills accelerates the path to collections.
                </p>
              </div>
            </div>
          </Card>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">
            What to Do If Medical Debt Is Already on Your Report
          </h2>
          <ol className="list-decimal pl-6 space-y-3 mb-6">
            <li className="text-foreground/90">
              <strong>Verify the debt is legitimate</strong> - Request validation from the collection agency
            </li>
            <li className="text-foreground/90">
              <strong>Check for errors</strong> - Compare the collection amount with your original bills
            </li>
            <li className="text-foreground/90">
              <strong>Negotiate a pay-for-delete</strong> - Some collectors will remove the entry if you pay
            </li>
            <li className="text-foreground/90">
              <strong>Dispute inaccuracies</strong> - File disputes with credit bureaus if information is wrong
            </li>
            <li className="text-foreground/90">
              <strong>Consider goodwill deletion</strong> - After paying, write a goodwill letter requesting removal
            </li>
          </ol>

          <Card className="p-6 bg-primary/5 border-primary/20">
            <h3 className="font-bold text-foreground mb-3">Take Action Today</h3>
            <p className="text-foreground/80 mb-4">
              Don't wait for medical bills to go to collections. Upload your medical bill now for a free analysis and identify potential overcharges before they affect your credit.
            </p>
            <Link to="/upload">
              <Button size="lg" className="w-full sm:w-auto">
                Check Your Bill Now
              </Button>
            </Link>
          </Card>
        </div>
      </article>
    </div>
  );
};

export default MedicalDebtCreditReport;
