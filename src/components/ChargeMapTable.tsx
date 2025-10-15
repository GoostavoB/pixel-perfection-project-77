import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, AlertTriangle, AlertCircle, FileQuestion } from "lucide-react";

interface ChargeCategory {
  category: string;
  amount: number;
  shareOfTotal: number;
  riskTags: string[];
}

interface ChargeMapTableProps {
  charges: ChargeCategory[];
  totalBill: number;
}

export const ChargeMapTable = ({ charges, totalBill }: ChargeMapTableProps) => {
  const [sortBy, setSortBy] = useState<"amount" | "risk" | "category">("amount");

  const getRiskColor = (tag: string) => {
    if (tag.includes("Duplicate") || tag.includes("duplicate")) return "text-orange-700 bg-orange-50 border-orange-200";
    if (tag.includes("High") || tag.includes("Missing")) return "text-red-700 bg-red-50 border-red-200";
    if (tag.includes("Needs")) return "text-yellow-700 bg-yellow-50 border-yellow-200";
    return "text-blue-700 bg-blue-50 border-blue-200";
  };

  const getRiskIcon = (tag: string) => {
    if (tag.includes("Duplicate")) return <AlertCircle className="w-3 h-3" />;
    if (tag.includes("High") || tag.includes("Missing")) return <AlertTriangle className="w-3 h-3" />;
    return <FileQuestion className="w-3 h-3" />;
  };

  const sortedCharges = [...charges].sort((a, b) => {
    switch (sortBy) {
      case "amount":
        return b.amount - a.amount;
      case "risk":
        return b.riskTags.length - a.riskTags.length;
      case "category":
        return a.category.localeCompare(b.category);
      default:
        return 0;
    }
  });

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-foreground">Charge Map</h2>
        <div className="flex gap-2">
          <Button
            variant={sortBy === "amount" ? "default" : "outline"}
            size="sm"
            onClick={() => setSortBy("amount")}
          >
            <ArrowUpDown className="w-4 h-4 mr-1" />
            Amount
          </Button>
          <Button
            variant={sortBy === "risk" ? "default" : "outline"}
            size="sm"
            onClick={() => setSortBy("risk")}
          >
            <ArrowUpDown className="w-4 h-4 mr-1" />
            Risk
          </Button>
          <Button
            variant={sortBy === "category" ? "default" : "outline"}
            size="sm"
            onClick={() => setSortBy("category")}
          >
            <ArrowUpDown className="w-4 h-4 mr-1" />
            Category
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b-2 border-muted">
            <tr className="text-left">
              <th className="pb-3 font-semibold text-sm text-muted-foreground">Category</th>
              <th className="pb-3 font-semibold text-sm text-muted-foreground text-right">Amount</th>
              <th className="pb-3 font-semibold text-sm text-muted-foreground text-right">Share</th>
              <th className="pb-3 font-semibold text-sm text-muted-foreground">Risk Tags</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-muted">
            {sortedCharges.map((charge, idx) => (
              <tr key={idx} className="hover:bg-muted/50 transition-colors">
                <td className="py-4 font-medium text-foreground">{charge.category}</td>
                <td className="py-4 text-right font-semibold text-lg text-foreground">
                  ${charge.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="py-4 text-right text-muted-foreground">
                  {charge.shareOfTotal.toFixed(1)}%
                </td>
                <td className="py-4">
                  <div className="flex flex-wrap gap-1">
                    {charge.riskTags.map((tag, tagIdx) => (
                      <Badge
                        key={tagIdx}
                        variant="outline"
                        className={`text-xs ${getRiskColor(tag)} flex items-center gap-1`}
                      >
                        {getRiskIcon(tag)}
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="border-t-2 border-muted">
            <tr className="font-bold">
              <td className="pt-4">Total</td>
              <td className="pt-4 text-right text-xl text-primary">
                ${totalBill.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </td>
              <td className="pt-4 text-right">100%</td>
              <td className="pt-4"></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </Card>
  );
};
