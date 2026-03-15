import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/auth-store';
import { useOnboardingStore } from '../store/onboarding-store';

type Props = { children: React.ReactNode };

export const AuthGuard = ({ children }: Props) => {
  const { isAuthenticated } = useAuthStore();
  const { isOnboarded } = useOnboardingStore();
  const location = useLocation();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isOnboarded && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }
  return <>{children}</>;
};
