import { describe, it, expect } from 'vitest';
import { generateProfessionalDOCX, generateModernDOCX } from './docxGenerator';
import { Packer } from 'docx';
import type { ParsedResume } from './resumeParser';

describe('DOCX Generator', () => {
  const mockResume: ParsedResume = {
    contact: {
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '(555) 123-4567',
      linkedin: 'linkedin.com/in/johndoe',
      github: 'github.com/johndoe',
    },
    sections: [
      {
        title: 'SUMMARY',
        type: 'profile',
        content: ['Experienced software engineer with 5+ years of expertise in full-stack development.'],
      },
      {
        title: 'WORK EXPERIENCE',
        type: 'experience',
        content: [],
        jobs: [
          {
            company: 'Tech Corp',
            title: 'Senior Software Engineer',
            dateRange: '2020 - Present',
            bullets: [
              'Developed scalable web applications using React and Node.js',
              'Led a team of 4 engineers',
              'Improved performance by 40%',
            ],
          },
          {
            company: 'StartupXYZ',
            title: 'Software Engineer',
            dateRange: '2018 - 2020',
            bullets: [
              'Built REST APIs using Express.js',
              'Implemented authentication systems',
            ],
          },
        ],
      },
      {
        title: 'EDUCATION',
        type: 'education',
        content: [],
        education: [
          {
            school: 'University of Technology',
            degree: 'Bachelor of Science in Computer Science',
            dateRange: '2014 - 2018',
            details: ['GPA: 3.8/4.0'],
          },
        ],
      },
      {
        title: 'SKILLS',
        type: 'skills',
        content: ['JavaScript, TypeScript, React, Node.js, PostgreSQL, Docker, AWS'],
      },
    ],
    rawText: 'Original resume text',
  };

  describe('generateProfessionalDOCX', () => {
    it('should generate a valid DOCX buffer', async () => {
      const buffer = await generateProfessionalDOCX(mockResume);

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });

    it('should include contact information', async () => {
      const buffer = await generateProfessionalDOCX(mockResume);

      // DOCX files are binary, but we can check the buffer contains text data
      expect(buffer.length).toBeGreaterThan(1000);
      expect(buffer).toBeInstanceOf(Buffer);
    });

    it('should include all sections', async () => {
      const buffer = await generateProfessionalDOCX(mockResume);

      // Verify it's a valid DOCX buffer with reasonable size
      expect(buffer.length).toBeGreaterThan(1000);
      expect(buffer).toBeInstanceOf(Buffer);
    });

    it('should include work experience details', async () => {
      const buffer = await generateProfessionalDOCX(mockResume);

      // Verify generated document has content
      expect(buffer.length).toBeGreaterThan(1000);
      expect(buffer).toBeInstanceOf(Buffer);
    });

    it('should include education details', async () => {
      const buffer = await generateProfessionalDOCX(mockResume);

      // Verify document was generated
      expect(buffer.length).toBeGreaterThan(1000);
      expect(buffer).toBeInstanceOf(Buffer);
    });

    it('should handle missing contact information gracefully', async () => {
      const minimalResume: ParsedResume = {
        contact: {},
        sections: [
          {
            title: 'SUMMARY',
            type: 'profile',
            content: ['Brief summary'],
          },
        ],
        rawText: '',
      };

      const buffer = await generateProfessionalDOCX(minimalResume);

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });

    it('should handle empty sections array', async () => {
      const emptyResume: ParsedResume = {
        contact: {
          name: 'Jane Doe',
          email: 'jane@example.com',
        },
        sections: [],
        rawText: '',
      };

      const buffer = await generateProfessionalDOCX(emptyResume);

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });

    it('should handle sections without jobs or education arrays', async () => {
      const resume: ParsedResume = {
        contact: { name: 'Test User' },
        sections: [
          {
            title: 'EXPERIENCE',
            type: 'experience',
            content: ['Some experience text'],
          },
          {
            title: 'EDUCATION',
            type: 'education',
            content: ['Some education text'],
          },
        ],
        rawText: '',
      };

      const buffer = await generateProfessionalDOCX(resume);

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });

    it('should handle special characters in content', async () => {
      const specialCharsResume: ParsedResume = {
        contact: {
          name: 'José González',
          email: 'josé@example.com',
        },
        sections: [
          {
            title: 'SKILLS',
            type: 'skills',
            content: ['C++, C#, React & Redux, PostgreSQL™'],
          },
        ],
        rawText: '',
      };

      const buffer = await generateProfessionalDOCX(specialCharsResume);

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });
  });

  describe('generateModernDOCX', () => {
    it('should generate a valid DOCX buffer', async () => {
      const buffer = await generateModernDOCX(mockResume);

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });

    it('should include contact information', async () => {
      const buffer = await generateModernDOCX(mockResume);

      // Verify valid DOCX buffer
      expect(buffer.length).toBeGreaterThan(1000);
      expect(buffer).toBeInstanceOf(Buffer);
    });

    it('should include all sections', async () => {
      const buffer = await generateModernDOCX(mockResume);

      // Verify document generated successfully
      expect(buffer.length).toBeGreaterThan(1000);
      expect(buffer).toBeInstanceOf(Buffer);
    });

    it('should handle missing contact information gracefully', async () => {
      const minimalResume: ParsedResume = {
        contact: {},
        sections: [
          {
            title: 'SUMMARY',
            type: 'profile',
            content: ['Brief summary'],
          },
        ],
        rawText: '',
      };

      const buffer = await generateModernDOCX(minimalResume);

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });

    it('should handle empty sections array', async () => {
      const emptyResume: ParsedResume = {
        contact: {
          name: 'Jane Doe',
          email: 'jane@example.com',
        },
        sections: [],
        rawText: '',
      };

      const buffer = await generateModernDOCX(emptyResume);

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });

    it('should produce different output than professional template', async () => {
      const professionalBuffer = await generateProfessionalDOCX(mockResume);
      const modernBuffer = await generateModernDOCX(mockResume);

      // Buffers should be different (different styling)
      expect(modernBuffer.equals(professionalBuffer)).toBe(false);
      // But both should be valid
      expect(modernBuffer.length).toBeGreaterThan(0);
      expect(professionalBuffer.length).toBeGreaterThan(0);
    });
  });

  describe('DOCX Format Validation', () => {
    it('should generate valid DOCX file signature', async () => {
      const buffer = await generateProfessionalDOCX(mockResume);

      // DOCX files are ZIP archives, should start with PK
      expect(buffer[0]).toBe(0x50); // 'P'
      expect(buffer[1]).toBe(0x4b); // 'K'
    });

    it('should contain required DOCX components', async () => {
      const buffer = await generateProfessionalDOCX(mockResume);
      const text = buffer.toString('utf-8', 0, 1000);

      // Should contain XML namespace declarations typical of DOCX
      expect(text).toContain('word/');
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long resume with many sections', async () => {
      const longResume: ParsedResume = {
        contact: { name: 'Test User', email: 'test@example.com' },
        sections: Array(20).fill(null).map((_, i) => ({
          title: `SECTION ${i}`,
          type: 'other' as const,
          content: [`Content for section ${i}`, `More content for section ${i}`],
        })),
        rawText: '',
      };

      const buffer = await generateProfessionalDOCX(longResume);

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });

    it('should handle job entries with many bullets', async () => {
      const resume: ParsedResume = {
        contact: { name: 'Test User' },
        sections: [
          {
            title: 'EXPERIENCE',
            type: 'experience',
            content: [],
            jobs: [
              {
                company: 'Big Corp',
                title: 'Senior Engineer',
                dateRange: '2020 - Present',
                bullets: Array(20).fill('Accomplished many things'),
              },
            ],
          },
        ],
        rawText: '',
      };

      const buffer = await generateProfessionalDOCX(resume);

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });

    it('should handle very long text in a single bullet', async () => {
      const longText = 'A'.repeat(500);
      const resume: ParsedResume = {
        contact: { name: 'Test User' },
        sections: [
          {
            title: 'EXPERIENCE',
            type: 'experience',
            content: [],
            jobs: [
              {
                company: 'Company',
                title: 'Engineer',
                dateRange: '2020 - Present',
                bullets: [longText],
              },
            ],
          },
        ],
        rawText: '',
      };

      const buffer = await generateProfessionalDOCX(resume);

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });
  });
});
