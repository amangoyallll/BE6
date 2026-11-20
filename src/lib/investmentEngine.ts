export type PlanCategory = 'normal' | 'vip';

export type PaymentMethod = 'UPI_ID' | 'QR_CODE' | 'DIRECT_IMPS';

export type RequestStatus = 'pending' | 'approved' | 'rejected';

export type UserRole = 'investor' | 'admin';

export type AccountStatus = 'active' | 'suspended';

export type AppRoute =
  | 'home'
  | 'plans'
  | 'checkin'
  | 'recharge'
  | 'withdraw'
  | 'team'
  | 'profile'
  | 'settings'
  | 'bank'
  | 'admin';

export interface InvestmentPlan {
  id: string;
  category: PlanCategory;
  name: string;
  modelName: string;
  subtitle: string;
  dailyIncome: number;
  totalIncome: number;
  durationDays: number;
  investmentAmount: number;
  imageUrl: string;
  featured?: boolean;
}

export interface ActivePlan {
  id: string;
  planId: string;
  name: string;
  modelName: string;
  dailyIncome: number;
  totalIncome: number;
  durationDays: number;
  investmentAmount: number;
  purchasedAt: string;
  daysClaimed: number;
  lastClaimDate: string | null;
  imageUrl: string;
}

export type TransactionKind =
  | 'withdrawal'
  | 'purchase'
  | 'recharge'
  | 'checkin'
  | 'yield'
  | 'bonus'
  | 'admin';

export interface Transaction {
  id: string;
  userId?: string;
  userName?: string;
  userLabel: string;
  description: string;
  kind: TransactionKind;
  amount: number;
  isCredit: boolean;
  timestamp: string;
  isOwn?: boolean;
}

export interface RechargeRequest {
  id: string;
  userId: string;
  userName?: string;
  amount: number;
  method: PaymentMethod;
  utrNumber: string;
  status: RequestStatus;
  createdAt: string;
  reviewedAt?: string;
  rejectionReason?: string;
}

export interface WithdrawalRequest {
  id: string;
  userId: string;
  userName?: string;
  withdrawalAmount: number;
  claimFeeAmount: number;
  method: PaymentMethod;
  utrNumber: string;
  bankDetails: BankDetails;
  status: RequestStatus;
  createdAt: string;
  reviewedAt?: string;
  rejectionReason?: string;
}

export interface BankDetails {
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
}

export interface ReferralMember {
  id: string;
  userId?: string;
  userName?: string;
  maskedPhone: string;
  level: 1 | 2 | 3;
  rechargeAmount: number;
  commissionEarned: number;
  joinedAt: string;
}

export interface AuthSession {
  isAuthenticated: boolean;
  role: UserRole;
  userName: string;
  phone: string;
}

export interface PlatformSettings {
  merchantUpiId: string;
  merchantName: string;
  dailyCheckInCode: string;
  checkInRewardAmount: number;
  signupBonusAmount: number;
  maxWithdrawalAmount: number;
  adminPassword: string;
  maintenanceMode: boolean;
}

export interface UserAccount {
  userId: string;
  userName: string;
  passwordHash: string;
  accountStatus: AccountStatus;
  balance: number;
  referralCode: string;
  referredByCode: string | null;
  bankDetails: BankDetails | null;
  activePlans: ActivePlan[];
  transactions: Transaction[];
  lastCheckInDate: string | null;
  lastCheckInReward: number | null;
  referralMembers: ReferralMember[];
  darkMode: boolean;
  createdAt: string;
  lastLoginAt: string | null;
}

export interface PlatformDatabase {
  users: UserAccount[];
  rechargeRequests: RechargeRequest[];
  withdrawalRequests: WithdrawalRequest[];
  settings: PlatformSettings;
  plans: InvestmentPlan[];
}

export interface AppState {
  auth: AuthSession;
  userId: string;
  accountStatus: AccountStatus;
  balance: number;
  referralCode: string;
  bankDetails: BankDetails | null;
  activePlans: ActivePlan[];
  transactions: Transaction[];
  rechargeRequests: RechargeRequest[];
  withdrawalRequests: WithdrawalRequest[];
  lastCheckInDate: string | null;
  lastCheckInReward: number | null;
  referralMembers: ReferralMember[];
  darkMode: boolean;
  passwordHash: string;
  settings?: PlatformSettings;
  plansCatalog?: InvestmentPlan[];
}

export const HERO_BANNER_IMAGE =
  '/src/assets/images/be6_luxury_hero_1795164411257.jpg';

const IMG_CHAMPAGNE = '/src/assets/images/be6_champagne_gold_1795164411278.jpg';
const IMG_OBSIDIAN = '/src/assets/images/be6_obsidian_stealth_1795164412224.jpg';
const IMG_TITANIUM = '/src/assets/images/be6_titanium_silver_1795164410809.jpg';
const IMG_CRIMSON = '/src/assets/images/be6_crimson_velvet_1795164411551.jpg';

export const MERCHANT_UPI_ID = 'mahindrabe6.pay@okicici';
export const MERCHANT_NAME = 'Mahindra BE6 Luxury Fleet Pvt Ltd';

// Strictly enforced plan bounds:
// 1. investmentAmount < 1500 (₹250 - ₹1,450)
// 2. dailyIncome <= 25% of investmentAmount
// 3. 7 <= durationDays <= 30
// 4. totalIncome <= 5000 and dailyIncome * durationDays === totalIncome
export const INVESTMENT_PLANS: InvestmentPlan[] = [
  {
    id: 'normal-popular',
    category: 'normal',
    name: 'BE6 Pack One',
    modelName: 'Mahindra BE6 Obsidian Edition',
    subtitle: '25% Daily Yield · 15 Days',
    dailyIncome: 100,
    totalIncome: 1500,
    durationDays: 15,
    investmentAmount: 400,
    imageUrl: IMG_OBSIDIAN,
    featured: true,
  },
  {
    id: 'normal-a',
    category: 'normal',
    name: 'BE6 Essential',
    modelName: 'Mahindra BE6 Champagne Gold',
    subtitle: '24% Daily Yield · 30 Days',
    dailyIncome: 60,
    totalIncome: 1800,
    durationDays: 30,
    investmentAmount: 250,
    imageUrl: IMG_CHAMPAGNE,
    featured: true,
  },
  {
    id: 'normal-b',
    category: 'normal',
    name: 'BE6 Titanium Luxe',
    modelName: 'Mahindra BE6 Liquid Silver',
    subtitle: '24% Daily Yield · 25 Days',
    dailyIncome: 120,
    totalIncome: 3000,
    durationDays: 25,
    investmentAmount: 500,
    imageUrl: IMG_TITANIUM,
  },
  {
    id: 'normal-c',
    category: 'normal',
    name: 'BE6 Stealth AWD',
    modelName: 'Mahindra BE6 Dual Motor',
    subtitle: '25% Daily Yield · 22 Days',
    dailyIncome: 175,
    totalIncome: 3850,
    durationDays: 22,
    investmentAmount: 700,
    imageUrl: IMG_OBSIDIAN,
  },
  {
    id: 'normal-d',
    category: 'normal',
    name: 'BE6 Velvet GT',
    modelName: 'Mahindra BE6 Crimson Coupe',
    subtitle: '25% Daily Yield · 20 Days',
    dailyIncome: 225,
    totalIncome: 4500,
    durationDays: 20,
    investmentAmount: 900,
    imageUrl: IMG_CRIMSON,
  },
  {
    id: 'normal-e',
    category: 'normal',
    name: 'BE6 Signature Plus',
    modelName: 'Mahindra BE6 Titanium GT',
    subtitle: 'Peak ₹5,000 Return · 20 Days',
    dailyIncome: 250,
    totalIncome: 5000,
    durationDays: 20,
    investmentAmount: 1100,
    imageUrl: IMG_TITANIUM,
  },
  {
    id: 'normal-f',
    category: 'normal',
    name: 'BE6 Atelier Bronze',
    modelName: 'Mahindra BE6 Champagne Flagship',
    subtitle: '25% Daily Yield · 14 Days',
    dailyIncome: 350,
    totalIncome: 4900,
    durationDays: 14,
    investmentAmount: 1400,
    imageUrl: IMG_CHAMPAGNE,
  },
  {
    id: 'vip-a',
    category: 'vip',
    name: 'VIP Obsidian',
    modelName: 'BE6 Carbon Sprint',
    subtitle: '25% Daily Yield · 10 Days',
    dailyIncome: 150,
    totalIncome: 1500,
    durationDays: 10,
    investmentAmount: 600,
    imageUrl: IMG_OBSIDIAN,
  },
  {
    id: 'vip-b',
    category: 'vip',
    name: 'VIP Velvet',
    modelName: 'BE6 Crimson Executive',
    subtitle: '25% Daily Yield · 14 Days',
    dailyIncome: 250,
    totalIncome: 3500,
    durationDays: 14,
    investmentAmount: 1000,
    imageUrl: IMG_CRIMSON,
  },
  {
    id: 'vip-c',
    category: 'vip',
    name: 'VIP Sovereign',
    modelName: 'BE6 Champagne Reserve',
    subtitle: '24.1% Daily Yield · 14 Days',
    dailyIncome: 350,
    totalIncome: 4900,
    durationDays: 14,
    investmentAmount: 1450,
    imageUrl: IMG_CHAMPAGNE,
  },
];

