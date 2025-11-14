import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DatabaseStorage } from './storage';
import { db } from './db';
import type { User, ResumeSession } from '@shared/schema';

// Mock the database
vi.mock('./db', () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
  },
}));

describe('DatabaseStorage', () => {
  let storage: DatabaseStorage;
  let mockDb: any;

  beforeEach(() => {
    storage = new DatabaseStorage();
    mockDb = vi.mocked(db);
    vi.clearAllMocks();
  });

  describe('getUser', () => {
    it('should return user when found', async () => {
      const mockUser: User = {
        id: 'user-123',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        profileImageUrl: null,
        accountTier: 'free',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([mockUser]),
        }),
      });

      const result = await storage.getUser('user-123');

      expect(result).toEqual(mockUser);
    });

    it('should return undefined when user not found', async () => {
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([]),
        }),
      });

      const result = await storage.getUser('non-existent');

      expect(result).toBeUndefined();
    });

    it('should handle database errors', async () => {
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockRejectedValue(new Error('Database connection error')),
        }),
      });

      await expect(storage.getUser('user-123')).rejects.toThrow('Database connection error');
    });
  });

  describe('upsertUser', () => {
    it('should insert new user', async () => {
      const newUser = {
        id: 'user-123',
        email: 'new@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        profileImageUrl: 'https://example.com/image.jpg',
        accountTier: 'free' as const,
      };

      const insertedUser: User = {
        ...newUser,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockDb.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          onConflictDoUpdate: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([insertedUser]),
          }),
        }),
      });

      const result = await storage.upsertUser(newUser);

      expect(result).toEqual(insertedUser);
    });

    it('should update existing user on conflict', async () => {
      const existingUser = {
        id: 'user-123',
        email: 'existing@example.com',
        firstName: 'John',
        lastName: 'Updated',
        accountTier: 'pro' as const,
      };

      const updatedUser: User = {
        ...existingUser,
        profileImageUrl: null,
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date(),
      };

      mockDb.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          onConflictDoUpdate: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([updatedUser]),
          }),
        }),
      });

      const result = await storage.upsertUser(existingUser);

      expect(result.lastName).toBe('Updated');
      expect(result.accountTier).toBe('pro');
    });

    it('should handle database errors during upsert', async () => {
      mockDb.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          onConflictDoUpdate: vi.fn().mockReturnValue({
            returning: vi.fn().mockRejectedValue(new Error('Unique constraint violation')),
          }),
        }),
      });

      await expect(
        storage.upsertUser({
          id: 'user-123',
          email: 'test@example.com',
        })
      ).rejects.toThrow('Unique constraint violation');
    });
  });

  describe('createResumeSession', () => {
    it('should create new resume session', async () => {
      const sessionData = {
        userId: 'user-123',
        fileName: 'resume.pdf',
        originalContent: 'Resume content here',
      };

      const createdSession: ResumeSession = {
        id: 'session-456',
        ...sessionData,
        jobDescription: null,
        tailoredContent: null,
        createdAt: new Date(),
      };

      mockDb.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([createdSession]),
        }),
      });

      const result = await storage.createResumeSession(sessionData);

      expect(result).toEqual(createdSession);
      expect(result.id).toBe('session-456');
      expect(result.fileName).toBe('resume.pdf');
      expect(result.originalContent).toBe('Resume content here');
    });

    it('should create session with all fields', async () => {
      const sessionData = {
        userId: 'user-123',
        fileName: 'resume.pdf',
        originalContent: 'Original content',
        jobDescription: 'Job posting',
        tailoredContent: 'Tailored content',
      };

      const createdSession: ResumeSession = {
        id: 'session-789',
        ...sessionData,
        createdAt: new Date(),
      };

      mockDb.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([createdSession]),
        }),
      });

      const result = await storage.createResumeSession(sessionData);

      expect(result.jobDescription).toBe('Job posting');
      expect(result.tailoredContent).toBe('Tailored content');
    });

    it('should handle foreign key constraint errors', async () => {
      mockDb.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockRejectedValue(new Error('Foreign key constraint failed')),
        }),
      });

      await expect(
        storage.createResumeSession({
          userId: 'non-existent-user',
          fileName: 'resume.pdf',
          originalContent: 'Content',
        })
      ).rejects.toThrow('Foreign key constraint failed');
    });
  });

  describe('getResumeSession', () => {
    it('should return session when found', async () => {
      const mockSession: ResumeSession = {
        id: 'session-123',
        userId: 'user-456',
        fileName: 'resume.pdf',
        originalContent: 'Original content',
        jobDescription: 'Job description',
        tailoredContent: 'Tailored content',
        createdAt: new Date(),
      };

      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([mockSession]),
        }),
      });

      const result = await storage.getResumeSession('session-123');

      expect(result).toEqual(mockSession);
    });

    it('should return undefined when session not found', async () => {
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([]),
        }),
      });

      const result = await storage.getResumeSession('non-existent');

      expect(result).toBeUndefined();
    });

    it('should handle database query errors', async () => {
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockRejectedValue(new Error('Query timeout')),
        }),
      });

      await expect(storage.getResumeSession('session-123')).rejects.toThrow('Query timeout');
    });
  });

  describe('updateResumeSession', () => {
    it('should update session with partial data', async () => {
      const updates = {
        jobDescription: 'New job description',
        tailoredContent: 'New tailored content',
      };

      const updatedSession: ResumeSession = {
        id: 'session-123',
        userId: 'user-456',
        fileName: 'resume.pdf',
        originalContent: 'Original content',
        ...updates,
        createdAt: new Date(),
      };

      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([updatedSession]),
          }),
        }),
      });

      const result = await storage.updateResumeSession('session-123', updates);

      expect(result?.jobDescription).toBe('New job description');
      expect(result?.tailoredContent).toBe('New tailored content');
    });

    it('should return undefined when session not found', async () => {
      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([]),
          }),
        }),
      });

      const result = await storage.updateResumeSession('non-existent', {
        tailoredContent: 'New content',
      });

      expect(result).toBeUndefined();
    });

    it('should update only specified fields', async () => {
      const updates = {
        tailoredContent: 'Updated tailored content only',
      };

      const updatedSession: ResumeSession = {
        id: 'session-123',
        userId: 'user-456',
        fileName: 'resume.pdf',
        originalContent: 'Original content',
        jobDescription: 'Original job description',
        tailoredContent: 'Updated tailored content only',
        createdAt: new Date(),
      };

      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([updatedSession]),
          }),
        }),
      });

      const result = await storage.updateResumeSession('session-123', updates);

      expect(result?.tailoredContent).toBe('Updated tailored content only');
      expect(result?.jobDescription).toBe('Original job description');
    });

    it('should handle update errors', async () => {
      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockRejectedValue(new Error('Update failed')),
          }),
        }),
      });

      await expect(
        storage.updateResumeSession('session-123', { tailoredContent: 'New' })
      ).rejects.toThrow('Update failed');
    });
  });

  describe('getUserResumeSessions', () => {
    it('should return all sessions for a user', async () => {
      const mockSessions: ResumeSession[] = [
        {
          id: 'session-1',
          userId: 'user-123',
          fileName: 'resume1.pdf',
          originalContent: 'Content 1',
          jobDescription: 'Job 1',
          tailoredContent: 'Tailored 1',
          createdAt: new Date('2024-01-01'),
        },
        {
          id: 'session-2',
          userId: 'user-123',
          fileName: 'resume2.pdf',
          originalContent: 'Content 2',
          jobDescription: null,
          tailoredContent: null,
          createdAt: new Date('2024-01-02'),
        },
      ];

      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(mockSessions),
        }),
      });

      const result = await storage.getUserResumeSessions('user-123');

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('session-1');
      expect(result[1].id).toBe('session-2');
    });

    it('should return empty array when user has no sessions', async () => {
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([]),
        }),
      });

      const result = await storage.getUserResumeSessions('user-with-no-sessions');

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should only return sessions for the specified user', async () => {
      const mockSessions: ResumeSession[] = [
        {
          id: 'session-1',
          userId: 'user-123',
          fileName: 'resume1.pdf',
          originalContent: 'Content 1',
          jobDescription: null,
          tailoredContent: null,
          createdAt: new Date(),
        },
      ];

      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(mockSessions),
        }),
      });

      const result = await storage.getUserResumeSessions('user-123');

      expect(result).toHaveLength(1);
      expect(result[0].userId).toBe('user-123');
    });

    it('should handle query errors', async () => {
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockRejectedValue(new Error('Database connection lost')),
        }),
      });

      await expect(storage.getUserResumeSessions('user-123')).rejects.toThrow(
        'Database connection lost'
      );
    });
  });
});
