import { LedgerAccount, Voucher, CashFlowData } from './types';

export const initialAccounts: LedgerAccount[] = [
  {
    id: 'hdfc-bank',
    name: 'HDFC Bank - Current A/c',
    code: '1201',
    type: 'Asset',
    balance: 1245680.00,
    balanceType: 'Dr',
    accNo: 'XXXX XXXX 4092',
    details: 'Primary Operating Account'
  },
  {
    id: 'cash-in-hand',
    name: 'Cash-in-Hand',
    code: '1002',
    type: 'Asset',
    balance: 142550.00,
    balanceType: 'Dr',
    details: 'Physical Cash Drawer'
  },
  {
    id: 'bank-balance',
    name: 'Bank Balance (USD Equivalents)',
    code: '1003',
    type: 'Asset',
    balance: 3892110.45,
    balanceType: 'Dr',
    details: 'Global Subsidiary Liquidity'
  },
  {
    id: 'acc-receivable',
    name: 'Accounts Receivable',
    code: '1210',
    type: 'Asset',
    balance: 45200.00,
    balanceType: 'Dr',
    details: 'Unpaid Client Invoices'
  },
  {
    id: 'acc-payable',
    name: 'Accounts Payable',
    code: '2100',
    type: 'Liability',
    balance: 12840.10,
    balanceType: 'Cr',
    details: 'Vendor Liabilities'
  },
  {
    id: 'admin-expenses',
    name: 'Administrative Expenses',
    code: '5012',
    type: 'Expense',
    balance: 18500.00,
    balanceType: 'Dr',
    details: 'General Office Operations'
  },
  {
    id: 'rent-expense',
    name: 'Corporate Office Rent',
    code: '5001',
    type: 'Expense',
    balance: 102000.00,
    balanceType: 'Dr'
  },
  {
    id: 'utility-expense',
    name: 'Utility Expenses',
    code: '5002',
    type: 'Expense',
    balance: 32170.00,
    balanceType: 'Dr'
  },
  {
    id: 'technova-revenue',
    name: 'TechNova Solutions (Revenue Account)',
    code: '4001',
    type: 'Income',
    balance: 520000.00,
    balanceType: 'Cr'
  },
  {
    id: 'salary-payable',
    name: 'Salary Accruals Account',
    code: '2203',
    type: 'Liability',
    balance: 15400.00,
    balanceType: 'Cr'
  }
];

export const initialCashFlow: CashFlowData[] = [
  { month: 'Jan', income: 140000, expense: 95000 },
  { month: 'Feb', income: 152000, expense: 110000 },
  { month: 'Mar', income: 198000, expense: 140000 },
  { month: 'Apr', income: 240000, expense: 165000 },
  { month: 'May', income: 220000, expense: 180000 },
  { month: 'Jun', income: 285000, expense: 150000 }
];

