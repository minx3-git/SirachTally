import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore'
import { db } from './firebase'
import type { LedgerAccount, Voucher } from './types'
import type { 
  Company, 
  CostCenter, 
  StockItem, 
  BillOfMaterial, 
  Employee, 
  SalesPurchaseOrder, 
  BankCheck, 
  BankStatementItem, 
  AuditLogEntry 
} from './types-extra'

import { initialAccounts, initialVouchers } from './initialData'
import { 
  initialCompanies, 
  initialCostCenters, 
  initialStockItems, 
  initialBoms, 
  initialEmployees, 
  initialOrders, 
  initialChecks, 
  initialBankStatements, 
  initialAuditLogs,
  initialWebhooks,
  initialApprovalRules,
  initialRecurringConfigs,
  initialCustomFunctions,
  initialReminderConfig
} from './initialExtraData'

import {
  WebhookConfig,
  ApprovalRule,
  RecurringConfig,
  CustomFunction,
  ReminderConfig
} from './types-extra'

// --- Operational Safety Error Handler ---
enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: null // App has mock session roles on window/auth for local presentation
    },
    operationType,
    path
  };
  console.error('Firestore Error Payload:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

import firebaseConfig from '../firebase-applet-config.json'

// --- Universal Type-Safe Collection Sync Seeding Core ---
const isFirebaseConfigured = !!(
  firebaseConfig &&
  firebaseConfig.projectId
);

export async function loadCollection<T extends { id: string }>(
  collectionName: string,
  initialSeedData: T[]
): Promise<T[]> {
  const isBypassActive = typeof window !== 'undefined' && !!localStorage.getItem('sirach_active_bypass_user');

  if (!isFirebaseConfigured || isBypassActive) {
    if (isBypassActive) {
      console.log(`📡 [Sandbox Mode] Active local sandbox session. Return local key-value storage for '${collectionName}'.`);
      const stored = localStorage.getItem(`sirach_sandbox_col_${collectionName}`);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (e) {
          console.error(`Failed to parse local sandbox storage for ${collectionName}:`, e);
        }
      }
      // First-time load: seed local storage with the default ERP seed data
      localStorage.setItem(`sirach_sandbox_col_${collectionName}`, JSON.stringify(initialSeedData));
    } else {
      console.log(`📡 [Local Mode] Firebase not configured. Safe fallback to local seed data for '${collectionName}'.`);
    }
    return initialSeedData;
  }

  try {
    console.log(`📥 Syncing '${collectionName}' with Firebase Firestore...`);
    const colRef = collection(db, collectionName);
    const snapshot = await getDocs(colRef);

    if (snapshot.empty) {
      console.log(`🌱 Seeding empty Firebase collection '${collectionName}' with ${initialSeedData.length} records...`);
      for (const item of initialSeedData) {
        // Enforce Firestore document ID matches resource ID to prevent duplication
        await setDoc(doc(db, collectionName, item.id), item);
      }
      return initialSeedData;
    }

    const data = snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    })) as T[];

    console.log(`✅ Loaded ${data.length} synchronized records from '${collectionName}'`);
    return data;
  } catch (error) {
    if (error instanceof Error && error.message.includes('permission')) {
      handleFirestoreError(error, OperationType.LIST, collectionName);
    }
    console.warn(`⚠️ Warning: Offline or permissions delay loading '${collectionName}'. Reverting to client instance caches.`, error);
    return initialSeedData;
  }
}

// --- General Record Save Routine ---
export async function saveRecord<T extends { id: string }>(
  collectionName: string,
  item: T
): Promise<void> {
  const isBypassActive = typeof window !== 'undefined' && !!localStorage.getItem('sirach_active_bypass_user');

  if (!isFirebaseConfigured || isBypassActive) {
    if (isBypassActive) {
      console.log(`💾 [Sandbox Mode] Saved '${item.id}' into collection '${collectionName}' locally.`);
      const stored = localStorage.getItem(`sirach_sandbox_col_${collectionName}`);
      let list: any[] = [];
      if (stored) {
        try {
          list = JSON.parse(stored);
        } catch (e) {
          console.error(e);
        }
      } else {
        list = [];
      }
      const filtered = list.filter((i: any) => i.id !== item.id);
      filtered.push(item);
      localStorage.setItem(`sirach_sandbox_col_${collectionName}`, JSON.stringify(filtered));
    } else {
      console.log(`💾 [Local Mode] Saved '${item.id}' into collection '${collectionName}' (Firebase not configured)`);
    }
    return;
  }

  try {
    const docRef = doc(db, collectionName, item.id);
    await setDoc(docRef, item);
    console.log(`📤 Synced doc '${item.id}' into collection '${collectionName}' successfully`);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${collectionName}/${item.id}`);
  }
}

// --- General Record Delete Routine ---
export async function deleteRecord(
  collectionName: string,
  id: string
): Promise<void> {
  const isBypassActive = typeof window !== 'undefined' && !!localStorage.getItem('sirach_active_bypass_user');

  if (!isFirebaseConfigured || isBypassActive) {
    if (isBypassActive) {
      console.log(`🗑️ [Sandbox Mode] Deleted reference '${id}' from '${collectionName}' locally.`);
      const stored = localStorage.getItem(`sirach_sandbox_col_${collectionName}`);
      if (stored) {
        try {
          const list = JSON.parse(stored);
          const filtered = list.filter((i: any) => i.id !== id);
          localStorage.setItem(`sirach_sandbox_col_${collectionName}`, JSON.stringify(filtered));
        } catch (e) {
          console.error(e);
        }
      }
    } else {
      console.log(`🗑️ [Local Mode] Deleted reference '${id}' from collection '${collectionName}' (Firebase not configured)`);
    }
    return;
  }

  try {
    const docRef = doc(db, collectionName, id);
    await deleteDoc(docRef);
    console.log(`🔥 Deleted doc '${id}' dynamically from collection '${collectionName}' successfully`);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${collectionName}/${id}`);
  }
}

