import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from '../auth-store';

describe('auth-store', () => {
  beforeEach(() => {
    useAuthStore.setState({
      token: null,
      user: null,
      isAuthenticated: false,
    });
  });

  it('should have initial unauthenticated state', () => {
    const state = useAuthStore.getState();

    expect(state.token).toBeNull();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it('should set auth with token and user', () => {
    const mockUser = {
      _id: 'user-1',
      googleId: 'google-123',
      email: 'test@example.com',
      displayName: 'Test User',
      totalPoints: 100,
      preferredLanguage: 'ko',
      currentStreak: 5,
      longestStreak: 10,
    };

    useAuthStore.getState().setAuth('test-token', mockUser);
    const state = useAuthStore.getState();

    expect(state.token).toBe('test-token');
    expect(state.user).toEqual(mockUser);
    expect(state.isAuthenticated).toBe(true);
  });

  it('should logout and clear state', () => {
    const mockUser = {
      _id: 'user-1',
      googleId: 'google-123',
      email: 'test@example.com',
      displayName: 'Test User',
      totalPoints: 0,
      preferredLanguage: 'ko',
      currentStreak: 0,
      longestStreak: 0,
    };

    useAuthStore.getState().setAuth('test-token', mockUser);
    useAuthStore.getState().logout();
    const state = useAuthStore.getState();

    expect(state.token).toBeNull();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });
});
