import { Navigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuthStore } from '../store/auth-store';
import { useGoogleAuth } from '../features/auth/useGoogleAuth';

export const LoginPage = () => {
  const { isAuthenticated } = useAuthStore();
  const googleAuth = useGoogleAuth();

  if (isAuthenticated) return <Navigate to="/" replace />;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 to-blue-50 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-lg">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-4xl font-bold text-indigo-600">말씀</h1>
          <p className="text-sm text-slate-500">Daily Bible reading companion</p>
        </div>

        <div className="flex flex-col items-center gap-4">
          <GoogleLogin
            onSuccess={(credentialResponse) => {
              if (credentialResponse.credential) {
                googleAuth.mutate(credentialResponse.credential);
              }
            }}
            onError={() => {
              /* handled by isError state */
            }}
            theme="outline"
            size="large"
            width="300"
          />

          {googleAuth.isError && (
            <p className="text-sm text-red-500">로그인에 실패했습니다. 다시 시도해 주세요.</p>
          )}

          {googleAuth.isPending && (
            <p className="text-sm text-slate-500">로그인 중...</p>
          )}
        </div>

        <p className="mt-8 text-center text-xs text-slate-400">
          Google 계정으로 로그인하세요
        </p>
      </div>
    </div>
  );
};
