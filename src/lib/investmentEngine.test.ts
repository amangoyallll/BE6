import test from 'node:test';
import assert from 'node:assert/strict';
import {
  INITIAL_STATE,
  INVESTMENT_PLANS,
  DAILY_CHECKIN_CODE,
  applySubmitUtrRecharge,
  applyAdminReviewRecharge,
  applySubmitWithdrawalClaim,
  applyAdminReviewWithdrawal,
  applyAdminAdjustBalance,
  applyAdminUpdateUserDetails,
  applyAdminGrantPlan,
  applyAdminRemovePlan,
  applyPurchasePlan,
  applyDailyCheckIn,
  applyClaimDailyYield,
  applySaveBankDetails,
  applyUpdatePassword,
  applyLogin,
  applyRegister,
  applyLogout,
  createInitialDatabase,
  dbAuthenticate,
  dbRegisterUser,
  getMinWithdrawalAmount,
  getPlanStatus,
  getRemainingDurationDays,
  getRequiredWithdrawalClaimFee,
  generateRandomLiveTransaction,
  formatINR,
} from './investmentEngine';

test('default state starts logged out and tracks current vs past investment history durations', () => {
  assert.equal(INITIAL_STATE.auth.isAuthenticated, false);
  const currentPlan = INITIAL_STATE.activePlans[0];
  const pastPlan = INITIAL_STATE.activePlans[1];
  assert.equal(getPlanStatus(currentPlan), 'active');
  assert.equal(getRemainingDurationDays(currentPlan), 29);
  assert.equal(getPlanStatus(pastPlan), 'completed');
  assert.equal(getRemainingDurationDays(pastPlan), 0);
});

test('unified login portal authenticates both investors and admin without auto-login', () => {
  const db = createInitialDatabase();
  const invRes = dbAuthenticate(db, '8571086754', '123456', '2026-11-20T09:00:00.000Z');
  assert.equal(invRes.ok, true);
  assert.equal(invRes.role, 'investor');
  assert.equal(invRes.user?.userName, 'Ankit Yadav');

  const admRes = dbAuthenticate(db, 'admin', 'admin123', '2026-11-20T09:00:00.000Z');
  assert.equal(admRes.ok, true);
  assert.equal(admRes.role, 'admin');

  const regRes = dbRegisterUser(
    admRes.db,
    'Priya Patel',
    '9988776655',
    'pass1234',
    'BE6K49R0',
    '2026-11-20T09:05:00.000Z',
  );
  assert.equal(regRes.ok, true);
  assert.equal(regRes.user?.userId, '9988776655');
  assert.equal(regRes.user?.balance, 40);
  assert.equal(regRes.db.users.length, 3);
});

test('all Mahindra BE6 plans meet <=25% daily income, >=7 & <=30 days, <1500 invest, <=5000 earning', () => {
  for (const plan of INVESTMENT_PLANS) {
    assert.ok(
      plan.investmentAmount < 1500,
      `${plan.name} investment ${plan.investmentAmount} must be < 1500`,
    );
    assert.ok(
      plan.dailyIncome <= plan.investmentAmount * 0.25,
      `${plan.name} dailyIncome ${plan.dailyIncome} exceeds 25% of ${plan.investmentAmount}`,
    );
    assert.ok(
      plan.durationDays >= 7 && plan.durationDays <= 30,
      `${plan.name} duration ${plan.durationDays} must be 7..30 days`,
    );
    assert.ok(
      plan.totalIncome <= 5000,
      `${plan.name} totalIncome ${plan.totalIncome} must be <= 5000`,
    );
    assert.equal(plan.dailyIncome * plan.durationDays, plan.totalIncome);
  }
});

test('UPI UTR recharge submits as pending and only credits balance after admin approval', () => {
  const badUtr = applySubmitUtrRecharge(
    INITIAL_STATE,
    700,
    'UPI_ID',
    '123',
    '2026-11-20T08:00:00.000Z',
  );
  assert.ok(badUtr.error);

  const submitted = applySubmitUtrRecharge(
    INITIAL_STATE,
    700,
    'QR_CODE',
    '432518904312',
    '2026-11-20T08:00:00.000Z',
  );
  assert.equal(submitted.error, undefined);
  assert.equal(submitted.request?.status, 'pending');
  assert.equal(submitted.nextState.balance, INITIAL_STATE.balance);

  const approved = applyAdminReviewRecharge(
    submitted.nextState,
    submitted.request!.id,
    'approved',
    '2026-11-20T08:05:00.000Z',
  );
  assert.equal(approved.error, undefined);
  assert.equal(approved.nextState.balance, INITIAL_STATE.balance + 700);
});

