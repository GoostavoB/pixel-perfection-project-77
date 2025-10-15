import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BookOpen, Info } from "lucide-react";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface GlossaryTerm {
  term: string;
  definition: string;
  example?: string;
}

const glossaryTerms: GlossaryTerm[] = [
  {
    term: "CPT Code",
    definition: "Current Procedural Terminology code — identifies each service or procedure performed",
    example: "CPT 99203 = New patient office visit (30–45 minutes)"
  },
  {
    term: "Billed Amount",
    definition: "Total amount charged by the hospital before any adjustments or insurance payments",
    example: "Hospital bills $1,000, but the final amount may be lower"
  },
  {
    term: "Allowed Amount",
    definition: "Maximum amount your insurer considers reasonable for the service",
    example: "Insurer allows $400 out of a $1,000 billed amount"
  },
  {
    term: "Patient Responsibility",
    definition: "Amount you must pay out of pocket after insurance processes the claim",
    example: "Copay + deductible + coinsurance = your share"
  },
  {
    term: "EOB",
    definition: "Explanation of Benefits — insurance document showing what was billed, paid, and what you owe",
    example: "Always wait for the EOB before paying a hospital bill"
  },
  {
    term: "Balance Billing",
    definition: "When an out-of-network provider bills the difference between what insurance paid and the total charge",
    example: "Doctor bills $600, insurance pays $150, doctor tries to bill you $450"
  },
  {
    term: "No Surprises Act (NSA)",
    definition: "Federal law that protects against surprise bills in emergencies and certain out-of-network situations",
    example: "Emergency or OON provider at an in-network hospital = protected"
  },
  {
    term: "Facility Fee",
    definition: "Charge by a hospital for use of its facilities and equipment",
    example: "Can be $500+ even for a simple outpatient visit"
  },
  {
    term: "Duplicate Billing",
    definition: "Common error where the same service is billed more than once",
    example: "Two identical lines: same date, same code, same amount"
  },
  {
    term: "Upcoding",
    definition: "Billing for a more expensive service than what was actually provided",
    example: "Charging a ‘complex’ visit when it was only ‘basic’"
  },
  {
    term: "Unbundling",
    definition: "Separating charges that should be billed together as one bundled code",
    example: "Charging X‑ray + technical fee separately when they should be a single code"
  },
  {
    term: "Deductible",
    definition: "Amount you pay before insurance starts to cover costs",
    example: "$1,000 deductible = you pay the first $1,000 of the year"
  },
  {
    term: "Coinsurance",
    definition: "Percentage you pay after meeting the deductible",
    example: "20% coinsurance = you pay $200 of a $1,000 bill"
  },
  {
    term: "Out-of-Network (OON)",
    definition: "Provider that does not have a contract with your insurer",
    example: "Higher costs and fewer protections with OON providers"
  }
];

export const MedicalGlossary = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <BookOpen className="h-4 w-4" />
          Medical Glossary
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Medical & Billing Terms Glossary</DialogTitle>
          <DialogDescription>
            Understand the most important terms to review your medical bill
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-4">
            {glossaryTerms.map((item, index) => (
              <div key={index} className="border-b pb-4 last:border-0">
                <h3 className="font-semibold text-sm mb-1 flex items-center gap-2">
                  {item.term}
                </h3>
                <p className="text-sm text-muted-foreground mb-2">
                  {item.definition}
                </p>
                {item.example && (
                  <div className="bg-muted/50 rounded p-2 mt-2">
                    <p className="text-xs text-muted-foreground">
                      <span className="font-medium">Example:</span> {item.example}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

interface GlossaryTooltipProps {
  term: string;
  children: React.ReactNode;
}

export const GlossaryTooltip = ({ term, children }: GlossaryTooltipProps) => {
  const glossaryItem = glossaryTerms.find(item => 
    item.term.toLowerCase() === term.toLowerCase()
  );

  if (!glossaryItem) return <>{children}</>;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="underline decoration-dotted cursor-help inline-flex items-center gap-1">
            {children}
            <Info className="h-3 w-3" />
          </span>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <div className="space-y-1">
            <p className="font-semibold text-sm">{glossaryItem.term}</p>
            <p className="text-xs">{glossaryItem.definition}</p>
            {glossaryItem.example && (
              <p className="text-xs text-muted-foreground mt-2">
                <span className="font-medium">Example:</span> {glossaryItem.example}
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
