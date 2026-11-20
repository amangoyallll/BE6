import { useState } from 'react';
import {
  Wallet,
  BanknoteArrowUp,
  Landmark,
  Settings,
  CarFront,
  CheckCircle2,
  Coins,
  ChevronRight,
  LogOut,
  History,
  Clock,
} from 'lucide-react';
import {
  AppRoute,
  AppState,
  formatINR,
  getActiveOngoingPlans,
  getPlanStatus,
  getRemainingDurationDays,
  getTodayDateString,
  maskAccountNumber,
} from '../lib/investmentEngine';
import { VehicleImage } from './VehicleImage';

interface ProfileViewProps {
  state: AppState;
  onNavigate: (route: AppRoute) => void;
  onClaimYield: (activePlanId: string) => Promise<{ ok: boolean; message: string }>;
  onOpenAllTransactions: () => void;
  onLogout: () => void;
}

export function ProfileView({
  state,
  onNavigate,
  onClaimYield,
  onOpenAllTransactions,
  onLogout,
}: ProfileViewProps) {
  const [yieldFeedback, setYieldFeedback] = useState<string | null>(null);
  const [historyFilter, setHistoryFilter] = useState<'all' | 'active' | 'completed'>('all');
  const todayStr = getTodayDateString();

  const ongoingPlans = getActiveOngoingPlans(state.activePlans);
  const totalDailyYield = ongoingPlans.reduce((sum, p) => sum + p.dailyIncome, 0);

  const historyPlans = state.activePlans.filter((p) => {
    if (historyFilter === 'all') return true;
    return getPlanStatus(p) === historyFilter;
  });

  const handleClaim = async (planId: string) => {
    const res = await onClaimYield(planId);
    setYieldFeedback(res.message);
    window.setTimeout(() => setYieldFeedback(null), 3500);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Clean Investor Summary Card */}
      <section className="rounded-2xl bg-[#0F172A] dark:bg-[#111827] text-white p-5 md:p-6 border border-[#0F172A] dark:border-white/[0.08]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-12 h-12 rounded-full bg-[#E08E45] text-[#090D16] font-extrabold text-sm flex items-center justify-center shrink-0">
              BE6
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-white truncate">
                {state.auth.userName}
              </p>
              <p className="text-xs text-slate-300 font-mono-tabular truncate">
                ID: {state.userId}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onNavigate('settings')}
              aria-label="Open Settings"
              className="min-w-[44px] min-h-[44px] rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
            >
              <Settings className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={onLogout}
              aria-label="Log Out"
              className="min-h-[44px] px-3.5 rounded-xl bg-white/10 hover:bg-rose-600/80 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-5 pt-4 border-t border-white/15">
          <div>
            <p className="text-[11px] text-slate-300">Wallet Balance</p>
            <p className="text-base sm:text-lg font-extrabold tabular-nums">
              {formatINR(state.balance)}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-slate-300">Active Vehicles</p>
            <p className="text-base sm:text-lg font-extrabold tabular-nums">
              {ongoingPlans.length}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-slate-300">Daily Yield</p>
            <p className="text-base sm:text-lg font-extrabold tabular-nums text-[#E08E45]">
              {formatINR(totalDailyYield)}
            </p>
          </div>
        </div>
      </section>

      {/* Clean Wallet & Account Shortcuts (Investor only, no Admin entry) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          type="button"
          onClick={() => onNavigate('recharge')}
          className="min-h-[48px] p-3.5 rounded-2xl bg-white dark:bg-[#111827] border border-[#E6E8EE] dark:border-white/[0.08] hover:border-[#B86B28]/50 flex items-center gap-2.5 text-left transition-colors cursor-pointer"
        >
          <Wallet className="w-4 h-4 text-[#B86B28] dark:text-[#E08E45] shrink-0" />
          <span className="text-xs font-bold text-[#0F172A] dark:text-white whitespace-nowrap">
            Recharge
          </span>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('withdraw')}
          className="min-h-[48px] p-3.5 rounded-2xl bg-white dark:bg-[#111827] border border-[#E6E8EE] dark:border-white/[0.08] hover:border-[#B86B28]/50 flex items-center gap-2.5 text-left transition-colors cursor-pointer"
        >
          <BanknoteArrowUp className="w-4 h-4 text-[#B86B28] dark:text-[#E08E45] shrink-0" />
          <span className="text-xs font-bold text-[#0F172A] dark:text-white whitespace-nowrap">
            Withdraw
          </span>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('bank')}
          className="min-h-[48px] p-3.5 rounded-2xl bg-white dark:bg-[#111827] border border-[#E6E8EE] dark:border-white/[0.08] hover:border-[#B86B28]/50 flex items-center gap-2.5 text-left transition-colors cursor-pointer"
        >
          <Landmark className="w-4 h-4 text-[#B86B28] dark:text-[#E08E45] shrink-0" />
          <span className="text-xs font-bold text-[#0F172A] dark:text-white whitespace-nowrap">
            Bank Card
          </span>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('settings')}
          className="min-h-[48px] p-3.5 rounded-2xl bg-white dark:bg-[#111827] border border-[#E6E8EE] dark:border-white/[0.08] hover:border-[#B86B28]/50 flex items-center gap-2.5 text-left transition-colors cursor-pointer"
        >
          <Settings className="w-4 h-4 text-[#B86B28] dark:text-[#E08E45] shrink-0" />
          <span className="text-xs font-bold text-[#0F172A] dark:text-white whitespace-nowrap">
            Settings
          </span>
        </button>
      </div>

      {yieldFeedback && (
        <div
          role="status"
          className="px-4 py-3 rounded-xl bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{yieldFeedback}</span>
        </div>
      )}

      {/* Active Fleet Daily Yield Claim */}
      <section className="bg-white dark:bg-[#111827] rounded-2xl border border-[#E6E8EE] dark:border-white/[0.08] p-4 md:p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CarFront className="w-4 h-4 text-[#B86B28] dark:text-[#E08E45]" />
            <h2 className="text-base font-bold text-[#0F172A] dark:text-white">
              Active Mahindra BE6 Fleet
            </h2>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('plans')}
            className="min-h-[40px] px-2 text-xs font-semibold text-[#B86B28] dark:text-[#E08E45] hover:underline cursor-pointer"
          >
            + Add Plan
          </button>
        </div>

        {ongoingPlans.length === 0 ? (
          <div className="py-5 text-center space-y-2">
            <p className="text-sm text-[#64748B] dark:text-[#94A3B8]">
              No ongoing fleet plans right now.
            </p>
            <button
              type="button"
              onClick={() => onNavigate('plans')}
              className="min-h-[44px] px-5 py-2 rounded-xl bg-[#0F172A] dark:bg-[#E08E45] text-white dark:text-[#090D16] text-xs font-bold cursor-pointer"
            >
              Browse Plans
            </button>
          </div>
        ) : (
          <div className="divide-y divide-[#E6E8EE] dark:divide-white/[0.06]">
            {ongoingPlans.map((ap) => {
              const claimedToday = ap.lastClaimDate === todayStr;
              const remaining = getRemainingDurationDays(ap);
              return (
                <div
                  key={ap.id}
                  className="py-3 first:pt-1 last:pb-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <VehicleImage
                      src={ap.imageUrl}
                      alt={ap.modelName}
                      className="w-12 h-12 rounded-xl object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-[#0F172A] dark:text-white truncate">
                        {ap.name} · {ap.modelName}
                      </p>
                      <p className="text-xs text-[#64748B] dark:text-[#94A3B8] tabular-nums">
                        Daily {formatINR(ap.dailyIncome)} · {remaining} days left
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={claimedToday}
                    onClick={() => handleClaim(ap.id)}
                    className="min-h-[44px] px-4 py-2 rounded-xl bg-[#0F172A] hover:bg-[#1E293B] dark:bg-[#E08E45] dark:hover:bg-[#EA9B54] disabled:bg-[#F1F3F6] dark:disabled:bg-white/[0.06] disabled:text-[#64748B] dark:disabled:text-[#94A3B8] text-white dark:text-[#090D16] text-xs font-bold flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer disabled:cursor-not-allowed"
                  >
                    <Coins className="w-3.5 h-3.5" />
                    <span>
                      {claimedToday
                        ? 'Yield Claimed'
                        : `Claim ${formatINR(ap.dailyIncome)}`}
                    </span>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* NEW: Investment History (Current & Past Mahindra BE6 Plans + Remaining Duration) */}
      <section
        aria-label="Investment History"
        className="bg-white dark:bg-[#111827] rounded-2xl border border-[#E6E8EE] dark:border-white/[0.08] p-4 md:p-5 space-y-4"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-[#B86B28] dark:text-[#E08E45]" />
            <h2 className="text-base font-bold text-[#0F172A] dark:text-white">
              Investment History ({state.activePlans.length})
            </h2>
          </div>

          <div
            role="tablist"
            aria-label="Filter Investment History"
            className="flex items-center gap-1 p-1 rounded-xl bg-[#F1F3F6] dark:bg-[#192234]"
          >
            {(['all', 'active', 'completed'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={historyFilter === tab}
                onClick={() => setHistoryFilter(tab)}
                className={`min-h-[34px] px-3 rounded-lg text-xs font-bold capitalize transition-colors cursor-pointer ${
                  historyFilter === tab
                    ? 'bg-white dark:bg-[#0F172A] text-[#0F172A] dark:text-white shadow-xs'
                    : 'text-[#64748B] dark:text-[#94A3B8]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {historyPlans.length === 0 ? (
          <p className="py-5 text-center text-xs text-[#64748B] dark:text-[#94A3B8]">
            No {historyFilter === 'all' ? '' : historyFilter} Mahindra BE6 fleet
            investments found.
          </p>
        ) : (
          <div className="divide-y divide-[#E6E8EE] dark:divide-white/[0.06]">
            {historyPlans.map((ap) => {
              const remaining = getRemainingDurationDays(ap);
              const status = getPlanStatus(ap);
              const earnedSoFar = ap.daysClaimed * ap.dailyIncome;
              const pct = Math.min(
                100,
                Math.round((ap.daysClaimed / Math.max(1, ap.durationDays)) * 100),
              );
              return (
                <div key={ap.id} className="py-3.5 first:pt-1 last:pb-1 space-y-2.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <VehicleImage
                        src={ap.imageUrl}
                        alt={ap.modelName}
                        className="w-12 h-12 rounded-xl object-cover shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-[#0F172A] dark:text-white truncate">
                          {ap.name} · {ap.modelName}
                        </p>
                        <p className="text-xs text-[#64748B] dark:text-[#94A3B8] tabular-nums">
                          Invested {formatINR(ap.investmentAmount)} ·{' '}
                          {new Date(ap.purchasedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`text-xs font-bold ${
                          status === 'active'
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-[#64748B] dark:text-[#94A3B8]'
                        }`}
                      >
                        {status === 'active' ? 'Active' : 'Completed'}
                      </span>
                      <p className="text-xs font-bold text-[#0F172A] dark:text-white tabular-nums mt-0.5">
                        {formatINR(earnedSoFar)} / {formatINR(ap.totalIncome)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 text-xs">
                    <div className="flex-1 h-1.5 rounded-full bg-[#F1F3F6] dark:bg-[#192234] overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          status === 'active'
                            ? 'bg-[#B86B28] dark:bg-[#E08E45]'
                            : 'bg-emerald-600 dark:bg-emerald-400'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="flex items-center gap-1 text-xs font-semibold text-[#0F172A] dark:text-[#E2E8F0] tabular-nums whitespace-nowrap shrink-0">
                      <Clock className="w-3.5 h-3.5 text-[#B86B28] dark:text-[#E08E45]" />
                      <span>
                        {remaining > 0
                          ? `${remaining} of ${ap.durationDays} days remaining`
                          : `0 days remaining · Completed`}
                      </span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Account Links & Logout */}
      <section className="bg-white dark:bg-[#111827] rounded-2xl border border-[#E6E8EE] dark:border-white/[0.08] divide-y divide-[#E6E8EE] dark:divide-white/[0.06]">
        <button
          type="button"
          onClick={() => onNavigate('bank')}
          aria-label="Manage Linked Bank Account"
          className="w-full min-h-[56px] p-4 flex items-center justify-between text-left hover:bg-[#F8FAFC] dark:hover:bg-[#192234]/50 rounded-t-2xl transition-colors cursor-pointer"
        >
          <div>
            <p className="text-sm font-bold text-[#0F172A] dark:text-white">
              Linked Bank Account
            </p>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8] font-mono-tabular">
              {state.bankDetails
                ? `${state.bankDetails.accountHolderName} · ${maskAccountNumber(state.bankDetails.accountNumber)}`
                : 'Not configured'}
            </p>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        <button
          type="button"
          onClick={onOpenAllTransactions}
          aria-label="Open Transaction Ledger"
          className="w-full min-h-[56px] p-4 flex items-center justify-between text-left hover:bg-[#F8FAFC] dark:hover:bg-[#192234]/50 transition-colors cursor-pointer"
        >
          <div>
            <p className="text-sm font-bold text-[#0F172A] dark:text-white">
              Transaction Ledger
            </p>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
              {state.transactions.length} account activities
            </p>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        <button
          type="button"
          onClick={onLogout}
          aria-label="Sign Out of Account"
          className="w-full min-h-[56px] p-4 flex items-center justify-between text-left text-rose-600 dark:text-rose-400 hover:bg-rose-50/60 dark:hover:bg-rose-950/30 rounded-b-2xl transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-bold">Log Out</span>
          </div>
          <ChevronRight className="w-4 h-4" />
        </button>
      </section>
    </div>
  );
}
