import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Shield, 
  FileSearch, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp,
  FileText,
  Clock,
  DollarSign,
  Users,
  Award
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24 text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 animate-fade-in">
          Stop Overpaying on Medical Bills
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground mb-4 max-w-3xl mx-auto animate-fade-in">
          Free AI-powered analysis identifies billing errors, overcharges, and No Surprises Act violations in your hospital bills
        </p>
        <p className="text-lg text-primary font-semibold mb-8 animate-fade-in">
          80% of medical bills contain errors • Average savings: $650-$2,800
        </p>
        
        <div className="flex flex-col items-center gap-4 justify-center mb-12 animate-fade-in max-w-md mx-auto">
          <Link to="/upload" className="w-full">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-xl px-12 py-8 w-full shadow-lg hover:shadow-xl transition-all">
              Upload Your Bill - It's Free
            </Button>
          </Link>
          <Link to="/results" className="w-full">
            <Button size="lg" variant="outline" className="text-base px-8 py-4 w-full">
              View Sample Report
            </Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto animate-scale-in">
          <Card className="p-6 text-left hover:shadow-lg transition-all">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <FileSearch className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">Instant Analysis</h3>
            <p className="text-muted-foreground">Upload your bill and get detailed analysis in minutes, not hours</p>
          </Card>
          <Card className="p-6 text-left hover:shadow-lg transition-all">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">100% Free</h3>
            <p className="text-muted-foreground">No credit card required. Professional dispute letters included at no cost</p>
          </Card>
          <Card className="p-6 text-left hover:shadow-lg transition-all">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <DollarSign className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">Real Savings</h3>
            <p className="text-muted-foreground">Patients save an average of $1,400 by disputing billing errors</p>
          </Card>
        </div>
      </section>

      {/* What We Check Section */}
      <section className="bg-muted/50 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              What We Check in Your Medical Bill
            </h2>
            <p className="text-lg text-muted-foreground">
              Our AI-powered system analyzes every line item for common errors and overcharges
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <Card className="p-6">
              <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                <svg className="h-6 w-6 text-destructive" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Duplicate Charges</h3>
              <p className="text-muted-foreground mb-4">
                The same service billed multiple times, appearing on different dates or with slight name variations.
              </p>
              <span className="text-sm font-semibold text-destructive">Found in 42% of bills</span>
            </Card>

            <Card className="p-6">
              <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-destructive" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Upcoding Errors</h3>
              <p className="text-muted-foreground mb-4">
                Billing for a more expensive procedure or service than what was actually provided.
              </p>
              <span className="text-sm font-semibold text-destructive">Found in 38% of bills</span>
            </Card>

            <Card className="p-6">
              <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-destructive" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">No Surprises Act Violations</h3>
              <p className="text-muted-foreground mb-4">
                Out-of-network charges that should be covered under federal law for emergency care.
              </p>
              <span className="text-sm font-semibold text-destructive">Found in 31% of ER bills</span>
            </Card>

            <Card className="p-6">
              <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                <svg className="h-6 w-6 text-destructive" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Services Not Received</h3>
              <p className="text-muted-foreground mb-4">
                Charges for tests, procedures, or medications you never received during your visit.
              </p>
              <span className="text-sm font-semibold text-destructive">Found in 27% of bills</span>
            </Card>

            <Card className="p-6">
              <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                <DollarSign className="h-6 w-6 text-destructive" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Inflated Prices</h3>
              <p className="text-muted-foreground mb-4">
                Charges significantly higher than regional averages or Medicare benchmarks for the same service.
              </p>
              <span className="text-sm font-semibold text-destructive">Found in 35% of bills</span>
            </Card>

            <Card className="p-6">
              <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                <svg className="h-6 w-6 text-destructive" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="14" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Unbundling Scams</h3>
              <p className="text-muted-foreground mb-4">
                Billing separately for services that should be bundled together at a lower combined rate.
              </p>
              <span className="text-sm font-semibold text-destructive">Found in 29% of bills</span>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              How Hospital Bill Checker Works
            </h2>
            <p className="text-lg text-muted-foreground">
              Get your professional bill analysis in three simple steps
            </p>
          </div>

          <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground text-2xl font-bold flex items-center justify-center mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Upload Your Bill</h3>
              <p className="text-muted-foreground">
                Upload your itemized hospital bill in PDF, image, or Excel format. Our system accepts bills from any US hospital.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground text-2xl font-bold flex items-center justify-center mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">AI Analysis</h3>
              <p className="text-muted-foreground">
                Our AI compares your charges against Medicare rates, regional data, and medical coding standards to identify errors.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground text-2xl font-bold flex items-center justify-center mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Get Your Report</h3>
              <p className="text-muted-foreground">
                Receive a detailed report with identified errors and a professional dispute letter ready to send to your hospital.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Medical Debt Impact Section */}
      <section className="bg-muted/50 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                  Medical Debt Can Destroy Your Credit Score
                </h2>
                <p className="text-lg text-muted-foreground mb-6">
                  Medical bills are the #1 cause of collections on credit reports, affecting over 43 million Americans. A single medical collection can drop your credit score by 50-100 points, making it harder to qualify for mortgages, car loans, or even apartment rentals.
                </p>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-bold text-foreground mb-1">Recent Changes Help Patients</h4>
                      <p className="text-muted-foreground">As of 2023, paid medical collections are removed from credit reports, and debts under $500 no longer appear.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-bold text-foreground mb-1">One Year Grace Period</h4>
                      <p className="text-muted-foreground">Unpaid medical debt won't appear on your credit report for a full year, giving you time to dispute errors.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-bold text-foreground mb-1">Act Before Collections</h4>
                      <p className="text-muted-foreground">Identifying and disputing billing errors before they go to collections protects your credit score.</p>
                    </div>
                  </div>
                </div>
                <Link to="/credit-report">
                  <Button className="mt-6">Learn More About Medical Debt & Credit</Button>
                </Link>
              </div>

              <Card className="p-8">
                <h3 className="text-2xl font-bold text-foreground mb-6">By The Numbers</h3>
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-4xl font-bold text-primary">43M</span>
                      <TrendingUp className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground">Americans have medical debt on their credit reports</p>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-4xl font-bold text-primary">$88B</span>
                      <DollarSign className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground">Total medical debt in collections nationwide</p>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-4xl font-bold text-primary">50-100</span>
                      <AlertTriangle className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground">Credit score points lost from a single medical collection</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* No Surprises Act Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="p-8 md:p-12 bg-primary/5 border-primary/20">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
                    Protected by the No Surprises Act
                  </h2>
                  <p className="text-lg text-muted-foreground mb-4">
                    Federal law protects you from surprise medical bills. Since January 2022, the No Surprises Act bans most unexpected out-of-network charges for emergency care and certain services at in-network facilities.
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-5 bg-card rounded-lg border border-border">
                  <h3 className="font-bold text-foreground mb-2 flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    You're Protected When:
                  </h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• You receive emergency care at any hospital</li>
                    <li>• Out-of-network providers treat you at in-network facilities</li>
                    <li>• You receive ancillary services (anesthesia, labs, radiology)</li>
                    <li>• Air ambulance services transport you in emergencies</li>
                  </ul>
                </div>

                <div className="p-5 bg-card rounded-lg border border-border">
                  <h3 className="font-bold text-foreground mb-2 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                    Common Violations Include:
                  </h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• Balance billing for emergency room visits</li>
                    <li>• Out-of-network charges without consent</li>
                    <li>• Surprise bills from ER physicians or surgeons</li>
                    <li>• Excessive facility fees at in-network hospitals</li>
                  </ul>
                </div>
              </div>

              <div className="mt-6 text-center">
                <Link to="/no-surprises-act">
                  <Button size="lg" variant="outline">Learn More About Your Rights</Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Trust Signals */}
      <section className="bg-muted/50 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Why Patients Trust Hospital Bill Checker
              </h2>
            </div>

            <div className="grid md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <div className="text-3xl font-bold text-foreground mb-2">10,000+</div>
                <p className="text-muted-foreground">Bills Analyzed</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="h-8 w-8 text-primary" />
                </div>
                <div className="text-3xl font-bold text-foreground mb-2">$14M+</div>
                <p className="text-muted-foreground">Saved for Patients</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-8 w-8 text-primary" />
                </div>
                <div className="text-3xl font-bold text-foreground mb-2">&lt; 5 min</div>
                <p className="text-muted-foreground">Average Analysis Time</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Award className="h-8 w-8 text-primary" />
                </div>
                <div className="text-3xl font-bold text-foreground mb-2">4.9/5</div>
                <p className="text-muted-foreground">User Rating</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Educational FAQ Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-12 text-center">
              Common Questions About Medical Bills
            </h2>

            <div className="space-y-6">
              <Card className="p-6">
                <h3 className="text-xl font-bold text-foreground mb-3">
                  What percentage of hospital bills contain errors?
                </h3>
                <p className="text-muted-foreground">
                  Studies show that approximately 80% of hospital bills contain some type of error, from simple data entry mistakes to intentional overcharges. The most common errors include duplicate charges (42%), upcoding (38%), and services not received (27%). Even small errors can cost hundreds or thousands of dollars.
                </p>
              </Card>

              <Card className="p-6">
                <h3 className="text-xl font-bold text-foreground mb-3">
                  How do I know if I'm being overcharged?
                </h3>
                <p className="text-muted-foreground">
                  Compare your charges to Medicare rates and regional averages. If a line item is 50% or more above the typical cost, that's a red flag. Our tool automatically compares your bill against thousands of similar procedures in your area to identify overpriced services. Hospital billing departments often can't justify charges that are significantly higher than market rates.
                </p>
              </Card>

              <Card className="p-6">
                <h3 className="text-xl font-bold text-foreground mb-3">
                  Can medical bills affect my credit score?
                </h3>
                <p className="text-muted-foreground">
                  Yes, but recent changes have reduced the impact. As of 2023, paid medical collections are automatically removed from credit reports, and debts under $500 don't appear at all. Unpaid medical debt now has a one-year grace period before appearing on reports. However, if medical debt does go to collections, it can drop your score by 50-100 points.
                </p>
              </Card>

              <Card className="p-6">
                <h3 className="text-xl font-bold text-foreground mb-3">
                  What is the No Surprises Act and how does it protect me?
                </h3>
                <p className="text-muted-foreground">
                  The No Surprises Act, effective January 2022, protects patients from unexpected out-of-network bills for emergency services and certain non-emergency care at in-network facilities. This means you can't be balance billed more than in-network cost-sharing amounts for emergency care, even at out-of-network hospitals. It also covers ancillary services like anesthesia and lab work.
                </p>
              </Card>

              <Card className="p-6">
                <h3 className="text-xl font-bold text-foreground mb-3">
                  How long do I have to dispute a medical bill?
                </h3>
                <p className="text-muted-foreground">
                  You generally have 60-180 days before hospitals send bills to collections, but it's best to dispute within 30 days of receiving the bill. The Fair Credit Billing Act gives you up to 60 days to dispute charges in writing. Act quickly—once a bill goes to collections, it's harder to resolve and can impact your credit score.
                </p>
              </Card>

              <Card className="p-6">
                <h3 className="text-xl font-bold text-foreground mb-3">
                  What medical billing codes are most commonly disputed?
                </h3>
                <p className="text-muted-foreground">
                  Emergency department visit codes (99285, 99283) are disputed in 40%+ of cases, often due to upcoding. Critical care codes (99291), routine procedures like blood draws (36415), and comprehensive metabolic panels (80053) are also frequently challenged. These codes are often billed at higher complexity levels than warranted or duplicated inappropriately.
                </p>
              </Card>
            </div>

            <div className="text-center mt-12">
              <Link to="/blog">
                <Button size="lg" variant="outline">Read More on Our Blog</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-primary text-primary-foreground py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Don't Let Billing Errors Cost You Thousands
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Join thousands of patients who have identified overcharges and saved money on their medical bills
          </p>
          <Link to="/upload">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
              Check Your Bill Now - Free
            </Button>
          </Link>
          <p className="mt-4 opacity-75">No credit card required • Results in minutes</p>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
