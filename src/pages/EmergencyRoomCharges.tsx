import { Activity, DollarSign, TrendingUp, Building2, AlertCircle, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import { Link } from "react-router-dom";

const EmergencyRoomCharges = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-16">
        <article className="max-w-4xl mx-auto">
          <div className="text-center mb-12 animate-fade-in">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Activity className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Emergency Room Charges: Why They're So High
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Understanding the hidden costs, facility fees, and factors driving emergency department bills to record highs
            </p>
          </div>

          <div className="space-y-8">
            <Card className="p-6 md:p-8 bg-destructive/5 border-destructive/20">
              <div className="flex items-start gap-4">
                <AlertCircle className="h-8 w-8 text-destructive flex-shrink-0 mt-1" />
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-4">The Shocking Reality</h2>
                  <p className="text-lg text-foreground/90 mb-4">
                    Emergency room visits are among the most expensive healthcare encounters in America. What should cost a few hundred dollars often results in bills of <strong>$3,000 to $10,000</strong> or more—even for relatively minor conditions.
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 bg-card rounded-lg">
                      <div className="text-3xl font-bold text-destructive mb-2">$713</div>
                      <p className="text-sm text-foreground/80">Average ER facility fee in 2021 (up from $113 in 2004)</p>
                    </div>
                    <div className="p-4 bg-card rounded-lg">
                      <div className="text-3xl font-bold text-destructive mb-2">531%</div>
                      <p className="text-sm text-foreground/80">Increase in facility fees from 2004-2021</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6 md:p-8">
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Building2 className="h-6 w-6 text-primary" />
                Understanding the Two-Part Bill
              </h2>
              <p className="text-foreground/90 mb-6">
                Emergency department bills typically contain two main charges that patients often don't understand until after treatment:
              </p>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-6 bg-primary/5 rounded-lg border border-primary/20">
                  <h3 className="text-xl font-bold text-foreground mb-3">Professional Fees</h3>
                  <p className="text-foreground/80 mb-4">
                    Charged by the emergency room physicians, nurses, and other medical providers who treat you.
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-foreground/70">2004 Average:</span>
                      <span className="font-bold text-foreground">$138</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-foreground/70">2021 Average:</span>
                      <span className="font-bold text-primary">$321</span>
                    </div>
                    <div className="pt-2 border-t border-border">
                      <span className="text-sm font-semibold text-primary">132% increase</span>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-destructive/5 rounded-lg border border-destructive/20">
                  <h3 className="text-xl font-bold text-foreground mb-3">Facility Fees</h3>
                  <p className="text-foreground/80 mb-4">
                    Charged by the hospital for using their emergency department, completely separate from the doctor's charges.
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-foreground/70">2004 Average:</span>
                      <span className="font-bold text-foreground">$113</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-foreground/70">2021 Average:</span>
                      <span className="font-bold text-destructive">$713</span>
                    </div>
                    <div className="pt-2 border-t border-border">
                      <span className="text-sm font-semibold text-destructive">531% increase</span>
                    </div>
                  </div>
                </div>
              </div>

              <Card className="mt-6 p-5 bg-muted/50">
                <p className="text-sm text-foreground/80">
                  <strong>Why this matters:</strong> Facility fees now account for most of the growth in emergency room costs. They've increased nine times faster than professional fees for high-severity visits, and they're often not disclosed before treatment.
                </p>
              </Card>
            </Card>

            <Card className="p-6 md:p-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">What Are Facility Fees?</h2>
              <p className="text-foreground/90 mb-6">
                Facility fees are charges for access to the emergency department itself, separate from any treatment you receive. Hospitals claim these fees cover:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-primary mb-2" />
                  <h3 className="font-bold text-foreground mb-1">24/7 Operations</h3>
                  <p className="text-sm text-foreground/80">Maintaining round-the-clock staffing and emergency readiness</p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-primary mb-2" />
                  <h3 className="font-bold text-foreground mb-1">Specialized Equipment</h3>
                  <p className="text-sm text-foreground/80">MRI machines, CT scanners, trauma equipment, and more</p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-primary mb-2" />
                  <h3 className="font-bold text-foreground mb-1">Support Staff</h3>
                  <p className="text-sm text-foreground/80">Nurses, technicians, administrators, and security personnel</p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-primary mb-2" />
                  <h3 className="font-bold text-foreground mb-1">EMTALA Compliance</h3>
                  <p className="text-sm text-foreground/80">Legal requirement to treat everyone regardless of ability to pay</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 md:p-8 bg-muted/50">
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-destructive" />
                Why Facility Fees Have Exploded
              </h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-3">1. Upcoding to Higher Complexity Levels</h3>
                  <p className="text-foreground/90 mb-3">
                    The share of ER visits billed at the highest complexity level (Level 5) rose from <strong>5% in 2004 to 20% in 2021</strong>. Hospitals are coding more visits as "high severity" even when patient conditions haven't changed dramatically.
                  </p>
                  <div className="p-4 bg-card rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-foreground/70">Level 5 facility fees increased:</span>
                      <span className="text-2xl font-bold text-destructive">9x faster</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">than professional fees for the same visits</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-foreground mb-3">2. Hospital Consolidation</h3>
                  <p className="text-foreground/90 mb-3">
                    Large hospital systems have acquired independent physician practices and converted them to hospital-owned facilities. By 2024, <strong>55% of physicians work for hospitals</strong>, allowing those hospitals to charge facility fees for routine visits that previously had no such charge.
                  </p>
                  <ul className="space-y-2 text-foreground/80">
                    <li className="flex items-start gap-2">
                      <span className="text-destructive font-bold">•</span>
                      <span>Fewer independent providers = less competition and higher prices</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-destructive font-bold">•</span>
                      <span>Hospital systems gain negotiating power with insurers</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-destructive font-bold">•</span>
                      <span>Same service costs 2-3x more at hospital-owned facilities</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-foreground mb-3">3. Cost Shifting and Cross-Subsidization</h3>
                  <p className="text-foreground/90 mb-3">
                    Hospitals face massive underpayments from government programs and must make up the difference by charging commercially insured patients more:
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <Card className="p-4 bg-card">
                      <div className="text-3xl font-bold text-destructive mb-2">$100B</div>
                      <p className="text-sm text-foreground/80">Medicare/Medicaid shortfall in 2022 (paying only 82¢ per dollar of cost)</p>
                    </Card>
                    <Card className="p-4 bg-card">
                      <div className="text-3xl font-bold text-destructive mb-2">34-43%</div>
                      <p className="text-sm text-foreground/80">Below-cost reimbursement for behavioral health and burn care</p>
                    </Card>
                  </div>
                  <p className="text-sm text-muted-foreground mt-4">
                    When Medicare underpays, hospitals increase prices for privately insured patients to cover losses
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-foreground mb-3">4. Administrative Burdens</h3>
                  <p className="text-foreground/90 mb-3">
                    Hospitals spend billions dealing with insurance company bureaucracy:
                  </p>
                  <ul className="space-y-2">
                    <li className="flex justify-between items-center p-3 bg-card rounded">
                      <span className="text-foreground/80">Prior authorization costs</span>
                      <span className="font-bold text-destructive">$10B annually</span>
                    </li>
                    <li className="flex justify-between items-center p-3 bg-card rounded">
                      <span className="text-foreground/80">Appealing claim denials</span>
                      <span className="font-bold text-destructive">$20B annually</span>
                    </li>
                  </ul>
                  <p className="text-sm text-muted-foreground mt-3">
                    These administrative costs get passed to patients through higher facility fees
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-foreground mb-3">5. Rising Patient Deductibles</h3>
                  <p className="text-foreground/90">
                    As insurance deductibles increase, patients are responsible for a larger share of facility fees. Even when fees are "covered," patients with high-deductible plans pay the full amount out-of-pocket until meeting their deductible—often thousands of dollars.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 md:p-8 border-destructive/20 bg-destructive/5">
              <h2 className="text-2xl font-bold text-foreground mb-4">The Transparency Problem</h2>
              <p className="text-foreground/90 mb-6">
                One of the biggest issues with facility fees is that patients rarely know about them before treatment:
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-destructive mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-foreground mb-1">Not Disclosed Upfront</h3>
                    <p className="text-foreground/80">Most hospitals don't inform patients about facility fees before treatment, especially in emergency situations</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-destructive mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-foreground mb-1">Rates Not Public</h3>
                    <p className="text-foreground/80">Facility fee rates aren't publicly available, leading to massive price variations between hospitals</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-destructive mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-foreground mb-1">Often Not Covered by Insurance</h3>
                    <p className="text-foreground/80">Many insurance plans don't fully cover facility fees, leaving patients with surprise bills</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-destructive mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-foreground mb-1">Subjective Coding</h3>
                    <p className="text-foreground/80">Hospitals have wide discretion in determining "complexity levels," with financial incentive to upcode</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6 md:p-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">What You Can Do</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-sm">1</span>
                    Ask About Facility Fees Before Non-Emergency Treatment
                  </h3>
                  <p className="text-foreground/80 pl-11">
                    For scheduled procedures, ask if the provider charges a facility fee. Consider independent outpatient clinics for non-emergency care—they typically charge 50-70% less than hospital-owned facilities.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-sm">2</span>
                    Verify Network Status
                  </h3>
                  <p className="text-foreground/80 pl-11">
                    Under the No Surprises Act, you can't be balance billed for emergency care. However, verifying that the hospital and all providers (ER doctors, anesthesiologists, radiologists) are in-network prevents confusion.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-sm">3</span>
                    Request Itemized Bills
                  </h3>
                  <p className="text-foreground/80 pl-11">
                    Always ask for an itemized bill showing exactly what you're being charged for. Look for duplicate facility fees, inflated complexity codes, or services you didn't receive.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-sm">4</span>
                    Challenge Excessive Facility Fees
                  </h3>
                  <p className="text-foreground/80 pl-11">
                    If your facility fee seems unreasonably high, dispute it. Contact the hospital billing department and your insurance company. Cite regional averages and Medicare rates as benchmarks.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-sm">5</span>
                    Use Bill Checker to Identify Overcharges
                  </h3>
                  <p className="text-foreground/80 pl-11">
                    Our free tool compares your facility fees and complexity codes against regional data to identify potential overcharges and generate professional dispute letters.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 md:p-8 bg-primary/5 border-primary/20">
              <h3 className="text-xl font-bold text-foreground mb-4">Check Your ER Bill for Overcharges</h3>
              <p className="text-foreground/90 mb-6">
                Upload your emergency room bill to see if facility fees are inflated, complexity codes are upcoded, or charges violate the No Surprises Act. Get a detailed analysis in minutes.
              </p>
              <Link to="/upload">
                <Button size="lg" className="w-full sm:w-auto">
                  Analyze My ER Bill Now
                </Button>
              </Link>
            </Card>

            <div className="grid md:grid-cols-3 gap-4">
              <Link to="/no-surprises-act" className="block">
                <Card className="p-5 hover:shadow-lg transition-all h-full">
                  <h4 className="font-bold text-foreground mb-2">No Surprises Act</h4>
                  <p className="text-sm text-muted-foreground">Learn how federal law protects you from surprise ER bills →</p>
                </Card>
              </Link>
              <Link to="/disputed-codes" className="block">
                <Card className="p-5 hover:shadow-lg transition-all h-full">
                  <h4 className="font-bold text-foreground mb-2">Disputed Codes</h4>
                  <p className="text-sm text-muted-foreground">Common ER billing codes that are frequently challenged →</p>
                </Card>
              </Link>
              <Link to="/dispute-letter" className="block">
                <Card className="p-5 hover:shadow-lg transition-all h-full">
                  <h4 className="font-bold text-foreground mb-2">Dispute Letters</h4>
                  <p className="text-sm text-muted-foreground">Get templates to challenge excessive facility fees →</p>
                </Card>
              </Link>
            </div>
          </div>
        </article>
      </main>
    </div>
  );
};

export default EmergencyRoomCharges;
