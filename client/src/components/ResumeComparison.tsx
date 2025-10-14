import ResumeDisplay from "./ResumeDisplay";

interface ResumeComparisonProps {
  originalContent: string;
  tailoredContent: string;
  isLoading?: boolean;
}

export default function ResumeComparison({ 
  originalContent, 
  tailoredContent, 
  isLoading = false 
}: ResumeComparisonProps) {
  return (
    <div 
      className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      data-testid="resume-comparison"
    >
      <ResumeDisplay 
        content={originalContent} 
        title="Original Resume" 
        isLoading={isLoading}
      />
      <ResumeDisplay 
        content={tailoredContent} 
        title="Tailored Resume" 
        isLoading={isLoading}
      />
    </div>
  );
}
