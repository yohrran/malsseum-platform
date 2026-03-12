import { Navigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuthStore } from '../store/auth-store';
import { useGoogleAuth } from '../features/auth/useGoogleAuth';

export const LoginPage = () => {
  const { isAuthenticated } = useAuthStore();
  const googleAuth = useGoogleAuth();

  if (isAuthenticated) return <Navigate to="/" replace />;

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-stone-900 px-4">
      {/* Animated gradient background */}
      <div className="absolute inset-0">
        <div className="absolute -left-1/4 -top-1/4 h-[600px] w-[600px] animate-pulse rounded-full bg-amber-500/20 blur-[120px]" />
        <div
          className="absolute -bottom-1/4 -right-1/4 h-[500px] w-[500px] rounded-full bg-amber-600/15 blur-[100px]"
          style={{ animation: 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite 1s' }}
        />
        <div
          className="absolute left-1/2 top-1/3 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-orange-400/10 blur-[80px]"
          style={{ animation: 'pulse 5s cubic-bezier(0.4, 0, 0.6, 1) infinite 2s' }}
        />
      </div>

      {/* Subtle grain texture overlay */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
      }} />

      {/* Content */}
      <div className="relative z-10 w-full max-w-sm">
        {/* Logo & Title */}
        <div className="mb-10 text-center">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-[28px] border border-amber-400/20 bg-amber-500/10 shadow-lg shadow-amber-500/10 backdrop-blur-sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="40"
              height="40"
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
          <h1 className="text-4xl font-bold tracking-tight text-white">말씀</h1>
          <p className="mt-3 text-base text-stone-400">매일 성경을 함께 읽어요</p>
        </div>

        {/* Scripture quote */}
        <div className="mb-8 text-center">
          <blockquote className="px-4">
            <p className="text-sm leading-relaxed text-amber-200/60 italic">
              "주의 말씀은 내 발에 등이요 내 길에 빛이니이다"
            </p>
            <cite className="mt-2 block text-xs font-medium text-stone-500 not-italic">
              시편 119:105
            </cite>
          </blockquote>
        </div>

        {/* Login card - glassmorphism */}
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">
          <div className="flex flex-col items-center gap-5">
            <p className="text-sm font-medium text-stone-300">
              시작하기
            </p>

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
              <p className="text-sm text-red-400">
                로그인에 실패했습니다. 다시 시도해 주세요.
              </p>
            )}

            {googleAuth.isPending && (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-amber-400 border-t-transparent" />
                <p className="text-sm text-stone-400">로그인 중...</p>
              </div>
            )}
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-stone-600">
          Google 계정으로 간편하게 시작하세요
        </p>
      </div>
    </div>
  );
};
