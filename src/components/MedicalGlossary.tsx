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
    definition: "Código de Procedimento Médico - identifica cada serviço ou procedimento realizado",
    example: "CPT 99203 = Consulta de novo paciente (30-45 minutos)"
  },
  {
    term: "Billed Amount",
    definition: "Valor total cobrado pelo hospital antes de qualquer ajuste ou pagamento de seguro",
    example: "Hospital cobra $1,000, mas o valor final pode ser menor"
  },
  {
    term: "Allowed Amount",
    definition: "Valor máximo que seu seguro considera razoável para aquele serviço",
    example: "Seguro permite $400 de um total cobrado de $1,000"
  },
  {
    term: "Patient Responsibility",
    definition: "Valor que você deve pagar do próprio bolso após o seguro processar",
    example: "Copay + deductible + coinsurance = sua parte"
  },
  {
    term: "EOB",
    definition: "Explanation of Benefits - documento do seguro mostrando o que foi cobrado, pago e quanto você deve",
    example: "Sempre espere o EOB antes de pagar a conta do hospital"
  },
  {
    term: "Balance Billing",
    definition: "Quando um provedor fora da rede cobra a diferença entre o que o seguro pagou e o total cobrado",
    example: "Médico cobra $600, seguro paga $150, médico tenta cobrar $450 de você"
  },
  {
    term: "No Surprises Act (NSA)",
    definition: "Lei federal que protege contra cobranças surpresa em emergências e em certas situações com provedores fora da rede",
    example: "Emergência ou provedor OON em hospital in-network = protegido"
  },
  {
    term: "Facility Fee",
    definition: "Taxa cobrada pelo hospital por usar suas instalações e equipamentos",
    example: "Taxa pode ser $500+ mesmo para consulta ambulatorial simples"
  },
  {
    term: "Duplicate Billing",
    definition: "Erro comum onde o mesmo serviço é cobrado mais de uma vez",
    example: "Duas linhas idênticas: mesma data, mesmo código, mesmo valor"
  },
  {
    term: "Upcoding",
    definition: "Cobrar por um serviço mais caro do que o que foi realmente fornecido",
    example: "Cobrar consulta 'complexa' quando foi apenas 'básica'"
  },
  {
    term: "Unbundling",
    definition: "Separar cobranças que deveriam ser faturadas juntas como um pacote",
    example: "Cobrar raio-X + taxa técnica separadamente quando deveriam ser um único código"
  },
  {
    term: "Deductible",
    definition: "Valor que você paga antes do seguro começar a cobrir",
    example: "Deductible de $1,000 = você paga os primeiros $1,000 do ano"
  },
  {
    term: "Coinsurance",
    definition: "Percentual que você paga após atingir o deductible",
    example: "20% coinsurance = você paga $200 de uma conta de $1,000"
  },
  {
    term: "Out-of-Network (OON)",
    definition: "Provedor que não tem contrato com seu seguro",
    example: "Custos mais altos e menos proteções com provedores OON"
  }
];

export const MedicalGlossary = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <BookOpen className="h-4 w-4" />
          Glossário Médico
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Glossário de Termos Médicos e de Cobrança</DialogTitle>
          <DialogDescription>
            Entenda os termos mais importantes para revisar sua conta médica
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
                      <span className="font-medium">Exemplo:</span> {item.example}
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
                <span className="font-medium">Ex:</span> {glossaryItem.example}
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
