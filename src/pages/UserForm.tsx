import { useState } from "react";
import { CheckCircle, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const UserForm = () => {
  const [agreed, setAgreed] = useState(false);
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!agreed || !consent) {
      toast({
        title: "Consent required",
        description: "Please accept the terms and privacy policy to continue",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const sessionId = localStorage.getItem('billAnalysisSessionId');
    
    if (!sessionId) {
      toast({
        title: "Session expired",
        description: "Please upload your bill again",
        variant: "destructive",
      });
      navigate('/upload');
      return;
    }

    const formData = new FormData(e.target as HTMLFormElement);
    
    try {
      const { data, error } = await supabase.functions.invoke('submit-form', {
        body: {
          sessionId,
          email: formData.get('email'),
          name: formData.get('fullName'),
          phone: formData.get('phone') || ''
        }
      });

      if (error) throw error;

      navigate('/results', { state: { analysis: data.analysis, sessionId } });
    } catch (error) {
      console.error('Form submission error:', error);
      toast({
        title: "Submission failed",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center py-8 px-4">
      {/* Logo */}
      <div className="mb-12 flex items-center gap-2">
        <div className="flex items-baseline">
          <span className="text-4xl font-bold text-primary">Hospital</span>
        </div>
        <div className="flex items-baseline">
          <span className="text-4xl font-bold text-foreground">Bill</span>
          <span className="text-4xl font-normal text-foreground">Checker</span>
          <CheckCircle className="w-9 h-9 text-success ml-1" />
        </div>
      </div>

      {/* Form Card */}
      <Card className="w-full max-w-2xl p-8 shadow-card-hover animate-scale-in">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-success/10 rounded-xl">
              <CheckCircle className="w-12 h-12 text-success" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Analysis Complete!</h1>
          <p className="text-muted-foreground">
            Enter your information to receive the full detailed report
          </p>
        </div>

        {/* Info Banner */}
        <div className="mb-8 p-4 bg-warning/10 border-l-4 border-warning rounded-r-lg">
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-warning-foreground mb-1">
                Hospital Location Information
              </h3>
              <p className="text-sm text-foreground">
                Please enter the city and state of the{" "}
                <span className="font-semibold">hospital where you received treatment</span>{" "}
                (not your home address). This helps us maintain our database to provide better 
                price comparisons for patients in similar locations.
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <Label htmlFor="fullName" className="text-foreground font-medium">
              Full Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="fullName"
              placeholder="John Doe"
              className="mt-2"
              defaultValue="John Doe"
            />
          </div>

          <div>
            <Label htmlFor="email" className="text-foreground font-medium">
              Email Address <span className="text-destructive">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              className="mt-2"
              defaultValue="john@example.com"
            />
          </div>

          <div>
            <Label htmlFor="yearOfBirth" className="text-foreground font-medium">
              Year of Birth <span className="text-destructive">*</span>
            </Label>
            <Select defaultValue="">
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select year..." />
              </SelectTrigger>
              <SelectContent className="bg-card">
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="hospitalCity" className="text-foreground font-medium">
              Hospital City <span className="text-destructive">*</span>
            </Label>
            <Input
              id="hospitalCity"
              placeholder="Start typing city name..."
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="hospitalState" className="text-foreground font-medium">
              Hospital State <span className="text-destructive">*</span>
            </Label>
            <Select defaultValue="">
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select state..." />
              </SelectTrigger>
              <SelectContent className="bg-card">
                <SelectItem value="CA">California</SelectItem>
                <SelectItem value="NY">New York</SelectItem>
                <SelectItem value="TX">Texas</SelectItem>
                <SelectItem value="FL">Florida</SelectItem>
                {/* Add more states as needed */}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4 pt-2">
            <div className="flex items-start gap-3">
              <Checkbox
                id="terms"
                checked={agreed}
                onCheckedChange={(checked) => setAgreed(checked as boolean)}
                className="mt-1"
              />
              <Label htmlFor="terms" className="text-sm text-foreground cursor-pointer leading-relaxed">
                I have read and accept the{" "}
                <Link to="/terms" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">
                  Terms of Use
                </Link>{" "}
                and{" "}
                <Link to="/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">
                  Privacy Policy
                </Link>.{" "}
                <span className="text-destructive">*</span>
              </Label>
            </div>

            <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <p className="text-sm text-foreground/80">
                <strong className="text-foreground">Data safety:</strong> Files are encrypted in transit and at rest. We de-identify uploads before research. We keep hospital name, hospital location, bill details, and your year of birth only. We never sell personal data. You can request deletion at any time.
              </p>
            </div>

            <div className="flex items-start gap-3">
              <Checkbox
                id="consent"
                checked={consent}
                onCheckedChange={(checked) => setConsent(checked as boolean)}
                className="mt-1"
              />
              <Label htmlFor="consent" className="text-sm text-foreground cursor-pointer leading-relaxed">
                I consent to Hospital Bill Checker processing my uploaded documents and data, which may include health information, to generate an educational report. I understand this is not medical or legal advice.{" "}
                <span className="text-destructive">*</span>
              </Label>
            </div>
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold text-lg py-6 shadow-lg hover:shadow-xl transition-all"
            disabled={!agreed || !consent || loading}
          >
            {loading ? 'Submitting...' : 'Get My Full Report'}
          </Button>
        </form>

        {/* Privacy Note */}
        <div className="mt-6 flex items-start gap-2 text-sm text-muted-foreground">
          <div className="w-4 h-4 flex-shrink-0 mt-0.5">🔒</div>
          <p>
            We never share your personal information. Your data is encrypted and used only to 
            send your personalized report.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default UserForm;
