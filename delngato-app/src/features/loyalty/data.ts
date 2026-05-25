/**
 * Loyalty mock data — mirrors design/design-reference/app/data.jsx
 * (WALLET_BALANCE, POINTS_BALANCE, WALLET_TX, REWARDS, CASHBACK_THIS_MONTH).
 */

export type WalletTxKind = 'in' | 'out';

export type WalletTx = {
  id: string;
  kind: WalletTxKind;
  title: string;
  date: string;
  amount: number;
};

export type Reward = {
  id: string;
  title: string;
  cost: number;
  icon: 'bike' | 'tag' | 'sparkle';
  desc: string;
};

export const WALLET_BALANCE_INITIAL = 248;
export const POINTS_BALANCE_INITIAL = 1820;
export const CASHBACK_THIS_MONTH = 34;

export const WALLET_TX_INITIAL: WalletTx[] = [
  { id: 'tx1', kind: 'in', title: 'كاش باك من طلب DLN-٢٠٣٢', date: 'إمبارح', amount: 8 },
  { id: 'tx2', kind: 'out', title: 'دفع طلب DLN-٢٠١٨', date: 'الأحد', amount: -65 },
  { id: 'tx3', kind: 'in', title: 'شحن من فودافون كاش', date: 'الخميس', amount: 200 },
  { id: 'tx4', kind: 'in', title: 'مكافأة دعوة صديق · يوسف', date: 'الأسبوع اللي فات', amount: 30 },
  { id: 'tx5', kind: 'out', title: 'دفع طلب DLN-١٩٩٣', date: 'الخميس', amount: -132 },
  { id: 'tx6', kind: 'in', title: 'كاش باك من طلب DLN-١٩٧٢', date: 'من أسبوعين', amount: 12 },
];

export const REWARDS: Reward[] = [
  { id: 'rw1', title: 'توصيل ببلاش', cost: 500, icon: 'bike', desc: 'خصم رسوم التوصيل على طلب واحد' },
  { id: 'rw2', title: '٢٥ ج.م خصم', cost: 1000, icon: 'tag', desc: 'خصم مباشر من إجمالي الطلب' },
  { id: 'rw3', title: '٥٠ ج.م خصم', cost: 1800, icon: 'tag', desc: 'لطلباتك من ١٥٠ ج.م فوق' },
  { id: 'rw4', title: 'منتج هدية', cost: 2500, icon: 'sparkle', desc: 'بكنافة بالقشطة على بيتك' },
];

export const REFERRAL_REWARD_AMOUNT = 30;


