import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="container mx-auto px-4 py-16 flex-grow">
        <article className="max-w-4xl mx-auto prose prose-slate">
          <h1 className="text-4xl font-bold text-foreground mb-2">Privacy Policy</h1>
          <div className="text-muted-foreground mb-8">Last updated: 12 October 2025</div>
          
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg mb-8">
            <p className="text-foreground/90 m-0">
              We protect your data with encryption, strict access controls, and data minimization. We de-identify uploads before research. You can request deletion at any time.
            </p>
          </div>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">1) Scope</h2>
          <p className="text-foreground/80">
            This policy explains what we collect, why, how we use it, how we protect it, and your rights. We follow EU GDPR, UK GDPR, and applicable U.S. privacy laws such as the CCPA. We are not a HIPAA covered entity or business associate in most cases.
          </p>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">2) Controller and contact</h2>
          <p className="text-foreground/80">
            Controller: [Company legal name], Barcelona, Spain • Email:{" "}
            <a href="mailto:contact@hospitalbillchecker.com" className="text-primary hover:underline">
              contact@hospitalbillchecker.com
            </a>. You may lodge a complaint with the AEPD in Spain or your local authority.
          </p>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">3) Data we collect</h2>
          <ul className="list-disc pl-6 space-y-2 text-foreground/80">
            <li><strong>Contact data</strong>: name and email.</li>
            <li><strong>Uploads</strong>: medical bills and images you provide. These may include health information.</li>
            <li><strong>Demographics</strong>: year of birth only.</li>
            <li><strong>Derived and de-identified fields</strong>: codes, charges, payer status, hospital name, hospital location, and statistical labels we generate.</li>
            <li><strong>Technical data</strong>: IP, device, browser, pages viewed, and cookies.</li>
            <li><strong>Communications</strong>: support requests and email engagement.</li>
          </ul>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">4) Purposes and legal bases</h2>
          <ul className="list-disc pl-6 space-y-2 text-foreground/80">
            <li>Provide the service and generate your educational report. Legal bases: contract and consent.</li>
            <li>Process special category data in uploads. Legal basis: your explicit consent.</li>
            <li>Build de-identified statistical datasets, improve quality, and secure the service. Legal basis: legitimate interests balanced against your rights.</li>
            <li>Send service emails about your report and account. Legal basis: contract.</li>
            <li>Send follow-ups and promotions about premium features. Legal basis: consent in the EEA and UK, and opt-out rights where required in the U.S.</li>
            <li>Comply with legal obligations and respond to lawful requests. Legal basis: legal obligation.</li>
          </ul>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">5) Explicit consent</h2>
          <p className="text-foreground/80">
            Uploads may include health data. We process such data only with your explicit consent. You can withdraw consent at any time by emailing{" "}
            <a href="mailto:contact@hospitalbillchecker.com" className="text-primary hover:underline">
              contact@hospitalbillchecker.com
            </a>. Past processing remains lawful.
          </p>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">6) De-identification and aggregation</h2>
          <p className="text-foreground/80">
            Before research or benchmarking, we remove direct identifiers. Research datasets keep hospital name, hospital location, bill details, and year of birth only. We do not include full name, full date of birth, phone, email content, or street address. We apply measures to lower re-identification risk. Aggregated outputs will not identify any person.
          </p>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">7) Marketing</h2>
          <p className="text-foreground/80">
            If you opt in, we use your name and email to send updates and promotions about premium features. You can opt out at any time via the unsubscribe link or by emailing us. We do not sell personal information.
          </p>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">8) Cookies</h2>
          <p className="text-foreground/80">
            We use strictly necessary cookies to operate the site. With your consent, we use analytics cookies. Manage preferences in our cookie banner and your browser. Refusing non-essential cookies may limit features.
          </p>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">9) Sharing</h2>
          <p className="text-foreground/80">
            We share personal data with service providers for hosting, storage, analytics, email, AI processing, and security; with professional advisors and auditors under confidentiality; and with authorities when required by law. Providers act on our instructions only.
          </p>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">10) International transfers</h2>
          <p className="text-foreground/80">
            If data leaves the EEA or UK for a country without an adequacy decision, we use Standard Contractual Clauses and add safeguards as needed.
          </p>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">11) Security</h2>
          <ul className="list-disc pl-6 space-y-2 text-foreground/80">
            <li>HTTPS for all traffic.</li>
            <li>Encryption at rest for files and databases.</li>
            <li>Role-based access control on a need-to-know basis.</li>
            <li>Logging and audit of administrative access.</li>
            <li>Backups with secure storage and tested restoration.</li>
            <li>Vulnerability management and security updates.</li>
          </ul>
          <p className="text-foreground/80">
            No method is 100 percent secure, but we work to protect your information and reduce risk.
          </p>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">12) Retention</h2>
          <ul className="list-disc pl-6 space-y-2 text-foreground/80">
            <li>Uploads and raw files: 12 months after upload by default unless you delete earlier or ask us to retain longer for an active request.</li>
            <li>Generated reports and account metadata: 24 months after last activity.</li>
            <li>Marketing consent and opt-out records: as required by law.</li>
            <li>Legal holds or disputes: as required by law.</li>
          </ul>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">13) Your rights</h2>
          <p className="text-foreground/80">
            You can request access, correction, deletion, restriction, objection, and portability. We respond within one month where required by law. You can withdraw consent at any time.
          </p>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">14) California privacy rights</h2>
          <p className="text-foreground/80">
            California residents can request to know, access, delete, and correct personal information, and can opt out of sharing for cross-context behavioral advertising. We do not sell personal information for money.
          </p>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">15) Automated processing and human review</h2>
          <p className="text-foreground/80">
            We use AI to extract codes and generate an educational summary. You make final decisions. You can request human review of outputs that materially affect you.
          </p>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">16) Children</h2>
          <p className="text-foreground/80">
            The site is not for children under 16. If we learn we collected data from a child under 16 without consent, we will delete it.
          </p>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">17) Breach notification</h2>
          <p className="text-foreground/80">
            If a breach creates a risk to your rights and freedoms, we will notify you and regulators when required by law, including the U.S. FTC Health Breach Notification Rule where applicable.
          </p>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">18) Changes</h2>
          <p className="text-foreground/80">
            We will post updates here with a new date. For material changes, we may notify you by email or banner.
          </p>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">19) Contact</h2>
          <p className="text-foreground/80">
            Privacy requests and questions:{" "}
            <a href="mailto:contact@hospitalbillchecker.com" className="text-primary hover:underline">
              contact@hospitalbillchecker.com
            </a>
          </p>
        </article>
      </main>

      <Footer />
    </div>
  );
};

export default Privacy;
