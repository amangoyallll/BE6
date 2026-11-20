import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import {
  AccountStatus,
  BankDetails,
  PaymentMethod,
  PlatformDatabase,
  PlatformSettings,
  UserAccount,
  UserRole,
  applyAdminAdjustBalance,
  applyAdminGrantPlan,
  applyAdminRemovePlan,
  applyAdminReviewRecharge,
  applyAdminReviewWithdrawal,
  applyAdminUpdateUserDetails,
  applyClaimDailyYield,
  applyDailyCheckIn,
  applyPurchasePlan,
  applySaveBankDetails,
  applySubmitUtrRecharge,
  applySubmitWithdrawalClaim,
  applyUpdatePassword,
  createInitialDatabase,
  dbAuthenticate,
  dbRegisterUser,
  formatINR,
  getTodayDateString,
  userAccountToAppState,
} from './src/lib/investmentEngine.ts';

const PORT = Number(process.env.PORT || 3000);
const DATA_DIR = path.resolve(process.cwd(), '.data');
const DATA_FILE = path.join(DATA_DIR, 'be6-platform.json');

interface SessionEntry {
  token: string;
  role: UserRole;
  userId: string;
  createdAt: string;
}

const sessions = new Map<string, SessionEntry>();

function loadDatabase(): PlatformDatabase {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf8');
      const parsed = JSON.parse(raw) as PlatformDatabase;
      if (Array.isArray(parsed.users) && parsed.settings && Array.isArray(parsed.plans)) {
        return parsed;
      }
    }
  } catch {
    // Fall back to clean seed database
  }
  const initial = createInitialDatabase();
  saveDatabase(initial);
  return initial;
}

function saveDatabase(db: PlatformDatabase): void {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), 'utf8');
  } catch {
    // Ignore read-only filesystem edge cases
  }
}

let db: PlatformDatabase = loadDatabase();

function issueToken(role: UserRole, userId: string): string {
  const token = crypto.randomBytes(24).toString('hex');
  sessions.set(token, {
    token,
    role,
    userId,
    createdAt: new Date().toISOString(),
  });
  return token;
}

function getAuthSession(req: express.Request): SessionEntry | null {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return null;
  const token = auth.slice(7).trim();
  return sessions.get(token) ?? null;
}

function syncUserIntoDb(userId: string, updatedUser: UserAccount): void {
  db = {
    ...db,
    users: db.users.map((u) => (u.userId === userId ? updatedUser : u)),
  };
}

