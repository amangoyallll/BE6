import {
  CalendarCheck2,
  Wallet,
  BanknoteArrowUp,
  Store,
  ChevronRight,
  ArrowDownLeft,
  ArrowUpRight,
  Zap,
  Info,
  Activity,
  ArrowRight,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import {
  AppRoute,
  AppState,
  HERO_BANNER_IMAGE,
  INVESTMENT_PLANS,
  InvestmentPlan,
  Transaction,
  formatINR,
  formatRelativeTime,
  getActiveOngoingPlans,
  getGreeting,
  getTodayDateString,
} from '../lib/investmentEngine';
import { VehicleImage } from './VehicleImage';

interface HomeViewProps {
  state: AppState;
  liveTransactions: Transaction[];
  onNavigate: (route: AppRoute) => void;
  onSelectPlan: (plan: InvestmentPlan) => void;
  onOpenPlatformInfo: () => void;
  onOpenAllTransactions: () => void;
}

export function HomeView({
  state,
  liveTransactions,
  onNavigate,
  onSelectPlan,
  onOpenPlatformInfo,
  onOpenAllTransactions,
}: HomeViewProps) {
  const greeting = getGreeting(new Date().getHours());
  const plansList = state.plansCatalog ?? INVESTMENT_PLANS;
  const specialPlan = plansList.find((p) => p.id === 'normal-a') ?? plansList[0];
  const recentTx = liveTransactions.slice(0, 5);
  const ongoingCount = getActiveOngoingPlans(state.activePlans).length;
  const bonusClaimedToday = state.lastCheckInDate === getTodayDateString();
  const dailyPct = Math.round(
    (specialPlan.dailyIncome / specialPlan.investmentAmount) * 100,
  );

  const quickActions: Array<{
    id: string;
    label: string;
    sublabel?: string;
    route: AppRoute;
    icon: typeof CalendarCheck2;
  }> = [
    {
      id: 'checkin',
      label: 'Daily Bonus',
      sublabel: bonusClaimedToday ? 'Claimed' : '₹25 Ready',
      route: 'checkin',
      icon: CalendarCheck2,
    },
    { id: 'recharge', label: 'Recharge', route: 'recharge', icon: Wallet },
    { id: 'withdraw', label: 'Withdraw', route: 'withdraw', icon: BanknoteArrowUp },
    { id: 'shop', label: 'Plans', route: 'plans', icon: Store },
  ];

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Top Split: Showroom Hero + Clean Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-5 items-stretch">
        <section
          aria-label="Account Overview"
          className="lg:col-span-7 relative rounded-2xl overflow-hidden border border-[#E6E8EE] dark:border-white/[0.08] min-h-[204px] md:min-h-[232px] flex flex-col justify-between bg-[#090D16]"
        >
          <VehicleImage
            src={HERO_BANNER_IMAGE}
            alt="Mahindra BE6 Luxury Electric SUV Showroom"
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-r from-[#090D16]/90 via-[#090D16]/60 to-[#090D16]/25"
          />

          <div className="relative z-10 p-4 md:p-6 flex items-start justify-between gap-2.5">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#E08E45] text-[#090D16] font-extrabold text-xs sm:text-sm flex items-center justify-center shrink-0">
                BE6
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-[#E08E45] truncate">
                  {greeting}, {state.auth.userName}
                </p>
                <p className="text-base sm:text-lg font-bold text-white tracking-tight font-mono-tabular truncate">
                  {state.userId}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onOpenPlatformInfo}
              aria-label="Open Platform Info"
              className="min-h-[40px] px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-white text-xs font-semibold flex items-center gap-1.5 border border-white/15 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Info className="w-3.5 h-3.5 text-[#E08E45] shrink-0" />
              <span>Platform Info</span>
            </button>
          </div>

          <div className="relative z-10 px-4 pb-4 md:px-6 md:pb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-medium text-slate-300">
                Available Balance
              </p>
              <p className="text-2xl md:text-3xl font-extrabold text-white tabular-nums tracking-tight">
                {formatINR(state.balance, true)}
              </p>
            </div>

            <div className="text-right">
              <span className="text-xs font-bold tracking-wide text-[#E08E45]">
                Mahindra BE6
              </span>
              <p className="text-[11px] text-slate-300">
                {ongoingCount} Active {ongoingCount === 1 ? 'Vehicle' : 'Vehicles'}
              </p>
            </div>
          </div>
        </section>

        {/* Simplified Quick Actions Card */}
        <section
          aria-label="Quick Actions"
          className="lg:col-span-5 bg-white dark:bg-[#111827] rounded-2xl border border-[#E6E8EE] dark:border-white/[0.08] p-4 md:p-5 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-[#0F172A] dark:text-white">
              Quick Actions
            </h2>
            <button
              type="button"
              onClick={onOpenPlatformInfo}
              className="text-xs font-semibold text-[#B86B28] dark:text-[#E08E45] hover:underline flex items-center gap-0.5 min-h-[40px] px-1 cursor-pointer whitespace-nowrap"
            >
              <span>Rules</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-4 lg:grid-cols-2 gap-2.5 flex-1">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.id}
                  type="button"
                  onClick={() => onNavigate(action.route)}
                  className="group flex flex-col items-center justify-center text-center p-2.5 md:p-4 rounded-xl bg-[#F4F6F9] dark:bg-white/[0.04] hover:bg-[#ECEFF4] dark:hover:bg-white/[0.08] transition-colors min-h-[78px] cursor-pointer"
                >
                  <span className="w-9 h-9 rounded-xl bg-white dark:bg-[#111827] text-[#B86B28] dark:text-[#E08E45] flex items-center justify-center mb-1.5 shadow-2xs group-hover:scale-105 transition-transform">
                    <Icon className="w-4 h-4" />
                  </span>
                  <span className="text-xs font-bold text-[#0F172A] dark:text-white leading-tight whitespace-nowrap">
                    {action.label}
                  </span>
                  {action.sublabel && (
                    <span className="text-[10px] font-semibold text-[#B86B28] dark:text-[#E08E45] mt-0.5 whitespace-nowrap">
                      {action.sublabel}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </section>
      </div>

      {/* Main Content Split: Clean Featured Vehicle + Believable Live Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-5 items-start">
        <section
          aria-label="Special Offer Plan"
          className="lg:col-span-6 space-y-3"
        >
          <div className="bg-white dark:bg-[#111827] rounded-2xl border border-[#E6E8EE] dark:border-white/[0.08] p-4 md:p-5 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-[#0F172A] dark:text-white">
                  {specialPlan.name} · Flagship Offer
                </h2>
                <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-0.5">
                  {specialPlan.modelName} · {dailyPct}% daily yield
                </p>
              </div>
              <span className="text-xs font-bold text-[#B86B28] dark:text-[#E08E45] whitespace-nowrap">
                {specialPlan.durationDays} Days
              </span>
            </div>

            <div className="rounded-xl overflow-hidden bg-[#F1F3F6] dark:bg-[#192234] h-44 sm:h-48">
              <VehicleImage
                src={specialPlan.imageUrl}
                alt={specialPlan.modelName}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="grid grid-cols-3 divide-x divide-[#E6E8EE] dark:divide-white/[0.08] py-1">
              <div className="pr-3">
                <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                  Daily ({dailyPct}%)
                </p>
                <p className="text-base font-extrabold text-[#B86B28] dark:text-[#E08E45] tabular-nums">
                  {formatINR(specialPlan.dailyIncome)}
                </p>
              </div>
              <div className="px-3">
                <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                  Total Return
                </p>
                <p className="text-base font-extrabold text-[#0F172A] dark:text-white tabular-nums">
                  {formatINR(specialPlan.totalIncome)}
                </p>
              </div>
              <div className="pl-3">
                <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                  Cycle
                </p>
                <p className="text-base font-extrabold text-[#0F172A] dark:text-white tabular-nums">
                  {specialPlan.durationDays} Days
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E6E8EE] dark:border-white/[0.08] flex items-center justify-between gap-4">
              <div>
                <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                  Investment
                </p>
                <p className="text-xl font-extrabold text-[#0F172A] dark:text-white tabular-nums">
                  {formatINR(specialPlan.investmentAmount)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onSelectPlan(specialPlan)}
                className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#0F172A] hover:bg-[#1E293B] dark:bg-[#E08E45] dark:hover:bg-[#EA9B54] text-white dark:text-[#090D16] text-sm font-bold flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Zap className="w-4 h-4" />
                <span>Buy Now</span>
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('plans')}
            className="w-full min-h-[44px] py-2.5 px-4 rounded-xl bg-white dark:bg-[#111827] border border-[#E6E8EE] dark:border-white/[0.08] hover:border-[#B86B28]/50 text-[#0F172A] dark:text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <ArrowRight className="w-4 h-4 text-[#B86B28] dark:text-[#E08E45]" />
            <span>Explore All BE6 Plans</span>
          </button>
        </section>

        {/* Believable Live Fleet & Settlement Activity */}
        <section
          aria-label="Live Transactions"
          className="lg:col-span-6 bg-white dark:bg-[#111827] rounded-2xl border border-[#E6E8EE] dark:border-white/[0.08] p-4 md:p-5 overflow-hidden"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#B86B28] dark:text-[#E08E45]" />
              <h2 className="text-base font-bold text-[#0F172A] dark:text-white">
                Recent Fleet Activity
              </h2>
              <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                · Live
              </span>
            </div>
            <button
              type="button"
              onClick={onOpenAllTransactions}
              className="text-xs font-semibold text-[#B86B28] dark:text-[#E08E45] hover:underline flex items-center gap-0.5 min-h-[40px] px-1 cursor-pointer whitespace-nowrap"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-[#E6E8EE] dark:divide-white/[0.06]">
            <AnimatePresence initial={false}>
              {recentTx.map((tx) => {
                const isPositive = tx.isCredit;
                return (
                  <motion.div
                    key={tx.id}
                    layout
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="py-3 first:pt-1 last:pb-1 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          isPositive
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                            : 'bg-[#F1F3F6] text-[#B86B28] dark:bg-[#192234] dark:text-[#E08E45]'
                        }`}
                      >
                        {isPositive ? (
                          <ArrowUpRight className="w-4 h-4" />
                        ) : (
                          <ArrowDownLeft className="w-4 h-4" />
                        )}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#0F172A] dark:text-white truncate">
                          {tx.userLabel}
                          {tx.isOwn ? ' (You)' : ''}
                        </p>
                        <p className="text-xs text-[#64748B] dark:text-[#94A3B8] truncate">
                          {tx.description}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p
                        className={`text-sm font-bold tabular-nums whitespace-nowrap ${
                          isPositive
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-[#0F172A] dark:text-[#E08E45]'
                        }`}
                      >
                        {isPositive ? '+' : '-'}
                        {formatINR(tx.amount)}
                      </p>
                      <p className="text-[10px] text-[#64748B] dark:text-[#94A3B8] tabular-nums">
                        {formatRelativeTime(tx.timestamp)}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </section>
      </div>
    </div>
  );
}
