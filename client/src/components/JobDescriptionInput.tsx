import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Link2, FileText, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface JobDescriptionInputProps {
  value: string;
  onChange: (value: string) => void;
  minLength?: number;
}

export default function JobDescriptionInput({ 
  value, 
  onChange, 
  minLength = 50 
}: JobDescriptionInputProps) {
  const [inputMode, setInputMode] = useState<"url" | "text">("url");
  const [url, setUrl] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const { toast } = useToast();

  const characterCount = value.length;
  const isValid = characterCount >= minLength;

  const handleExtractFromUrl = async () => {
    if (!url.trim()) {
      toast({
        title: "URL Required",
        description: "Please enter a job posting URL",
        variant: "destructive",
      });
      return;
    }

    setIsExtracting(true);
    try {
      const response = await apiRequest(
        "POST",
        "/api/extract-job-from-url",
        { url: url.trim() }
      );

      const data = await response.json();
      onChange(data.jobDescription);
      toast({
        title: "Success",
        description: "Job description extracted successfully",
      });
    } catch (error: any) {
      toast({
        title: "Extraction Failed",
        description: error.message || "Could not extract job description. The page may require login or the URL may be invalid.",
        variant: "destructive",
      });
    } finally {
      setIsExtracting(false);
    }
  };

  return (
    <div className="space-y-4" data-testid="job-description-input">
      <div className="flex items-center justify-between">
        <Label className="text-base font-semibold">
          Job Description
        </Label>
        {value.length > 0 && (
          <span 
            className={`text-sm ${isValid ? 'text-muted-foreground' : 'text-destructive'}`}
            data-testid="text-char-count"
          >
            {characterCount} / {minLength} min
          </span>
        )}
      </div>

      <Tabs value={inputMode} onValueChange={(v) => setInputMode(v as "url" | "text")}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="url" data-testid="tab-url">
            <Link2 className="w-4 h-4 mr-2" />
            Paste URL
          </TabsTrigger>
          <TabsTrigger value="text" data-testid="tab-text">
            <FileText className="w-4 h-4 mr-2" />
            Paste Text
          </TabsTrigger>
        </TabsList>

        <TabsContent value="url" className="space-y-3 mt-4">
          <div className="space-y-2">
            <Label htmlFor="job-url" className="text-sm text-muted-foreground">
              Enter job posting URL from LinkedIn, Indeed, or company career pages
            </Label>
            <div className="flex gap-2">
              <Input
                id="job-url"
                type="url"
                placeholder="https://www.indeed.com/viewjob?jk=..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={isExtracting}
                data-testid="input-job-url"
              />
              <Button 
                onClick={handleExtractFromUrl} 
                disabled={isExtracting || !url.trim()}
                data-testid="button-extract-url"
              >
                {isExtracting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Extracting...
                  </>
                ) : (
                  "Extract"
                )}
              </Button>
            </div>
          </div>

          {value.length > 0 && (
            <div className="p-3 bg-muted rounded-md">
              <p className="text-sm text-muted-foreground mb-2">Extracted Job Description:</p>
              <div className="max-h-40 overflow-y-auto text-sm" data-testid="text-extracted-preview">
                {value}
              </div>
            </div>
          )}

          <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950 rounded-md">
            <AlertCircle className="w-4 h-4 mt-0.5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <p className="text-xs text-blue-800 dark:text-blue-200">
              Note: Some job sites (especially LinkedIn) may require login. If extraction fails, try the "Paste Text" option instead.
            </p>
          </div>
        </TabsContent>

        <TabsContent value="text" className="space-y-3 mt-4">
          <Textarea
            id="job-description"
            placeholder="Paste the complete job posting here, including requirements, responsibilities, and preferred qualifications..."
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="min-h-[300px] resize-none"
            data-testid="textarea-job-description"
          />
          {!isValid && characterCount > 0 && (
            <p className="text-sm text-destructive" data-testid="text-validation-error">
              Please enter at least {minLength} characters for better results
            </p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
