export interface Company {
  id: string;
  name: string;
  gstin: string;
  city: string;
  currency: string;
  currencySymbol: string;
}

export interface CostCenter {
  id: string;
  name: string;
  category: string;
  budgetAllocated: number;
  budgetSpent: number;
}

export interface StockItem {
  id: string;
  name: string;
  groupName: string;
  category: string;
  godown: string;
  batchNo: string;
  expiryDate?: string;
  quantity: number;
  rate: number;
  unit: string;
  reorderLevel: number;
  priceLevelRetail: number;
  priceLevelWholesale: number;
}

export interface BillOfMaterial {
  id: string;
  finishedGoodName: string;
  bomNo: string;
  components: {
    itemId: string;
    itemName: string;
    quantityRequired: number;
    unit: string;
  }[];
}

export interface Employee {
  id: string;
  name: string;
  designation: string;
  department: string;
  baseSalary: number;
  pfDeduction: number;
  esiDeduction: number;
  profTax: number;
  attendanceDays: number; // Out of 30 days
  bankAccNo: string;
}

export interface SalesPurchaseOrder {
  id: string;
  orderNo: string;
  orderType: 'SalesOrder' | 'PurchaseOrder' | 'Quotation' | 'CreditNote' | 'DebitNote';
  date: string;
  partyName: string;
  itemsSummary: string;
  totalAmount: number;
  status: 'Open' | 'Closed' | 'Cancelled';
}

export interface BankCheck {
  id: string;
  checkNo: string;
  date: string;
  payee: string;
  amount: number;
  status: 'Printed' | 'Pending' | 'Cancelled';
}

export interface BankStatementItem {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'Deposit' | 'Withdrawal';
  isMatched: boolean;
  matchedVoucherNo?: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userName: string;
  userRole: string;
  action: string;
  module: string;
  details: string;
}

export interface WebhookConfig {
  id: string;
  name: string;
  url: string;
  event: string;
  isActive: boolean;
  lastTriggered?: string;
}

export interface ApprovalRule {
  id: string;
  name: string;
  vchType: string;
  minAmount: number;
  approverRole: 'Rivera' | 'Thompson' | 'Any';
  isActive: boolean;
}

export interface RecurringConfig {
  id: string;
  name: string;
  frequency: 'Daily' | 'Weekly' | 'Monthly';
  amount: number;
  debitAccountId: string;
  creditAccountId: string;
  narration: string;
  nextRunDate: string;
  isActive: boolean;
}

export interface CustomFunction {
  id: string;
  name: string;
  description: string;
  code: string;
  isActive: boolean;
}

export interface ReminderConfig {
  id: string;
  emailTemplate: string;
  whatsappTemplate: string;
  enableEmail: boolean;
  enableWhatsapp: boolean;
  reminderTriggerType: string;
}
