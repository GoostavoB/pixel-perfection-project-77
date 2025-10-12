import { CheckCircle, AlertCircle, AlertTriangle, DollarSign, Database, Mail, FileText, ArrowRight, Calendar, FileBarChart, TrendingDown } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";

const Results = () => {
  const analysisDate = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

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

        {/* Next Steps CTA */}
        <Card className="p-8 text-center border-accent/20 bg-gradient-to-br from-accent/5 to-accent/10 shadow-card">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-accent/10 rounded-lg">
              <FileText className="w-8 h-8 text-accent" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Next Step: Generate Dispute Letter
          </h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Based on the findings in your report, we can generate a professional dispute letter 
            customized with your specific billing issues and supporting documentation.
          </p>
          <Link to="/generate-letter">
            <Button 
              size="lg"
              className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-8 py-6 text-base group shadow-lg hover:shadow-xl transition-all"
            >
              Generate Your Dispute Letter
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </Card>
      </main>
    </div>
  );
};

export default Results;
