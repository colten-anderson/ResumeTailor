import { describe, it, expect } from 'vitest';
import { parseResume } from './resumeParser';
import type { ParsedResume, ContactInfo } from './resumeParser';

describe('resumeParser', () => {
  describe('parseResume - Contact Information', () => {
    it('should extract email address correctly', () => {
      const resume = `
        John Doe
        john.doe@example.com
        Software Engineer
      `;
      const result = parseResume(resume);
      expect(result.contact.email).toBe('john.doe@example.com');
    });

    it('should extract phone number in various formats', () => {
      const testCases = [
        { input: '(555) 123-4567', expected: '(555) 123-4567' },
        { input: '555-123-4567', expected: '555-123-4567' },
        { input: '555.123.4567', expected: '555.123.4567' },
        { input: '+1 555 123 4567', expected: '+1 555 123 4567' },
      ];

      testCases.forEach(({ input, expected }) => {
        const resume = `John Doe\n${input}\njohn@example.com`;
        const result = parseResume(resume);
        expect(result.contact.phone).toContain(expected.replace(/[^\d]/g, '').slice(-10));
      });
    });

    it('should extract LinkedIn profile', () => {
      const resume = `
        John Doe
        linkedin.com/in/johndoe
        john@example.com
      `;
      const result = parseResume(resume);
      expect(result.contact.linkedin).toBe('linkedin.com/in/johndoe');
    });

    it('should extract GitHub profile', () => {
      const resume = `
        John Doe
        github.com/johndoe
        john@example.com
      `;
      const result = parseResume(resume);
      expect(result.contact.github).toBe('github.com/johndoe');
    });

    it('should extract name from title case format', () => {
      const resume = `
        John Doe
        john.doe@example.com
        (555) 123-4567
      `;
      const result = parseResume(resume);
      expect(result.contact.name).toBe('John Doe');
    });

    it('should extract name from all caps format', () => {
      const resume = `
        JOHN DOE
        john.doe@example.com
        (555) 123-4567
      `;
      const result = parseResume(resume);
      expect(result.contact.name).toBe('JOHN DOE');
    });

    it('should handle missing contact information gracefully', () => {
      const resume = `
        PROFESSIONAL SUMMARY
        Experienced developer with strong skills
      `;
      const result = parseResume(resume);
      expect(result.contact.email).toBeUndefined();
      expect(result.contact.phone).toBeUndefined();
      expect(result.contact.name).toBeUndefined();
    });

    it('should extract all contact information from a complete header', () => {
      const resume = `
        John Doe
        john.doe@example.com | (555) 123-4567 | linkedin.com/in/johndoe | github.com/johndoe
        New York, NY

        SUMMARY
        Experienced software engineer
      `;
      const result = parseResume(resume);
      expect(result.contact.name).toBe('John Doe');
      expect(result.contact.email).toBe('john.doe@example.com');
      expect(result.contact.phone).toContain('555');
      expect(result.contact.linkedin).toBe('linkedin.com/in/johndoe');
      expect(result.contact.github).toBe('github.com/johndoe');
    });
  });

  describe('parseResume - Section Detection', () => {
    it('should detect experience section with common headers', () => {
      const headers = [
        'EXPERIENCE',
        'WORK EXPERIENCE',
        'PROFESSIONAL EXPERIENCE',
        'EMPLOYMENT',
        'CAREER',
      ];

      headers.forEach(header => {
        const resume = `
          John Doe

          ${header}
          Software Engineer | Company | 2020 - Present
        `;
        const result = parseResume(resume);
        const experienceSection = result.sections.find(s => s.type === 'experience');
        expect(experienceSection).toBeDefined();
        expect(experienceSection?.title).toBe(header);
      });
    });

    it('should detect education section with common headers', () => {
      const headers = ['EDUCATION', 'ACADEMIC', 'QUALIFICATIONS'];

      headers.forEach(header => {
        const resume = `
          John Doe

          ${header}
          Bachelor of Science | University | 2018
        `;
        const result = parseResume(resume);
        const educationSection = result.sections.find(s => s.type === 'education');
        expect(educationSection).toBeDefined();
      });
    });

    it('should detect skills section with common headers', () => {
      const headers = ['SKILLS', 'TECHNICAL SKILLS', 'COMPETENCIES', 'TECHNOLOGIES'];

      headers.forEach(header => {
        const resume = `
          John Doe

          ${header}
          JavaScript, TypeScript, React, Node.js
        `;
        const result = parseResume(resume);
        const skillsSection = result.sections.find(s => s.type === 'skills');
        expect(skillsSection).toBeDefined();
      });
    });

    it('should detect profile/summary section', () => {
      const headers = ['SUMMARY', 'PROFILE', 'PROFESSIONAL SUMMARY', 'ABOUT', 'OBJECTIVE'];

      headers.forEach(header => {
        const resume = `
          John Doe

          ${header}
          Experienced software engineer with 5 years of expertise
        `;
        const result = parseResume(resume);
        const profileSection = result.sections.find(s => s.type === 'profile');
        expect(profileSection).toBeDefined();
      });
    });

    it('should handle multiple sections in order', () => {
      const resume = `
        John Doe
        john@example.com

        SUMMARY
        Experienced software engineer

        EXPERIENCE
        Software Engineer | Company | 2020 - Present

        EDUCATION
        BS Computer Science | University | 2020

        SKILLS
        JavaScript, TypeScript, React
      `;
      const result = parseResume(resume);
      expect(result.sections).toHaveLength(4);
      expect(result.sections[0].type).toBe('profile');
      expect(result.sections[1].type).toBe('experience');
      expect(result.sections[2].type).toBe('education');
      expect(result.sections[3].type).toBe('skills');
    });
  });

  describe('parseResume - Work Experience Parsing', () => {
    it('should parse job entry with company, title, and date range', () => {
      const resume = `
        John Doe

        WORK EXPERIENCE
        Senior Software Engineer | Tech Corp | 2020 - Present
        - Developed scalable applications
        - Led team of 4 engineers
      `;
      const result = parseResume(resume);
      const experienceSection = result.sections.find(s => s.type === 'experience');

      expect(experienceSection?.jobs).toHaveLength(1);
      expect(experienceSection?.jobs?.[0]).toMatchObject({
        company: expect.stringContaining('Tech Corp'),
        title: expect.stringContaining('Senior Software Engineer'),
        dateRange: expect.stringMatching(/2020.*Present/i),
      });
    });

    it('should parse bullet points correctly', () => {
      const resume = `
        John Doe

        EXPERIENCE
        Software Engineer | Company | 2020 - 2023
        - Developed web applications
        - Improved performance by 40%
        - Collaborated with teams
      `;
      const result = parseResume(resume);
      const experienceSection = result.sections.find(s => s.type === 'experience');

      expect(experienceSection?.jobs?.[0].bullets).toHaveLength(3);
      expect(experienceSection?.jobs?.[0].bullets[0]).toBe('Developed web applications');
      expect(experienceSection?.jobs?.[0].bullets[1]).toBe('Improved performance by 40%');
    });

    it('should parse multiple job entries', () => {
      const resume = `
        John Doe

        WORK EXPERIENCE
        Senior Engineer | Company A | 2020 - Present
        - Led development team
        - Architected solutions

        Software Engineer | Company B | 2018 - 2020
        - Built REST APIs
        - Implemented features
      `;
      const result = parseResume(resume);
      const experienceSection = result.sections.find(s => s.type === 'experience');

      expect(experienceSection?.jobs).toHaveLength(2);
      expect(experienceSection?.jobs?.[0].company).toContain('Company A');
      expect(experienceSection?.jobs?.[1].company).toContain('Company B');
    });

    it('should handle different date formats', () => {
      const dateFormats = [
        '2020 - 2023',
        'Jan 2020 - Dec 2023',
        '2020 - Present',
        '2020 - Current',
      ];

      dateFormats.forEach(dateFormat => {
        const resume = `
          EXPERIENCE
          Engineer | Company | ${dateFormat}
          - Did work
        `;
        const result = parseResume(resume);
        const experienceSection = result.sections.find(s => s.type === 'experience');
        expect(experienceSection?.jobs?.[0].dateRange).toBeTruthy();
      });
    });

    it('should handle bullet points with different markers', () => {
      const resume = `
        EXPERIENCE
        Engineer | Company | 2020 - 2023
        • Bullet with dot
        - Bullet with dash
        * Bullet with asterisk
      `;
      const result = parseResume(resume);
      const experienceSection = result.sections.find(s => s.type === 'experience');

      expect(experienceSection?.jobs?.[0].bullets).toHaveLength(3);
      expect(experienceSection?.jobs?.[0].bullets[0]).toBe('Bullet with dot');
      expect(experienceSection?.jobs?.[0].bullets[1]).toBe('Bullet with dash');
      expect(experienceSection?.jobs?.[0].bullets[2]).toBe('Bullet with asterisk');
    });
  });

  describe('parseResume - Education Parsing', () => {
    it('should parse education entry with school, degree, and date', () => {
      const resume = `
        John Doe

        EDUCATION
        Bachelor of Science in Computer Science
        University of Technology | 2014 - 2018
      `;
      const result = parseResume(resume);
      const educationSection = result.sections.find(s => s.type === 'education');

      expect(educationSection?.education).toHaveLength(1);
      expect(educationSection?.education?.[0].school).toContain('University of Technology');
      expect(educationSection?.education?.[0].dateRange).toContain('2014');
    });

    it('should parse degree information', () => {
      const resume = `
        EDUCATION
        University of California
        Bachelor of Science in Computer Science
        2018
      `;
      const result = parseResume(resume);
      const educationSection = result.sections.find(s => s.type === 'education');

      expect(educationSection?.education?.[0].degree).toMatch(/Bachelor of Science/i);
    });

    it('should parse multiple education entries', () => {
      const resume = `
        EDUCATION
        Master of Science in Computer Science
        Stanford University | 2020 - 2022

        Bachelor of Science in Computer Science
        MIT | 2016 - 2020
      `;
      const result = parseResume(resume);
      const educationSection = result.sections.find(s => s.type === 'education');

      expect(educationSection?.education).toHaveLength(2);
    });

    it('should recognize various degree types', () => {
      const degrees = ['Bachelor', 'Master', 'PhD', 'BS', 'BA', 'MS', 'MA'];

      degrees.forEach(degree => {
        const resume = `
          EDUCATION
          ${degree} in Computer Science
          University | 2020
        `;
        const result = parseResume(resume);
        const educationSection = result.sections.find(s => s.type === 'education');
        expect(educationSection?.education?.[0].degree).toContain(degree);
      });
    });
  });

  describe('parseResume - Edge Cases', () => {
    it('should handle empty resume text', () => {
      const result = parseResume('');
      expect(result.contact).toEqual({});
      expect(result.sections).toHaveLength(0);
      expect(result.rawText).toBe('');
    });

    it('should handle resume with only contact info', () => {
      const resume = `
        John Doe
        john.doe@example.com
        (555) 123-4567
      `;
      const result = parseResume(resume);
      expect(result.contact.name).toBe('John Doe');
      expect(result.contact.email).toBe('john.doe@example.com');
      expect(result.sections).toHaveLength(0);
    });

    it('should handle special characters in content', () => {
      const resume = `
        José González
        josé@example.com

        EXPERIENCE
        Developer | Company™ | 2020 - Present
        - Improved performance by 100% 🚀
        - Used C++ & Python
      `;
      const result = parseResume(resume);
      expect(result.contact.name).toBe('José González');
      expect(result.contact.email).toBe('josé@example.com');
    });

    it('should preserve raw text', () => {
      const originalText = 'John Doe\njohn@example.com\n\nEXPERIENCE\nEngineer | Company | 2020';
      const result = parseResume(originalText);
      expect(result.rawText).toBe(originalText);
    });

    it('should handle malformed section headers gracefully', () => {
      const resume = `
        John Doe

        work experience (2020-present)
        Engineer | Company | 2020 - Present
        - Did work
      `;
      const result = parseResume(resume);
      // Should still detect as experience section
      const experienceSection = result.sections.find(s => s.type === 'experience');
      expect(experienceSection).toBeDefined();
    });

    it('should handle very long resume text', () => {
      const sections = Array(20).fill(null).map((_, i) => `
        SECTION ${i}
        Content for section ${i}
        More content
      `).join('\n');

      const resume = `John Doe\njohn@example.com\n${sections}`;
      const result = parseResume(resume);

      expect(result.contact.email).toBe('john@example.com');
      expect(result.sections.length).toBeGreaterThan(0);
    });

    it('should handle unconventional formatting', () => {
      const resume = `
        JOHN   DOE


        john@example.com    |    555-123-4567


        EXPERIENCE

        Engineer|Company|2020-2023
        -Developed stuff
      `;
      const result = parseResume(resume);
      expect(result.contact.email).toBe('john@example.com');
      expect(result.sections.length).toBeGreaterThan(0);
    });
  });

  describe('parseResume - Complete Resume', () => {
    it('should parse a complete realistic resume', () => {
      const resume = `
        John Doe
        john.doe@example.com | (555) 123-4567 | linkedin.com/in/johndoe | github.com/johndoe

        SUMMARY
        Experienced software engineer with 5+ years of full-stack development expertise.
        Specialized in building scalable web applications.

        WORK EXPERIENCE
        Senior Software Engineer | Tech Corp | Jan 2020 - Present
        - Developed scalable web applications using React and Node.js
        - Led a team of 4 engineers in delivering critical features
        - Improved application performance by 40%
        - Implemented CI/CD pipelines

        Software Engineer | StartupXYZ | Jun 2018 - Dec 2019
        - Built RESTful APIs using Express.js and PostgreSQL
        - Implemented authentication and authorization systems
        - Collaborated with cross-functional teams
        - Reduced API response time by 50%

        EDUCATION
        Bachelor of Science in Computer Science
        University of Technology | 2014 - 2018
        GPA: 3.8/4.0

        SKILLS
        JavaScript, TypeScript, React, Node.js, Express, PostgreSQL, MongoDB, Git, Docker, AWS
      `;

      const result = parseResume(resume);

      // Contact info
      expect(result.contact.name).toBe('John Doe');
      expect(result.contact.email).toBe('john.doe@example.com');
      expect(result.contact.phone).toBeTruthy();
      expect(result.contact.linkedin).toBe('linkedin.com/in/johndoe');
      expect(result.contact.github).toBe('github.com/johndoe');

      // Sections
      expect(result.sections).toHaveLength(4);

      // Summary section
      const summarySection = result.sections.find(s => s.type === 'profile');
      expect(summarySection).toBeDefined();
      expect(summarySection?.content.join(' ')).toContain('full-stack');

      // Experience section
      const experienceSection = result.sections.find(s => s.type === 'experience');
      expect(experienceSection).toBeDefined();
      expect(experienceSection?.jobs).toHaveLength(2);
      expect(experienceSection?.jobs?.[0].bullets).toHaveLength(4);
      expect(experienceSection?.jobs?.[1].bullets).toHaveLength(4);

      // Education section
      const educationSection = result.sections.find(s => s.type === 'education');
      expect(educationSection).toBeDefined();
      expect(educationSection?.education).toHaveLength(1);
      expect(educationSection?.education?.[0].degree).toContain('Bachelor');

      // Skills section
      const skillsSection = result.sections.find(s => s.type === 'skills');
      expect(skillsSection).toBeDefined();
      expect(skillsSection?.content.join(' ')).toContain('JavaScript');
      expect(skillsSection?.content.join(' ')).toContain('TypeScript');
    });
  });
});
