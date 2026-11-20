import { useState } from 'react';
import { Zap } from 'lucide-react';
import {
  INVESTMENT_PLANS,
  InvestmentPlan,
  PlanCategory,
  formatINR,
} from '../lib/investmentEngine';
import { VehicleImage } from './VehicleImage';

interface PlansViewProps {
  plans?: InvestmentPlan[];
  onSelectPlan: (plan: InvestmentPlan) => void;
}

export function PlansView({ plans, onSelectPlan }: PlansViewProps) {
  const [category, setCategory] = useState<PlanCategory>('normal');
  const catalog = plans ?? INVESTMENT_PLANS;
  const visiblePlans = catalog.filter((p) => p.category === category);

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
          Under ₹1,500 · Max 25% daily return · 7–30 day cycle · Up to ₹5,000
        </p>

        <div
          role="tablist"
          aria-label="Plan Category"
          className="grid grid-cols-2 p-1 rounded-xl bg-white dark:bg-[#111827] border border-[#E6E8EE] dark:border-white/[0.08] w-full sm:w-64"
        >
          <button
            type="button"
            role="tab"
            aria-selected={category === 'normal'}
            onClick={() => setCategory('normal')}
            className={`min-h-[40px] px-4 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
              category === 'normal'
                ? 'bg-[#0F172A] dark:bg-[#E08E45] text-white dark:text-[#090D16]'
                : 'text-[#64748B] dark:text-[#94A3B8]'
            }`}
          >
            Normal Plan
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={category === 'vip'}
            onClick={() => setCategory('vip')}
            className={`min-h-[40px] px-4 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
              category === 'vip'
                ? 'bg-[#0F172A] dark:bg-[#E08E45] text-white dark:text-[#090D16]'
                : 'text-[#64748B] dark:text-[#94A3B8]'
            }`}
          >
            VIP Plan
          </button>
        </div>
      </div>

      {/* Cleaner Showroom Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {visiblePlans.map((plan) => {
          const dailyPct = Math.round(
            (plan.dailyIncome / plan.investmentAmount) * 100,
          );
          return (
            <article
              key={plan.id}
              className="bg-white dark:bg-[#111827] rounded-2xl border border-[#E6E8EE] dark:border-white/[0.08] overflow-hidden flex flex-col justify-between"
            >
              <div className="flex gap-4 p-4">
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-xl overflow-hidden bg-[#F1F3F6] dark:bg-[#192234] shrink-0">
                  <VehicleImage
                    src={plan.imageUrl}
                    alt={plan.modelName}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex items-baseline justify-between gap-2">
                      <h3 className="text-base font-bold text-[#0F172A] dark:text-white truncate">
                        {plan.name}
                      </h3>
                      <span className="text-[11px] font-bold text-[#B86B28] dark:text-[#E08E45] whitespace-nowrap shrink-0">
                        {dailyPct}% / day
                      </span>
                    </div>
                    <p className="text-xs text-[#64748B] dark:text-[#94A3B8] truncate mt-0.5">
                      {plan.modelName}
                    </p>
                  </div>

                  {/* Clean typographic stat strip instead of 3 nested boxes */}
                  <div className="grid grid-cols-3 divide-x divide-[#E6E8EE] dark:divide-white/[0.08] pt-3 mt-2 border-t border-[#E6E8EE] dark:border-white/[0.06]">
                    <div className="pr-2">
                      <p className="text-[10px] text-[#64748B] dark:text-[#94A3B8]">
                        Daily
                      </p>
                      <p className="text-sm font-extrabold text-[#B86B28] dark:text-[#E08E45] tabular-nums">
                        {formatINR(plan.dailyIncome)}
                      </p>
                    </div>
                    <div className="px-2">
                      <p className="text-[10px] text-[#64748B] dark:text-[#94A3B8]">
                        Total
                      </p>
                      <p className="text-sm font-extrabold text-[#0F172A] dark:text-white tabular-nums">
                        {formatINR(plan.totalIncome)}
                      </p>
                    </div>
                    <div className="pl-2">
                      <p className="text-[10px] text-[#64748B] dark:text-[#94A3B8]">
                        Cycle
                      </p>
                      <p className="text-sm font-extrabold text-[#0F172A] dark:text-white tabular-nums">
                        {plan.durationDays}d
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-4 py-3 bg-[#F8FAFC] dark:bg-[#192234]/60 border-t border-[#E6E8EE] dark:border-white/[0.06] flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] text-[#64748B] dark:text-[#94A3B8]">
                    Investment
                  </p>
                  <p className="text-lg font-extrabold text-[#0F172A] dark:text-white tabular-nums">
                    {formatINR(plan.investmentAmount)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onSelectPlan(plan)}
                  aria-label={`Buy ${plan.name}`}
                  className="min-h-[44px] px-5 py-2 rounded-xl bg-[#0F172A] hover:bg-[#1E293B] dark:bg-[#E08E45] dark:hover:bg-[#EA9B54] text-white dark:text-[#090D16] text-xs font-bold flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Buy Now</span>
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
