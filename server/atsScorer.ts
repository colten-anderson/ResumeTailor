import type { StructuredResume } from './resumeParser';

export interface ATSScore {
  overallScore: number; // 0-100
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

/**
 * Analyzes a resume for ATS compatibility
 */
export function calculateATSScore(
  resumeText: string,
  jobDescription: string,
  structuredResume?: StructuredResume
): ATSScore {
  const breakdown = {
    formatting: analyzeFormatting(resumeText),
    keywords: analyzeKeywords(resumeText, jobDescription),
    sections: analyzeSections(structuredResume),
    readability: analyzeReadability(resumeText),
    fileFormat: analyzeFileFormat()
  };

  // Calculate weighted overall score
  const overallScore = Math.round(
    breakdown.formatting.score * 0.15 +
    breakdown.keywords.score * 0.35 +
    breakdown.sections.score * 0.25 +
    breakdown.readability.score * 0.15 +
    breakdown.fileFormat.score * 0.10
  );

  const grade = getGrade(overallScore);
  const summary = generateSummary(overallScore, breakdown);

  return {
    overallScore,
    breakdown,
    grade,
    summary
  };
}

/**
 * Analyzes formatting for ATS compatibility
 */
function analyzeFormatting(resumeText: string): {
  score: number;
  issues: string[];
  suggestions: string[];
} {
  const issues: string[] = [];
  const suggestions: string[] = [];
  let score = 100;

  // Check for common ATS-unfriendly characters
  const specialChars = /[★☆●○■□▪▫◆◇]/g;
  if (specialChars.test(resumeText)) {
    issues.push('Contains special characters that ATS may not recognize');
    suggestions.push('Replace bullet points with standard hyphens or asterisks');
    score -= 10;
  }

  // Check for excessive formatting indicators
  const allCaps = resumeText.split('\n').filter(line =>
    line.length > 10 && line === line.toUpperCase()
  );
  if (allCaps.length > 5) {
    issues.push('Excessive use of ALL CAPS');
    suggestions.push('Use title case for section headers instead of ALL CAPS');
    score -= 5;
  }

  // Check for tables (indicated by multiple tabs or excessive spacing)
  const tabsOrSpaces = /\t{2,}|\s{5,}/g;
  if (tabsOrSpaces.test(resumeText)) {
    issues.push('May contain tables or complex formatting');
    suggestions.push('Avoid tables and columns; use simple linear layout');
    score -= 15;
  }

  // Check for headers and footers (common issue)
  const lines = resumeText.split('\n').filter(l => l.trim());
  if (lines.length > 0) {
    const firstLine = lines[0];
    const lastLine = lines[lines.length - 1];

    if (firstLine.toLowerCase().includes('page') || lastLine.toLowerCase().includes('page')) {
      issues.push('May contain page numbers that confuse ATS');
      suggestions.push('Remove headers and footers with page numbers');
      score -= 5;
    }
  }

  // Positive check: standard bullet points
  if (/^[\-•*]\s/m.test(resumeText)) {
    score = Math.min(100, score + 5);
  }

  return {
    score: Math.max(0, score),
    issues,
    suggestions
  };
}

/**
 * Analyzes keyword matching with job description
 */
function analyzeKeywords(resumeText: string, jobDescription: string): {
  score: number;
  matched: number;
  total: number;
  suggestions: string[];
} {
  const suggestions: string[] = [];

  // Extract important keywords from job description
  const keywords = extractKeywords(jobDescription);
  const resumeLower = resumeText.toLowerCase();

  // Count matched keywords
  const matched = keywords.filter(keyword =>
    resumeLower.includes(keyword.toLowerCase())
  ).length;

  const matchRate = keywords.length > 0 ? (matched / keywords.length) * 100 : 0;
  let score = Math.round(matchRate);

  // Provide suggestions based on missing keywords
  const missingKeywords = keywords.filter(keyword =>
    !resumeLower.includes(keyword.toLowerCase())
  );

  if (missingKeywords.length > 0) {
    const topMissing = missingKeywords.slice(0, 3);
    suggestions.push(`Add these key terms from the job posting: ${topMissing.join(', ')}`);
  }

  if (matchRate < 50) {
    suggestions.push('Include more skills and qualifications mentioned in the job description');
  }

  if (matchRate >= 80) {
    suggestions.push('Excellent keyword match! Your resume aligns well with the job requirements');
  }

  return {
    score: Math.min(100, score),
    matched,
    total: keywords.length,
    suggestions
  };
}

/**
 * Extract keywords from job description
 */
function extractKeywords(jobDescription: string): string[] {
  const commonWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
    'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
    'should', 'could', 'may', 'might', 'must', 'can', 'this', 'that',
    'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they',
    'what', 'which', 'who', 'when', 'where', 'why', 'how', 'all', 'each',
    'every', 'both', 'few', 'more', 'most', 'other', 'some', 'such'
  ]);

  // Extract words and filter
  const words = jobDescription
    .toLowerCase()
    .replace(/[^\w\s-]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !commonWords.has(word));

  // Count frequency
  const frequency = new Map<string, number>();
  words.forEach(word => {
    frequency.set(word, (frequency.get(word) || 0) + 1);
  });

  // Get top keywords (mentioned at least twice or technical terms)
  const keywords = Array.from(frequency.entries())
    .filter(([word, count]) => count >= 2 || isTechnicalTerm(word))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([word]) => word);

  return keywords;
}

