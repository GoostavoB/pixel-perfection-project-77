import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import Header from "@/components/Header";
import { uploadMedicalBill, getJobStatus, getAnalysisDetails, retryWithBackoff } from "@/lib/billAnalysisApi";
import { useToast } from "@/hooks/use-toast";

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
  const { file, fileName } = (location.state as { file?: File; fileName?: string }) || {};
  
  const [progress, setProgress] = useState(0);
  const [currentFact, setCurrentFact] = useState(0);
  const [status, setStatus] = useState("Uploading bill...");
  const [jobId, setJobId] = useState<string | null>(null);

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

    return () => clearInterval(factInterval);
  }, [file]);

  const startAnalysis = async () => {
    if (!file) return;

    try {
      // Step 1: Upload file (this takes ~5-6 seconds)
      setStatus("Uploading your medical bill...");
      setProgress(10);

      const uploadResponse = await uploadMedicalBill(file);
      
      if (!uploadResponse.success) {
        throw new Error(uploadResponse.message || "Upload failed");
      }

      const currentJobId = uploadResponse.job_id;
      setJobId(currentJobId);
      
      setProgress(30);
      setStatus("Extracting text from PDF...");

      // Step 2: Poll for completion (backend processes in ~5-6 seconds total)
      await pollForCompletion(currentJobId);

    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
      
      // Wait a bit before redirecting so user can see the error
      setTimeout(() => navigate('/upload'), 2000);
    }
  };

  const pollForCompletion = async (currentJobId: string) => {
    let attempts = 0;
    const maxAttempts = 20; // 20 seconds max
    const pollInterval = 1000; // Check every 1 second

    const checkStatus = async (): Promise<boolean> => {
      try {
        const jobStatus = await getJobStatus(currentJobId);
        
        setProgress(Math.min(30 + (attempts * 3), 90));

        if (jobStatus.status === 'ready' || jobStatus.status === 'completed') {
          setProgress(95);
          setStatus("Analysis complete! Loading results...");
          
          // Fetch full analysis details with retry
          const analysisDetails = await retryWithBackoff(
            () => getAnalysisDetails(currentJobId),
            3,
            1000
          );
          
          setProgress(100);
          
          // Navigate to results with complete data
          setTimeout(() => {
            navigate('/results', {
              state: {
                uploadResponse: {
                  job_id: currentJobId,
                  ui_summary: analysisDetails.ui_summary,
                  status: 'ready'
                },
                analysisDetails
              }
            });
          }, 500);
          
          return true;
        } else if (jobStatus.status === 'error') {
          throw new Error(jobStatus.error_message || 'Analysis failed');
        }

        // Update status messages based on progress
        if (attempts < 3) {
          setStatus("Extracting text from PDF...");
        } else if (attempts < 8) {
          setStatus("Analyzing charges with AI...");
        } else {
          setStatus("Generating report...");
        }

        return false;
      } catch (error) {
        if (attempts < maxAttempts - 1) {
          // Continue polling on transient errors
          return false;
        }
        throw error;
      }
    };

    // Poll until complete or max attempts reached
    while (attempts < maxAttempts) {
      const isComplete = await checkStatus();
      if (isComplete) break;
      
      await new Promise(resolve => setTimeout(resolve, pollInterval));
      attempts++;
    }

    if (attempts >= maxAttempts) {
      throw new Error('Analysis timed out. Please try again.');
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
            <p className="text-sm text-foreground">
              💡 <strong>Did you know?</strong>
            </p>
            <p className="text-sm text-muted-foreground mt-2 animate-fade-in">
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
