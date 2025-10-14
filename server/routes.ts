import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";
import OpenAI from "openai";
import { storage } from "./storage";
import { z } from "zod";

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

const extractJobUrlSchema = z.object({
  url: z.string().url().refine(
    (url) => {
      try {
        const parsed = new URL(url);
        // Only allow HTTPS scheme
        if (parsed.protocol !== 'https:') {
          return false;
        }
        // Block private IP ranges and localhost
        const hostname = parsed.hostname.toLowerCase();
        if (
          hostname === 'localhost' ||
          hostname === '127.0.0.1' ||
          hostname === '0.0.0.0' ||
          hostname.startsWith('192.168.') ||
          hostname.startsWith('10.') ||
          hostname.startsWith('172.16.') ||
          hostname.startsWith('172.17.') ||
          hostname.startsWith('172.18.') ||
          hostname.startsWith('172.19.') ||
          hostname.startsWith('172.20.') ||
          hostname.startsWith('172.21.') ||
          hostname.startsWith('172.22.') ||
          hostname.startsWith('172.23.') ||
          hostname.startsWith('172.24.') ||
          hostname.startsWith('172.25.') ||
          hostname.startsWith('172.26.') ||
          hostname.startsWith('172.27.') ||
          hostname.startsWith('172.28.') ||
          hostname.startsWith('172.29.') ||
          hostname.startsWith('172.30.') ||
          hostname.startsWith('172.31.') ||
          hostname === '[::1]' ||
          hostname.startsWith('169.254.') // Link-local
        ) {
          return false;
        }
        return true;
      } catch {
        return false;
      }
    },
    { message: 'Only HTTPS URLs from public domains are allowed' }
  ),
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

  app.post("/api/extract-job-from-url", async (req, res) => {
    try {
      const validation = extractJobUrlSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ 
          error: validation.error.issues[0]?.message || "Invalid URL",
          details: validation.error.issues 
        });
      }

      const { url } = validation.data;

      // Fetch the HTML content with timeout and size limit
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      try {
        const response = await fetch(url, {
          signal: controller.signal,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          }
        });

        clearTimeout(timeout);

        if (!response.ok) {
          return res.status(400).json({ 
            error: `Failed to fetch URL: ${response.status} ${response.statusText}` 
          });
        }

        // Limit HTML size to 500KB to prevent abuse
        const contentLength = response.headers.get('content-length');
        if (contentLength && parseInt(contentLength) > 500000) {
          return res.status(400).json({ 
            error: "Page too large - please use the 'Paste Text' option instead" 
          });
        }

        const html = await response.text();
        
        // Additional size check after download
        if (html.length > 500000) {
          return res.status(400).json({ 
            error: "Page content too large - please use the 'Paste Text' option instead" 
          });
        }

        // Truncate HTML to reasonable size for OpenAI (keep first 100KB which should contain the job description)
        const truncatedHtml = html.slice(0, 100000);

        // Use OpenAI to extract the job description from HTML
        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: `You are a job description extractor. Extract the complete job description from the provided HTML content. 

Focus on extracting:
- Job title and company
- Job description and responsibilities
- Required qualifications and skills
- Preferred qualifications (if any)
- Company information and benefits (if relevant)

Return the extracted job description as clean, well-formatted text. Remove all HTML tags, navigation elements, headers, footers, and irrelevant content. If the page requires authentication or the job posting is not found, return "ERROR: Could not extract job description - the page may require login or the posting may no longer be available."`
            },
            {
              role: "user",
              content: truncatedHtml
            }
          ],
          temperature: 0.3,
          max_tokens: 1500,
        });

        const extractedDescription = completion.choices[0]?.message?.content || "";

        if (extractedDescription.startsWith("ERROR:")) {
          return res.status(400).json({ error: extractedDescription });
        }

        res.json({ jobDescription: extractedDescription });
      } finally {
        clearTimeout(timeout);
      }
    } catch (error: any) {
      console.error("Error extracting job from URL:", error);
      if (error.name === 'AbortError') {
        return res.status(400).json({ error: "Request timeout - the page took too long to load" });
      }
      res.status(500).json({ error: error.message || "Failed to extract job description from URL" });
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

  const httpServer = createServer(app);

  return httpServer;
}
