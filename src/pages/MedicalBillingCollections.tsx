import { Users, Scale, FileCheck, Shield, AlertCircle, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import { Link } from "react-router-dom";

const MedicalBillingCollections = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-16">
        <article className="max-w-4xl mx-auto">
          <div className="text-center mb-12 animate-fade-in">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <FileCheck className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Medical Billing Collections Explained
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Understanding how medical bills move to collections, your legal rights, and strategies to protect yourself
            </p>
          </div>

          <div className="space-y-8">
            <Card className="p-6 md:p-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">How the Collections Process Works</h2>
              <p className="text-foreground/90 mb-6">
                Medical billing collections follow a specific timeline from initial billing to credit reporting. Understanding this process helps you intervene before bills damage your credit.
              </p>
              
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                    1
                  </div>
                  <div className="pt-2">
                    <h3 className="text-lg font-bold text-foreground mb-2">Billing and Insurance Claims</h3>
                    <p className="text-foreground/80">
                      After receiving services, providers submit claims to your insurer. Insurers adjust the bill according to negotiated rates and your coverage. Any remaining patient responsibility is billed to you directly.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                    2
                  </div>
                  <div className="pt-2">
                    <h3 className="text-lg font-bold text-foreground mb-2">In-House Billing Follow-Up</h3>
                    <p className="text-foreground/80">
                      Hospitals or physician practices typically bill patients directly for 60-180 days. During this period, you can negotiate payment plans or apply for financial assistance. <strong>This is your best opportunity to avoid collections.</strong>
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center font-bold text-destructive">
                    3
                  </div>
                  <div className="pt-2">
                    <h3 className="text-lg font-bold text-foreground mb-2">Assignment to Collection Agencies</h3>
                    <p className="text-foreground/80 mb-3">
                      If you don't pay, providers often sell or assign the debt to third-party collection agencies. Medical collections are highly fragmented and often involve small balances (median: $207).
                    </p>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm text-foreground/80">
                        <strong>Important:</strong> The debt may be sold multiple times to different collectors, but the seven-year credit reporting period doesn't restart with each sale.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center font-bold text-destructive">
                    4
                  </div>
                  <div className="pt-2">
                    <h3 className="text-lg font-bold text-foreground mb-2">Credit Reporting</h3>
                    <p className="text-foreground/80">
                      Since 2022, collectors must wait at least <strong>one year</strong> before reporting medical debt to credit bureaus. Collections under $500 or paid collections are generally not reported at all.
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6 md:p-8 bg-muted/50">
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Users className="h-6 w-6 text-primary" />
                Types of Collection Agencies
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="p-5 bg-card rounded-lg border border-border">
                  <h3 className="font-bold text-foreground mb-3">Hospital-Owned Collections</h3>
                  <p className="text-sm text-foreground/80 mb-3">
                    Some hospitals maintain internal collections departments (first-party collectors).
                  </p>
                  <ul className="space-y-1 text-xs text-muted-foreground">
                    <li>• May not report to credit bureaus</li>
                    <li>• More willing to negotiate</li>
                    <li>• Can offer charity care programs</li>
                  </ul>
                </div>

                <div className="p-5 bg-card rounded-lg border border-border">
                  <h3 className="font-bold text-foreground mb-3">Third-Party Collectors</h3>
                  <p className="text-sm text-foreground/80 mb-3">
                    Independent agencies contracted by providers, paid a percentage of amounts collected.
                  </p>
                  <ul className="space-y-1 text-xs text-muted-foreground">
                    <li>• Bound by FDCPA rules</li>
                    <li>• Cannot use abusive practices</li>
                    <li>• Must provide debt validation</li>
                  </ul>
                </div>

                <div className="p-5 bg-card rounded-lg border border-border">
                  <h3 className="font-bold text-foreground mb-3">Debt Buyers</h3>
                  <p className="text-sm text-foreground/80 mb-3">
                    Companies that purchase medical debt portfolios for pennies on the dollar.
                  </p>
                  <ul className="space-y-1 text-xs text-muted-foreground">
                    <li>• May lack original billing details</li>
                    <li>• Often can't substantiate debt</li>
                    <li>• Vulnerable to FDCPA violations</li>
                  </ul>
                </div>
              </div>
            </Card>

            <Card className="p-6 md:p-8 bg-primary/5 border-primary/20">
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Scale className="h-6 w-6 text-primary" />
                Your Legal Rights: FDCPA Protection
              </h2>
              <p className="text-foreground/90 mb-6">
                The Fair Debt Collection Practices Act (FDCPA) provides strong protection against abusive collection practices. In October 2024, the CFPB issued an advisory reminding collectors that it is illegal to collect medical debts that:
              </p>
              
              <div className="space-y-4">
                <div className="p-4 bg-card rounded-lg">
                  <h3 className="font-bold text-foreground mb-2 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-destructive" />
                    Prohibited Collections
                  </h3>
                  <ul className="space-y-2 text-foreground/80">
                    <li className="flex items-start gap-2">
                      <span className="text-destructive font-bold">✗</span>
                      <span>Have been paid or are not owed (insurance already paid, or you didn't receive the service)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-destructive font-bold">✗</span>
                      <span>Exceed federal or state limits, such as price caps under the No Surprises Act</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-destructive font-bold">✗</span>
                      <span>Are unsubstantiated or cannot be documented with proper billing records</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-destructive font-bold">✗</span>
                      <span>Misrepresent the obligation (suggesting a bill is final when insurance may still adjust it)</span>
                    </li>
                  </ul>
                </div>

                <div className="p-4 bg-card rounded-lg">
                  <h3 className="font-bold text-foreground mb-2 flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    Your Rights
                  </h3>
                  <ul className="space-y-2 text-foreground/80">
                    <li className="flex items-start gap-2">
                      <span className="text-primary font-bold">✓</span>
                      <span><strong>Validation of debt:</strong> Request written proof that the debt is legitimate and that you owe it</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary font-bold">✓</span>
                      <span><strong>Cease communication:</strong> Demand that collectors stop contacting you (in writing)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary font-bold">✓</span>
                      <span><strong>Dispute the debt:</strong> Challenge any debt you believe is incorrect or unverified</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary font-bold">✓</span>
                      <span><strong>Sue for violations:</strong> Collect damages if collectors violate FDCPA rules</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary font-bold">✓</span>
                      <span><strong>File complaints:</strong> Report violations to CFPB, FTC, or state attorney general</span>
                    </li>
                  </ul>
                </div>
              </div>
            </Card>

            <Card className="p-6 md:p-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">Who Is Most Affected?</h2>
              <p className="text-foreground/90 mb-6">
                Medical debt disproportionately impacts certain populations. According to the CFPB's 2024 advisory:
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-5 bg-muted/50 rounded-lg">
                  <h3 className="font-bold text-foreground mb-3">Demographics</h3>
                  <ul className="space-y-2 text-foreground/80">
                    <li>• Rural areas and underserved communities</li>
                    <li>• Older adults (ages 65+)</li>
                    <li>• Low-income families</li>
                    <li>• Communities of color</li>
                    <li>• Uninsured and underinsured individuals</li>
                  </ul>
                </div>
                <div className="p-5 bg-muted/50 rounded-lg">
                  <h3 className="font-bold text-foreground mb-3">Primary Causes</h3>
                  <ul className="space-y-2 text-foreground/80">
                    <li>• Emergency care (over 50% of cases)</li>
                    <li>• Acute care requiring hospitalization</li>
                    <li>• Insurance claim delays or denials</li>
                    <li>• High deductibles and cost-sharing</li>
                    <li>• Surprise billing and balance billing</li>
                  </ul>
                </div>
              </div>
            </Card>

            <Card className="p-6 md:p-8 bg-muted/50">
              <h2 className="text-2xl font-bold text-foreground mb-4">Payment and Settlement Strategies</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-3">1. Verify the Bill First</h3>
                  <p className="text-foreground/80 mb-3">
                    Before paying anything, request an itemized bill and compare it to your insurance Explanation of Benefits (EOB). Look for:
                  </p>
                  <ul className="grid md:grid-cols-2 gap-2 text-sm text-foreground/80">
                    <li>• Duplicate charges</li>
                    <li>• Services not received</li>
                    <li>• Upcoding errors</li>
                    <li>• Incorrect quantities</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-foreground mb-3">2. Negotiate with Providers Before Collections</h3>
                  <p className="text-foreground/80 mb-3">
                    While still with the hospital's billing office, you have more leverage:
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 bg-card rounded-lg">
                      <h4 className="font-semibold text-foreground mb-2">Financial Assistance</h4>
                      <p className="text-sm text-foreground/80">Many hospitals have charity care programs. Nonprofit hospitals are legally required to offer income-based assistance.</p>
                    </div>
                    <div className="p-4 bg-card rounded-lg">
                      <h4 className="font-semibold text-foreground mb-2">Payment Plans</h4>
                      <p className="text-sm text-foreground/80">Hospitals often offer interest-free payment plans. As long as you're making payments, bills won't go to collections.</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-foreground mb-3">3. Settle with Collectors</h3>
                  <p className="text-foreground/80 mb-3">
                    If the debt is with a collection agency:
                  </p>
                  <ul className="space-y-2 text-foreground/80">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                      <span><strong>Negotiate for less:</strong> Collectors often accept 30-70% of the balance as settlement</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                      <span><strong>Get it in writing:</strong> Obtain a written agreement before paying that states the debt will be paid in full</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                      <span><strong>Request deletion:</strong> Ask for "pay-for-delete" where the collector removes the entry from your credit report</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                      <span><strong>Never provide bank access:</strong> Send a check or money order; don't give collectors electronic access to your accounts</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-foreground mb-3">4. Avoid Collection Scams</h3>
                  <div className="p-4 bg-destructive/5 border border-destructive/20 rounded-lg">
                    <p className="text-foreground/80 mb-3">
                      Scammers pose as medical debt collectors. Verify that any collector is legitimate before paying:
                    </p>
                    <ul className="space-y-1 text-sm text-foreground/80">
                      <li>• Request written validation of the debt</li>
                      <li>• Verify the collector's license in your state</li>
                      <li>• Never pay with gift cards, wire transfers, or cryptocurrency</li>
                      <li>• Check if the original provider actually sent the debt to collections</li>
                    </ul>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6 md:p-8 border-primary/20 bg-primary/5">
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Shield className="h-6 w-6 text-primary" />
                Statute of Limitations
              </h2>
              <p className="text-foreground/90 mb-6">
                Medical debt lawsuits must be filed within your state's statute of limitations, which varies from 3-10 years (most commonly 3-6 years). After this period:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-card rounded-lg">
                  <h3 className="font-bold text-foreground mb-2">Collectors Cannot Sue</h3>
                  <p className="text-sm text-foreground/80">
                    The debt becomes "time-barred" and collectors lose the legal right to sue you for payment
                  </p>
                </div>
                <div className="p-4 bg-card rounded-lg">
                  <h3 className="font-bold text-foreground mb-2">They May Still Call</h3>
                  <p className="text-sm text-foreground/80">
                    Collectors can still attempt to collect informally, but you can demand they cease communication
                  </p>
                </div>
              </div>
              <div className="mt-4 p-4 bg-destructive/5 rounded-lg">
                <p className="text-sm text-foreground/80">
                  <strong>Warning:</strong> Making any payment or acknowledging the debt can restart the statute of limitations in some states. Consult an attorney before paying very old debts.
                </p>
              </div>
            </Card>

            <Card className="p-6 md:p-8">
              <h3 className="text-xl font-bold text-foreground mb-4">Protect Yourself From Collections</h3>
              <p className="text-foreground/90 mb-6">
                The best way to avoid medical billing collections is to identify and dispute billing errors before they're sent to collections. Use our free bill checker to analyze your charges.
              </p>
              <Link to="/upload">
                <Button size="lg" className="w-full sm:w-auto">
                  Check My Bill for Errors
                </Button>
              </Link>
            </Card>

            <div className="grid md:grid-cols-3 gap-4">
              <Link to="/credit-report" className="block">
                <Card className="p-5 hover:shadow-lg transition-all h-full">
                  <h4 className="font-bold text-foreground mb-2">Medical Debt & Credit</h4>
                  <p className="text-sm text-muted-foreground">How collections affect your credit score →</p>
                </Card>
              </Link>
              <Link to="/how-long-medical-bills" className="block">
                <Card className="p-5 hover:shadow-lg transition-all h-full">
                  <h4 className="font-bold text-foreground mb-2">How Long on Report</h4>
                  <p className="text-sm text-muted-foreground">Timeline for medical debt removal →</p>
                </Card>
              </Link>
              <Link to="/call-script" className="block">
                <Card className="p-5 hover:shadow-lg transition-all h-full">
                  <h4 className="font-bold text-foreground mb-2">Call Scripts</h4>
                  <p className="text-sm text-muted-foreground">How to negotiate with collectors →</p>
                </Card>
              </Link>
            </div>
          </div>
        </article>
      </main>
    </div>
  );
};

export default MedicalBillingCollections;
