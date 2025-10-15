import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Scale, ExternalLink, Shield, FileText, Clock } from "lucide-react";

export const KnowYourRights = () => {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Scale className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold">Know Your Rights</h2>
      </div>
      
      <p className="text-sm text-muted-foreground mb-6">
        You have important legal protections regarding medical billing. Here are the most relevant safeguards:
      </p>

      <Accordion type="single" collapsible className="space-y-2">
        <AccordionItem value="nsa" className="border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-blue-600" />
              <span className="font-medium">No Surprises Act (NSA)</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="text-sm space-y-3 pt-2">
            <p>
              <strong>What it protects:</strong> Surprise bills from out-of-network providers in:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Emergency services</li>
              <li>Out-of-network clinicians at in-network hospitals</li>
              <li>Air ambulance transport</li>
            </ul>
            <p>
              <strong>Your right:</strong> You only pay the in-network amount (copay/coinsurance/deductible).
            </p>
            <p>
              <strong>Action:</strong> If billed incorrectly, you have 120 days to file a complaint with CMS.
            </p>
            <Button 
              variant="link" 
              size="sm" 
              className="p-0 h-auto"
              onClick={() => window.open('https://www.cms.gov/nosurprises/consumers', '_blank')}
            >
              File a complaint with CMS <ExternalLink className="h-3 w-3 ml-1" />
            </Button>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="dispute" className="border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-green-600" />
              <span className="font-medium">Right to Dispute Charges</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="text-sm space-y-3 pt-2">
            <p>
              <strong>You can:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Request a detailed, itemized bill (always free)</li>
              <li>Challenge any charge that appears inaccurate</li>
              <li>Ask for an internal review before paying</li>
              <li>Request a payment plan or financial hardship discount</li>
            </ul>
            <p className="bg-yellow-50 dark:bg-yellow-950 p-3 rounded border border-yellow-200 dark:border-yellow-800">
              <strong>⚠️ Important:</strong> Do NOT pay until you receive your insurance EOB. The first bill is almost never the final amount owed.
            </p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="fdcpa" className="border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-purple-600" />
              <span className="font-medium">Protection from Debt Collectors</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="text-sm space-y-3 pt-2">
            <p>
              <strong>Fair Debt Collection Practices Act (FDCPA):</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Collectors cannot harass, threaten, or mislead you</li>
              <li>You can demand written proof of the debt</li>
              <li>If disputed, collection must pause</li>
              <li>They cannot report inaccurate debts to collections</li>
            </ul>
            <p>
              <strong>Action:</strong> Send a debt validation letter within 30 days.
            </p>
            <Button 
              variant="link" 
              size="sm" 
              className="p-0 h-auto"
              onClick={() => window.open('https://www.consumerfinance.gov/complaint/', '_blank')}
            >
              Report to CFPB <ExternalLink className="h-3 w-3 ml-1" />
            </Button>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="records" className="border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-orange-600" />
              <span className="font-medium">Access to Medical Records</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="text-sm space-y-3 pt-2">
            <p>
              <strong>HIPAA Right of Access:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>You have the right to copies of your complete medical records</li>
              <li>Hospitals have 30 days to provide (may extend by 30)</li>
              <li>They may charge a reasonable fee only for copying/shipping</li>
              <li>Useful to verify whether billed services were actually performed</li>
            </ul>
            <p>
              <strong>Tip:</strong> Always request records when disputing "services not rendered".
            </p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="timeline" className="border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-red-600" />
              <span className="font-medium">Important Timelines</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="text-sm space-y-3 pt-2">
            <div className="space-y-3">
              <div className="border-l-4 border-red-500 pl-3">
                <p className="font-medium">120 days</p>
                <p className="text-xs text-muted-foreground">
                  To file an NSA complaint with CMS after receiving an incorrect bill
                </p>
              </div>
              <div className="border-l-4 border-orange-500 pl-3">
                <p className="font-medium">30 days</p>
                <p className="text-xs text-muted-foreground">
                  To send a debt validation letter to a collector
                </p>
              </div>
              <div className="border-l-4 border-yellow-500 pl-3">
                <p className="font-medium">30 days</p>
                <p className="text-xs text-muted-foreground">
                  Hospital must respond to your dispute in writing
                </p>
              </div>
              <div className="border-l-4 border-blue-500 pl-3">
                <p className="font-medium">Wait for EOB</p>
                <p className="text-xs text-muted-foreground">
                  Do not pay before insurance processes — this can take 30–60 days
                </p>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
};