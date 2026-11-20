import { useEffect, useMemo, useState, FormEvent } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  LogOut,
  QrCode,
  Smartphone,
  UserCog,
  Wallet,
  CarFront,
  Plus,
  Trash2,
  Ban,
  Check,
  BanknoteArrowUp,
  Search,
  Users,
  Sliders,
  Coins,
  UserPlus,
  ReceiptText,
} from 'lucide-react';
import {
  AccountStatus,
  PlatformDatabase,
  PlatformSettings,
  UserAccount,
  formatINR,
  getPlanStatus,
  getRemainingDurationDays,
} from '../lib/investmentEngine';

interface AdminViewProps {
  database: PlatformDatabase;
  onAdminAction: (
    type: string,
    payload?: Record<string, unknown>,
  ) => Promise<{ ok: boolean; message: string }>;
  onLogout: () => void;
}

type AdminSection = 'users' | 'recharges' | 'withdrawals' | 'ledger' | 'platform';

export function AdminView({
  database,
  onAdminAction,
  onLogout,
}: AdminViewProps) {
  const [section, setSection] = useState<AdminSection>('users');
  const [reqFilter, setReqFilter] = useState<
    'all' | 'pending' | 'approved' | 'rejected'
  >('all');
  const [feedback, setFeedback] = useState<{
    ok: boolean;
    text: string;
  } | null>(null);
  const [busy, setBusy] = useState(false);

  // User selection & creation
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string>(
    database.users[0]?.userId ?? '',
  );
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newPassword, setNewPassword] = useState('123456');
  const [newBalance, setNewBalance] = useState('500');

  const selectedUser: UserAccount | undefined = useMemo(
    () =>
      database.users.find((u) => u.userId === selectedUserId) ??
      database.users[0],
    [database.users, selectedUserId],
  );

  // Selected user editable fields
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [holderName, setHolderName] = useState('');
  const [acctNumber, setAcctNumber] = useState('');
  const [ifsc, setIfsc] = useState('');

  // Balance Adjuster State
  const [adjAmount, setAdjAmount] = useState('500');
  const [adjMode, setAdjMode] = useState<'credit' | 'debit' | 'set'>('credit');
  const [adjNote, setAdjNote] = useState('Admin Balance Adjustment');

  // Grant Plan State
  const [grantPlanId, setGrantPlanId] = useState(
    database.plans[0]?.id ?? 'normal-popular',
  );
  const [planEdits, setPlanEdits] = useState<
    Record<string, { daysClaimed: string; durationDays: string }>
  >({});

  // Ledger Scope
  const [ledgerScope, setLedgerScope] = useState<'all' | 'selected'>('all');

  // Platform Settings Editor State
  const [settingsForm, setSettingsForm] = useState<PlatformSettings>(
    database.settings,
  );
  const [catalogEdits, setCatalogEdits] = useState<
    Record<
      string,
      { investmentAmount: string; dailyIncome: string; durationDays: string }
    >
  >({});

  useEffect(() => {
    if (!selectedUser) return;
    setUserName(selectedUser.userName);
    setPassword(selectedUser.passwordHash);
    setReferralCode(selectedUser.referralCode);
    setHolderName(selectedUser.bankDetails?.accountHolderName ?? '');
    setAcctNumber(selectedUser.bankDetails?.accountNumber ?? '');
    setIfsc(selectedUser.bankDetails?.ifscCode ?? '');
    const edits: Record<string, { daysClaimed: string; durationDays: string }> =
      {};
    for (const ap of selectedUser.activePlans) {
      edits[ap.id] = {
        daysClaimed: String(ap.daysClaimed),
        durationDays: String(ap.durationDays),
      };
    }
    setPlanEdits(edits);
  }, [selectedUser]);

  useEffect(() => {
    setSettingsForm(database.settings);
    const cEdits: Record<
      string,
      { investmentAmount: string; dailyIncome: string; durationDays: string }
    > = {};
    for (const p of database.plans) {
      cEdits[p.id] = {
        investmentAmount: String(p.investmentAmount),
        dailyIncome: String(p.dailyIncome),
        durationDays: String(p.durationDays),
      };
    }
    setCatalogEdits(cEdits);
  }, [database.settings, database.plans]);

  const notify = (res: { ok: boolean; message: string }) => {
    setFeedback({ ok: res.ok, text: res.message });
    window.setTimeout(() => setFeedback(null), 4000);
  };

  const runAction = async (type: string, payload?: Record<string, unknown>) => {
    setBusy(true);
    try {
      const res = await onAdminAction(type, payload);
      notify(res);
      return res;
    } finally {
      setBusy(false);
    }
  };

  const filteredUsers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return database.users;
    return database.users.filter(
      (u) =>
        u.userName.toLowerCase().includes(q) ||
        u.userId.toLowerCase().includes(q) ||
        u.referralCode.toLowerCase().includes(q) ||
        (u.bankDetails?.accountNumber ?? '').toLowerCase().includes(q),
    );
  }, [database.users, searchQuery]);

  const userNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const u of database.users) {
      map.set(u.userId, u.userName);
    }
    return map;
  }, [database.users]);

  const totalPlatformBalance = useMemo(
    () => database.users.reduce((sum, u) => sum + u.balance, 0),
    [database.users],
  );
  const pendingRecharges = database.rechargeRequests.filter(
    (r) => r.status === 'pending',
  ).length;
  const pendingWithdrawals = database.withdrawalRequests.filter(
    (w) => w.status === 'pending',
  ).length;

  const visibleRecharges =
    reqFilter === 'all'
      ? database.rechargeRequests
      : database.rechargeRequests.filter((r) => r.status === reqFilter);

  const visibleWithdrawals =
    reqFilter === 'all'
      ? database.withdrawalRequests
      : database.withdrawalRequests.filter((w) => w.status === reqFilter);

  const combinedLedger = useMemo(() => {
    if (ledgerScope === 'selected' && selectedUser) {
      return selectedUser.transactions.map((t) => ({
        ...t,
        fullUserName: selectedUser.userName,
        fullUserId: selectedUser.userId,
      }));
    }
    const all = database.users.flatMap((u) =>
      u.transactions.map((t) => ({
        ...t,
        fullUserName: u.userName,
        fullUserId: u.userId,
      })),
    );
    return all.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );
  }, [database.users, ledgerScope, selectedUser]);

  const handleCreateUser = async (e: FormEvent) => {
    e.preventDefault();
    const res = await runAction('create_user', {
      name: newName,
      phone: newPhone,
      password: newPassword,
      initialBalance: Number(newBalance),
    });
    if (res.ok) {
      setSelectedUserId(newPhone.trim());
      setNewName('');
      setNewPhone('');
      setNewPassword('123456');
      setShowCreateUser(false);
    }
  };

  const handleSaveUserDetails = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    await runAction('update_user', {
      userId: selectedUser.userId,
      userName,
      passwordHash: password,
      referralCode,
      bankDetails:
        holderName.trim() || acctNumber.trim() || ifsc.trim()
          ? {
              accountHolderName: holderName,
              accountNumber: acctNumber,
              ifscCode: ifsc,
            }
          : undefined,
    });
  };

  const handleToggleStatus = async () => {
    if (!selectedUser) return;
    const nextStatus: AccountStatus =
      selectedUser.accountStatus === 'active' ? 'suspended' : 'active';
    await runAction('update_user', {
      userId: selectedUser.userId,
      accountStatus: nextStatus,
    });
  };

  const handleApplyBalance = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    await runAction('adjust_balance', {
      userId: selectedUser.userId,
      amount: Number(adjAmount),
      mode: adjMode,
      note: adjNote,
    });
  };

  const handleSaveSettings = async (e: FormEvent) => {
    e.preventDefault();
    await runAction('update_settings', { settings: settingsForm });
  };

  return (
    <div className="space-y-5">
      {/* Admin Control Banner */}
      <section className="rounded-2xl bg-[#0F172A] dark:bg-[#111827] border border-[#0F172A] dark:border-white/[0.08] text-white p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <span className="w-11 h-11 rounded-xl bg-[#E08E45] text-[#090D16] flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </span>
          <div>
            <h1 className="text-lg font-extrabold tracking-tight">
              Mahindra BE6 Fleet Admin Console
            </h1>
            <p className="text-xs text-slate-300">
              Complete unmasked investor directory, wallet &amp; plan control,
              UTR verification, withdrawal release, and platform settings.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onLogout}
          className="min-h-[44px] px-4 py-2 rounded-xl bg-white/10 hover:bg-rose-600/80 text-xs font-bold flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Log Out</span>
        </button>
      </section>

      {/* Platform KPI Strip */}
      <section className="bg-white dark:bg-[#111827] rounded-2xl border border-[#E6E8EE] dark:border-white/[0.08] grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#E6E8EE] dark:divide-white/[0.08]">
        <div className="p-4">
          <p className="text-[11px] font-medium text-[#64748B] dark:text-[#94A3B8]">
            Registered Users
          </p>
          <p className="text-xl font-extrabold text-[#0F172A] dark:text-white tabular-nums mt-0.5">
            {database.users.length}
          </p>
        </div>
        <div className="p-4">
          <p className="text-[11px] font-medium text-[#64748B] dark:text-[#94A3B8]">
            Total User Wallets
          </p>
          <p className="text-xl font-extrabold text-[#B86B28] dark:text-[#E08E45] tabular-nums mt-0.5">
            {formatINR(totalPlatformBalance)}
          </p>
        </div>
        <div className="p-4">
          <p className="text-[11px] font-medium text-[#64748B] dark:text-[#94A3B8]">
            Pending UTR Recharges
          </p>
          <p className="text-xl font-extrabold text-amber-600 dark:text-amber-400 tabular-nums mt-0.5">
            {pendingRecharges}
          </p>
        </div>
        <div className="p-4">
          <p className="text-[11px] font-medium text-[#64748B] dark:text-[#94A3B8]">
            Pending Withdraw Claims
          </p>
          <p className="text-xl font-extrabold text-[#0F172A] dark:text-white tabular-nums mt-0.5">
            {pendingWithdrawals}
          </p>
        </div>
      </section>

      {feedback && (
        <div
          role="status"
          className={`px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
            feedback.ok
              ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
              : 'bg-rose-50 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Admin Navigation Tabs */}
      <div
        role="tablist"
        aria-label="Admin Management Sections"
        className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 p-1 rounded-2xl bg-white dark:bg-[#111827] border border-[#E6E8EE] dark:border-white/[0.08]"
      >
        {(
          [
            { id: 'users', label: `Users (${database.users.length})`, icon: Users },
            { id: 'recharges', label: `UTRs (${pendingRecharges})`, icon: QrCode },
            {
              id: 'withdrawals',
              label: `Claims (${pendingWithdrawals})`,
              icon: BanknoteArrowUp,
            },
            { id: 'ledger', label: 'Ledger', icon: ReceiptText },
            { id: 'platform', label: 'Platform', icon: Sliders },
          ] as const
        ).map((tab) => {
          const Icon = tab.icon;
          const active = section === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setSection(tab.id)}
              className={`min-h-[44px] px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
                active
                  ? 'bg-[#0F172A] dark:bg-[#E08E45] text-white dark:text-[#090D16]'
                  : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* SECTION 1: ALL USERS DIRECTORY & COMPLETE UNMASKED DETAILS / CONTROL */}
      {section === 'users' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          {/* Left Directory Panel */}
          <aside className="lg:col-span-4 bg-white dark:bg-[#111827] rounded-2xl border border-[#E6E8EE] dark:border-white/[0.08] p-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-bold text-[#0F172A] dark:text-white">
                All Investors ({database.users.length})
              </h2>
              <button
                type="button"
                onClick={() => setShowCreateUser((v) => !v)}
                className="min-h-[36px] px-3 rounded-lg bg-[#0F172A] dark:bg-[#E08E45] text-white dark:text-[#090D16] text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>{showCreateUser ? 'Close' : 'Add User'}</span>
              </button>
            </div>

            {showCreateUser && (
              <form
                onSubmit={handleCreateUser}
                className="p-3 rounded-xl bg-[#F6F7FA] dark:bg-[#192234] border border-[#E6E8EE] dark:border-white/[0.08] space-y-2.5"
              >
                <p className="text-xs font-bold text-[#0F172A] dark:text-white">
                  Create New Investor
                </p>
                <input
                  type="text"
                  placeholder="Full Name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full min-h-[40px] px-3 rounded-lg border border-[#E6E8EE] dark:border-white/[0.1] bg-white dark:bg-[#090D16] text-xs"
                />
                <input
                  type="tel"
                  placeholder="10-Digit Mobile Number"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full min-h-[40px] px-3 rounded-lg border border-[#E6E8EE] dark:border-white/[0.1] bg-white dark:bg-[#090D16] text-xs font-mono-tabular"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full min-h-[40px] px-3 rounded-lg border border-[#E6E8EE] dark:border-white/[0.1] bg-white dark:bg-[#090D16] text-xs font-mono-tabular"
                  />
                  <input
                    type="number"
                    placeholder="Initial ₹"
                    value={newBalance}
                    onChange={(e) => setNewBalance(e.target.value)}
                    className="w-full min-h-[40px] px-3 rounded-lg border border-[#E6E8EE] dark:border-white/[0.1] bg-white dark:bg-[#090D16] text-xs tabular-nums"
                  />
                </div>
                <button
                  type="submit"
                  disabled={busy}
                  className="w-full min-h-[40px] rounded-lg bg-[#B86B28] text-white text-xs font-bold cursor-pointer"
                >
                  Create Investor Account
                </button>
              </form>
            )}

            <div className="relative">
              <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                aria-label="Search investors"
                placeholder="Search name, full phone, code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full min-h-[42px] pl-9 pr-3 rounded-xl border border-[#E6E8EE] dark:border-white/[0.1] bg-[#F6F7FA] dark:bg-[#090D16] text-xs"
              />
            </div>

            <div className="divide-y divide-[#E6E8EE] dark:divide-white/[0.06] max-h-[440px] overflow-y-auto">
              {filteredUsers.map((u) => {
                const isSelected = selectedUser?.userId === u.userId;
                return (
                  <button
                    key={u.userId}
                    type="button"
                    onClick={() => setSelectedUserId(u.userId)}
                    className={`w-full py-3 px-2.5 text-left rounded-xl transition-colors flex items-center justify-between gap-2 cursor-pointer ${
                      isSelected
                        ? 'bg-[#0F172A] text-white dark:bg-[#E08E45] dark:text-[#090D16]'
                        : 'hover:bg-[#F6F7FA] dark:hover:bg-[#192234]'
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-bold truncate">{u.userName}</p>
                      <p
                        className={`text-[11px] font-mono-tabular ${
                          isSelected
                            ? 'text-slate-300 dark:text-[#090D16]/80'
                            : 'text-[#64748B] dark:text-[#94A3B8]'
                        }`}
                      >
                        {u.userId} · {u.activePlans.length} plans
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-extrabold tabular-nums">
                        {formatINR(u.balance)}
                      </p>
                      <p
                        className={`text-[10px] font-bold uppercase ${
                          u.accountStatus === 'active'
                            ? isSelected
                              ? 'text-emerald-300 dark:text-[#090D16]'
                              : 'text-emerald-600 dark:text-emerald-400'
                            : 'text-rose-500'
                        }`}
                      >
                        {u.accountStatus}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>

          {/* Right Unmasked Detail & Control Panel */}
          {selectedUser && (
            <div className="lg:col-span-8 space-y-4">
              {/* Complete Unmasked Account Telemetry & Edit Form */}
              <section className="bg-white dark:bg-[#111827] rounded-2xl border border-[#E6E8EE] dark:border-white/[0.08] p-4 md:p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <UserCog className="w-4 h-4 text-[#B86B28] dark:text-[#E08E45]" />
                    <h2 className="text-base font-bold text-[#0F172A] dark:text-white">
                      {selectedUser.userName} · Complete Unmasked Details
                    </h2>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={handleToggleStatus}
                      className={`min-h-[38px] px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                        selectedUser.accountStatus === 'active'
                          ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                          : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                      }`}
                    >
                      {selectedUser.accountStatus === 'active' ? (
                        <>
                          <Ban className="w-3.5 h-3.5" />
                          <span>Suspend</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Activate</span>
                        </>
                      )}
                    </button>

                    {database.users.length > 1 && (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          runAction('delete_user', {
                            userId: selectedUser.userId,
                          })
                        }
                        aria-label={`Delete user ${selectedUser.userName}`}
                        className="min-h-[38px] px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Unmasked Readout Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-[#F6F7FA] dark:bg-[#192234] text-xs">
                  <div>
                    <p className="text-[#64748B] dark:text-[#94A3B8]">
                      Full Phone / User ID
                    </p>
                    <p className="font-bold font-mono-tabular text-[#0F172A] dark:text-white">
                      {selectedUser.userId}
                    </p>
                  </div>
                  <div>
                    <p className="text-[#64748B] dark:text-[#94A3B8]">
                      Login Password
                    </p>
                    <p className="font-bold font-mono-tabular text-[#0F172A] dark:text-white">
                      {selectedUser.passwordHash}
                    </p>
                  </div>
                  <div>
                    <p className="text-[#64748B] dark:text-[#94A3B8]">
                      Wallet Balance
                    </p>
                    <p className="font-extrabold tabular-nums text-[#B86B28] dark:text-[#E08E45]">
                      {formatINR(selectedUser.balance, true)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[#64748B] dark:text-[#94A3B8]">
                      Referral Code
                    </p>
                    <p className="font-bold font-mono-tabular text-[#0F172A] dark:text-white">
                      {selectedUser.referralCode}
                    </p>
                  </div>
                  <div>
                    <p className="text-[#64748B] dark:text-[#94A3B8]">
                      Referred By
                    </p>
                    <p className="font-semibold font-mono-tabular text-[#0F172A] dark:text-white">
                      {selectedUser.referredByCode ?? 'Direct Signup'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[#64748B] dark:text-[#94A3B8]">
                      Last Check-In
                    </p>
                    <p className="font-semibold text-[#0F172A] dark:text-white">
                      {selectedUser.lastCheckInDate ?? 'Not claimed'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[#64748B] dark:text-[#94A3B8]">
                      Registered On
                    </p>
                    <p className="font-semibold text-[#0F172A] dark:text-white">
                      {new Date(selectedUser.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-[#64748B] dark:text-[#94A3B8]">
                      Last Login
                    </p>
                    <p className="font-semibold text-[#0F172A] dark:text-white">
                      {selectedUser.lastLoginAt
                        ? new Date(selectedUser.lastLoginAt).toLocaleString()
                        : 'Never'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[#64748B] dark:text-[#94A3B8]">
                      Full Bank A/C &amp; IFSC
                    </p>
                    <p className="font-bold font-mono-tabular text-[#0F172A] dark:text-white break-all">
                      {selectedUser.bankDetails
                        ? `${selectedUser.bankDetails.accountNumber} · ${selectedUser.bankDetails.ifscCode}`
                        : 'Not linked'}
                    </p>
                  </div>
                </div>

                {/* Edit User Profile & Bank Details */}
                <form onSubmit={handleSaveUserDetails} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label
                        htmlFor="adm-username"
                        className="block text-xs font-bold text-[#64748B] dark:text-[#94A3B8] mb-1"
                      >
                        Full Investor Name
                      </label>
                      <input
                        id="adm-username"
                        type="text"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        className="w-full min-h-[42px] px-3 rounded-xl border border-[#E6E8EE] dark:border-white/[0.1] bg-white dark:bg-[#090D16] text-xs font-semibold"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="adm-password"
                        className="block text-xs font-bold text-[#64748B] dark:text-[#94A3B8] mb-1"
                      >
                        Account Password
                      </label>
                      <input
                        id="adm-password"
                        type="text"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full min-h-[42px] px-3 rounded-xl border border-[#E6E8EE] dark:border-white/[0.1] bg-white dark:bg-[#090D16] text-xs font-mono-tabular"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="adm-refcode"
                        className="block text-xs font-bold text-[#64748B] dark:text-[#94A3B8] mb-1"
                      >
                        Referral Code
                      </label>
                      <input
                        id="adm-refcode"
                        type="text"
                        value={referralCode}
                        onChange={(e) =>
                          setReferralCode(e.target.value.toUpperCase())
                        }
                        className="w-full min-h-[42px] px-3 rounded-xl border border-[#E6E8EE] dark:border-white/[0.1] bg-white dark:bg-[#090D16] text-xs font-mono-tabular uppercase"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label
                        htmlFor="adm-bank-holder"
                        className="block text-xs font-bold text-[#64748B] dark:text-[#94A3B8] mb-1"
                      >
                        Bank Holder Name
                      </label>
                      <input
                        id="adm-bank-holder"
                        type="text"
                        value={holderName}
                        onChange={(e) => setHolderName(e.target.value)}
                        className="w-full min-h-[42px] px-3 rounded-xl border border-[#E6E8EE] dark:border-white/[0.1] bg-white dark:bg-[#090D16] text-xs"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="adm-bank-acct"
                        className="block text-xs font-bold text-[#64748B] dark:text-[#94A3B8] mb-1"
                      >
                        Full Bank Account Number
                      </label>
                      <input
                        id="adm-bank-acct"
                        type="text"
                        value={acctNumber}
                        onChange={(e) => setAcctNumber(e.target.value)}
                        className="w-full min-h-[42px] px-3 rounded-xl border border-[#E6E8EE] dark:border-white/[0.1] bg-white dark:bg-[#090D16] text-xs font-mono-tabular"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="adm-bank-ifsc"
                        className="block text-xs font-bold text-[#64748B] dark:text-[#94A3B8] mb-1"
                      >
                        IFSC Code
                      </label>
                      <input
                        id="adm-bank-ifsc"
                        type="text"
                        value={ifsc}
                        onChange={(e) => setIfsc(e.target.value.toUpperCase())}
                        className="w-full min-h-[42px] px-3 rounded-xl border border-[#E6E8EE] dark:border-white/[0.1] bg-white dark:bg-[#090D16] text-xs font-mono-tabular uppercase"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={busy}
                    className="w-full min-h-[44px] rounded-xl bg-[#0F172A] hover:bg-[#1E293B] dark:bg-[#E08E45] dark:hover:bg-[#EA9B54] text-white dark:text-[#090D16] text-xs font-bold cursor-pointer"
                  >
                    Save Profile, Password &amp; Bank Details
                  </button>
                </form>
              </section>

              {/* Wallet Control + Fleet Plans Control */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <section className="bg-white dark:bg-[#111827] rounded-2xl border border-[#E6E8EE] dark:border-white/[0.08] p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-[#B86B28] dark:text-[#E08E45]" />
                    <h3 className="text-sm font-bold text-[#0F172A] dark:text-white">
                      Direct Wallet Control
                    </h3>
                  </div>

                  <form onSubmit={handleApplyBalance} className="space-y-3">
                    <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-[#F1F3F6] dark:bg-[#192234]">
                      {(['credit', 'debit', 'set'] as const).map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setAdjMode(m)}
                          className={`min-h-[36px] rounded-lg text-xs font-bold capitalize cursor-pointer ${
                            adjMode === m
                              ? 'bg-[#0F172A] dark:bg-[#E08E45] text-white dark:text-[#090D16]'
                              : 'text-[#64748B] dark:text-[#94A3B8]'
                          }`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>

                    <input
                      type="number"
                      min={0}
                      step={1}
                      aria-label="Adjustment Amount"
                      value={adjAmount}
                      onChange={(e) => setAdjAmount(e.target.value)}
                      className="w-full min-h-[42px] px-3 rounded-xl border border-[#E6E8EE] dark:border-white/[0.1] bg-white dark:bg-[#090D16] text-sm font-bold tabular-nums"
                    />
                    <input
                      type="text"
                      aria-label="Adjustment Reason"
                      value={adjNote}
                      onChange={(e) => setAdjNote(e.target.value)}
                      placeholder="Audit note"
                      className="w-full min-h-[42px] px-3 rounded-xl border border-[#E6E8EE] dark:border-white/[0.1] bg-white dark:bg-[#090D16] text-xs"
                    />
                    <button
                      type="submit"
                      disabled={busy}
                      className="w-full min-h-[42px] rounded-xl bg-[#0F172A] dark:bg-[#E08E45] text-white dark:text-[#090D16] text-xs font-bold cursor-pointer"
                    >
                      Apply Wallet Update
                    </button>
                  </form>
                </section>

                {/* Referral Members (Unmasked) */}
                <section className="bg-white dark:bg-[#111827] rounded-2xl border border-[#E6E8EE] dark:border-white/[0.08] p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#B86B28] dark:text-[#E08E45]" />
                    <h3 className="text-sm font-bold text-[#0F172A] dark:text-white">
                      Unmasked Referral Members (
                      {selectedUser.referralMembers.length})
                    </h3>
                  </div>

                  {selectedUser.referralMembers.length === 0 ? (
                    <p className="text-xs text-[#64748B] dark:text-[#94A3B8] py-4 text-center">
                      No invited team members for this investor.
                    </p>
                  ) : (
                    <div className="divide-y divide-[#E6E8EE] dark:divide-white/[0.06] max-h-52 overflow-y-auto">
                      {selectedUser.referralMembers.map((m) => (
                        <div
                          key={m.id}
                          className="py-2 flex items-center justify-between gap-2 text-xs"
                        >
                          <div className="min-w-0">
                            <p className="font-bold text-[#0F172A] dark:text-white truncate">
                              {m.userName ??
                                userNameById.get(m.userId ?? m.maskedPhone) ??
                                'Investor'}
                            </p>
                            <p className="font-mono-tabular text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                              {m.userId ?? m.maskedPhone} · L{m.level} ·
                              Recharge {formatINR(m.rechargeAmount)}
                            </p>
                          </div>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400 tabular-nums shrink-0">
                            +{formatINR(m.commissionEarned)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </div>

              {/* Fleet Plans & Duration Control */}
              <section className="bg-white dark:bg-[#111827] rounded-2xl border border-[#E6E8EE] dark:border-white/[0.08] p-4 md:p-5 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <CarFront className="w-4 h-4 text-[#B86B28] dark:text-[#E08E45]" />
                    <h3 className="text-sm font-bold text-[#0F172A] dark:text-white">
                      Fleet Plans &amp; Duration Control (
                      {selectedUser.activePlans.length})
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      aria-label="Select BE6 Plan to Grant"
                      value={grantPlanId}
                      onChange={(e) => setGrantPlanId(e.target.value)}
                      className="min-h-[38px] px-3 rounded-xl border border-[#E6E8EE] dark:border-white/[0.1] bg-white dark:bg-[#090D16] text-xs font-semibold"
                    >
                      {database.plans.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({formatINR(p.investmentAmount)})
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() =>
                        runAction('grant_plan', {
                          userId: selectedUser.userId,
                          planId: grantPlanId,
                        })
                      }
                      className="min-h-[38px] px-3.5 rounded-xl bg-[#0F172A] dark:bg-[#E08E45] text-white dark:text-[#090D16] text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Grant Plan</span>
                    </button>
                  </div>
                </div>

                {selectedUser.activePlans.length === 0 ? (
                  <p className="text-xs text-[#64748B] dark:text-[#94A3B8] py-4 text-center">
                    No plans assigned to this investor.
                  </p>
                ) : (
                  <div className="divide-y divide-[#E6E8EE] dark:divide-white/[0.06]">
                    {selectedUser.activePlans.map((ap) => {
                      const remaining = getRemainingDurationDays(ap);
                      const status = getPlanStatus(ap);
                      const edit = planEdits[ap.id] ?? {
                        daysClaimed: String(ap.daysClaimed),
                        durationDays: String(ap.durationDays),
                      };
                      return (
                        <div
                          key={ap.id}
                          className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                        >
                          <div className="min-w-0">
                            <p className="font-bold text-[#0F172A] dark:text-white">
                              {ap.name} ({ap.modelName}) ·{' '}
                              {formatINR(ap.investmentAmount)}
                            </p>
                            <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] tabular-nums">
                              {formatINR(ap.dailyIncome)}/day ·{' '}
                              <span
                                className={
                                  status === 'active'
                                    ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                                    : 'font-semibold'
                                }
                              >
                                {remaining} of {ap.durationDays} days remaining
                              </span>
                            </p>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 shrink-0">
                            <label className="flex items-center gap-1 text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                              <span>Claimed</span>
                              <input
                                type="number"
                                min={0}
                                max={30}
                                value={edit.daysClaimed}
                                onChange={(e) =>
                                  setPlanEdits((prev) => ({
                                    ...prev,
                                    [ap.id]: {
                                      ...edit,
                                      daysClaimed: e.target.value,
                                    },
                                  }))
                                }
                                className="w-14 min-h-[34px] px-2 rounded-lg border border-[#E6E8EE] dark:border-white/[0.1] bg-[#F6F7FA] dark:bg-[#090D16] text-xs font-bold tabular-nums"
                              />
                            </label>
                            <label className="flex items-center gap-1 text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                              <span>Days</span>
                              <input
                                type="number"
                                min={7}
                                max={30}
                                value={edit.durationDays}
                                onChange={(e) =>
                                  setPlanEdits((prev) => ({
                                    ...prev,
                                    [ap.id]: {
                                      ...edit,
                                      durationDays: e.target.value,
                                    },
                                  }))
                                }
                                className="w-14 min-h-[34px] px-2 rounded-lg border border-[#E6E8EE] dark:border-white/[0.1] bg-[#F6F7FA] dark:bg-[#090D16] text-xs font-bold tabular-nums"
                              />
                            </label>
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() =>
                                runAction('update_active_plan', {
                                  userId: selectedUser.userId,
                                  activePlanId: ap.id,
                                  daysClaimed: Number(edit.daysClaimed),
                                  durationDays: Number(edit.durationDays),
                                })
                              }
                              className="min-h-[34px] px-2.5 rounded-lg bg-[#F1F3F6] dark:bg-[#192234] text-[#0F172A] dark:text-white font-bold cursor-pointer"
                            >
                              Save
                            </button>
                            {status === 'active' && (
                              <button
                                type="button"
                                disabled={busy}
                                onClick={() =>
                                  runAction('force_daily_yield', {
                                    userId: selectedUser.userId,
                                    activePlanId: ap.id,
                                  })
                                }
                                className="min-h-[34px] px-2.5 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 font-bold flex items-center gap-1 cursor-pointer"
                              >
                                <Coins className="w-3 h-3" />
                                <span>+1d Yield</span>
                              </button>
                            )}
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() =>
                                runAction('remove_plan', {
                                  userId: selectedUser.userId,
                                  activePlanId: ap.id,
                                })
                              }
                              aria-label={`Remove ${ap.name}`}
                              className="min-w-[34px] min-h-[34px] rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            </div>
          )}
        </div>
      )}

      {/* SECTION 2: UTR RECHARGE VERIFICATION (UNMASKED) */}
      {section === 'recharges' && (
        <div className="space-y-3">
          <div
            role="tablist"
            aria-label="Filter UTR requests"
            className="flex items-center gap-1.5 p-1 rounded-xl bg-white dark:bg-[#111827] border border-[#E6E8EE] dark:border-white/[0.08] max-w-md"
          >
            {(['all', 'pending', 'approved', 'rejected'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={reqFilter === tab}
                onClick={() => setReqFilter(tab)}
                className={`flex-1 min-h-[38px] px-3 py-1 rounded-lg text-xs font-bold capitalize transition-colors cursor-pointer ${
                  reqFilter === tab
                    ? 'bg-[#0F172A] dark:bg-[#E08E45] text-white dark:text-[#090D16]'
                    : 'text-[#64748B] dark:text-[#94A3B8]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <section className="bg-white dark:bg-[#111827] rounded-2xl border border-[#E6E8EE] dark:border-white/[0.08] divide-y divide-[#E6E8EE] dark:divide-white/[0.06]">
            {visibleRecharges.length === 0 ? (
              <div className="p-8 text-center text-sm text-[#64748B] dark:text-[#94A3B8]">
                No {reqFilter === 'all' ? '' : reqFilter} UTR recharge requests.
              </div>
            ) : (
              visibleRecharges.map((req) => {
                const fullName =
                  req.userName ?? userNameById.get(req.userId) ?? 'Investor';
                return (
                  <div
                    key={req.id}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <span className="w-10 h-10 rounded-xl bg-[#F6F7FA] dark:bg-[#192234] text-[#B86B28] dark:text-[#E08E45] flex items-center justify-center shrink-0">
                        {req.method === 'QR_CODE' ? (
                          <QrCode className="w-5 h-5" />
                        ) : (
                          <Smartphone className="w-5 h-5" />
                        )}
                      </span>
                      <div className="min-w-0 space-y-0.5">
                        <p className="text-sm font-extrabold text-[#0F172A] dark:text-white tabular-nums">
                          {formatINR(req.amount)}{' '}
                          <span className="text-xs font-semibold text-[#64748B] dark:text-[#94A3B8]">
                            · {fullName} ({req.userId}) ·{' '}
                            {req.method === 'QR_CODE' ? 'QR Code' : 'UPI ID'}
                          </span>
                        </p>
                        <p className="text-xs font-mono-tabular font-semibold text-[#B86B28] dark:text-[#E08E45]">
                          UTR: {req.utrNumber}
                        </p>
                        <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                          Submitted {new Date(req.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {req.status === 'pending' ? (
                        <>
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() =>
                              runAction('review_recharge', {
                                requestId: req.id,
                                decision: 'approved',
                              })
                            }
                            className="min-h-[42px] px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Verify &amp; Approve</span>
                          </button>
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() =>
                              runAction('review_recharge', {
                                requestId: req.id,
                                decision: 'rejected',
                              })
                            }
                            className="min-h-[42px] px-3.5 py-2 rounded-xl border border-rose-300 dark:border-rose-900 text-rose-700 dark:text-rose-400 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                        </>
                      ) : (
                        <span
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 ${
                            req.status === 'approved'
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                              : 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300'
                          }`}
                        >
                          {req.status === 'approved' ? (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          ) : (
                            <Clock className="w-3.5 h-3.5" />
                          )}
                          <span className="capitalize">{req.status}</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </section>
        </div>
      )}

      {/* SECTION 3: WITHDRAWAL CLAIMS (UNMASKED) */}
      {section === 'withdrawals' && (
        <section className="bg-white dark:bg-[#111827] rounded-2xl border border-[#E6E8EE] dark:border-white/[0.08] divide-y divide-[#E6E8EE] dark:divide-white/[0.06]">
          {visibleWithdrawals.length === 0 ? (
            <div className="p-8 text-center text-sm text-[#64748B] dark:text-[#94A3B8]">
              No withdrawal claims submitted yet.
            </div>
          ) : (
            visibleWithdrawals.map((wd) => {
              const fullName =
                wd.userName ?? userNameById.get(wd.userId) ?? 'Investor';
              return (
                <div
                  key={wd.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <span className="w-10 h-10 rounded-xl bg-[#F6F7FA] dark:bg-[#192234] text-[#B86B28] dark:text-[#E08E45] flex items-center justify-center shrink-0">
                      <BanknoteArrowUp className="w-5 h-5" />
                    </span>
                    <div className="min-w-0 space-y-0.5">
                      <p className="text-sm font-extrabold text-[#0F172A] dark:text-white tabular-nums">
                        Withdraw {formatINR(wd.withdrawalAmount)} ·{' '}
                        {wd.claimFeeAmount > 0
                          ? `Principal Match ${formatINR(wd.claimFeeAmount)}`
                          : 'Direct IMPS (₹0 Match)'}
                      </p>
                      <p className="text-xs font-semibold text-[#64748B] dark:text-[#94A3B8]">
                        {fullName} ({wd.userId}) ·{' '}
                        {wd.claimFeeAmount > 0 ? (
                          <>
                            UTR:{' '}
                            <span className="font-mono-tabular text-[#B86B28] dark:text-[#E08E45]">
                              {wd.utrNumber}
                            </span>
                          </>
                        ) : (
                          <span className="text-emerald-700 dark:text-emerald-400">
                            Within 3× Principal Limit
                          </span>
                        )}
                      </p>
                      <p className="text-xs font-mono-tabular text-[#0F172A] dark:text-[#E2E8F0]">
                        Bank: {wd.bankDetails.accountHolderName} ·{' '}
                        {wd.bankDetails.accountNumber} ·{' '}
                        {wd.bankDetails.ifscCode}
                      </p>
                      <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                        Requested {new Date(wd.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {wd.status === 'pending' ? (
                      <>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() =>
                            runAction('review_withdrawal', {
                              requestId: wd.id,
                              decision: 'approved',
                            })
                          }
                          className="min-h-[42px] px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Release Payout</span>
                        </button>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() =>
                            runAction('review_withdrawal', {
                              requestId: wd.id,
                              decision: 'rejected',
                            })
                          }
                          className="min-h-[42px] px-3.5 py-2 rounded-xl border border-rose-300 dark:border-rose-900 text-rose-700 dark:text-rose-400 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Reject &amp; Refund</span>
                        </button>
                      </>
                    ) : (
                      <span
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 ${
                          wd.status === 'approved'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                            : 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300'
                        }`}
                      >
                        <span className="capitalize">{wd.status}</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </section>
      )}

      {/* SECTION 4: GLOBAL & PER-USER UNMASKED LEDGER */}
      {section === 'ledger' && (
        <section className="bg-white dark:bg-[#111827] rounded-2xl border border-[#E6E8EE] dark:border-white/[0.08] p-4 md:p-5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-bold text-[#0F172A] dark:text-white">
              Unmasked Transaction Ledger ({combinedLedger.length})
            </h2>
            <div className="flex items-center gap-1 p-1 rounded-xl bg-[#F1F3F6] dark:bg-[#192234]">
              <button
                type="button"
                onClick={() => setLedgerScope('all')}
                className={`min-h-[34px] px-3 rounded-lg text-xs font-bold cursor-pointer ${
                  ledgerScope === 'all'
                    ? 'bg-white dark:bg-[#0F172A] text-[#0F172A] dark:text-white'
                    : 'text-[#64748B] dark:text-[#94A3B8]'
                }`}
              >
                All Users
              </button>
              {selectedUser && (
                <button
                  type="button"
                  onClick={() => setLedgerScope('selected')}
                  className={`min-h-[34px] px-3 rounded-lg text-xs font-bold cursor-pointer ${
                    ledgerScope === 'selected'
                      ? 'bg-white dark:bg-[#0F172A] text-[#0F172A] dark:text-white'
                      : 'text-[#64748B] dark:text-[#94A3B8]'
                  }`}
                >
                  {selectedUser.userName}
                </button>
              )}
            </div>
          </div>

          <div className="divide-y divide-[#E6E8EE] dark:divide-white/[0.06]">
            {combinedLedger.map((tx) => (
              <div
                key={`${tx.fullUserId}-${tx.id}`}
                className="py-2.5 flex items-center justify-between gap-3 text-xs"
              >
                <div className="min-w-0">
                  <p className="font-bold text-[#0F172A] dark:text-white truncate">
                    {tx.description}
                  </p>
                  <p className="text-[#64748B] dark:text-[#94A3B8] font-mono-tabular">
                    {tx.fullUserName} ({tx.fullUserId}) ·{' '}
                    {new Date(tx.timestamp).toLocaleString()}
                  </p>
                </div>
                <span
                  className={`font-bold tabular-nums shrink-0 ${
                    tx.isCredit
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-[#B86B28] dark:text-[#E08E45]'
                  }`}
                >
                  {tx.isCredit ? '+' : '-'}
                  {formatINR(tx.amount)}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* SECTION 5: PLATFORM SETTINGS & PLAN CATALOG EDITOR */}
      {section === 'platform' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          <section className="lg:col-span-5 bg-white dark:bg-[#111827] rounded-2xl border border-[#E6E8EE] dark:border-white/[0.08] p-4 md:p-5 space-y-4">
            <h2 className="text-sm font-bold text-[#0F172A] dark:text-white">
              Global Platform &amp; Payment Settings
            </h2>

            <form onSubmit={handleSaveSettings} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#64748B] dark:text-[#94A3B8] mb-1">
                  Merchant UPI ID
                </label>
                <input
                  type="text"
                  value={settingsForm.merchantUpiId}
                  onChange={(e) =>
                    setSettingsForm((s) => ({
                      ...s,
                      merchantUpiId: e.target.value,
                    }))
                  }
                  className="w-full min-h-[42px] px-3 rounded-xl border border-[#E6E8EE] dark:border-white/[0.1] bg-white dark:bg-[#090D16] font-mono-tabular"
                />
              </div>
              <div>
                <label className="block font-bold text-[#64748B] dark:text-[#94A3B8] mb-1">
                  Merchant Payee Name
                </label>
                <input
                  type="text"
                  value={settingsForm.merchantName}
                  onChange={(e) =>
                    setSettingsForm((s) => ({
                      ...s,
                      merchantName: e.target.value,
                    }))
                  }
                  className="w-full min-h-[42px] px-3 rounded-xl border border-[#E6E8EE] dark:border-white/[0.1] bg-white dark:bg-[#090D16]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#64748B] dark:text-[#94A3B8] mb-1">
                    Daily Check-In Code
                  </label>
                  <input
                    type="text"
                    value={settingsForm.dailyCheckInCode}
                    onChange={(e) =>
                      setSettingsForm((s) => ({
                        ...s,
                        dailyCheckInCode: e.target.value.toUpperCase(),
                      }))
                    }
                    className="w-full min-h-[42px] px-3 rounded-xl border border-[#E6E8EE] dark:border-white/[0.1] bg-white dark:bg-[#090D16] font-mono-tabular uppercase"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#64748B] dark:text-[#94A3B8] mb-1">
                    Check-In Reward (₹)
                  </label>
                  <input
                    type="number"
                    value={settingsForm.checkInRewardAmount}
                    onChange={(e) =>
                      setSettingsForm((s) => ({
                        ...s,
                        checkInRewardAmount: Number(e.target.value),
                      }))
                    }
                    className="w-full min-h-[42px] px-3 rounded-xl border border-[#E6E8EE] dark:border-white/[0.1] bg-white dark:bg-[#090D16] tabular-nums"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#64748B] dark:text-[#94A3B8] mb-1">
                    Sign-Up Bonus (₹)
                  </label>
                  <input
                    type="number"
                    value={settingsForm.signupBonusAmount}
                    onChange={(e) =>
                      setSettingsForm((s) => ({
                        ...s,
                        signupBonusAmount: Number(e.target.value),
                      }))
                    }
                    className="w-full min-h-[42px] px-3 rounded-xl border border-[#E6E8EE] dark:border-white/[0.1] bg-white dark:bg-[#090D16] tabular-nums"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#64748B] dark:text-[#94A3B8] mb-1">
                    Max Withdrawal (₹)
                  </label>
                  <input
                    type="number"
                    value={settingsForm.maxWithdrawalAmount}
                    onChange={(e) =>
                      setSettingsForm((s) => ({
                        ...s,
                        maxWithdrawalAmount: Number(e.target.value),
                      }))
                    }
                    className="w-full min-h-[42px] px-3 rounded-xl border border-[#E6E8EE] dark:border-white/[0.1] bg-white dark:bg-[#090D16] tabular-nums"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#64748B] dark:text-[#94A3B8] mb-1">
                  Admin Login Password
                </label>
                <input
                  type="text"
                  value={settingsForm.adminPassword}
                  onChange={(e) =>
                    setSettingsForm((s) => ({
                      ...s,
                      adminPassword: e.target.value,
                    }))
                  }
                  className="w-full min-h-[42px] px-3 rounded-xl border border-[#E6E8EE] dark:border-white/[0.1] bg-white dark:bg-[#090D16] font-mono-tabular"
                />
              </div>

              <button
                type="submit"
                disabled={busy}
                className="w-full min-h-[44px] rounded-xl bg-[#0F172A] hover:bg-[#1E293B] dark:bg-[#E08E45] dark:hover:bg-[#EA9B54] text-white dark:text-[#090D16] font-bold cursor-pointer"
              >
                Save Global Settings
              </button>
            </form>
          </section>

          <section className="lg:col-span-7 bg-white dark:bg-[#111827] rounded-2xl border border-[#E6E8EE] dark:border-white/[0.08] p-4 md:p-5 space-y-3">
            <div>
              <h2 className="text-sm font-bold text-[#0F172A] dark:text-white">
                Mahindra BE6 Fleet Plan Catalog ({database.plans.length})
              </h2>
              <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                Enforced bounds: Investment &lt; ₹1,500 · Daily Income &le; 25% ·
                Duration 7–30 days · Total &le; ₹5,000.
              </p>
            </div>

            <div className="divide-y divide-[#E6E8EE] dark:divide-white/[0.06]">
              {database.plans.map((p) => {
                const edit = catalogEdits[p.id] ?? {
                  investmentAmount: String(p.investmentAmount),
                  dailyIncome: String(p.dailyIncome),
                  durationDays: String(p.durationDays),
                };
                const inv = Number(edit.investmentAmount);
                const daily = Number(edit.dailyIncome);
                const dur = Number(edit.durationDays);
                const total =
                  Number.isFinite(daily) && Number.isFinite(dur)
                    ? daily * dur
                    : 0;
                const pct =
                  inv > 0 && Number.isFinite(daily)
                    ? Math.round((daily / inv) * 100)
                    : 0;

                return (
                  <div
                    key={p.id}
                    className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="min-w-0">
                      <p className="font-bold text-[#0F172A] dark:text-white">
                        {p.name} ·{' '}
                        <span className="uppercase text-[10px] text-[#B86B28] dark:text-[#E08E45]">
                          {p.category}
                        </span>
                      </p>
                      <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] tabular-nums">
                        {pct}%/day · Total {formatINR(total)}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <input
                        type="number"
                        aria-label={`${p.name} investment`}
                        value={edit.investmentAmount}
                        onChange={(e) =>
                          setCatalogEdits((prev) => ({
                            ...prev,
                            [p.id]: {
                              ...edit,
                              investmentAmount: e.target.value,
                            },
                          }))
                        }
                        className="w-20 min-h-[36px] px-2 rounded-lg border border-[#E6E8EE] dark:border-white/[0.1] bg-[#F6F7FA] dark:bg-[#090D16] tabular-nums font-semibold"
                      />
                      <input
                        type="number"
                        aria-label={`${p.name} daily income`}
                        value={edit.dailyIncome}
                        onChange={(e) =>
                          setCatalogEdits((prev) => ({
                            ...prev,
                            [p.id]: { ...edit, dailyIncome: e.target.value },
                          }))
                        }
                        className="w-18 min-h-[36px] px-2 rounded-lg border border-[#E6E8EE] dark:border-white/[0.1] bg-[#F6F7FA] dark:bg-[#090D16] tabular-nums font-semibold"
                      />
                      <input
                        type="number"
                        aria-label={`${p.name} days`}
                        value={edit.durationDays}
                        onChange={(e) =>
                          setCatalogEdits((prev) => ({
                            ...prev,
                            [p.id]: { ...edit, durationDays: e.target.value },
                          }))
                        }
                        className="w-16 min-h-[36px] px-2 rounded-lg border border-[#E6E8EE] dark:border-white/[0.1] bg-[#F6F7FA] dark:bg-[#090D16] tabular-nums font-semibold"
                      />
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          runAction('update_plan_config', {
                            planId: p.id,
                            investmentAmount: inv,
                            dailyIncome: daily,
                            durationDays: dur,
                          })
                        }
                        className="min-h-[36px] px-3 rounded-lg bg-[#0F172A] dark:bg-[#E08E45] text-white dark:text-[#090D16] font-bold cursor-pointer"
                      >
                        Update
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
