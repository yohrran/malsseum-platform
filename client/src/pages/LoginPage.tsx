import { Navigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuthStore } from '../store/auth-store';
import { useGoogleAuth } from '../features/auth/useGoogleAuth';

export const LoginPage = () => {
  const { isAuthenticated } = useAuthStore();
  const googleAuth = useGoogleAuth();

  if (isAuthenticated) return <Navigate to="/" replace />;

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-10 text-center">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-amber-50">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-amber-600"
            >
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-stone-800">말씀</h1>
          <p className="mt-2 text-sm text-stone-400">매일 성경을 함께 읽어요</p>
        </div>

        <div className="rounded-2xl border border-stone-100 bg-white p-6 shadow-sm">
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
              <p className="text-sm text-red-500">
                로그인에 실패했습니다. 다시 시도해 주세요.
              </p>
            )}

            {googleAuth.isPending && (
              <p className="text-sm text-stone-400">로그인 중...</p>
            )}
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-stone-300">
          Google 계정으로 간편하게 시작하세요
        </p>
      </div>
    </div>
  );
};
