import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { InstallPrompt } from './InstallPrompt';

export const Layout = () => {
  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-900">
      <Navbar />
      <main className="mx-auto max-w-2xl px-5 py-6 pb-24 sm:pb-8">
        <Outlet />
      </main>
      <InstallPrompt />
    </div>
  );
};
