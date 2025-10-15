import { Badge } from "@/components/ui/badge";
import { FileQuestion, Shield, Copy } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface StatusPillsProps {
  itemizationStatus: "missing" | "partial" | "complete";
  nsaStatus: "unknown" | "protected" | "not-protected";
  duplicatesCount: number;
}

export const StatusPills = ({ itemizationStatus, nsaStatus, duplicatesCount }: StatusPillsProps) => {
  const getItemizationTooltip = () => {
    if (itemizationStatus === "missing") {
      return "Your bill doesn't have medical billing codes (CPT/HCPCS). We need these codes to identify specific overcharges and calculate accurate savings.";
    }
    if (itemizationStatus === "partial") {
      return "Some line items have billing codes, but others are missing. Request a fully itemized bill with all CPT/HCPCS codes for complete analysis.";
    }
    return "Your bill includes detailed medical billing codes (CPT/HCPCS) for all services, allowing us to identify specific overcharges accurately.";
  };

  const getNSATooltip = () => {
    if (nsaStatus === "unknown") {
      return "We can't determine if No Surprises Act protections apply without knowing if your provider was in-network or out-of-network. This affects your rights and potential savings.";
    }
    if (nsaStatus === "protected") {
      return "The No Surprises Act protects you from surprise medical bills. You may be entitled to in-network rates even for out-of-network services.";
    }
    return "Based on available information, No Surprises Act protections may not apply to these charges. However, you still have other rights to dispute.";
  };

  const getDuplicatesTooltip = () => {
    return `We found ${duplicatesCount} potential duplicate charge${duplicatesCount > 1 ? 's' : ''} - these are line items that may be billing you twice for the same service or supply.`;
  };

  return (
    <TooltipProvider>
      <div className="flex flex-wrap gap-2">
        {/* Itemization Status */}
        {itemizationStatus === "missing" && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 cursor-help">
                <FileQuestion className="w-3 h-3 mr-1" />
                Missing codes
              </Badge>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p className="text-sm">{getItemizationTooltip()}</p>
            </TooltipContent>
          </Tooltip>
        )}
        {itemizationStatus === "partial" && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 cursor-help">
                <FileQuestion className="w-3 h-3 mr-1" />
                Partial codes
              </Badge>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p className="text-sm">{getItemizationTooltip()}</p>
            </TooltipContent>
          </Tooltip>
        )}
        {itemizationStatus === "complete" && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 cursor-help">
                <FileQuestion className="w-3 h-3 mr-1" />
                Complete codes
              </Badge>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p className="text-sm">{getItemizationTooltip()}</p>
            </TooltipContent>
          </Tooltip>
        )}

        {/* NSA Status */}
        {nsaStatus === "unknown" && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 cursor-help">
                <Shield className="w-3 h-3 mr-1" />
                NSA: Unknown, needs network status
              </Badge>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p className="text-sm">{getNSATooltip()}</p>
            </TooltipContent>
          </Tooltip>
        )}
        {nsaStatus === "protected" && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 cursor-help">
                <Shield className="w-3 h-3 mr-1" />
                NSA: Protected
              </Badge>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p className="text-sm">{getNSATooltip()}</p>
            </TooltipContent>
          </Tooltip>
        )}
        {nsaStatus === "not-protected" && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 cursor-help">
                <Shield className="w-3 h-3 mr-1" />
                NSA: Not Protected
              </Badge>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p className="text-sm">{getNSATooltip()}</p>
            </TooltipContent>
          </Tooltip>
        )}

        {/* Duplicates */}
        {duplicatesCount > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 cursor-help">
                <Copy className="w-3 h-3 mr-1" />
                Possible duplicates: {duplicatesCount}
              </Badge>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p className="text-sm">{getDuplicatesTooltip()}</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
};