function extractUserFromAppState(
  prevUser: UserAccount,
  appState: ReturnType<typeof userAccountToAppState>,
): UserAccount {
  return {
    ...prevUser,
    userName: appState.auth.userName,
    accountStatus: appState.accountStatus,
    balance: appState.balance,
    bankDetails: appState.bankDetails,
    activePlans: appState.activePlans,
    transactions: appState.transactions,
    lastCheckInDate: appState.lastCheckInDate,
    lastCheckInReward: appState.lastCheckInReward,
    darkMode: appState.darkMode,
    passwordHash: appState.passwordHash,
  };
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '2mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
  });

  app.get('/api/public-config', (_req, res) => {
    res.json({
      plans: db.plans,
      settings: {
        merchantUpiId: db.settings.merchantUpiId,
        merchantName: db.settings.merchantName,
        signupBonusAmount: db.settings.signupBonusAmount,
        maxWithdrawalAmount: db.settings.maxWithdrawalAmount,
        maintenanceMode: db.settings.maintenanceMode,
      },
    });
  });

  app.post('/api/auth/login', (req, res) => {
    const { identifier, password } = req.body as {
      identifier?: string;
      password?: string;
    };
    const authRes = dbAuthenticate(
      db,
      String(identifier ?? ''),
      String(password ?? ''),
      new Date().toISOString(),
    );
    if (!authRes.ok || !authRes.role) {
      return res.status(401).json({ ok: false, message: authRes.error ?? 'Invalid credentials.' });
    }
    db = authRes.db;
    saveDatabase(db);

    if (authRes.role === 'admin') {
      const token = issueToken('admin', 'ADMIN');
      return res.json({
        ok: true,
        token,
        role: 'admin',
        database: db,
      });
    }

    const user = authRes.user!;
    const token = issueToken('investor', user.userId);
    return res.json({
      ok: true,
      token,
      role: 'investor',
      appState: userAccountToAppState(user, db, 'investor', true),
    });
  });

  app.post('/api/auth/register', (req, res) => {
    const { name, phone, password, inviteCode } = req.body as {
      name?: string;
      phone?: string;
      password?: string;
      inviteCode?: string;
    };
    const regRes = dbRegisterUser(
      db,
      String(name ?? ''),
      String(phone ?? ''),
      String(password ?? ''),
      inviteCode ? String(inviteCode) : undefined,
      new Date().toISOString(),
    );
    if (!regRes.ok || !regRes.user) {
      return res.status(400).json({ ok: false, message: regRes.error ?? 'Registration failed.' });
    }
    db = regRes.db;
    saveDatabase(db);

    const token = issueToken('investor', regRes.user.userId);
    return res.json({
      ok: true,
      token,
      role: 'investor',
      appState: userAccountToAppState(regRes.user, db, 'investor', true),
    });
  });

  app.post('/api/auth/logout', (req, res) => {
    const session = getAuthSession(req);
    if (session) {
      sessions.delete(session.token);
    }
    res.json({ ok: true });
  });

  app.get('/api/session', (req, res) => {
    const session = getAuthSession(req);
    if (!session) {
      return res.status(401).json({ ok: false, message: 'Not authenticated.' });
    }
    if (session.role === 'admin') {
      return res.json({ ok: true, role: 'admin', database: db });
    }
    const user = db.users.find((u) => u.userId === session.userId);
    if (!user || user.accountStatus === 'suspended') {
      sessions.delete(session.token);
      return res.status(401).json({ ok: false, message: 'Account unavailable.' });
    }
    return res.json({
      ok: true,
      role: 'investor',
      appState: userAccountToAppState(user, db, 'investor', true),
    });
  });

  app.post('/api/user/action', (req, res) => {
    const session = getAuthSession(req);
    if (!session || session.role !== 'investor') {
      return res.status(401).json({ ok: false, message: 'Sign in required.' });
    }
    const user = db.users.find((u) => u.userId === session.userId);
    if (!user) {
      return res.status(404).json({ ok: false, message: 'Investor not found.' });
    }

    const { type, payload } = req.body as { type: string; payload?: Record<string, unknown> };
    const currentApp = userAccountToAppState(user, db, 'investor', true);
    const nowIso = new Date().toISOString();

    if (type === 'toggle_theme') {
      const updatedUser: UserAccount = { ...user, darkMode: !user.darkMode };
      syncUserIntoDb(user.userId, updatedUser);
      saveDatabase(db);
      return res.json({
        ok: true,
        message: 'Theme updated.',
        appState: userAccountToAppState(updatedUser, db, 'investor', true),
      });
    }

    if (type === 'purchase_plan') {
      const planId = String(payload?.planId ?? '');
      const plan = db.plans.find((p) => p.id === planId);
      if (!plan) {
        return res.status(400).json({ ok: false, message: 'Plan not found.' });
      }
      const { nextState, error } = applyPurchasePlan(currentApp, plan, nowIso);
      if (error) return res.status(400).json({ ok: false, message: error });
      const updatedUser = extractUserFromAppState(user, nextState);
      syncUserIntoDb(user.userId, updatedUser);
      saveDatabase(db);
      return res.json({
        ok: true,
        message: `${plan.name} (${plan.modelName}) activated!`,
        appState: userAccountToAppState(updatedUser, db, 'investor', true),
      });
    }

    if (type === 'submit_utr') {
      const amount = Number(payload?.amount);
      const method = (payload?.method as PaymentMethod) ?? 'UPI_ID';
      const utrNumber = String(payload?.utrNumber ?? '');
      const { nextState, request, error } = applySubmitUtrRecharge(
        currentApp,
        amount,
        method,
        utrNumber,
        nowIso,
      );
      if (error || !request) return res.status(400).json({ ok: false, message: error });
      db = { ...db, rechargeRequests: nextState.rechargeRequests };
      saveDatabase(db);
      return res.json({
        ok: true,
        message: `UTR ${request.utrNumber} submitted for ${formatINR(amount)}. Pending Admin Verification.`,
        appState: userAccountToAppState(user, db, 'investor', true),
      });
    }

    if (type === 'submit_withdrawal') {
      const withdrawalAmount = Number(payload?.withdrawalAmount);
      const method = (payload?.method as PaymentMethod) ?? 'UPI_ID';
      const utrNumber = String(payload?.utrNumber ?? '');
      const { nextState, request, error } = applySubmitWithdrawalClaim(
        currentApp,
        withdrawalAmount,
        method,
        utrNumber,
        nowIso,
      );
      if (error || !request) return res.status(400).json({ ok: false, message: error });
      const updatedUser = extractUserFromAppState(user, nextState);
      syncUserIntoDb(user.userId, updatedUser);
      db = { ...db, withdrawalRequests: nextState.withdrawalRequests };
      saveDatabase(db);
      return res.json({
        ok: true,
        message:
          request.claimFeeAmount > 0
            ? `High-value payout claim for ${formatINR(withdrawalAmount)} submitted with ${formatINR(request.claimFeeAmount)} UTR ${request.utrNumber}.`
            : `Direct IMPS payout request for ${formatINR(withdrawalAmount)} submitted for Admin approval.`,
        appState: userAccountToAppState(updatedUser, db, 'investor', true),
      });
    }

    if (type === 'daily_checkin') {
      const code = String(payload?.code ?? '');
      const { nextState, reward, error } = applyDailyCheckIn(
        currentApp,
        code,
        getTodayDateString(),
        nowIso,
      );
      if (error) return res.status(400).json({ ok: false, message: error });
      const updatedUser = extractUserFromAppState(user, nextState);
      syncUserIntoDb(user.userId, updatedUser);
      saveDatabase(db);
      return res.json({
        ok: true,
        message: `Daily check-in claimed! ${formatINR(reward ?? 25)} added to wallet.`,
        appState: userAccountToAppState(updatedUser, db, 'investor', true),
      });
    }

    if (type === 'claim_yield') {
      const activePlanId = String(payload?.activePlanId ?? '');
      const { nextState, earned, error } = applyClaimDailyYield(
        currentApp,
        activePlanId,
        getTodayDateString(),
        nowIso,
      );
      if (error) return res.status(400).json({ ok: false, message: error });
      const updatedUser = extractUserFromAppState(user, nextState);
      syncUserIntoDb(user.userId, updatedUser);
      saveDatabase(db);
      return res.json({
        ok: true,
        message: `Credited ${formatINR(earned ?? 0)} daily Mahindra BE6 yield!`,
        appState: userAccountToAppState(updatedUser, db, 'investor', true),
      });
    }

    if (type === 'save_bank') {
      const details = payload?.details as BankDetails;
      const { nextState, error } = applySaveBankDetails(currentApp, details);
      if (error) return res.status(400).json({ ok: false, message: error });
      const updatedUser = extractUserFromAppState(user, nextState);
      syncUserIntoDb(user.userId, updatedUser);
      saveDatabase(db);
      return res.json({
        ok: true,
        message: 'Bank details saved securely.',
        appState: userAccountToAppState(updatedUser, db, 'investor', true),
      });
    }

    if (type === 'update_password') {
      const currentPwd = String(payload?.currentPwd ?? '');
      const newPwd = String(payload?.newPwd ?? '');
      const { nextState, error } = applyUpdatePassword(
        currentApp,
        currentPwd,
        newPwd,
      );
      if (error) return res.status(400).json({ ok: false, message: error });
      const updatedUser = extractUserFromAppState(user, nextState);
      syncUserIntoDb(user.userId, updatedUser);
      saveDatabase(db);
      return res.json({
        ok: true,
        message: 'Security password updated.',
        appState: userAccountToAppState(updatedUser, db, 'investor', true),
      });
    }

    return res.status(400).json({ ok: false, message: 'Unknown action.' });
  });

  app.post('/api/admin/action', (req, res) => {
    const session = getAuthSession(req);
    if (!session || session.role !== 'admin') {
      return res.status(403).json({ ok: false, message: 'Admin authorization required.' });
    }

    const { type, payload } = req.body as { type: string; payload?: Record<string, unknown> };
    const nowIso = new Date().toISOString();

    if (type === 'review_recharge') {
      const requestId = String(payload?.requestId ?? '');
      const decision = payload?.decision as 'approved' | 'rejected';
      const target = db.rechargeRequests.find((r) => r.id === requestId);
      if (!target) return res.status(404).json({ ok: false, message: 'Recharge request not found.' });
      const targetUser = db.users.find((u) => u.userId === target.userId) ?? db.users[0];
      const tempApp = userAccountToAppState(targetUser, db, 'investor', true);
      const { nextState, reviewed, error } = applyAdminReviewRecharge(
        tempApp,
        requestId,
        decision,
        nowIso,
        decision === 'rejected' ? String(payload?.reason ?? 'UTR mismatch') : undefined,
      );
      if (error) return res.status(400).json({ ok: false, message: error });
      if (targetUser.userId === target.userId) {
        syncUserIntoDb(targetUser.userId, extractUserFromAppState(targetUser, nextState));
      }
      db = { ...db, rechargeRequests: nextState.rechargeRequests };
      saveDatabase(db);
      return res.json({
        ok: true,
        message:
          decision === 'approved'
            ? `Approved UTR ${reviewed?.utrNumber} (${formatINR(reviewed?.amount ?? 0)} credited to ${targetUser.userName}).`
            : `Rejected UTR ${reviewed?.utrNumber}.`,
        database: db,
      });
    }

    if (type === 'review_withdrawal') {
      const requestId = String(payload?.requestId ?? '');
      const decision = payload?.decision as 'approved' | 'rejected';
      const target = db.withdrawalRequests.find((w) => w.id === requestId);
      if (!target) return res.status(404).json({ ok: false, message: 'Withdrawal request not found.' });
      const targetUser = db.users.find((u) => u.userId === target.userId) ?? db.users[0];
      const tempApp = userAccountToAppState(targetUser, db, 'investor', true);
      const { nextState, reviewed, error } = applyAdminReviewWithdrawal(
        tempApp,
        requestId,
        decision,
        nowIso,
        decision === 'rejected' ? String(payload?.reason ?? 'Claim UTR mismatch') : undefined,
      );
      if (error) return res.status(400).json({ ok: false, message: error });
      syncUserIntoDb(targetUser.userId, extractUserFromAppState(targetUser, nextState));
      db = { ...db, withdrawalRequests: nextState.withdrawalRequests };
      saveDatabase(db);
      return res.json({
        ok: true,
        message:
          decision === 'approved'
            ? `Released ${formatINR(reviewed?.withdrawalAmount ?? 0)} payout to ${targetUser.userName}.`
            : `Rejected claim & refunded ${formatINR(reviewed?.withdrawalAmount ?? 0)} to ${targetUser.userName}.`,
        database: db,
      });
    }

    if (type === 'adjust_balance') {
      const userId = String(payload?.userId ?? '');
      const user = db.users.find((u) => u.userId === userId);
      if (!user) return res.status(404).json({ ok: false, message: 'User not found.' });
      const tempApp = userAccountToAppState(user, db, 'investor', true);
      const { nextState, error } = applyAdminAdjustBalance(
        tempApp,
        Number(payload?.amount),
        (payload?.mode as 'credit' | 'debit' | 'set') ?? 'credit',
        String(payload?.note ?? ''),
        nowIso,
      );
      if (error) return res.status(400).json({ ok: false, message: error });
      syncUserIntoDb(userId, extractUserFromAppState(user, nextState));
      saveDatabase(db);
      return res.json({
        ok: true,
        message: `Updated ${user.userName} wallet balance to ${formatINR(nextState.balance, true)}.`,
        database: db,
      });
    }

    if (type === 'update_user') {
      const userId = String(payload?.userId ?? '');
      const user = db.users.find((u) => u.userId === userId);
      if (!user) return res.status(404).json({ ok: false, message: 'User not found.' });
      const tempApp = userAccountToAppState(user, db, 'investor', true);
      const { nextState, error } = applyAdminUpdateUserDetails(tempApp, {
        userName: payload?.userName as string | undefined,
        passwordHash: payload?.passwordHash as string | undefined,
        accountStatus: payload?.accountStatus as AccountStatus | undefined,
        bankDetails: payload?.bankDetails as BankDetails | undefined,
      });
      if (error) return res.status(400).json({ ok: false, message: error });
      let updatedUser = extractUserFromAppState(user, nextState);
      if (typeof payload?.referralCode === 'string' && payload.referralCode.trim()) {
        updatedUser = { ...updatedUser, referralCode: payload.referralCode.trim().toUpperCase() };
      }
      syncUserIntoDb(userId, updatedUser);
      saveDatabase(db);
      return res.json({
        ok: true,
        message: `Saved full account updates for ${updatedUser.userName}.`,
        database: db,
      });
    }

    if (type === 'create_user') {
      const name = String(payload?.name ?? '');
      const phone = String(payload?.phone ?? '');
      const password = String(payload?.password ?? '123456');
      const reg = dbRegisterUser(db, name, phone, password, undefined, nowIso);
      if (!reg.ok || !reg.user) return res.status(400).json({ ok: false, message: reg.error });
      const initialBalance = Number(payload?.initialBalance);
      let created = reg.user;
      if (Number.isFinite(initialBalance) && initialBalance >= 0) {
        created = { ...created, balance: initialBalance };
      }
      db = {
        ...reg.db,
        users: reg.db.users.map((u) => (u.userId === created.userId ? created : u)),
      };
      saveDatabase(db);
      return res.json({
        ok: true,
        message: `Created investor ${created.userName} (${created.userId}).`,
        database: db,
      });
    }

    if (type === 'delete_user') {
      const userId = String(payload?.userId ?? '');
      if (db.users.length <= 1) {
        return res.status(400).json({ ok: false, message: 'Cannot delete the last remaining user.' });
      }
      db = {
        ...db,
        users: db.users.filter((u) => u.userId !== userId),
      };
      saveDatabase(db);
      return res.json({
        ok: true,
        message: `Removed user ${userId}.`,
        database: db,
      });
    }

    if (type === 'grant_plan') {
      const userId = String(payload?.userId ?? '');
      const planId = String(payload?.planId ?? '');
      const user = db.users.find((u) => u.userId === userId);
      if (!user) return res.status(404).json({ ok: false, message: 'User not found.' });
      const tempApp = userAccountToAppState(user, db, 'investor', true);
      const { nextState, error } = applyAdminGrantPlan(tempApp, planId, nowIso);
      if (error) return res.status(400).json({ ok: false, message: error });
      syncUserIntoDb(userId, extractUserFromAppState(user, nextState));
      saveDatabase(db);
      return res.json({
        ok: true,
        message: `Granted plan to ${user.userName}.`,
        database: db,
      });
    }

    if (type === 'update_active_plan') {
      const userId = String(payload?.userId ?? '');
      const activePlanId = String(payload?.activePlanId ?? '');
      const daysClaimed = Number(payload?.daysClaimed);
      const durationDays = Number(payload?.durationDays);
      const user = db.users.find((u) => u.userId === userId);
      if (!user) return res.status(404).json({ ok: false, message: 'User not found.' });
      const updatedUser: UserAccount = {
        ...user,
        activePlans: user.activePlans.map((ap) => {
          if (ap.id !== activePlanId) return ap;
          const nextDur =
            Number.isFinite(durationDays) && durationDays >= 7 && durationDays <= 30
              ? durationDays
              : ap.durationDays;
          const nextDays = Number.isFinite(daysClaimed)
            ? Math.max(0, Math.min(nextDur, daysClaimed))
            : ap.daysClaimed;
          return {
            ...ap,
            durationDays: nextDur,
            daysClaimed: nextDays,
            totalIncome: ap.dailyIncome * nextDur,
          };
        }),
      };
      syncUserIntoDb(userId, updatedUser);
      saveDatabase(db);
      return res.json({
        ok: true,
        message: `Updated plan duration/progress for ${user.userName}.`,
        database: db,
      });
    }

    if (type === 'remove_plan') {
      const userId = String(payload?.userId ?? '');
      const activePlanId = String(payload?.activePlanId ?? '');
      const user = db.users.find((u) => u.userId === userId);
      if (!user) return res.status(404).json({ ok: false, message: 'User not found.' });
      const tempApp = userAccountToAppState(user, db, 'investor', true);
      const nextState = applyAdminRemovePlan(tempApp, activePlanId);
      syncUserIntoDb(userId, extractUserFromAppState(user, nextState));
      saveDatabase(db);
      return res.json({
        ok: true,
        message: `Removed plan from ${user.userName}.`,
        database: db,
      });
    }

    if (type === 'force_daily_yield') {
      const userId = String(payload?.userId ?? '');
      const activePlanId = String(payload?.activePlanId ?? '');
      const user = db.users.find((u) => u.userId === userId);
      if (!user) return res.status(404).json({ ok: false, message: 'User not found.' });
      const target = user.activePlans.find((p) => p.id === activePlanId);
      if (!target) return res.status(404).json({ ok: false, message: 'Plan not found.' });
      if (target.daysClaimed >= target.durationDays) {
        return res.status(400).json({ ok: false, message: 'Plan already completed.' });
      }
      const updatedUser: UserAccount = {
        ...user,
        balance: Math.round((user.balance + target.dailyIncome) * 100) / 100,
        activePlans: user.activePlans.map((p) =>
          p.id === activePlanId
            ? { ...p, daysClaimed: p.daysClaimed + 1, lastClaimDate: getTodayDateString() }
            : p,
        ),
        transactions: [
          {
            id: `tx-adm-yld-${Date.now()}`,
            userId: user.userId,
            userName: user.userName,
            userLabel: user.userName,
            description: `Admin Yield Credit (${target.name})`,
            kind: 'yield',
            amount: target.dailyIncome,
            isCredit: true,
            timestamp: nowIso,
            isOwn: true,
          },
          ...user.transactions,
        ],
      };
      syncUserIntoDb(userId, updatedUser);
      saveDatabase(db);
      return res.json({
        ok: true,
        message: `Credited ${formatINR(target.dailyIncome)} yield for ${user.userName}.`,
        database: db,
      });
    }

    if (type === 'update_settings') {
      const incoming = payload?.settings as Partial<PlatformSettings>;
      db = {
        ...db,
        settings: {
          ...db.settings,
          ...incoming,
          merchantUpiId: String(incoming.merchantUpiId ?? db.settings.merchantUpiId).trim(),
          merchantName: String(incoming.merchantName ?? db.settings.merchantName).trim(),
          dailyCheckInCode: String(incoming.dailyCheckInCode ?? db.settings.dailyCheckInCode).trim().toUpperCase(),
        },
      };
      saveDatabase(db);
      return res.json({
        ok: true,
        message: 'Platform settings updated.',
        database: db,
      });
    }

    if (type === 'update_plan_config') {
      const planId = String(payload?.planId ?? '');
      const investmentAmount = Number(payload?.investmentAmount);
      const dailyIncome = Number(payload?.dailyIncome);
      const durationDays = Number(payload?.durationDays);
      if (
        !Number.isFinite(investmentAmount) ||
        investmentAmount >= 1500 ||
        investmentAmount < 100
      ) {
        return res.status(400).json({ ok: false, message: 'Investment must be ₹100 – ₹1,499.' });
      }
      if (
        !Number.isFinite(dailyIncome) ||
        dailyIncome <= 0 ||
        dailyIncome > investmentAmount * 0.25
      ) {
        return res.status(400).json({ ok: false, message: 'Daily income cannot exceed 25% of investment.' });
      }
      if (
        !Number.isFinite(durationDays) ||
        durationDays < 7 ||
        durationDays > 30
      ) {
        return res.status(400).json({ ok: false, message: 'Duration must be between 7 and 30 days.' });
      }
      const totalIncome = dailyIncome * durationDays;
      if (totalIncome > 5000) {
        return res.status(400).json({ ok: false, message: 'Total return cannot exceed ₹5,000.' });
      }
      db = {
        ...db,
        plans: db.plans.map((p) =>
          p.id === planId
            ? { ...p, investmentAmount, dailyIncome, durationDays, totalIncome }
            : p,
        ),
      };
      saveDatabase(db);
      return res.json({
        ok: true,
        message: 'Plan configuration saved.',
        database: db,
      });
    }

    return res.status(400).json({ ok: false, message: 'Unknown admin action.' });
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Mahindra BE6 server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
