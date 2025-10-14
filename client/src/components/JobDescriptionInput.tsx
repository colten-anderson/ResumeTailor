import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

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
  const characterCount = value.length;
  const isValid = characterCount >= minLength;

  return (
    <div className="space-y-2" data-testid="job-description-input">
      <div className="flex items-center justify-between">
        <Label htmlFor="job-description" className="text-base font-semibold">
          Job Description
        </Label>
        <span 
          className={`text-sm ${isValid ? 'text-muted-foreground' : 'text-destructive'}`}
          data-testid="text-char-count"
        >
          {characterCount} / {minLength} min
        </span>
      </div>
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
    </div>
  );
}