/**
 * Check if a word is likely a technical term
 */
function isTechnicalTerm(word: string): boolean {
  const technicalPatterns = [
    /^[A-Z]{2,}$/, // Acronyms: SQL, AWS, API
    /[A-Z][a-z]+[A-Z]/, // CamelCase: JavaScript, TypeScript
    /\d/, // Contains numbers: Python3, 5G
  ];

  return technicalPatterns.some(pattern => pattern.test(word));
}

/**
 * Analyzes resume sections
 */
function analyzeSections(structuredResume?: StructuredResume): {
  score: number;
  present: string[];
  missing: string[];
  suggestions: string[];
} {
  const suggestions: string[] = [];
  const present: string[] = [];
  const missing: string[] = [];

  // Required sections
  const requiredSections = [
    { name: 'Contact Information', check: () => structuredResume?.contactInfo },
    { name: 'Work Experience', check: () => structuredResume?.experience && structuredResume.experience.length > 0 },
    { name: 'Education', check: () => structuredResume?.education && structuredResume.education.length > 0 },
    { name: 'Skills', check: () => structuredResume?.skills && structuredResume.skills.length > 0 }
  ];

  let score = 0;
  const sectionWeight = 100 / requiredSections.length;

  requiredSections.forEach(section => {
    if (section.check()) {
      present.push(section.name);
      score += sectionWeight;
    } else {
      missing.push(section.name);
      suggestions.push(`Add a clear ${section.name} section`);
    }
  });

  // Check for standard section headers
  if (present.length === requiredSections.length) {
    suggestions.push('All essential sections are present');
  }

  // Bonus for summary/objective
  if (structuredResume?.summary) {
    present.push('Professional Summary');
    score = Math.min(100, score + 10);
  } else {
    suggestions.push('Consider adding a professional summary at the top');
  }

  return {
    score: Math.round(Math.max(0, Math.min(100, score))),
    present,
    missing,
    suggestions
  };
}

/**
 * Analyzes readability and content quality
 */
