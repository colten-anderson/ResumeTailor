import { useMemo } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { escapeRegExp } from "@/lib/keywords";

interface ResumeDisplayProps {
  content: string;
  title?: string;
  isLoading?: boolean;
  highlightTerms?: string[];
}

export default function ResumeDisplay({
  content,
  title = "Resume",
  isLoading = false,
  highlightTerms = []
}: ResumeDisplayProps) {
  const highlightRegex = useMemo(() => {
    const normalizedTerms = Array.from(
      new Set(
        highlightTerms
          .map((term) => term.trim().toLowerCase())
          .filter((term) => term.length > 0)
      )
    );

    if (normalizedTerms.length === 0) {
      return null;
    }

    const escapedTerms = normalizedTerms
      .sort((a, b) => b.length - a.length)
      .map((term) => escapeRegExp(term));

    return new RegExp(`(${escapedTerms.join("|")})`, "gi");
  }, [highlightTerms]);

  const highlightedContent = useMemo(() => {
    if (!content) {
      return "No content available";
    }

    if (!highlightRegex) {
      return content;
    }

    const normalizedLookup = new Set(
      highlightTerms
        .map((term) => term.trim().toLowerCase())
        .filter((term) => term.length > 0)
    );

    const parts = content.split(highlightRegex);

    return parts.map((part, index) => {
      if (normalizedLookup.has(part.toLowerCase())) {
        return (
          <mark
            key={`${part}-${index}`}
            className="rounded bg-primary/20 px-1 py-0 text-foreground"
          >
            {part}
          </mark>
        );
      }

      return <span key={`${part}-${index}`}>{part}</span>;
    });
  }, [content, highlightRegex, highlightTerms]);

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
            {highlightedContent}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
