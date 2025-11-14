import { describe, it, expect } from 'vitest';
import { generateProfessionalPDF, generateModernPDF } from './pdfGenerator';
import PDFDocument from 'pdfkit';
import type { ParsedResume } from './resumeParser';

describe('PDF Generator', () => {
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

  const createMockPDFDoc = () => {
    const doc = new PDFDocument({
      size: 'LETTER',
      margins: { top: 72, bottom: 72, left: 72, right: 72 },
    });

    const chunks: Buffer[] = [];
    doc.on('data', (chunk) => chunks.push(chunk));

    return { doc, chunks };
  };

  describe('generateProfessionalPDF', () => {
    it('should generate PDF without errors', () => {
      const { doc } = createMockPDFDoc();

      expect(() => {
        generateProfessionalPDF(mockResume, doc);
        doc.end();
      }).not.toThrow();
    });

    it('should write contact information to PDF', (done) => {
      const { doc, chunks } = createMockPDFDoc();

      doc.on('end', () => {
        const buffer = Buffer.concat(chunks);
        const text = buffer.toString();

        expect(text).toContain('John Doe');
        expect(text).toContain('john.doe@example.com');
        done();
      });

      generateProfessionalPDF(mockResume, doc);
      doc.end();
    });

    it('should include section headers', (done) => {
      const { doc, chunks } = createMockPDFDoc();

      doc.on('end', () => {
        const buffer = Buffer.concat(chunks);
        const text = buffer.toString();

        expect(text).toContain('SUMMARY');
        expect(text).toContain('WORK EXPERIENCE');
        expect(text).toContain('EDUCATION');
        expect(text).toContain('SKILLS');
        done();
      });

      generateProfessionalPDF(mockResume, doc);
      doc.end();
    });

    it('should include work experience details', (done) => {
      const { doc, chunks } = createMockPDFDoc();

      doc.on('end', () => {
        const buffer = Buffer.concat(chunks);
        const text = buffer.toString();

        expect(text).toContain('Tech Corp');
        expect(text).toContain('Senior Software Engineer');
        expect(text).toContain('2020 - Present');
        done();
      });

      generateProfessionalPDF(mockResume, doc);
      doc.end();
    });

    it('should include education details', (done) => {
      const { doc, chunks } = createMockPDFDoc();

      doc.on('end', () => {
        const buffer = Buffer.concat(chunks);
        const text = buffer.toString();

        expect(text).toContain('University of Technology');
        expect(text).toContain('Bachelor of Science');
        done();
      });

      generateProfessionalPDF(mockResume, doc);
      doc.end();
    });

    it('should handle missing contact information gracefully', () => {
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

      const { doc } = createMockPDFDoc();

      expect(() => {
        generateProfessionalPDF(minimalResume, doc);
        doc.end();
      }).not.toThrow();
    });

    it('should handle empty sections array', () => {
      const emptyResume: ParsedResume = {
        contact: {
          name: 'Jane Doe',
          email: 'jane@example.com',
        },
        sections: [],
        rawText: '',
      };

      const { doc } = createMockPDFDoc();

      expect(() => {
        generateProfessionalPDF(emptyResume, doc);
        doc.end();
      }).not.toThrow();
    });

    it('should handle sections without jobs or education arrays', () => {
      const resume: ParsedResume = {
        contact: { name: 'Test User' },
        sections: [
          {
            title: 'EXPERIENCE',
            type: 'experience',
            content: ['Some experience text'],
          },
        ],
        rawText: '',
      };

      const { doc } = createMockPDFDoc();

      expect(() => {
        generateProfessionalPDF(resume, doc);
        doc.end();
      }).not.toThrow();
    });

    it('should handle special characters in content', (done) => {
      const specialCharsResume: ParsedResume = {
        contact: {
          name: 'José González',
          email: 'josé@example.com',
        },
        sections: [
          {
            title: 'SKILLS',
            type: 'skills',
            content: ['C++, C#, React & Redux'],
          },
        ],
        rawText: '',
      };

      const { doc, chunks } = createMockPDFDoc();

      doc.on('end', () => {
        const buffer = Buffer.concat(chunks);
        expect(buffer.length).toBeGreaterThan(0);
        done();
      });

      generateProfessionalPDF(specialCharsResume, doc);
      doc.end();
    });
  });

  describe('generateModernPDF', () => {
    it('should generate PDF without errors', () => {
      const { doc } = createMockPDFDoc();

      expect(() => {
        generateModernPDF(mockResume, doc);
        doc.end();
      }).not.toThrow();
    });

    it('should write contact information to PDF', (done) => {
      const { doc, chunks } = createMockPDFDoc();

      doc.on('end', () => {
        const buffer = Buffer.concat(chunks);
        const text = buffer.toString();

        expect(text).toContain('John Doe');
        expect(text).toContain('john.doe@example.com');
        done();
      });

      generateModernPDF(mockResume, doc);
      doc.end();
    });

    it('should include section headers', (done) => {
      const { doc, chunks } = createMockPDFDoc();

      doc.on('end', () => {
        const buffer = Buffer.concat(chunks);
        const text = buffer.toString();

        expect(text).toContain('SUMMARY');
        expect(text).toContain('WORK EXPERIENCE');
        expect(text).toContain('EDUCATION');
        expect(text).toContain('SKILLS');
        done();
      });

      generateModernPDF(mockResume, doc);
      doc.end();
    });

    it('should handle missing contact information gracefully', () => {
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

      const { doc } = createMockPDFDoc();

      expect(() => {
        generateModernPDF(minimalResume, doc);
        doc.end();
      }).not.toThrow();
    });

    it('should handle empty sections array', () => {
      const emptyResume: ParsedResume = {
        contact: {
          name: 'Jane Doe',
          email: 'jane@example.com',
        },
        sections: [],
        rawText: '',
      };

      const { doc } = createMockPDFDoc();

      expect(() => {
        generateModernPDF(emptyResume, doc);
        doc.end();
      }).not.toThrow();
    });
  });

  describe('PDF Format Validation', () => {
    it('should generate valid PDF file signature', (done) => {
      const { doc, chunks } = createMockPDFDoc();

      doc.on('end', () => {
        const buffer = Buffer.concat(chunks);

        // PDF files should start with %PDF-
        expect(buffer.toString('utf-8', 0, 5)).toBe('%PDF-');
        done();
      });

      generateProfessionalPDF(mockResume, doc);
      doc.end();
    });

    it('should contain PDF end-of-file marker', (done) => {
      const { doc, chunks } = createMockPDFDoc();

      doc.on('end', () => {
        const buffer = Buffer.concat(chunks);
        const text = buffer.toString('utf-8');

        // PDF files should end with %%EOF
        expect(text.trim().endsWith('%%EOF')).toBe(true);
        done();
      });

      generateProfessionalPDF(mockResume, doc);
      doc.end();
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long resume with many sections', () => {
      const longResume: ParsedResume = {
        contact: { name: 'Test User', email: 'test@example.com' },
        sections: Array(20).fill(null).map((_, i) => ({
          title: `SECTION ${i}`,
          type: 'other' as const,
          content: [`Content for section ${i}`, `More content for section ${i}`],
        })),
        rawText: '',
      };

      const { doc } = createMockPDFDoc();

      expect(() => {
        generateProfessionalPDF(longResume, doc);
        doc.end();
      }).not.toThrow();
    });

    it('should handle job entries with many bullets', () => {
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

      const { doc } = createMockPDFDoc();

      expect(() => {
        generateProfessionalPDF(resume, doc);
        doc.end();
      }).not.toThrow();
    });

    it('should handle very long text in a single bullet', () => {
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

      const { doc } = createMockPDFDoc();

      expect(() => {
        generateProfessionalPDF(resume, doc);
        doc.end();
      }).not.toThrow();
    });

    it('should handle empty bullet arrays', () => {
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
                bullets: [],
              },
            ],
          },
        ],
        rawText: '',
      };

      const { doc } = createMockPDFDoc();

      expect(() => {
        generateProfessionalPDF(resume, doc);
        doc.end();
      }).not.toThrow();
    });
  });
});
