import { HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ExplainerTooltipProps {
  term: string;
  explanation: string;
  example?: string;
}

export const ExplainerTooltip = ({ term, explanation, example }: ExplainerTooltipProps) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button className="inline-flex items-center gap-1 text-primary hover:text-primary/80 underline decoration-dotted">
            {term}
            <HelpCircle className="h-3 w-3" />
          </button>
        </TooltipTrigger>
        <TooltipContent className="max-w-sm p-4">
          <div className="space-y-2">
            <p className="text-sm font-medium">{explanation}</p>
            {example && (
              <p className="text-xs text-muted-foreground italic">
                <strong>Example:</strong> {example}
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