export const RECHARGE_PRESETS = [250, 400, 500, 700, 900, 1100, 1400, 1450];

export const FALLBACK_STARTER_DAILY_INCOME = 60;
export const MAX_WITHDRAWAL = 10000;
export const DAILY_CHECKIN_CODE = 'BE6DRIVE';

export const DEFAULT_PLATFORM_SETTINGS: PlatformSettings = {
  merchantUpiId: MERCHANT_UPI_ID,
  merchantName: MERCHANT_NAME,
  dailyCheckInCode: DAILY_CHECKIN_CODE,
  checkInRewardAmount: 25,
  signupBonusAmount: 40,
  maxWithdrawalAmount: MAX_WITHDRAWAL,
  adminPassword: 'admin123',
  maintenanceMode: false,
};

export const PLATFORM_INFO = [
  { label: 'Fleet Brand', value: 'Mahindra BE6' },
  { label: 'Plan Range', value: '₹250 – ₹1,450' },
  { label: 'Daily Return Cap', value: 'Max 25% / Day' },
  { label: 'Cycle Duration', value: '7 – 30 Days' },
  { label: 'Max Earning', value: 'Up to ₹5,000' },
  { label: 'Min Withdrawal', value: '4 Days Income' },
  { label: 'IMPS Payouts', value: '15–30 mins · ₹0 Fee' },
  { label: 'Settlement Banks', value: 'All Indian IMPS Banks' },
] as const;

export const INITIAL_SEED_PLANS: ActivePlan[] = [
  {
    id: 'active-seed-1',
    planId: 'normal-a',
    name: 'BE6 Essential',
    modelName: 'Mahindra BE6 Champagne Gold',
    dailyIncome: 60,
    totalIncome: 1800,
    durationDays: 30,
    investmentAmount: 250,
    purchasedAt: '2026-11-18T10:15:00.000Z',
    daysClaimed: 1,
    lastClaimDate: '2026-11-19',
    imageUrl: IMG_CHAMPAGNE,
  },
  {
    id: 'past-seed-1',
    planId: 'normal-popular',
    name: 'BE6 Pack One',
    modelName: 'Mahindra BE6 Obsidian Edition',
    dailyIncome: 100,
    totalIncome: 1500,
    durationDays: 15,
    investmentAmount: 400,
    purchasedAt: '2026-11-01T09:00:00.000Z',
    daysClaimed: 15,
    lastClaimDate: '2026-11-16',
    imageUrl: IMG_OBSIDIAN,
  },
];

export const INITIAL_STATE: AppState = {
  auth: {
    isAuthenticated: false,
    role: 'investor',
    userName: 'Ankit Yadav',
    phone: '8571086754',
  },
  userId: '8571086754',
  accountStatus: 'active',
  balance: 1850,
  referralCode: 'BE6K49R0',
  bankDetails: {
    accountHolderName: 'Ankit Yadav',
    accountNumber: '91850011226754',
    ifscCode: 'SBIN0004821',
  },
  activePlans: INITIAL_SEED_PLANS,
  transactions: [
    {
      id: 'tx-seed-1',
      userId: '8571086754',
      userName: 'Ankit Yadav',
      userLabel: 'Ankit Yadav',
      description: 'Daily Yield (BE6 Essential)',
      kind: 'yield',
      amount: 60,
      isCredit: true,
      timestamp: '2026-11-19T12:15:00.000Z',
      isOwn: true,
    },
    {
      id: 'tx-seed-2',
      userId: '8571086754',
      userName: 'Ankit Yadav',
      userLabel: 'Ankit Yadav',
      description: 'Purchased BE6 Essential',
      kind: 'purchase',
      amount: 250,
      isCredit: false,
      timestamp: '2026-11-18T10:15:00.000Z',
      isOwn: true,
    },
    {
      id: 'tx-seed-3',
      userId: '8571086754',
      userName: 'Ankit Yadav',
      userLabel: 'Ankit Yadav',
      description: 'Completed BE6 Pack One Cycle',
      kind: 'yield',
      amount: 1500,
      isCredit: true,
      timestamp: '2026-11-16T18:00:00.000Z',
      isOwn: true,
    },
  ],
  rechargeRequests: [
    {
      id: 'req-seed-1',
      userId: '9812004512',
      userName: 'Rohan Sharma',
      amount: 900,
      method: 'QR_CODE',
      utrNumber: '432198765410',
      status: 'pending',
      createdAt: '2026-11-20T07:50:00.000Z',
    },
  ],
  withdrawalRequests: [],
  lastCheckInDate: null,
  lastCheckInReward: null,
  referralMembers: [
    {
      id: 'ref-seed-1',
      userId: '9812004512',
      userName: 'Rohan Sharma',
      maskedPhone: '9812004512',
      level: 1,
      rechargeAmount: 500,
      commissionEarned: 200,
      joinedAt: '2026-11-18T11:30:00.000Z',
    },
  ],
  darkMode: false,
  passwordHash: '123456',
  settings: DEFAULT_PLATFORM_SETTINGS,
  plansCatalog: INVESTMENT_PLANS,
};

