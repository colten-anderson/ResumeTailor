import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ResumeDisplayProps {
  content: string;
  title?: string;
  isLoading?: boolean;
}

export default function ResumeDisplay({ 
  content, 
  title = "Resume", 
  isLoading = false 
}: ResumeDisplayProps) {
  if (isLoading) {
    return (
      <Card data-testid="resume-display-loading">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="h-4 bg-muted rounded animate-pulse" />
            <div className="h-4 bg-muted rounded animate-pulse w-5/6" />
            <div className="h-4 bg-muted rounded animate-pulse w-4/6" />
            <div className="h-4 bg-muted rounded animate-pulse" />
            <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="resume-display">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px]">
          <div 
            className="font-mono text-sm whitespace-pre-wrap text-foreground leading-relaxed"
            data-testid="text-resume-content"
          >
            {content || "No content available"}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
