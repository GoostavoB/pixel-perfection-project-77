import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { HelpCircle, DollarSign, MapPin, AlertTriangle, CheckCircle, Lightbulb } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CPTExplainerProps {
  cptCode: string;
  description: string;
  chargedAmount: number;
  category?: string;
}

interface ExplanationData {
  whatIsIt: string;
  whenApplicable: string;
  howToVerify: string;
  nationalAverage: string;
  stateAverage?: string;
  redFlags: string[];
  greenFlags: string[];
}

export const CPTExplainer = ({ cptCode, description, chargedAmount, category }: CPTExplainerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [explanation, setExplanation] = useState<ExplanationData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const generateExplanation = async () => {
    setIsLoading(true);
    try {
      // Call Lovable AI to generate contextual explanation
      const { data, error } = await supabase.functions.invoke('explain-cpt', {
        body: { 
          cptCode, 
          description, 
          chargedAmount,
          category 
        }
      });

      if (error) throw error;

      setExplanation(data.explanation);
    } catch (error) {
      console.error('Error generating explanation:', error);
      
      // Fallback to static explanation
      setExplanation({
        whatIsIt: `${description} (CPT ${cptCode}) é um código de procedimento médico usado para faturamento de serviços de saúde.`,
        whenApplicable: "Este código é aplicável quando o serviço específico descrito é realizado por um profissional de saúde qualificado durante um atendimento médico.",
        howToVerify: "Para verificar se este serviço foi realmente prestado, revise seus registros médicos (medical records), notas do médico, e ordens de procedimento. Você tem direito legal (HIPAA) de solicitar cópias completas destes documentos ao hospital.",
        nationalAverage: `A taxa média nacional para este código varia. Sua cobrança: $${chargedAmount.toFixed(2)}`,
        redFlags: [
          "Cobrado sem documentação nos registros médicos",
          "Quantidade incomum de unidades",
          "Cobrado em data diferente da consulta principal",
          "Valor significativamente acima da média regional"
        ],
        greenFlags: [
          "Código corresponde ao diagnóstico documentado",
          "Quantidade de unidades apropriada",
          "Preço dentro da faixa esperada para a região",
          "Provedor credenciado e in-network"
        ]
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpen = () => {
    if (!explanation) {
      generateExplanation();
    }
    setIsOpen(true);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-auto p-1 text-primary hover:text-primary/80"
          onClick={handleOpen}
        >
          <HelpCircle className="h-4 w-4" />
          <span className="sr-only">Explicar cobrança</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" />
            Explicação Detalhada da Cobrança
          </DialogTitle>
          <DialogDescription>
            Entenda o que é este código, quando é aplicável, e como verificar sua legitimidade
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="py-8 text-center text-muted-foreground">
            Analisando cobrança...
          </div>
        ) : explanation ? (
          <div className="space-y-6">
            {/* Header Info */}
            <div className="bg-muted/30 p-4 rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <Badge variant="outline" className="mb-2">CPT {cptCode}</Badge>
                  <h3 className="font-semibold text-lg">{description}</h3>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-2xl font-bold text-primary">
                    <DollarSign className="h-5 w-5" />
                    {chargedAmount.toFixed(2)}
                  </div>
                  <p className="text-xs text-muted-foreground">Valor cobrado</p>
                </div>
              </div>
              {category && (
                <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200">
                  {category}
                </Badge>
              )}
            </div>

            <Separator />

            {/* O que é */}
            <div>
              <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-xs font-bold text-primary">?</span>
                </div>
                O que é este código?
              </h4>
              <p className="text-sm text-muted-foreground pl-8">
                {explanation.whatIsIt}
              </p>
            </div>

            {/* Quando é aplicável */}
            <div>
              <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                </div>
                Quando é realmente aplicável?
              </h4>
              <p className="text-sm text-muted-foreground pl-8">
                {explanation.whenApplicable}
              </p>
            </div>

            {/* Como verificar */}
            <div>
              <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                Como saber se foi realmente feito?
              </h4>
              <p className="text-sm text-muted-foreground pl-8">
                {explanation.howToVerify}
              </p>
            </div>

            {/* Pricing */}
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-600" />
                Comparação de Preços
              </h4>
              <p className="text-sm text-muted-foreground mb-2">
                {explanation.nationalAverage}
              </p>
              {explanation.stateAverage && (
                <p className="text-xs text-muted-foreground">
                  Média estadual: {explanation.stateAverage}
                </p>
              )}
            </div>

            {/* Red Flags */}
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <h4 className="font-semibold text-sm mb-3 flex items-center gap-2 text-red-700 dark:text-red-300">
                <AlertTriangle className="w-4 h-4" />
                Sinais de Alerta (Red Flags)
              </h4>
              <ul className="space-y-2">
                {explanation.redFlags.map((flag, idx) => (
                  <li key={idx} className="text-sm flex items-start gap-2">
                    <span className="text-red-500 mt-0.5">⚠️</span>
                    <span className="text-muted-foreground">{flag}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Green Flags */}
            <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <h4 className="font-semibold text-sm mb-3 flex items-center gap-2 text-green-700 dark:text-green-300">
                <CheckCircle className="w-4 h-4" />
                Sinais Positivos (Green Flags)
              </h4>
              <ul className="space-y-2">
                {explanation.greenFlags.map((flag, idx) => (
                  <li key={idx} className="text-sm flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✅</span>
                    <span className="text-muted-foreground">{flag}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* What to do */}
            <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <p className="text-sm">
                <span className="font-semibold text-yellow-800 dark:text-yellow-200">
                  💡 O que fazer se suspeitar de erro:
                </span>
                <br />
                <span className="text-muted-foreground">
                  1. Solicite seus registros médicos completos (direito HIPAA)
                  <br />
                  2. Compare a cobrança com a documentação médica
                  <br />
                  3. Se houver discrepância, inclua na carta de contestação
                  <br />
                  4. Cite especificamente o código CPT e a razão da contestação
                </span>
              </p>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};
