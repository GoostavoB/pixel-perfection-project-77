import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, CheckCircle, Copy, FileQuestion, XCircle } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface DuplicateFlag {
  category: 'P1' | 'P2' | 'P3' | 'P4';
  reason: string;
  evidence: {
    line_ids?: string[];
    date_of_service?: string;
    codes?: Array<{ type: string; value: string }>;
    modifiers?: string[];
    prices?: number[];
  };
  panel_unbundling?: {
    panel_code?: string;
    component_codes?: string[];
  };
  confidence: 'high' | 'medium' | 'low';
  recommended_action: string;
  dispute_text: string;
}

interface DuplicateFindings {
  flags?: DuplicateFlag[];
  totals?: {
    suspect_lines: number;
    suspect_amount: number;
  };
  missing_data_requests?: string[];
  human_summary?: string;
}

interface DuplicateFindingsCardProps {
  findings?: DuplicateFindings;
}

const categoryConfig = {
  P1: {
    label: "Definite Duplicate",
    icon: XCircle,
    color: "text-destructive",
    bgColor: "bg-destructive/10",
    borderColor: "border-destructive"
  },
  P2: {
    label: "Likely Duplicate",
    icon: AlertTriangle,
    color: "text-warning",
    bgColor: "bg-warning/10",
    borderColor: "border-warning"
  },
  P3: {
    label: "Needs Review",
    icon: FileQuestion,
    color: "text-info",
    bgColor: "bg-info/10",
    borderColor: "border-info"
  },
  P4: {
    label: "Not a Duplicate",
    icon: CheckCircle,
    color: "text-success",
    bgColor: "bg-success/10",
    borderColor: "border-success"
  }
};

const confidenceBadgeVariant: Record<string, any> = {
  high: "default",
  medium: "secondary",
  low: "outline"
};

