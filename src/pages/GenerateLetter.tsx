import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FileText, Download, Copy, CheckCircle, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import Header from "@/components/Header";
import { toast } from "sonner";

interface BillingIssue {
  category: string;
  finding: string;
  severity: string;
  impact: string;
  cptCode: string;
  description: string;
  details: string;
}

const GenerateLetter = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [copied, setCopied] = useState(false);
  
  const billingIssues = (location.state?.issues as BillingIssue[]) || [];
  const totalSavings = location.state?.totalSavings || "$0";
  
  const [formData, setFormData] = useState({
    patientName: "",
    patientAddress: "",
    patientCity: "",
    patientPhone: "",
    patientEmail: "",
    patientDob: "",
    providerName: "",
    providerAddress: "",
    providerCity: "",
    accountNumber: "",
    dateOfService: "",
  });

  const currentDate = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const generateIssuesSection = () => {
    if (billingIssues.length === 0) return "";
    
    let section = "DISPUTED CHARGES - ITEMIZED FINDINGS\n\n";
    section += "Based on my thorough analysis of the itemized bill, I am disputing the following charges:\n\n";
    
    billingIssues.forEach((issue, index) => {
      section += `${index + 1}. ${issue.category} - ${issue.finding}\n`;
      section += `   CPT Code: ${issue.cptCode} - ${issue.description}\n`;
      section += `   Disputed Amount: ${issue.impact}\n`;
      section += `   \n`;
      section += `   Reason for Dispute:\n`;
      section += `   ${issue.details}\n`;
      section += `   \n`;
      
      if (issue.severity === "Critical") {
        section += `   Required Action: This charge must be removed or corrected immediately as it violates billing standards and regulations.\n`;
      } else {
        section += `   Required Action: This charge should be reviewed and adjusted to reflect fair market rates and standard billing practices.\n`;
      }
      section += `\n`;
    });
    
    return section;
  };

  const generateLetter = () => {
    const issuesSection = generateIssuesSection();
    
    return `${formData.patientName}
${formData.patientAddress}
${formData.patientCity}
${formData.patientPhone}
${formData.patientEmail}

${currentDate}

Billing Department
${formData.providerName}
${formData.providerAddress}
${formData.providerCity}

RE: Medical Bill Dispute
Account Number: ${formData.accountNumber}
Date of Service: ${formData.dateOfService}
Patient Name: ${formData.patientName}
Date of Birth: ${formData.patientDob}

---

Dear Billing Department,

I am writing to formally dispute charges on the above-referenced medical bill. After careful review of the itemized statement and comparison with standard medical billing practices and regulatory guidelines, I have identified significant billing errors that require immediate correction.

---

${issuesSection}

SUMMARY OF REQUESTED CORRECTIONS

Total Disputed Amount: ${totalSavings}

I am requesting a comprehensive review of all charges listed above and appropriate adjustments to reflect accurate billing practices, standard medical protocols, and compliance with applicable healthcare billing regulations.

---

REQUESTED ACTIONS & TIMELINE

1. Acknowledge receipt of this dispute within 7 business days
2. Suspend all collection activity immediately pending resolution
3. Conduct internal audit of all charges identified above
4. Provide corrected, itemized bill within 30 days showing:
   - All adjustments made with explanations
   - Remaining patient responsibility (if any)
   - Confirmation of compliance with applicable laws and regulations
   - Detailed breakdown of how corrected amounts were calculated

5. Confirm in writing that:
   - No negative credit reporting will occur during or as a result of this dispute
   - All collection activity is suspended pending resolution
   - My account remains in good standing
   - This dispute will not affect my ability to receive future care at your facility

---

DOCUMENTATION ENCLOSED

Please find enclosed:
☐ Copy of original itemized bill
☐ Explanation of Benefits (EOB) from insurance
☐ Medical records excerpts
☐ Insurance card (front and back)

---

CONTACT INFORMATION

I can be reached at:
Phone: ${formData.patientPhone}
Email: ${formData.patientEmail}
Preferred contact method: Email

I expect a written response within 30 days of receipt of this letter. If these billing errors are not corrected in a timely manner, I am prepared to:

1. File a complaint with my State Department of Insurance
2. File a complaint with the Consumer Financial Protection Bureau
3. File a complaint with the Centers for Medicare & Medicaid Services if applicable
4. Request mediation through my insurance company
5. Consult with a patient advocacy organization or healthcare attorney

I trust this matter can be resolved professionally and promptly. I am a reasonable person seeking only to pay what is legally and correctly owed according to standard billing practices and applicable regulations.

Thank you for your immediate attention to this matter.

Sincerely,


${formData.patientName}
Date: ${currentDate}

---

CC: [Insurance Company Name] - Member Services
    Patient Account Records`;
  };

  const handleCopyLetter = () => {
    const letter = generateLetter();
    navigator.clipboard.writeText(letter);
    setCopied(true);
    toast.success("Letter copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrintLetter = () => {
    window.print();
  };

  const handleDownloadLetter = () => {
    const letter = generateLetter();
    const blob = new Blob([letter], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Medical-Bill-Dispute-Letter-${formData.accountNumber || 'draft'}.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    toast.success("Letter downloaded successfully!");
  };

  const isFormValid = () => {
    return formData.patientName && 
           formData.patientEmail && 
           formData.providerName && 
           formData.accountNumber;
  };

  return (
    <div className="min-h-screen bg-background print:bg-white">
      <Header />
      
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-content, .print-content * {
            visibility: visible;
          }
          .print-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
      
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-accent/10 rounded-lg">
              <FileText className="w-6 h-6 text-accent" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">
              Generate Professional Dispute Letter
            </h1>
          </div>
          <p className="text-muted-foreground">
            Fill in your information below to generate a professional, legally-sound dispute letter 
            based on your bill analysis findings.
          </p>
          <Separator className="my-4" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form Section */}
          <Card className="p-6 shadow-card">
            <h2 className="text-xl font-bold text-foreground mb-4">Your Information</h2>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="patientName">Full Name *</Label>
                <Input
                  id="patientName"
                  name="patientName"
                  value={formData.patientName}
                  onChange={handleInputChange}
                  placeholder="John Smith"
                  required
                />
              </div>

              <div>
                <Label htmlFor="patientAddress">Street Address *</Label>
                <Input
                  id="patientAddress"
                  name="patientAddress"
                  value={formData.patientAddress}
                  onChange={handleInputChange}
                  placeholder="123 Main Street"
                  required
                />
              </div>

              <div>
                <Label htmlFor="patientCity">City, State, ZIP *</Label>
                <Input
                  id="patientCity"
                  name="patientCity"
                  value={formData.patientCity}
                  onChange={handleInputChange}
                  placeholder="New York, NY 10001"
                  required
                />
              </div>

              <div>
                <Label htmlFor="patientPhone">Phone Number *</Label>
                <Input
                  id="patientPhone"
                  name="patientPhone"
                  value={formData.patientPhone}
                  onChange={handleInputChange}
                  placeholder="(555) 123-4567"
                  required
                />
              </div>

              <div>
                <Label htmlFor="patientEmail">Email Address *</Label>
                <Input
                  id="patientEmail"
                  name="patientEmail"
                  type="email"
                  value={formData.patientEmail}
                  onChange={handleInputChange}
                  placeholder="john.smith@email.com"
                  required
                />
              </div>

              <div>
                <Label htmlFor="patientDob">Date of Birth</Label>
                <Input
                  id="patientDob"
                  name="patientDob"
                  type="date"
                  value={formData.patientDob}
                  onChange={handleInputChange}
                />
              </div>

              <Separator className="my-6" />
              
              <h3 className="text-lg font-bold text-foreground mb-4">Provider Information</h3>

              <div>
                <Label htmlFor="providerName">Hospital/Provider Name *</Label>
                <Input
                  id="providerName"
                  name="providerName"
                  value={formData.providerName}
                  onChange={handleInputChange}
                  placeholder="General Hospital"
                  required
                />
              </div>

              <div>
                <Label htmlFor="providerAddress">Provider Address</Label>
                <Input
                  id="providerAddress"
                  name="providerAddress"
                  value={formData.providerAddress}
                  onChange={handleInputChange}
                  placeholder="456 Hospital Ave"
                />
              </div>

              <div>
                <Label htmlFor="providerCity">Provider City, State, ZIP</Label>
                <Input
                  id="providerCity"
                  name="providerCity"
                  value={formData.providerCity}
                  onChange={handleInputChange}
                  placeholder="New York, NY 10002"
                />
              </div>

              <Separator className="my-6" />
              
              <h3 className="text-lg font-bold text-foreground mb-4">Bill Details</h3>

              <div>
                <Label htmlFor="accountNumber">Account Number *</Label>
                <Input
                  id="accountNumber"
                  name="accountNumber"
                  value={formData.accountNumber}
                  onChange={handleInputChange}
                  placeholder="ACC-2024-1234"
                  required
                />
              </div>

              <div>
                <Label htmlFor="dateOfService">Date of Service</Label>
                <Input
                  id="dateOfService"
                  name="dateOfService"
                  type="date"
                  value={formData.dateOfService}
                  onChange={handleInputChange}
                />
              </div>

            </div>
          </Card>

          {/* Preview Section */}
          <div className="space-y-6">
            <Card className="p-0 shadow-card overflow-hidden">
              <div className="p-6 bg-muted/30 border-b no-print">
                <h2 className="text-xl font-bold text-foreground">Letter Preview</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Professional dispute letter with {billingIssues.length} identified billing issue{billingIssues.length !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="bg-white p-8 md:p-12 max-h-[700px] overflow-y-auto print-content">
                <div className="max-w-[8.5in] mx-auto space-y-6" style={{ fontFamily: 'Times New Roman, serif' }}>
                  {/* Header */}
                  <div className="space-y-1">
                    <div className="font-bold text-base">{formData.patientName || "[Your Name]"}</div>
                    <div className="text-sm">{formData.patientAddress || "[Your Address]"}</div>
                    <div className="text-sm">{formData.patientCity || "[City, State ZIP]"}</div>
                    <div className="text-sm">{formData.patientPhone || "[Your Phone]"}</div>
                    <div className="text-sm">{formData.patientEmail || "[Your Email]"}</div>
                  </div>

                  <div className="text-sm">{currentDate}</div>

                  {/* Provider Info */}
                  <div className="space-y-1">
                    <div className="text-sm">Billing Department</div>
                    <div className="text-sm font-semibold">{formData.providerName || "[Provider Name]"}</div>
                    <div className="text-sm">{formData.providerAddress || "[Provider Address]"}</div>
                    <div className="text-sm">{formData.providerCity || "[City, State ZIP]"}</div>
                  </div>

                  <div className="border-t border-b border-gray-300 py-2 my-4">
                    <div className="font-bold text-sm">RE: Medical Bill Dispute</div>
                    <div className="text-sm mt-1">
                      <div><span className="font-semibold">Account Number:</span> {formData.accountNumber || "[Account Number]"}</div>
                      <div><span className="font-semibold">Date of Service:</span> {formData.dateOfService || "[Date of Service]"}</div>
                      <div><span className="font-semibold">Patient Name:</span> {formData.patientName || "[Patient Name]"}</div>
                      <div><span className="font-semibold">Date of Birth:</span> {formData.patientDob || "[Date of Birth]"}</div>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="text-sm space-y-4">
                    <div>Dear Billing Department,</div>
                    
                    <div className="text-justify">
                      I am writing to formally dispute charges on the above-referenced medical bill. After careful review of the itemized statement and comparison with standard medical billing practices and regulatory guidelines, I have identified significant billing errors that require immediate correction.
                    </div>

                    {billingIssues.length > 0 && (
                      <>
                        <div className="border-t-2 border-gray-400 my-6"></div>
                        
                        <div>
                          <div className="font-bold text-lg mb-4 uppercase text-center" style={{ letterSpacing: '0.5px' }}>
                            DISPUTED CHARGES - ITEMIZED FINDINGS
                          </div>
                          <div className="text-justify mb-4 bg-gray-50 p-3 border-l-4 border-gray-400">
                            Based on my thorough analysis of the itemized bill, I am disputing the following charges:
                          </div>
                          
                          <div className="space-y-4">
                            {billingIssues.map((issue, index) => (
                              <div key={index} className="pl-4">
                                <div className="font-semibold mb-1">
                                  {index + 1}. {issue.category} - {issue.finding}
                                </div>
                                <div className="mb-1 ml-3">
                                  <span className="font-semibold">CPT Code:</span> {issue.cptCode} - {issue.description}
                                </div>
                                <div className="mb-1 ml-3">
                                  <span className="font-semibold">Disputed Amount:</span> {issue.impact}
                                </div>
                                <div className="mb-2 ml-3 text-justify">
                                  <span className="font-semibold">Reason for Dispute:</span>
                                  <br />
                                  {issue.details}
                                </div>
                                <div className="mb-2 ml-3 italic">
                                  <span className="font-semibold">Required Action:</span> {issue.severity === "Critical" 
                                    ? "This charge must be removed or corrected immediately as it violates billing standards and regulations."
                                    : "This charge should be reviewed and adjusted to reflect fair market rates and standard billing practices."}
                                </div>
                                {index < billingIssues.length - 1 && (
                                  <div className="border-t border-gray-200 mt-3 mb-3"></div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="border-t border-gray-300 my-4"></div>

                        <div>
                          <div className="font-bold text-base mb-2">SUMMARY OF REQUESTED CORRECTIONS</div>
                          <div className="text-base">
                            <span className="font-semibold">Total Disputed Amount:</span> {totalSavings}
                          </div>
                          <div className="mt-2 text-justify">
                            I am requesting a comprehensive review of all charges listed above and appropriate adjustments to reflect accurate billing practices, standard medical protocols, and compliance with applicable healthcare billing regulations.
                          </div>
                        </div>

                        <div className="border-t border-gray-300 my-4"></div>
                      </>
                    )}

                    <div>
                      <div className="font-bold text-base mb-2">REQUESTED ACTIONS & TIMELINE</div>
                      <ol className="list-decimal list-inside space-y-1 ml-2">
                        <li>Acknowledge receipt of this dispute within 7 business days</li>
                        <li>Suspend all collection activity immediately pending resolution</li>
                        <li>Conduct internal audit of all charges identified above</li>
                        <li>Provide corrected, itemized bill within 30 days showing:
                          <ul className="list-disc list-inside ml-6 mt-1">
                            <li>All adjustments made with explanations</li>
                            <li>Remaining patient responsibility (if any)</li>
                            <li>Confirmation of compliance with applicable laws</li>
                          </ul>
                        </li>
                        <li>Confirm in writing that:
                          <ul className="list-disc list-inside ml-6 mt-1">
                            <li>No negative credit reporting will occur</li>
                            <li>Collection activity is suspended pending resolution</li>
                            <li>My account remains in good standing</li>
                          </ul>
                        </li>
                      </ol>
                    </div>

                    <div className="border-t border-gray-300 my-4"></div>

                    <div>
                      <div className="font-bold text-base mb-2">CONTACT INFORMATION</div>
                      <div>I can be reached at:</div>
                      <div className="ml-4">
                        <div><span className="font-semibold">Phone:</span> {formData.patientPhone || "[Your Phone]"}</div>
                        <div><span className="font-semibold">Email:</span> {formData.patientEmail || "[Your Email]"}</div>
                        <div><span className="font-semibold">Preferred contact method:</span> Email</div>
                      </div>
                    </div>

                    <div className="text-justify">
                      I expect a written response within 30 days of receipt of this letter. If these billing errors are not corrected in a timely manner, I am prepared to file complaints with the appropriate regulatory agencies and consult with patient advocacy resources.
                    </div>

                    <div className="text-justify">
                      I trust this matter can be resolved professionally and promptly. I am a reasonable person seeking only to pay what is legally and correctly owed according to standard billing practices and applicable regulations.
                    </div>

                    <div>Thank you for your immediate attention to this matter.</div>

                    <div className="mt-8">
                      <div>Sincerely,</div>
                      <div className="mt-12 border-b border-gray-400 w-48"></div>
                      <div className="mt-1 font-semibold">{formData.patientName || "[Your Name]"}</div>
                      <div>Date: {currentDate}</div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-accent/5 to-accent/10 border-accent/20 shadow-card no-print">
              <h3 className="text-lg font-bold text-foreground mb-4">Download Your Letter</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Once you've filled in all required information, you can print, copy, or download your professional dispute letter.
              </p>
              <div className="grid grid-cols-3 gap-3">
                <Button
                  onClick={handlePrintLetter}
                  disabled={!isFormValid()}
                  variant="outline"
                >
                  <Printer className="mr-2 w-4 h-4" />
                  Print
                </Button>
                <Button
                  onClick={handleCopyLetter}
                  disabled={!isFormValid()}
                  variant="outline"
                >
                  {copied ? (
                    <>
                      <CheckCircle className="mr-2 w-4 h-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 w-4 h-4" />
                      Copy
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleDownloadLetter}
                  disabled={!isFormValid()}
                  className="bg-accent hover:bg-accent/90"
                >
                  <Download className="mr-2 w-4 h-4" />
                  Download
                </Button>
              </div>
            </Card>

            <Card className="p-4 border-warning/20 bg-warning/5 no-print">
              <h4 className="text-sm font-bold text-foreground mb-2">Important Tips:</h4>
              <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                <li>Send via certified mail with return receipt requested</li>
                <li>Keep copies of all correspondence for your records</li>
                <li>Include supporting documentation (EOB, itemized bill, etc.)</li>
                <li>Follow up if you don't receive a response within 30 days</li>
              </ul>
            </Card>

            {billingIssues.length > 0 && (
              <Card className="p-4 border-success/20 bg-success/5 no-print">
                <h4 className="text-sm font-bold text-foreground mb-2">✓ Bill Analysis Complete</h4>
                <p className="text-xs text-muted-foreground mb-2">
                  Your letter includes {billingIssues.length} specific billing issue{billingIssues.length !== 1 ? 's' : ''} with detailed documentation:
                </p>
                <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside ml-2">
                  {billingIssues.map((issue, index) => (
                    <li key={index}>{issue.category}: {issue.impact}</li>
                  ))}
                </ul>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default GenerateLetter;
