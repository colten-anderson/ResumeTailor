import { useState } from "react";
import { Download, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
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
  const [jobDescription, setJobDescription] = useState("");
  const [originalResume, setOriginalResume] = useState("");
  const [tailoredResume, setTailoredResume] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    // TODO: Parse file content here
    // Simulate parsing
    const mockContent = `${file.name.toUpperCase().replace(/\.(PDF|DOCX)$/i, '')}
Software Engineer

CONTACT
Email: user@email.com
Phone: (555) 123-4567

EXPERIENCE
Software Engineer | Previous Company
2020 - Present
• Developed web applications
• Collaborated with teams
• Implemented features

SKILLS
JavaScript, React, Node.js, Python`;
    
    setOriginalResume(mockContent);
    toast({
      title: "Resume uploaded",
      description: "File parsed successfully",
    });
  };

  const handleNext = () => {
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
      // Simulate AI processing
      setIsProcessing(true);
      setCurrentStep(3);
      
      setTimeout(() => {
        // TODO: Call AI API here
        const mockTailored = `${selectedFile?.name.toUpperCase().replace(/\.(PDF|DOCX)$/i, '') || 'RESUME'}
Senior Software Engineer

CONTACT
Email: user@email.com
Phone: (555) 123-4567
LinkedIn: linkedin.com/in/user

PROFESSIONAL SUMMARY
Results-driven software engineer with expertise in modern web technologies
and proven track record of delivering scalable solutions.

EXPERIENCE
Software Engineer | Previous Company
2020 - Present
• Architected and developed full-stack web applications using React and Node.js
• Led cross-functional teams to deliver high-impact features
• Implemented CI/CD pipelines improving deployment efficiency by 50%
• Mentored junior developers and conducted code reviews

TECHNICAL SKILLS
Frontend: JavaScript, React, TypeScript, HTML5, CSS3
Backend: Node.js, Python, Express, RESTful APIs
Tools: Git, Docker, AWS, CI/CD, Agile methodologies

ACHIEVEMENTS
• Optimized application performance resulting in 40% faster load times
• Successfully delivered 15+ production features on schedule`;
        
        setTailoredResume(mockTailored);
        setIsProcessing(false);
        setCurrentStep(4);
        toast({
          title: "Resume tailored!",
          description: "Your resume has been optimized for this position",
        });
      }, 2500);
      return;
    }

    setCurrentStep(currentStep + 1);
  };

  const handleDownload = (format: 'txt' | 'pdf') => {
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
  };

  const handleReset = () => {
    setCurrentStep(1);
    setSelectedFile(null);
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
          <ThemeToggle />
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
                <div className="flex justify-center gap-4">
                  <Button 
                    variant="outline" 
                    onClick={handleReset}
                    data-testid="button-start-over"
                  >
                    Start Over
                  </Button>
                  <Button 
                    onClick={() => handleDownload('txt')}
                    data-testid="button-download-txt"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download as TXT
                  </Button>
                  <Button 
                    onClick={() => handleDownload('pdf')}
                    data-testid="button-download-pdf"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download as PDF
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
