import { Navigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuthStore } from '../store/auth-store';
import { useGoogleAuth } from '../features/auth/useGoogleAuth';

export const LoginPage = () => {
  const { isAuthenticated } = useAuthStore();
  const googleAuth = useGoogleAuth();

  if (isAuthenticated) return <Navigate to="/" replace />;

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-stone-50 px-5">
      {/* Soft background accent */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-0 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-100/60 blur-[100px]" />
      </div>

      <div className="relative z-10 flex w-full max-w-sm flex-col items-center">
        {/* Logo */}
        <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-[22px] bg-stone-800">
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
            className="text-amber-400"
          >
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
          </svg>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold tracking-tight text-stone-800">
          매일 말씀
        </h1>
        <p className="mt-2 text-sm text-stone-400">
          함께 성경을 읽어요
        </p>

        {/* Scripture */}
        <blockquote className="mt-8 rounded-2xl bg-white px-6 py-5 text-center ring-1 ring-stone-200/60">
          <p className="text-sm leading-relaxed text-stone-500 italic">
            "주의 말씀은 내 발에 등이요 내 길에 빛이니이다"
          </p>
          <cite className="mt-2 block text-xs font-medium text-stone-400 not-italic">
            시편 119:105
          </cite>
        </blockquote>

        {/* Login */}
        <div className="mt-8 flex w-full flex-col items-center gap-4">
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
            width="320"
          />

          {googleAuth.isError && (
            <p className="text-sm text-red-500">
              로그인에 실패했습니다. 다시 시도해 주세요.
            </p>
          )}

          {googleAuth.isPending && (
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-stone-800 border-t-transparent" />
              <p className="text-sm text-stone-500">로그인 중...</p>
            </div>
          )}
        </div>

        <p className="mt-6 text-xs text-stone-400">
          Google 계정으로 간편하게 시작하세요
        </p>
      </div>
    </div>
  );
};
