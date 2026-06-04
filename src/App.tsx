/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { 
  LayoutDashboard, 
  ReceiptText, 
  BookOpen, 
  TrendingUp, 
  Settings, 
  HelpCircle, 
  Search, 
  Bell, 
  History, 
  ChevronDown, 
  User, 
  RefreshCw,
  SlidersHorizontal,
  Info,
  Warehouse,
  Coins,
  Shield,
  FileCheck,
  Percent,
  Users,
  Building,
  Briefcase,
  Layers,
  X,
  Zap
} from 'lucide-react';
import { initialAccounts, initialVouchers } from './initialData';
import { LedgerAccount, Voucher, TransactionStatus } from './types';
import { 
  loadAccounts, 
  loadVouchers, 
  loadCompanies,
  loadCostCenters,
  loadStockItems,
  loadBoms,
  loadEmployees,
  loadOrders,
  loadChecks,
  loadBankStatements,
  loadAuditLogs,
  loadApprovalRules,
  addVoucherRecord, 
  addAccountRecord,
  saveCompanyRecord,
  saveCostCenterRecord,
  saveStockItemRecord,
  saveBomRecord,
  saveEmployeeRecord,
  saveOrderRecord,
  saveCheckRecord,
  saveBankStatementRecord,
  saveAuditLogRecord,
  saveApprovalRuleRecord,
  deleteApprovalRuleRecord
} from './firebaseService';

// Import newly generated extra database initializations
import { 
  initialCompanies, 
  initialCostCenters, 
  initialStockItems, 
  initialBoms, 
  initialEmployees, 
  initialOrders, 
  initialChecks, 
  initialBankStatements, 
  initialAuditLogs 
} from './initialExtraData';

// Importing view subcomponents
import Dashboard from './components/Dashboard';
import VoucherEntry from './components/VoucherEntry';
import LedgerView from './components/LedgerView';
import FinancialReports from './components/FinancialReports';
import MasterLedgerCosts from './components/MasterLedgerCosts';
import InventoryBom from './components/InventoryBom';
import SalesPurchaseManager from './components/SalesPurchaseManager';
import TaxationInvoicing from './components/TaxationInvoicing';
import PayrollSection from './components/PayrollSection';
import BankingHub from './components/BankingHub';
import AutomationHub from './components/AutomationHub';

type ERPTab = 'dashboard' | 'voucher' | 'ledger' | 'masters' | 'inventory' | 'orders' | 'taxation' | 'payroll' | 'banking' | 'reports' | 'automation';

