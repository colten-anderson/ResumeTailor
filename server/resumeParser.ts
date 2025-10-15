// Resume parser to extract structured data from resume text

export interface ContactInfo {
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  github?: string;
  website?: string;
}

export interface JobEntry {
  company: string;
  title: string;
  dateRange: string;
  bullets: string[];
}

export interface EducationEntry {
  school: string;
  degree: string;
  dateRange: string;
  details: string[];
}

export interface ResumeSection {
  title: string;
  type: 'experience' | 'education' | 'skills' | 'profile' | 'other';
  content: string[];
  jobs?: JobEntry[];
  education?: EducationEntry[];
}

export interface ParsedResume {
  contact: ContactInfo;
  sections: ResumeSection[];
  rawText: string;
}

// Regex patterns for detection
const EMAIL_REGEX = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi;
const PHONE_REGEX = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
const LINKEDIN_REGEX = /(linkedin\.com\/in\/[\w-]+)/gi;
const GITHUB_REGEX = /(github\.com\/[\w-]+)/gi;
const URL_REGEX = /((?:https?:\/\/)?(?:www\.)?[\w-]+\.[\w.]+(?:\/[\w-]*)*)/gi;

// Date patterns for experience/education
const DATE_RANGE_REGEX = /(\d{4})\s*[-–—]\s*(\d{4}|present|current)/gi;
const MONTH_YEAR_REGEX = /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4}/gi;

// Common section headers
const SECTION_HEADERS = {
  experience: /^(work\s+)?experience|^employment|^professional\s+experience|^career/i,
  education: /^education|^academic|^qualifications/i,
  skills: /^skills|^technical\s+skills|^competencies|^technologies|^tools/i,
  profile: /^profile|^summary|^about|^objective|^professional\s+summary/i,
};

export function parseResume(text: string): ParsedResume {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l);
  
  const contact: ContactInfo = {};
  const sections: ResumeSection[] = [];
  
  // Extract contact info from first few lines
  const headerLines = lines.slice(0, 10).join(' ');
  
  const emails = headerLines.match(EMAIL_REGEX);
  if (emails && emails.length > 0) {
    contact.email = emails[0];
  }
  
  const phones = headerLines.match(PHONE_REGEX);
  if (phones && phones.length > 0) {
    contact.phone = phones[0];
  }
  
  const linkedins = headerLines.match(LINKEDIN_REGEX);
  if (linkedins && linkedins.length > 0) {
    contact.linkedin = linkedins[0];
  }
  
  const githubs = headerLines.match(GITHUB_REGEX);
  if (githubs && githubs.length > 0) {
    contact.github = githubs[0];
  }
  
  // Find name (usually first non-contact line, all caps or title case)
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i];
    if (!line.match(EMAIL_REGEX) && 
        !line.match(PHONE_REGEX) && 
        !line.match(URL_REGEX) &&
        line.length > 3 && line.length < 50) {
      // Likely the name if it's short and doesn't contain contact info
      if (line === line.toUpperCase() || /^[A-Z][a-z]+\s+[A-Z][a-z]+/.test(line)) {
        contact.name = line;
        break;
      }
    }
  }
  
  // Parse sections
  let currentSection: ResumeSection | null = null;
  let currentSectionLines: string[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check if this is a section header
    let isSectionHeader = false;
    let sectionType: ResumeSection['type'] = 'other';
    
    for (const [type, regex] of Object.entries(SECTION_HEADERS)) {
      if (regex.test(line)) {
        isSectionHeader = true;
        sectionType = type as ResumeSection['type'];
        break;
      }
    }
    
    // Also detect all-caps headers that might be sections
    if (!isSectionHeader && line === line.toUpperCase() && line.length < 50 && line.length > 3) {
      isSectionHeader = true;
      // Try to guess type from content
      if (/skill|tech|tool|language/i.test(line)) {
        sectionType = 'skills';
      } else if (/work|employ|experience|career/i.test(line)) {
        sectionType = 'experience';
      } else if (/educat|school|university|degree/i.test(line)) {
        sectionType = 'education';
      } else if (/profile|summary|about|objective/i.test(line)) {
        sectionType = 'profile';
      }
    }
    
    if (isSectionHeader) {
      // Save previous section
      if (currentSection && currentSectionLines.length > 0) {
        currentSection.content = currentSectionLines;
        
        // Parse section-specific content
        if (currentSection.type === 'experience') {
          currentSection.jobs = parseExperienceSection(currentSectionLines);
        } else if (currentSection.type === 'education') {
          currentSection.education = parseEducationSection(currentSectionLines);
        }
        
        sections.push(currentSection);
      }
      
      // Start new section
      currentSection = {
        title: line,
        type: sectionType,
        content: [],
      };
      currentSectionLines = [];
    } else if (currentSection) {
      currentSectionLines.push(line);
    }
  }
  
  // Add last section
  if (currentSection && currentSectionLines.length > 0) {
    currentSection.content = currentSectionLines;
    
    if (currentSection.type === 'experience') {
      currentSection.jobs = parseExperienceSection(currentSectionLines);
    } else if (currentSection.type === 'education') {
      currentSection.education = parseEducationSection(currentSectionLines);
    }
    
    sections.push(currentSection);
  }
  
  return {
    contact,
    sections,
    rawText: text,
  };
}