function analyzeReadability(resumeText: string): {
  score: number;
  issues: string[];
  suggestions: string[];
} {
  const issues: string[] = [];
  const suggestions: string[] = [];
  let score = 100;

  const lines = resumeText.split('\n').filter(l => l.trim());
  const words = resumeText.split(/\s+/).filter(w => w.length > 0);
  const sentences = resumeText.split(/[.!?]+/).filter(s => s.trim().length > 0);

  // Check length
  if (words.length < 200) {
    issues.push('Resume is too brief');
    suggestions.push('Expand your resume with more details about your experience and achievements');
    score -= 20;
  } else if (words.length > 1000) {
    issues.push('Resume is too lengthy');
    suggestions.push('Condense to 1-2 pages (300-800 words) for better ATS processing');
    score -= 10;
  }

  // Check for action verbs
  const actionVerbs = [
    'led', 'managed', 'developed', 'created', 'implemented', 'designed',
    'increased', 'decreased', 'improved', 'achieved', 'delivered',
    'established', 'launched', 'optimized', 'streamlined', 'coordinated'
  ];

  const resumeLower = resumeText.toLowerCase();
  const actionVerbCount = actionVerbs.filter(verb => resumeLower.includes(verb)).length;

  if (actionVerbCount < 3) {
    issues.push('Limited use of action verbs');
    suggestions.push('Start bullet points with strong action verbs (led, developed, achieved, etc.)');
    score -= 10;
  }

  // Check for quantifiable achievements
  const hasNumbers = /\d+%|\d+\+|\$\d+|increased by|decreased by|reduced by/i.test(resumeText);
  if (!hasNumbers) {
    issues.push('Lacks quantifiable achievements');
    suggestions.push('Include numbers and metrics to demonstrate impact (e.g., "increased sales by 25%")');
    score -= 15;
  }

  // Check line length (very long lines indicate formatting issues)
  const longLines = lines.filter(line => line.length > 150);
  if (longLines.length > lines.length * 0.3) {
    issues.push('Some lines are too long');
    suggestions.push('Break long lines into bullet points for better readability');
    score -= 5;
  }

  return {
    score: Math.max(0, score),
    issues,
    suggestions
  };
}

/**
 * Analyzes file format compatibility
 */
function analyzeFileFormat(): {
  score: number;
  issues: string[];
  suggestions: string[];
} {
  const suggestions: string[] = [];

  // Since we're analyzing after parsing, the format was acceptable
  // In a real scenario, we'd check the original file format
  suggestions.push('Using DOCX or PDF format is recommended for best ATS compatibility');
  suggestions.push('Ensure your file name is professional (e.g., "FirstName_LastName_Resume.pdf")');

  return {
    score: 100, // Default to 100 since the file was successfully parsed
    issues: [],
    suggestions
  };
}

/**
 * Get letter grade from score
 */
function getGrade(score: number): 'Excellent' | 'Good' | 'Fair' | 'Needs Improvement' | 'Poor' {
  if (score >= 90) return 'Excellent';
  if (score >= 75) return 'Good';
  if (score >= 60) return 'Fair';
  if (score >= 40) return 'Needs Improvement';
  return 'Poor';
}

/**
 * Generate summary based on score and breakdown
 */
function generateSummary(score: number, breakdown: ATSScore['breakdown']): string {
  const strengths: string[] = [];
  const weaknesses: string[] = [];

  // Identify strengths and weaknesses
  Object.entries(breakdown).forEach(([category, data]) => {
    if (data.score >= 80) {
      strengths.push(category);
    } else if (data.score < 60) {
      weaknesses.push(category);
    }
  });

  let summary = '';

  if (score >= 90) {
    summary = 'Your resume is highly optimized for ATS systems! ';
  } else if (score >= 75) {
    summary = 'Your resume has good ATS compatibility with some room for improvement. ';
  } else if (score >= 60) {
    summary = 'Your resume has fair ATS compatibility but needs optimization. ';
  } else {
    summary = 'Your resume needs significant improvements for better ATS compatibility. ';
  }

  if (strengths.length > 0) {
    summary += `Strong areas: ${strengths.join(', ')}. `;
  }

  if (weaknesses.length > 0) {
    summary += `Focus on improving: ${weaknesses.join(', ')}.`;
  }

  return summary.trim();
}
