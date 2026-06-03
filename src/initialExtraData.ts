import { 
  Company, 
  CostCenter, 
  StockItem, 
  BillOfMaterial, 
  Employee, 
  SalesPurchaseOrder, 
  BankCheck, 
  BankStatementItem, 
  AuditLogEntry,
  WebhookConfig,
  ApprovalRule,
  RecurringConfig,
  CustomFunction,
  ReminderConfig
} from './types-extra';

export const initialCompanies: Company[] = [
  {
    id: 'sirach-tech',
    name: 'Sirach Technology India Ltd.',
    gstin: '29AABCS8374R1Z8',
    city: 'Bengaluru, Karnataka',
    currency: 'INR',
    currencySymbol: '₹'
  },
  {
    id: 'sirach-agro',
    name: 'Sirach Agro Industries',
    gstin: '27AABCS4810K2Z2',
    city: 'Mumbai, Maharashtra',
    currency: 'INR',
    currencySymbol: '₹'
  },
  {
    id: 'sirach-logi',
    name: 'Sirach Logi-Global Pvt. Ltd.',
    gstin: '07AAACS1902M1ZN',
    city: 'New Delhi, Delhi',
    currency: 'USD',
    currencySymbol: '$'
  }
];

export const initialCostCenters: CostCenter[] = [
  { id: 'cc-sales', name: 'Sales & Marketing Division', category: 'Operational', budgetAllocated: 500000, budgetSpent: 420000 },
  { id: 'cc-rnd', name: 'R&D Lab Technology', category: 'Development', budgetAllocated: 800000, budgetSpent: 730000 },
  { id: 'cc-admin', name: 'HQ Administration', category: 'Administrative', budgetAllocated: 250000, budgetSpent: 245000 },
  { id: 'cc-support', name: 'Customer Support Services', category: 'Support', budgetAllocated: 300000, budgetSpent: 120000 }
];

export const initialStockItems: StockItem[] = [
  {
    id: 'stock-processor',
    name: 'Octa-Core Advanced Processor SoC',
    groupName: 'Semiconductors',
    category: 'High-Tech',
    godown: 'Godown A - South Bengaluru Warehouse',
    batchNo: 'B-OCTA-092-23',
    expiryDate: '2028-12-31',
    quantity: 1240,
    rate: 1250,
    unit: 'Pcs',
    reorderLevel: 500,
    priceLevelRetail: 1450,
    priceLevelWholesale: 1200
  },
  {
    id: 'stock-motherboard',
    name: 'X570 Advanced Main Board PCB',
    groupName: 'Circuit Assemblies',
    category: 'Hardware',
    godown: 'Godown A - South Bengaluru Warehouse',
    batchNo: 'B-X570-880-23',
    expiryDate: '2029-06-30',
    quantity: 840,
    rate: 2200,
    unit: 'Pcs',
    reorderLevel: 200,
    priceLevelRetail: 2600,
    priceLevelWholesale: 2150
  },
  {
    id: 'stock-ram',
    name: 'DDR5 High-Density SDRAM 16GB',
    groupName: 'Memory Matrices',
    category: 'Hardware',
    godown: 'Godown B - Mumbai Port Godown',
    batchNo: 'B-MEMR-220-23',
    quantity: 3400,
    rate: 450,
    unit: 'Pcs',
    reorderLevel: 1000,
    priceLevelRetail: 600,
    priceLevelWholesale: 420
  },
  {
    id: 'stock-cooling',
    name: 'Liquid-Cooling Heatsink Block v2',
    groupName: 'Thermal Solutions',
    category: 'Peripherals',
    godown: 'Godown B - Mumbai Port Godown',
    batchNo: 'B-COOL-101-23',
    quantity: 150,
    rate: 320,
    unit: 'Pcs',
    reorderLevel: 300, // Reorder warning tier!
    priceLevelRetail: 430,
    priceLevelWholesale: 300
  }
];

export const initialBoms: BillOfMaterial[] = [
  {
    id: 'bom-quantum-rig',
    finishedGoodName: 'Sirach Quantum Server Frame Unit',
    bomNo: 'BOM-SRCH-Q01',
    components: [
      { itemId: 'stock-processor', itemName: 'Octa-Core Advanced Processor SoC', quantityRequired: 2, unit: 'Pcs' },
      { itemId: 'stock-motherboard', itemName: 'X570 Advanced Main Board PCB', quantityRequired: 1, unit: 'Pcs' },
      { itemId: 'stock-ram', itemName: 'DDR5 High-Density SDRAM 16GB', quantityRequired: 4, unit: 'Pcs' },
      { itemId: 'stock-cooling', itemName: 'Liquid-Cooling Heatsink Block v2', quantityRequired: 2, unit: 'Pcs' }
    ]
  }
];

