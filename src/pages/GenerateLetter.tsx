import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Download, Copy, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import Header from "@/components/Header";
import { toast } from "sonner";

const GenerateLetter = () => {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
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
    issueDescription: "",
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

  const generateLetter = () => {
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

Dear Billing Department,

I am writing to formally dispute charges on the above-referenced medical bill. After careful review of the itemized statement, I have identified significant billing errors and potential violations of federal law that require immediate correction.

${formData.issueDescription}

REQUESTED ACTIONS & TIMELINE

1. Acknowledge receipt of this dispute within 7 business days
2. Suspend all collection activity immediately
3. Conduct internal audit of the charges identified above
4. Provide corrected, itemized bill within 30 days showing:
   - All adjustments made
   - Remaining patient responsibility (if any)
   - Confirmation of compliance with applicable laws

5. Confirm in writing that:
   - No negative credit reporting will occur
   - Collection activity is suspended pending resolution
   - My account is in good standing

CONTACT INFORMATION

I can be reached at:
- Phone: ${formData.patientPhone}
- Email: ${formData.patientEmail}

I expect a written response within 30 days. If these billing errors are not corrected, I am prepared to:

1. File a No Surprises Act complaint with CMS (cms.gov/nosurprises)
2. File a complaint with my State Department of Insurance
3. File a complaint with the Consumer Financial Protection Bureau
4. Request mediation through my insurance company
5. Consult with a patient advocacy organization or attorney

I trust this matter can be resolved professionally and promptly. I am a reasonable person seeking only to pay what is legally and correctly owed.

Thank you for your immediate attention to this matter.

Sincerely,

${formData.patientName}
Date: ${currentDate}`;
  };

  const handleCopyLetter = () => {
    const letter = generateLetter();
    navigator.clipboard.writeText(letter);
    setCopied(true);
    toast.success("Letter copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadLetter = () => {
    const letter = generateLetter();
    const blob = new Blob([letter], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dispute-letter-${formData.accountNumber || 'draft'}.txt`;
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
           formData.accountNumber &&
           formData.issueDescription;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
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

              <div>
                <Label htmlFor="issueDescription">Issue Description *</Label>
                <Textarea
                  id="issueDescription"
                  name="issueDescription"
                  value={formData.issueDescription}
                  onChange={handleInputChange}
                  placeholder="Describe the billing issues you identified (e.g., duplicate charges, incorrect coding, balance billing violations, etc.)"
                  rows={6}
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Include specific details from your bill analysis: CPT codes, amounts, and why you're disputing them.
                </p>
              </div>
            </div>
          </Card>

          {/* Preview Section */}
          <div className="space-y-6">
            <Card className="p-6 shadow-card">
              <h2 className="text-xl font-bold text-foreground mb-4">Letter Preview</h2>
              <div className="bg-muted/30 rounded-lg p-4 max-h-[600px] overflow-y-auto">
                <pre className="text-sm text-foreground whitespace-pre-wrap font-mono">
                  {generateLetter()}
                </pre>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-accent/5 to-accent/10 border-accent/20 shadow-card">
              <h3 className="text-lg font-bold text-foreground mb-4">Download Your Letter</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Once you've filled in all required information, you can copy or download your professional dispute letter.
              </p>
              <div className="flex gap-3">
                <Button
                  onClick={handleCopyLetter}
                  disabled={!isFormValid()}
                  className="flex-1"
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
                      Copy Letter
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleDownloadLetter}
                  disabled={!isFormValid()}
                  className="flex-1 bg-accent hover:bg-accent/90"
                >
                  <Download className="mr-2 w-4 h-4" />
                  Download
                </Button>
              </div>
            </Card>

            <Card className="p-4 border-warning/20 bg-warning/5">
              <h4 className="text-sm font-bold text-foreground mb-2">Important Tips:</h4>
              <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                <li>Send via certified mail with return receipt requested</li>
                <li>Keep copies of all correspondence for your records</li>
                <li>Include supporting documentation (EOB, itemized bill, etc.)</li>
                <li>Follow up if you don't receive a response within 30 days</li>
              </ul>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default GenerateLetter;
