import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";
import OpenAI from "openai";
import { storage } from "./storage";
import { z } from "zod";
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";
import PDFDocument from "pdfkit";

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const tailorRequestSchema = z.object({
  sessionId: z.string(),
  jobDescription: z.string().min(50),
});

async function parseResumeFile(file: Express.Multer.File): Promise<string> {
  const extension = file.originalname.split('.').pop()?.toLowerCase();
  
  if (extension === 'pdf') {
    const parser = new PDFParse({ data: file.buffer });
    try {
      const result = await parser.getText();
      return result.text;
    } finally {
      await parser.destroy();
    }
  } else if (extension === 'docx') {
    const result = await mammoth.extractRawText({ buffer: file.buffer });
    return result.value;
  } else {
    throw new Error('Unsupported file format');
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  
  app.post("/api/upload-resume", upload.single('resume'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const parsedContent = await parseResumeFile(req.file);
      
      const session = await storage.createResumeSession({
        fileName: req.file.originalname,
        originalContent: parsedContent,
      });

      res.json({
        sessionId: session.id,
        fileName: session.fileName,
        content: session.originalContent,
      });
    } catch (error: any) {
      console.error("Error uploading resume:", error);
      res.status(500).json({ error: error.message || "Failed to upload and parse resume" });
    }
  });

  app.post("/api/tailor-resume", async (req, res) => {
    try {
      const validation = tailorRequestSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ 
          error: "Invalid request",
          details: validation.error.errors 
        });
      }

      const { sessionId, jobDescription } = validation.data;

      const session = await storage.getResumeSession(sessionId);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are an expert resume writer. Your task is to tailor a resume to match a specific job posting. 
Analyze the job description and optimize the resume by:
- Highlighting relevant skills and experience
- Using keywords from the job posting
- Emphasizing achievements that align with job requirements
- Maintaining the original structure and truthfulness
- Keeping the same format and layout style

Return ONLY the tailored resume text, no explanations or additional commentary.`
          },
          {
            role: "user",
            content: `Original Resume:\n\n${session.originalContent}\n\nJob Description:\n\n${jobDescription}\n\nProvide the tailored resume:`
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      });

      const tailoredContent = completion.choices[0]?.message?.content || "";

      await storage.updateResumeSession(sessionId, {
        jobDescription,
        tailoredContent,
      });

      res.json({
        tailoredContent,
      });
    } catch (error: any) {
      console.error("Error tailoring resume:", error);
      res.status(500).json({ error: error.message || "Failed to tailor resume" });
    }
  });

  app.get("/api/session/:id", async (req, res) => {
    try {
      const session = await storage.getResumeSession(req.params.id);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }
      res.json(session);
    } catch (error: any) {
      console.error("Error fetching session:", error);
      res.status(500).json({ error: error.message || "Failed to fetch session" });
    }
  });

  // Test endpoint for automated testing - accepts text content directly
  app.post("/api/test/upload-resume-text", async (req, res) => {
    try {
      const { fileName, content } = req.body;
      
      if (!fileName || !content) {
        return res.status(400).json({ error: "fileName and content required" });
      }

      const session = await storage.createResumeSession({
        fileName,
        originalContent: content,
      });

      res.json({
        sessionId: session.id,
        fileName: session.fileName,
        content: session.originalContent,
      });
    } catch (error: any) {
      console.error("Error creating test session:", error);
      res.status(500).json({ error: error.message || "Failed to create test session" });
    }
  });

  // Generate DOCX file from tailored resume
  app.get("/api/download/docx/:sessionId", async (req, res) => {
    try {
      const session = await storage.getResumeSession(req.params.sessionId);
      if (!session || !session.tailoredContent) {
        return res.status(404).json({ error: "Session not found or resume not tailored" });
      }

      const format = (req.query.format as string) || 'professional';
      const isModern = format === 'modern';

      // Parse the resume content into paragraphs
      const lines = session.tailoredContent.split('\n').filter(line => line.trim());
      
      // Create document sections
      const children: Paragraph[] = lines.map((line, index) => {
        const trimmedLine = line.trim();
        const isHeading = trimmedLine.length < 60 && 
                         (trimmedLine === trimmedLine.toUpperCase() || 
                          /^[A-Z]/.test(trimmedLine) && !trimmedLine.includes('.'));
        
        if (isModern) {
          return new Paragraph({
            children: [
              new TextRun({
                text: trimmedLine,
                bold: isHeading,
                size: isHeading ? 32 : 22,
                color: isHeading ? "1E40AF" : "000000",
                font: "Calibri",
              }),
            ],
            spacing: {
              after: isHeading ? 240 : 120,
              before: index === 0 ? 0 : (isHeading ? 200 : 80),
            },
          });
        } else {
          return new Paragraph({
            children: [
              new TextRun({
                text: trimmedLine,
                bold: isHeading,
                size: isHeading ? 28 : 22,
                color: "000000",
                font: "Calibri",
              }),
            ],
            spacing: {
              after: isHeading ? 200 : 100,
              before: index === 0 ? 0 : 100,
            },
          });
        }
      });

      const doc = new Document({
        sections: [{
          children,
        }],
      });

      const buffer = await Packer.toBuffer(doc);
      
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      res.setHeader('Content-Disposition', 'attachment; filename=tailored-resume.docx');
      res.send(buffer);
    } catch (error: any) {
      console.error("Error generating DOCX:", error);
      res.status(500).json({ error: error.message || "Failed to generate DOCX" });
    }
  });

  // Generate PDF file from tailored resume
  app.get("/api/download/pdf/:sessionId", async (req, res) => {
    try {
      const session = await storage.getResumeSession(req.params.sessionId);
      if (!session || !session.tailoredContent) {
        return res.status(404).json({ error: "Session not found or resume not tailored" });
      }

      const format = (req.query.format as string) || 'professional';
      const isModern = format === 'modern';

      const doc = new PDFDocument({
        size: 'LETTER',
        margins: { top: 72, bottom: 72, left: 72, right: 72 }
      });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=tailored-resume.pdf');
      
      doc.pipe(res);

      const lines = session.tailoredContent.split('\n');
      let isFirstLine = true;

      lines.forEach(line => {
        const trimmedLine = line.trim();
        if (!trimmedLine) {
          doc.moveDown(0.5);
          return;
        }

        const isHeading = trimmedLine.length < 60 && 
                         (trimmedLine === trimmedLine.toUpperCase() || 
                          /^[A-Z]/.test(trimmedLine) && !trimmedLine.includes('.'));

        if (!isFirstLine) {
          doc.moveDown(isHeading ? (isModern ? 0.6 : 0.5) : 0.3);
        }
        isFirstLine = false;

        if (isHeading) {
          if (isModern) {
            doc.fontSize(16).font('Helvetica-Bold').fillColor('#1E40AF').text(trimmedLine);
            doc.fillColor('#000000');
          } else {
            doc.fontSize(14).font('Helvetica-Bold').text(trimmedLine);
          }
        } else {
          doc.fontSize(11).font('Helvetica').text(trimmedLine);
        }
      });

      doc.end();
    } catch (error: any) {
      console.error("Error generating PDF:", error);
      res.status(500).json({ error: error.message || "Failed to generate PDF" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
