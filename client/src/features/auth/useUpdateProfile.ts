import { useMutation } from '@tanstack/react-query';
import { apiClient } from '../../lib/api-client';
import { useAuthStore } from '../../store/auth-store';
import type { ApiResponse, User } from '../../lib/types';

type UpdateProfileParams = {
  preferredLanguage?: string;
};

export const useUpdateProfile = () => {
  const { setAuth, token } = useAuthStore();

  return useMutation({
    mutationFn: async (params: UpdateProfileParams) => {
      const { data } = await apiClient.patch<ApiResponse<User>>(
        '/api/auth/profile',
        params
      );
      if (!data.data) throw new Error(data.error ?? 'Failed to update profile');
      return data.data;
    },
    onSuccess: (user) => {
      if (token) setAuth(token, user);
    },
  });
};
