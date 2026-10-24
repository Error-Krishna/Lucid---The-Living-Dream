import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { PersistenceManager } from './persistence';
import type { FeedbackSubmission } from '@lucid/shared';

describe('PersistenceManager - Feedback Submission', () => {
  let persistence: PersistenceManager;
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    persistence = new PersistenceManager();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  const mockPayload: Omit<FeedbackSubmission, 'id' | 'submittedAt'> = {
    experienceRating: 'Amazing',
    primaryInterest: 'The visuals and atmosphere',
    decision: 'YES',
    improvements: 'Add space stations and deeper sound design',
    rating: 5,
    interest: 'The visuals and atmosphere',
    prototypeVersion: '1.1.0-space-mvp',
  };

  it('sends POST request to /api/feedback with JSON headers and submission body', async () => {
    let capturedUrl = '';
    let capturedInit: RequestInit | undefined;

    globalThis.fetch = vi.fn().mockImplementation(async (url: string, init?: RequestInit) => {
      capturedUrl = url;
      capturedInit = init;
      return new Response(
        JSON.stringify({
          success: true,
          submissionId: 'test-feedback-uuid-1234',
        }),
        {
          status: 201,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    });

    const result = await persistence.submitFeedback(mockPayload);

    expect(capturedUrl).toContain('/api/feedback');
    expect(capturedInit?.method).toBe('POST');
    expect(capturedInit?.headers).toEqual({
      'Content-Type': 'application/json',
      Accept: 'application/json',
    });
    expect(JSON.parse(capturedInit?.body as string)).toEqual(mockPayload);

    expect(result).toEqual({
      success: true,
      isRemote: true,
      id: 'test-feedback-uuid-1234',
    });
  });

  it('handles server validation or persistence error with JSON response', async () => {
    globalThis.fetch = vi.fn().mockImplementation(async () => {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Missing required field: decision',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    });

    const result = await persistence.submitFeedback(mockPayload);

    expect(result.success).toBe(false);
    expect(result.isRemote).toBe(false);
    expect(result.error).toBe('Missing required field: decision');
  });

  it('handles non-JSON server responses gracefully (e.g. HTML SPA rewrite or 502/504 Bad Gateway)', async () => {
    globalThis.fetch = vi.fn().mockImplementation(async () => {
      return new Response('<!DOCTYPE html><html><body>Error</body></html>', {
        status: 200,
        headers: { 'Content-Type': 'text/html' },
      });
    });

    const result = await persistence.submitFeedback(mockPayload);

    expect(result.success).toBe(false);
    expect(result.isRemote).toBe(false);
    expect(result.error).toContain('non-JSON response');
  });

  it('handles network failure or fetch exceptions cleanly without throwing', async () => {
    globalThis.fetch = vi.fn().mockImplementation(async () => {
      throw new TypeError('Failed to fetch');
    });

    const result = await persistence.submitFeedback(mockPayload);

    expect(result.success).toBe(false);
    expect(result.isRemote).toBe(false);
    expect(result.error).toBe('Failed to fetch');
  });
});
