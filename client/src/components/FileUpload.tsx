import { Upload, FileText, X } from "lucide-react";
import { useCallback, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  acceptedFormats?: string[];
  maxSizeMB?: number;
}

export default function FileUpload({ 
  onFileSelect, 
  acceptedFormats = ['.pdf', '.docx'],
  maxSizeMB = 10 
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string>("");

  const validateFile = (file: File) => {
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!acceptedFormats.includes(extension)) {
      setError(`Please upload a ${acceptedFormats.join(' or ')} file`);
      return false;
    }
    
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File size must be less than ${maxSizeMB}MB`);
      return false;
    }
    
    setError("");
    return true;
  };

  const handleFile = (file: File) => {
    if (validateFile(file)) {
      setSelectedFile(file);
      onFileSelect(file);
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setError("");
  };

  return (
    <div className="w-full max-w-2xl mx-auto" data-testid="file-upload">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "border-2 border-dashed rounded-md p-12 text-center transition-colors",
          isDragging ? "border-primary bg-primary/5" : "border-border",
          selectedFile ? "bg-muted/30" : ""
        )}
      >
        {selectedFile ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-3 text-foreground">
              <FileText className="h-8 w-8 text-primary" />
              <div className="text-left flex-1">
                <p className="font-medium" data-testid="text-filename">{selectedFile.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={clearFile}
                data-testid="button-clear-file"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Upload className="h-8 w-8 text-primary" />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-lg font-semibold text-foreground">
                Drop your resume here, or browse
              </p>
              <p className="text-sm text-muted-foreground">
                Supports {acceptedFormats.join(', ')} • Max {maxSizeMB}MB
              </p>
            </div>
            <div>
              <input
                type="file"
                id="file-input"
                className="hidden"
                accept={acceptedFormats.join(',')}
                onChange={handleFileInput}
                data-testid="input-file"
              />
              <Button asChild data-testid="button-browse">
                <label htmlFor="file-input" className="cursor-pointer">
                  Browse Files
                </label>
              </Button>
            </div>
          </div>
        )}
      </div>
      {error && (
        <p className="text-sm text-destructive mt-2" data-testid="text-error">
          {error}
        </p>
      )}
    </div>
  );
}
