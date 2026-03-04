import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/auth-store';
import { useLangStore } from '../store/lang-store';
import { ROUTES } from '../lib/constants';
import { useT } from '../lib/i18n';

export const Navbar = () => {
  const { user, logout } = useAuthStore();
  const { lang, setLang } = useLangStore();
  const { pathname } = useLocation();
  const t = useT();

  const NAV_LINKS = [
    { to: ROUTES.HOME, label: t.dashboard },
    { to: ROUTES.READING, label: t.readingPlan },
    { to: ROUTES.CUSTOM_PLAN, label: t.customPlan },
    { to: ROUTES.LEADERBOARD, label: t.leaderboard },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-6">
          <Link to="/" className="text-xl font-bold text-blue-700">
            말씀
          </Link>
          <div className="hidden items-center gap-4 sm:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`text-sm transition-colors ${
                  pathname === link.to
                    ? 'font-semibold text-blue-700'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setLang(lang === 'ko' ? 'en' : 'ko')}
            className="rounded-lg px-2 py-1 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
            aria-label="Toggle language"
          >
            {lang === 'ko' ? 'EN' : '한'}
          </button>

          {user && (
            <>
              <Link to="/profile" className="flex items-center gap-2">
                {user.picture ? (
                  <img
                    src={user.picture}
                    alt={user.displayName}
                    className="h-8 w-8 rounded-full"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-600">
                    {user.displayName?.charAt(0)}
                  </div>
                )}
                <span className="hidden text-sm font-medium text-slate-700 hover:text-blue-700 sm:inline">
                  {user.displayName}
                </span>
              </Link>
              <button
                onClick={logout}
                className="rounded-lg px-3 py-1.5 text-sm text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
              >
                {t.logout}
              </button>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto border-t border-slate-100 px-4 py-2 sm:hidden">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className={`whitespace-nowrap rounded-full px-3 py-1 text-xs transition-colors ${
              pathname === link.to
                ? 'bg-blue-700 font-semibold text-white'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
};
