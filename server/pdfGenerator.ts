import PDFDocument from "pdfkit";
import { ParsedResume } from "./resumeParser";

export function generateProfessionalPDF(resume: ParsedResume, doc: PDFKit.PDFDocument): void {
  const pageWidth = 612; // Letter size
  const margin = 72;
  const contentWidth = pageWidth - (margin * 2);
  
  // Header with name (centered, large)
  if (resume.contact.name) {
    doc.fontSize(24)
       .font('Helvetica-Bold')
       .text(resume.contact.name.toUpperCase(), margin, margin, {
         width: contentWidth,
         align: 'center'
       });
    doc.moveDown(0.5);
  }
  
  // Contact info (centered)
  const contactParts: string[] = [];
  if (resume.contact.phone) contactParts.push(resume.contact.phone);
  if (resume.contact.email) contactParts.push(resume.contact.email);
  if (resume.contact.location) contactParts.push(resume.contact.location);
  if (resume.contact.linkedin) contactParts.push(resume.contact.linkedin.replace('linkedin.com/in/', ''));
  if (resume.contact.github) contactParts.push(resume.contact.github.replace('github.com/', ''));
  if (resume.contact.website) contactParts.push(resume.contact.website);
  
  if (contactParts.length > 0) {
    doc.fontSize(10)
       .font('Helvetica')
       .text(contactParts.join(' | '), {
         width: contentWidth,
         align: 'center'
       });
    doc.moveDown(1.5);
  }
  
  // Sections
  for (const section of resume.sections) {
    // Section header with line
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .text(section.title.toUpperCase());
    
    const lineY = doc.y + 2;
    doc.moveTo(margin, lineY)
       .lineTo(pageWidth - margin, lineY)
       .stroke();
    
    doc.moveDown(0.8);
    
    if (section.type === 'experience' && section.jobs) {
      for (const job of section.jobs) {
        const jobY = doc.y;
        
        // Company and title on left
        doc.fontSize(12)
           .font('Helvetica-Bold')
           .text(job.company, margin, jobY, { continued: true })
           .font('Helvetica')
           .text(job.title ? `, ${job.title}` : '');
        
        // Date on right (approximate right alignment)
        if (job.dateRange) {
          doc.fontSize(10)
             .font('Helvetica-Oblique')
             .text(job.dateRange, margin, jobY, {
               width: contentWidth,
               align: 'right'
             });
        }
        
        doc.moveDown(0.5);
        
        // Bullets
        doc.fontSize(10).font('Helvetica');
        for (const bullet of job.bullets) {
          const bulletY = doc.y;
          doc.text('•', margin, bulletY, { continued: true })
             .text('  ' + bullet, margin + 15, bulletY, {
               width: contentWidth - 15
             });
          doc.moveDown(0.3);
        }
        
        doc.moveDown(0.5);
      }
    } else if (section.type === 'education' && section.education) {
      for (const edu of section.education) {
        const eduY = doc.y;
        
        doc.fontSize(12)
           .font('Helvetica-Bold')
           .text(edu.school, margin, eduY, { continued: true })
           .font('Helvetica')
           .text(edu.degree ? `, ${edu.degree}` : '');
        
        if (edu.dateRange) {
          doc.fontSize(10)
             .font('Helvetica-Oblique')
             .text(edu.dateRange, margin, eduY, {
               width: contentWidth,
               align: 'right'
             });
        }
        
        doc.moveDown(0.5);
        
        for (const detail of edu.details) {
          doc.fontSize(10)
             .font('Helvetica')
             .text(detail, { width: contentWidth });
          doc.moveDown(0.3);
        }
        
        doc.moveDown(0.5);
      }
    } else {
      // Other sections
      doc.fontSize(10).font('Helvetica');
      for (const line of section.content) {
        const isBullet = line.startsWith('•') || line.startsWith('-') || line.startsWith('*');
        const text = isBullet ? line.replace(/^[•\-*]\s*/, '') : line;
        
        if (isBullet) {
          const bulletY = doc.y;
          doc.text('•', margin, bulletY, { continued: true })
             .text('  ' + text, margin + 15, bulletY, {
               width: contentWidth - 15
             });
        } else {
          doc.text(text, { width: contentWidth });
        }
        doc.moveDown(0.3);
      }
    }
    
    doc.moveDown(0.5);
  }
}

