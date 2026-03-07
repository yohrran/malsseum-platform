import { Navigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuthStore } from '../store/auth-store';
import { useGoogleAuth } from '../features/auth/useGoogleAuth';

export const LoginPage = () => {
  const { isAuthenticated } = useAuthStore();
  const googleAuth = useGoogleAuth();

  if (isAuthenticated) return <Navigate to="/" replace />;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 to-blue-50">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-indigo-600">말씀</h1>
          <p className="text-sm text-slate-500">
            Daily Bible reading companion
          </p>
        </div>

        <div className="flex flex-col items-center gap-4">
          <GoogleLogin
            onSuccess={(credentialResponse) => {
              if (credentialResponse.credential) {
                googleAuth.mutate(credentialResponse.credential);
              }
            }}
            onError={() => {
              console.error('Google login failed');
            }}
            theme="outline"
            size="large"
            width="300"
          />

          {googleAuth.isError && (
            <p className="text-sm text-red-500">
              Login failed. Please try again.
            </p>
          )}

          {googleAuth.isPending && (
            <p className="text-sm text-slate-500">Signing in...</p>
          )}
        </div>

        <p className="mt-8 text-center text-xs text-slate-400">
          Sign in with your Google account to get started
        </p>
      </div>
    </div>
  );
};
