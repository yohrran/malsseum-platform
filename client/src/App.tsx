import { Routes, Route } from 'react-router-dom';
import { AuthGuard } from './shared/AuthGuard';
import { Layout } from './shared/Layout';
import { ErrorBoundary } from './shared/ErrorBoundary';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { CustomPlanPage } from './pages/CustomPlanPage';
import { CustomPlanDetailPage } from './pages/CustomPlanDetailPage';
import { ReadingPage } from './pages/ReadingPage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { ProfilePage } from './pages/ProfilePage';

export const App = () => {
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          element={
            <AuthGuard>
              <Layout />
            </AuthGuard>
          }
        >
          <Route path="/" element={<DashboardPage />} />
          <Route path="/reading" element={<ReadingPage />} />
          <Route path="/custom-plan" element={<CustomPlanPage />} />
          <Route path="/custom-plan/:id" element={<CustomPlanDetailPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Routes>
    </ErrorBoundary>
  );
};