test('withdrawal enforces 4-day income minimum, permits direct IMPS up to 3x principal, and requires 1x principal UTR match above 3x', () => {
  const minRequired = getMinWithdrawalAmount(INITIAL_STATE.activePlans);
  const baseClaimFee = getRequiredWithdrawalClaimFee(INITIAL_STATE.activePlans);
  assert.equal(minRequired, 60 * 4);
  assert.equal(baseClaimFee, 250);

  // Below 4-day minimum fails
  const belowMin = applySubmitWithdrawalClaim(
    INITIAL_STATE,
    200,
    'DIRECT_IMPS',
    '',
    '2026-11-20T08:00:00.000Z',
  );
  assert.ok(belowMin.error);
  assert.equal(belowMin.nextState.balance, INITIAL_STATE.balance);

  // Within 3x active principal (3 x 250 = 750): direct IMPS with ₹0 fee and no UTR required
  const directImps = applySubmitWithdrawalClaim(
    INITIAL_STATE,
    300,
    'DIRECT_IMPS',
    '',
    '2026-11-20T08:01:00.000Z',
  );
  assert.equal(directImps.error, undefined);
  assert.equal(directImps.request?.claimFeeAmount, 0);
  assert.equal(directImps.request?.method, 'DIRECT_IMPS');
  assert.equal(directImps.request?.utrNumber, 'DIRECT-IMPS');
  assert.equal(directImps.request?.status, 'pending');
  assert.equal(directImps.nextState.balance, INITIAL_STATE.balance - 300);

  // Next payout (500) pushes cumulative claims to 800 (> 750 free allowance): requires 1x principal UTR
  const missingUtrAbove3x = applySubmitWithdrawalClaim(
    directImps.nextState,
    500,
    'UPI_ID',
    '123',
    '2026-11-20T08:02:00.000Z',
  );
  assert.ok(missingUtrAbove3x.error);

  const highValue = applySubmitWithdrawalClaim(
    directImps.nextState,
    500,
    'QR_CODE',
    '776655443322',
    '2026-11-20T08:03:00.000Z',
  );
  assert.equal(highValue.error, undefined);
  assert.equal(highValue.request?.claimFeeAmount, 250);
  assert.equal(highValue.request?.utrNumber, '776655443322');
  assert.equal(highValue.request?.status, 'pending');
  assert.equal(highValue.nextState.balance, INITIAL_STATE.balance - 800);

  // Rejecting refunds payout back to wallet
  const rejected = applyAdminReviewWithdrawal(
    highValue.nextState,
    highValue.request!.id,
    'rejected',
    '2026-11-20T08:05:00.000Z',
    'UTR mismatch',
  );
  assert.equal(rejected.error, undefined);
  assert.equal(rejected.nextState.balance, INITIAL_STATE.balance - 300);
  assert.equal(rejected.reviewed?.status, 'rejected');

  // Single payout above 3x principal (1000 > 750) requires 1x principal match (250) and once approved unlocks unlimited ₹0 IMPS
  const singleHighValue = applySubmitWithdrawalClaim(
    INITIAL_STATE,
    1000,
    'UPI_ID',
    '887766554433',
    '2026-11-20T08:06:00.000Z',
  );
  assert.equal(singleHighValue.error, undefined);
  assert.equal(singleHighValue.request?.claimFeeAmount, 250);

  const approved = applyAdminReviewWithdrawal(
    singleHighValue.nextState,
    singleHighValue.request!.id,
    'approved',
    '2026-11-20T08:07:00.000Z',
  );
  assert.equal(approved.reviewed?.status, 'approved');
  assert.equal(approved.nextState.balance, INITIAL_STATE.balance - 1000);

  // After principal verification is approved once, subsequent payouts are ₹0 fee
  const postVerified = applySubmitWithdrawalClaim(
    approved.nextState,
    500,
    'DIRECT_IMPS',
    '',
    '2026-11-20T08:08:00.000Z',
  );
  assert.equal(postVerified.error, undefined);
  assert.equal(postVerified.request?.claimFeeAmount, 0);
});

