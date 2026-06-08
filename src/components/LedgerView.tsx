import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  Search, 
  Bell, 
  History, 
  ChevronDown, 
  Filter, 
  FileDown, 
  FileSpreadsheet, 
  TrendingUp, 
  Star, 
  AlertTriangle,
  ChevronRight,
  BookOpen
} from 'lucide-react';
import { LedgerAccount, Voucher } from '../types';

interface LedgerViewProps {
  accounts: LedgerAccount[];
  selectedLedgerId: string;
  onSelectLedger: (ledgerId: string) => void;
  vouchers: Voucher[];
}

export default function LedgerView({
  accounts,
  selectedLedgerId,
  onSelectLedger,
  vouchers,
}: LedgerViewProps) {
  const [fromDate, setFromDate] = useState('2023-10-01');
  const [toDate, setToDate] = useState('2023-10-31');
  const [searchTerm, setSearchTerm] = useState('');

  // Active bank or selected account
  const activeAccount = useMemo(() => {
    const safeAccounts = Array.isArray(accounts) ? accounts : [];
    return safeAccounts.find(a => a && a.id === selectedLedgerId) || safeAccounts[0] || {
      id: 'hdfc-bank',
      name: 'Default HDFC Bank',
      code: '1201',
      type: 'Asset',
      balance: 840250.00,
      balanceType: 'Dr',
      accNo: 'XXXX XXXX 4092',
      details: 'Primary Operating Account'
    };
  }, [accounts, selectedLedgerId]);

  // Is Indian currency formatting applicable?
  const isINR = activeAccount?.id === 'hdfc-bank';
  const currencySymbol = '₹';

  // Seed baseline static starting balance
  const openingBalance = useMemo(() => {
    if (!activeAccount) return 0;
    return activeAccount.balance ?? 0;
  }, [activeAccount]);

  // Dynamically extract matching ledger rows
  const ledgerRows = useMemo(() => {
    let rows: Array<{
      date: string;
      particulars: string;
      vchType: string;
      vchNo: string;
      debit: number | null;
      credit: number | null;
      balance: number;
      balanceType: 'Dr' | 'Cr';
    }> = [];

    const safeVouchers = Array.isArray(vouchers) ? vouchers : [];

    // Filter relevant voucher items
    const relevantVouchers = safeVouchers.filter(v => {
      if (!v) return false;

      // Check belongs to active ledger account
      if (!Array.isArray(v.items)) return false;

      // Check date bounds safely
      if (!v.date) return false;
      const vDate = new Date(v.date);
      if (isNaN(vDate.getTime())) return false;
      const start = new Date(fromDate);
      const end = new Date(toDate);
      if (vDate < start || vDate > end) return false;

      // Check search query matches safely
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchesParticulars = (v.particulars || '').toLowerCase().includes(term);
        const matchesVchNo = (v.vchNo || '').toLowerCase().includes(term);
        const matchesNarration = (v.narration || '').toLowerCase().includes(term);
        if (!matchesParticulars && !matchesVchNo && !matchesNarration) return false;
      }

      return v.items.some(item => item && item.accountId === activeAccount.id);
    });

    // Run running balance calculation using seed Opening
    let currentBalance = openingBalance;

    // Sort ascending by date for chronological calculation
    const sortedVouchers = [...relevantVouchers].sort((a, b) => {
      const timeA = a.date ? new Date(a.date).getTime() : 0;
      const timeB = b.date ? new Date(b.date).getTime() : 0;
      return timeA - timeB;
    });

    sortedVouchers.forEach(vch => {
      if (!vch || !Array.isArray(vch.items)) return;

      // Find matching item index
      const item = vch.items.find(i => i && i.accountId === activeAccount.id);
      if (!item) return;

      const dr = item.debit;
      const cr = item.credit;

      // Calculate how this ledger row balance shifts (Screenshot alignment)
      if (dr !== null && dr !== undefined) {
        currentBalance -= dr;  // payment outflows reduce asset index
      }
      if (cr !== null && cr !== undefined) {
        currentBalance += cr;  // deposits increment balance index
      }

      rows.push({
        date: vch.date || '',
        particulars: vch.particulars ?? vch.narration ?? 'General Entry',
        vchType: vch.vchType || 'Journal',
        vchNo: vch.vchNo || '',
        debit: dr,
        credit: cr,
        balance: currentBalance,
        balanceType: 'Dr'
      });
    });

    return rows;
  }, [vouchers, activeAccount, openingBalance, fromDate, toDate, searchTerm]);

  // Aggregate totals
  const aggregates = useMemo(() => {
    let totalDebit = 0;
    let totalCredit = 0;
    ledgerRows.forEach(r => {
      totalDebit += r.debit ?? 0;
      totalCredit += r.credit ?? 0;
    });

    const finalBalance = ledgerRows.length > 0
      ? ledgerRows[ledgerRows.length - 1].balance
      : openingBalance;

    return {
      totalDebit,
      totalCredit,
      finalBalance
    };
  }, [ledgerRows, openingBalance]);

  const handleExportPDF = () => {
    alert(`Exporting Ledger Statement for "${activeAccount.name}" as PDF. Audit trails validated for period: ${fromDate} to ${toDate}.`);
  };

  const handleExportExcel = () => {
    alert(`Spreadsheet exported for "${activeAccount.name}". Total debit volume is: ${currencySymbol}${aggregates.totalDebit.toLocaleString()}`);
  };

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
      
      {/* Account Info Header / Account Toggler */}
      <div className="flex flex-col md:flex-row md:items-stretch justify-between gap-4 p-5 bg-white border border-slate-200 rounded-xl shadow-2xs">
        <div className="space-y-3 flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-brand-primary-container/10 text-[#00236f] rounded-xl border border-brand-primary-container/15">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              {/* Account Dropdown Selector */}
              <div className="relative inline-block text-left">
                <select 
                  value={activeAccount.id}
                  onChange={(e) => onSelectLedger(e.target.value)}
                  className="font-bold text-lg text-slate-800 pr-10 focus:outline-hidden border-none p-0 bg-transparent ring-0 hover:text-brand-primary transition-all cursor-pointer rounded"
                >
                  {Array.isArray(accounts) && accounts.map(acc => (
                    acc && <option key={acc.id} value={acc.id}>{acc.name}</option>
                  ))}
                </select>
              </div>
              <p className="text-xs text-slate-400 mt-1">Acc No: {activeAccount.accNo || `XXXX-XXXX-CR-${activeAccount.code}`} • {activeAccount.details || 'General ledger accounts statements'}</p>
            </div>
          </div>
        </div>

        <div className="text-right p-4 bg-[#f4f3fa]/80 rounded-xl border border-slate-100 min-w-[240px] flex flex-col justify-center">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 select-none">Current Ledger Balance</p>
          <p className="text-xl sm:text-2xl font-bold text-brand-primary italic mt-1.5 tabular-numbers font-mono">
            {currencySymbol} {aggregates.finalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-xs font-semibold not-italic">Dr</span>
          </p>
        </div>
      </div>

      {/* Filters & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        
        {/* Date Filters Grid */}
        <div className="flex flex-wrap items-center gap-3">
          
          <div className="flex items-center bg-white border border-slate-200 rounded-lg px-3 py-1.5 shadow-2xs">
            <span className="text-xs text-slate-400 mr-2 uppercase font-bold tracking-wider">From</span>
            <input 
              type="date" 
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="border-none p-0 text-xs text-slate-700 font-bold focus:ring-0 bg-transparent cursor-pointer"
            />
          </div>

          <div className="flex items-center bg-white border border-slate-200 rounded-lg px-3 py-1.5 shadow-2xs">
            <span className="text-xs text-slate-400 mr-2 uppercase font-bold tracking-wider">To</span>
            <input 
              type="date" 
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="border-none p-0 text-xs text-slate-700 font-bold focus:ring-0 bg-transparent cursor-pointer"
            />
          </div>

          <div className="relative w-48 sm:w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input 
              type="text"
              placeholder="Search entries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-200 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-hidden shadow-2xs"
            />
          </div>

        </div>

        {/* Export Files Buttons */}
        <div className="flex items-center gap-2">
          <button 
            onClick={handleExportPDF}
            className="border border-slate-200 hover:border-slate-300 text-slate-600 bg-white px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
          >
            <FileDown className="h-4 w-4 text-rose-600" />
            Export to PDF
          </button>
          
          <button 
            onClick={handleExportExcel}
            className="border border-slate-200 hover:border-slate-300 text-slate-600 bg-white px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
            Export to Excel
          </button>
        </div>

      </div>

      {/* Transaction Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full border-collapse text-left text-xs">
            
            <thead className="bg-[#eeedf4]/50 text-slate-400 font-semibold uppercase tracking-wider sticky top-0 border-b border-slate-100 select-none">
              <tr>
                <th className="py-3 px-4 font-semibold text-slate-500">Date</th>
                <th className="py-3 px-4 font-semibold text-slate-500 min-w-[280px]">Particulars</th>
                <th className="py-3 px-4 font-semibold text-slate-500">Voucher Type</th>
                <th className="py-3 px-4 font-semibold text-slate-500">Vch No.</th>
                <th className="py-3 px-4 text-right font-semibold text-slate-500">Debit ({currencySymbol})</th>
                <th className="py-3 px-4 text-right font-semibold text-slate-500">Credit ({currencySymbol})</th>
                <th className="py-3 px-4 text-right font-semibold text-slate-500">Balance ({currencySymbol})</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 font-medium">
              
              {/* Opening Balance Row */}
              <tr className="bg-amber-50/20 font-bold border-b border-slate-100 text-slate-700">
                <td className="py-3 px-4 tabular-numbers font-mono text-slate-400">{new Date(fromDate).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                <td className="py-3 px-4" colSpan={5}>Opening Balance</td>
                <td className="py-3 px-4 text-right font-mono tabular-numbers font-bold text-slate-800">
                  {currencySymbol} {openingBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Dr
                </td>
              </tr>

              {/* Transaction Rows */}
              {ledgerRows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 italic">
                    {searchTerm ? 'No ledger rows match your query filter' : 'No adjustments reported during this calendar window.'}
                  </td>
                </tr>
              ) : (
                ledgerRows.map((row, idx) => (
                  <tr 
                    key={idx} 
                    className={`hover:bg-slate-50 transition-colors cursor-pointer border-b border-slate-100/60 ${idx % 2 === 1 ? 'bg-slate-50/25' : ''}`}
                  >
                    <td className="py-3.5 px-4 font-mono text-slate-400 tabular-numbers whitespace-nowrap">
                      {new Date(row.date).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-800">{row.particulars}</td>
                    <td className="py-3.5 px-4 text-slate-400 font-semibold">{row.vchType}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-600 font-bold">{row.vchNo}</td>
                    
                    {/* Debit */}
                    <td className="py-3.5 px-4 text-right font-mono tabular-numbers text-slate-700">
                      {row.debit !== null ? row.debit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '—'}
                    </td>

                    {/* Credit */}
                    <td className="py-3.5 px-4 text-right font-mono tabular-numbers text-emerald-800 font-bold">
                      {row.credit !== null ? row.credit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '—'}
                    </td>

                    {/* Balance */}
                    <td className="py-3.5 px-4 text-right font-mono tabular-numbers font-bold text-[#00236f]">
                      {row.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Dr
                    </td>
                  </tr>
                ))
              )}

            </tbody>

            {/* Closing Balance aggregations footer */}
            <tfoot className="bg-slate-100/60 font-bold border-t border-slate-200 font-bold text-slate-700 select-none">
              <tr>
                <td className="py-4 px-4 text-slate-400 font-bold tracking-wide uppercase text-[10px]" colSpan={4}>
                  Monthly Total / Closing Balance
                </td>
                <td className="py-4 px-4 text-right font-mono tabular-numbers text-slate-600 text-sm">
                  {aggregates.totalDebit > 0 ? aggregates.totalDebit.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '—'}
                </td>
                <td className="py-4 px-4 text-right font-mono tabular-numbers text-emerald-800 text-sm">
                  {aggregates.totalCredit > 0 ? aggregates.totalCredit.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '—'}
                </td>
                <td className="py-4 px-4 text-right font-mono tabular-numbers text-brand-primary font-extrabold text-sm border-l border-slate-200 bg-sky-50/15">
                  {currencySymbol} {aggregates.finalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Dr
                </td>
              </tr>
            </tfoot>

          </table>
        </div>
      </div>

      {/* Contextual Insights Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Transaction Velocity Card */}
        <div className="p-5 bg-white border border-slate-200 rounded-xl flex flex-col justify-between shadow-2xs hover:shadow-xs transition-shadow">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 select-none">Transaction Velocity</span>
              <TrendingUp className="h-4 w-4 text-brand-primary" />
            </div>
            <h3 className="text-base font-bold text-slate-800">14 Active Transactions</h3>
            <p className="text-[11px] text-slate-400 mt-1">October audit cycle index is 12% higher than September average baseline.</p>
          </div>
          
          <div className="mt-4 pt-3.5 border-t border-slate-100">
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div className="bg-brand-primary h-full w-[65%] rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Priority Credit Source Card */}
        <div className="p-5 bg-emerald-50/20 border border-emerald-100 rounded-xl flex flex-col justify-between shadow-2xs hover:shadow-xs transition-shadow">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 select-none">Top Credit Source</span>
              <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
            </div>
            <h3 className="text-base font-extrabold text-emerald-950">TechNova Solutions</h3>
            <p className="text-[11px] text-emerald-800/80 mt-1">Consistent monthly credits averaging {currencySymbol}4.8L per recurring ledger cycle.</p>
          </div>
          
          <div className="mt-4">
            <span className="bg-emerald-700 text-white text-[9px] px-2.5 py-1 rounded font-bold uppercase tracking-wider select-none">Priority Partner</span>
          </div>
        </div>

        {/* Pending Audits alert trigger Card */}
        <div className="p-5 bg-white border border-slate-200 rounded-xl flex flex-col justify-between shadow-2xs hover:shadow-xs transition-shadow relative overflow-hidden">
          <div className="z-10">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 select-none">Pending Audits</span>
              <AlertTriangle className="h-4 w-4 text-rose-500 animate-pulse" />
            </div>
            <h3 className="text-base font-bold text-slate-800">2 Unreconciled</h3>
            <p className="text-[11px] text-slate-400 mt-1">Action items requested for double entries PY/0488 and CN/0015.</p>
          </div>
          
          <button 
            type="button" 
            onClick={() => alert('Launching reconciliations guide helper modal...')}
            className="mt-4 text-xs font-bold text-brand-primary flex items-center justify-start gap-1 z-10 cursor-pointer text-left hover:underline select-none"
          >
            Review Audit Discrepancies <ChevronRight className="h-3.5 w-3.5" />
          </button>
          
          <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-brand-primary/5 rounded-full blur-xl"></div>
        </div>

      </div>

    </div>
  );
}
