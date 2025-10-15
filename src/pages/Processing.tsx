import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import Header from "@/components/Header";
import { uploadMedicalBill } from "@/lib/billAnalysisApi";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const facts = [
  "80% of medical bills contain errors that could increase your costs.",
  "The average hospital bill error is $1,300 according to recent studies.",
  "Medical coding errors are the #1 cause of billing mistakes.",
  "Duplicate charges appear in approximately 30% of hospital bills.",
  "You have the right to request an itemized bill from any healthcare provider.",
  "Many hospitals charge 3-10x more than Medicare rates for the same procedures.",
  "Medical debt is the leading cause of bankruptcy in the United States.",
];

const Processing = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { file, fileName, fresh } = (location.state as { file?: File; fileName?: string; fresh?: boolean }) || {};
  
  const [progress, setProgress] = useState(0);
  const [currentFact, setCurrentFact] = useState(0);
  const [status, setStatus] = useState("Uploading bill...");
  const [isAnalyzing, setIsAnalyzing] = useState(true);

  useEffect(() => {
    if (!file) {
      navigate('/upload');
      return;
    }

    // Start upload immediately
    startAnalysis();

    // Rotate facts every 5 seconds
    const factInterval = setInterval(() => {
      setCurrentFact((prev) => (prev + 1) % facts.length);
    }, 5000);

    // Continuous progress animation to show activity
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (!isAnalyzing) return prev;
        // Keep progressing slowly between 20-90% to show activity
        if (prev < 90) {
          return Math.min(prev + 0.5, 90);
        }
        return prev;
      });
    }, 200);

    return () => {
      clearInterval(factInterval);
      clearInterval(progressInterval);
    };
  }, [file, isAnalyzing]);

  const startAnalysis = async () => {
    if (!file) return;

    try {
      // Step 1: Upload file and analyze (happens in one call now)
      setStatus("Uploading your medical bill...");
      setProgress(20);

      const uploadResponse = await uploadMedicalBill(file, { bypassCache: !!fresh });
      
      if (!uploadResponse.success) {
        throw new Error(uploadResponse.message || "Upload failed");
      }

      setProgress(50);
      setStatus("Analyzing with Lovable AI...");

      // Small delay for UX (actual analysis is fast)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setProgress(90);
      setStatus("Generating your report...");

      // Fetch the complete analysis from database
      const { data, error } = await supabase
        .from('bill_analyses')
        .select('*')
        .eq('session_id', uploadResponse.session_id)
        .single();

      if (error || !data) {
        throw new Error('Failed to retrieve analysis results');
      }

      // Guard: ensure we have valid analysis_result before navigating
      if (data.status !== 'ready' || !data.analysis_result) {
        throw new Error('Analysis result is incomplete or failed');
      }

      setProgress(100);
      setStatus("Complete!");
      setIsAnalyzing(false);

      // Navigate to results with complete analysis_result
      setTimeout(() => {
        navigate('/results', {
          state: {
            analysis: data,
            sessionId: uploadResponse.session_id
          }
        });
      }, 500);

    } catch (error) {
      console.error('Analysis error:', error);
      setIsAnalyzing(false);
      toast({
        title: "Analysis failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
      
      // Wait a bit before redirecting so user can see the error
      setTimeout(() => navigate('/upload'), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-16">
        <Card className="max-w-2xl mx-auto p-8">
          <div className="text-center mb-8">
            <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Analyzing Your Bill
            </h2>
            <p className="text-muted-foreground">
              {status}
            </p>
          </div>

          <Progress value={progress} className="mb-6" />

          <div className="bg-muted rounded-lg p-6 mb-6">
            <p className="text-base font-semibold text-foreground mb-3">
              💡 Did you know?
            </p>
            <p className="text-lg text-foreground leading-relaxed animate-fade-in">
              {facts[currentFact]}
            </p>
          </div>

          {fileName && (
            <div className="text-center text-sm text-muted-foreground">
              <p>Analyzing: <span className="font-medium text-foreground">{fileName}</span></p>
            </div>
          )}
        </Card>
      </main>
    </div>
  );
};

export default Processing;
