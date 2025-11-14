import { describe, it, expect, beforeEach, vi } from 'vitest';
import express, { type Express } from 'express';
import request from 'supertest';
import { registerRoutes } from './routes';
import { storage } from './storage';
import OpenAI from 'openai';

// Mock dependencies
vi.mock('./storage', () => ({
  storage: {
    getUser: vi.fn(),
    upsertUser: vi.fn(),
    createResumeSession: vi.fn(),
    getResumeSession: vi.fn(),
    updateResumeSession: vi.fn(),
    getUserResumeSessions: vi.fn(),
  },
}));

vi.mock('./replitAuth', () => ({
  setupAuth: vi.fn(),
  isAuthenticated: vi.fn((req, res, next) => {
    // Mock authentication middleware
    req.user = {
      claims: {
        sub: 'test-user-id',
      },
    };
    next();
  }),
}));

vi.mock('openai', () => {
  const mockCreate = vi.fn().mockResolvedValue({
    choices: [
      {
        message: {
          content: 'This is a tailored resume with relevant keywords and optimized content.',
        },
      },
    ],
  });

  return {
    default: class MockOpenAI {
      chat = {
        completions: {
          create: mockCreate,
        },
      };
    },
  };
});

describe('API Routes', () => {
  let app: Express;

  beforeEach(async () => {
    app = express();
    app.use(express.json());
    await registerRoutes(app);
    vi.clearAllMocks();
  });

  describe('GET /api/auth/user', () => {
    it('should return user data for authenticated user', async () => {
      const mockUser = {
        id: 'test-user-id',
        username: 'testuser',
        email: 'test@example.com',
        fullName: 'Test User',
        accountTier: 'free' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(storage.getUser).mockResolvedValue(mockUser);

      const response = await request(app)
        .get('/api/auth/user')
        .expect(200);

      expect(response.body).toMatchObject({
        id: 'test-user-id',
        username: 'testuser',
        email: 'test@example.com',
      });
      expect(storage.getUser).toHaveBeenCalledWith('test-user-id');
    });

    it('should return 500 if user fetch fails', async () => {
      vi.mocked(storage.getUser).mockRejectedValue(new Error('Database error'));

      await request(app)
        .get('/api/auth/user')
        .expect(500);
    });
  });

  describe('POST /api/upload-resume', () => {
    it('should return 400 when no file is uploaded', async () => {
      const response = await request(app)
        .post('/api/upload-resume')
        .expect(400);

      expect(response.body).toHaveProperty('error', 'No file uploaded');
    });

    it('should successfully upload and parse PDF file', async () => {
      const mockSession = {
        id: 'session-123',
        userId: 'test-user-id',
        fileName: 'resume.pdf',
        originalContent: 'Parsed resume content',
        tailoredContent: null,
        jobDescription: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(storage.createResumeSession).mockResolvedValue(mockSession);

      const pdfBuffer = Buffer.from('fake pdf content');

      const response = await request(app)
        .post('/api/upload-resume')
        .attach('resume', pdfBuffer, 'resume.pdf')
        .expect(200);

      expect(response.body).toHaveProperty('sessionId');
      expect(response.body).toHaveProperty('fileName');
      expect(response.body).toHaveProperty('content');
    });

    it('should successfully upload and parse DOCX file', async () => {
      const mockSession = {
        id: 'session-456',
        userId: 'test-user-id',
        fileName: 'resume.docx',
        originalContent: 'Parsed resume content',
        tailoredContent: null,
        jobDescription: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(storage.createResumeSession).mockResolvedValue(mockSession);

      const docxBuffer = Buffer.from('PK'); // DOCX files start with PK

      const response = await request(app)
        .post('/api/upload-resume')
        .attach('resume', docxBuffer, 'resume.docx')
        .expect(200);

      expect(response.body).toHaveProperty('sessionId');
      expect(response.body).toHaveProperty('fileName', 'resume.docx');
    });
  });

  describe('POST /api/tailor-resume', () => {
    it('should return 400 for invalid request body', async () => {
      const response = await request(app)
        .post('/api/tailor-resume')
        .send({ sessionId: 'test' })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Invalid request');
      expect(response.body).toHaveProperty('details');
    });

    it('should return 400 for short job description', async () => {
      const response = await request(app)
        .post('/api/tailor-resume')
        .send({
          sessionId: 'session-123',
          jobDescription: 'Too short',
        })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Invalid request');
    });

    it('should return 404 if session not found', async () => {
      vi.mocked(storage.getResumeSession).mockResolvedValue(undefined);

      const response = await request(app)
        .post('/api/tailor-resume')
        .send({
          sessionId: 'non-existent',
          jobDescription: 'A valid job description with enough characters to pass validation requirements.',
        })
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Session not found');
    });

    it('should return 403 if session does not belong to user', async () => {
      const mockSession = {
        id: 'session-123',
        userId: 'different-user',
        fileName: 'resume.pdf',
        originalContent: 'Original content',
        tailoredContent: null,
        jobDescription: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(storage.getResumeSession).mockResolvedValue(mockSession);

      const response = await request(app)
        .post('/api/tailor-resume')
        .send({
          sessionId: 'session-123',
          jobDescription: 'A valid job description with enough characters to pass validation requirements.',
        })
        .expect(403);

      expect(response.body).toHaveProperty('error', 'Access denied');
    });

    it('should successfully tailor resume with OpenAI', async () => {
      const mockSession = {
        id: 'session-123',
        userId: 'test-user-id',
        fileName: 'resume.pdf',
        originalContent: 'Original resume content',
        tailoredContent: null,
        jobDescription: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(storage.getResumeSession).mockResolvedValue(mockSession);
      vi.mocked(storage.updateResumeSession).mockResolvedValue({
        ...mockSession,
        tailoredContent: 'Tailored resume',
        jobDescription: 'Job description',
      });

      const response = await request(app)
        .post('/api/tailor-resume')
        .send({
          sessionId: 'session-123',
          jobDescription: 'Looking for a senior software engineer with 5+ years experience in React and Node.js',
        })
        .expect(200);

      expect(response.body).toHaveProperty('tailoredContent');
      expect(response.body.tailoredContent).toContain('tailored resume');
      expect(storage.updateResumeSession).toHaveBeenCalledWith('session-123', {
        jobDescription: expect.any(String),
        tailoredContent: expect.any(String),
      });
    });
  });

  describe('GET /api/session/:id', () => {
    it('should return 404 if session not found', async () => {
      vi.mocked(storage.getResumeSession).mockResolvedValue(undefined);

      const response = await request(app)
        .get('/api/session/non-existent')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Session not found');
    });

    it('should return 403 if session does not belong to user', async () => {
      const mockSession = {
        id: 'session-123',
        userId: 'different-user',
        fileName: 'resume.pdf',
        originalContent: 'Original content',
        tailoredContent: null,
        jobDescription: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(storage.getResumeSession).mockResolvedValue(mockSession);

      const response = await request(app)
        .get('/api/session/session-123')
        .expect(403);

      expect(response.body).toHaveProperty('error', 'Access denied');
    });

    it('should successfully return session data', async () => {
      const mockSession = {
        id: 'session-123',
        userId: 'test-user-id',
        fileName: 'resume.pdf',
        originalContent: 'Original content',
        tailoredContent: 'Tailored content',
        jobDescription: 'Job description',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(storage.getResumeSession).mockResolvedValue(mockSession);

      const response = await request(app)
        .get('/api/session/session-123')
        .expect(200);

      expect(response.body).toMatchObject({
        id: 'session-123',
        fileName: 'resume.pdf',
        originalContent: 'Original content',
        tailoredContent: 'Tailored content',
      });
    });
  });

  describe('POST /api/test/upload-resume-text', () => {
    it('should return 400 when fileName or content is missing', async () => {
      await request(app)
        .post('/api/test/upload-resume-text')
        .send({ fileName: 'test.txt' })
        .expect(400);

      await request(app)
        .post('/api/test/upload-resume-text')
        .send({ content: 'test content' })
        .expect(400);
    });

    it('should create session with text content', async () => {
      const mockSession = {
        id: 'session-789',
        userId: 'test-user-id',
        fileName: 'test-resume.txt',
        originalContent: 'Test resume content',
        tailoredContent: null,
        jobDescription: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(storage.createResumeSession).mockResolvedValue(mockSession);

      const response = await request(app)
        .post('/api/test/upload-resume-text')
        .send({
          fileName: 'test-resume.txt',
          content: 'Test resume content',
        })
        .expect(200);

      expect(response.body).toMatchObject({
        sessionId: 'session-789',
        fileName: 'test-resume.txt',
        content: 'Test resume content',
      });
    });
  });

  describe('GET /api/download/docx/:sessionId', () => {
    it('should return 403 for non-pro users', async () => {
      const mockUser = {
        id: 'test-user-id',
        username: 'testuser',
        email: 'test@example.com',
        fullName: 'Test User',
        accountTier: 'free' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(storage.getUser).mockResolvedValue(mockUser);

      const response = await request(app)
        .get('/api/download/docx/session-123')
        .expect(403);

      expect(response.body).toHaveProperty('error', 'Pro account required for downloads');
    });

    it('should return 404 if session not found or not tailored', async () => {
      const mockUser = {
        id: 'test-user-id',
        username: 'testuser',
        email: 'test@example.com',
        fullName: 'Test User',
        accountTier: 'pro' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(storage.getUser).mockResolvedValue(mockUser);
      vi.mocked(storage.getResumeSession).mockResolvedValue(undefined);

      const response = await request(app)
        .get('/api/download/docx/non-existent')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Session not found or resume not tailored');
    });

    it('should return 403 if session does not belong to user', async () => {
      const mockUser = {
        id: 'test-user-id',
        username: 'testuser',
        email: 'test@example.com',
        fullName: 'Test User',
        accountTier: 'pro' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockSession = {
        id: 'session-123',
        userId: 'different-user',
        fileName: 'resume.pdf',
        originalContent: 'Original content',
        tailoredContent: 'Tailored content',
        jobDescription: 'Job description',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(storage.getUser).mockResolvedValue(mockUser);
      vi.mocked(storage.getResumeSession).mockResolvedValue(mockSession);

      const response = await request(app)
        .get('/api/download/docx/session-123')
        .expect(403);

      expect(response.body).toHaveProperty('error', 'Access denied');
    });

    it('should generate DOCX for pro user with valid session', async () => {
      const mockUser = {
        id: 'test-user-id',
        username: 'testuser',
        email: 'test@example.com',
        fullName: 'Test User',
        accountTier: 'pro' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockSession = {
        id: 'session-123',
        userId: 'test-user-id',
        fileName: 'resume.pdf',
        originalContent: 'Original content',
        tailoredContent: `John Doe
john@example.com

SUMMARY
Software engineer

EXPERIENCE
Engineer | Company | 2020 - Present
- Did work

EDUCATION
BS Computer Science | University | 2020

SKILLS
JavaScript, Python`,
        jobDescription: 'Job description',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(storage.getUser).mockResolvedValue(mockUser);
      vi.mocked(storage.getResumeSession).mockResolvedValue(mockSession);

      const response = await request(app)
        .get('/api/download/docx/session-123')
        .expect(200);

      expect(response.headers['content-type']).toContain('wordprocessingml');
      expect(response.headers['content-disposition']).toContain('tailored-resume.docx');
    });
  });

  describe('GET /api/download/pdf/:sessionId', () => {
    it('should return 403 for non-pro users', async () => {
      const mockUser = {
        id: 'test-user-id',
        username: 'testuser',
        email: 'test@example.com',
        fullName: 'Test User',
        accountTier: 'free' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(storage.getUser).mockResolvedValue(mockUser);

      const response = await request(app)
        .get('/api/download/pdf/session-123')
        .expect(403);

      expect(response.body).toHaveProperty('error', 'Pro account required for downloads');
    });

    it('should return 404 if session not found or not tailored', async () => {
      const mockUser = {
        id: 'test-user-id',
        username: 'testuser',
        email: 'test@example.com',
        fullName: 'Test User',
        accountTier: 'pro' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(storage.getUser).mockResolvedValue(mockUser);
      vi.mocked(storage.getResumeSession).mockResolvedValue(undefined);

      const response = await request(app)
        .get('/api/download/pdf/non-existent')
        .expect(404);
    });

    it('should generate PDF for pro user with valid session', async () => {
      const mockUser = {
        id: 'test-user-id',
        username: 'testuser',
        email: 'test@example.com',
        fullName: 'Test User',
        accountTier: 'pro' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockSession = {
        id: 'session-123',
        userId: 'test-user-id',
        fileName: 'resume.pdf',
        originalContent: 'Original content',
        tailoredContent: `John Doe
john@example.com

SUMMARY
Software engineer

EXPERIENCE
Engineer | Company | 2020 - Present
- Did work

EDUCATION
BS Computer Science | University | 2020

SKILLS
JavaScript, Python`,
        jobDescription: 'Job description',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(storage.getUser).mockResolvedValue(mockUser);
      vi.mocked(storage.getResumeSession).mockResolvedValue(mockSession);

      const response = await request(app)
        .get('/api/download/pdf/session-123')
        .expect(200);

      expect(response.headers['content-type']).toBe('application/pdf');
      expect(response.headers['content-disposition']).toContain('tailored-resume.pdf');
    });
  });
});
