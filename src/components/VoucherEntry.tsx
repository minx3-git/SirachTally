import React, { useState, useEffect, useMemo } from 'react';
import { 
  Lock, 
  Trash2, 
  PlusCircle, 
  CheckCircle, 
  AlertTriangle, 
  ArrowLeftRight, 
  FileSpreadsheet, 
  Plus, 
  BarChart,
  X,
  Sparkles
} from 'lucide-react';
import { LedgerAccount, Voucher, VoucherItem, VoucherType, TransactionStatus } from '../types';

interface VoucherEntryProps {
  accounts: LedgerAccount[];
  vouchers: Voucher[];
  onAddVoucher: (newVoucher: Voucher) => void;
  onAddLedgerAccount: (newAccount: LedgerAccount) => void;
  onCancel: () => void;
}

export default function VoucherEntry({
  accounts,
  vouchers,
  onAddVoucher,
  onAddLedgerAccount,
  onCancel,
}: VoucherEntryProps) {
  // Main form fields
  const [vchDate, setVchDate] = useState('2023-10-27');
  const [vchType, setVchType] = useState<VoucherType>('Journal');
  const [refNum, setRefNum] = useState('REF-2023-001');
  const [generalNarration, setGeneralNarration] = useState('');

  // Row entries
  const [rows, setRows] = useState<Array<{
    accountId: string;
    debitStr: string;
    creditStr: string;
    description: string;
  }>>([
    { accountId: 'admin-expenses', debitStr: '1250.00', creditStr: '', description: '' },
    { accountId: 'cash-in-hand', debitStr: '', creditStr: '1250.00', description: 'Office supplies reimbursement' },
    { accountId: '', debitStr: '', creditStr: '', description: '' },
  ]);

  // Modal toggles
  const [showLedgerModal, setShowLedgerModal] = useState(false);
  const [newAccName, setNewAccName] = useState('');
  const [newAccType, setNewAccType] = useState<any>('Expense');
  const [newAccCode, setNewAccCode] = useState('');
  const [newAccBalance, setNewAccBalance] = useState('0.00');

  // CSV Import toggle
  const [showImportAlert, setShowImportAlert] = useState(false);

  // Auto-generate reference on type change
  useEffect(() => {
    const prefix = vchType.substring(0, 3).toUpperCase();
    const random = Math.floor(100 + Math.random() * 900);
    setRefNum(`REF-${prefix}-${random}`);
  }, [vchType]);

  // Handle calculated debits and credits
  const totals = useMemo(() => {
    let debits = 0;
    let credits = 0;
    rows.forEach(r => {
      debits += parseFloat(r.debitStr) || 0;
      credits += parseFloat(r.creditStr) || 0;
    });
    return {
      debits,
      credits,
      isBalanced: Math.abs(debits - credits) < 0.01 && debits > 0,
      diff: Math.abs(debits - credits)
    };
  }, [rows]);

  // Add row target
  const handleAddRow = () => {
    setRows([...rows, { accountId: '', debitStr: '', creditStr: '', description: '' }]);
  };

  const handleRemoveRow = (idx: number) => {
    const updated = [...rows];
    updated.splice(idx, 1);
    setRows(updated);
  };

  const handleRowChange = (idx: number, field: string, val: string) => {
    const updated = [...rows];
    updated[idx] = { ...updated[idx], [field]: val };
    setRows(updated);
  };

  // Create a new ledger dynamically
  const handleCreateLedgerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccName.trim()) return;

    const code = newAccCode.trim() || Math.floor(4000 + Math.random() * 2000).toString();
    const id = newAccName.toLowerCase().replace(/\s+/g, '-');
    
    // Create new account structure
    const newAccount: LedgerAccount = {
      id,
      name: newAccName,
      code,
      type: newAccType,
      balance: parseFloat(newAccBalance) || 0,
      balanceType: newAccType === 'Liability' || newAccType === 'Equity' || newAccType === 'Income' ? 'Cr' : 'Dr'
    };

    onAddLedgerAccount(newAccount);
    
    // Reset modal state
    setNewAccName('');
    setNewAccCode('');
    setNewAccBalance('0.00');
    setShowLedgerModal(false);
    
    // Auto-fill last row with this newly created account
    const updatedRows = [...rows];
    const emptyIdx = updatedRows.findIndex(r => !r.accountId);
    if (emptyIdx !== -1) {
      updatedRows[emptyIdx].accountId = id;
    } else {
      updatedRows.push({ accountId: id, debitStr: '', creditStr: '', description: '' });
    }
    setRows(updatedRows);
  };

  // Submit Voucher entry
  const handleSubmitVoucher = (closeAfterSave: boolean) => {
    if (!totals.isBalanced) {
      alert(`Unbalanced double entry! Decimals must align perfectly. Current imbalance is: $${totals.diff.toFixed(2)}`);
      return;
    }

    // Capture first account with debit and credit
    const selectedParticulars = accounts.find(a => a.id === rows[0]?.accountId)?.name || 'General Ledger Entry';

    const voucherItems: VoucherItem[] = rows
      .filter(r => r.accountId)
      .map((r, i) => {
        const acc = accounts.find(a => a.id === r.accountId);
        return {
          id: `item-ent-${Date.now()}-${i}`,
          accountId: r.accountId,
          accountName: acc?.name || 'Selected Account',
          debit: parseFloat(r.debitStr) || null,
          credit: parseFloat(r.creditStr) || null,
          itemNarration: r.description || generalNarration || 'Posted double entry'
        };
      });

    const newVch: Voucher = {
      id: `vch-${Date.now()}`,
      vchNo: `VCH-2023-${Math.floor(200 + Math.random() * 800)}`,
      date: vchDate,
      vchType,
      reference: refNum,
      narration: generalNarration || 'Precision bookkeeping entry',
      status: 'Cleared',
      particulars: selectedParticulars,
      amountValue: totals.debits,
      items: voucherItems
    };

    onAddVoucher(newVch);
    alert('Voucher posted successfully to General Ledger!');

    if (closeAfterSave) {
      onCancel(); // goes back to Dashboard
    } else {
      // Keep adding new: resets inputs
      setVchDate('2023-10-27');
      setVchType('Journal');
      setGeneralNarration('');
      setRows([
        { accountId: '', debitStr: '', creditStr: '', description: '' },
        { accountId: '', debitStr: '', creditStr: '', description: '' },
      ]);
    }
  };

  // Filter out recent journal logs
  const recentJournalEntries = useMemo(() => {
    return vouchers
      .filter(v => v.vchType === 'Journal' || v.vchNo.includes('101') || v.vchNo.includes('102'))
      .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [vouchers]);

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
      
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">New Voucher Entry</h2>
          <p className="text-slate-500 text-xs mt-0.5">Capturing system financial adjustments of custom accounts</p>
        </div>
        
        <div className="flex gap-2.5">
          <button 
            type="button"
            onClick={() => setShowImportAlert(true)}
            className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
            Import CSV
          </button>
          <button 
            type="button"
            onClick={() => setShowLedgerModal(true)}
            className="px-4 py-2 bg-brand-primary hover:bg-brand-primary-container text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
          >
            <Plus className="h-4 w-4 text-sky-300" />
            New Ledger Account
          </button>
        </div>
      </div>

      {/* CSV Import Alert Overlay */}
      {showImportAlert && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start gap-3 relative shadow-xs">
          <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-emerald-900">Spreadsheet Auto-Align Ready</p>
            <p className="text-xs text-emerald-800 mt-1">Ready to compile local spreadsheets. Excel / CSV logs automatically parse debit and credit balances inline. Align columns layout: [Account Name, Debit, Credit, Narration].</p>
            <button 
              onClick={() => {
                // Populate with some mock parsed values
                setRows([
                  { accountId: 'rent-expense', debitStr: '5000.00', creditStr: '', description: 'Imported office lease allocation' },
                  { accountId: 'hdfc-bank', debitStr: '', creditStr: '5000.00', description: 'Direct wire withdrawal' }
                ]);
                setShowImportAlert(false);
              }}
              className="mt-3 px-3 py-1.5 bg-emerald-700 text-white hover:bg-emerald-800 rounded font-bold text-[10px] uppercase tracking-wider transition-colors"
            >
              Parse Faux CSV (Mock Lease)
            </button>
          </div>
          <button 
            onClick={() => setShowImportAlert(false)}
            className="absolute right-2 top-2 p-1 hover:bg-emerald-100 rounded text-emerald-800 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Form Fields Header Card */}
      <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs grid grid-cols-1 md:grid-cols-4 gap-4">
        
        <div className="flex flex-col gap-1.5">
          <label className="text-slate-500 font-bold text-[10px] uppercase tracking-widest">Voucher Date</label>
          <input 
            type="date" 
            value={vchDate}
            onChange={(e) => setVchDate(e.target.value)}
            className="border border-slate-200 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary rounded-lg px-3 py-2 bg-slate-50 font-medium text-xs text-slate-700 focus:outline-hidden"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-slate-500 font-bold text-[10px] uppercase tracking-widest">Voucher Type</label>
          <select 
            value={vchType}
            onChange={(e) => setVchType(e.target.value as VoucherType)}
            className="border border-slate-200 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary rounded-lg px-3 py-2 bg-slate-50 font-medium text-xs text-slate-700 focus:outline-hidden shadow-2xs"
          >
            <option value="Payment">Payment</option>
            <option value="Receipt">Receipt</option>
            <option value="Contra">Contra</option>
            <option value="Journal">Journal</option>
            <option value="Sales">Sales</option>
            <option value="Purchase">Purchase</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-slate-500 font-bold text-[10px] uppercase tracking-widest">Reference Number</label>
          <input 
            type="text" 
            value={refNum}
            onChange={(e) => setRefNum(e.target.value)}
            className="border border-slate-200 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary rounded-lg px-3 py-2 bg-slate-50 font-medium text-xs text-slate-700 focus:outline-hidden"
            placeholder="REF-2023-001"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-slate-500 font-bold text-[10px] uppercase tracking-widest">Currency</label>
          <div className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200/60 rounded-lg text-slate-600 flex justify-between items-center border border-slate-200 font-semibold text-xs tracking-tight transition-colors">
            <span>USD - US Dollar</span>
            <Lock className="h-3.5 w-3.5 text-slate-400" />
          </div>
        </div>

      </div>

      {/* Dynamic Journal Rows Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-100 font-semibold uppercase text-slate-400 select-none">
                <th className="py-2.5 px-4 w-12 text-center">#</th>
                <th className="py-2.5 px-4 min-w-[240px]">Account / Ledger Name</th>
                <th className="py-2.5 px-4 text-right w-44">Debit ($)</th>
                <th className="py-2.5 px-4 text-right w-44">Credit ($)</th>
                <th className="py-2.5 px-4">Narration</th>
                <th className="py-2.5 px-4 w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {rows.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition-colors group">
                  
                  {/* Row Indicator */}
                  <td className="px-4 py-3 text-center text-slate-400 font-bold">{idx + 1}</td>
                  
                  {/* Account Selector */}
                  <td className="px-4 py-2">
                    <select
                      value={row.accountId}
                      onChange={(e) => handleRowChange(idx, 'accountId', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-100 hover:border-slate-300 focus:border-brand-primary focus:ring-0 rounded px-2.5 py-1.5 text-xs text-slate-700 focus:outline-hidden"
                    >
                      <option value="">-- Choose Account --</option>
                      {accounts.map(acc => (
                        <option key={acc.id} value={acc.id}>{acc.name} ({acc.code})</option>
                      ))}
                    </select>
                  </td>

                  {/* Debit Amount */}
                  <td className="px-4 py-2">
                    <input 
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      disabled={!!row.creditStr}
                      value={row.debitStr}
                      onChange={(e) => handleRowChange(idx, 'debitStr', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-100 hover:border-slate-300 focus:border-brand-primary focus:ring-0 rounded px-2.5 py-1.5 text-right font-mono text-xs text-slate-700 placeholder:text-slate-400 disabled:opacity-40 tabular-numbers focus:outline-hidden font-semibold"
                    />
                  </td>

                  {/* Credit Amount */}
                  <td className="px-4 py-2">
                    <input 
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      disabled={!!row.debitStr}
                      value={row.creditStr}
                      onChange={(e) => handleRowChange(idx, 'creditStr', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-100 hover:border-slate-300 focus:border-brand-primary focus:ring-0 rounded px-2.5 py-1.5 text-right font-mono text-xs text-slate-700 placeholder:text-slate-400 disabled:opacity-40 tabular-numbers focus:outline-hidden font-semibold"
                    />
                  </td>

                  {/* Ledger Row specific description field */}
                  <td className="px-4 py-2">
                    <input 
                      type="text"
                      placeholder="Add line narration..."
                      value={row.description}
                      onChange={(e) => handleRowChange(idx, 'description', e.target.value)}
                      className="w-full bg-transparent border-none py-1.5 text-xs text-slate-600 placeholder:text-slate-300 italic focus:ring-0 focus:outline-hidden"
                    />
                  </td>

                  {/* Trash Row Button */}
                  <td className="px-4 py-2 text-center">
                    {rows.length > 2 && (
                      <button 
                        type="button"
                        onClick={() => handleRemoveRow(idx)}
                        className="text-slate-400 hover:text-rose-600 p-1 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </td>

                </tr>
              ))}
            </tbody>
            <tfoot>
              
              {/* Dynamic Bottom calculations and status panel */}
              <tr className="bg-slate-50/70 border-t border-slate-200/90 font-bold text-slate-800">
                <td className="px-4 py-4 text-right uppercase text-[10px] tracking-wider text-slate-400" colSpan={2}>
                  Voucher Aggregates
                </td>
                <td className="px-4 py-4 text-right font-mono text-brand-primary text-[13px] tabular-numbers border-none">
                  ${totals.debits.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="px-5 py-4 text-right font-mono text-emerald-800 text-[13px] tabular-numbers border-none">
                  ${totals.credits.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="px-4 py-4" colSpan={2}>
                  {totals.isBalanced ? (
                    <span className="bg-emerald-50 text-emerald-800 px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider inline-flex items-center gap-1 border border-emerald-200/60 select-none">
                      <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                      Balanced
                    </span>
                  ) : (
                    <span className="bg-rose-50 text-rose-800 px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider inline-flex items-center gap-1 border border-rose-200/60 select-none">
                      <AlertTriangle className="h-3.5 w-3.5 text-rose-500 animate-pulse" />
                      Unbalanced: {totals.debits > 0 || totals.credits > 0 ? `$${totals.diff.toFixed(2)}` : 'No Entry'}
                    </span>
                  )}
                </td>
              </tr>

            </tfoot>
          </table>
        </div>

        {/* Append Row Link footer */}
        <div className="p-3 bg-slate-50/30 border-t border-slate-100 text-left select-none">
          <button 
            type="button"
            onClick={handleAddRow}
            className="text-brand-primary hover:text-[#0b2f85] font-bold text-xs inline-flex items-center gap-1 cursor-pointer hover:underline pl-10"
          >
            <PlusCircle className="h-4 w-4" /> Add Ledger Entry Line
          </button>
        </div>
      </div>

      {/* Main Actions Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center bg-white border border-slate-200 p-4 rounded-xl gap-4 shadow-2xs">
        <div className="flex flex-col flex-1">
          <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1 select-none">General Voucher Narration</span>
          <textarea 
            rows={1}
            value={generalNarration}
            onChange={(e) => setGeneralNarration(e.target.value)}
            className="w-full text-slate-700 bg-slate-50 border border-slate-200 focus:border-brand-primary focus:ring-0 rounded-lg p-2.5 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-hidden resize-y"
            placeholder="Document general audit notes or authorization reason details here..."
          />
        </div>
        
        <div className="flex gap-2 shrink-0">
          <button 
            type="button" 
            onClick={onCancel}
            className="px-5 py-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-semibold cursor-pointer shadow-2xs transition-colors"
          >
            Cancel
          </button>
          
          <button 
            type="button"
            onClick={() => handleSubmitVoucher(false)}
            className="px-5 py-2.5 rounded-lg border-2 border-[#00236f] hover:border-brand-primary-container text-brand-primary font-bold text-xs cursor-pointer shadow-3xs transition-all bg-white hover:bg-slate-50"
          >
            Save &amp; New
          </button>
          
          <button 
            type="button"
            onClick={() => handleSubmitVoucher(true)}
            className="px-7 py-2.5 bg-[#00236f] hover:bg-brand-primary-container text-white font-bold text-xs rounded-lg shadow-xs transition-all cursor-pointer"
          >
            Save &amp; Close
          </button>
        </div>
      </div>

      {/* Audit History / Recent Vouchers and Account details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Left Double column: Recent Journal LogEntries */}
        <div className="md:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Recent Jnl Entries</h3>
          
          <div className="space-y-2.5">
            {recentJournalEntries.slice(0, 3).map((vch) => (
              <div 
                key={vch.id} 
                className="flex justify-between items-center p-3.5 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-100 hover:border-slate-200 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded bg-brand-primary-container/10 border border-brand-primary-container/15 flex items-center justify-center text-brand-primary">
                    <ArrowLeftRight className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-xs group-hover:text-brand-primary transition-colors">{vch.vchNo}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {new Date(vch.date).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })} • {vch.narration}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="font-mono font-semibold text-slate-800 text-xs tabular-numbers">${vch.amountValue?.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                  <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider mt-0.5 ${
                    vch.status === 'Cleared' 
                      ? 'bg-emerald-50 text-emerald-800' 
                      : 'bg-slate-100 text-slate-500'
                  }`}>
                    {vch.status === 'Cleared' ? 'Posted' : 'Draft'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right accounting summary widget details */}
        <div className="bg-[#00236f] bg-radial-at-br from-indigo-950 to-blue-900 text-white rounded-xl p-5 shadow-2xs relative overflow-hidden flex flex-col justify-between">
          <div className="relative z-10">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-sky-200/80 mb-5 select-none">Accounting Summary</h3>
            <div className="space-y-4">
              
              <div>
                <p className="text-[10px] text-sky-200 font-medium select-none uppercase tracking-wide">Daily Post Volume</p>
                <p className="text-xl font-bold mt-1 tabular-numbers">{vouchers.length + 15} Vouchers</p>
              </div>
              
              <div className="h-px bg-white/10"></div>
              
              <div>
                <p className="text-[10px] text-sky-200 font-medium select-none uppercase tracking-wide">Unbalanced Entries</p>
                <p className="text-xl font-bold font-mono mt-1 text-emerald-300">0</p>
              </div>

            </div>
          </div>

          <div className="absolute -right-8 -bottom-8 opacity-10 text-white">
            <BarChart className="h-44 w-44" />
          </div>

          <button 
            onClick={onCancel}
            className="mt-6 w-full py-2 bg-white text-brand-primary font-bold text-xs rounded-lg hover:bg-slate-100 active:scale-97 transition-all cursor-pointer shadow-3xs"
          >
            Review All Live Registers
          </button>
        </div>

      </div>

      {/* Ledger modal to dynamically insert a new account line item into our system */}
      {showLedgerModal && (
        <div className="fixed inset-0 bg-slate-950/45 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-300 rounded-xl max-w-md w-full p-6 shadow-2xl relative">
            <h3 className="text-base font-bold text-slate-900 inline-flex items-center gap-1.5 border-b border-slate-100 pb-2.5 w-full">
              <Sparkles className="h-4.5 w-4.5 text-indigo-600" />
              Create New Ledger Account
            </h3>
            
            <form onSubmit={handleCreateLedgerSubmit} className="mt-4 space-y-4">
              
              <div>
                <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1 select-none">Account Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Consulting Revenue, Marketing, Lease"
                  value={newAccName}
                  onChange={(e) => setNewAccName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary rounded-lg text-xs p-2 text-slate-700 placeholder:text-slate-400 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1 select-none">Code</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 5002, 1010"
                    value={newAccCode}
                    onChange={(e) => setNewAccCode(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary rounded-lg text-xs p-2 text-slate-700 placeholder:text-slate-400 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1 select-none">Type</label>
                  <select
                    value={newAccType}
                    onChange={(e) => setNewAccType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary rounded-lg text-xs p-2 text-slate-700 focus:outline-hidden shadow-2xs"
                  >
                    <option value="Asset">Asset</option>
                    <option value="Liability">Liability</option>
                    <option value="Equity">Equity</option>
                    <option value="Income">Income</option>
                    <option value="Expense">Expense</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1 select-none">Opening Balance ($)</label>
                <input 
                  type="number" 
                  step="0.01"
                  placeholder="0.00"
                  value={newAccBalance}
                  onChange={(e) => setNewAccBalance(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary rounded-lg text-xs p-2 text-slate-700 focus:outline-hidden font-mono"
                />
              </div>

              <div className="flex gap-2 justify-end pt-3">
                <button 
                  type="button"
                  onClick={() => setShowLedgerModal(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-sm transition-all"
                >
                  Create &amp; Select
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
