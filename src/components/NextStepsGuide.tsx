import { Phone, FileText, Clock, CheckCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface NextStepsGuideProps {
  nextSteps?: string[];
  hospitalName?: string;
}

export const NextStepsGuide = ({ nextSteps, hospitalName }: NextStepsGuideProps) => {
  const defaultSteps = [
    "Call the hospital billing department",
    "Reference the specific overcharges we identified",
    "Ask for an itemized bill review",
    "Request a payment plan if needed"
  ];

  const steps = nextSteps || defaultSteps;

  return (
    <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
      <h3 className="text-2xl font-bold text-blue-900 mb-4">
        Your Action Plan (Simple 4-Step Process)
      </h3>
      
      <p className="text-blue-800 mb-6">
        Don't worry - disputing medical bills is more common than you think. 
        Hospitals expect it, and they have departments specifically for this. Here's your roadmap:
      </p>

      <div className="space-y-4">
        {steps.map((step, index) => (
          <div key={index} className="flex items-start gap-4 p-4 bg-white rounded-lg border border-blue-200">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
              {index + 1}
            </div>
            <div className="flex-1">
              <p className="text-gray-800 font-medium">{step}</p>
            </div>
            <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0" />
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
        <div className="flex items-start gap-3">
          <Clock className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-yellow-900 mb-1">Best Time to Call</p>
            <p className="text-sm text-yellow-800">
              Monday-Friday, 9 AM - 11 AM (billing departments are usually less busy then)
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 flex gap-3">
        <Button className="flex-1" variant="default">
          <Phone className="mr-2 h-4 w-4" />
          Save Action Plan (PDF)
        </Button>
        <Button className="flex-1" variant="outline">
          <FileText className="mr-2 h-4 w-4" />
          Download Full Report
        </Button>
      </div>

      <p className="mt-4 text-center text-sm text-blue-700">
        💪 Remember: You have every right to question these charges. We're here to help you.
      </p>
    </Card>
  );
};
