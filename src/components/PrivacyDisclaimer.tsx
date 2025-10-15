import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Lock, Eye, FileText, AlertTriangle } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const PrivacyDisclaimer = () => {
  return (
    <Card className="p-6 border-yellow-200 dark:border-yellow-800 bg-yellow-50/50 dark:bg-yellow-950/20">
      <div className="space-y-4">
        {/* Main Disclaimer */}
        <Alert className="border-yellow-300 dark:border-yellow-700">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-sm">
            <span className="font-semibold">Important Legal Notice:</span> This analysis is provided for educational and informational purposes only.
            It does not constitute legal, medical, or financial advice. Results are based on limited information and may not be fully accurate.
            We strongly recommend consulting a healthcare billing advocate, an attorney, or your insurance provider before taking any action. No savings or outcomes are guaranteed.
          </AlertDescription>
        </Alert>

        {/* Privacy & Security */}
        <Accordion type="single" collapsible className="border rounded-lg">
          <AccordionItem value="privacy" className="px-4">
            <AccordionTrigger className="hover:no-underline text-sm font-semibold">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-blue-600" />
                Your Data Privacy & Security
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-sm space-y-3 pt-2">
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <Lock className="h-4 w-4 mt-0.5 text-green-600" />
                  <div>
                    <p className="font-medium">End-to-End Encryption</p>
                    <p className="text-xs text-muted-foreground">
                      Your files and data are encrypted in transit and at rest
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Eye className="h-4 w-4 mt-0.5 text-blue-600" />
                  <div>
                    <p className="font-medium">Automatic Anonymization</p>
                    <p className="text-xs text-muted-foreground">
                      Personally identifiable information (PII) is anonymized in aggregate analyses
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <FileText className="h-4 w-4 mt-0.5 text-purple-600" />
                  <div>
                    <p className="font-medium">HIPAA-Aligned Practices</p>
                    <p className="text-xs text-muted-foreground">
                      We follow practices aligned with HIPAA to protect health information
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded p-3 mt-3">
                <p className="text-xs">
                  <span className="font-semibold">How We Use Your Data:</span>
                  <br />
                  • Medical billing analysis (primary purpose)
                  <br />
                  • Improving detection algorithms (anonymized data)
                  <br />
                  • Regional price benchmarking (aggregated, no PII)
                  <br />
                  <br />
                  <span className="font-semibold">We DO NOT share:</span> Your identifiable data is never sold or shared with third parties without your explicit consent.
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="retention" className="px-4">
            <AccordionTrigger className="hover:no-underline text-sm font-semibold">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-orange-600" />
                Data Retention & Deletion
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-sm space-y-2 pt-2">
              <p>
                <span className="font-medium">Retention Period:</span> Your documents and analyses are stored for 24 hours by default for non-authenticated accounts.
                Registered users may access previous analyses.
              </p>
              <p>
                <span className="font-medium">Right to Deletion:</span> You can request complete deletion of your data at any time by contacting us.
                We comply with GDPR, CCPA, and other applicable privacy regulations.
              </p>
              <div className="bg-muted/50 p-2 rounded mt-2">
                <p className="text-xs text-muted-foreground">
                  To request data deletion: contact@hospitalbillchecker.com
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="accuracy" className="px-4">
            <AccordionTrigger className="hover:no-underline text-sm font-semibold">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                Analysis Limitations & Accuracy
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-sm space-y-2 pt-2">
              <p className="font-medium">Our analysis may be limited by:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
                <li>Quality and completeness of provided documents</li>
                <li>Lack of full clinical context</li>
                <li>Regional variations in billing practices</li>
                <li>Specific contracts between providers and insurers</li>
                <li>AI algorithms may produce false positives/negatives</li>
              </ul>
              <p className="text-xs text-muted-foreground mt-2">
                <span className="font-semibold">Important:</span> Confidence scores (🟢 🟠 🔴) indicate certainty levels but do not replace professional review. Always verify critical findings with experts.
              </p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Hash Info */}
        <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded">
          <div className="flex items-start gap-2">
            <Lock className="h-3 w-3 mt-0.5" />
            <div>
              <p className="font-medium mb-1">Traceability & Integrity</p>
              <p>
                Each analysis receives a unique cryptographic hash to ensure data integrity and prevent tampering.
                This enables auditable tracking of all generated analyses.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};