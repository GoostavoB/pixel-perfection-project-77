import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Terms = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="container mx-auto px-4 py-16 flex-grow">
        <article className="max-w-4xl mx-auto prose prose-slate">
          <h1 className="text-4xl font-bold text-foreground mb-2">Terms of Use</h1>
          <div className="text-muted-foreground mb-8">Last updated: 12 October 2025</div>
          
          <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg mb-8">
            <p className="text-foreground/90 m-0">
              Hospital Bill Checker provides educational information about U.S. medical bills. It does not provide medical, legal, insurance, or financial advice.
            </p>
          </div>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">1) Who we are</h2>
          <p className="text-foreground/80">
            Hospital Bill Checker is operated by [Company legal name], based in Barcelona, Spain. Contact:{" "}
            <a href="mailto:contact@hospitalbillchecker.com" className="text-primary hover:underline">
              contact@hospitalbillchecker.com
            </a>.
          </p>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">2) Acceptance</h2>
          <p className="text-foreground/80">
            By using hospitalbillchecker.com you accept these Terms and the{" "}
            <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
            Do not use the site if you disagree. You must tick the consent box on our upload form to use analysis features.
          </p>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">3) Educational use only</h2>
          <p className="text-foreground/80">
            All content, tools, and reports are for education and general information. Always consult a qualified professional before acting.
          </p>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">4) No medical or legal relationship</h2>
          <p className="text-foreground/80">
            Your use does not create a doctor–patient or attorney–client relationship. We do not practice medicine or law. We do not represent you in disputes.
          </p>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">5) Eligibility</h2>
          <p className="text-foreground/80">
            You must be at least 16 years old. Ages 16 to 18 should use the site with parental guidance.
          </p>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">6) Your responsibilities</h2>
          <ul className="list-disc pl-6 space-y-2 text-foreground/80">
            <li>Provide accurate information in uploads and forms.</li>
            <li>Use the site for lawful, personal, non-commercial purposes.</li>
            <li>Do not upload unlawful, defamatory, or infringing content.</li>
            <li>Do not bypass security or disrupt the service.</li>
          </ul>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">7) Your content and license</h2>
          <p className="text-foreground/80">
            You own your uploads. You grant us a non-exclusive, worldwide, royalty-free license to host, store, process, analyze, and display your uploads to operate the service, generate your report, maintain security, improve quality, and build de-identified statistical datasets. We do not sell personal data.
          </p>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">8) Research and database use</h2>
          <p className="text-foreground/80">
            We analyze de-identified data from uploaded bills to study pricing and common issues. We keep hospital name, hospital location, bill details, and the user's year of birth. We remove direct identifiers like full name, exact street address, phone, and full date of birth. Aggregated insights will not identify any person.
          </p>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">9) Intellectual property</h2>
          <p className="text-foreground/80">
            All software, text, graphics, reports, templates, and branding are owned by Hospital Bill Checker or its licensors. Do not copy, modify, distribute, scrape, or reverse engineer except as allowed by law.
          </p>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">10) Third-party services</h2>
          <p className="text-foreground/80">
            We use service providers for hosting, storage, analytics, email, AI processing, and security. We require appropriate data protection safeguards and Standard Contractual Clauses for international transfers where needed.
          </p>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">11) Security and data stewardship</h2>
          <p className="text-foreground/80">
            We use encryption in transit and at rest, access controls, logging, backups, and vulnerability management. You are responsible for using a secure device and strong passwords.
          </p>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">12) Disclaimers</h2>
          <ul className="list-disc pl-6 space-y-2 text-foreground/80">
            <li>Service is provided "as is" and "as available".</li>
            <li>No warranty of accuracy, completeness, or specific outcomes.</li>
            <li>You are responsible for your decisions.</li>
          </ul>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">13) Limitation of liability</h2>
          <p className="text-foreground/80">
            To the fullest extent allowed by law, Hospital Bill Checker and its owners and contractors are not liable for indirect, incidental, special, consequential, exemplary, or punitive damages. Total liability for any claim will not exceed the greater of 50 euros or the amount you paid in the 3 months before the claim.
          </p>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">14) Indemnification</h2>
          <p className="text-foreground/80">
            You agree to defend and hold us harmless from claims, losses, and costs arising from your use, your content, or your breach of these Terms.
          </p>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">15) No endorsement</h2>
          <p className="text-foreground/80">
            We are independent. We do not endorse hospitals, providers, or insurers. References to CPT, HCPCS, DRG, or public price-transparency data are for education and research.
          </p>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">16) DMCA notices</h2>
          <p className="text-foreground/80">
            Send copyright notices to{" "}
            <a href="mailto:contact@hospitalbillchecker.com" className="text-primary hover:underline">
              contact@hospitalbillchecker.com
            </a>{" "}
            with the work, the material claimed to infringe, your contact details, a good-faith statement, and your signature. We may remove material at our discretion.
          </p>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">17) Governing law and disputes</h2>
          <p className="text-foreground/80">
            EEA or UK residents: Spanish law governs; courts of Barcelona have exclusive jurisdiction, subject to mandatory consumer protections.
          </p>
          <p className="text-foreground/80">
            U.S. or other residents: binding individual arbitration under JAMS Rules in California or Delaware. No class actions. If arbitration is not enforceable, local consumer rights may apply.
          </p>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">18) Changes</h2>
          <p className="text-foreground/80">
            We may update these Terms. We will post the new date. Material changes may be notified by email or banner. Continued use means acceptance.
          </p>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">19) Contact</h2>
          <p className="text-foreground/80">
            Hospital Bill Checker • Email:{" "}
            <a href="mailto:contact@hospitalbillchecker.com" className="text-primary hover:underline">
              contact@hospitalbillchecker.com
            </a>{" "}
            • Controller: [Company legal name, full registered address].
          </p>
        </article>
      </main>

      <Footer />
    </div>
  );
};

export default Terms;
