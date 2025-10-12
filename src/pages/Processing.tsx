import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import Header from "@/components/Header";

const facts = [
  "80% of medical bills contain errors that could cost you hundreds or thousands of dollars.",
  "The No Surprises Act protects you from unexpected out-of-network charges in emergencies.",
  "Duplicate charges are among the most common billing errors in hospital bills.",
  "Comparing your bill with regional data can reveal overcharges of 50% or more.",
  "Most hospitals must publish their prices publicly—use this data to check if you're being overcharged.",
  "Medical coding errors can result in charges for services you never received.",
  "Emergency room visits are particularly prone to billing errors and inflated charges.",
  "You have the legal right to dispute incorrect charges on your medical bill.",
];

const Processing = () => {
  const [progress, setProgress] = useState(0);
  const [currentFact, setCurrentFact] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setTimeout(() => navigate("/form"), 500);
          return 100;
        }
        return prev + 1;
      });
    }, 100);

    const factInterval = setInterval(() => {
      setCurrentFact((prev) => (prev + 1) % facts.length);
    }, 3000);

    return () => {
      clearInterval(progressInterval);
      clearInterval(factInterval);
    };
  }, [navigate]);

  const getStageMessage = () => {
    if (progress < 25) return "Transcribing your medical bill...";
    if (progress < 50) return "Analyzing charges and data...";
    if (progress < 75) return "Comparing with other hospitals in your area...";
    return "Preparing your analysis...";
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-24">
        <div className="max-w-2xl mx-auto">
          <Card className="p-8 md:p-12 animate-fade-in">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4 animate-pulse">
                <div className="w-8 h-8 rounded-full bg-primary animate-spin border-4 border-transparent border-t-primary-foreground" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                Analyzing Your Bill
              </h2>
              <p className="text-muted-foreground">
                {getStageMessage()}
              </p>
            </div>

            <div className="space-y-4">
              <Progress value={progress} className="h-3" />
              <p className="text-center text-sm font-medium text-foreground">
                {progress}%
              </p>
            </div>

            <div className="mt-12 p-6 bg-primary/5 rounded-lg border border-primary/20">
              <p className="text-sm md:text-base text-foreground leading-relaxed">
                💡 <span className="font-semibold">Did you know?</span> {facts[currentFact]}
              </p>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Processing;