export function createInitialDatabase(): PlatformDatabase {
  const ankit: UserAccount = {
    userId: '8571086754',
    userName: 'Ankit Yadav',
    passwordHash: '123456',
    accountStatus: 'active',
    balance: 1850,
    referralCode: 'BE6K49R0',
    referredByCode: null,
    bankDetails: {
      accountHolderName: 'Ankit Yadav',
      accountNumber: '91850011226754',
      ifscCode: 'SBIN0004821',
    },
    activePlans: INITIAL_SEED_PLANS.map((p) => ({ ...p })),
    transactions: INITIAL_STATE.transactions.map((t) => ({ ...t })),
    lastCheckInDate: null,
    lastCheckInReward: null,
    referralMembers: INITIAL_STATE.referralMembers.map((r) => ({ ...r })),
    darkMode: false,
    createdAt: '2026-11-01T08:30:00.000Z',
    lastLoginAt: '2026-11-19T14:20:00.000Z',
  };

  const rohan: UserAccount = {
    userId: '9812004512',
    userName: 'Rohan Sharma',
    passwordHash: '123456',
    accountStatus: 'active',
    balance: 640,
    referralCode: 'BE6R88M2',
    referredByCode: 'BE6K49R0',
    bankDetails: {
      accountHolderName: 'Rohan Sharma',
      accountNumber: '33219900441122',
      ifscCode: 'HDFC0001482',
    },
    activePlans: [
      {
        id: 'rohan-plan-1',
        planId: 'normal-b',
        name: 'BE6 Titanium Luxe',
        modelName: 'Mahindra BE6 Liquid Silver',
        dailyIncome: 120,
        totalIncome: 3000,
        durationDays: 25,
        investmentAmount: 500,
        purchasedAt: '2026-11-18T11:45:00.000Z',
        daysClaimed: 2,
        lastClaimDate: '2026-11-20',
        imageUrl: IMG_TITANIUM,
      },
    ],
    transactions: [
      {
        id: 'tx-rohan-1',
        userId: '9812004512',
        userName: 'Rohan Sharma',
        userLabel: 'Rohan Sharma',
        description: 'Purchased BE6 Titanium Luxe',
        kind: 'purchase',
        amount: 500,
        isCredit: false,
        timestamp: '2026-11-18T11:45:00.000Z',
        isOwn: true,
      },
    ],
    lastCheckInDate: '2026-11-20',
    lastCheckInReward: 25,
    referralMembers: [],
    darkMode: false,
    createdAt: '2026-11-18T11:30:00.000Z',
    lastLoginAt: '2026-11-20T07:55:00.000Z',
  };

  return {
    users: [ankit, rohan],
    rechargeRequests: [
      {
        id: 'req-seed-1',
        userId: '9812004512',
        userName: 'Rohan Sharma',
        amount: 900,
        method: 'QR_CODE',
        utrNumber: '432198765410',
        status: 'pending',
        createdAt: '2026-11-20T07:50:00.000Z',
      },
    ],
    withdrawalRequests: [],
    settings: { ...DEFAULT_PLATFORM_SETTINGS },
    plans: INVESTMENT_PLANS.map((p) => ({ ...p })),
  };
}

export function getActiveOngoingPlans(plans: ActivePlan[]): ActivePlan[] {
  return plans.filter((p) => p.daysClaimed < p.durationDays);
}

export function getRemainingDurationDays(plan: ActivePlan): number {
  return Math.max(0, plan.durationDays - plan.daysClaimed);
}

export function getPlanStatus(plan: ActivePlan): 'active' | 'completed' {
  return plan.daysClaimed >= plan.durationDays ? 'completed' : 'active';
}

export function userAccountToAppState(
  user: UserAccount,
  db: PlatformDatabase,
  role: UserRole = 'investor',
  isAuthenticated = true,
): AppState {
  return {
    auth: {
      isAuthenticated,
      role,
      userName: user.userName,
      phone: role === 'admin' ? 'ADMIN' : user.userId,
    },
    userId: user.userId,
    accountStatus: user.accountStatus,
    balance: user.balance,
    referralCode: user.referralCode,
    bankDetails: user.bankDetails,
    activePlans: user.activePlans,
    transactions: user.transactions,
    rechargeRequests: db.rechargeRequests,
    withdrawalRequests: db.withdrawalRequests,
    lastCheckInDate: user.lastCheckInDate,
    lastCheckInReward: user.lastCheckInReward,
    referralMembers: user.referralMembers,
    darkMode: user.darkMode,
    passwordHash: user.passwordHash,
    settings: db.settings,
    plansCatalog: db.plans,
  };
}

const LIVE_INVESTOR_PROFILES = [
  { name: 'Aarav M.', city: 'Mumbai', phoneTail: '4821' },
  { name: 'Priya S.', city: 'Pune', phoneTail: '9104' },
  { name: 'Rohan K.', city: 'Bengaluru', phoneTail: '3376' },
  { name: 'Neha G.', city: 'Delhi NCR', phoneTail: '7612' },
  { name: 'Vikram T.', city: 'Jaipur', phoneTail: '2058' },
  { name: 'Kunal P.', city: 'Ahmedabad', phoneTail: '6490' },
  { name: 'Sneha N.', city: 'Kochi', phoneTail: '5183' },
  { name: 'Aditya R.', city: 'Hyderabad', phoneTail: '8934' },
  { name: 'Kavya J.', city: 'Chandigarh', phoneTail: '1247' },
  { name: 'Siddharth B.', city: 'Indore', phoneTail: '5509' },
  { name: 'Meera D.', city: 'Surat', phoneTail: '6732' },
  { name: 'Arjun V.', city: 'Lucknow', phoneTail: '4019' },
];

const REALISTIC_FEED_EVENTS: Array<{
  description: string;
  kind: TransactionKind;
  amount: number;
  isCredit: boolean;
}> = [
  {
    description: 'BE6 Essential Plan Activated · UPI',
    kind: 'purchase',
    amount: 250,
    isCredit: false,
  },
  {
    description: 'BE6 Pack One Activated · Wallet',
    kind: 'purchase',
    amount: 400,
    isCredit: false,
  },
  {
    description: 'BE6 Titanium Luxe Activated · Wallet',
    kind: 'purchase',
    amount: 500,
    isCredit: false,
  },
  {
    description: 'BE6 Velvet GT Activated · Wallet',
    kind: 'purchase',
    amount: 900,
    isCredit: false,
  },
  {
    description: 'UPI Deposit Verified · PhonePe',
    kind: 'recharge',
    amount: 500,
    isCredit: true,
  },
  {
    description: 'UPI Deposit Verified · GPay',
    kind: 'recharge',
    amount: 700,
    isCredit: true,
  },
  {
    description: 'UPI Deposit Verified · Paytm',
    kind: 'recharge',
    amount: 1100,
    isCredit: true,
  },
  {
    description: 'Daily Yield Settled · BE6 Pack One',
    kind: 'yield',
    amount: 100,
    isCredit: true,
  },
  {
    description: 'Daily Yield Settled · BE6 Titanium Luxe',
    kind: 'yield',
    amount: 120,
    isCredit: true,
  },
  {
    description: 'Daily Yield Settled · BE6 Velvet GT',
    kind: 'yield',
    amount: 225,
    isCredit: true,
  },
  {
    description: 'IMPS Bank Payout · HDFC Bank',
    kind: 'withdrawal',
    amount: 600,
    isCredit: false,
  },
  {
    description: 'IMPS Bank Payout · SBI Bank',
    kind: 'withdrawal',
    amount: 960,
    isCredit: false,
  },
  {
    description: 'IMPS Bank Payout · ICICI Bank',
    kind: 'withdrawal',
    amount: 1450,
    isCredit: false,
  },
];