export const initialVouchers: Voucher[] = [
  // HDFC specific ledger entries (Indian Rupee matches)
  {
    id: 'vch-hdfc-1',
    vchNo: 'PY/0441',
    date: '2023-10-05',
    vchType: 'Payment',
    reference: 'REF-HDFC-AWS',
    narration: 'Cloud Services Subscription - AWS Oct 2023',
    status: 'Cleared',
    particulars: 'Amazon Web Services',
    amountValue: 45000,
    items: [
      { id: 'item-1', accountId: 'admin-expenses', accountName: 'Administrative Expenses', debit: 45000, credit: null, itemNarration: 'AWS Subscription' },
      { id: 'item-2', accountId: 'hdfc-bank', accountName: 'HDFC Bank - Current A/c', debit: null, credit: 45000, itemNarration: 'Bank Outflow' }
    ]
  },
  {
    id: 'vch-hdfc-2',
    vchNo: 'RC/1120',
    date: '2023-10-12',
    vchType: 'Receipt',
    reference: 'REF-TN-1120',
    narration: 'Invoice Payment - TechNova Solutions',
    status: 'Cleared',
    particulars: 'TechNova Solutions',
    amountValue: 520000,
    items: [
      { id: 'item-3', accountId: 'hdfc-bank', accountName: 'HDFC Bank - Current A/c', debit: 520000, credit: null, itemNarration: 'HDFC Deposit' },
      { id: 'item-4', accountId: 'technova-revenue', accountName: 'TechNova Solutions (Revenue Account)', debit: null, credit: 520000, itemNarration: 'Consulting revenue' }
    ]
  },
  {
    id: 'vch-hdfc-3',
    vchNo: 'PY/0458',
    date: '2023-10-15',
    vchType: 'Payment',
    reference: 'REF-RENT-OCT',
    narration: 'Office Rent - October 2023',
    status: 'Cleared',
    particulars: 'Corporate Office Rent',
    amountValue: 110000,
    items: [
      { id: 'item-5', accountId: 'rent-expense', accountName: 'Corporate Office Rent', debit: 110000, credit: null, itemNarration: 'Office Rent' },
      { id: 'item-6', accountId: 'hdfc-bank', accountName: 'HDFC Bank - Current A/c', debit: null, credit: 110000, itemNarration: 'Corporate rent' }
    ]
  },
  {
    id: 'vch-hdfc-4',
    vchNo: 'JR/0082',
    date: '2023-10-20',
    vchType: 'Journal',
    reference: 'REF-TDS-PROF',
    narration: 'TDS Payable - Professional Fees',
    status: 'Cleared',
    particulars: 'TDS Payable',
    amountValue: 12400,
    items: [
      { id: 'item-7', accountId: 'admin-expenses', accountName: 'Administrative Expenses', debit: 12400, credit: null, itemNarration: 'Professional TDS' },
      { id: 'item-8', accountId: 'hdfc-bank', accountName: 'HDFC Bank - Current A/c', debit: null, credit: 12400, itemNarration: 'TDS Deduction' }
    ]
  },
  {
    id: 'vch-hdfc-5',
    vchNo: 'CN/0015',
    date: '2023-10-22',
    vchType: 'Contra',
    reference: 'REF-CSH-DEP',
    narration: 'Cash Deposit back to HDFC Current Account',
    status: 'Cleared',
    particulars: 'Cash Deposit',
    amountValue: 85000,
    items: [
      { id: 'item-9', accountId: 'hdfc-bank', accountName: 'HDFC Bank - Current A/c', debit: 85000, credit: null, itemNarration: 'Current A/c deposit' },
      { id: 'item-10', accountId: 'cash-in-hand', accountName: 'Cash-in-Hand', debit: null, credit: 85000, itemNarration: 'Vault withdraw' }
    ]
  },
  {
    id: 'vch-hdfc-6',
    vchNo: 'PY/0488',
    date: '2023-10-28',
    vchType: 'Payment',
    reference: 'REF-UTIL-OCT',
    narration: 'Utility Bills - Electricity & Water',
    status: 'Cleared',
    particulars: 'Utility Bills - Electricity & Water',
    amountValue: 32170,
    items: [
      { id: 'item-11', accountId: 'utility-expense', accountName: 'Utility Expenses', debit: 32170, credit: null, itemNarration: 'Power and water' },
      { id: 'item-12', accountId: 'hdfc-bank', accountName: 'HDFC Bank - Current A/c', debit: null, credit: 32170, itemNarration: 'Direct debit' }
    ]
  },

  // Global recent transactions (Dashboard matching - USD focus)
  {
    id: 'vch-dash-1',
    vchNo: 'VCH-2023-001',
    date: '2023-10-24',
    vchType: 'Payment',
    reference: 'REF-LOG-24',
    narration: 'Global Logistics Inc. Shipping Clearance',
    status: 'Cleared',
    particulars: 'Global Logistics Inc.',
    amountValue: 12400,
    items: [
      { id: 'i-1', accountId: 'admin-expenses', accountName: 'Administrative Expenses', debit: 12400, credit: null, itemNarration: 'Logistics cargo fees' },
      { id: 'i-2', accountId: 'cash-in-hand', accountName: 'Cash-in-Hand', debit: null, credit: 12400, itemNarration: 'Freight expense' }
    ]
  },
  {
    id: 'vch-dash-2',
    vchNo: 'VCH-2023-002',
    date: '2023-10-23',
    vchType: 'Receipt',
    reference: 'REF-AZ-INV',
    narration: 'Azure Cloud Services Invoice Clearance',
    status: 'Pending',
    particulars: 'Azure Cloud Services',
    amountValue: 4200,
    items: [
      { id: 'i-3', accountId: 'acc-receivable', accountName: 'Accounts Receivable', debit: 4200, credit: null, itemNarration: 'Ref Azure credit' },
      { id: 'i-4', accountId: 'cash-in-hand', accountName: 'Cash-in-Hand', debit: null, credit: 4200, itemNarration: 'Invoice settlement' }
    ]
  },
  {
    id: 'vch-dash-3',
    vchNo: 'VCH-2023-003',
    date: '2023-10-22',
    vchType: 'Payment',
    reference: 'REF-RENT',
    narration: 'Office Rent Reimbursements',
    status: 'Cleared',
    particulars: 'Corporate Office Rent',
    amountValue: 8500,
    items: [
      { id: 'i-5', accountId: 'rent-expense', accountName: 'Corporate Office Rent', debit: 8500, credit: null, itemNarration: 'Corporate rent' },
      { id: 'i-6', accountId: 'cash-in-hand', accountName: 'Cash-in-Hand', debit: null, credit: 8500, itemNarration: 'Rent cash settlement' }
    ]
  },
  {
    id: 'vch-dash-4',
    vchNo: 'VCH-2023-004',
    date: '2023-10-22',
    vchType: 'Receipt',
    reference: 'REF-INTEREST',
    narration: 'Quarterly Bank Interest Accrued',
    status: 'Cleared',
    particulars: 'Bank Interest Earned',
    amountValue: 150.25,
    items: [
      { id: 'i-7', accountId: 'cash-in-hand', accountName: 'Cash-in-Hand', debit: 150.25, credit: null, itemNarration: 'Interest credit' },
      { id: 'i-8', accountId: 'technova-revenue', accountName: 'TechNova Solutions (Revenue Account)', debit: null, credit: 150.25, itemNarration: 'Interest' }
    ]
  },
  {
    id: 'vch-dash-5',
    vchNo: 'VCH-2023-005',
    date: '2023-10-21',
    vchType: 'Payment',
    reference: 'REF-DGN-DEV',
    narration: 'Freelance Design Dev service charge',
    status: 'Declined',
    particulars: 'Freelance Design Dev',
    amountValue: 2000,
    items: [
      { id: 'i-9', accountId: 'admin-expenses', accountName: 'Administrative Expenses', debit: 2000, credit: null, itemNarration: 'Freelancer payment' },
      { id: 'i-10', accountId: 'cash-in-hand', accountName: 'Cash-in-Hand', debit: null, credit: 2000, itemNarration: 'Service withdrawal' }
    ]
  },

  // Pre-loaded history vouchers shown in the bottom section of Voucher Entry
  {
    id: 'vch-journal-102',
    vchNo: 'VCH-2023-102',
    date: '2023-10-26',
    vchType: 'Journal',
    reference: 'REF-SLR-ACC',
    narration: 'Salary Corporate Accrual',
    status: 'Cleared',
    particulars: 'Salary Accrual',
    amountValue: 15400,
    items: [
      { id: 'j-1', accountId: 'admin-expenses', accountName: 'Administrative Expenses', debit: 15400, credit: null, itemNarration: 'Accrued salaries' },
      { id: 'j-2', accountId: 'salary-payable', accountName: 'Salary Accruals Account', debit: null, credit: 15400, itemNarration: 'Salaries payable' }
    ]
  },
  {
    id: 'vch-journal-101',
    vchNo: 'VCH-2023-101',
    date: '2023-10-25',
    vchType: 'Journal',
    reference: 'REF-RNT-PMT',
    narration: 'Rent Payment Accruals',
    status: 'Draft',
    particulars: 'Rent Payment',
    amountValue: 3200,
    items: [
      { id: 'j-3', accountId: 'rent-expense', accountName: 'Corporate Office Rent', debit: 3200, credit: null, itemNarration: 'Accrued lease' },
      { id: 'j-4', accountId: 'acc-payable', accountName: 'Accounts Payable', debit: null, credit: 3200, itemNarration: 'Rent accrual' }
    ]
  }
];
