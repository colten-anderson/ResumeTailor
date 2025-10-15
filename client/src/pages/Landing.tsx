import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Sparkles, Download, Check } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <FileText className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-bold">Resume Tailor</h1>
          </div>
          <Button onClick={handleLogin} data-testid="button-login">
            Log In
          </Button>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">
            Optimize Your Resume with AI
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Tailor your resume for any job posting in seconds using the power of AI
          </p>
          <Button onClick={handleLogin} size="lg" data-testid="button-get-started">
            Get Started Free
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardHeader>
              <FileText className="w-12 h-12 text-primary mb-2" />
              <CardTitle>Upload Resume</CardTitle>
              <CardDescription>
                Upload your resume in PDF or DOCX format
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Sparkles className="w-12 h-12 text-primary mb-2" />
              <CardTitle>AI Tailoring</CardTitle>
              <CardDescription>
                Our AI analyzes the job description and optimizes your resume
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Download className="w-12 h-12 text-primary mb-2" />
              <CardTitle>Download</CardTitle>
              <CardDescription>
                Get your tailored resume in professional formats
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Free Account</CardTitle>
              <CardDescription className="text-2xl font-bold text-foreground">$0</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-primary" />
                  <span>AI-powered resume tailoring</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-primary" />
                  <span>Copy to clipboard</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-primary" />
                  <span>Unlimited tailoring</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-primary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Pro Account
                <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">Coming Soon</span>
              </CardTitle>
              <CardDescription className="text-2xl font-bold text-foreground">$9.99/mo</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-primary" />
                  <span>Everything in Free</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-primary" />
                  <span>Download as DOCX</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-primary" />
                  <span>Download as PDF</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-primary" />
                  <span>Professional & Modern formats</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className="border-t py-6">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>Resume Tailor - AI-Powered Resume Optimization</p>
        </div>
      </footer>
    </div>
  );
}