export function generateRandomLiveTransaction(
  tick: number,
  nowIso: string,
): Transaction {
  const profile =
    LIVE_INVESTOR_PROFILES[
      Math.floor(Math.random() * LIVE_INVESTOR_PROFILES.length)
    ];
  const event =
    REALISTIC_FEED_EVENTS[
      Math.floor(Math.random() * REALISTIC_FEED_EVENTS.length)
    ];
  const refTag = String(Math.floor(1100 + Math.random() * 8800));
  return {
    id: `tx-live-${tick}-${Math.random().toString(36).slice(2, 7)}`,
    userLabel: `${profile.name} (${profile.city})`,
    description: `${event.description} · #${refTag}`,
    kind: event.kind,
    amount: event.amount,
    isCredit: event.isCredit,
    timestamp: nowIso,
  };
}

export function createInitialLiveFeed(ownTransactions: Transaction[]): Transaction[] {
  const now = Date.now();
  const offsetsSec = [4, 14, 29, 51, 86, 134];
  const seeded = offsetsSec.map((sec, idx) => {
    const profile = LIVE_INVESTOR_PROFILES[(idx * 3 + 1) % LIVE_INVESTOR_PROFILES.length];
    const event = REALISTIC_FEED_EVENTS[(idx * 2 + 4) % REALISTIC_FEED_EVENTS.length];
    return {
      id: `tx-init-${idx}-${profile.phoneTail}`,
      userLabel: `${profile.name} (${profile.city})`,
      description: `${event.description} · #${profile.phoneTail}`,
      kind: event.kind,
      amount: event.amount,
      isCredit: event.isCredit,
      timestamp: new Date(now - sec * 1000).toISOString(),
    };
  });
  return [...ownTransactions.slice(0, 3), ...seeded]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 20);
}

export function formatRelativeTime(isoTimestamp: string, nowMs = Date.now()): string {
  const diffSec = Math.max(0, Math.floor((nowMs - new Date(isoTimestamp).getTime()) / 1000));
  if (diffSec < 4) return 'Just now';
  if (diffSec < 60) return `${diffSec}s ago`;
  const mins = Math.floor(diffSec / 60);
  if (mins < 60) return `${mins}m ago`;
  return new Date(isoTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function getMinWithdrawalAmount(activePlans: ActivePlan[]): number {
  const ongoing = getActiveOngoingPlans(activePlans);
  const source = ongoing.length > 0 ? ongoing : activePlans;
  const totalDailyIncome = source.reduce((sum, p) => sum + p.dailyIncome, 0);
  if (totalDailyIncome <= 0) {
    return FALLBACK_STARTER_DAILY_INCOME * 4;
  }
  return totalDailyIncome * 4;
}

export interface WithdrawalVerificationInfo {
  activePrincipal: number;
  freeThreshold: number;
  alreadyClaimed: number;
  remainingFreeAllowance: number;
  hasVerifiedPrincipal: boolean;
  requiresVerificationPayment: boolean;
  requiredClaimFee: number;
}

export function getActivePrincipalAmount(activePlans: ActivePlan[]): number {
  const ongoing = getActiveOngoingPlans(activePlans);
  const source = ongoing.length > 0 ? ongoing : activePlans;
  const totalInvestment = source.reduce(
    (sum, p) => sum + p.investmentAmount,
    0,
  );
  return totalInvestment > 0 ? totalInvestment : 250;
}

// Direct IMPS withdrawals are free up to 3x the user's active principal.
// Claiming more than 3x principal (single or cumulative before verification)
// requires a one-time verification deposit equal to 1x the active principal.
export function getWithdrawalVerificationInfo(
  withdrawalAmount: number,
  activePlans: ActivePlan[],
  withdrawalRequests: WithdrawalRequest[] = [],
  userId?: string,
): WithdrawalVerificationInfo {
  const activePrincipal = getActivePrincipalAmount(activePlans);
  const freeThreshold = Math.round(activePrincipal * 3 * 100) / 100;
  const userRequests = withdrawalRequests.filter(
    (w) => (!userId || w.userId === userId) && w.status !== 'rejected',
  );
  const hasVerifiedPrincipal = userRequests.some(
    (w) => w.status === 'approved' && w.claimFeeAmount > 0,
  );
  const alreadyClaimed =
    Math.round(
      userRequests.reduce((sum, w) => sum + w.withdrawalAmount, 0) * 100,
    ) / 100;
  const remainingFreeAllowance = hasVerifiedPrincipal
    ? Number.POSITIVE_INFINITY
    : Math.max(0, Math.round((freeThreshold - alreadyClaimed) * 100) / 100);
  const safeAmount =
    Number.isFinite(withdrawalAmount) && withdrawalAmount > 0
      ? withdrawalAmount
      : 0;
  const requiresVerificationPayment =
    !hasVerifiedPrincipal && safeAmount > remainingFreeAllowance;
  return {
    activePrincipal,
    freeThreshold,
    alreadyClaimed,
    remainingFreeAllowance,
    hasVerifiedPrincipal,
    requiresVerificationPayment,
    requiredClaimFee: requiresVerificationPayment ? activePrincipal : 0,
  };
}

export function getRequiredWithdrawalClaimFee(
  activePlans: ActivePlan[],
  withdrawalAmount?: number,
  withdrawalRequests: WithdrawalRequest[] = [],
  userId?: string,
): number {
  if (withdrawalAmount === undefined) {
    return getActivePrincipalAmount(activePlans);
  }
  return getWithdrawalVerificationInfo(
    withdrawalAmount,
    activePlans,
    withdrawalRequests,
    userId,
  ).requiredClaimFee;
}

export function formatINR(amount: number, showDecimals = false): string {
  const safe = Number.isFinite(amount) ? amount : 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  }).format(safe);
}

export function maskAccountNumber(accountNumber: string): string {
  const clean = accountNumber.trim();
  if (clean.length <= 8) {
    return clean;
  }
  const start = clean.slice(0, 4);
  const end = clean.slice(-4);
  return `${start}••••••${end}`;
}

