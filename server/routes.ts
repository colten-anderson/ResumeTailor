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
import { setupAuth, isAuthenticated } from "./replitAuth";
import { parseResume } from "./resumeParser";
import { generateProfessionalDOCX, generateModernDOCX } from "./docxGenerator";
import { generateProfessionalPDF, generateModernPDF } from "./pdfGenerator";

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
  // Setup authentication
  await setupAuth(app);

  // Get user info endpoint
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Get all resume sessions for the authenticated user
  app.get('/api/user/sessions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const sessions = await storage.getUserResumeSessions(userId);
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching user sessions:", error);
      res.status(500).json({ message: "Failed to fetch user sessions" });
    }
  });

  app.post("/api/upload-resume", isAuthenticated, upload.single('resume'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const parsedContent = await parseResumeFile(req.file);
      const userId = req.user.claims.sub;
      
      const session = await storage.createResumeSession({
        userId,
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

  app.post("/api/tailor-resume", isAuthenticated, async (req: any, res) => {
    try {
      const validation = tailorRequestSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ 
          error: "Invalid request",
          details: validation.error.errors 
        });
      }

      const { sessionId, jobDescription } = validation.data;

      const userId = req.user.claims.sub;
      const session = await storage.getResumeSession(sessionId);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }
      
      // Verify session belongs to user
      if (session.userId !== userId) {
        return res.status(403).json({ error: "Access denied" });
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

  app.get("/api/session/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const session = await storage.getResumeSession(req.params.id);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }
      
      // Verify session belongs to user
      if (session.userId !== userId) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      res.json(session);
    } catch (error: any) {
      console.error("Error fetching session:", error);
      res.status(500).json({ error: error.message || "Failed to fetch session" });
    }
  });

  // Test endpoint for automated testing - accepts text content directly
  app.post("/api/test/upload-resume-text", isAuthenticated, async (req: any, res) => {
    try {
      const { fileName, content } = req.body;
      
      if (!fileName || !content) {
        return res.status(400).json({ error: "fileName and content required" });
      }

      const userId = req.user.claims.sub;
      const session = await storage.createResumeSession({
        userId,
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

  // Generate DOCX file from tailored resume (Pro accounts only)
  app.get("/api/download/docx/:sessionId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      // Check if user has pro account
      if (user?.accountTier !== 'pro') {
        return res.status(403).json({ error: "Pro account required for downloads" });
      }
      
      const session = await storage.getResumeSession(req.params.sessionId);
      if (!session || !session.tailoredContent) {
        return res.status(404).json({ error: "Session not found or resume not tailored" });
      }
      
      // Verify session belongs to user
      if (session.userId !== userId) {
        return res.status(403).json({ error: "Access denied" });
      }

      const format = (req.query.format as string) || 'professional';
      
      // Parse the resume
      const parsedResume = parseResume(session.tailoredContent);
      
      // Generate DOCX based on format
      const buffer = format === 'modern' 
        ? await generateModernDOCX(parsedResume)
        : await generateProfessionalDOCX(parsedResume);
      
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      res.setHeader('Content-Disposition', 'attachment; filename=tailored-resume.docx');
      res.send(buffer);
    } catch (error: any) {
      console.error("Error generating DOCX:", error);
      res.status(500).json({ error: error.message || "Failed to generate DOCX" });
    }
  });

  // Generate PDF file from tailored resume (Pro accounts only)
  app.get("/api/download/pdf/:sessionId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      // Check if user has pro account
      if (user?.accountTier !== 'pro') {
        return res.status(403).json({ error: "Pro account required for downloads" });
      }
      
      const session = await storage.getResumeSession(req.params.sessionId);
      if (!session || !session.tailoredContent) {
        return res.status(404).json({ error: "Session not found or resume not tailored" });
      }
      
      // Verify session belongs to user
      if (session.userId !== userId) {
        return res.status(403).json({ error: "Access denied" });
      }

      const format = (req.query.format as string) || 'professional';
      
      // Parse the resume
      const parsedResume = parseResume(session.tailoredContent);
      
      const doc = new PDFDocument({
        size: 'LETTER',
        margins: { top: 72, bottom: 72, left: 72, right: 72 }
      });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=tailored-resume.pdf');
      
      doc.pipe(res);

      // Generate PDF based on format
      if (format === 'modern') {
        generateModernPDF(parsedResume, doc);
      } else {
        generateProfessionalPDF(parsedResume, doc);
      }

      doc.end();
    } catch (error: any) {
      console.error("Error generating PDF:", error);
      res.status(500).json({ error: error.message || "Failed to generate PDF" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