function parseExperienceSection(lines: string[]): JobEntry[] {
  const jobs: JobEntry[] = [];
  let currentJob: Partial<JobEntry> | null = null;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check if line contains a date range (likely job header)
    const hasDate = DATE_RANGE_REGEX.test(line) || MONTH_YEAR_REGEX.test(line);
    
    if (hasDate) {
      // Save previous job
      if (currentJob && currentJob.company && currentJob.title) {
        jobs.push(currentJob as JobEntry);
      }
      
      // Extract date range
      const dateMatch = line.match(DATE_RANGE_REGEX) || line.match(MONTH_YEAR_REGEX);
      const dateRange = dateMatch ? dateMatch[0] : '';
      
      // Try to parse company and title
      const withoutDate = line.replace(dateRange, '').trim();
      const parts = withoutDate.split(/[-–—,|]/);
      
      if (parts.length >= 2) {
        currentJob = {
          company: parts[0].trim(),
          title: parts[1].trim(),
          dateRange: dateRange.trim(),
          bullets: [],
        };
      } else {
        currentJob = {
          company: withoutDate,
          title: '',
          dateRange: dateRange.trim(),
          bullets: [],
        };
      }
    } else if (currentJob && (line.startsWith('•') || line.startsWith('-') || line.startsWith('*'))) {
      // Bullet point
      currentJob.bullets = currentJob.bullets || [];
      currentJob.bullets.push(line.replace(/^[•\-*]\s*/, '').trim());
    } else if (currentJob && !currentJob.title && currentJob.company) {
      // This might be the title on a separate line
      currentJob.title = line;
    }
  }
  
  // Add last job
  if (currentJob && currentJob.company && currentJob.title) {
    jobs.push(currentJob as JobEntry);
  }
  
  return jobs;
}

function parseEducationSection(lines: string[]): EducationEntry[] {
  const entries: EducationEntry[] = [];
  let currentEntry: Partial<EducationEntry> | null = null;
  
  for (const line of lines) {
    const hasDate = DATE_RANGE_REGEX.test(line) || /\d{4}/.test(line);
    
    if (hasDate || /university|college|school|institute/i.test(line)) {
      // Save previous entry
      if (currentEntry && currentEntry.school) {
        entries.push(currentEntry as EducationEntry);
      }
      
      // Extract date range
      const dateMatch = line.match(DATE_RANGE_REGEX) || line.match(/\d{4}/);
      const dateRange = dateMatch ? dateMatch[0] : '';
      
      const withoutDate = line.replace(dateRange, '').trim();
      
      currentEntry = {
        school: withoutDate,
        degree: '',
        dateRange: dateRange.trim(),
        details: [],
      };
    } else if (currentEntry) {
      if (!currentEntry.degree && /bachelor|master|phd|bs|ba|ms|ma|degree/i.test(line)) {
        currentEntry.degree = line;
      } else {
        currentEntry.details = currentEntry.details || [];
        currentEntry.details.push(line);
      }
    }
  }
  
  // Add last entry
  if (currentEntry && currentEntry.school) {
    entries.push(currentEntry as EducationEntry);
  }
  
  return entries;
}