export function getGreeting(hour: number): string {
  if (hour >= 5 && hour < 12) return 'Good Morning';
  if (hour >= 12 && hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

export function getTodayDateString(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function validateBankDetails(details: BankDetails): {
  valid: boolean;
  errors: Partial<Record<keyof BankDetails, string>>;
} {
  const errors: Partial<Record<keyof BankDetails, string>> = {};
  if (details.accountHolderName.trim().length < 2) {
    errors.accountHolderName = 'Enter the full account holder name.';
  }
  const acctDigits = details.accountNumber.replace(/\s+/g, '');
  if (!/^\d{9,18}$/.test(acctDigits)) {
    errors.accountNumber = 'Account number must be 9 to 18 digits.';
  }
  const ifsc = details.ifscCode.trim().toUpperCase();
  if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc)) {
    errors.ifscCode = 'Enter a valid 11-character IFSC code (e.g. SBIN0004821).';
  }
  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateUtrSubmission(
  amount: number,
  utrNumber: string,
): { valid: boolean; error?: string } {
  if (!Number.isFinite(amount) || amount < 100) {
    return { valid: false, error: 'Minimum UPI payment amount is ₹100.' };
  }
  if (amount > 50000) {
    return { valid: false, error: 'Maximum single UPI payment is ₹50,000.' };
  }
  const cleanUtr = utrNumber.trim().toUpperCase();
  if (!/^[A-Z0-9]{10,22}$/.test(cleanUtr)) {
    return {
      valid: false,
      error: 'Enter a valid 10–22 character UTR / UPI reference number.',
    };
  }
  return { valid: true };
}

export function validateWithdrawal(
  amount: number,
  balance: number,
  activePlans: ActivePlan[],
  bank: BankDetails | null,
  accountStatus: AccountStatus = 'active',
  maxWithdrawal = MAX_WITHDRAWAL,
  withdrawalRequests: WithdrawalRequest[] = [],
  userId?: string,
): {
  valid: boolean;
  minRequired: number;
  claimFee: number;
  requiresPayment: boolean;
  verification: WithdrawalVerificationInfo;
  error?: string;
} {
  const minRequired = getMinWithdrawalAmount(activePlans);
  const verification = getWithdrawalVerificationInfo(
    amount,
    activePlans,
    withdrawalRequests,
    userId,
  );
  const claimFee = verification.requiredClaimFee;
  const requiresPayment = verification.requiresVerificationPayment;

  if (accountStatus === 'suspended') {
    return {
      valid: false,
      minRequired,
      claimFee,
      requiresPayment,
      verification,
      error: 'Your account is currently suspended by Admin.',
    };
  }
  if (!bank) {
    return {
      valid: false,
      minRequired,
      claimFee,
      requiresPayment,
      verification,
      error: 'Please add your bank account details before withdrawing.',
    };
  }
  if (activePlans.length === 0) {
    return {
      valid: false,
      minRequired,
      claimFee,
      requiresPayment,
      verification,
      error: `Activate at least one Mahindra BE6 plan first (min withdrawal: 4 days income ${formatINR(minRequired)}).`,
    };
  }
  if (balance < minRequired) {
    return {
      valid: false,
      minRequired,
      claimFee,
      requiresPayment,
      verification,
      error: `Withdrawable balance must reach 4 days income (${formatINR(minRequired)}) before withdrawing.`,
    };
  }
  if (!Number.isFinite(amount) || amount < minRequired) {
    return {
      valid: false,
      minRequired,
      claimFee,
      requiresPayment,
      verification,
      error: `Minimum withdrawal is 4 days income (${formatINR(minRequired)}).`,
    };
  }
  if (amount > maxWithdrawal) {
    return {
      valid: false,
      minRequired,
      claimFee,
      requiresPayment,
      verification,
      error: `Maximum withdrawal per request is ${formatINR(maxWithdrawal)}.`,
    };
  }
  if (amount > balance) {
    return {
      valid: false,
      minRequired,
      claimFee,
      requiresPayment,
      verification,
      error: 'Insufficient withdrawable balance.',
    };
  }
  return { valid: true, minRequired, claimFee, requiresPayment, verification };
}

export function applySubmitUtrRecharge(
  state: AppState,
  amount: number,
  method: PaymentMethod,
  utrNumber: string,
  nowIso: string,
): { nextState: AppState; request?: RechargeRequest; error?: string } {
  const check = validateUtrSubmission(amount, utrNumber);
  if (!check.valid) {
    return { nextState: state, error: check.error };
  }
  const cleanUtr = utrNumber.trim().toUpperCase();
  const duplicate =
    state.rechargeRequests.some((r) => r.utrNumber.toUpperCase() === cleanUtr) ||
    state.withdrawalRequests.some(
      (w) => w.utrNumber.toUpperCase() === cleanUtr,
    );
  if (duplicate) {
    return {
      nextState: state,
      error: 'This UTR number has already been submitted.',
    };
  }
  const rounded = Math.round(amount * 100) / 100;
  const req: RechargeRequest = {
    id: `req-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    userId: state.userId,
    userName: state.auth.userName,
    amount: rounded,
    method,
    utrNumber: cleanUtr,
    status: 'pending',
    createdAt: nowIso,
  };
  return {
    request: req,
    nextState: {
      ...state,
      rechargeRequests: [req, ...state.rechargeRequests],
    },
  };
}

export function applyAdminReviewRecharge(
  state: AppState,
  requestId: string,
  decision: 'approved' | 'rejected',
  nowIso: string,
  rejectionReason?: string,
): { nextState: AppState; reviewed?: RechargeRequest; error?: string } {
  const target = state.rechargeRequests.find((r) => r.id === requestId);
  if (!target) {
    return { nextState: state, error: 'Recharge request not found.' };
  }
  if (target.status !== 'pending') {
    return {
      nextState: state,
      error: `Request already marked as ${target.status}.`,
    };
  }

  const updatedTarget: RechargeRequest = {
    ...target,
    status: decision,
    reviewedAt: nowIso,
    rejectionReason: decision === 'rejected' ? rejectionReason : undefined,
  };

  const updatedRequests = state.rechargeRequests.map((r) =>
    r.id === requestId ? updatedTarget : r,
  );

  if (decision === 'rejected') {
    return {
      reviewed: updatedTarget,
      nextState: {
        ...state,
        rechargeRequests: updatedRequests,
      },
    };
  }

  const creditsCurrentUser = target.userId === state.userId;
  const tx: Transaction = {
    id: `tx-rec-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    userId: target.userId,
    userName: target.userName,
    userLabel: target.userName || target.userId,
    description: `UTR ${target.utrNumber} Verified`,
    kind: 'recharge',
    amount: target.amount,
    isCredit: true,
    timestamp: nowIso,
    isOwn: creditsCurrentUser,
  };

  return {
    reviewed: updatedTarget,
    nextState: {
      ...state,
      balance: creditsCurrentUser
        ? Math.round((state.balance + target.amount) * 100) / 100
        : state.balance,
      rechargeRequests: updatedRequests,
      transactions: [tx, ...state.transactions],
    },
  };
}

// Direct IMPS withdrawal up to 3x principal needs ₹0 verification payment.
// Withdrawals exceeding 3x active principal require a one-time 1x principal match via UPI + UTR.
export function applySubmitWithdrawalClaim(
  state: AppState,
  withdrawalAmount: number,
  method: PaymentMethod,
  utrNumber: string,
  nowIso: string,
): { nextState: AppState; request?: WithdrawalRequest; error?: string } {
  const maxW = state.settings?.maxWithdrawalAmount ?? MAX_WITHDRAWAL;
  const check = validateWithdrawal(
    withdrawalAmount,
    state.balance,
    state.activePlans,
    state.bankDetails,
    state.accountStatus,
    maxW,
    state.withdrawalRequests,
    state.userId,
  );
  if (!check.valid) {
    return { nextState: state, error: check.error };
  }

  let effectiveMethod: PaymentMethod = 'DIRECT_IMPS';
  let effectiveUtr = 'DIRECT-IMPS';

  if (check.requiresPayment) {
    const utrCheck = validateUtrSubmission(check.claimFee, utrNumber);
    if (!utrCheck.valid) {
      return { nextState: state, error: utrCheck.error };
    }
    const cleanUtr = utrNumber.trim().toUpperCase();
    const duplicate =
      state.rechargeRequests.some((r) => r.utrNumber.toUpperCase() === cleanUtr) ||
      state.withdrawalRequests.some(
        (w) =>
          w.utrNumber !== 'DIRECT-IMPS' &&
          w.utrNumber.toUpperCase() === cleanUtr,
      );
    if (duplicate) {
      return {
        nextState: state,
        error: 'This UTR number has already been submitted.',
      };
    }
    effectiveMethod = method === 'QR_CODE' ? 'QR_CODE' : 'UPI_ID';
    effectiveUtr = cleanUtr;
  }

  const roundedWithdraw = Math.round(withdrawalAmount * 100) / 100;
  const req: WithdrawalRequest = {
    id: `wd-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    userId: state.userId,
    userName: state.auth.userName,
    withdrawalAmount: roundedWithdraw,
    claimFeeAmount: check.claimFee,
    method: effectiveMethod,
    utrNumber: effectiveUtr,
    bankDetails: state.bankDetails!,
    status: 'pending',
    createdAt: nowIso,
  };

  const tx: Transaction = {
    id: `tx-wd-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    userId: state.userId,
    userName: state.auth.userName,
    userLabel: state.auth.userName,
    description:
      check.claimFee > 0
        ? `High-Value Payout (${formatINR(check.claimFee)} UTR ${effectiveUtr})`
        : 'Direct IMPS Payout Request',
    kind: 'withdrawal',
    amount: roundedWithdraw,
    isCredit: false,
    timestamp: nowIso,
    isOwn: true,
  };

  return {
    request: req,
    nextState: {
      ...state,
      balance: Math.round((state.balance - roundedWithdraw) * 100) / 100,
      withdrawalRequests: [req, ...state.withdrawalRequests],
      transactions: [tx, ...state.transactions],
    },
  };
}

export function applyAdminReviewWithdrawal(
  state: AppState,
  requestId: string,
  decision: 'approved' | 'rejected',
  nowIso: string,
  rejectionReason?: string,
): { nextState: AppState; reviewed?: WithdrawalRequest; error?: string } {
  const target = state.withdrawalRequests.find((w) => w.id === requestId);
  if (!target) {
    return { nextState: state, error: 'Withdrawal request not found.' };
  }
  if (target.status !== 'pending') {
    return {
      nextState: state,
      error: `Withdrawal already marked as ${target.status}.`,
    };
  }

  const updatedTarget: WithdrawalRequest = {
    ...target,
    status: decision,
    reviewedAt: nowIso,
    rejectionReason: decision === 'rejected' ? rejectionReason : undefined,
  };

  const updatedWithdrawals = state.withdrawalRequests.map((w) =>
    w.id === requestId ? updatedTarget : w,
  );

  if (decision === 'approved') {
    return {
      reviewed: updatedTarget,
      nextState: {
        ...state,
        withdrawalRequests: updatedWithdrawals,
      },
    };
  }

  const refundTx: Transaction = {
    id: `tx-wdr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    userId: target.userId,
    userName: target.userName,
    userLabel: target.userName || target.userId,
    description: `Withdrawal Refunded (UTR ${target.utrNumber} Rejected)`,
    kind: 'admin',
    amount: target.withdrawalAmount,
    isCredit: true,
    timestamp: nowIso,
    isOwn: target.userId === state.userId,
  };

  return {
    reviewed: updatedTarget,
    nextState: {
      ...state,
      balance:
        target.userId === state.userId
          ? Math.round((state.balance + target.withdrawalAmount) * 100) / 100
          : state.balance,
      withdrawalRequests: updatedWithdrawals,
      transactions: [refundTx, ...state.transactions],
    },
  };
}

// Admin Full Control Actions (Single-state helpers preserved for tests & UI)
export function applyAdminAdjustBalance(
  state: AppState,
  amount: number,
  mode: 'credit' | 'debit' | 'set',
  note: string,
  nowIso: string,
): { nextState: AppState; error?: string } {
  if (!Number.isFinite(amount) || amount < 0) {
    return { nextState: state, error: 'Enter a valid non-negative amount.' };
  }
  if (mode === 'debit' && amount > state.balance) {
    return { nextState: state, error: 'Debit exceeds user wallet balance.' };
  }

  let newBalance = state.balance;
  let txAmount = amount;
  let isCredit = true;
  if (mode === 'credit') {
    newBalance = Math.round((state.balance + amount) * 100) / 100;
  } else if (mode === 'debit') {
    newBalance = Math.round((state.balance - amount) * 100) / 100;
    isCredit = false;
  } else {
    newBalance = Math.round(amount * 100) / 100;
    txAmount = Math.abs(newBalance - state.balance);
    isCredit = newBalance >= state.balance;
  }

  const tx: Transaction = {
    id: `tx-adm-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    userId: state.userId,
    userName: state.auth.userName,
    userLabel: state.auth.userName,
    description: note.trim() || `Admin Balance ${mode.toUpperCase()}`,
    kind: 'admin',
    amount: txAmount,
    isCredit,
    timestamp: nowIso,
    isOwn: true,
  };

  return {
    nextState: {
      ...state,
      balance: newBalance,
      transactions:
        txAmount > 0 ? [tx, ...state.transactions] : state.transactions,
    },
  };
}

export function applyAdminUpdateUserDetails(
  state: AppState,
  updates: {
    userName?: string;
    passwordHash?: string;
    accountStatus?: AccountStatus;
    bankDetails?: BankDetails;
  },
): { nextState: AppState; error?: string } {
  if (updates.userName !== undefined && updates.userName.trim().length < 2) {
    return { nextState: state, error: 'User name must be at least 2 characters.' };
  }
  if (
    updates.passwordHash !== undefined &&
    updates.passwordHash.trim().length < 6
  ) {
    return {
      nextState: state,
      error: 'Password must be at least 6 characters.',
    };
  }
  let nextBank = state.bankDetails;
  if (updates.bankDetails) {
    const cleanBank: BankDetails = {
      accountHolderName: updates.bankDetails.accountHolderName.trim(),
      accountNumber: updates.bankDetails.accountNumber.replace(/\s+/g, ''),
      ifscCode: updates.bankDetails.ifscCode.trim().toUpperCase(),
    };
    const bankCheck = validateBankDetails(cleanBank);
    if (!bankCheck.valid) {
      return {
        nextState: state,
        error: Object.values(bankCheck.errors)[0] || 'Invalid bank details.',
      };
    }
    nextBank = cleanBank;
  }

  return {
    nextState: {
      ...state,
      accountStatus: updates.accountStatus ?? state.accountStatus,
      passwordHash: updates.passwordHash?.trim() ?? state.passwordHash,
      bankDetails: nextBank,
      auth: {
        ...state.auth,
        userName: updates.userName?.trim() ?? state.auth.userName,
      },
    },
  };
}

export function applyAdminGrantPlan(
  state: AppState,
  planId: string,
  nowIso: string,
): { nextState: AppState; error?: string } {
  const catalog = state.plansCatalog ?? INVESTMENT_PLANS;
  const plan = catalog.find((p) => p.id === planId);
  if (!plan) {
    return { nextState: state, error: 'Selected plan not found.' };
  }
  const granted: ActivePlan = {
    id: `ap-adm-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    planId: plan.id,
    name: plan.name,
    modelName: plan.modelName,
    dailyIncome: plan.dailyIncome,
    totalIncome: plan.totalIncome,
    durationDays: plan.durationDays,
    investmentAmount: plan.investmentAmount,
    purchasedAt: nowIso,
    daysClaimed: 0,
    lastClaimDate: null,
    imageUrl: plan.imageUrl,
  };
  const tx: Transaction = {
    id: `tx-adm-plan-${Date.now()}`,
    userId: state.userId,
    userName: state.auth.userName,
    userLabel: state.auth.userName,
    description: `Admin Granted ${plan.name}`,
    kind: 'admin',
    amount: plan.investmentAmount,
    isCredit: true,
    timestamp: nowIso,
    isOwn: true,
  };
  return {
    nextState: {
      ...state,
      activePlans: [granted, ...state.activePlans],
      transactions: [tx, ...state.transactions],
    },
  };
}

export function applyAdminRemovePlan(
  state: AppState,
  activePlanId: string,
): AppState {
  return {
    ...state,
    activePlans: state.activePlans.filter((p) => p.id !== activePlanId),
  };
}

export function applyPurchasePlan(
  state: AppState,
  plan: InvestmentPlan,
  nowIso: string,
): { nextState: AppState; error?: string } {
  if (state.accountStatus === 'suspended') {
    return {
      nextState: state,
      error: 'Account suspended. Contact Admin.',
    };
  }
  if (state.balance < plan.investmentAmount) {
    return {
      nextState: state,
      error: `Insufficient balance. Need ${formatINR(plan.investmentAmount)} to activate ${plan.name}.`,
    };
  }
  const activePlan: ActivePlan = {
    id: `ap-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    planId: plan.id,
    name: plan.name,
    modelName: plan.modelName,
    dailyIncome: plan.dailyIncome,
    totalIncome: plan.totalIncome,
    durationDays: plan.durationDays,
    investmentAmount: plan.investmentAmount,
    purchasedAt: nowIso,
    daysClaimed: 0,
    lastClaimDate: null,
    imageUrl: plan.imageUrl,
  };
  const tx: Transaction = {
    id: `tx-buy-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    userId: state.userId,
    userName: state.auth.userName,
    userLabel: state.auth.userName,
    description: `Purchased ${plan.name}`,
    kind: 'purchase',
    amount: plan.investmentAmount,
    isCredit: false,
    timestamp: nowIso,
    isOwn: true,
  };
  return {
    nextState: {
      ...state,
      balance: Math.round((state.balance - plan.investmentAmount) * 100) / 100,
      activePlans: [activePlan, ...state.activePlans],
      transactions: [tx, ...state.transactions],
    },
  };
}

export function applyDailyCheckIn(
  state: AppState,
  code: string,
  todayDateStr: string,
  nowIso: string,
): { nextState: AppState; reward?: number; error?: string } {
  const expectedCode =
    state.settings?.dailyCheckInCode ?? DAILY_CHECKIN_CODE;
  const rewardAmount = state.settings?.checkInRewardAmount ?? 25;
  if (state.lastCheckInDate === todayDateStr) {
    return {
      nextState: state,
      error: 'Daily bonus already claimed today. Come back after 12:00 AM.',
    };
  }
  const normalized = code.trim().toUpperCase();
  const isOneTapDaily = normalized === '' || normalized === 'DAILY';
  if (!isOneTapDaily && normalized !== expectedCode.toUpperCase()) {
    return {
      nextState: state,
      error: `Invalid bonus code. Leave blank for 1-tap daily bonus or enter ${expectedCode}.`,
    };
  }
  const tx: Transaction = {
    id: `tx-chk-${Date.now()}`,
    userId: state.userId,
    userName: state.auth.userName,
    userLabel: state.auth.userName,
    description: 'Daily Check-In Reward',
    kind: 'checkin',
    amount: rewardAmount,
    isCredit: true,
    timestamp: nowIso,
    isOwn: true,
  };
  return {
    reward: rewardAmount,
    nextState: {
      ...state,
      balance: Math.round((state.balance + rewardAmount) * 100) / 100,
      lastCheckInDate: todayDateStr,
      lastCheckInReward: rewardAmount,
      transactions: [tx, ...state.transactions],
    },
  };
}

export function applyClaimDailyYield(
  state: AppState,
  activePlanId: string,
  todayDateStr: string,
  nowIso: string,
): { nextState: AppState; earned?: number; error?: string } {
  const target = state.activePlans.find((p) => p.id === activePlanId);
  if (!target) {
    return { nextState: state, error: 'Active plan not found.' };
  }
  if (target.daysClaimed >= target.durationDays) {
    return { nextState: state, error: 'This plan has completed its duration.' };
  }
  if (target.lastClaimDate === todayDateStr) {
    return {
      nextState: state,
      error: 'Today’s yield has already been claimed for this BE6 vehicle.',
    };
  }
  const earned = target.dailyIncome;
  const updatedPlans = state.activePlans.map((p) =>
    p.id === activePlanId
      ? { ...p, daysClaimed: p.daysClaimed + 1, lastClaimDate: todayDateStr }
      : p,
  );
  const tx: Transaction = {
    id: `tx-yld-${Date.now()}`,
    userId: state.userId,
    userName: state.auth.userName,
    userLabel: state.auth.userName,
    description: `Daily Yield (${target.name})`,
    kind: 'yield',
    amount: earned,
    isCredit: true,
    timestamp: nowIso,
    isOwn: true,
  };
  return {
    earned,
    nextState: {
      ...state,
      balance: Math.round((state.balance + earned) * 100) / 100,
      activePlans: updatedPlans,
      transactions: [tx, ...state.transactions],
    },
  };
}

export function applySaveBankDetails(
  state: AppState,
  details: BankDetails,
): { nextState: AppState; error?: string } {
  const clean: BankDetails = {
    accountHolderName: details.accountHolderName.trim(),
    accountNumber: details.accountNumber.replace(/\s+/g, ''),
    ifscCode: details.ifscCode.trim().toUpperCase(),
  };
  const check = validateBankDetails(clean);
  if (!check.valid) {
    const firstErr = Object.values(check.errors)[0] || 'Invalid bank details.';
    return { nextState: state, error: firstErr };
  }
  return {
    nextState: {
      ...state,
      bankDetails: clean,
    },
  };
}

export function applyUpdatePassword(
  state: AppState,
  currentPwd: string,
  newPwd: string,
): { nextState: AppState; error?: string } {
  if (currentPwd !== state.passwordHash) {
    return { nextState: state, error: 'Current password is incorrect.' };
  }
  if (newPwd.trim().length < 6) {
    return {
      nextState: state,
      error: 'New password must be at least 6 characters.',
    };
  }
  return {
    nextState: {
      ...state,
      passwordHash: newPwd.trim(),
    },
  };
}

// Unified Portal Login: same identifier + password portal authenticates BOTH Admin and Investors
export function applyLogin(
  state: AppState,
  identifier: string,
  password: string,
  explicitRole?: UserRole,
): { nextState: AppState; error?: string } {
  const cleanId = identifier.trim();
  const adminPwd = state.settings?.adminPassword ?? 'admin123';
  const isAdminId =
    cleanId.toLowerCase() === 'admin' || cleanId === '9999999999';

  if (explicitRole === 'admin' || isAdminId) {
    if (!isAdminId || password !== adminPwd) {
      return {
        nextState: state,
        error: 'Invalid admin credentials.',
      };
    }
    return {
      nextState: {
        ...state,
        auth: {
          isAuthenticated: true,
          role: 'admin',
          userName: 'Fleet Administrator',
          phone: 'ADMIN',
        },
      },
    };
  }

  if (!/^\d{10}$/.test(cleanId)) {
    return {
      nextState: state,
      error: 'Enter a valid 10-digit mobile number or Admin ID.',
    };
  }
  if (password !== state.passwordHash) {
    return {
      nextState: state,
      error: 'Incorrect password.',
    };
  }
  if (state.accountStatus === 'suspended') {
    return {
      nextState: state,
      error: 'Your account is suspended. Please contact Fleet Admin.',
    };
  }
  return {
    nextState: {
      ...state,
      userId: cleanId,
      auth: {
        isAuthenticated: true,
        role: 'investor',
        userName: state.bankDetails?.accountHolderName ?? state.auth.userName,
        phone: cleanId,
      },
    },
  };
}

export function applyRegister(
  state: AppState,
  name: string,
  phone: string,
  password: string,
  nowIso: string,
): { nextState: AppState; error?: string } {
  if (name.trim().length < 2) {
    return { nextState: state, error: 'Enter your full name.' };
  }
  if (!/^\d{10}$/.test(phone.trim())) {
    return { nextState: state, error: 'Enter a valid 10-digit mobile number.' };
  }
  if (password.trim().length < 6) {
    return {
      nextState: state,
      error: 'Password must be at least 6 characters.',
    };
  }
  const cleanPhone = phone.trim();
  const bonus = state.settings?.signupBonusAmount ?? 40;
  const bonusTx: Transaction = {
    id: `tx-bonus-${Date.now()}`,
    userId: cleanPhone,
    userName: name.trim(),
    userLabel: name.trim(),
    description: 'Welcome Sign-Up Bonus',
    kind: 'bonus',
    amount: bonus,
    isCredit: true,
    timestamp: nowIso,
    isOwn: true,
  };
  return {
    nextState: {
      ...state,
      userId: cleanPhone,
      accountStatus: 'active',
      balance: Math.round((state.balance + bonus) * 100) / 100,
      passwordHash: password.trim(),
      auth: {
        isAuthenticated: true,
        role: 'investor',
        userName: name.trim(),
        phone: cleanPhone,
      },
      transactions: [bonusTx, ...state.transactions],
    },
  };
}

export function applyLogout(state: AppState): AppState {
  return {
    ...state,
    auth: {
      ...state.auth,
      isAuthenticated: false,
    },
  };
}

// Multi-User PlatformDatabase Pure Mutators (used by Express backend)
export function dbAuthenticate(
  db: PlatformDatabase,
  identifier: string,
  password: string,
  nowIso: string,
): {
  ok: boolean;
  role?: UserRole;
  user?: UserAccount;
  db: PlatformDatabase;
  error?: string;
} {
  const cleanId = identifier.trim();
  const isAdmin =
    cleanId.toLowerCase() === 'admin' || cleanId === '9999999999';
  if (isAdmin) {
    if (password !== db.settings.adminPassword) {
      return { ok: false, db, error: 'Invalid admin password.' };
    }
    return { ok: true, role: 'admin', db };
  }

  if (!/^\d{10}$/.test(cleanId)) {
    return {
      ok: false,
      db,
      error: 'Enter a valid 10-digit mobile number.',
    };
  }
  const user = db.users.find((u) => u.userId === cleanId);
  if (!user) {
    return {
      ok: false,
      db,
      error: 'Account not found. Please create an account first.',
    };
  }
  if (user.passwordHash !== password) {
    return { ok: false, db, error: 'Incorrect password.' };
  }
  if (user.accountStatus === 'suspended') {
    return {
      ok: false,
      db,
      error: 'Your account is suspended. Please contact Fleet Admin.',
    };
  }
  if (db.settings.maintenanceMode) {
    return {
      ok: false,
      db,
      error: 'Platform is temporarily in maintenance mode. Please try shortly.',
    };
  }
  const nextDb: PlatformDatabase = {
    ...db,
    users: db.users.map((u) =>
      u.userId === cleanId ? { ...u, lastLoginAt: nowIso } : u,
    ),
  };
  return {
    ok: true,
    role: 'investor',
    user: nextDb.users.find((u) => u.userId === cleanId)!,
    db: nextDb,
  };
}

export function dbRegisterUser(
  db: PlatformDatabase,
  name: string,
  phone: string,
  password: string,
  inviteCode: string | undefined,
  nowIso: string,
): { ok: boolean; user?: UserAccount; db: PlatformDatabase; error?: string } {
  const cleanName = name.trim();
  const cleanPhone = phone.trim();
  const cleanPwd = password.trim();
  if (cleanName.length < 2) {
    return { ok: false, db, error: 'Enter your full name.' };
  }
  if (!/^\d{10}$/.test(cleanPhone)) {
    return { ok: false, db, error: 'Enter a valid 10-digit mobile number.' };
  }
  if (cleanPwd.length < 6) {
    return {
      ok: false,
      db,
      error: 'Password must be at least 6 characters.',
    };
  }
  if (
    db.users.some((u) => u.userId === cleanPhone) ||
    cleanPhone === '9999999999'
  ) {
    return {
      ok: false,
      db,
      error: 'This mobile number is already registered. Please sign in.',
    };
  }

  const refCode = `BE6${cleanPhone.slice(-4)}${Math.random().toString(36).slice(2, 4).toUpperCase()}`;
  const bonus = db.settings.signupBonusAmount;
  const cleanInvite = inviteCode?.trim().toUpperCase() || null;

  const newUser: UserAccount = {
    userId: cleanPhone,
    userName: cleanName,
    passwordHash: cleanPwd,
    accountStatus: 'active',
    balance: bonus,
    referralCode: refCode,
    referredByCode: cleanInvite,
    bankDetails: null,
    activePlans: [],
    transactions: [
      {
        id: `tx-bonus-${Date.now()}`,
        userId: cleanPhone,
        userName: cleanName,
        userLabel: cleanName,
        description: 'Welcome Sign-Up Bonus',
        kind: 'bonus',
        amount: bonus,
        isCredit: true,
        timestamp: nowIso,
        isOwn: true,
      },
    ],
    lastCheckInDate: null,
    lastCheckInReward: null,
    referralMembers: [],
    darkMode: false,
    createdAt: nowIso,
    lastLoginAt: nowIso,
  };

  let nextUsers = [...db.users, newUser];
  if (cleanInvite) {
    nextUsers = nextUsers.map((u) => {
      if (u.referralCode.toUpperCase() !== cleanInvite) return u;
      return {
        ...u,
        referralMembers: [
          ...u.referralMembers,
          {
            id: `ref-${Date.now()}`,
            userId: cleanPhone,
            userName: cleanName,
            maskedPhone: cleanPhone,
            level: 1,
            rechargeAmount: 0,
            commissionEarned: 0,
            joinedAt: nowIso,
          },
        ],
      };
    });
  }

  return {
    ok: true,
    user: newUser,
    db: {
      ...db,
      users: nextUsers,
    },
  };
}

export function computeTeamSummary(
  members: ReferralMember[],
  levelFilter?: 1 | 2 | 3,
) {
  const filtered = levelFilter
    ? members.filter((m) => m.level === levelFilter)
    : members;
  const totalMembers = filtered.length;
  const totalRecharge = filtered.reduce((sum, m) => sum + m.rechargeAmount, 0);
  const totalCommission = filtered.reduce(
    (sum, m) => sum + m.commissionEarned,
    0,
  );
  const commissionRate = levelFilter === 1 || !levelFilter ? 40 : 0;
  return {
    totalMembers,
    totalRecharge,
    totalCommission,
    commissionRate,
  };
}
