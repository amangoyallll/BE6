import { useEffect, useState } from 'react';
import { Headset, CheckCircle2 } from 'lucide-react';
import {
  AppRoute,
  AppState,
  BankDetails,
  INITIAL_STATE,
  INVESTMENT_PLANS,
  InvestmentPlan,
  PaymentMethod,
  PlatformDatabase,
  Transaction,
  createInitialLiveFeed,
  generateRandomLiveTransaction,
} from './lib/investmentEngine';
import { AppShell } from './components/AppShell';
import { AuthView } from './components/AuthView';
import { HomeView } from './components/HomeView';
import { PlansView } from './components/PlansView';
import { CheckInView } from './components/CheckInView';
import { RechargeView } from './components/RechargeView';
import { WithdrawView } from './components/WithdrawView';
import { ReferEarnView } from './components/ReferEarnView';
import { ProfileView } from './components/ProfileView';
import { SettingsView } from './components/SettingsView';
import { BankDetailsView } from './components/BankDetailsView';
import { AdminView } from './components/AdminView';
import {
  AllTransactionsModal,
  PasswordModal,
  PlatformInfoModal,
  PurchaseConfirmModal,
  SupportModal,
} from './components/Modals';

const TOKEN_STORAGE_KEY = 'mahindra_be6_auth_token_v4';

function getStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

