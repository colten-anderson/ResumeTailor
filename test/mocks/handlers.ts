import { http, HttpResponse } from 'msw';

export const handlers = [
  // Mock OpenAI API
  http.post('https://api.openai.com/v1/chat/completions', async ({ request }) => {
    const body = await request.json() as any;
    return HttpResponse.json({
      id: 'chatcmpl-test',
      object: 'chat.completion',
      created: Date.now(),
      model: 'gpt-4o-mini',
      choices: [
        {
          index: 0,
          message: {
            role: 'assistant',
            content: 'This is a tailored resume based on the job description.',
          },
          finish_reason: 'stop',
        },
      ],
      usage: {
        prompt_tokens: 100,
        completion_tokens: 50,
        total_tokens: 150,
      },
    });
  }),

  // Mock authentication endpoints
  http.get('/api/auth/user', () => {
    return HttpResponse.json({
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
      fullName: 'Test User',
      accountType: 'free',
    });
  }),

  http.get('/api/login', () => {
    return new HttpResponse(null, {
      status: 302,
      headers: {
        Location: 'https://replit.com/auth',
      },
    });
  }),

  http.post('/api/logout', () => {
    return new HttpResponse(null, { status: 200 });
  }),
];
