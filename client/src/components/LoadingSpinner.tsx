import { Loader2, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface LoadingSpinnerProps {
  message?: string;
}

export default function LoadingSpinner({ message = "Processing..." }: LoadingSpinnerProps) {
  return (
    <Card data-testid="loading-spinner">
      <CardContent className="flex flex-col items-center justify-center py-12">
        <div className="relative">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <Sparkles className="h-6 w-6 text-chart-2 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
        <p className="mt-4 text-muted-foreground" data-testid="text-loading-message">
          {message}
        </p>
      </CardContent>
    </Card>
  );
}
