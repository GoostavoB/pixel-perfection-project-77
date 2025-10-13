import { Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileSearch } from "lucide-react";

const FAQ = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/20">
      <Helmet>
        <title>Medical Bills FAQ - Credit Reports, Collections & Billing Errors</title>
        <meta
          name="description"
          content="Complete FAQ guide on medical bills, credit reports, debt collections, billing errors, and healthcare costs. Expert answers to your medical billing questions."
        />
        <meta
          name="keywords"
          content="medical bills FAQ, credit report, medical debt, collections, billing errors, hospital charges, medical coding"
        />
        <link rel="canonical" href="https://billfixers.com/faq" />
      </Helmet>

      <Header />

      <main className="flex-grow container mx-auto px-4 py-12 max-w-5xl">
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Medical Bills & Credit Report FAQ
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Everything you need to know about medical debt, credit reports, billing errors, and protecting your rights as a patient.
          </p>
        </div>

        <Card className="p-6 md:p-8 mb-8 animate-fade-in">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-3">Need Help With Your Bill?</h2>
            <p className="text-muted-foreground mb-4">
              Upload your medical bill and we'll analyze it for errors and overcharges
            </p>
            <Link to="/">
              <Button size="lg" className="gap-2">
                <FileSearch className="h-5 w-5" />
                Check Your Bill Now
              </Button>
            </Link>
          </div>
        </Card>

        {/* Section 1: Medical Debt and Credit Reports */}
        <section className="mb-12 animate-fade-in">
          <h2 className="text-3xl font-bold text-foreground mb-6">
            Medical Debt and Credit Reports
          </h2>
          <Accordion type="single" collapsible className="space-y-2">
            <AccordionItem value="q1" className="border rounded-lg px-4 bg-card">
              <AccordionTrigger className="text-left hover:no-underline">
                <span className="font-semibold">How can I remove medical bills from my credit report?</span>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Check all three credit reports (Equifax, Experian, TransUnion). Dispute any errors directly with the bureau and the collection agency. Paid medical debts should be deleted automatically. Debts under $500 or less than one year old should not appear.{" "}
                <Link to="/blog/remove-medical-bills-credit" className="text-primary hover:underline">
                  Learn more about removing medical bills from your credit report
                </Link>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="q2" className="border rounded-lg px-4 bg-card">
              <AccordionTrigger className="text-left hover:no-underline">
                <span className="font-semibold">Do medical collections hurt my credit score?</span>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Yes, unpaid collections can lower your score by up to 100 points. However, under newer models like FICO 9 and VantageScore 4.0, paid medical debts are excluded.{" "}
                <Link to="/blog/medical-debt-credit-report" className="text-primary hover:underline">
                  Read about medical debt and your credit report
                </Link>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="q3" className="border rounded-lg px-4 bg-card">
              <AccordionTrigger className="text-left hover:no-underline">
                <span className="font-semibold">How long do medical bills stay on my credit report?</span>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Unpaid medical debts can stay for up to seven years from the date of delinquency. Paid or small debts under $500 should be removed early under the latest credit bureau policies.{" "}
                <Link to="/blog/how-long-medical-bills-stay" className="text-primary hover:underline">
                  Learn about medical bill credit report timelines
                </Link>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="q4" className="border rounded-lg px-4 bg-card">
              <AccordionTrigger className="text-left hover:no-underline">
                <span className="font-semibold">What laws protect consumers from medical debt on credit reports?</span>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                The Fair Credit Reporting Act (FCRA) and Fair Debt Collection Practices Act (FDCPA) protect you against inaccurate reporting and harassment. The No Surprises Act also limits out-of-network billing.{" "}
                <Link to="/blog/medical-debt-credit-report" className="text-primary hover:underline">
                  Understand your legal protections
                </Link>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="q5" className="border rounded-lg px-4 bg-card">
              <AccordionTrigger className="text-left hover:no-underline">
                <span className="font-semibold">How can I dispute a medical collection?</span>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Send a written dispute to both the credit bureau and the debt collector. Attach proof of payment, insurance correspondence, or billing errors. Bureaus have 30 days to investigate.{" "}
                <Link to="/blog/remove-medical-bills-credit" className="text-primary hover:underline">
                  Step-by-step dispute guide
                </Link>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="q6" className="border rounded-lg px-4 bg-card">
              <AccordionTrigger className="text-left hover:no-underline">
                <span className="font-semibold">Will paying a medical collection improve my score?</span>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Yes. Once the collection is marked paid or deleted, most scoring models will ignore it, causing your score to rise within a few months.{" "}
                <Link to="/blog/remove-medical-bills-credit" className="text-primary hover:underline">
                  Learn how paying collections affects your score
                </Link>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="q7" className="border rounded-lg px-4 bg-card">
              <AccordionTrigger className="text-left hover:no-underline">
                <span className="font-semibold">How do medical bills end up on your credit report?</span>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Hospitals or doctors may send unpaid accounts to collections after 60–180 days. Once a collection agency reports it, it appears on your credit file.{" "}
                <Link to="/blog/medical-billing-collections" className="text-primary hover:underline">
                  Medical billing collections explained
                </Link>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="q8" className="border rounded-lg px-4 bg-card">
              <AccordionTrigger className="text-left hover:no-underline">
                <span className="font-semibold">What's the best way to prevent medical debt from hurting my credit?</span>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Review bills early, confirm insurance coverage, and communicate with providers before collections. Ask about payment plans and charity programs.{" "}
                <Link to="/blog/medical-debt-credit-report" className="text-primary hover:underline">
                  Prevention strategies
                </Link>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="q9" className="border rounded-lg px-4 bg-card">
              <AccordionTrigger className="text-left hover:no-underline">
                <span className="font-semibold">What happens when you pay off medical collections?</span>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Once paid, they should be removed from all three credit bureaus. If not, send written proof of payment and request deletion.{" "}
                <Link to="/blog/remove-medical-bills-credit" className="text-primary hover:underline">
                  What to do after paying collections
                </Link>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="q10" className="border rounded-lg px-4 bg-card">
              <AccordionTrigger className="text-left hover:no-underline">
                <span className="font-semibold">Do hospitals report directly to credit bureaus?</span>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Usually not. They sell or transfer unpaid bills to third-party collection agencies, which then report to credit bureaus.{" "}
                <Link to="/blog/medical-billing-collections" className="text-primary hover:underline">
                  How the collection process works
                </Link>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>

        {/* Section 2: Collections, Billing Errors, and Disputes */}
        <section className="mb-12 animate-fade-in">
          <h2 className="text-3xl font-bold text-foreground mb-6">
            Collections, Billing Errors, and Disputes
          </h2>
          <Accordion type="single" collapsible className="space-y-2">
            <AccordionItem value="q11" className="border rounded-lg px-4 bg-card">
              <AccordionTrigger className="text-left hover:no-underline">
                <span className="font-semibold">What should I do when I receive a collections letter for a hospital bill?</span>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Request a written validation notice within 30 days. Check if your insurer covered the service, and verify that the bill isn't duplicated or incorrect.{" "}
                <Link to="/blog/medical-billing-collections" className="text-primary hover:underline">
                  Steps to protect yourself from collections
                </Link>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="q12" className="border rounded-lg px-4 bg-card">
              <AccordionTrigger className="text-left hover:no-underline">
                <span className="font-semibold">How can I protect myself from aggressive debt collectors?</span>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Know your rights under the FDCPA. Collectors can't threaten you or contact you at work. You can request all communication in writing.{" "}
                <Link to="/blog/medical-billing-collections" className="text-primary hover:underline">
                  Your rights against debt collectors
                </Link>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="q13" className="border rounded-lg px-4 bg-card">
              <AccordionTrigger className="text-left hover:no-underline">
                <span className="font-semibold">Can I negotiate or settle medical debt?</span>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Yes. Most agencies accept 20–50 percent settlements. Always get agreements in writing and ensure credit reports are updated to "paid" or deleted.{" "}
                <Link to="/blog/medical-billing-collections" className="text-primary hover:underline">
                  How to negotiate medical debt
                </Link>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="q14" className="border rounded-lg px-4 bg-card">
              <AccordionTrigger className="text-left hover:no-underline">
                <span className="font-semibold">What are the most common hospital billing errors?</span>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Double charges, wrong CPT codes, services not provided, and inaccurate insurance adjustments. Always request an itemized bill.{" "}
                <Link to="/disputed-codes" className="text-primary hover:underline">
                  Common disputed billing codes
                </Link>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="q15" className="border rounded-lg px-4 bg-card">
              <AccordionTrigger className="text-left hover:no-underline">
                <span className="font-semibold">How can I dispute an incorrect hospital bill?</span>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Request itemization, compare codes to your insurer's EOB, and submit a written dispute. Hospitals must respond before sending it to collections.{" "}
                <Link to="/dispute-letter" className="text-primary hover:underline">
                  Use our dispute letter template
                </Link>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="q16" className="border rounded-lg px-4 bg-card">
              <AccordionTrigger className="text-left hover:no-underline">
                <span className="font-semibold">What is a "balance bill"?</span>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                A balance bill is what you're charged when an out-of-network provider bills you the difference between their charge and what insurance paid. Many balance bills are now illegal under federal law.{" "}
                <Link to="/no-surprises-act" className="text-primary hover:underline">
                  Learn about the No Surprises Act
                </Link>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="q17" className="border rounded-lg px-4 bg-card">
              <AccordionTrigger className="text-left hover:no-underline">
                <span className="font-semibold">What is the No Surprises Act?</span>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                It's a federal law protecting patients from unexpected out-of-network bills for emergency and in-network hospital care. It limits charges to your in-network cost share.{" "}
                <Link to="/no-surprises-act" className="text-primary hover:underline">
                  Complete guide to the No Surprises Act
                </Link>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="q18" className="border rounded-lg px-4 bg-card">
              <AccordionTrigger className="text-left hover:no-underline">
                <span className="font-semibold">What should I do if my bill includes a balance charge?</span>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Check if it qualifies as a "surprise bill" under the No Surprises Act. Contact your insurer's help line to dispute it and request correction.{" "}
                <Link to="/no-surprises-act" className="text-primary hover:underline">
                  Understand balance billing protections
                </Link>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="q19" className="border rounded-lg px-4 bg-card">
              <AccordionTrigger className="text-left hover:no-underline">
                <span className="font-semibold">How do I get help paying medical collections?</span>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Ask about hospital hardship programs or state assistance. Nonprofit hospitals must offer charity care to eligible patients before collections.{" "}
                <Link to="/blog/medical-billing-collections" className="text-primary hover:underline">
                  Financial assistance options
                </Link>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="q20" className="border rounded-lg px-4 bg-card">
              <AccordionTrigger className="text-left hover:no-underline">
                <span className="font-semibold">Can I remove incorrect collections from my credit report?</span>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Yes. Dispute with the credit bureau and provide proof that the debt is wrong or resolved. They must remove it within 30 days if unverified.{" "}
                <Link to="/blog/remove-medical-bills-credit" className="text-primary hover:underline">
                  How to dispute collections
                </Link>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>

        {/* Section 3: Understanding and Managing Hospital Bills */}
        <section className="mb-12 animate-fade-in">
          <h2 className="text-3xl font-bold text-foreground mb-6">
            Understanding and Managing Hospital Bills
          </h2>
          <Accordion type="single" collapsible className="space-y-2">
            <AccordionItem value="q21" className="border rounded-lg px-4 bg-card">
              <AccordionTrigger className="text-left hover:no-underline">
                <span className="font-semibold">How can I read and understand my hospital bill?</span>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Start by identifying the service date, provider, CPT code, and insurance payments. Compare with your insurer's Explanation of Benefits (EOB).{" "}
                <Link to="/disputed-codes" className="text-primary hover:underline">
                  Learn about common billing codes
                </Link>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="q22" className="border rounded-lg px-4 bg-card">
              <AccordionTrigger className="text-left hover:no-underline">
                <span className="font-semibold">What are CPT and ICD codes on my bill?</span>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                CPT codes describe services or procedures. ICD-10 codes show the diagnosis. Errors in either can cause overcharges.{" "}
                <Link to="/disputed-codes" className="text-primary hover:underline">
                  See commonly disputed codes
                </Link>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="q23" className="border rounded-lg px-4 bg-card">
              <AccordionTrigger className="text-left hover:no-underline">
                <span className="font-semibold">How can I ask for an itemized hospital bill?</span>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Call or email the billing department and request a detailed list of all charges, including dates, supplies, and physician fees. Having an itemized bill is essential for disputing errors.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="q24" className="border rounded-lg px-4 bg-card">
              <AccordionTrigger className="text-left hover:no-underline">
                <span className="font-semibold">What is DRG in hospital billing?</span>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                DRG (Diagnosis Related Group) defines how hospitals are reimbursed for certain conditions. It's used in Medicare billing and can affect charges.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="q25" className="border rounded-lg px-4 bg-card">
              <AccordionTrigger className="text-left hover:no-underline">
                <span className="font-semibold">What's the best way to find coding mistakes in a hospital bill?</span>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Compare each CPT code to your actual services. Use the AMA's CPT code lookup or your insurer's online tool.{" "}
                <Link to="/" className="text-primary hover:underline">
                  Upload your bill for automated error checking
                </Link>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="q26" className="border rounded-lg px-4 bg-card">
              <AccordionTrigger className="text-left hover:no-underline">
                <span className="font-semibold">What is charity care or hospital financial assistance?</span>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                It's a program that reduces or eliminates bills for low-income patients. Nonprofit hospitals must offer it and disclose eligibility clearly.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="q27" className="border rounded-lg px-4 bg-card">
              <AccordionTrigger className="text-left hover:no-underline">
                <span className="font-semibold">How can I apply for hospital financial assistance?</span>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Ask the billing office for a charity care application. Provide proof of income, household size, and medical expenses. Most nonprofit hospitals are required by law to offer financial assistance programs.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="q28" className="border rounded-lg px-4 bg-card">
              <AccordionTrigger className="text-left hover:no-underline">
                <span className="font-semibold">How do payment plans for hospital bills work?</span>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Hospitals may offer 6–24 month interest-free plans or partner with third-party financing. Always confirm terms in writing and ensure they won't report to credit bureaus during the payment period.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="q29" className="border rounded-lg px-4 bg-card">
              <AccordionTrigger className="text-left hover:no-underline">
                <span className="font-semibold">What questions should I ask before starting a payment plan?</span>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Ask about total balance, interest rates, credit reporting policies, and whether payments will stop collections. Ensure all terms are documented in writing before agreeing.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="q30" className="border rounded-lg px-4 bg-card">
              <AccordionTrigger className="text-left hover:no-underline">
                <span className="font-semibold">What's the difference between hospital billing and insurance billing?</span>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Hospital billing requests payment from patients and insurers. Insurance coding uses standardized codes (CPT and ICD-10) to describe treatments and diagnoses for reimbursement purposes.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>

        {/* Section 4: Careers, Future, and Fraud */}
        <section className="mb-12 animate-fade-in">
          <h2 className="text-3xl font-bold text-foreground mb-6">
            Medical Billing Careers and Industry Trends
          </h2>
          <Accordion type="single" collapsible className="space-y-2">
            <AccordionItem value="q31" className="border rounded-lg px-4 bg-card">
              <AccordionTrigger className="text-left hover:no-underline">
                <span className="font-semibold">Is medical billing and coding a good career in 2025?</span>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Yes. Demand remains strong, with projected job growth of 8–9% through 2030. Remote roles are expanding as healthcare digitizes, offering more flexibility and opportunities.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="q32" className="border rounded-lg px-4 bg-card">
              <AccordionTrigger className="text-left hover:no-underline">
                <span className="font-semibold">How much does a medical coder make?</span>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                National median pay is around $48,000 annually, but experienced certified coders can earn $60,000–$75,000 depending on state, employer, and specialization.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="q33" className="border rounded-lg px-4 bg-card">
              <AccordionTrigger className="text-left hover:no-underline">
                <span className="font-semibold">What states pay medical coders the most?</span>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Top states include California, Massachusetts, and Washington, where salaries exceed $60,000. Rural states and areas with lower costs of living tend to pay less.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="q34" className="border rounded-lg px-4 bg-card">
              <AccordionTrigger className="text-left hover:no-underline">
                <span className="font-semibold">What skills are required for medical billing and coding jobs?</span>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Knowledge of CPT and ICD-10 codes, HIPAA compliance, data entry accuracy, attention to detail, and communication skills for working with insurers and healthcare providers.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="q35" className="border rounded-lg px-4 bg-card">
              <AccordionTrigger className="text-left hover:no-underline">
                <span className="font-semibold">How do I start a remote medical billing career?</span>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Earn certification (CPC, CCS, or CBCS), create a professional LinkedIn profile, and apply for remote jobs at healthcare networks, insurance companies, or medical billing outsourcing firms.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="q36" className="border rounded-lg px-4 bg-card">
              <AccordionTrigger className="text-left hover:no-underline">
                <span className="font-semibold">Are remote medical billing jobs legitimate?</span>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Yes, if offered by hospitals, insurance companies, or recognized billing firms. Avoid freelance ads requesting upfront fees or promising unrealistic income.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="q37" className="border rounded-lg px-4 bg-card">
              <AccordionTrigger className="text-left hover:no-underline">
                <span className="font-semibold">How is AI changing medical billing?</span>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Automation helps detect coding errors, verify insurance instantly, and predict claim denials. AI tools reduce human error and billing delays, making the process more efficient.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="q38" className="border rounded-lg px-4 bg-card">
              <AccordionTrigger className="text-left hover:no-underline">
                <span className="font-semibold">What are the risks of AI in medical billing?</span>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Data privacy concerns and overreliance on automation are key risks. Human oversight remains essential to prevent coding mistakes or compliance breaches.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="q39" className="border rounded-lg px-4 bg-card">
              <AccordionTrigger className="text-left hover:no-underline">
                <span className="font-semibold">What is medical billing fraud?</span>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                It's the intentional use of incorrect codes or false claims to get higher reimbursement. Common examples include upcoding (billing for more expensive services) and phantom billing (charging for services never provided).
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="q40" className="border rounded-lg px-4 bg-card">
              <AccordionTrigger className="text-left hover:no-underline">
                <span className="font-semibold">How can patients spot medical billing fraud?</span>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Review itemized bills for codes or services you never received. Check dates of service and compare them to your actual appointments. Report suspicious activity to your insurer or state attorney general.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>

        {/* Bottom CTA */}
        <Card className="p-8 text-center bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 animate-fade-in">
          <h2 className="text-2xl font-bold text-foreground mb-3">
            Still Have Questions About Your Medical Bill?
          </h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Upload your bill and get a detailed analysis of potential errors, overcharges, and billing discrepancies. Our tool checks for common mistakes and helps you understand what you're being charged.
          </p>
          <Link to="/">
            <Button size="lg" className="gap-2">
              <FileSearch className="h-5 w-5" />
              Analyze My Bill for Free
            </Button>
          </Link>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default FAQ;