test('admin has full control over user balance, details, suspension, and plans', () => {
  const initialCount = INITIAL_STATE.activePlans.length;
  const adjusted = applyAdminAdjustBalance(
    INITIAL_STATE,
    500,
    'credit',
    'Admin Loyalty Credit',
    '2026-11-20T08:10:00.000Z',
  );
  assert.equal(adjusted.error, undefined);
  assert.equal(adjusted.nextState.balance, INITIAL_STATE.balance + 500);

  const granted = applyAdminGrantPlan(
    adjusted.nextState,
    'normal-popular',
    '2026-11-20T08:11:00.000Z',
  );
  assert.equal(granted.error, undefined);
  assert.equal(granted.nextState.activePlans.length, initialCount + 1);
  assert.equal(getRequiredWithdrawalClaimFee(granted.nextState.activePlans), 650);

  const removed = applyAdminRemovePlan(
    granted.nextState,
    granted.nextState.activePlans[0].id,
  );
  assert.equal(removed.activePlans.length, initialCount);

  const suspended = applyAdminUpdateUserDetails(removed, {
    userName: 'Ankit VIP',
    accountStatus: 'suspended',
    bankDetails: {
      accountHolderName: 'Ankit VIP',
      accountNumber: '998877665544',
      ifscCode: 'HDFC0001234',
    },
  });
  assert.equal(suspended.error, undefined);
  assert.equal(suspended.nextState.auth.userName, 'Ankit VIP');
  assert.equal(suspended.nextState.accountStatus, 'suspended');

  const blockedLogin = applyLogin(
    applyLogout(suspended.nextState),
    '8571086754',
    '123456',
  );
  assert.ok(blockedLogin.error);
});

test('purchase, check-in, yield claim, bank, and auth register/login work', () => {
  const popular = INVESTMENT_PLANS[0];
  const bought = applyPurchasePlan(
    INITIAL_STATE,
    popular,
    '2026-11-20T08:00:00.000Z',
  );
  assert.equal(bought.error, undefined);
  assert.equal(
    bought.nextState.balance,
    INITIAL_STATE.balance - popular.investmentAmount,
  );

  const checkIn = applyDailyCheckIn(
    bought.nextState,
    'DAILY',
    '2026-11-20',
    '2026-11-20T08:00:00.000Z',
  );
  assert.equal(checkIn.reward, 25);

  const repeatCheckIn = applyDailyCheckIn(
    checkIn.nextState,
    DAILY_CHECKIN_CODE,
    '2026-11-20',
    '2026-11-20T09:00:00.000Z',
  );
  assert.ok(repeatCheckIn.error);

  const yieldRes = applyClaimDailyYield(
    checkIn.nextState,
    INITIAL_STATE.activePlans[0].id,
    '2026-11-20',
    '2026-11-20T08:00:00.000Z',
  );
  assert.equal(yieldRes.earned, 60);

  const reg = applyRegister(
    applyLogout(yieldRes.nextState),
    'Rohan Verma',
    '9876543210',
    'secret99',
    '2026-11-20T08:10:00.000Z',
  );
  assert.equal(reg.error, undefined);
  assert.equal(reg.nextState.auth.isAuthenticated, true);

  const bankSaved = applySaveBankDetails(reg.nextState, {
    accountHolderName: 'Rohan Verma',
    accountNumber: '123456789012',
    ifscCode: 'hdfc0001234',
  });
  assert.equal(bankSaved.error, undefined);

  const pwdUpdated = applyUpdatePassword(bankSaved.nextState, 'secret99', 'newpass12');
  assert.equal(pwdUpdated.error, undefined);

  const liveTx = generateRandomLiveTransaction(1, '2026-11-20T08:12:00.000Z');
  assert.ok(!liveTx.userLabel.startsWith('User ****'));
  assert.ok(liveTx.userLabel.includes('('));
  assert.ok(formatINR(liveTx.amount).startsWith('₹'));
});
