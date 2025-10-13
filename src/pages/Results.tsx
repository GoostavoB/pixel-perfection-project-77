import { CheckCircle, AlertCircle, AlertTriangle, DollarSign, Database, Mail, FileText, ArrowRight, Calendar, FileBarChart, TrendingDown } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import { useEffect, useState } from "react";

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { analysis: passedAnalysis, sessionId } = (location.state as { analysis?: any; sessionId?: string }) || {};
  
  const [analysis, setAnalysis] = useState(passedAnalysis);
  
  useEffect(() => {
    if (!analysis || !sessionId) {
      navigate('/upload');
    }
  }, [analysis, sessionId, navigate]);

  if (!analysis) return null;

  const analysisDate = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const criticalIssues = analysis.critical_issues || 0;
  const moderateIssues = analysis.moderate_issues || 0;
  const estimatedSavings = analysis.estimated_savings || 0;
  const issues = analysis.issues || [];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Report Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Medical Bill Analysis Report
              </h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Analysis Date: {analysisDate}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileBarChart className="w-4 h-4" />
                  <span>Report ID: #HBC-2024-1847</span>
                </div>
              </div>
            </div>
            <Badge className="bg-success/10 text-success border-success/20 px-4 py-2 text-sm font-semibold">
              <CheckCircle className="w-4 h-4 mr-2" />
              Analysis Complete
            </Badge>
          </div>
          <Separator className="my-4" />
        </div>

        {/* Executive Summary */}
        <Card className="mb-6 p-6 border-l-4 border-l-secondary shadow-card">
          <div className="flex items-start gap-4 mb-4">
            <div className="p-2 bg-secondary/10 rounded">
              <Mail className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground mb-1">Report Delivery Status</h2>
              <p className="text-sm text-muted-foreground">
                Your comprehensive analysis has been generated and sent to <span className="font-semibold text-secondary">your registered email address</span>. 
                Please check your inbox for the complete PDF report with detailed findings and recommendations.
              </p>
            </div>
          </div>
        </Card>

        {/* Key Metrics Grid */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-foreground mb-4">Summary of Findings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* High Priority Issues */}
            <Card className="p-5 border-l-4 border-l-destructive hover:shadow-card-hover transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-destructive/10 rounded">
                  <AlertCircle className="w-5 h-5 text-destructive" />
                </div>
                <span className="text-3xl font-bold text-destructive">5</span>
              </div>
              <h3 className="text-sm font-semibold text-foreground mb-1">Critical Issues</h3>
              <p className="text-xs text-muted-foreground">Require immediate attention</p>
            </Card>

            {/* Potential Issues */}
            <Card className="p-5 border-l-4 border-l-warning hover:shadow-card-hover transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-warning/10 rounded">
                  <AlertTriangle className="w-5 h-5 text-warning" />
                </div>
                <span className="text-3xl font-bold text-warning">8</span>
              </div>
              <h3 className="text-sm font-semibold text-foreground mb-1">Moderate Concerns</h3>
              <p className="text-xs text-muted-foreground">For further review</p>
            </Card>

            {/* Savings Potential */}
            <Card className="p-5 border-l-4 border-l-success hover:shadow-card-hover transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-success/10 rounded">
                  <TrendingDown className="w-5 h-5 text-success" />
                </div>
                <span className="text-3xl font-bold text-success">$2,450</span>
              </div>
              <h3 className="text-sm font-semibold text-foreground mb-1">Est. Savings</h3>
              <p className="text-xs text-muted-foreground">Potential cost reduction</p>
            </Card>

            {/* Data Sources */}
            <Card className="p-5 border-l-4 border-l-secondary hover:shadow-card-hover transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-secondary/10 rounded">
                  <Database className="w-5 h-5 text-secondary" />
                </div>
                <span className="text-3xl font-bold text-secondary">12</span>
              </div>
              <h3 className="text-sm font-semibold text-foreground mb-1">Data Sources</h3>
              <p className="text-xs text-muted-foreground">Referenced databases</p>
            </Card>
          </div>
        </div>

        {/* Detailed Findings Table */}
        <Card className="mb-6 overflow-hidden shadow-card">
          <div className="p-6 bg-muted/30 border-b">
            <h2 className="text-xl font-bold text-foreground">Issue Breakdown</h2>
          </div>
          <div className="p-0">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr className="border-b">
                  <th className="text-left p-4 text-sm font-semibold text-foreground">Category</th>
                  <th className="text-left p-4 text-sm font-semibold text-foreground">Finding</th>
                  <th className="text-center p-4 text-sm font-semibold text-foreground">Severity</th>
                  <th className="text-right p-4 text-sm font-semibold text-foreground">Impact</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b hover:bg-muted/20 transition-colors">
                  <td className="p-4 text-sm font-medium text-foreground">Pricing</td>
                  <td className="p-4 text-sm text-muted-foreground">Charges exceed Medicare allowable by 340%</td>
                  <td className="p-4 text-center">
                    <Badge variant="destructive" className="text-xs">Critical</Badge>
                  </td>
                  <td className="p-4 text-right text-sm font-semibold text-destructive">$1,240</td>
                </tr>
                <tr className="border-b hover:bg-muted/20 transition-colors">
                  <td className="p-4 text-sm font-medium text-foreground">Billing Codes</td>
                  <td className="p-4 text-sm text-muted-foreground">Duplicate procedure codes identified</td>
                  <td className="p-4 text-center">
                    <Badge variant="destructive" className="text-xs">Critical</Badge>
                  </td>
                  <td className="p-4 text-right text-sm font-semibold text-destructive">$580</td>
                </tr>
                <tr className="border-b hover:bg-muted/20 transition-colors">
                  <td className="p-4 text-sm font-medium text-foreground">Medication</td>
                  <td className="p-4 text-sm text-muted-foreground">Prescription costs above market average</td>
                  <td className="p-4 text-center">
                    <Badge className="bg-warning/10 text-warning border-warning/20 text-xs">Moderate</Badge>
                  </td>
                  <td className="p-4 text-right text-sm font-semibold text-warning">$340</td>
                </tr>
                <tr className="border-b hover:bg-muted/20 transition-colors">
                  <td className="p-4 text-sm font-medium text-foreground">Lab Work</td>
                  <td className="p-4 text-sm text-muted-foreground">Test frequency exceeds standard protocol</td>
                  <td className="p-4 text-center">
                    <Badge className="bg-warning/10 text-warning border-warning/20 text-xs">Moderate</Badge>
                  </td>
                  <td className="p-4 text-right text-sm font-semibold text-warning">$290</td>
                </tr>
              </tbody>
              <tfoot className="bg-muted/30 border-t-2">
                <tr>
                  <td colSpan={3} className="p-4 text-sm font-bold text-foreground">Total Estimated Overcharges</td>
                  <td className="p-4 text-right text-lg font-bold text-success">$2,450</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </Card>

        {/* Included in Report */}
        <Card className="mb-6 p-6 border-secondary/20 shadow-card">
          <h2 className="text-xl font-bold text-foreground mb-4">Your Detailed Report Includes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex gap-3">
              <div className="w-1.5 bg-secondary rounded-full flex-shrink-0" />
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-1">Complete Itemized Analysis</h3>
                <p className="text-sm text-muted-foreground">Line-by-line breakdown of every charge with justification</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-1.5 bg-secondary rounded-full flex-shrink-0" />
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-1">Medicare Benchmark Comparison</h3>
                <p className="text-sm text-muted-foreground">How your charges compare to standard allowable rates</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-1.5 bg-secondary rounded-full flex-shrink-0" />
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-1">Specific Action Items</h3>
                <p className="text-sm text-muted-foreground">Prioritized recommendations for each finding</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-1.5 bg-secondary rounded-full flex-shrink-0" />
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-1">Dispute Letter Templates</h3>
                <p className="text-sm text-muted-foreground">Pre-filled forms ready for submission</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Download Comprehensive Report */}
          <Card className="p-6 text-center border-secondary/20 bg-gradient-to-br from-secondary/5 to-secondary/10 shadow-card">
            <div className="flex justify-center mb-3">
              <div className="p-3 bg-secondary/10 rounded-lg">
                <FileBarChart className="w-7 h-7 text-secondary" />
              </div>
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">
              Download Full Report
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Get your complete comprehensive analysis report with all findings and documentation
            </p>
            <Button 
              size="lg"
              variant="outline"
              className="border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground font-semibold group"
              onClick={() => {
                // User will add their N8n webhook URL here
                const webhookUrl = prompt("Please enter your N8n webhook URL to download the comprehensive report:");
                if (webhookUrl) {
                  fetch(webhookUrl, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    mode: "no-cors",
                    body: JSON.stringify({
                      reportId: "#HBC-2024-1847",
                      timestamp: new Date().toISOString(),
                      requestType: "comprehensive_report"
                    })
                  }).then(() => {
                    alert("Report request sent! Check your email for the download link.");
                  }).catch(() => {
                    alert("Request sent to your webhook. Please check your N8n workflow.");
                  });
                }
              }}
            >
              <FileBarChart className="mr-2 w-5 h-5" />
              Download Report
            </Button>
          </Card>

          {/* Generate Dispute Letter */}
          <Card className="p-6 text-center border-accent/20 bg-gradient-to-br from-accent/5 to-accent/10 shadow-card">
            <div className="flex justify-center mb-3">
              <div className="p-3 bg-accent/10 rounded-lg">
                <FileText className="w-7 h-7 text-accent" />
              </div>
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">
              Generate Dispute Letter
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create a professional dispute letter with your specific billing issues
            </p>
            <Link 
              to="/generate-letter"
              state={{
                issues: [
                  {
                    category: "Pricing",
                    finding: "Charges exceed Medicare allowable by 340%",
                    severity: "Critical",
                    impact: "$1,240",
                    cptCode: "99285",
                    description: "Emergency Department Visit - Level 5",
                    details: "The charged amount of $1,650 significantly exceeds the Medicare allowable rate of $485 for this service code. This represents a 340% markup above standard reimbursement rates."
                  },
                  {
                    category: "Billing Codes",
                    finding: "Duplicate procedure codes identified",
                    severity: "Critical",
                    impact: "$580",
                    cptCode: "80053",
                    description: "Comprehensive Metabolic Panel",
                    details: "CPT code 80053 appears twice on the same date of service (line items 14 and 27), resulting in duplicate billing for identical laboratory work."
                  },
                  {
                    category: "Medication",
                    finding: "Prescription costs above market average",
                    severity: "Moderate",
                    impact: "$340",
                    cptCode: "J2405",
                    description: "Ondansetron Injection",
                    details: "Charged $340 for a single dose of ondansetron, which typically costs $15-30 per dose at market rates."
                  },
                  {
                    category: "Lab Work",
                    finding: "Test frequency exceeds standard protocol",
                    severity: "Moderate",
                    impact: "$290",
                    cptCode: "85025",
                    description: "Complete Blood Count",
                    details: "CBC performed 4 times within 6 hours, exceeding standard medical protocol for monitoring frequency in non-critical care settings."
                  }
                ],
                totalSavings: "$2,450"
              }}
            >
              <Button 
                size="lg"
                className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold group"
              >
                Generate Letter
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Results;
