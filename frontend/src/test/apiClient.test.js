import { beforeEach, describe, expect, it } from 'vitest';
import { ApiError, getAccessToken, setAccessToken } from '../api/client';

describe('api client session handling', () => {
  beforeEach(() => {
    setAccessToken(null);
    window.localStorage.clear();
  });

  it('keeps the access token in memory and never in storage', () => {
    setAccessToken('token-123');
    expect(getAccessToken()).toBe('token-123');
    expect(JSON.stringify(window.localStorage)).not.toContain('token-123');
  });

  it('clears the token on sign out', () => {
    setAccessToken('token-123');
    setAccessToken(null);
    expect(getAccessToken()).toBeNull();
  });

  it('exposes the backend error code on ApiError', () => {
    const error = new ApiError({ code: 'FORBIDDEN', message: 'Not allowed', status: 403 });
    expect(error.code).toBe('FORBIDDEN');
    expect(error.message).toBe('Not allowed');
  });
});
