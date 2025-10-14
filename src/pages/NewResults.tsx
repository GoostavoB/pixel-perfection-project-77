import { CheckCircle, AlertCircle, AlertTriangle, Database, FileText, ArrowRight, Calendar, FileBarChart, TrendingDown } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import { useEffect, useState } from "react";
import { downloadHTML } from "@/lib/billAnalysisApi";

const NewResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { uploadResponse, analysisDetails } = (location.state as { 
    uploadResponse?: any; 
    analysisDetails?: any;
  }) || {};
  
  useEffect(() => {
    if (!uploadResponse || !analysisDetails) {
      navigate('/upload');
    }
  }, [uploadResponse, analysisDetails, navigate]);

  if (!uploadResponse || !analysisDetails) return null;

  const analysisDate = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  // Extract data from new structure
  const uiSummary = uploadResponse.ui_summary || {};
  const highPriorityCount = uiSummary.high_priority_count || 0;
  const potentialIssuesCount = uiSummary.potential_issues_count || 0;
  const estimatedSavings = uiSummary.estimated_savings_if_corrected || 0;
  const dataSources = uiSummary.data_sources_used || [];
  const tags = uiSummary.tags || [];
  
  const hospitalName = analysisDetails.hospital_name || '';
  const fullAnalysis = analysisDetails.full_analysis || {};
  const hasPdfReport = !!analysisDetails.pdf_report_html;
  const hasDisputeLetter = !!analysisDetails.dispute_letter_html;

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
                  <span>Job ID: {uploadResponse.job_id.substring(0, 8)}</span>
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
                <span className="text-3xl font-bold text-destructive">{highPriorityCount}</span>
              </div>
              <h3 className="text-sm font-semibold text-foreground mb-1">High Priority</h3>
              <p className="text-xs text-muted-foreground">Require immediate attention</p>
            </Card>

            {/* Potential Issues */}
            <Card className="p-5 border-l-4 border-l-warning hover:shadow-card-hover transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-warning/10 rounded">
                  <AlertTriangle className="w-5 h-5 text-warning" />
                </div>
                <span className="text-3xl font-bold text-warning">{potentialIssuesCount}</span>
              </div>
              <h3 className="text-sm font-semibold text-foreground mb-1">Potential Issues</h3>
              <p className="text-xs text-muted-foreground">For further review</p>
            </Card>

            {/* Savings Potential */}
            <Card className="p-5 border-l-4 border-l-success hover:shadow-card-hover transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-success/10 rounded">
                  <TrendingDown className="w-5 h-5 text-success" />
                </div>
                <span className="text-3xl font-bold text-success">${estimatedSavings.toLocaleString()}</span>
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
                <span className="text-3xl font-bold text-secondary">{dataSources.length}</span>
              </div>
              <h3 className="text-sm font-semibold text-foreground mb-1">Data Sources</h3>
              <p className="text-xs text-muted-foreground">Referenced databases</p>
            </Card>
          </div>
        </div>

        {/* Tags/Issues Summary */}
        {tags.length > 0 && (
          <Card className="mb-6 p-6 shadow-card">
            <h2 className="text-xl font-bold text-foreground mb-4">Identified Issues</h2>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag: string, index: number) => (
                <Badge key={index} variant="outline" className="text-sm px-3 py-1">
                  {tag}
                </Badge>
              ))}
            </div>
          </Card>
        )}

        {hospitalName && (
          <Card className="mb-6 p-6 border-l-4 border-l-secondary shadow-card">
            <div className="flex items-start gap-3">
              <Database className="w-5 h-5 text-secondary mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-1">Facility Information</h3>
                <p className="text-sm text-muted-foreground">{hospitalName}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Data Sources Card */}
        {dataSources.length > 0 && (
          <Card className="mb-6 p-6 shadow-card">
            <h2 className="text-xl font-bold text-foreground mb-4">Data Sources Used</h2>
            <div className="flex flex-wrap gap-2">
              {dataSources.map((source: string, index: number) => (
                <Badge key={index} className="bg-secondary/10 text-secondary border-secondary/20">
                  <Database className="w-3 h-3 mr-1" />
                  {source}
                </Badge>
              ))}
            </div>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Download Full Report */}
          {hasPdfReport && (
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
                Get your complete comprehensive analysis report with detailed CPT code explanations and pricing breakdowns
              </p>
              <Button 
                size="lg"
                variant="outline"
                className="border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground font-semibold group"
                onClick={() => downloadHTML(analysisDetails.pdf_report_html, 'medical-bill-report.html')}
              >
                <FileBarChart className="mr-2 w-5 h-5" />
                Download Report
              </Button>
            </Card>
          )}

          {/* Download Dispute Letter */}
          {hasDisputeLetter && (
            <Card className="p-6 text-center border-accent/20 bg-gradient-to-br from-accent/5 to-accent/10 shadow-card">
              <div className="flex justify-center mb-3">
                <div className="p-3 bg-accent/10 rounded-lg">
                  <FileText className="w-7 h-7 text-accent" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">
                Download Dispute Letter
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Professional dispute letter based on your analysis findings, ready to send
              </p>
              <Button 
                size="lg"
                className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold group"
                onClick={() => downloadHTML(analysisDetails.dispute_letter_html, 'dispute-letter.html')}
              >
                Download Letter
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Card>
          )}
        </div>

        {/* Back to Upload */}
        <div className="text-center">
          <Button 
            variant="outline"
            onClick={() => navigate('/upload')}
          >
            Analyze Another Bill
          </Button>
        </div>
      </main>
    </div>
  );
};

export default NewResults;
