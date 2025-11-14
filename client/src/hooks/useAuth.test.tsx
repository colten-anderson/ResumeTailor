import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import type { ReactNode } from 'react';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch as any;

describe('useAuth', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  const createMockResponse = (data: any, ok = true, status = 200) => ({
    ok,
    status,
    statusText: ok ? 'OK' : 'Unauthorized',
    json: async () => data,
    text: async () => JSON.stringify(data),
  } as Response);

  it('should return loading state initially', () => {
    mockFetch.mockImplementation(() => new Promise(() => {})); // Never resolves

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.user).toBeUndefined();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should return user when query succeeds', async () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      profileImageUrl: null,
      accountTier: 'free',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockFetch.mockResolvedValueOnce(createMockResponse(mockUser));

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    }, { timeout: 2000 });

    expect(result.current.isAuthenticated).toBe(true);
  });

  it('should handle authentication errors', async () => {
    mockFetch.mockResolvedValueOnce(
      createMockResponse({ error: 'Unauthorized' }, false, 401)
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    }, { timeout: 2000 });

    expect(result.current.isAuthenticated).toBe(false);
  });
});
