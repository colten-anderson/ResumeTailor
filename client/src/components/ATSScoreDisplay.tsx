import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CheckCircle2, AlertCircle, XCircle, TrendingUp, FileCheck } from "lucide-react";
import { motion } from "framer-motion";

export interface ATSScore {
  overallScore: number;
  breakdown: {
    formatting: {
      score: number;
      issues: string[];
      suggestions: string[];
    };
    keywords: {
      score: number;
      matched: number;
      total: number;
      suggestions: string[];
    };
    sections: {
      score: number;
      present: string[];
      missing: string[];
      suggestions: string[];
    };
    readability: {
      score: number;
      issues: string[];
      suggestions: string[];
    };
    fileFormat: {
      score: number;
      issues: string[];
      suggestions: string[];
    };
  };
  grade: 'Excellent' | 'Good' | 'Fair' | 'Needs Improvement' | 'Poor';
  summary: string;
}

interface ATSScoreDisplayProps {
  score: ATSScore;
}

export function ATSScoreDisplay({ score }: ATSScoreDisplayProps) {
  const getScoreColor = (scoreValue: number) => {
    if (scoreValue >= 90) return "text-green-600 dark:text-green-400";
    if (scoreValue >= 75) return "text-blue-600 dark:text-blue-400";
    if (scoreValue >= 60) return "text-yellow-600 dark:text-yellow-400";
    if (scoreValue >= 40) return "text-orange-600 dark:text-orange-400";
    return "text-red-600 dark:text-red-400";
  };

  const getScoreColorHex = (scoreValue: number) => {
    if (scoreValue >= 90) return "#16a34a";
    if (scoreValue >= 75) return "#2563eb";
    if (scoreValue >= 60) return "#ca8a04";
    if (scoreValue >= 40) return "#ea580c";
    return "#dc2626";
  };

  const getGradeBadgeVariant = (grade: string) => {
    if (grade === 'Excellent') return "default";
    if (grade === 'Good') return "secondary";
    if (grade === 'Fair') return "outline";
    return "destructive";
  };

  const getScoreIcon = (scoreValue: number) => {
    if (scoreValue >= 75) return <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />;
    if (scoreValue >= 60) return <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />;
    return <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <FileCheck className="h-6 w-6" />
                ATS Compatibility Score
              </CardTitle>
              <CardDescription>
                Analysis of how well your resume works with Applicant Tracking Systems
              </CardDescription>
            </div>
            <Badge variant={getGradeBadgeVariant(score.grade)} className="text-lg px-4 py-2">
              {score.grade}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Overall Score */}
          <div className="space-y-4">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Overall Score</p>
                <motion.p
                  className={`text-5xl font-bold ${getScoreColor(score.overallScore)}`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 10 }}
                >
                  {score.overallScore}
                  <span className="text-2xl">/100</span>
                </motion.p>
              </div>
              <motion.div
                className="relative h-32 w-32"
                initial={{ rotate: -90 }}
                animate={{ rotate: 0 }}
                transition={{ duration: 1, ease: "easeOut" }}
              >
                <svg className="h-full w-full" viewBox="0 0 100 100">
                  <circle
                    className="stroke-gray-200 dark:stroke-gray-700"
                    strokeWidth="8"
                    fill="transparent"
                    r="42"
                    cx="50"
                    cy="50"
                  />
                  <motion.circle
                    className="transition-all duration-500"
                    stroke={getScoreColorHex(score.overallScore)}
                    strokeWidth="8"
                    strokeLinecap="round"
                    fill="transparent"
                    r="42"
                    cx="50"
                    cy="50"
                    initial={{ strokeDashoffset: 264 }}
                    animate={{ strokeDashoffset: 264 - (264 * score.overallScore) / 100 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    style={{
                      strokeDasharray: 264,
                      transform: "rotate(-90deg)",
                      transformOrigin: "50% 50%"
                    }}
                  />
                </svg>
              </motion.div>
            </div>
            <p className="text-sm text-muted-foreground">{score.summary}</p>
          </div>

          {/* Breakdown Accordion */}
          <Accordion type="single" collapsible className="w-full">
            {/* Formatting */}
            <AccordionItem value="formatting">
              <AccordionTrigger>
                <div className="flex items-center justify-between w-full pr-4">
                  <div className="flex items-center gap-2">
                    {getScoreIcon(score.breakdown.formatting.score)}
                    <span className="font-medium">Formatting</span>
                  </div>
                  <span className={`font-bold ${getScoreColor(score.breakdown.formatting.score)}`}>
                    {score.breakdown.formatting.score}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3 pt-2">
                  <Progress value={score.breakdown.formatting.score} className="h-2" />
                  {score.breakdown.formatting.issues.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-red-600 dark:text-red-400">Issues:</p>
                      <ul className="list-disc list-inside space-y-1">
                        {score.breakdown.formatting.issues.map((issue, i) => (
                          <li key={i} className="text-sm text-muted-foreground">{issue}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {score.breakdown.formatting.suggestions.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-sm font-medium flex items-center gap-1">
                        <TrendingUp className="h-4 w-4" />
                        Suggestions:
                      </p>
                      <ul className="list-disc list-inside space-y-1">
                        {score.breakdown.formatting.suggestions.map((suggestion, i) => (
                          <li key={i} className="text-sm text-muted-foreground">{suggestion}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Keywords */}
            <AccordionItem value="keywords">
              <AccordionTrigger>
                <div className="flex items-center justify-between w-full pr-4">
                  <div className="flex items-center gap-2">
                    {getScoreIcon(score.breakdown.keywords.score)}
                    <span className="font-medium">Keywords</span>
                    <Badge variant="outline" className="ml-2">
                      {score.breakdown.keywords.matched}/{score.breakdown.keywords.total} matched
                    </Badge>
                  </div>
                  <span className={`font-bold ${getScoreColor(score.breakdown.keywords.score)}`}>
                    {score.breakdown.keywords.score}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3 pt-2">
                  <Progress value={score.breakdown.keywords.score} className="h-2" />
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="space-y-1">
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {score.breakdown.keywords.matched}
                      </p>
                      <p className="text-xs text-muted-foreground">Matched</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-2xl font-bold">
                        {score.breakdown.keywords.total}
                      </p>
                      <p className="text-xs text-muted-foreground">Total Keywords</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {Math.round((score.breakdown.keywords.matched / score.breakdown.keywords.total) * 100)}%
                      </p>
                      <p className="text-xs text-muted-foreground">Match Rate</p>
                    </div>
                  </div>
                  {score.breakdown.keywords.suggestions.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-sm font-medium flex items-center gap-1">
                        <TrendingUp className="h-4 w-4" />
                        Suggestions:
                      </p>
                      <ul className="list-disc list-inside space-y-1">
                        {score.breakdown.keywords.suggestions.map((suggestion, i) => (
                          <li key={i} className="text-sm text-muted-foreground">{suggestion}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Sections */}
            <AccordionItem value="sections">
              <AccordionTrigger>
                <div className="flex items-center justify-between w-full pr-4">
                  <div className="flex items-center gap-2">
                    {getScoreIcon(score.breakdown.sections.score)}
                    <span className="font-medium">Sections</span>
                  </div>
                  <span className={`font-bold ${getScoreColor(score.breakdown.sections.score)}`}>
                    {score.breakdown.sections.score}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3 pt-2">
                  <Progress value={score.breakdown.sections.score} className="h-2" />
                  {score.breakdown.sections.present.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-green-600 dark:text-green-400">Present Sections:</p>
                      <div className="flex flex-wrap gap-2">
                        {score.breakdown.sections.present.map((section, i) => (
                          <Badge key={i} variant="secondary" className="bg-green-100 dark:bg-green-900">
                            {section}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {score.breakdown.sections.missing.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-red-600 dark:text-red-400">Missing Sections:</p>
                      <div className="flex flex-wrap gap-2">
                        {score.breakdown.sections.missing.map((section, i) => (
                          <Badge key={i} variant="destructive">
                            {section}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {score.breakdown.sections.suggestions.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-sm font-medium flex items-center gap-1">
                        <TrendingUp className="h-4 w-4" />
                        Suggestions:
                      </p>
                      <ul className="list-disc list-inside space-y-1">
                        {score.breakdown.sections.suggestions.map((suggestion, i) => (
                          <li key={i} className="text-sm text-muted-foreground">{suggestion}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Readability */}
            <AccordionItem value="readability">
              <AccordionTrigger>
                <div className="flex items-center justify-between w-full pr-4">
                  <div className="flex items-center gap-2">
                    {getScoreIcon(score.breakdown.readability.score)}
                    <span className="font-medium">Readability & Content</span>
                  </div>
                  <span className={`font-bold ${getScoreColor(score.breakdown.readability.score)}`}>
                    {score.breakdown.readability.score}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3 pt-2">
                  <Progress value={score.breakdown.readability.score} className="h-2" />
                  {score.breakdown.readability.issues.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-red-600 dark:text-red-400">Issues:</p>
                      <ul className="list-disc list-inside space-y-1">
                        {score.breakdown.readability.issues.map((issue, i) => (
                          <li key={i} className="text-sm text-muted-foreground">{issue}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {score.breakdown.readability.suggestions.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-sm font-medium flex items-center gap-1">
                        <TrendingUp className="h-4 w-4" />
                        Suggestions:
                      </p>
                      <ul className="list-disc list-inside space-y-1">
                        {score.breakdown.readability.suggestions.map((suggestion, i) => (
                          <li key={i} className="text-sm text-muted-foreground">{suggestion}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* File Format */}
            <AccordionItem value="fileFormat">
              <AccordionTrigger>
                <div className="flex items-center justify-between w-full pr-4">
                  <div className="flex items-center gap-2">
                    {getScoreIcon(score.breakdown.fileFormat.score)}
                    <span className="font-medium">File Format</span>
                  </div>
                  <span className={`font-bold ${getScoreColor(score.breakdown.fileFormat.score)}`}>
                    {score.breakdown.fileFormat.score}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3 pt-2">
                  <Progress value={score.breakdown.fileFormat.score} className="h-2" />
                  {score.breakdown.fileFormat.issues.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-red-600 dark:text-red-400">Issues:</p>
                      <ul className="list-disc list-inside space-y-1">
                        {score.breakdown.fileFormat.issues.map((issue, i) => (
                          <li key={i} className="text-sm text-muted-foreground">{issue}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {score.breakdown.fileFormat.suggestions.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-sm font-medium flex items-center gap-1">
                        <TrendingUp className="h-4 w-4" />
                        Suggestions:
                      </p>
                      <ul className="list-disc list-inside space-y-1">
                        {score.breakdown.fileFormat.suggestions.map((suggestion, i) => (
                          <li key={i} className="text-sm text-muted-foreground">{suggestion}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </motion.div>
  );
}
