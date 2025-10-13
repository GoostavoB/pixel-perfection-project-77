import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import Header from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";

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
  const [status, setStatus] = useState('Initializing analysis...');
  const navigate = useNavigate();
  const location = useLocation();
  const { sessionId } = (location.state as { sessionId?: string }) || {};

  useEffect(() => {
    if (!sessionId) {
      navigate('/upload');
      return;
    }

    let pollInterval: ReturnType<typeof setInterval>;
    
    const checkStatus = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-analysis', {
          body: { sessionId }
        });
        
        if (error) {
          console.error('Function invocation error:', error);
          return;
        }
        
        if (data?.analysis) {
          const { status: analysisStatus } = data.analysis;
          
          if (analysisStatus === 'completed') {
            setProgress(100);
            setStatus('Analysis complete!');
            clearInterval(pollInterval);
            setTimeout(() => navigate('/form'), 500);
          } else if (analysisStatus === 'error') {
            setStatus('Analysis failed. Please try again.');
            clearInterval(pollInterval);
          } else {
            // Still processing
            setProgress(prev => Math.min(prev + 5, 90));
          }
        }
      } catch (error) {
        console.error('Status check error:', error);
      }
    };

    // Start polling
    pollInterval = setInterval(checkStatus, 2000);
    
    // Initial check
    checkStatus();

    const factInterval = setInterval(() => {
      setCurrentFact((prev) => (prev + 1) % facts.length);
    }, 3000);

    return () => {
      clearInterval(pollInterval);
      clearInterval(factInterval);
    };
  }, [navigate, sessionId]);

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
                {status || getStageMessage()}
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
