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
        <h2 className="text-xl font-semibold">Conheça Seus Direitos</h2>
      </div>
      
      <p className="text-sm text-muted-foreground mb-6">
        Você tem direitos legais importantes quando se trata de cobranças médicas. 
        Aqui estão as proteções mais importantes:
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
              <strong>O que protege:</strong> Cobranças surpresa de provedores fora da rede em:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Serviços de emergência</li>
              <li>Provedores OON em hospitais in-network</li>
              <li>Transporte aéreo de ambulância</li>
            </ul>
            <p>
              <strong>Seu direito:</strong> Você só paga o valor in-network (copay/coinsurance/deductible).
            </p>
            <p>
              <strong>Ação:</strong> Se cobrado incorretamente, você tem 120 dias para registrar queixa no CMS.
            </p>
            <Button 
              variant="link" 
              size="sm" 
              className="p-0 h-auto"
              onClick={() => window.open('https://www.cms.gov/nosurprises/consumers', '_blank')}
            >
              Registrar queixa no CMS <ExternalLink className="h-3 w-3 ml-1" />
            </Button>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="dispute" className="border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-green-600" />
              <span className="font-medium">Direito de Contestar Cobranças</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="text-sm space-y-3 pt-2">
            <p>
              <strong>Você pode:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Solicitar conta itemizada detalhada (sempre gratuito)</li>
              <li>Questionar qualquer cobrança que pareça incorreta</li>
              <li>Pedir revisão interna antes de pagar</li>
              <li>Solicitar plano de pagamento ou desconto por dificuldade financeira</li>
            </ul>
            <p className="bg-yellow-50 dark:bg-yellow-950 p-3 rounded border border-yellow-200 dark:border-yellow-800">
              <strong>⚠️ Importante:</strong> NÃO pague até receber o EOB do seu seguro. 
              A conta inicial quase nunca é o valor final que você deve.
            </p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="fdcpa" className="border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-purple-600" />
              <span className="font-medium">Proteção Contra Cobradores</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="text-sm space-y-3 pt-2">
            <p>
              <strong>Fair Debt Collection Practices Act (FDCPA):</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Cobradores não podem assediar, ameaçar ou enganar você</li>
              <li>Você pode exigir prova da dívida por escrito</li>
              <li>Se a dívida for contestada, cobrança deve pausar</li>
              <li>Não podem enviar dívidas incorretas para collections</li>
            </ul>
            <p>
              <strong>Ação:</strong> Envie carta de validação de dívida dentro de 30 dias.
            </p>
            <Button 
              variant="link" 
              size="sm" 
              className="p-0 h-auto"
              onClick={() => window.open('https://www.consumerfinance.gov/complaint/', '_blank')}
            >
              Denunciar ao CFPB <ExternalLink className="h-3 w-3 ml-1" />
            </Button>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="records" className="border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-orange-600" />
              <span className="font-medium">Acesso a Registros Médicos</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="text-sm space-y-3 pt-2">
            <p>
              <strong>HIPAA Right of Access:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Você tem direito a cópias de seus registros médicos completos</li>
              <li>Hospital tem 30 dias para fornecer (pode estender por mais 30)</li>
              <li>Podem cobrar taxa razoável apenas por cópia/envio</li>
              <li>Útil para verificar se serviços cobrados foram realmente realizados</li>
            </ul>
            <p>
              <strong>Dica:</strong> Sempre solicite registros ao contestar "services not rendered"
            </p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="timeline" className="border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-red-600" />
              <span className="font-medium">Prazos Importantes</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="text-sm space-y-3 pt-2">
            <div className="space-y-3">
              <div className="border-l-4 border-red-500 pl-3">
                <p className="font-medium">120 dias</p>
                <p className="text-xs text-muted-foreground">
                  Para registrar queixa NSA no CMS após receber conta incorreta
                </p>
              </div>
              <div className="border-l-4 border-orange-500 pl-3">
                <p className="font-medium">30 dias</p>
                <p className="text-xs text-muted-foreground">
                  Para enviar carta de validação de dívida a coletor
                </p>
              </div>
              <div className="border-l-4 border-yellow-500 pl-3">
                <p className="font-medium">30 dias</p>
                <p className="text-xs text-muted-foreground">
                  Hospital deve responder sua contestação por escrito
                </p>
              </div>
              <div className="border-l-4 border-blue-500 pl-3">
                <p className="font-medium">Aguarde EOB</p>
                <p className="text-xs text-muted-foreground">
                  Não pague antes do seguro processar - pode levar 30-60 dias
                </p>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
};
