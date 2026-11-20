import { useState, FormEvent } from 'react';
import {
  X,
  Info,
  Send,
  Zap,
  CheckCircle2,
  KeyRound,
  Headset,
  ArrowUpRight,
  ArrowDownLeft,
} from 'lucide-react';
import {
  DAILY_CHECKIN_CODE,
  InvestmentPlan,
  PLATFORM_INFO,
  Transaction,
  formatINR,
  formatRelativeTime,
} from '../lib/investmentEngine';
import { VehicleImage } from './VehicleImage';

export function PlatformInfoModal({
  open,
  onClose,
  onJoinChannel,
}: {
  open: boolean;
  onClose: () => void;
  onJoinChannel: () => void;
}) {
  if (!open) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="platform-info-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs"
    >
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#111827] border border-[#E6E8EE] dark:border-white/[0.1] p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-[#B86B28] dark:text-[#E08E45]" />
            <h2
              id="platform-info-title"
              className="text-base font-bold text-[#0F172A] dark:text-white"
            >
              Platform Info
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Platform Info"
            className="min-w-[40px] min-h-[40px] rounded-full bg-[#F1F3F6] dark:bg-[#192234] text-[#0F172A] dark:text-white flex items-center justify-center hover:opacity-80 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="divide-y divide-[#E6E8EE] dark:divide-white/[0.06]">
          {PLATFORM_INFO.map((row) => (
            <div
              key={row.label}
              className="flex items-center justify-between gap-3 py-2.5 text-xs"
            >
              <span className="text-[#64748B] dark:text-[#94A3B8] font-medium">
                {row.label}
              </span>
              <span className="font-bold text-[#0F172A] dark:text-[#E08E45] tabular-nums text-right">
                {row.value}
              </span>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={onJoinChannel}
          className="w-full min-h-[46px] px-5 py-2.5 rounded-xl bg-[#0F172A] hover:bg-[#1E293B] dark:bg-[#E08E45] dark:hover:bg-[#EA9B54] text-white dark:text-[#090D16] text-sm font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <Send className="w-4 h-4" />
          <span>Join Telegram Channel</span>
        </button>
      </div>
    </div>
  );
}

export function PurchaseConfirmModal({
  plan,
  balance,
  onClose,
  onConfirm,
  onGoToRecharge,
}: {
  plan: InvestmentPlan | null;
  balance: number;
  onClose: () => void;
  onConfirm: (plan: InvestmentPlan) => Promise<{ ok: boolean; message: string }>;
  onGoToRecharge: () => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  if (!plan) return null;

  const canAfford = balance >= plan.investmentAmount;
  const dailyPct = Math.round(
    (plan.dailyIncome / plan.investmentAmount) * 100,
  );

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      const res = await onConfirm(plan);
      if (!res.ok) {
        setError(res.message);
      } else {
        setError(null);
        onClose();
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="purchase-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs"
    >
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#111827] border border-[#E6E8EE] dark:border-white/[0.1] p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h2
            id="purchase-modal-title"
            className="text-base font-bold text-[#0F172A] dark:text-white"
          >
            Confirm Mahindra BE6 Investment
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close purchase modal"
            className="min-w-[40px] min-h-[40px] rounded-full bg-[#F1F3F6] dark:bg-[#192234] text-[#0F172A] dark:text-white flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-3.5 p-3 rounded-xl bg-[#F6F7FA] dark:bg-[#192234]">
          <VehicleImage
            src={plan.imageUrl}
            alt={plan.modelName}
            className="w-16 h-16 rounded-xl object-cover shrink-0"
          />
          <div>
            <p className="text-sm font-bold text-[#0F172A] dark:text-white">
              {plan.name} · {plan.modelName}
            </p>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
              {plan.durationDays} Days · Daily {formatINR(plan.dailyIncome)} (
              {dailyPct}%)
            </p>
            <p className="text-xs font-bold text-[#B86B28] dark:text-[#E08E45] mt-0.5">
              Total Return: {formatINR(plan.totalIncome)}
            </p>
          </div>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-[#64748B] dark:text-[#94A3B8]">
              Investment Required
            </span>
            <span className="font-bold text-[#0F172A] dark:text-white tabular-nums">
              {formatINR(plan.investmentAmount, true)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#64748B] dark:text-[#94A3B8]">
              Your Wallet Balance
            </span>
            <span className="font-bold text-[#0F172A] dark:text-white tabular-nums">
              {formatINR(balance, true)}
            </span>
          </div>
        </div>

        {error && (
          <p className="text-xs font-semibold text-rose-600 dark:text-rose-400">
            {error}
          </p>
        )}

        {canAfford ? (
          <button
            type="button"
            disabled={submitting}
            onClick={handleConfirm}
            className="w-full min-h-[46px] px-5 py-2.5 rounded-xl bg-[#0F172A] hover:bg-[#1E293B] dark:bg-[#E08E45] dark:hover:bg-[#EA9B54] text-white dark:text-[#090D16] text-sm font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-60"
          >
            <Zap className="w-4 h-4" />
            <span>
              {submitting
                ? 'Activating Plan...'
                : `Confirm & Activate (${formatINR(plan.investmentAmount)})`}
            </span>
          </button>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-amber-700 dark:text-[#E08E45] font-medium">
              Insufficient balance. Recharge via UPI/QR to activate this
              Mahindra BE6 plan.
            </p>
            <button
              type="button"
              onClick={() => {
                onClose();
                onGoToRecharge();
              }}
              className="w-full min-h-[46px] px-5 py-2.5 rounded-xl bg-[#0F172A] hover:bg-[#1E293B] dark:bg-[#E08E45] dark:hover:bg-[#EA9B54] text-white dark:text-[#090D16] text-sm font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Zap className="w-4 h-4" />
              <span>Recharge Wallet Now</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export function SupportModal({
  open,
  mode,
  checkInCode,
  onClose,
}: {
  open: boolean;
  mode: 'support' | 'channel';
  checkInCode?: string;
  onClose: () => void;
}) {
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  if (!open) return null;

  const handleSend = (e: FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setSent(true);
    setMessage('');
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="support-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs"
    >
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#111827] border border-[#E6E8EE] dark:border-white/[0.1] p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {mode === 'support' ? (
              <Headset className="w-4 h-4 text-[#B86B28] dark:text-[#E08E45]" />
            ) : (
              <Send className="w-4 h-4 text-[#B86B28] dark:text-[#E08E45]" />
            )}
            <h2
              id="support-modal-title"
              className="text-base font-bold text-[#0F172A] dark:text-white"
            >
              {mode === 'support'
                ? 'Mahindra BE6 Support'
                : 'Official Telegram Channel'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="min-w-[40px] min-h-[40px] rounded-full bg-[#F1F3F6] dark:bg-[#192234] text-[#0F172A] dark:text-white flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {mode === 'channel' ? (
          <div className="space-y-3 text-xs text-[#64748B] dark:text-[#94A3B8]">
            <p>
              Daily gift codes, Mahindra BE6 luxury fleet updates, and UTR
              verification notices are posted every morning at 9:00 AM IST.
            </p>
            <div className="p-3 rounded-xl bg-[#F6F7FA] dark:bg-[#192234] text-[#0F172A] dark:text-[#E08E45] font-mono-tabular">
              Channel: @MahindraBE6Official · Today’s Code:{' '}
              {checkInCode ?? DAILY_CHECKIN_CODE}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-full min-h-[44px] rounded-xl bg-[#0F172A] dark:bg-[#E08E45] text-white dark:text-[#090D16] font-bold text-sm cursor-pointer"
            >
              Got It
            </button>
          </div>
        ) : (
          <form onSubmit={handleSend} className="space-y-3">
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
              Our fleet &amp; UTR verification specialists respond within 15
              minutes (09:00–22:00 IST).
            </p>
            <label htmlFor="support-msg-input" className="sr-only">
              Support message
            </label>
            <textarea
              id="support-msg-input"
              rows={3}
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                setSent(false);
              }}
              placeholder="Describe your question about UPI UTR verification, bank payout, or BE6 plans..."
              className="w-full p-3 rounded-xl border border-[#E6E8EE] dark:border-white/[0.1] bg-[#F6F7FA] dark:bg-[#090D16] text-[#0F172A] dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#B86B28]"
            />
            {sent && (
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>Support ticket submitted. Reference #BE6-4092.</span>
              </div>
            )}
            <button
              type="submit"
              className="w-full min-h-[44px] rounded-xl bg-[#0F172A] hover:bg-[#1E293B] dark:bg-[#E08E45] dark:hover:bg-[#EA9B54] text-white dark:text-[#090D16] font-bold text-sm cursor-pointer"
            >
              Send Message
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export function PasswordModal({
  open,
  onClose,
  onUpdatePassword,
}: {
  open: boolean;
  onClose: () => void;
  onUpdatePassword: (
    currentPwd: string,
    newPwd: string,
  ) => Promise<{ ok: boolean; message: string }>;
}) {
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  if (!open) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await onUpdatePassword(currentPwd, newPwd);
      if (res.ok) {
        setFeedback({ type: 'success', text: res.message });
        setCurrentPwd('');
        setNewPwd('');
      } else {
        setFeedback({ type: 'error', text: res.message });
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="password-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs"
    >
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#111827] border border-[#E6E8EE] dark:border-white/[0.1] p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-[#B86B28] dark:text-[#E08E45]" />
            <h2
              id="password-modal-title"
              className="text-base font-bold text-[#0F172A] dark:text-white"
            >
              Update Security Password
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close password modal"
            className="min-w-[40px] min-h-[40px] rounded-full bg-[#F1F3F6] dark:bg-[#192234] text-[#0F172A] dark:text-white flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label
              htmlFor="current-pwd-input"
              className="block text-xs font-semibold text-[#64748B] dark:text-[#94A3B8] mb-1"
            >
              Current Password
            </label>
            <input
              id="current-pwd-input"
              type="password"
              value={currentPwd}
              onChange={(e) => setCurrentPwd(e.target.value)}
              className="w-full min-h-[44px] px-3.5 rounded-xl border border-[#E6E8EE] dark:border-white/[0.1] bg-[#F6F7FA] dark:bg-[#090D16] text-[#0F172A] dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#B86B28]"
            />
          </div>
          <div>
            <label
              htmlFor="new-pwd-input"
              className="block text-xs font-semibold text-[#64748B] dark:text-[#94A3B8] mb-1"
            >
              New Password (min 6 characters)
            </label>
            <input
              id="new-pwd-input"
              type="password"
              value={newPwd}
              onChange={(e) => setNewPwd(e.target.value)}
              className="w-full min-h-[44px] px-3.5 rounded-xl border border-[#E6E8EE] dark:border-white/[0.1] bg-[#F6F7FA] dark:bg-[#090D16] text-[#0F172A] dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#B86B28]"
            />
          </div>

          {feedback && (
            <p
              className={`text-xs font-semibold ${
                feedback.type === 'success'
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {feedback.text}
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full min-h-[44px] rounded-xl bg-[#0F172A] hover:bg-[#1E293B] dark:bg-[#E08E45] dark:hover:bg-[#EA9B54] text-white dark:text-[#090D16] font-bold text-sm cursor-pointer disabled:opacity-60"
          >
            {saving ? 'Updating...' : 'Save Password'}
          </button>
        </form>
      </div>
    </div>
  );
}

export function AllTransactionsModal({
  open,
  transactions,
  onClose,
}: {
  open: boolean;
  transactions: Transaction[];
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="all-tx-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs"
    >
      <div className="w-full max-w-lg max-h-[82vh] flex flex-col rounded-2xl bg-white dark:bg-[#111827] border border-[#E6E8EE] dark:border-white/[0.1] p-5 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-[#E6E8EE] dark:border-white/[0.08]">
          <h2
            id="all-tx-title"
            className="text-base font-bold text-[#0F172A] dark:text-white"
          >
            Live &amp; Account Activity
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close transactions"
            className="min-w-[40px] min-h-[40px] rounded-full bg-[#F1F3F6] dark:bg-[#192234] text-[#0F172A] dark:text-white flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto divide-y divide-[#E6E8EE] dark:divide-white/[0.06] mt-2">
          {transactions.map((tx) => (
            <div
              key={tx.id}
              className="py-3 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    tx.isCredit
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                      : 'bg-[#F1F3F6] text-[#B86B28] dark:bg-[#192234] dark:text-[#E08E45]'
                  }`}
                >
                  {tx.isCredit ? (
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
                  className={`text-sm font-bold tabular-nums ${
                    tx.isCredit
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-[#0F172A] dark:text-[#E08E45]'
                  }`}
                >
                  {tx.isCredit ? '+' : '-'}
                  {formatINR(tx.amount)}
                </p>
                <p className="text-[10px] text-[#64748B] dark:text-[#94A3B8] tabular-nums">
                  {formatRelativeTime(tx.timestamp)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
