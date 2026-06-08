export type AccountType = 'Asset' | 'Liability' | 'Equity' | 'Income' | 'Expense';
export type VoucherType = 'Payment' | 'Receipt' | 'Contra' | 'Journal' | 'Sales' | 'Purchase';
export type TransactionStatus = 'Cleared' | 'Pending' | 'Draft' | 'Declined';

export interface LedgerAccount {
  id: string;
  name: string;
  code: string;
  type: AccountType;
  balance: number;
  balanceType: 'Dr' | 'Cr';
  accNo?: string;
  details?: string;
}

export interface VoucherItem {
  id: string;
  accountId: string;
  accountName: string;
  debit: number | null;
  credit: number | null;
  itemNarration: string;
}

export interface Voucher {
  id: string;
  vchNo: string;
  date: string;
  vchType: VoucherType;
  reference: string;
  narration: string;
  status: TransactionStatus;
  items: VoucherItem[];
  particulars?: string; // Cache principal trade partner or double-entry counterparty
  amountValue?: number; // Visual aggregate for listings
}

export interface CashFlowData {
  month: string;
  income: number;
  expense: number;
}
