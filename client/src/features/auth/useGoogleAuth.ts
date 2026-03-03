import { useMutation } from '@tanstack/react-query';
import { apiClient } from '../../lib/api-client';
import { useAuthStore } from '../../store/auth-store';
import type { ApiResponse, User } from '../../lib/types';

export const useGoogleAuth = () => {
  const { setAuth } = useAuthStore();

  return useMutation({
    mutationFn: async (credential: string) => {
      const { data } = await apiClient.post<
        ApiResponse<{ token: string; user: User }>
      >('/api/auth/google', { credential });
      if (!data.data) throw new Error(data.error ?? 'Auth failed');
      return data.data;
    },
    onSuccess: ({ token, user }) => {
      setAuth(token, user);
    },
  });
};