export const initialEmployees: Employee[] = [
  { id: 'emp-001', name: 'Sanjay Kumar', designation: 'R&D Engineer', department: 'Product Tech', baseSalary: 85000, pfDeduction: 1200, esiDeduction: 450, profTax: 200, attendanceDays: 29, bankAccNo: 'HDFC6281002341' },
  { id: 'emp-002', name: 'Divya Sharma', designation: 'Senior Analyst', department: 'Corporate Auditing', baseSalary: 95000, pfDeduction: 1200, esiDeduction: 450, profTax: 200, attendanceDays: 30, bankAccNo: 'ICIC0023190823' },
  { id: 'emp-003', name: 'Karthik Rao', designation: 'Marketing Associate', department: 'Sales & Growth', baseSalary: 45000, pfDeduction: 1200, esiDeduction: 450, profTax: 200, attendanceDays: 28, bankAccNo: 'KOTK9928100881' },
  { id: 'emp-004', name: 'Megha Patil', designation: 'Admin Officer', department: 'HQ HR Operations', baseSalary: 55000, pfDeduction: 1200, esiDeduction: 450, profTax: 200, attendanceDays: 26, bankAccNo: 'SBIN0002194811' }
];

export const initialOrders: SalesPurchaseOrder[] = [
  { id: 'ord-001', orderNo: 'SO-2023-9021', orderType: 'SalesOrder', date: '2023-11-01', partyName: 'AlphaTech Enterprises', itemsSummary: '20x Octa-Core Processors, 10x Main Boards', totalAmount: 47000, status: 'Open' },
  { id: 'ord-002', orderNo: 'PO-2023-1082', orderType: 'PurchaseOrder', date: '2023-11-03', partyName: 'SolderCorp Foundry India', itemsSummary: '100x Heatsink Blank Plates, PCB Fibers', totalAmount: 18500, status: 'Closed' },
  { id: 'ord-003', orderNo: 'QT-2023-4001', orderType: 'Quotation', date: '2023-11-05', partyName: 'Future Infrastructure Corp', itemsSummary: 'Consolidated Server BOM deployment quote', totalAmount: 112000, status: 'Open' },
  { id: 'ord-004', orderNo: 'CN-2023-0005', orderType: 'CreditNote', date: '2023-11-06', partyName: 'AlphaTech Enterprises', itemsSummary: 'Processor item return rate adjustment', totalAmount: 1250, status: 'Open' }
];

export const initialChecks: BankCheck[] = [
  { id: 'chk-10021', checkNo: 'CHEQ-001928', date: '2023-10-28', payee: 'Corporate Office Landlord Ltd', amount: 110000, status: 'Printed' },
  { id: 'chk-10022', checkNo: 'CHEQ-001929', date: '2023-10-29', payee: 'Sanjay Kumar (Oct Bonus)', amount: 12000, status: 'Pending' }
];

export const initialBankStatements: BankStatementItem[] = [
  { id: 'st-01', date: '2023-10-05', description: 'ONLINE OUT-PR: Amazon Web Services AWS', amount: 45000, type: 'Withdrawal', isMatched: true, matchedVoucherNo: 'PY/0441' },
  { id: 'st-02', date: '2023-10-12', description: 'RTGS INBOUND Settle: TechNova Solutions Ltd', amount: 520000, type: 'Deposit', isMatched: true, matchedVoucherNo: 'RC/1120' },
  { id: 'st-03', date: '2023-10-15', description: 'CHQ CLEAR: Rent October Corp Office Landlord', amount: 110000, type: 'Withdrawal', isMatched: false }, // RECON HIT FOR PY/0458
  { id: 'st-04', date: '2023-10-28', description: 'MOCK OUT: DIRECT DEBIT Electricity Power Board', amount: 32170, type: 'Withdrawal', isMatched: false } // RECON HIT FOR PY/0488
];

