import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { InstallPrompt } from './InstallPrompt';

export const Layout = () => {
  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-900">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-stone-800 focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white focus:shadow-lg"
      >
        본문으로 건너뛰기
      </a>
      <Navbar />
      <main id="main-content" className="mx-auto max-w-2xl px-5 py-6 pb-24 sm:pb-8">
        <Outlet />
      </main>
      <InstallPrompt />
    </div>
  );
};
