import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Upload as UploadIcon, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Header from "@/components/Header";
import { useToast } from "@/hooks/use-toast";

const Upload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Check for empty or corrupted file
      if (selectedFile.size === 0) {
        toast({
          title: "Invalid file",
          description: "The selected file appears to be empty or corrupted. Please try a different file.",
          variant: "destructive",
        });
        return;
      }
      
      setFile(selectedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      
      // Check for empty or corrupted file
      if (droppedFile.size === 0) {
        toast({
          title: "Invalid file",
          description: "The selected file appears to be empty or corrupted. Please try a different file.",
          variant: "destructive",
        });
        return;
      }
      
      setFile(droppedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a medical bill to analyze",
        variant: "destructive",
      });
      return;
    }

    // Check for empty or corrupted file
    if (file.size === 0) {
      toast({
        title: "Invalid file",
        description: "The selected file appears to be empty or corrupted. Please try uploading a different file or convert it to JPG/PNG format.",
        variant: "destructive",
      });
      return;
    }

    // Validate file (PDF, Images, Excel - max 10MB)
    const validTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/heic',
      'image/heif',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ];
    
    const isValidType = validTypes.some(type => file.type.includes(type)) || 
                       file.name.toLowerCase().endsWith('.heic') ||
                       file.name.toLowerCase().endsWith('.heif');
    
    if (!isValidType) {
      toast({
        title: "Invalid file type",
        description: "Only PDF, JPG, PNG, HEIC images, or Excel files are accepted",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Maximum file size is 10MB",
        variant: "destructive",
      });
      return;
    }

    // Navigate to processing page immediately
    navigate("/processing", { state: { file, fileName: file.name } });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Upload Your Medical Bill
          </h1>
          <p className="text-lg text-muted-foreground mb-2">
            Fast, simple, and secure analysis
          </p>
          <p className="text-xl font-semibold text-primary">
            80% of medical bills contain errors
          </p>
        </div>

        <Card className="max-w-2xl mx-auto p-8 animate-scale-in">
          <div
            className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
              isDragging
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center gap-4">
              {file ? (
                <>
                  <FileText className="h-16 w-16 text-primary" />
                  <p className="text-lg font-medium text-foreground">{file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </>
              ) : (
                <>
                  <UploadIcon className="h-16 w-16 text-muted-foreground" />
                  <div>
                    <p className="text-lg font-medium text-foreground mb-2">
                      Drag and drop your medical bill here
                    </p>
                    <p className="text-sm text-muted-foreground">
                      or click to browse
                    </p>
                  </div>
                </>
              )}
            </div>

            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.heic,.heif,.xlsx,.xls,image/*"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload">
              <Button
                variant="outline"
                className="mt-6 cursor-pointer"
                onClick={() => document.getElementById("file-upload")?.click()}
              >
                {file ? "Choose Different File" : "Select File"}
              </Button>
            </label>
          </div>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>Accepted formats: PDF, JPG, PNG, HEIC (iPhone screenshots), Excel</p>
            <p className="mt-2">Maximum file size: 10MB</p>
          </div>

          {file && (
            <Button
              size="lg"
              className="w-full mt-8"
              onClick={handleUpload}
            >
              Analyze My Bill
            </Button>
          )}
        </Card>

        <div className="max-w-2xl mx-auto mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            🔒 Your data is encrypted and confidential. We do not share your information.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Upload;
