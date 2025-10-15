import { HelpCircle, BookOpen, AlertCircle } from "lucide-react";
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
import { Separator } from "@/components/ui/separator";

interface GlossaryEntry {
  term: string;
  definition: string;
  example?: string;
  whyItMatters?: string;
}

const glossaryEntries: GlossaryEntry[] = [
  {
    term: "CPT Code",
    definition: "Current Procedural Terminology codes are 5-digit numbers that identify specific medical services and procedures.",
    example: "99213 = Office visit with your doctor, 80053 = Comprehensive metabolic panel (blood test), 70450 = CT scan of head",
    whyItMatters: "Without CPT codes, you can't verify if you're being charged fairly or being billed for services you never received. Hospitals sometimes use vague descriptions to hide overcharges."
  },
  {
    term: "Duplicate Charge",
    definition: "When the same service is billed multiple times, either by accident or intentionally.",
    example: "You get one chest X-ray, but the bill shows it twice on the same day for $380 each = $760 total. You should only pay $380.",
    whyItMatters: "Duplicate charges are the #1 most common billing error, appearing in 30-40% of hospital bills. They're easy to miss if you don't check carefully."
  },
  {
    term: "Unbundling",
    definition: "Charging separately for services that should be billed together as a package (like charging for a burger, fries, and drink separately instead of as a combo meal).",
    example: "A blood test panel (CPT 80053) includes 14 tests for $50. Unbundling charges you $10 each for all 14 tests separately = $140 instead of $50.",
    whyItMatters: "Unbundling is a form of fraud that inflates your bill by 200-400%. It's illegal under Medicare rules but common in hospital billing."
  },
  {
    term: "No Surprises Act (NSA)",
    definition: "Federal law from 2022 that protects you from surprise medical bills when you get emergency care or see an out-of-network doctor at an in-network hospital.",
    example: "You go to an in-network hospital for surgery, but the anesthesiologist is out-of-network. Before NSA, they could bill you $10,000 extra. Now, they can't - you only pay your in-network cost-share.",
    whyItMatters: "NSA violations can save you thousands of dollars. Many hospitals still send illegal balance bills because they hope you won't know your rights."
  },
  {
    term: "Balance Billing",
    definition: "When an out-of-network provider bills you for the difference between what they charge and what your insurance pays.",
    example: "Doctor charges $1,000, insurance pays $600, doctor bills YOU the remaining $400. That $400 is a balance bill.",
    whyItMatters: "Balance billing is now illegal in many situations thanks to the No Surprises Act. If you're protected, you can dispute these charges and get them removed."
  },
  {
    term: "Medicare Benchmark",
    definition: "The standard price that Medicare (government insurance for seniors) pays for medical services. Used as a reference for fair pricing.",
    example: "Medicare pays $1,200 for an appendectomy. Hospitals typically charge 2-3× Medicare ($2,400-$3,600). If you're charged $5,400, that's excessive.",
    whyItMatters: "Medicare rates are publicly available and represent a fair baseline. Hospitals charging 5× or 10× Medicare rates are overcharging you."
  },
  {
    term: "Itemized Bill",
    definition: "A detailed bill that lists every service, procedure, medication, and supply with specific codes, quantities, dates, and prices.",
    example: "Instead of 'Pharmacy: $50,000', an itemized bill shows: '2025-05-12, Tylenol 500mg, 2 tablets, $15' for each medication.",
    whyItMatters: "You have a legal right to an itemized bill. Without it, you cannot verify charges, spot duplicates, or compare to fair prices. Hospitals hide errors in vague aggregate bills."
  },
  {
    term: "Upcoding",
    definition: "Billing for a more expensive service than what was actually provided.",
    example: "You visit the ER with a minor cut (Level 2 = $450), but they bill it as a major emergency (Level 5 = $2,500). That's upcoding - charging $2,050 more than deserved.",
    whyItMatters: "Upcoding is fraud that costs you money. Emergency room upcoding is especially common - 25% of ER visits are billed at inflated levels."
  },
  {
    term: "Revenue Code",
    definition: "3 or 4-digit codes used by hospitals to categorize charges (like 0250 = Pharmacy, 0450 = Emergency Room, 0120 = Room & Board).",
    example: "0636 = Drugs, 0730 = EKG/ECG, 0940 = Other Radiology",
    whyItMatters: "Revenue codes help you understand what department charged you, but they're not specific enough - you still need CPT codes to verify exact services."
  },
  {
    term: "EOB (Explanation of Benefits)",
    definition: "A statement from your insurance showing what they paid, what they denied, and what you owe.",
    example: "EOB shows: Billed $5,000, Insurance Allowed $2,000, Insurance Paid $1,600, You Owe $400 (your deductible/copay).",
    whyItMatters: "NEVER pay a hospital bill before getting your EOB! The hospital bill shows their charges, but your EOB shows what you ACTUALLY owe after insurance."
  }
];

export const MedicalBillingGlossary = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <BookOpen className="h-4 w-4" />
          Medical Billing 101
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            Medical Billing 101: Terms You Need to Know
          </DialogTitle>
          <DialogDescription>
            Understanding these terms will help you catch billing errors and save money
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-6">
            {glossaryEntries.map((entry, index) => (
              <div key={index} className="space-y-2">
                <h3 className="font-bold text-lg text-foreground">{entry.term}</h3>
                <p className="text-sm text-muted-foreground">{entry.definition}</p>
                
                {entry.example && (
                  <div className="bg-primary/5 border-l-4 border-primary p-3 rounded">
                    <p className="text-sm">
                      <strong className="text-primary">Example:</strong> {entry.example}
                    </p>
                  </div>
                )}
                
                {entry.whyItMatters && (
                  <div className="bg-warning/10 border-l-4 border-warning p-3 rounded">
                    <p className="text-sm">
                      <strong className="text-warning flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        Why This Matters:
                      </strong> {entry.whyItMatters}
                    </p>
                  </div>
                )}
                
                {index < glossaryEntries.length - 1 && <Separator className="mt-4" />}
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
