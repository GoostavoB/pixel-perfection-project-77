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
            <span className="font-semibold">Aviso Legal Importante:</span> Esta análise é fornecida apenas para fins educacionais e informativos. 
            Não constitui aconselhamento jurídico, médico ou financeiro. Os resultados são baseados em informações limitadas e podem não ser totalmente precisos. 
            Recomendamos fortemente consultar um advogado especializado em direito médico, um defensor de cobrança médica (medical billing advocate), 
            ou seu provedor de seguro antes de tomar qualquer ação. Nenhuma garantia de economia ou resultados é implícita ou garantida.
          </AlertDescription>
        </Alert>

        {/* Privacy & Security */}
        <Accordion type="single" collapsible className="border rounded-lg">
          <AccordionItem value="privacy" className="px-4">
            <AccordionTrigger className="hover:no-underline text-sm font-semibold">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-blue-600" />
                Privacidade e Segurança dos Seus Dados
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-sm space-y-3 pt-2">
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <Lock className="h-4 w-4 mt-0.5 text-green-600" />
                  <div>
                    <p className="font-medium">Criptografia End-to-End</p>
                    <p className="text-xs text-muted-foreground">
                      Todos os seus arquivos e dados são criptografados durante transmissão e armazenamento
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Eye className="h-4 w-4 mt-0.5 text-blue-600" />
                  <div>
                    <p className="font-medium">Anonimização Automática</p>
                    <p className="text-xs text-muted-foreground">
                      Dados pessoais identificáveis (PII) são anonimizados em análises agregadas
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <FileText className="h-4 w-4 mt-0.5 text-purple-600" />
                  <div>
                    <p className="font-medium">Conformidade HIPAA</p>
                    <p className="text-xs text-muted-foreground">
                      Seguimos práticas compatíveis com HIPAA para proteção de informações de saúde
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded p-3 mt-3">
                <p className="text-xs">
                  <span className="font-semibold">Como Usamos Seus Dados:</span>
                  <br />
                  • Análise de cobrança médica (propósito principal)
                  <br />
                  • Melhoria de algoritmos de detecção (dados anonimizados)
                  <br />
                  • Benchmarking regional de preços (agregado, sem PII)
                  <br />
                  <br />
                  <span className="font-semibold">NÃO compartilhamos:</span> Seus dados identificáveis nunca são vendidos ou compartilhados com terceiros sem seu consentimento explícito.
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="retention" className="px-4">
            <AccordionTrigger className="hover:no-underline text-sm font-semibold">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-orange-600" />
                Retenção e Exclusão de Dados
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-sm space-y-2 pt-2">
              <p>
                <span className="font-medium">Período de Retenção:</span> Seus documentos e análises são armazenados por 24 horas por padrão para contas não autenticadas.
                Usuários registrados podem acessar análises anteriores.
              </p>
              <p>
                <span className="font-medium">Direito de Exclusão:</span> Você pode solicitar a exclusão completa de seus dados a qualquer momento entrando em contato conosco.
                Cumprimos com GDPR, CCPA e outras regulamentações de privacidade aplicáveis.
              </p>
              <div className="bg-muted/50 p-2 rounded mt-2">
                <p className="text-xs text-muted-foreground">
                  Para solicitar exclusão de dados: contato@hospitalbillchecker.com
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="accuracy" className="px-4">
            <AccordionTrigger className="hover:no-underline text-sm font-semibold">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                Limitações e Precisão da Análise
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-sm space-y-2 pt-2">
              <p className="font-medium">Nossa análise é limitada por:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
                <li>Qualidade e completude dos documentos fornecidos</li>
                <li>Ausência de contexto clínico completo</li>
                <li>Variações regionais em práticas de cobrança</li>
                <li>Contratos específicos entre provedores e seguros</li>
                <li>Algoritmos de IA podem ter falsos positivos/negativos</li>
              </ul>
              <p className="text-xs text-muted-foreground mt-2">
                <span className="font-semibold">Importante:</span> Pontuações de confiança (🟢 🟠 🔴) indicam o nível de certeza da análise, 
                mas não substituem revisão profissional. Sempre verifique achados críticos com especialistas.
              </p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Hash Info */}
        <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded">
          <div className="flex items-start gap-2">
            <Lock className="h-3 w-3 mt-0.5" />
            <div>
              <p className="font-medium mb-1">Rastreabilidade e Integridade</p>
              <p>
                Cada análise recebe um hash criptográfico único para garantir integridade dos dados e prevenir manipulação. 
                Isso permite rastreamento auditável de todas as análises geradas.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
