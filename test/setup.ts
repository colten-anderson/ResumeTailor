import '@testing-library/jest-dom';
import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.SESSION_SECRET = 'test-secret-key';
process.env.OPENAI_API_KEY = 'test-openai-key';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
process.env.REPLIT_AUTH_ISSUER = 'https://test.replit.com';
process.env.REPLIT_AUTH_CLIENT_ID = 'test-client-id';
process.env.REPLIT_AUTH_CLIENT_SECRET = 'test-client-secret';

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  error: vi.fn(),
  warn: vi.fn(),
};
