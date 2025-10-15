import { 
  Document, 
  Packer, 
  Paragraph, 
  TextRun, 
  HeadingLevel,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  ShadingType,
  VerticalAlign
} from "docx";
import { ParsedResume } from "./resumeParser";

export async function generateProfessionalDOCX(resume: ParsedResume): Promise<Buffer> {
  const children: (Paragraph | Table)[] = [];
  
  // Header with name (centered, large)
  if (resume.contact.name) {
    children.push(
      new Paragraph({
        text: resume.contact.name.toUpperCase(),
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
      })
    );
  }
  
  // Contact info (centered, single line)
  const contactParts: string[] = [];
  if (resume.contact.phone) contactParts.push(resume.contact.phone);
  if (resume.contact.email) contactParts.push(resume.contact.email);
  if (resume.contact.location) contactParts.push(resume.contact.location);
  if (resume.contact.linkedin) contactParts.push(resume.contact.linkedin.replace('linkedin.com/in/', ''));
  if (resume.contact.github) contactParts.push(resume.contact.github.replace('github.com/', ''));
  if (resume.contact.website) contactParts.push(resume.contact.website);
  
  if (contactParts.length > 0) {
    children.push(
      new Paragraph({
        text: contactParts.join(' | '),
        alignment: AlignmentType.CENTER,
        spacing: { after: 300, before: 100 },
      })
    );
  }
  
  // Sections
  for (const section of resume.sections) {
    // Section header
    children.push(
      new Paragraph({
        text: section.title.toUpperCase(),
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 },
        thematicBreak: true,
      })
    );
    
    if (section.type === 'experience' && section.jobs) {
      for (const job of section.jobs) {
        // Use table for job header with right-aligned date
        const jobTable = new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: {
            top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
            bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
            left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
            right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
            insideHorizontal: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
            insideVertical: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
          },
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  width: { size: 70, type: WidthType.PERCENTAGE },
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: job.company,
                          bold: true,
                          size: 24,
                        }),
                        new TextRun({
                          text: job.title ? `, ${job.title}` : '',
                          size: 24,
                        }),
                      ],
                    }),
                  ],
                  borders: {
                    top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                    bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                    left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                    right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                  },
                }),
                new TableCell({
                  width: { size: 30, type: WidthType.PERCENTAGE },
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: job.dateRange || '',
                          italics: true,
                          size: 22,
                        }),
                      ],
                      alignment: AlignmentType.RIGHT,
                    }),
                  ],
                  borders: {
                    top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                    bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                    left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                    right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                  },
                }),
              ],
            }),
          ],
        });
        
        children.push(jobTable);
        
        // Bullets
        for (const bullet of job.bullets) {
          children.push(
            new Paragraph({
              text: bullet,
              bullet: { level: 0 },
              spacing: { before: 50, after: 50 },
            })
          );
        }
        
        children.push(new Paragraph({ text: '', spacing: { after: 100 } }));
      }
    } else if (section.type === 'education' && section.education) {
      for (const edu of section.education) {
        // Use table for education header with right-aligned date
        const eduTable = new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: {
            top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
            bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
            left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
            right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
            insideHorizontal: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
            insideVertical: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
          },
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  width: { size: 70, type: WidthType.PERCENTAGE },
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: edu.school,
                          bold: true,
                          size: 24,
                        }),
                        new TextRun({
                          text: edu.degree ? `, ${edu.degree}` : '',
                          size: 24,
                        }),
                      ],
                    }),
                  ],
                  borders: {
                    top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                    bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                    left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                    right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                  },
                }),
                new TableCell({
                  width: { size: 30, type: WidthType.PERCENTAGE },
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: edu.dateRange || '',
                          italics: true,
                          size: 22,
                        }),
                      ],
                      alignment: AlignmentType.RIGHT,
                    }),
                  ],
                  borders: {
                    top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                    bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                    left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                    right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                  },
                }),
              ],
            }),
          ],
        });
        
        children.push(eduTable);
        
        for (const detail of edu.details) {
          children.push(
            new Paragraph({
              text: detail,
              spacing: { before: 50, after: 50 },
            })
          );
        }
        
        children.push(new Paragraph({ text: '', spacing: { after: 100 } }));
      }
    } else {
      // Other sections - just content
      for (const line of section.content) {
        const isBullet = line.startsWith('•') || line.startsWith('-') || line.startsWith('*');
        const text = isBullet ? line.replace(/^[•\-*]\s*/, '') : line;
        
        children.push(
          new Paragraph({
            text,
            bullet: isBullet ? { level: 0 } : undefined,
            spacing: { before: 50, after: 50 },
          })
        );
      }
    }
  }
  
  const doc = new Document({
    sections: [{
      properties: {},
      children,
    }],
  });
  
  return await Packer.toBuffer(doc);
}