export default function App() {
  const [currentTab, setCurrentTab] = useState<ERPTab>('dashboard');
  const [accounts, setAccounts] = useState<LedgerAccount[]>(initialAccounts);
  const [vouchers, setVouchers] = useState<Voucher[]>(initialVouchers);
  const [selectedLedgerId, setSelectedLedgerId] = useState<string>('hdfc-bank');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [approvalRules, setApprovalRules] = useState<any[]>([
    { id: 'rule-1', name: 'Large Cash Disbursement Audit', vchType: 'Payment', minAmount: 15000, approverRole: 'Rivera', isActive: true },
    { id: 'rule-2', name: 'Asset Acquisition Signoff', vchType: 'Contra', minAmount: 30000, approverRole: 'Rivera', isActive: true },
    { id: 'rule-3', name: 'Company Journal Adjustments', vchType: 'Journal', minAmount: 0, approverRole: 'Thompson', isActive: false }
  ]);

  // Corporate ERPEntity states
  const [companies, setCompanies] = useState(initialCompanies);
  const [selectedCompanyId, setSelectedCompanyId] = useState('sirach-tech');
  const [costCenters, setCostCenters] = useState(initialCostCenters);
  const [stockItems, setStockItems] = useState(initialStockItems);
  const [boms, setBoms] = useState(initialBoms);
  const [employees, setEmployees] = useState(initialEmployees);
  const [orders, setOrders] = useState(initialOrders);
  const [checks, setChecks] = useState(initialChecks);
  const [bankStatements, setBankStatements] = useState(initialBankStatements);
  const [auditLogs, setAuditLogs] = useState(initialAuditLogs);

  // Active auditor session
  const [activeUser, setActiveUser] = useState<'Rivera' | 'Thompson'>('Thompson');

  // Drawer toggles
  const [showSettingsDrawer, setShowSettingsDrawer] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);

  const selectedCompanyObj = useMemo(() => {
    return companies.find(c => c.id === selectedCompanyId) || companies[0];
  }, [companies, selectedCompanyId]);

  const profile = useMemo(() => {
    if (activeUser === 'Rivera') {
      return {
        name: 'Alex Rivera',
        role: 'Head Accountant',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDOcFK3vvC0sPvbMrhuDz_aItDGm2lkVh9fhNymI-EG_W5DhWFa-ExrYn-oR9pBOP63pf6okWgYTePoTFLBhWDQi_iu9oSlDq_m96tipTqBVlTdk6RzGxe9t_j0wizgXDiF2rfmJkdEakoxZRwIikkuOXbWpB_Pvhnr8CwgaFZnMWs7dj2hG7F_snttRB_ABJ53HOs8HTySnJXRK79iuVpKKsZY9p8OZYi2VBRWrkAev-NwxTHUZF33BM9nKLe4CHGQriHnGbAgbLI'
      };
    } else {
      return {
        name: 'Alex Thompson',
        role: 'Senior Accountant',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB8soDN86VlAJIalO_sWlL5-zbGVOMDqa1suteOq8A0KSxGYjR8MS0UosUWbspAYy09mDg8KTITOijEJXeFzUJGUtAkxKEJP3wGwa6QsRHMF6Osu3GYMndNkc-DHw-OD7DO1DE6YHGGz3BNMH-Zt4oepre01wtBmeS9DFQAEBHwM-BHr14Sf-kInYc8RHDFtSs_Wh12lLcdCyhSwasDmF9yVlOsZVE4llveMWmhwOHZvREz-j2FAoUtdOqh5iZnaaxgSrZhcA7w5tc'
      };
    }
  }, [activeUser]);

  // Log system action to Audit Trail
  const logAuditPayload = async (action: string, moduleName: string, detailsInfo: string) => {
    const timestampStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const newEntry = {
      id: 'audit-' + Math.random().toString(36).substring(2, 9),
      timestamp: timestampStr,
      userName: profile.name,
      userRole: profile.role,
      action: action,
      module: moduleName,
      details: detailsInfo
    };
    setAuditLogs(prev => [newEntry, ...prev]);
    try {
      await saveAuditLogRecord(newEntry);
    } catch (error) {
      console.error('Failed to sync audit log to Firebase', error);
    }
  };

  // Add double entry vouchers (with Multi-Criteria trigger rules routing)
  const handleAddVoucher = async (newVch: Voucher) => {
    setIsSyncing(true);

    // Apply any active policy check
    const matchingRule = approvalRules.find(rule => 
      rule.isActive && 
      rule.vchType === newVch.vchType && 
      (newVch.amountValue ?? 0) >= rule.minAmount
    );

    let processedVch = { ...newVch };
    if (matchingRule) {
      processedVch.status = 'Pending' as const;
    }

    try {
      await addVoucherRecord(processedVch);
      await logAuditPayload(
        matchingRule ? 'Submit Voucher (Awaiting Approval)' : 'Create Voucher', 
        'VoucherLedger', 
        matchingRule 
          ? `Submitted ${processedVch.vchType} voucher ${processedVch.vchNo} worth ₹${processedVch.amountValue} for review (Rule matching: ${matchingRule.name})`
          : `Logged ${processedVch.vchType} voucher ${processedVch.vchNo} worth ₹${processedVch.amountValue}`
      );
    } catch (error) {
      console.error('Failed to save voucher to Firebase', error);
    } finally {
      setIsSyncing(false);
    }

    setVouchers(prev => [processedVch, ...prev]);

    // ONLY adjust balances instantly if status is Cleared
    if (processedVch.status === 'Cleared') {
      setAccounts(prevAccounts => {
        return prevAccounts.map(acc => {
          let balanceModifier = 0;
          
          processedVch.items.forEach(item => {
            if (item.accountId === acc.id) {
              const debitVal = item.debit ?? 0;
              const creditVal = item.credit ?? 0;
              
              if (acc.type === 'Asset' || acc.type === 'Expense') {
                balanceModifier += (debitVal - creditVal);
              } else {
                balanceModifier += (creditVal - debitVal);
              }
            }
          });

          if (balanceModifier !== 0) {
            const currentBal = acc.balance + balanceModifier;
            return {
              ...acc,
              balance: Math.max(0, currentBal)
            };
          }
          return acc;
        });
      });
    }
  };

  // Interactive handler for Workflow clearances (Pending -> Cleared)
  const handleUpdateVoucherStatus = async (voucherId: string, newStatus: TransactionStatus) => {
    setIsSyncing(true);
    try {
      const vch = vouchers.find(v => v.id === voucherId);
      if (vch) {
        const oldStatus = vch.status;
        const updatedVch = { ...vch, status: newStatus };
        
        await addVoucherRecord(updatedVch);
        setVouchers(prev => prev.map(v => v.id === voucherId ? updatedVch : v));
        
        // If approved (Pending -> Cleared), now apply its balances to accounts
        if (oldStatus !== 'Cleared' && newStatus === 'Cleared') {
          setAccounts(prevAccounts => {
            return prevAccounts.map(acc => {
              let balanceModifier = 0;
              vch.items.forEach(item => {
                if (item.accountId === acc.id) {
                  const debitVal = item.debit ?? 0;
                  const creditVal = item.credit ?? 0;
                  if (acc.type === 'Asset' || acc.type === 'Expense') {
                    balanceModifier += (debitVal - creditVal);
                  } else {
                    balanceModifier += (creditVal - debitVal);
                  }
                }
              });
              if (balanceModifier !== 0) {
                return { ...acc, balance: Math.max(0, acc.balance + balanceModifier) };
              }
              return acc;
            });
          });
          await logAuditPayload('Approve Voucher', 'Workflows', `Cleared Voucher ${vch.vchNo} (Value: ₹${vch.amountValue || 0})`);
        } else if (newStatus === 'Declined') {
          await logAuditPayload('Reject Voucher', 'Workflows', `Rejected Voucher ${vch.vchNo} (Value: ₹${vch.amountValue || 0})`);
        }
      }
    } catch (error) {
      console.error('Failed to update voucher status', error);
    } finally {
      setIsSyncing(false);
    }
  };

  // Callback to append custom ledger account
  const handleAddLedgerAccount = async (newAccount: LedgerAccount) => {
    setIsSyncing(true);
    try {
      await addAccountRecord(newAccount);
      await logAuditPayload('Create Account', 'LedgerMaster', `Onboarded new ledger account of segment ${newAccount.type}: ${newAccount.name}`);
    } catch (error) {
      console.error('Failed to save account to Firebase', error);
    } finally {
      setIsSyncing(false);
    }

    setAccounts(prev => {
      if (prev.some(a => a.id === newAccount.id)) return prev;
      return [...prev, newAccount];
    });
  };

  const handleSelectLedger = (ledgerId: string) => {
    setSelectedLedgerId(ledgerId);
    setCurrentTab('ledger');
  };

  // Auto load Firebase initial metrics
  useEffect(() => {
    async function fetchRemoteData() {
      try {
        const [
          dbAccounts, 
          dbVouchers,
          dbCompanies,
          dbCostCenters,
          dbStockItems,
          dbBoms,
          dbEmployees,
          dbOrders,
          dbChecks,
          dbBankStatements,
          dbAuditLogs,
          dbApprovalRules
        ] = await Promise.all([
          loadAccounts(), 
          loadVouchers(),
          loadCompanies(),
          loadCostCenters(),
          loadStockItems(),
          loadBoms(),
          loadEmployees(),
          loadOrders(),
          loadChecks(),
          loadBankStatements(),
          loadAuditLogs(),
          loadApprovalRules()
        ]);

        if (dbAccounts?.length) setAccounts(dbAccounts);
        if (dbVouchers?.length) setVouchers(dbVouchers);
        if (dbCompanies?.length) setCompanies(dbCompanies);
        if (dbCostCenters?.length) setCostCenters(dbCostCenters);
        if (dbStockItems?.length) setStockItems(dbStockItems);
        if (dbBoms?.length) setBoms(dbBoms);
        if (dbEmployees?.length) setEmployees(dbEmployees);
        if (dbOrders?.length) setOrders(dbOrders);
        if (dbChecks?.length) setChecks(dbChecks);
        if (dbBankStatements?.length) setBankStatements(dbBankStatements);
        if (dbAuditLogs?.length) setAuditLogs(dbAuditLogs);
        if (dbApprovalRules?.length) setApprovalRules(dbApprovalRules);
      } catch (error) {
        console.error('Firebase load failed', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchRemoteData();
  }, []);

  return (
    <div className="flex h-screen w-screen bg-[#faf8ff] text-slate-800 font-sans overflow-hidden select-none">
      
      {/* Permanent Fixed Left Sidebar Navigation */}
      <aside className="w-[240px] h-full fixed left-0 top-0 border-r border-slate-200/90 flex flex-col justify-between py-5 bg-white z-40 shadow-xs overflow-y-auto">
        <div>
          {/* Brand header & Company Switcher */}
          <div className="px-5 mb-5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-[#00236f] font-extrabold text-sm tracking-tight flex items-center gap-1">
                  <span>Sirach Tally</span>
                </h1>
                <p className="text-slate-400 font-bold text-[9px] uppercase tracking-widest mt-0.5">Enterprise ERP</p>
              </div>
              
              <button 
                onClick={() => {
                  const nextUser = activeUser === 'Rivera' ? 'Thompson' : 'Rivera';
                  setActiveUser(nextUser);
                  logAuditPayload('Switch Operator', 'Authentication', `Changed active staff profile to ${nextUser === 'Rivera' ? 'Alex Rivera' : 'Alex Thompson'}`);
                }}
                title="Switch active accountant profile"
                className="p-1 px-1.5 rounded border border-slate-100 hover:bg-slate-50 cursor-pointer shadow-3xs text-[10px] text-slate-500 font-bold flex items-center gap-1"
              >
                <RefreshCw className="h-3 w-3 text-[#00236f]" />
                Role
              </button>
            </div>

            {/* NEW: Multi-Company Selection Dropdown */}
            <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
              <label className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">Trading Company entity</label>
              <div className="relative">
                <select 
                  value={selectedCompanyId} 
                  onChange={(e) => {
                    const choice = e.target.value;
                    setSelectedCompanyId(choice);
                    const name = companies.find(c => c.id === choice)?.name || '';
                    logAuditPayload('Switch Company', 'System', `Switched active ERP reporting company to ${name}`);
                  }}
                  className="w-full text-[11px] font-extrabold text-[#00236f] bg-transparent focus:outline-none pr-4 cursor-pointer"
                >
                  {companies.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* ERP Nav Tabs List */}
          <nav className="space-y-0.5 px-2">
            {[
              { id: 'dashboard', label: 'Dashboard summary', icon: LayoutDashboard },
              { id: 'voucher', label: 'Voucher Book Entry', icon: ReceiptText },
              { id: 'ledger', label: 'Generals Ledger', icon: BookOpen },
              { id: 'masters', label: 'Accounts & Cost Centers', icon: Layers },
              { id: 'inventory', label: 'Inventory & BOM', icon: Warehouse },
              { id: 'orders', label: 'Sales & Purchases CRM', icon: Briefcase },
              { id: 'taxation', label: 'GST Filing & Invoicing', icon: Percent },
              { id: 'payroll', label: 'Enterprise Payroll pays', icon: Users },
              { id: 'banking', label: 'Banking & Cheques', icon: Coins },
              { id: 'reports', label: 'Financial Reports & Audit', icon: TrendingUp },
              { id: 'automation', label: 'Workflow & n8n Automation', icon: Zap }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = currentTab === tab.id;
              return (
                <button 
                  key={tab.id}
                  onClick={() => setCurrentTab(tab.id as ERPTab)}
                  className={`w-full flex items-center px-3.5 py-1.5 gap-2.5 rounded-md font-bold text-[11px] cursor-pointer transition-all ${
                    isActive 
                      ? 'bg-blue-50 text-[#00236f] border-l-4 border-[#00236f]' 
                      : 'text-slate-500 hover:bg-slate-50 border-l-4 border-transparent'
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Support links & User session Profile */}
        <div className="space-y-3 mt-4">
          
          <div className="border-t border-slate-100 pt-3 px-2 space-y-0.5">
            <button 
              onClick={() => setShowSettingsDrawer(true)}
              className="w-full flex items-center gap-2.5 px-3.5 py-1.5 text-slate-500 hover:bg-slate-50 rounded text-[11px] font-bold text-left cursor-pointer transition-colors"
            >
              <Settings className="h-4 w-4 text-slate-400" />
              <span>Audit Controls Settings</span>
            </button>

            <button 
              onClick={() => setShowSupportModal(true)}
              className="w-full flex items-center gap-2.5 px-3.5 py-1.5 text-slate-500 hover:bg-slate-50 rounded text-[11px] font-bold text-left cursor-pointer transition-colors"
            >
              <HelpCircle className="h-4 w-4 text-slate-400" />
              <span>ERP System Support</span>
            </button>
          </div>

          {/* User profile capsule card */}
          <div className="px-5 pt-3 border-t border-slate-100 flex items-center gap-2.5">
            <img 
              referrerPolicy="no-referrer"
              src={profile.avatar} 
              alt="User profile avatar icon" 
              className="w-8 h-8 rounded-full object-cover border border-slate-200 shadow-3xs"
            />
            <div className="truncate">
              <p className="text-[11px] font-extrabold text-slate-800 leading-tight">{profile.name}</p>
              <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">{profile.role}</p>
            </div>
          </div>

        </div>
      </aside>

      {/* Main Content Area Container Fluid Layout */}
      <div className="pl-[240px] flex-1 flex flex-col h-full bg-[#faf8ff] relative">
        
        {/* Top Header navbar */}
        <header className="w-full h-16 bg-white border-b border-slate-200/90 flex justify-between items-center px-8 shrink-0 z-30">
          
          {/* Quick Active Company Title */}
          <div className="flex items-center gap-2">
            <Building className="h-4.5 w-4.5 text-[#00236f]" />
            <span className="text-xs font-extrabold text-slate-900">{selectedCompanyObj.name}</span>
            <span className="text-[9px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-extrabold font-mono">{selectedCompanyObj.gstin}</span>
          </div>

          {/* Header Actions */}
          <div className="flex items-center gap-4">
            
            {/* Quick fiscal dropdown indicator */}
            <div className="flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 px-3 py-1.5 rounded-lg text-xs font-bold text-[#00236f] cursor-pointer shadow-3xs transition-all">
              <span>FY 2023-24</span>
              <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
            </div>

            <div className="h-5 w-px bg-slate-200 mx-1"></div>

            {/* Net sync flag */}
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded">
              <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-pulse"></span> Cloud database synced
            </span>

          </div>

        </header>

        {/* Dynamic view render frame based on state */}
        <main className="flex-1 overflow-hidden flex flex-col relative bg-[#faf8ff]">
          {isLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-xs text-slate-400 font-bold space-y-2">
              <RefreshCw className="h-6 w-6 text-[#00236f] animate-spin" />
              <span>Booting ledger caches from Firebase Datastore...</span>
            </div>
          ) : (
            <>
              {currentTab === 'dashboard' && (
                <Dashboard 
                  accounts={accounts}
                  vouchers={vouchers}
                  onNavigate={(t) => setCurrentTab(t as ERPTab)}
                  onSelectLedger={handleSelectLedger}
                  onOpenQuickVoucher={() => setCurrentTab('voucher')}
                  onAddLedger={() => setCurrentTab('voucher')} 
                />
              )}

              {currentTab === 'voucher' && (
                <VoucherEntry 
                  accounts={accounts}
                  vouchers={vouchers}
                  onAddVoucher={handleAddVoucher}
                  onAddLedgerAccount={handleAddLedgerAccount}
                  onCancel={() => setCurrentTab('dashboard')}
                />
              )}

              {currentTab === 'ledger' && (
                <LedgerView 
                  accounts={accounts}
                  selectedLedgerId={selectedLedgerId}
                  onSelectLedger={setSelectedLedgerId}
                  vouchers={vouchers}
                />
              )}

              {currentTab === 'masters' && (
                <MasterLedgerCosts 
                  accounts={accounts}
                  costCenters={costCenters}
                  onAddAccount={handleAddLedgerAccount}
                  onAddCostCenter={async (cc) => {
                    setIsSyncing(true);
                    try {
                      await saveCostCenterRecord(cc);
                      setCostCenters(prev => [...prev, cc]);
                      await logAuditPayload('Create Cost Center', 'Masters', `Added Cost Center: ${cc.name}`);
                    } catch (error) {
                      console.error('Failed to sync cost center', error);
                    } finally {
                      setIsSyncing(false);
                    }
                  }}
                />
              )}

              {currentTab === 'inventory' && (
                <InventoryBom 
                  stockItems={stockItems}
                  boms={boms}
                  onAddStockItem={async (item) => {
                    setIsSyncing(true);
                    try {
                      await saveStockItemRecord(item);
                      setStockItems(prev => [...prev, item]);
                      await logAuditPayload('Log Inventory', 'Warehouse', `Updated Stock Item: ${item.name} Unit Rate: ₹${item.rate}`);
                    } catch (error) {
                      console.error('Failed to sync stock item', error);
                    } finally {
                      setIsSyncing(false);
                    }
                  }}
                  onAddBom={async (bom) => {
                    setIsSyncing(true);
                    try {
                      await saveBomRecord(bom);
                      setBoms(prev => [...prev, bom]);
                      await logAuditPayload('Design BOM', 'Manufacturing', `Formatted Bill of Materials Formula: ${bom.finishedGoodName}`);
                    } catch (error) {
                      console.error('Failed to sync BOM', error);
                    } finally {
                      setIsSyncing(false);
                    }
                  }}
                />
              )}

              {currentTab === 'orders' && (
                <SalesPurchaseManager 
                  orders={orders}
                  onAddOrder={async (ord) => {
                    setIsSyncing(true);
                    try {
                      await saveOrderRecord(ord);
                      setOrders(prev => [...prev, ord]);
                      await logAuditPayload('Create Order', 'OrderDesk', `Saved ${ord.orderType} registration sheet ${ord.orderNo}`);
                    } catch (error) {
                      console.error('Failed to sync order', error);
                    } finally {
                      setIsSyncing(false);
                    }
                  }}
                />
              )}

              {currentTab === 'taxation' && (
                <TaxationInvoicing />
              )}

              {currentTab === 'payroll' && (
                <PayrollSection 
                  employees={employees}
                  onAddEmployee={async (emp) => {
                    setIsSyncing(true);
                    try {
                      await saveEmployeeRecord(emp);
                      setEmployees(prev => [...prev, emp]);
                      await logAuditPayload('Onboard Employee', 'Payroll', `Authorized new staff master: ${emp.name}`);
                    } catch (error) {
                      console.error('Failed to sync employee', error);
                    } finally {
                      setIsSyncing(false);
                    }
                  }}
                  onUpdateAttendance={async (id, days) => {
                    setIsSyncing(true);
                    try {
                      const emp = employees.find(e => e.id === id);
                      if (emp) {
                        const updated = { ...emp, attendanceDays: days };
                        await saveEmployeeRecord(updated);
                        setEmployees(prev => prev.map(e => e.id === id ? updated : e));
                        await logAuditPayload('Update Attendance', 'Payroll', `Updated attendance for ${emp.name} to ${days} days`);
                      }
                    } catch (error) {
                      console.error('Failed to sync attendance', error);
                    } finally {
                      setIsSyncing(false);
                    }
                  }}
                />
              )}

              {currentTab === 'banking' && (
                <BankingHub 
                  checks={checks}
                  bankStatements={bankStatements}
                  onAddCheck={async (chk) => {
                    setIsSyncing(true);
                    try {
                      await saveCheckRecord(chk);
                      setChecks(prev => [...prev, chk]);
                      await logAuditPayload('Issue Cheque', 'Banking', `Logged Printed Check sheet: ${chk.checkNo} to ${chk.payee}`);
                    } catch (error) {
                      console.error('Failed to sync check', error);
                    } finally {
                      setIsSyncing(false);
                    }
                  }}
                  onClearStatementItem={async (id, matchedVch) => {
                    setIsSyncing(true);
                    try {
                      const item = bankStatements.find(st => st.id === id);
                      if (item) {
                        const updated = { ...item, isMatched: true, matchedVoucherNo: matchedVch };
                        await saveBankStatementRecord(updated);
                        setBankStatements(prev => prev.map(st => st.id === id ? updated : st));
                        await logAuditPayload('Check Reconciliation', 'Banking', `Matched statement ${id} against ledger voucher reference ${matchedVch}`);
                      }
                    } catch (error) {
                      console.error('Failed to sync statement', error);
                    } finally {
                      setIsSyncing(false);
                    }
                  }}
                />
              )}

              {currentTab === 'reports' && (
                <FinancialReports 
                  accounts={accounts}
                  vouchers={vouchers}
                  auditLogs={auditLogs}
                />
              )}

              {currentTab === 'automation' && (
                <AutomationHub 
                  vouchers={vouchers}
                  accounts={accounts}
                  activeUser={activeUser}
                  onAddVoucher={handleAddVoucher}
                  onUpdateVoucherStatus={handleUpdateVoucherStatus}
                  logAuditPayload={logAuditPayload}
                  approvalRules={approvalRules}
                  onAddApprovalRule={async (rule) => {
                    try {
                      await saveApprovalRuleRecord(rule);
                      setApprovalRules(prev => [...prev, rule]);
                    } catch (err) {
                      console.error('Error syncing rule creation', err);
                    }
                  }}
                  onToggleApprovalRule={async (id) => {
                    const rule = approvalRules.find(r => r.id === id);
                    if (rule) {
                      try {
                        const updated = { ...rule, isActive: !rule.isActive };
                        await saveApprovalRuleRecord(updated);
                        setApprovalRules(prev => prev.map(r => r.id === id ? updated : r));
                      } catch (err) {
                        console.error('Error toggling rule', err);
                      }
                    }
                  }}
                  onDeleteApprovalRule={async (id) => {
                    try {
                      await deleteApprovalRuleRecord(id);
                      setApprovalRules(prev => prev.filter(r => r.id !== id));
                    } catch (err) {
                      console.error('Error deleting rule', err);
                    }
                  }}
                />
              )}
            </>
          )}
        </main>

      </div>

      {/* Settings Modal Drawer panel */}
      {showSettingsDrawer && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-3xs flex justify-end z-50">
          <div className="bg-white max-w-sm w-full h-full p-6 shadow-2xl flex flex-col justify-between">
            <div className="space-y-5">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-1.5">
                  <SlidersHorizontal className="h-4.5 w-4.5 text-[#00236f]" />
                  ERP Security & Audit Settings
                </h3>
                <button 
                  onClick={() => setShowSettingsDrawer(false)}
                  className="p-1 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-4">
                <p className="text-xs text-slate-500 leading-relaxed font-semibold">Customize security protocols, toggle double-entry flags, and perform backups verification.</p>
                
                <div className="space-y-3 pt-2 text-xs">
                  <label className="flex items-center gap-2.5 font-semibold text-slate-700 cursor-pointer select-none">
                    <input type="checkbox" defaultChecked className="rounded border-slate-200 text-[#00236f]" />
                    <span>Auto-verify double entry balances</span>
                  </label>

                  <label className="flex items-center gap-2.5 font-semibold text-slate-700 cursor-pointer select-none">
                    <input type="checkbox" defaultChecked className="rounded border-slate-200 text-[#00236f]" />
                    <span>Enforce statutory TDS withholdings checks</span>
                  </label>

                  <label className="flex items-center gap-2.5 font-semibold text-slate-700 cursor-pointer select-none">
                    <input type="checkbox" defaultChecked className="rounded border-slate-200 text-[#00236f]" />
                    <span>Real-time blockchain audit receipts signing</span>
                  </label>
                </div>

                <div className="p-3 bg-[#faf8ff] rounded-lg border border-slate-200/60 mt-4 text-xs space-y-2">
                  <span className="font-extrabold block text-slate-700 uppercase tracking-widest text-[9px]">Administrative Backups</span>
                  <div className="flex gap-2">
                    <button 
                      type="button"
                      onClick={() => alert('Encrypted fiscal backup compiled. Save target: sirach_backup_2026.zip')}
                      className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 rounded font-extrabold text-[10px] text-center"
                    >
                      Backup now
                    </button>
                    <button 
                      type="button"
                      onClick={() => alert('Restoration target initiated. Balance caches validated.')}
                      className="flex-1 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded font-extrabold text-[10px] text-center"
                    >
                      Restore database
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <button 
              onClick={() => {
                setShowSettingsDrawer(false);
                alert('Auditing tolerances locked.');
              }}
              className="w-full py-2.5 bg-[#00236f] hover:bg-brand-primary text-white font-extrabold text-xs rounded-lg transition-all cursor-pointer shadow-xs text-center"
            >
              Lock modifications permissions
            </button>
          </div>
        </div>
      )}

      {/* Support Info Modal overlay */}
      {showSupportModal && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-3xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-xl p-6 max-w-sm w-full shadow-2xl relative">
            <h4 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-1.5 select-none">
              <Info className="h-4.5 w-4.5 text-emerald-600" />
              Sirach Tally Support Guide
            </h4>
            
            <p className="text-xs text-slate-500 leading-relaxed mt-3 pr-2.5 font-semibold">
              Operational handbook for the Sirach Auditor desk. Balances and debit/credit ledger sheets map exactly to tax authority guidelines (GSTR-3B Compliant) and support multiple godowns storage calculations.
            </p>

            <div className="mt-4 p-3 bg-[#faf8ff] rounded-lg text-[10px] text-[#00236f] font-bold border border-[#1e3a8a]/10">
              <p>📍 Support Dispatch Contact: reach our internal operations helpdesk or email accountants directly at core-support@sirach.com</p>
            </div>

            <button 
              onClick={() => setShowSupportModal(false)}
              className="mt-5 w-full py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-lg select-none cursor-pointer text-center"
            >
              Dismiss Help Manual
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