// --- Entity API Sync Actions ---
export const loadAccounts = () => loadCollection<LedgerAccount>('accounts', initialAccounts);
export const loadVouchers = () => loadCollection<Voucher>('vouchers', initialVouchers);
export const loadCompanies = () => loadCollection<Company>('companies', initialCompanies);
export const loadCostCenters = () => loadCollection<CostCenter>('costCenters', initialCostCenters);
export const loadStockItems = () => loadCollection<StockItem>('stockItems', initialStockItems);
export const loadBoms = () => loadCollection<BillOfMaterial>('boms', initialBoms);
export const loadEmployees = () => loadCollection<Employee>('employees', initialEmployees);
export const loadOrders = () => loadCollection<SalesPurchaseOrder>('orders', initialOrders);
export const loadChecks = () => loadCollection<BankCheck>('checks', initialChecks);
export const loadBankStatements = () => loadCollection<BankStatementItem>('bankStatements', initialBankStatements);
export const loadAuditLogs = () => loadCollection<AuditLogEntry>('auditLogs', initialAuditLogs);

// New automation loader functions
export const loadWebhooks = () => loadCollection<WebhookConfig>('webhooks', initialWebhooks);
export const loadApprovalRules = () => loadCollection<ApprovalRule>('approvalRules', initialApprovalRules);
export const loadRecurringConfigs = () => loadCollection<RecurringConfig>('recurringConfigs', initialRecurringConfigs);
export const loadCustomFunctions = () => loadCollection<CustomFunction>('customFunctions', initialCustomFunctions);
export const loadReminderConfigs = () => loadCollection<ReminderConfig>('reminderConfigs', initialReminderConfig);

// Single Record Synced Savers
export const addAccountRecord = (account: LedgerAccount) => saveRecord<LedgerAccount>('accounts', account);
export const addVoucherRecord = (voucher: Voucher) => saveRecord<Voucher>('vouchers', voucher);
export const saveCompanyRecord = (company: Company) => saveRecord<Company>('companies', company);
export const saveCostCenterRecord = (costCenter: CostCenter) => saveRecord<CostCenter>('costCenters', costCenter);
export const saveStockItemRecord = (item: StockItem) => saveRecord<StockItem>('stockItems', item);
export const saveBomRecord = (bom: BillOfMaterial) => saveRecord<BillOfMaterial>('boms', bom);
export const saveEmployeeRecord = (employee: Employee) => saveRecord<Employee>('employees', employee);
export const saveOrderRecord = (order: SalesPurchaseOrder) => saveRecord<SalesPurchaseOrder>('orders', order);
export const saveCheckRecord = (check: BankCheck) => saveRecord<BankCheck>('checks', check);
export const saveBankStatementRecord = (item: BankStatementItem) => saveRecord<BankStatementItem>('bankStatements', item);
export const saveAuditLogRecord = (log: AuditLogEntry) => saveRecord<AuditLogEntry>('auditLogs', log);

// New automation record savers & deleters
export const saveWebhookRecord = (webhook: WebhookConfig) => saveRecord<WebhookConfig>('webhooks', webhook);
export const saveApprovalRuleRecord = (rule: ApprovalRule) => saveRecord<ApprovalRule>('approvalRules', rule);
export const saveRecurringConfigRecord = (config: RecurringConfig) => saveRecord<RecurringConfig>('recurringConfigs', config);
export const saveCustomFunctionRecord = (fn: CustomFunction) => saveRecord<CustomFunction>('customFunctions', fn);
export const saveReminderConfigRecord = (config: ReminderConfig) => saveRecord<ReminderConfig>('reminderConfigs', config);

export const deleteWebhookRecord = (id: string) => deleteRecord('webhooks', id);
export const deleteApprovalRuleRecord = (id: string) => deleteRecord('approvalRules', id);
export const deleteRecurringConfigRecord = (id: string) => deleteRecord('recurringConfigs', id);
export const deleteCustomFunctionRecord = (id: string) => deleteRecord('customFunctions', id);

// --- User Roles Query Helpers ---
export interface UserProfile {
  id: string; // Document ID is uid
  uid: string;
  email: string;
  name: string;
  role: string;
  updatedAt?: string;
}

export const loadUsers = () => loadCollection<UserProfile>('users', []);
export const saveUserRecord = (user: UserProfile) => saveRecord<UserProfile>('users', user);
