import { useState, useEffect } from "react";
import { Download, FileDown, LogOut, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import ThemeToggle from "@/components/ThemeToggle";
import ProgressStepper from "@/components/ProgressStepper";
import FileUpload from "@/components/FileUpload";
import JobDescriptionInput from "@/components/JobDescriptionInput";
import ResumeComparison from "@/components/ResumeComparison";
import LoadingSpinner from "@/components/LoadingSpinner";

const steps = [
  { id: 1, label: 'Upload Resume' },
  { id: 2, label: 'Add Job Details' },
  { id: 3, label: 'AI Tailoring' },
  { id: 4, label: 'Download' },
];

export default function Home() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [sessionId, setSessionId] = useState<string>("");
  const [jobDescription, setJobDescription] = useState("");
  const [originalResume, setOriginalResume] = useState("");
  const [tailoredResume, setTailoredResume] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();
  
  const isPro = user?.accountTier === 'pro';
  
  // Check for unauthorized errors
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [isAuthenticated, isLoading, toast]);

  const handleFileSelect = async (file: File) => {
    setSelectedFile(file);
    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('resume', file);
      
      const response = await fetch('/api/upload-resume', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload resume');
      }
      
      const data = await response.json();
      setSessionId(data.sessionId);
      setOriginalResume(data.content);
      
      toast({
        title: "Resume uploaded",
        description: "File parsed successfully",
      });
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload and parse resume",
        variant: "destructive",
      });
      setSelectedFile(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleNext = async () => {
    if (currentStep === 1 && !selectedFile) {
      toast({
        title: "No file selected",
        description: "Please upload your resume first",
        variant: "destructive",
      });
      return;
    }
    
    if (currentStep === 2 && jobDescription.length < 50) {
      toast({
        title: "Job description too short",
        description: "Please enter at least 50 characters",
        variant: "destructive",
      });
      return;
    }

    if (currentStep === 2) {
      setIsProcessing(true);
      setCurrentStep(3);
      
      try {
        const response = await fetch('/api/tailor-resume', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sessionId,
            jobDescription,
          }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to tailor resume');
        }
        
        const data = await response.json();
        setTailoredResume(data.tailoredContent);
        setIsProcessing(false);
        setCurrentStep(4);
        
        toast({
          title: "Resume tailored!",
          description: "Your resume has been optimized for this position",
        });
      } catch (error: any) {
        setIsProcessing(false);
        setCurrentStep(2);
        toast({
          title: "Tailoring failed",
          description: error.message || "Failed to tailor resume",
          variant: "destructive",
        });
      }
      return;
    }

    setCurrentStep(currentStep + 1);
  };

  const handleDownload = async (format: 'txt' | 'docx' | 'pdf') => {
    // Check if user needs pro for this format
    if ((format === 'docx' || format === 'pdf') && !isPro) {
      toast({
        title: "Pro Account Required",
        description: `Upgrade to Pro to download as ${format.toUpperCase()}`,
        variant: "destructive",
      });
      return;
    }
    
    if (format === 'txt') {
      const blob = new Blob([tailoredResume], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tailored-resume.${format}`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast({
        title: "Download started",
        description: `Your tailored resume is downloading as ${format.toUpperCase()}`,
      });
    } else {
      try {
        const response = await fetch(`/api/download/${format}/${sessionId}`);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          if (response.status === 403) {
            throw new Error(errorData.error || "Pro account required for downloads");
          }
          throw new Error(`Failed to download ${format.toUpperCase()}`);
        }
        
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `tailored-resume.${format}`;
        a.click();
        URL.revokeObjectURL(url);
        
        toast({
          title: "Download started",
          description: `Your tailored resume is downloading as ${format.toUpperCase()}`,
        });
      } catch (error: any) {
        if (isUnauthorizedError(error)) {
          toast({
            title: "Unauthorized",
            description: "You are logged out. Logging in again...",
            variant: "destructive",
          });
          setTimeout(() => {
            window.location.href = "/api/login";
          }, 500);
          return;
        }
        
        toast({
          title: "Download failed",
          description: error.message || `Failed to download ${format.toUpperCase()}`,
          variant: "destructive",
        });
      }
    }
  };
  
  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(tailoredResume);
    toast({
      title: "Copied to clipboard",
      description: "Resume content has been copied",
    });
  };

  const handleReset = () => {
    setCurrentStep(1);
    setSelectedFile(null);
    setSessionId("");
    setJobDescription("");
    setOriginalResume("");
    setTailoredResume("");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileDown className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">Resume Tailor</h1>
          </div>
          <div className="flex items-center gap-3">
            {user && (
              <>
                <Badge 
                  variant={isPro ? "default" : "secondary"} 
                  className="gap-1"
                  data-testid="badge-account-tier"
                >
                  {isPro && <Crown className="h-3 w-3" />}
                  {isPro ? "Pro" : "Free"}
                </Badge>
                <span className="text-sm text-muted-foreground hidden sm:inline" data-testid="text-user-email">
                  {user.email}
                </span>
              </>
            )}
            <ThemeToggle />
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleLogout}
              data-testid="button-logout"
            >
              <LogOut className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">
              Optimize Your Resume with AI
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Upload your resume and paste a job description to get a tailored version
              that highlights your most relevant skills and experience
            </p>
          </div>

          <ProgressStepper steps={steps} currentStep={currentStep} />

          <div className="py-8">
            {currentStep === 1 && (
              <div className="space-y-6">
                <FileUpload onFileSelect={handleFileSelect} />
                {selectedFile && (
                  <div className="flex justify-center">
                    <Button 
                      onClick={handleNext} 
                      size="lg"
                      data-testid="button-next-step"
                    >
                      Continue to Job Details
                    </Button>
                  </div>
                )}
              </div>
            )}

            {currentStep === 2 && (
              <div className="max-w-4xl mx-auto space-y-6">
                <JobDescriptionInput 
                  value={jobDescription} 
                  onChange={setJobDescription}
                />
                <div className="flex justify-center gap-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setCurrentStep(1)}
                    data-testid="button-back"
                  >
                    Back
                  </Button>
                  <Button 
                    onClick={handleNext} 
                    size="lg"
                    disabled={jobDescription.length < 50}
                    data-testid="button-tailor-resume"
                  >
                    Tailor Resume with AI
                  </Button>
                </div>
              </div>
            )}

            {currentStep === 3 && isProcessing && (
              <div className="max-w-2xl mx-auto">
                <LoadingSpinner message="Analyzing resume and job requirements..." />
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-6">
                <ResumeComparison 
                  originalContent={originalResume}
                  tailoredContent={tailoredResume}
                />
                <div className="flex flex-col items-center gap-4">
                  {!isPro && (
                    <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 max-w-2xl text-center">
                      <p className="text-sm font-medium mb-2 flex items-center justify-center gap-2">
                        <Crown className="h-4 w-4 text-primary" />
                        Upgrade to Pro for Professional Downloads
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Pro accounts can download tailored resumes as DOCX and PDF in Professional and Modern formats.
                        Currently available: Copy to clipboard
                      </p>
                    </div>
                  )}
                  <div className="flex flex-wrap justify-center gap-3">
                    {isPro ? (
                      <>
                        <Button 
                          onClick={() => handleDownload('docx')}
                          size="lg"
                          data-testid="button-download-docx"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download as DOCX
                        </Button>
                        <Button 
                          onClick={() => handleDownload('pdf')}
                          size="lg"
                          data-testid="button-download-pdf"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download as PDF
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button 
                          onClick={() => handleDownload('docx')}
                          size="lg"
                          variant="outline"
                          disabled
                          data-testid="button-download-docx-disabled"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download as DOCX (Pro)
                        </Button>
                        <Button 
                          onClick={() => handleDownload('pdf')}
                          size="lg"
                          variant="outline"
                          disabled
                          data-testid="button-download-pdf-disabled"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download as PDF (Pro)
                        </Button>
                      </>
                    )}
                    <Button 
                      variant="outline"
                      onClick={() => handleDownload('txt')}
                      size="lg"
                      data-testid="button-download-txt"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download as TXT
                    </Button>
                  </div>
                  <div className="flex flex-wrap justify-center gap-3">
                    <Button 
                      variant="outline"
                      onClick={handleCopyToClipboard}
                      data-testid="button-copy-clipboard"
                    >
                      Copy to Clipboard
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={handleReset}
                      data-testid="button-start-over"
                    >
                      Start Over
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
