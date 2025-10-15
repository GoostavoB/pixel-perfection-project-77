import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { TrendingDown, AlertCircle, CheckCircle } from "lucide-react";

interface ChargeItem {
  line: number;
  description: string;
  original: number;
  corrected: number;
  difference: number;
  reason?: string;
}

interface BeforeAfterComparisonProps {
  charges: ChargeItem[];
  originalTotal: number;
  correctedTotal: number;
  totalSavings: number;
}

export const BeforeAfterComparison = ({
  charges,
  originalTotal,
  correctedTotal,
  totalSavings
}: BeforeAfterComparisonProps) => {
  const savingsPercentage = ((totalSavings / originalTotal) * 100).toFixed(1);

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-1">
            Corrected Bill Simulator
          </h2>
          <p className="text-sm text-muted-foreground">
            See how your bill would look if errors were corrected
          </p>
        </div>
        <Badge className="bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200 px-4 py-2">
          <TrendingDown className="w-4 h-4 mr-2" />
          {savingsPercentage}% savings
        </Badge>
      </div>

      {/* Table Header */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-2 font-semibold text-muted-foreground">Line</th>
              <th className="text-left py-3 px-2 font-semibold text-muted-foreground">Description</th>
              <th className="text-right py-3 px-2 font-semibold text-muted-foreground">Original</th>
              <th className="text-right py-3 px-2 font-semibold text-muted-foreground">Corrected</th>
              <th className="text-right py-3 px-2 font-semibold text-muted-foreground">Difference</th>
            </tr>
          </thead>
          <tbody>
            {charges.map((charge, idx) => {
              const isDifferent = charge.difference !== 0;
              return (
                <tr 
                  key={idx} 
                  className={`border-b ${isDifferent ? 'bg-yellow-50 dark:bg-yellow-950/20' : ''}`}
                >
                  <td className="py-3 px-2 font-mono text-xs">{charge.line}</td>
                  <td className="py-3 px-2">
                    <div className="flex flex-col gap-1">
                      <span className={isDifferent ? 'font-semibold' : ''}>
                        {charge.description}
                      </span>
                      {charge.reason && (
                        <span className="text-xs text-muted-foreground flex items-start gap-1">
                          <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                          {charge.reason}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-2 text-right font-mono">
                    ${charge.original.toFixed(2)}
                  </td>
                  <td className="py-3 px-2 text-right font-mono">
                    <span className={isDifferent ? 'text-green-600 font-semibold' : ''}>
                      ${charge.corrected.toFixed(2)}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-right font-mono">
                    {isDifferent ? (
                      <span className="text-green-600 font-semibold flex items-center justify-end gap-1">
                        <TrendingDown className="w-3 h-3" />
                        -${charge.difference.toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Separator className="my-4" />

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="text-center p-4 bg-muted/30 rounded-lg">
          <div className="flex items-center justify-center gap-2 mb-1">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <span className="text-2xl font-bold text-red-600">
              ${originalTotal.toFixed(2)}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">Total Original</p>
        </div>

        <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
          <div className="flex items-center justify-center gap-2 mb-1">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-2xl font-bold text-green-600">
              ${correctedTotal.toFixed(2)}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">Corrected Total</p>
        </div>

        <div className="text-center p-4 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-950 dark:to-green-900 rounded-lg">
          <div className="flex items-center justify-center gap-2 mb-1">
            <TrendingDown className="w-5 h-5 text-green-700 dark:text-green-300" />
            <span className="text-3xl font-bold text-green-700 dark:text-green-300">
              ${totalSavings.toFixed(2)}
            </span>
          </div>
          <p className="text-xs font-semibold text-green-700 dark:text-green-300">
            Total Savings ({savingsPercentage}%)
          </p>
        </div>
      </div>

      {/* Call to Action */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          <span className="font-semibold">💡 Next step:</span> Use this table as the basis for your dispute letter. 
          Each corrected item is documented with the reason for correction.
        </p>
      </div>
    </Card>
  );
};
