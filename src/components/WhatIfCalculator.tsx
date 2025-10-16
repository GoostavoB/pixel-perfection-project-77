import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Calculator, TrendingDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface DisputeItem {
  id: string;
  description: string;
  amount: number;
  estimatedReduction: number;
  reason?: string;
}

interface WhatIfCalculatorProps {
  items: DisputeItem[];
  currentTotal: number;
  hasEOB: boolean;
  onSelectionsChange?: (totalReduction: number, selectedCount: number) => void;
}

export const WhatIfCalculator = ({ items, currentTotal, hasEOB, onSelectionsChange }: WhatIfCalculatorProps) => {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  const handleToggle = (id: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  const totalReduction = items
    .filter(item => selectedItems.has(item.id))
    .reduce((sum, item) => sum + (item.estimatedReduction || 0), 0);

  const newTotal = currentTotal - totalReduction;
  const savingsPercentage = currentTotal > 0 ? (totalReduction / currentTotal) * 100 : 0;

  // Notify parent component of selection changes
  useEffect(() => {
    if (onSelectionsChange) {
      onSelectionsChange(totalReduction, selectedItems.size);
    }
  }, [totalReduction, selectedItems.size, onSelectionsChange]);

  return (
    <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-green-100 rounded-lg">
          <Calculator className="w-5 h-5 text-green-700" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-green-900">What If Calculator</h2>
          <p className="text-sm text-green-700">Select items to dispute and see potential savings</p>
        </div>
      </div>

      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs text-blue-800">
          <strong>Estimated savings values are projections based on detected issues.</strong> {!hasEOB && 'Upload EOB for verified results.'}
        </p>
      </div>

      <div className="space-y-3 mb-6">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-start gap-3 p-3 bg-white rounded-lg border border-green-200 hover:border-green-300 transition-colors"
          >
            <Checkbox
              id={item.id}
              checked={selectedItems.has(item.id)}
              onCheckedChange={() => handleToggle(item.id)}
              className="mt-1"
            />
            <label htmlFor={item.id} className="flex-1 cursor-pointer">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{item.description}</p>
                  {item.reason && (
                    <p className="text-xs text-orange-600 mt-1 font-medium">
                      Reason: {item.reason}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    Current: ${(item.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="text-right ml-4">
                  <p className="text-sm font-semibold text-green-700">
                    -${(item.estimatedReduction || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-muted-foreground">Savings</p>
                </div>
              </div>
            </label>
          </div>
        ))}
      </div>

      <div className="border-t-2 border-green-200 pt-4">
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Current bill total:</span>
            <span className="font-semibold">${currentTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Selected reductions:</span>
            <span className="font-semibold text-green-700">
              -${totalReduction.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-green-200">
            <span className="font-semibold text-foreground">Estimated new total:</span>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-700">
                ${newTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              {totalReduction > 0 && (
                <Badge className="bg-green-100 text-green-700 border-green-300 mt-1">
                  <TrendingDown className="w-3 h-3 mr-1" />
                  {savingsPercentage.toFixed(1)}% savings
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
