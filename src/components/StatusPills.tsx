import { Badge } from "@/components/ui/badge";
import { FileQuestion, Shield, Copy } from "lucide-react";

interface StatusPillsProps {
  itemizationStatus: "missing" | "partial" | "complete";
  nsaStatus: "unknown" | "protected" | "not-protected";
  duplicatesCount: number;
}

export const StatusPills = ({ itemizationStatus, nsaStatus, duplicatesCount }: StatusPillsProps) => {
  return (
    <div className="flex flex-wrap gap-2">
      {/* Itemization Status */}
      {itemizationStatus === "missing" && (
        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
          <FileQuestion className="w-3 h-3 mr-1" />
          Missing codes
        </Badge>
      )}
      {itemizationStatus === "partial" && (
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          <FileQuestion className="w-3 h-3 mr-1" />
          Partial codes
        </Badge>
      )}
      {itemizationStatus === "complete" && (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          <FileQuestion className="w-3 h-3 mr-1" />
          Complete codes
        </Badge>
      )}

      {/* NSA Status */}
      {nsaStatus === "unknown" && (
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          <Shield className="w-3 h-3 mr-1" />
          NSA: Unknown, needs network status
        </Badge>
      )}
      {nsaStatus === "protected" && (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          <Shield className="w-3 h-3 mr-1" />
          NSA: Protected
        </Badge>
      )}
      {nsaStatus === "not-protected" && (
        <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
          <Shield className="w-3 h-3 mr-1" />
          NSA: Not Protected
        </Badge>
      )}

      {/* Duplicates */}
      {duplicatesCount > 0 && (
        <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
          <Copy className="w-3 h-3 mr-1" />
          Possible duplicates: {duplicatesCount}
        </Badge>
      )}
    </div>
  );
};