export function generateModernPDF(resume: ParsedResume, doc: PDFKit.PDFDocument): void {
  const pageWidth = 612;
  const margin = 50;
  const sidebarWidth = 180;
  const mainMargin = margin + sidebarWidth + 20;
  const mainWidth = pageWidth - mainMargin - margin;
  
  let currentY = margin;
  
  // Draw sidebar background (light blue/gray)
  doc.rect(0, 0, margin + sidebarWidth, 842).fill('#F8FAFC');
  
  // Reset fill color
  doc.fillColor('#000000');
  
  // Name in sidebar
  if (resume.contact.name) {
    doc.fontSize(20)
       .font('Helvetica-Bold')
       .fillColor('#1E40AF')
       .text(resume.contact.name.toUpperCase(), margin, currentY, {
         width: sidebarWidth
       });
    currentY = doc.y + 20;
  }
  
  doc.fillColor('#000000');
  
  // Contact info in sidebar
  doc.fontSize(9).font('Helvetica');
  if (resume.contact.phone) {
    doc.text(resume.contact.phone, margin, currentY, { width: sidebarWidth });
    currentY = doc.y + 8;
  }
  if (resume.contact.email) {
    doc.text(resume.contact.email, margin, currentY, { width: sidebarWidth });
    currentY = doc.y + 8;
  }
  if (resume.contact.location) {
    doc.text(resume.contact.location, margin, currentY, { width: sidebarWidth });
    currentY = doc.y + 8;
  }
  if (resume.contact.linkedin) {
    doc.text(resume.contact.linkedin.replace('https://', ''), margin, currentY, { width: sidebarWidth });
    currentY = doc.y + 8;
  }
  if (resume.contact.github) {
    doc.text(resume.contact.github.replace('https://', ''), margin, currentY, { width: sidebarWidth });
    currentY = doc.y + 8;
  }
  
  currentY += 20;
  
  // Separate sidebar sections (Skills, Education) from main sections
  const sidebarSections = resume.sections.filter(s => 
    s.type === 'skills' || s.type === 'education'
  );
  const mainSections = resume.sections.filter(s => 
    s.type !== 'skills' && s.type !== 'education'
  );
  
  // Render sidebar sections
  for (const section of sidebarSections) {
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .fillColor('#1E40AF')
       .text(section.title.toUpperCase(), margin, currentY, { width: sidebarWidth });
    
    currentY = doc.y + 8;
    doc.fillColor('#000000');
    
    if (section.type === 'education' && section.education) {
      doc.fontSize(9).font('Helvetica');
      for (const edu of section.education) {
        doc.font('Helvetica-Bold').text(edu.school, margin, currentY, { width: sidebarWidth });
        currentY = doc.y + 5;
        if (edu.degree) {
          doc.font('Helvetica').text(edu.degree, margin, currentY, { width: sidebarWidth });
          currentY = doc.y + 5;
        }
        if (edu.dateRange) {
          doc.font('Helvetica-Oblique').text(edu.dateRange, margin, currentY, { width: sidebarWidth });
          currentY = doc.y + 10;
        }
      }
    } else {
      doc.fontSize(9).font('Helvetica');
      for (const line of section.content) {
        const text = line.replace(/^[•\-*]\s*/, '');
        doc.text(text, margin, currentY, { width: sidebarWidth });
        currentY = doc.y + 5;
      }
    }
    
    currentY += 15;
  }
  
  // Render main content sections
  let mainY = margin;
  
  for (const section of mainSections) {
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .fillColor('#1E40AF')
       .text(section.title.toUpperCase(), mainMargin, mainY, { width: mainWidth });
    
    const lineY = doc.y + 2;
    doc.moveTo(mainMargin, lineY)
       .lineTo(pageWidth - margin, lineY)
       .strokeColor('#1E40AF')
       .stroke();
    
    mainY = doc.y + 10;
    doc.fillColor('#000000').strokeColor('#000000');
    
    if (section.type === 'experience' && section.jobs) {
      for (const job of section.jobs) {
        const jobY = mainY;
        
        doc.fontSize(12)
           .font('Helvetica-Bold')
           .text(job.company, mainMargin, jobY, { continued: true })
           .font('Helvetica')
           .text(job.title ? ` - ${job.title}` : '');
        
        if (job.dateRange) {
          doc.fontSize(10)
             .font('Helvetica-Oblique')
             .fillColor('#666666')
             .text(job.dateRange, mainMargin, jobY, {
               width: mainWidth,
               align: 'right'
             });
          doc.fillColor('#000000');
        }
        
        mainY = doc.y + 8;
        
        doc.fontSize(10).font('Helvetica');
        for (const bullet of job.bullets) {
          doc.text('•', mainMargin, mainY, { continued: true })
             .text('  ' + bullet, mainMargin + 15, mainY, {
               width: mainWidth - 15
             });
          mainY = doc.y + 5;
        }
        
        mainY += 10;
      }
    } else {
      doc.fontSize(10).font('Helvetica');
      for (const line of section.content) {
        const isBullet = line.startsWith('•') || line.startsWith('-') || line.startsWith('*');
        const text = isBullet ? line.replace(/^[•\-*]\s*/, '') : line;
        
        if (isBullet) {
          doc.text('•', mainMargin, mainY, { continued: true })
             .text('  ' + text, mainMargin + 15, mainY, {
               width: mainWidth - 15
             });
        } else {
          doc.text(text, mainMargin, mainY, { width: mainWidth });
        }
        mainY = doc.y + 5;
      }
      mainY += 10;
    }
  }
}
