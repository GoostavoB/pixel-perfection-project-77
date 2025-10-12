import { CheckCircle, AlertCircle, AlertTriangle, DollarSign, Database, Mail, FileText, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Header from "@/components/Header";
import SummaryCard from "@/components/SummaryCard";

const Results = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        {/* Success Banner */}
        <Card className="mb-8 p-8 text-center bg-gradient-to-br from-success/10 to-success/5 border-success/20 animate-scale-in">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-success/10 rounded-full">
              <CheckCircle className="w-12 h-12 text-success" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Analysis Complete – Your Report is Ready
          </h1>
          <p className="text-muted-foreground">
            Your detailed report has been sent to{" "}
            <span className="text-secondary font-semibold">your email</span>
          </p>
        </Card>

        {/* Quick Summary */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-6">Quick Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <SummaryCard
              icon={AlertCircle}
              title="High Priority Issues"
              value="5"
              variant="error"
            />
            <SummaryCard
              icon={AlertTriangle}
              title="Potential Issues"
              value="8"
              variant="warning"
            />
            <SummaryCard
              icon={DollarSign}
              title="Estimated Savings Potential"
              value="$2,450"
              variant="success"
            />
            <SummaryCard
              icon={Database}
              title="Data Sources Used"
              value="12"
              variant="info"
            />
          </div>
        </div>

        {/* Email Information */}
        <Card className="mb-8 p-8 border-secondary/20 bg-secondary/5 animate-fade-in">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-secondary/10 rounded-lg">
              <Mail className="w-6 h-6 text-secondary" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-foreground mb-2">Check Your Email</h3>
              <p className="text-muted-foreground mb-4">
                We've sent a comprehensive analysis report to your email with detailed findings, 
                line-by-line breakdowns, and actionable next steps. The email includes:
              </p>
              <ul className="space-y-2 text-foreground">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-secondary" />
                  Full PDF report with all identified issues
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-secondary" />
                  Comparison with Medicare benchmarks
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-secondary" />
                  Specific action items for each finding
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-secondary" />
                  Direct links to generate your dispute letter
                </li>
              </ul>
            </div>
          </div>
        </Card>

        {/* CTA Section */}
        <Card className="p-8 text-center bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20 animate-fade-in">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-accent/10 rounded-lg">
              <FileText className="w-8 h-8 text-accent" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-foreground mb-2">
            Generate Your Dispute Letter
          </h3>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Get a professional dispute letter customized with your findings
          </p>
          <Button 
            size="lg"
            className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-8 py-6 text-lg group shadow-lg hover:shadow-xl transition-all"
          >
            Generate Dispute Letter
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Card>
      </main>
    </div>
  );
};

export default Results;
