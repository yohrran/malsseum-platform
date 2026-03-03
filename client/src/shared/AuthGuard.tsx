import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth-store';

type Props = { children: React.ReactNode };

export const AuthGuard = ({ children }: Props) => {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
};
