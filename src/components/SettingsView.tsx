import {
  ArrowLeft,
  Contrast,
  KeyRound,
  Landmark,
  Send,
  Users,
  ChevronRight,
  LogOut,
} from 'lucide-react';
import { AppRoute, AppState } from '../lib/investmentEngine';

interface SettingsViewProps {
  state: AppState;
  onBack: () => void;
  onNavigate: (route: AppRoute) => void;
  onToggleDarkMode: () => void;
  onOpenPasswordModal: () => void;
  onOpenSupportModal: () => void;
  onOpenChannelModal: () => void;
  onLogout: () => void;
}

export function SettingsView({
  state,
  onBack,
  onNavigate,
  onToggleDarkMode,
  onOpenPasswordModal,
  onOpenSupportModal,
  onOpenChannelModal,
  onLogout,
}: SettingsViewProps) {
  return (
    <div className="max-w-xl mx-auto space-y-5">
      <section className="rounded-2xl bg-[#0F172A] dark:bg-[#111827] border border-[#0F172A] dark:border-white/[0.08] text-white px-4 py-4 flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          aria-label="Go back"
          className="min-w-[40px] min-h-[40px] rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <h1 className="text-base font-bold tracking-tight">Settings</h1>

        <button
          type="button"
          onClick={onToggleDarkMode}
          aria-label={
            state.darkMode ? 'Switch to light mode' : 'Switch to dark mode'
          }
          aria-pressed={state.darkMode}
          className="min-w-[40px] min-h-[40px] rounded-full bg-white/10 hover:bg-white/20 text-[#E08E45] flex items-center justify-center transition-colors cursor-pointer"
        >
          <Contrast className="w-4 h-4" />
        </button>
      </section>

      <div className="rounded-2xl bg-white dark:bg-[#111827] border border-[#E6E8EE] dark:border-white/[0.08] p-4 sm:p-5 space-y-5">
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onOpenPasswordModal}
            className="min-h-[92px] p-4 rounded-xl bg-[#F4F6F9] dark:bg-white/[0.04] hover:bg-[#ECEFF4] dark:hover:bg-white/[0.08] flex flex-col items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <KeyRound className="w-6 h-6 text-[#B86B28] dark:text-[#E08E45]" />
            <span className="text-sm font-bold text-[#0F172A] dark:text-white">
              Password
            </span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('bank')}
            className="min-h-[92px] p-4 rounded-xl bg-[#F4F6F9] dark:bg-white/[0.04] hover:bg-[#ECEFF4] dark:hover:bg-white/[0.08] flex flex-col items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Landmark className="w-6 h-6 text-[#B86B28] dark:text-[#E08E45]" />
            <span className="text-sm font-bold text-[#0F172A] dark:text-white">
              Bank Card
            </span>
          </button>
        </div>

        <div className="space-y-1">
          <p className="text-[11px] font-bold tracking-wider text-[#64748B] dark:text-[#94A3B8] uppercase px-1 pb-2">
            Contact &amp; Support
          </p>

          <button
            type="button"
            onClick={onOpenSupportModal}
            aria-label="Customer Support"
            className="w-full min-h-[56px] py-3.5 px-2 flex items-center justify-between gap-3 hover:bg-[#F6F7FA] dark:hover:bg-[#192234] rounded-xl transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center gap-3.5">
              <span className="w-10 h-10 rounded-xl bg-[#F1F3F6] dark:bg-[#192234] text-[#B86B28] dark:text-[#E08E45] flex items-center justify-center shrink-0">
                <Send className="w-4 h-4" />
              </span>
              <div>
                <p className="text-sm font-bold text-[#0F172A] dark:text-white">
                  Customer Support
                </p>
                <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                  Chat with our support team
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>

          <div className="h-px bg-[#E6E8EE] dark:bg-white/[0.06] mx-2" />

          <button
            type="button"
            onClick={onOpenChannelModal}
            aria-label="Official Channel"
            className="w-full min-h-[56px] py-3.5 px-2 flex items-center justify-between gap-3 hover:bg-[#F6F7FA] dark:hover:bg-[#192234] rounded-xl transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center gap-3.5">
              <span className="w-10 h-10 rounded-xl bg-[#F1F3F6] dark:bg-[#192234] text-[#B86B28] dark:text-[#E08E45] flex items-center justify-center shrink-0">
                <Users className="w-4 h-4" />
              </span>
              <div>
                <p className="text-sm font-bold text-[#0F172A] dark:text-white">
                  Official Channel
                </p>
                <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                  Join for latest updates
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        <button
          type="button"
          onClick={onLogout}
          className="w-full min-h-[46px] px-4 py-2.5 rounded-xl border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-sm font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Log Out</span>
        </button>
      </div>
    </div>
  );
}
