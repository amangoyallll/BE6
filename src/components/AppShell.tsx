import { ReactNode } from 'react';
import {
  Home,
  Store,
  Zap,
  Users,
  User,
  ArrowLeft,
  Headset,
  Settings,
  Wallet,
  CarFront,
  ShieldCheck,
  LogOut,
} from 'lucide-react';
import { AppRoute, UserRole, formatINR } from '../lib/investmentEngine';

interface AppShellProps {
  route: AppRoute;
  role: UserRole;
  balance: number;
  onNavigate: (route: AppRoute) => void;
  onBack: () => void;
  onOpenSupport: () => void;
  onLogout: () => void;
  children: ReactNode;
}

const ROUTE_TITLES: Record<AppRoute, string> = {
  home: 'Mahindra BE6',
  plans: 'BE6 Fleet Plans',
  checkin: 'Daily Check-In',
  recharge: 'Recharge Wallet',
  withdraw: 'Withdraw Funds',
  team: 'Refer & Earn',
  profile: 'Investor Profile',
  settings: 'Settings',
  bank: 'Bank Details',
  admin: 'Admin Portal',
};

export function AppShell({
  route,
  role,
  balance,
  onNavigate,
  onBack,
  onOpenSupport,
  onLogout,
  children,
}: AppShellProps) {
  const isHome = route === 'home';
  const isAdmin = role === 'admin';
  const hideChromeHeader = route === 'settings' && !isAdmin;

  const desktopLinks: Array<{ label: string; route: AppRoute }> = [
    { label: 'Home', route: 'home' },
    { label: 'Plans', route: 'plans' },
    { label: 'Check-In', route: 'checkin' },
    { label: 'Team', route: 'team' },
    { label: 'Profile', route: 'profile' },
  ];

  // Admin Console dedicated clean shell (no investor mobile tabs)
  if (isAdmin) {
    return (
      <div className="min-h-screen flex flex-col overflow-x-hidden bg-[#F6F7FA] dark:bg-[#090D16] text-[#0F172A] dark:text-[#F1F5F9]">
        <header className="sticky top-0 z-30 h-14 bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-md border-b border-[#E6E8EE] dark:border-white/[0.08]">
          <div className="max-w-7xl mx-auto px-4 md:px-6 h-full flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-lg bg-[#0F172A] dark:bg-[#E08E45] text-white dark:text-[#090D16] flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </span>
              <span className="text-base font-extrabold tracking-tight whitespace-nowrap">
                Mahindra BE6 Admin
              </span>
            </div>

            <button
              type="button"
              onClick={onLogout}
              className="min-h-[40px] px-4 py-1.5 rounded-xl bg-[#F1F3F6] dark:bg-[#192234] hover:bg-rose-50 dark:hover:bg-rose-950/40 text-[#0F172A] dark:text-[#F1F5F9] hover:text-rose-600 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        </header>

        <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-6 py-5 md:py-7">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden bg-[#F6F7FA] dark:bg-[#090D16] text-[#0F172A] dark:text-[#F1F5F9]">
      {/* Desktop Top Bar Contract (3-Zone) */}
      <header className="hidden md:block sticky top-0 z-30 bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-md border-b border-[#E6E8EE] dark:border-white/[0.08]">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-8">
          <button
            type="button"
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2 text-lg font-extrabold tracking-tight text-[#0F172A] dark:text-white whitespace-nowrap shrink-0 cursor-pointer"
          >
            <CarFront className="w-5 h-5 text-[#B86B28] dark:text-[#E08E45]" />
            <span>Mahindra BE6</span>
          </button>

          <nav
            aria-label="Primary Navigation"
            className="flex items-center gap-6 text-sm font-semibold"
          >
            {desktopLinks.map((item) => {
              const active = route === item.route;
              return (
                <button
                  key={item.route}
                  type="button"
                  onClick={() => onNavigate(item.route)}
                  className={`py-1.5 border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? 'border-[#B86B28] text-[#0F172A] dark:border-[#E08E45] dark:text-white'
                      : 'border-transparent text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          <button
            type="button"
            onClick={() => onNavigate('recharge')}
            className="min-h-[40px] px-4 py-2 rounded-xl bg-[#0F172A] hover:bg-[#1E293B] dark:bg-[#E08E45] dark:hover:bg-[#EA9B54] text-white dark:text-[#090D16] text-xs font-bold flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 tabular-nums cursor-pointer"
          >
            <Wallet className="w-3.5 h-3.5 text-[#E08E45] dark:text-[#090D16]" />
            <span>{formatINR(balance, true)}</span>
          </button>
        </div>
      </header>

      {/* Mobile Compact Header (52px) */}
      {!hideChromeHeader && (
        <header className="md:hidden sticky top-0 z-30 h-[52px] bg-[#F6F7FA]/95 dark:bg-[#090D16]/95 backdrop-blur-md px-4 flex items-center justify-between border-b border-[#E6E8EE] dark:border-white/[0.08]">
          {isHome ? (
            <>
              <button
                type="button"
                onClick={() => onNavigate('home')}
                className="flex items-center gap-2 text-base font-extrabold tracking-tight text-[#0F172A] dark:text-white whitespace-nowrap shrink-0 cursor-pointer"
              >
                <CarFront className="w-5 h-5 text-[#B86B28] dark:text-[#E08E45]" />
                <span>Mahindra BE6</span>
              </button>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={onOpenSupport}
                  aria-label="Customer Support"
                  className="min-w-[44px] min-h-[44px] rounded-full bg-white dark:bg-[#111827] border border-[#E6E8EE] dark:border-white/[0.08] flex items-center justify-center text-[#B86B28] dark:text-[#E08E45] cursor-pointer"
                >
                  <Headset className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('settings')}
                  aria-label="Settings"
                  className="min-w-[44px] min-h-[44px] rounded-full bg-white dark:bg-[#111827] border border-[#E6E8EE] dark:border-white/[0.08] flex items-center justify-center text-[#0F172A] dark:text-white cursor-pointer"
                >
                  <Settings className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={onBack}
                aria-label="Go back"
                className="min-w-[44px] min-h-[44px] -ml-1 rounded-full bg-white dark:bg-[#111827] border border-[#E6E8EE] dark:border-white/[0.08] flex items-center justify-center text-[#0F172A] dark:text-white cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>

              <h1 className="text-base font-bold text-[#0F172A] dark:text-white truncate px-2">
                {ROUTE_TITLES[route]}
              </h1>

              <button
                type="button"
                onClick={() => onNavigate('recharge')}
                aria-label="Wallet Balance"
                className="min-h-[38px] px-2.5 py-1 rounded-xl bg-white dark:bg-[#111827] border border-[#E6E8EE] dark:border-white/[0.08] text-xs font-bold text-[#B86B28] dark:text-[#E08E45] flex items-center gap-1 tabular-nums whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Wallet className="w-3.5 h-3.5" />
                <span>{formatINR(balance, true)}</span>
              </button>
            </>
          )}
        </header>
      )}

      {/* Desktop Subpage Breadcrumb */}
      {!isHome && !hideChromeHeader && (
        <div className="hidden md:flex max-w-6xl w-full mx-auto px-6 pt-5 items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              aria-label="Go back"
              className="w-10 h-10 rounded-full bg-white dark:bg-[#111827] border border-[#E6E8EE] dark:border-white/[0.08] hover:border-[#B86B28]/50 flex items-center justify-center text-[#0F172A] dark:text-white cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h1 className="text-xl font-extrabold text-[#0F172A] dark:text-white tracking-tight">
              {ROUTE_TITLES[route]}
            </h1>
          </div>
          <button
            type="button"
            onClick={onOpenSupport}
            className="min-h-[40px] px-3.5 py-2 rounded-xl bg-white dark:bg-[#111827] border border-[#E6E8EE] dark:border-white/[0.08] text-xs font-semibold text-[#0F172A] dark:text-white hover:border-[#B86B28]/50 flex items-center gap-1.5 cursor-pointer"
          >
            <Headset className="w-4 h-4 text-[#B86B28] dark:text-[#E08E45]" />
            <span>Support</span>
          </button>
        </div>
      )}

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 md:px-6 pt-4 md:pt-5 pb-24 md:pb-10">
        {children}
      </main>

      {/* Mobile Fixed 5-Tab Thumb Navigation (60px, <15% sticky height) */}
      <nav
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 h-[60px] bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-md border-t border-[#E6E8EE] dark:border-white/[0.08] grid grid-cols-5 items-center px-2"
      >
        <button
          type="button"
          onClick={() => onNavigate('home')}
          className={`min-h-[44px] flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
            route === 'home'
              ? 'text-[#B86B28] dark:text-[#E08E45] font-bold'
              : 'text-[#64748B] dark:text-[#94A3B8] font-medium'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] leading-none">Home</span>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('plans')}
          className={`min-h-[44px] flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
            route === 'plans'
              ? 'text-[#B86B28] dark:text-[#E08E45] font-bold'
              : 'text-[#64748B] dark:text-[#94A3B8] font-medium'
          }`}
        >
          <Store className="w-5 h-5" />
          <span className="text-[10px] leading-none">Plans</span>
        </button>

        <div className="flex items-center justify-center">
          <button
            type="button"
            onClick={() => onNavigate('recharge')}
            aria-label="Quick Recharge"
            className="w-12 h-12 -mt-4 rounded-full bg-[#0F172A] dark:bg-[#E08E45] hover:opacity-90 text-white dark:text-[#090D16] shadow-md flex items-center justify-center ring-4 ring-[#F6F7FA] dark:ring-[#090D16] cursor-pointer"
          >
            <Zap className="w-5 h-5" />
          </button>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('team')}
          className={`min-h-[44px] flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
            route === 'team'
              ? 'text-[#B86B28] dark:text-[#E08E45] font-bold'
              : 'text-[#64748B] dark:text-[#94A3B8] font-medium'
          }`}
        >
          <Users className="w-5 h-5" />
          <span className="text-[10px] leading-none">Team</span>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('profile')}
          className={`min-h-[44px] flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
            route === 'profile' || route === 'settings' || route === 'bank'
              ? 'text-[#B86B28] dark:text-[#E08E45] font-bold'
              : 'text-[#64748B] dark:text-[#94A3B8] font-medium'
          }`}
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] leading-none">Profile</span>
        </button>
      </nav>
    </div>
  );
}