export const initialAuditLogs: AuditLogEntry[] = [
  { id: 'audit-01', timestamp: '2026-06-03 14:10:22', userName: 'Alex Thompson', userRole: 'Senior Accountant', action: 'Login Session Initiated', module: 'Auth', details: 'Successful desktop secure credential handshake.' },
  { id: 'audit-02', timestamp: '2026-06-03 14:15:30', userName: 'Alex Thompson', userRole: 'Senior Accountant', action: 'Create Voucher', module: 'LedgerBook', details: 'Added Ledger Payment Voucher PY/0488 for electricity.' },
  { id: 'audit-03', timestamp: '2026-06-03 14:40:02', userName: 'Alex Rivera', userRole: 'Head Accountant', action: 'Audit Trail Export', module: 'System', details: 'Exported quarterly fiscal report balances to CSV.' }
];

export const initialWebhooks: WebhookConfig[] = [
  { id: 'wh-1', name: 'Slack High-Value Alerts', url: 'https://n8n.sirachtech.com/webhook/tally-vch', event: 'Voucher Approved', isActive: true, lastTriggered: '2026-06-03 14:12' },
  { id: 'wh-2', name: 'Email Audit Log Broadcast', url: 'https://n8n.sirachtech.com/webhook/audit', event: 'Audit Entry Added', isActive: true, lastTriggered: '2026-06-03 15:45' },
  { id: 'wh-3', name: 'WhatsApp Payment Followups', url: 'https://n8n.sirachtech.com/webhook/remind', event: 'Order Due', isActive: false }
];

export const initialApprovalRules: ApprovalRule[] = [
  { id: 'rule-1', name: 'Large Cash Disbursement Audit', vchType: 'Payment', minAmount: 15000, approverRole: 'Rivera', isActive: true },
  { id: 'rule-2', name: 'Asset Acquisition Signoff', vchType: 'Contra', minAmount: 30000, approverRole: 'Rivera', isActive: true },
  { id: 'rule-3', name: 'Company Journal Adjustments', vchType: 'Journal', minAmount: 0, approverRole: 'Thompson', isActive: false }
];

export const initialRecurringConfigs: RecurringConfig[] = [
  { id: 'rec-1', name: 'Airtel Optical Lease Rent', frequency: 'Monthly', amount: 4500, debitAccountId: 'telecom-bills', creditAccountId: 'hdfc-bank', narration: 'Recurring telecom broadband lease payment (auto-scheduler)', nextRunDate: '2026-06-15', isActive: true },
  { id: 'rec-2', name: 'Workspace Refreshments Pro-rata', frequency: 'Weekly', amount: 1200, debitAccountId: 'office-welfare', creditAccountId: 'petty-cash', narration: 'Weekly pantry refreshments provision', nextRunDate: '2026-06-10', isActive: true }
];

export const initialCustomFunctions: CustomFunction[] = [
  { 
    id: 'fn-1', 
    name: 'GST Rounding Adjuster', 
    description: 'Automatically round voucher item accounts to clear decimal residuals.', 
    code: '// Modify voucher before syncing to database\nfunction onVoucherPreSave(voucher) {\n  if (voucher.amountValue) {\n    voucher.narration += " (Verified & Rounded)";\n    console.log("Rounding adjustments verified");\n  }\n  return voucher;\n}',
    isActive: true 
  },
  { 
    id: 'fn-2', 
    name: 'High-Value Tag Validator', 
    description: 'Appends a warning string inside narration for auditor visibility above threshold.', 
    code: 'function onVoucherPreSave(voucher) {\n  if (voucher.amountValue > 25000) {\n    voucher.narration = "*** REVIEW REQUIRED *** " + voucher.narration;\n  }\n  return voucher;\n}',
    isActive: false 
  }
];

export const initialReminderConfig: ReminderConfig[] = [
  {
    id: 'rem-config',
    emailTemplate: 'Dear {customer},\n\nThis is a friendly reminder that invoice {invoiceNo} for ₹{amount} is currently due. Please expedite payment to avoid interest charges.\n\nBest regards,\nAccounting Team\nSirach Technology',
    whatsappTemplate: '*Payment Reminder:* Hello {customer}, Invoice {invoiceNo} of *₹{amount}* is pending clearance. Kindly settle it online. Thank you!',
    enableEmail: true,
    enableWhatsapp: true,
    reminderTriggerType: 'Immediate on Order Submit'
  }
];
