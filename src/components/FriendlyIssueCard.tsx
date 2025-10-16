import { AlertCircle, AlertTriangle, DollarSign, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { FairPriceComparison } from "./FairPriceComparison";

interface FriendlyIssueCardProps {
  issue: {
    type: string;
    line_description: string;
    billed_amount: number;
    overcharge_amount?: number;
    explanation_for_user: string;
    suggested_action: string;
    why_this_matters?: string;
    confidence_score: number;
    medicare_benchmark?: number;
    reasonable_rate?: number;
    fair_price?: number;
    fair_price_confidence?: 'high' | 'medium' | 'low';
    fair_price_source?: string;
  };
  isPriority: boolean;
}

export const FriendlyIssueCard = ({ issue, isPriority }: FriendlyIssueCardProps) => {
  const [showDetails, setShowDetails] = useState(false);
  
  const Icon = isPriority ? AlertCircle : AlertTriangle;
  const colorClass = isPriority ? "red" : "yellow";
  const bgClass = isPriority ? "bg-red-50 border-red-200" : "bg-yellow-50 border-yellow-200";
  const iconBgClass = isPriority ? "bg-red-100 text-red-600" : "bg-yellow-100 text-yellow-600";
  
  const confidenceText = 
    issue.confidence_score >= 0.95 ? "Very confident" :
    issue.confidence_score >= 0.85 ? "Confident" :
    issue.confidence_score >= 0.75 ? "Likely" : "Possible";

  return (
    <Card className={`p-5 ${bgClass}`}>
      <div className="flex items-start gap-4">
        <div className={`p-2 rounded-lg ${iconBgClass}`}>
          <Icon className="h-5 w-5" />
        </div>
        
        <div className="flex-1">
          {/* Header */}
          <div className="flex items-start justify-between mb-2">
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">
                {issue.line_description}
              </h4>
              <Badge variant="outline" className="text-xs">
                {issue.type}
              </Badge>
            </div>
            {issue.overcharge_amount && (
              <div className="text-right">
                <div className="text-2xl font-bold text-red-600">
                  ${issue.overcharge_amount.toLocaleString()}
                </div>
                <div className="text-xs text-gray-600">overcharge</div>
              </div>
            )}
          </div>

          {/* Simple Explanation */}
          <p className="text-gray-700 mb-3 leading-relaxed">
            {issue.explanation_for_user}
          </p>

          {/* Why This Matters */}
          {issue.why_this_matters && (
            <div className="mb-3 p-3 bg-white rounded-md border border-gray-200">
              <p className="text-sm text-gray-700">
                <strong>Why this matters:</strong> {issue.why_this_matters}
              </p>
            </div>
          )}

          {/* What To Do */}
          <div className="mb-3 p-3 bg-blue-50 rounded-md border border-blue-200">
            <p className="text-sm font-medium text-blue-900 mb-1">
              📞 What to say to billing:
            </p>
            <p className="text-sm text-blue-800 italic">
              "{issue.suggested_action}"
            </p>
          </div>

          {/* Confidence & Details Toggle */}
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="text-xs">
              {confidenceText} • {Math.round(issue.confidence_score * 100)}% confidence
            </Badge>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
              className="text-xs"
            >
              {showDetails ? "Hide" : "Show"} details
              <ArrowRight className={`ml-1 h-3 w-3 transition-transform ${showDetails ? 'rotate-90' : ''}`} />
            </Button>
          </div>

          {/* Detailed Breakdown */}
          {showDetails && (
            <div className="mt-3 space-y-3">
              {/* Show Fair Price Comparison if available */}
              {issue.fair_price && issue.fair_price > 0 ? (
                <FairPriceComparison
                  billedAmount={issue.billed_amount}
                  fairPrice={issue.fair_price}
                  medicareRate={issue.medicare_benchmark}
                  confidence={issue.fair_price_confidence || 'medium'}
                  source={issue.fair_price_source}
                  description={issue.line_description}
                />
              ) : (
                <div className="p-3 bg-white rounded-md border border-gray-200 text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">They charged:</span>
                    <span className="font-semibold text-red-600">${issue.billed_amount.toLocaleString()}</span>
                  </div>
                  {issue.medicare_benchmark && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Medicare pays:</span>
                      <span className="font-medium text-gray-700">${issue.medicare_benchmark.toLocaleString()}</span>
                    </div>
                  )}
                  {issue.reasonable_rate && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Fair price (3x Medicare):</span>
                      <span className="font-medium text-green-700">${issue.reasonable_rate.toLocaleString()}</span>
                    </div>
                  )}
                  {issue.overcharge_amount && (
                    <>
                      <div className="border-t pt-2" />
                      <div className="flex justify-between">
                        <span className="font-semibold text-gray-700">You're being overcharged:</span>
                        <span className="font-bold text-red-600">${issue.overcharge_amount.toLocaleString()}</span>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