function setStoredToken(token: string | null): void {
  try {
    if (token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  } catch {
    // Ignore storage errors
  }
}

export default function App() {
  const [token, setToken] = useState<string | null>(() => getStoredToken());
  const [bootstrapping, setBootstrapping] = useState<boolean>(() => Boolean(getStoredToken()));
  const [state, setState] = useState<AppState>(INITIAL_STATE);
  const [adminDb, setAdminDb] = useState<PlatformDatabase | null>(null);
  const [routeStack, setRouteStack] = useState<AppRoute[]>(['home']);
  const currentRoute = routeStack[routeStack.length - 1];

  const [liveFeed, setLiveFeed] = useState<Transaction[]>(() =>
    createInitialLiveFeed([]),
  );

  const [selectedPlan, setSelectedPlan] = useState<InvestmentPlan | null>(null);
  const [platformInfoOpen, setPlatformInfoOpen] = useState(false);
  const [supportModal, setSupportModal] = useState<'support' | 'channel' | null>(
    null,
  );
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [allTxOpen, setAllTxOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 3200);
  };

  // Sync Tailwind dark class from user preference (default light showroom)
  useEffect(() => {
    const root = document.documentElement;
    if (state.darkMode && state.auth.isAuthenticated && state.auth.role === 'investor') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [state.darkMode, state.auth.isAuthenticated, state.auth.role]);

  // Restore session on mount ONLY if this browser has an explicit stored token
  useEffect(() => {
    const existingToken = getStoredToken();
    if (!existingToken) {
      setBootstrapping(false);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/session', {
          headers: { Authorization: `Bearer ${existingToken}` },
        });
        const data = (await res.json()) as {
          ok?: boolean;
          role?: 'investor' | 'admin';
          appState?: AppState;
          database?: PlatformDatabase;
        };
        if (cancelled) return;
        if (!res.ok || !data.ok) {
          setStoredToken(null);
          setToken(null);
          setState(INITIAL_STATE);
          setAdminDb(null);
          return;
        }
        if (data.role === 'admin' && data.database) {
          setAdminDb(data.database);
          setState({
            ...INITIAL_STATE,
            auth: {
              isAuthenticated: true,
              role: 'admin',
              userName: 'Fleet Administrator',
              phone: 'ADMIN',
            },
          });
          setRouteStack(['admin']);
        } else if (data.role === 'investor' && data.appState) {
          setState(data.appState);
          setLiveFeed(createInitialLiveFeed(data.appState.transactions));
          setRouteStack(['home']);
        }
      } catch {
        if (!cancelled) {
          setStoredToken(null);
          setToken(null);
        }
      } finally {
        if (!cancelled) setBootstrapping(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // Live realistic activity stream for signed-in investors
  useEffect(() => {
    if (!state.auth.isAuthenticated || state.auth.role !== 'investor') return;
    let tick = 1;
    const timer = window.setInterval(() => {
      const nextTx = generateRandomLiveTransaction(
        tick++,
        new Date().toISOString(),
      );
      setLiveFeed((prev) => [nextTx, ...prev].slice(0, 25));
    }, 2400);
    return () => window.clearInterval(timer);
  }, [state.auth.isAuthenticated, state.auth.role]);

  const navigateTo = (next: AppRoute) => {
    // Strictly prevent regular investors from navigating to admin console
    if (next === 'admin' && state.auth.role !== 'admin') return;
    setRouteStack((prev) => {
      if (prev[prev.length - 1] === next) return prev;
      return [...prev, next];
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goBack = () => {
    setRouteStack((prev) => (prev.length > 1 ? prev.slice(0, -1) : ['home']));
  };

  const handleLogin = async (
    identifier: string,
    password: string,
  ): Promise<{ ok: boolean; message: string }> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });
      const data = (await res.json()) as {
        ok: boolean;
        message?: string;
        token?: string;
        role?: 'investor' | 'admin';
        appState?: AppState;
        database?: PlatformDatabase;
      };
      if (!res.ok || !data.ok || !data.token) {
        return { ok: false, message: data.message ?? 'Sign in failed.' };
      }
      setStoredToken(data.token);
      setToken(data.token);

      if (data.role === 'admin' && data.database) {
        setAdminDb(data.database);
        setState({
          ...INITIAL_STATE,
          auth: {
            isAuthenticated: true,
            role: 'admin',
            userName: 'Fleet Administrator',
            phone: 'ADMIN',
          },
        });
        setRouteStack(['admin']);
        showToast('Signed in to Mahindra BE6 Admin Console.');
        return { ok: true, message: 'Signed in as Fleet Admin.' };
      }

      if (data.appState) {
        setAdminDb(null);
        setState(data.appState);
        setLiveFeed(createInitialLiveFeed(data.appState.transactions));
        setRouteStack(['home']);
        showToast(`Welcome back, ${data.appState.auth.userName}.`);
        return { ok: true, message: 'Signed in.' };
      }
      return { ok: false, message: 'Unexpected server response.' };
    } catch {
      return { ok: false, message: 'Network error. Please retry.' };
    }
  };

  const handleRegister = async (
    name: string,
    phone: string,
    password: string,
    inviteCode?: string,
  ): Promise<{ ok: boolean; message: string }> => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, password, inviteCode }),
      });
      const data = (await res.json()) as {
        ok: boolean;
        message?: string;
        token?: string;
        appState?: AppState;
      };
      if (!res.ok || !data.ok || !data.token || !data.appState) {
        return { ok: false, message: data.message ?? 'Registration failed.' };
      }
      setStoredToken(data.token);
      setToken(data.token);
      setAdminDb(null);
      setState(data.appState);
      setLiveFeed(createInitialLiveFeed(data.appState.transactions));
      setRouteStack(['home']);
      showToast('Account created! Welcome bonus credited.');
      return { ok: true, message: 'Account created.' };
    } catch {
      return { ok: false, message: 'Network error. Please retry.' };
    }
  };

  const handleLogout = async () => {
    const activeToken = token ?? getStoredToken();
    if (activeToken) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${activeToken}` },
        });
      } catch {
        // Ignore network failure on logout
      }
    }
    setStoredToken(null);
    setToken(null);
    setAdminDb(null);
    setState(INITIAL_STATE);
    setRouteStack(['home']);
  };

  const invokeUserAction = async (
    type: string,
    payload?: Record<string, unknown>,
  ): Promise<{ ok: boolean; message: string }> => {
    const activeToken = token ?? getStoredToken();
    if (!activeToken) {
      return { ok: false, message: 'Session expired. Please sign in again.' };
    }
    try {
      const prevTxId = state.transactions[0]?.id;
      const res = await fetch('/api/user/action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${activeToken}`,
        },
        body: JSON.stringify({ type, payload }),
      });
      const data = (await res.json()) as {
        ok: boolean;
        message?: string;
        appState?: AppState;
      };
      if (res.status === 401) {
        await handleLogout();
        return { ok: false, message: 'Session expired. Please sign in again.' };
      }
      if (!res.ok || !data.ok) {
        return { ok: false, message: data.message ?? 'Action failed.' };
      }
      if (data.appState) {
        setState(data.appState);
        const latestTx = data.appState.transactions[0];
        if (latestTx && latestTx.id !== prevTxId) {
          setLiveFeed((prev) => [latestTx, ...prev].slice(0, 25));
        }
      }
      return { ok: true, message: data.message ?? 'Done.' };
    } catch {
      return { ok: false, message: 'Network error. Please retry.' };
    }
  };

  const handleAdminAction = async (
    type: string,
    payload?: Record<string, unknown>,
  ): Promise<{ ok: boolean; message: string }> => {
    const activeToken = token ?? getStoredToken();
    if (!activeToken) {
      return { ok: false, message: 'Admin session expired.' };
    }
    try {
      const res = await fetch('/api/admin/action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${activeToken}`,
        },
        body: JSON.stringify({ type, payload }),
      });
      const data = (await res.json()) as {
        ok: boolean;
        message?: string;
        database?: PlatformDatabase;
      };
      if (res.status === 401 || res.status === 403) {
        await handleLogout();
        return { ok: false, message: 'Admin authorization required.' };
      }
      if (!res.ok || !data.ok) {
        return { ok: false, message: data.message ?? 'Admin action failed.' };
      }
      if (data.database) {
        setAdminDb(data.database);
      }
      return { ok: true, message: data.message ?? 'Saved.' };
    } catch {
      return { ok: false, message: 'Network error. Please retry.' };
    }
  };

  if (bootstrapping) {
    return (
      <div className="min-h-screen bg-[#F6F7FA] text-[#0F172A] flex items-center justify-center p-6">
        <div className="text-sm font-bold tracking-tight">
          Loading Mahindra BE6 Showroom...
        </div>
      </div>
    );
  }

  if (!state.auth.isAuthenticated) {
    return <AuthView onLogin={handleLogin} onRegister={handleRegister} />;
  }

  if (state.auth.role === 'admin' && adminDb) {
    return (
      <AppShell
        route="admin"
        role="admin"
        balance={0}
        onNavigate={navigateTo}
        onBack={goBack}
        onOpenSupport={() => setSupportModal('support')}
        onLogout={handleLogout}
      >
        <AdminView
          database={adminDb}
          onAdminAction={handleAdminAction}
          onLogout={handleLogout}
        />
      </AppShell>
    );
  }

  return (
    <AppShell
      route={currentRoute}
      role="investor"
      balance={state.balance}
      onNavigate={navigateTo}
      onBack={goBack}
      onOpenSupport={() => setSupportModal('support')}
      onLogout={handleLogout}
    >
      {currentRoute === 'home' && (
        <HomeView
          state={state}
          liveTransactions={liveFeed}
          onNavigate={navigateTo}
          onSelectPlan={setSelectedPlan}
          onOpenPlatformInfo={() => setPlatformInfoOpen(true)}
          onOpenAllTransactions={() => setAllTxOpen(true)}
        />
      )}

      {currentRoute === 'plans' && (
        <PlansView
          plans={state.plansCatalog ?? INVESTMENT_PLANS}
          onSelectPlan={setSelectedPlan}
        />
      )}

      {currentRoute === 'checkin' && (
        <CheckInView
          state={state}
          onClaimCheckIn={(code) => invokeUserAction('daily_checkin', { code })}
          onOpenChannel={() => setSupportModal('channel')}
        />
      )}

      {currentRoute === 'recharge' && (
        <RechargeView
          state={state}
          onSubmitUtr={(amount, method: PaymentMethod, utrNumber) =>
            invokeUserAction('submit_utr', { amount, method, utrNumber })
          }
        />
      )}

      {currentRoute === 'withdraw' && (
        <WithdrawView
          state={state}
          onSubmitWithdrawalClaim={(
            withdrawalAmount,
            method: PaymentMethod,
            utrNumber,
          ) =>
            invokeUserAction('submit_withdrawal', {
              withdrawalAmount,
              method,
              utrNumber,
            })
          }
          onEditBank={() => navigateTo('bank')}
        />
      )}

      {currentRoute === 'team' && <ReferEarnView state={state} />}

      {currentRoute === 'profile' && (
        <ProfileView
          state={state}
          onNavigate={navigateTo}
          onClaimYield={(activePlanId) =>
            invokeUserAction('claim_yield', { activePlanId })
          }
          onOpenAllTransactions={() => setAllTxOpen(true)}
          onLogout={handleLogout}
        />
      )}

      {currentRoute === 'settings' && (
        <SettingsView
          state={state}
          onBack={goBack}
          onNavigate={navigateTo}
          onToggleDarkMode={() => void invokeUserAction('toggle_theme')}
          onOpenPasswordModal={() => setPasswordModalOpen(true)}
          onOpenSupportModal={() => setSupportModal('support')}
          onOpenChannelModal={() => setSupportModal('channel')}
          onLogout={handleLogout}
        />
      )}

      {currentRoute === 'bank' && (
        <BankDetailsView
          state={state}
          onSaveBank={(details: BankDetails) =>
            invokeUserAction('save_bank', { details })
          }
        />
      )}

      {/* Desktop Floating Support FAB */}
      <button
        type="button"
        onClick={() => setSupportModal('support')}
        aria-label="Open Customer Support"
        className="hidden md:flex fixed bottom-6 right-6 z-30 w-12 h-12 rounded-full bg-[#0F172A] dark:bg-[#E08E45] text-[#E08E45] dark:text-[#090D16] shadow-lg items-center justify-center transition-transform hover:scale-105 cursor-pointer"
      >
        <Headset className="w-5 h-5" />
      </button>

      {toast && (
        <div
          role="status"
          className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl bg-[#0F172A] dark:bg-[#E08E45] text-white dark:text-[#090D16] text-xs font-bold shadow-lg flex items-center gap-2 whitespace-nowrap max-w-[92vw] truncate"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-[#090D16] shrink-0" />
          <span className="truncate">{toast}</span>
        </div>
      )}

      <PlatformInfoModal
        open={platformInfoOpen}
        onClose={() => setPlatformInfoOpen(false)}
        onJoinChannel={() => {
          setPlatformInfoOpen(false);
          setSupportModal('channel');
        }}
      />

      <PurchaseConfirmModal
        plan={selectedPlan}
        balance={state.balance}
        onClose={() => setSelectedPlan(null)}
        onConfirm={async (plan) => {
          const res = await invokeUserAction('purchase_plan', {
            planId: plan.id,
          });
          if (res.ok) showToast(res.message);
          return res;
        }}
        onGoToRecharge={() => navigateTo('recharge')}
      />

      <SupportModal
        open={supportModal !== null}
        mode={supportModal ?? 'support'}
        checkInCode={state.settings?.dailyCheckInCode}
        onClose={() => setSupportModal(null)}
      />

      <PasswordModal
        open={passwordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
        onUpdatePassword={(currentPwd, newPwd) =>
          invokeUserAction('update_password', { currentPwd, newPwd })
        }
      />

      <AllTransactionsModal
        open={allTxOpen}
        transactions={liveFeed}
        onClose={() => setAllTxOpen(false)}
      />
    </AppShell>
  );
}