export async function generateModernDOCX(resume: ParsedResume): Promise<Buffer> {
  // Two-column layout: sidebar (30%) + main content (70%)
  
  // Build sidebar content
  const sidebarParagraphs: Paragraph[] = [];
  
  // Name in sidebar
  if (resume.contact.name) {
    sidebarParagraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: resume.contact.name.toUpperCase(),
            bold: true,
            size: 28,
            color: "1E40AF",
          }),
        ],
        spacing: { after: 200 },
      })
    );
  }
  
  // Contact section in sidebar
  sidebarParagraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: "CONTACT",
          bold: true,
          size: 20,
          color: "1E40AF",
        }),
      ],
      spacing: { before: 200, after: 100 },
    })
  );
  
  const contactLines: string[] = [];
  if (resume.contact.phone) contactLines.push(resume.contact.phone);
  if (resume.contact.email) contactLines.push(resume.contact.email);
  if (resume.contact.location) contactLines.push(resume.contact.location);
  if (resume.contact.linkedin) contactLines.push(resume.contact.linkedin.replace('https://', ''));
  if (resume.contact.github) contactLines.push(resume.contact.github.replace('https://', ''));
  if (resume.contact.website) contactLines.push(resume.contact.website.replace('https://', ''));
  
  for (const line of contactLines) {
    sidebarParagraphs.push(
      new Paragraph({
        text: line,
        spacing: { after: 60 },
      })
    );
  }
  
  // Add sidebar sections (Skills, Education)
  const sidebarSections = resume.sections.filter(s => 
    s.type === 'skills' || s.type === 'education'
  );
  
  for (const section of sidebarSections) {
    sidebarParagraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: section.title.toUpperCase(),
            bold: true,
            size: 20,
            color: "1E40AF",
          }),
        ],
        spacing: { before: 300, after: 100 },
      })
    );
    
    if (section.type === 'education' && section.education) {
      for (const edu of section.education) {
        sidebarParagraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: edu.school,
                bold: true,
                size: 20,
              }),
            ],
            spacing: { before: 100, after: 50 },
          })
        );
        if (edu.degree) {
          sidebarParagraphs.push(
            new Paragraph({
              text: edu.degree,
              spacing: { after: 50 },
            })
          );
        }
        if (edu.dateRange) {
          sidebarParagraphs.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: edu.dateRange,
                  italics: true,
                }),
              ],
              spacing: { after: 100 },
            })
          );
        }
      }
    } else {
      for (const line of section.content) {
        const text = line.replace(/^[•\-*]\s*/, '');
        sidebarParagraphs.push(
          new Paragraph({
            text,
            spacing: { after: 60 },
          })
        );
      }
    }
  }
  
  // Build main content
  const mainParagraphs: Paragraph[] = [];
  const mainSections = resume.sections.filter(s => 
    s.type !== 'skills' && s.type !== 'education'
  );
  
  for (const section of mainSections) {
    mainParagraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: section.title.toUpperCase(),
            bold: true,
            size: 28,
            color: "1E40AF",
          }),
        ],
        spacing: { before: 200, after: 150 },
        border: {
          bottom: {
            color: "1E40AF",
            space: 1,
            style: BorderStyle.SINGLE,
            size: 6,
          },
        },
      })
    );
    
    if (section.type === 'experience' && section.jobs) {
      for (const job of section.jobs) {
        // Job header with company, title, and date
        mainParagraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: job.company,
                bold: true,
                size: 24,
              }),
              new TextRun({
                text: job.title ? ` - ${job.title}` : '',
                size: 22,
              }),
              new TextRun({
                text: job.dateRange ? `     ${job.dateRange}` : '',
                italics: true,
                size: 20,
                color: "666666",
              }),
            ],
            spacing: { before: 200, after: 120 },
          })
        );
        
        for (const bullet of job.bullets) {
          mainParagraphs.push(
            new Paragraph({
              text: bullet,
              bullet: { level: 0 },
              spacing: { before: 60, after: 60 },
            })
          );
        }
      }
    } else {
      for (const line of section.content) {
        const isBullet = line.startsWith('•') || line.startsWith('-') || line.startsWith('*');
        const text = isBullet ? line.replace(/^[•\-*]\s*/, '') : line;
        
        mainParagraphs.push(
          new Paragraph({
            text,
            bullet: isBullet ? { level: 0 } : undefined,
            spacing: { before: 60, after: 60 },
          })
        );
      }
    }
  }
  
  // Create main table for two-column layout
  const layoutTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      insideHorizontal: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      insideVertical: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 30, type: WidthType.PERCENTAGE },
            children: sidebarParagraphs,
            shading: {
              type: ShadingType.SOLID,
              color: "F0F4F8",
            },
            verticalAlign: VerticalAlign.TOP,
            borders: {
              top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
              bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
              left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
              right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
            },
          }),
          new TableCell({
            width: { size: 70, type: WidthType.PERCENTAGE },
            children: mainParagraphs,
            verticalAlign: VerticalAlign.TOP,
            borders: {
              top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
              bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
              left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
              right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
            },
          }),
        ],
      }),
    ],
  });
  
  const doc = new Document({
    sections: [{
      properties: {},
      children: [layoutTable],
    }],
  });
  
  return await Packer.toBuffer(doc);
}