const DuplicateFindingsCard = ({ findings }: DuplicateFindingsCardProps) => {
  if (!findings || !findings.flags || findings.flags.length === 0) {
    return null;
  }

  const p1Flags = findings.flags.filter(f => f.category === 'P1');
  const p2Flags = findings.flags.filter(f => f.category === 'P2');
  const p3Flags = findings.flags.filter(f => f.category === 'P3');
  const p4Flags = findings.flags.filter(f => f.category === 'P4');

  return (
    <Card className="p-6 border-l-4 border-l-warning bg-warning/5 animate-fade-in">
      <div className="flex items-start gap-4 mb-4">
        <div className="p-3 rounded-lg bg-card text-warning">
          <Copy className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-2">Duplicate Charge Detection</h3>
          {findings.human_summary && (
            <p className="text-sm text-muted-foreground mb-3">{findings.human_summary}</p>
          )}
          {findings.totals && findings.totals.suspect_amount > 0 && (
            <div className="flex items-center gap-4 mt-2">
              <Badge variant="destructive" className="text-base px-4 py-1">
                ${findings.totals.suspect_amount.toLocaleString()} in suspect charges
              </Badge>
              <Badge variant="outline">
                {findings.totals.suspect_lines} line{findings.totals.suspect_lines !== 1 ? 's' : ''}
              </Badge>
            </div>
          )}
        </div>
      </div>

      <Separator className="my-4" />

      <Accordion type="multiple" className="space-y-3">
        {p1Flags.length > 0 && (
          <AccordionItem value="p1" className={`border rounded-lg ${categoryConfig.P1.bgColor} ${categoryConfig.P1.borderColor}`}>
            <AccordionTrigger className="px-4 hover:no-underline [&[data-state=open]>div>svg:last-child]:rotate-180">
              <div className="flex items-center gap-3 w-full">
                <categoryConfig.P1.icon className={`w-5 h-5 ${categoryConfig.P1.color}`} />
                <span className="font-semibold">{categoryConfig.P1.label}</span>
                <Badge variant="destructive" className="ml-auto">{p1Flags.length}</Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="space-y-3">
                {p1Flags.map((flag, idx) => (
                  <DuplicateFlagDetail key={idx} flag={flag} />
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {p2Flags.length > 0 && (
          <AccordionItem value="p2" className={`border rounded-lg ${categoryConfig.P2.bgColor} ${categoryConfig.P2.borderColor}`}>
            <AccordionTrigger className="px-4 hover:no-underline [&[data-state=open]>div>svg:last-child]:rotate-180">
              <div className="flex items-center gap-3 w-full">
                <categoryConfig.P2.icon className={`w-5 h-5 ${categoryConfig.P2.color}`} />
                <span className="font-semibold">{categoryConfig.P2.label}</span>
                <Badge variant="secondary" className="ml-auto">{p2Flags.length}</Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="space-y-3">
                {p2Flags.map((flag, idx) => (
                  <DuplicateFlagDetail key={idx} flag={flag} />
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {p3Flags.length > 0 && (
          <AccordionItem value="p3" className={`border rounded-lg ${categoryConfig.P3.bgColor} ${categoryConfig.P3.borderColor}`}>
            <AccordionTrigger className="px-4 hover:no-underline [&[data-state=open]>div>svg:last-child]:rotate-180">
              <div className="flex items-center gap-3 w-full">
                <categoryConfig.P3.icon className={`w-5 h-5 ${categoryConfig.P3.color}`} />
                <span className="font-semibold">{categoryConfig.P3.label}</span>
                <Badge variant="outline" className="ml-auto">{p3Flags.length}</Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="space-y-3">
                {p3Flags.map((flag, idx) => (
                  <DuplicateFlagDetail key={idx} flag={flag} />
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {p4Flags.length > 0 && (
          <AccordionItem value="p4" className={`border rounded-lg ${categoryConfig.P4.bgColor} ${categoryConfig.P4.borderColor}`}>
            <AccordionTrigger className="px-4 hover:no-underline [&[data-state=open]>div>svg:last-child]:rotate-180">
              <div className="flex items-center gap-3 w-full">
                <categoryConfig.P4.icon className={`w-5 h-5 ${categoryConfig.P4.color}`} />
                <span className="font-semibold">{categoryConfig.P4.label} (Valid)</span>
                <Badge variant="outline" className="ml-auto">{p4Flags.length}</Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="space-y-3">
                {p4Flags.map((flag, idx) => (
                  <DuplicateFlagDetail key={idx} flag={flag} />
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}
      </Accordion>

      {findings.missing_data_requests && findings.missing_data_requests.length > 0 && (
        <div className="mt-4 p-3 bg-muted rounded-lg">
          <p className="text-sm font-semibold mb-2">Additional data needed for complete analysis:</p>
          <ul className="text-sm space-y-1">
            {findings.missing_data_requests.map((request, idx) => (
              <li key={idx} className="text-muted-foreground">• {request}</li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
};

const DuplicateFlagDetail = ({ flag }: { flag: DuplicateFlag }) => {
  return (
    <div className="p-3 bg-card rounded-lg border">
      <div className="flex items-start justify-between mb-2">
        <p className="font-medium text-sm">{flag.reason}</p>
        <Badge variant={confidenceBadgeVariant[flag.confidence]}>
          {flag.confidence} confidence
        </Badge>
      </div>

      {flag.evidence && (
        <div className="text-xs text-muted-foreground space-y-1 mb-2">
          {flag.evidence.date_of_service && (
            <div>Date: {flag.evidence.date_of_service}</div>
          )}
          {flag.evidence.codes && flag.evidence.codes.length > 0 && (
            <div>Codes: {flag.evidence.codes.map(c => `${c.type}: ${c.value}`).join(', ')}</div>
          )}
          {flag.evidence.line_ids && flag.evidence.line_ids.length > 0 && (
            <div>Lines: {flag.evidence.line_ids.join(', ')}</div>
          )}
          {flag.evidence.prices && flag.evidence.prices.length > 0 && (
            <div>Amounts: {flag.evidence.prices.map(p => `$${p}`).join(', ')}</div>
          )}
        </div>
      )}

      {flag.panel_unbundling && (
        <div className="text-xs bg-warning/10 p-2 rounded mb-2">
          <div className="font-semibold">Panel Unbundling Detected</div>
          <div>Panel: {flag.panel_unbundling.panel_code}</div>
          {flag.panel_unbundling.component_codes && (
            <div>Components: {flag.panel_unbundling.component_codes.join(', ')}</div>
          )}
        </div>
      )}

      <div className="text-sm mb-2">
        <span className="font-semibold">Action: </span>
        {flag.recommended_action}
      </div>

      <div className="text-xs bg-muted p-2 rounded">
        <span className="font-semibold">For dispute letter: </span>
        {flag.dispute_text}
      </div>
    </div>
  );
};

export default DuplicateFindingsCard;
