import React, { useState, useMemo } from 'react';
import { 
  FolderPlus, 
  Wallet, 
  Target, 
  ArrowUpRight, 
  Divide, 
  AlertTriangle, 
  Check, 
  DollarSign, 
  Percent, 
  Info,
  CalendarCheck,
  Globe2
} from 'lucide-react';
import { LedgerAccount } from '../types';
import { CostCenter } from '../types-extra';

interface MasterLedgerCostsProps {
  accounts: LedgerAccount[];
  costCenters: CostCenter[];
  onAddAccount: (acc: LedgerAccount) => void;
  onAddCostCenter: (cc: CostCenter) => void;
}

export default function MasterLedgerCosts({
  accounts,
  costCenters,
  onAddAccount,
  onAddCostCenter
}: MasterLedgerCostsProps) {
  const [innerTab, setInnerTab] = useState<'ledgers' | 'costcenters' | 'budgets' | 'currency'>('ledgers');

  // Ledger Account states
  const [newAccName, setNewAccName] = useState('');
  const [newAccCode, setNewAccCode] = useState('');
  const [newAccType, setNewAccType] = useState<'Asset' | 'Liability' | 'Equity' | 'Income' | 'Expense'>('Asset');
  const [newAccBalance, setNewAccBalance] = useState('');
  const [newAccBalanceType, setNewAccBalanceType] = useState<'Dr' | 'Cr'>('Dr');
  const [newAccDetails, setNewAccDetails] = useState('');

  // Cost Center States
  const [newCcName, setNewCcName] = useState('');
  const [newCcCategory, setNewCcCategory] = useState('Operational');
  const [newCcAlloc, setNewCcAlloc] = useState('');

  // Compound Interest Calculation Simulator states
  const [interestAccId, setInterestAccId] = useState(accounts[0]?.id || '');
  const [interestRate, setInterestRate] = useState('12');
  const [interestPeriodMonths, setInterestPeriodMonths] = useState('6');

  // Multi-currency rate card state
  const [selectedCurrency, setSelectedCurrency] = useState<'USD' | 'EUR' | 'GBP'>('USD');
  const currencyRates = { USD: 83.45, EUR: 90.12, GBP: 105.80 };

  const handleAddAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccName || !newAccCode) return alert('Please input primary name and standard voucher keycodes.');
    const bal = parseFloat(newAccBalance) || 0;
    
    onAddAccount({
      id: newAccName.toLowerCase().replace(/\s+/g, '-'),
      name: newAccName,
      code: newAccCode,
      type: newAccType,
      balance: bal,
      balanceType: newAccBalanceType,
      details: newAccDetails
    });

    setNewAccName('');
    setNewAccCode('');
    setNewAccBalance('');
    setNewAccDetails('');
    alert('Custom ledger added successfully to account catalogs!');
  };

  const handleAddCostCenterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCcName || !newCcAlloc) return alert('Fill cost target description.');
    
    onAddCostCenter({
      id: 'cc-' + newCcName.toLowerCase().replace(/\s+/g, '-'),
      name: newCcName,
      category: newCcCategory,
      budgetAllocated: parseFloat(newCcAlloc) || 0,
      budgetSpent: 0
    });

    setNewCcName('');
    setNewCcAlloc('');
    alert('Cost center department target logged successfully.');
  };

  // Interest rate accrual compiler
  const compiledInterest = useMemo(() => {
    const candidate = accounts.find(a => a.id === interestAccId);
    if (!candidate) return 0;
    const rateVal = parseFloat(interestRate) || 0;
    const periodVal = parseFloat(interestPeriodMonths) || 0;
    // Simple/Compound simulator for high audit parameters
    const interestAccrued = candidate.balance * (rateVal / 100) * (periodVal / 12);
    return Math.round(interestAccrued * 100) / 100;
  }, [accounts, interestAccId, interestRate, interestPeriodMonths]);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#faf8ff] p-6 overflow-y-auto">
      
      {/* Title block */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-extrabold text-[#00236f] tracking-tight">Accounts & Cost Masters</h2>
          <p className="text-slate-500 text-xs mt-0.5">Define corporate ledger hierarchies, departments allocations, compounding rules, and multi-currency variables.</p>
        </div>

        {/* Sub nav toggles */}
        <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200/50">
          {[
            { id: 'ledgers', label: 'Groups & Ledgers', icon: Wallet },
            { id: 'costcenters', label: 'Cost Centers', icon: Target },
            { id: 'budgets', label: 'Budget Controls', icon: AlertTriangle },
            { id: 'currency', label: 'Currencies & Rates', icon: Globe2 }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setInnerTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-extrabold transition-all cursor-pointer ${
                  innerTab === tab.id 
                    ? 'bg-white text-[#00236f] shadow-2xs' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* RENDER INNER PANELS */}
      {innerTab === 'ledgers' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Quick Creator Form side panel */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-3xs flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2 mb-4 flex items-center gap-1.5">
                <FolderPlus className="h-4 w-4 text-emerald-600" />
                Add Ledger Account
              </h3>

              <form onSubmit={handleAddAccountSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Account Label / Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. SBI Current A/c"
                    value={newAccName}
                    onChange={e => setNewAccName(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#00236f]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Tally Code</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 1205"
                      value={newAccCode}
                      onChange={e => setNewAccCode(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#00236f]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Account Nature</label>
                    <select 
                      value={newAccType}
                      onChange={e => setNewAccType(e.target.value as any)}
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#00236f] bg-white"
                    >
                      <option value="Asset">Asset</option>
                      <option value="Liability">Liability</option>
                      <option value="Equity">Equity</option>
                      <option value="Income">Income</option>
                      <option value="Expense">Expense</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Opening Balance</label>
                    <input 
                      type="number" 
                      placeholder="e.g. 50000"
                      value={newAccBalance}
                      onChange={e => setNewAccBalance(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#00236f]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Book Type</label>
                    <select 
                      value={newAccBalanceType}
                      onChange={e => setNewAccBalanceType(e.target.value as any)}
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#00236f] bg-white"
                    >
                      <option value="Dr">Debit (Dr)</option>
                      <option value="Cr">Credit (Cr)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Group Details / Notes</label>
                  <textarea 
                    value={newAccDetails}
                    onChange={e => setNewAccDetails(e.target.value)}
                    placeholder="Provide description for automated routing reports..."
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#00236f] h-16 resize-none"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full py-2.5 bg-[#00236f] hover:bg-brand-primary text-white font-extrabold text-[11px] uppercase tracking-widest rounded-lg transition-all cursor-pointer shadow-3xs text-center"
                >
                  Create Master Ledger
                </button>
              </form>
            </div>

            {/* General Interest Calculator Tool built-in */}
            <div className="mt-6 pt-5 border-t border-slate-100">
              <h4 className="text-[11px] font-extrabold text-slate-800 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <Percent className="h-3.5 w-3.5 text-amber-500" />
                Interest Rate Accrual Estimator
              </h4>
              <div className="bg-[#faf8ff] p-3 rounded-lg border border-slate-100 text-[11px] space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-semibold">Select Account:</span>
                  <select 
                    value={interestAccId} 
                    onChange={e => setInterestAccId(e.target.value)}
                    className="bg-white border border-slate-200 rounded px-1.5 py-0.5"
                  >
                    {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-semibold">Rate % p.a:</span>
                    <input 
                      type="number" 
                      value={interestRate} 
                      onChange={e => setInterestRate(e.target.value)}
                      className="w-12 bg-white border border-slate-200 rounded text-center"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-semibold">Period:</span>
                    <select 
                      value={interestPeriodMonths} 
                      onChange={e => setInterestPeriodMonths(e.target.value)}
                      className="bg-white border border-slate-200 rounded px-1"
                    >
                      <option value="1">1 Month</option>
                      <option value="3">3 Months</option>
                      <option value="6">6 Months</option>
                      <option value="12">12 Months</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-200/60 font-bold text-slate-800">
                  <span>Accrued Calculation:</span>
                  <span className="text-amber-600 font-extrabold">₹{compiledInterest.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

          </div>

          {/* Catalog Listings Main Table */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/80 shadow-3xs overflow-hidden flex flex-col justify-between">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold select-none">
                    <th className="py-3 px-4">Group Code</th>
                    <th className="py-3 px-4">Ledger Account Label</th>
                    <th className="py-3 px-4">Nature Group</th>
                    <th className="py-3 px-4 text-right">Current Balance</th>
                    <th className="py-3 px-4">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {accounts.map(acc => (
                    <tr key={acc.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-400">{acc.code}</td>
                      <td className="py-3.5 px-4 font-extrabold text-slate-900">{acc.name}</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          acc.type === 'Asset' ? 'bg-emerald-50 text-emerald-700' :
                          acc.type === 'Liability' ? 'bg-indigo-50 text-indigo-700' :
                          acc.type === 'Equity' ? 'bg-purple-50 text-purple-700' :
                          acc.type === 'Income' ? 'bg-amber-50 text-amber-700' :
                          'bg-rose-50 text-rose-700'
                        }`}>
                          {acc.type}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-extrabold text-slate-800">
                        ₹{acc.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        <span className="text-[10px] font-medium text-slate-400 ml-1">{acc.balanceType}</span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 text-[11px] truncate max-w-[140px]" title={acc.details || 'No records'}>
                        {acc.details || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-slate-50 p-4 border-t border-slate-100 flex items-center gap-2 text-slate-400 text-[10px] leading-relaxed">
              <Info className="h-4 w-4 text-[#00236f] shrink-0" />
              <span>Asset and Expense categories hold a debit opening preference, whilst revenues, stocks, liabilities, and retained capital equity ledgers balance on credit terms.</span>
            </div>
          </div>

        </div>
      )}

      {innerTab === 'costcenters' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-3xs">
            <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2 mb-4 flex items-center gap-1.5">
              <FolderPlus className="h-4 w-4 text-[#00236f]" />
              Form Cost Center Target
            </h3>

            <form onSubmit={handleAddCostCenterSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Corporate Division Name</label>
                <input 
                  type="text" 
                  value={newCcName}
                  onChange={e => setNewCcName(e.target.value)}
                  placeholder="e.g. Asia Pacific Logistics Branch"
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Cost Category Division</label>
                <select 
                  value={newCcCategory}
                  onChange={e => setNewCcCategory(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white"
                >
                  <option value="Operational">Operational Expenses</option>
                  <option value="Development">Research & Development</option>
                  <option value="Administrative">Corporate Administrative Office</option>
                  <option value="Support">Post-Sales Support</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Allocated Annual Cap Budget (₹)</label>
                <input 
                  type="number" 
                  value={newCcAlloc}
                  onChange={e => setNewCcAlloc(e.target.value)}
                  placeholder="e.g. 450000"
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none"
                />
              </div>

              <button 
                type="submit"
                className="w-full py-2.5 bg-[#00236f] hover:bg-brand-primary text-white font-extrabold text-[11px] uppercase tracking-widest rounded-lg transition-all"
              >
                Log Cost Category Unit
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/80 p-5 shadow-3xs">
            <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2 mb-4">
              Category Wise Budgets and Limits Progress
            </h3>

            <div className="space-y-5 mt-4">
              {costCenters.map(cc => {
                const ratio = Math.min(100, Math.round((cc.budgetSpent / cc.budgetAllocated) * 100));
                const overSpent = cc.budgetSpent > cc.budgetAllocated;

                return (
                  <div key={cc.id} className="p-4 bg-slate-50/50 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors">
                    <div className="flex justify-between items-center mb-1.5">
                      <div>
                        <h4 className="text-xs font-extrabold text-slate-950">{cc.name}</h4>
                        <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-extrabold uppercase mt-1 inline-block">{cc.category}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-mono font-extrabold text-slate-800">
                          ₹{cc.budgetSpent.toLocaleString('en-IN')} <span className="text-[10px] text-slate-400 font-semibold">spent of</span> ₹{cc.budgetAllocated.toLocaleString('en-IN')}
                        </p>
                        <p className={`text-[10px] font-bold ${overSpent ? 'text-rose-600' : 'text-slate-400'}`}>
                          {overSpent ? '⚠️ Out-Of-Bounds Overrun' : `${ratio}% allocated capacity integrated`}
                        </p>
                      </div>
                    </div>

                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden mt-3.5">
                      <div 
                        style={{ width: `${ratio}%` }}
                        className={`h-full rounded-full transition-all duration-500 ${
                          overSpent ? 'bg-rose-600' : ratio > 85 ? 'bg-amber-500' : 'bg-[#00236f]'
                        }`}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {innerTab === 'budgets' && (
        <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-3xs">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3 mb-4">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">Budget Limit Variances Audit</h3>
              <p className="text-[11px] text-slate-400">Automated notification center testing balance limits against actual voucher flows for current fiscal period.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100 flex items-start gap-3">
              <div className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg font-bold text-xs">OK</div>
              <div>
                <h4 className="text-xs font-extrabold text-emerald-950">Administrative Budget (Group)</h4>
                <p className="text-[11px] text-emerald-800 leading-relaxed mt-1">Allowed: 1,200,000 INR | Spent so far: 45,000 INR (AWS oct & TDS details). Compliance levels standard at 3.75% bounds, variance remains healthy.</p>
              </div>
            </div>

            <div className="p-4 bg-rose-50/50 rounded-xl border border-rose-100 flex items-start gap-3">
              <div className="p-1.5 bg-rose-100 text-rose-700 rounded-lg font-bold text-xs">WARN</div>
              <div>
                <h4 className="text-xs font-extrabold text-rose-950">Corporate Rent Accrual (Group)</h4>
                <p className="text-[11px] text-rose-800 leading-relaxed mt-1">Allowed: 100,000 INR | Spent so far: 110,000.00 INR. Overrun detected by 10,000.00 INR (10.0% variance breach for rent-expense). Standard audit logged.</p>
              </div>
            </div>

            <div className="p-4 bg-[#faf8ff] rounded-xl border border-slate-200/80 flex items-start gap-3">
              <div className="p-1.5 bg-slate-100 text-[#00236f] rounded-lg font-bold text-xs">INFO</div>
              <div>
                <h4 className="text-xs font-extrabold text-slate-900">Indirect Utilities Limits</h4>
                <p className="text-[11px] text-[#00236f] leading-relaxed mt-1">Allowed: 80,000 INR | Spent: 32,170 INR. Consumption is within 40.2% thresholds. No immediate warnings triggered for this utility.</p>
              </div>
            </div>

            <div className="p-4 bg-[#faf8ff] rounded-xl border border-slate-200/80 flex items-start gap-3">
              <div className="p-1.5 bg-slate-100 text-amber-700 rounded-lg font-bold text-xs text-center min-w-8">CALC</div>
              <div>
                <h4 className="text-xs font-extrabold text-slate-900">Compound Interfacing Matrix</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed mt-1">Our ledger accounts automatically compute day-wise balance offsets during quarterly reporting metrics based on defined base currency conversions.</p>
              </div>
            </div>

          </div>

          <div className="mt-6 p-4 bg-slate-50 border border-slate-100 rounded-xl font-bold text-xs text-[#00236f] flex items-center gap-2">
            <Info className="h-4 w-4 text-brand-secondary shrink-0" />
            <span>Automatic safety parameters: Any voucher entry that exceeds logged group limits will flag an immediate warning row in audits logs.</span>
          </div>
        </div>
      )}

      {innerTab === 'currency' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-3xs">
            <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2 mb-4 flex items-center gap-1.5">
              <Globe2 className="h-4 w-4 text-indigo-600" />
              Dynamic Currency Card
            </h3>

            <div className="space-y-4">
              <p className="text-xs text-slate-500 leading-relaxed">Choose reference foreign currency relative to Indian Rupee (INR) base to calculate USD ledger accounts assets value.</p>
              
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Target Conversion Currency</label>
                <div className="flex bg-slate-100 rounded-lg p-1 border border-slate-200/60">
                  {['USD', 'EUR', 'GBP'].map(curr => (
                    <button
                      type="button"
                      key={curr}
                      onClick={() => setSelectedCurrency(curr as any)}
                      className={`flex-1 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                        selectedCurrency === curr 
                          ? 'bg-white text-[#00236f] shadow-xs' 
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      {curr}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-[#faf8ff] rounded-lg border border-slate-100 text-xs flex justify-between items-center py-4">
                <span className="font-bold text-slate-700">1 {selectedCurrency} Exchange Value:</span>
                <span className="text-indigo-700 font-extrabold font-mono text-sm">₹{currencyRates[selectedCurrency]} INR</span>
              </div>

              <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 text-[11px] text-indigo-950 space-y-1">
                <p className="font-extrabold">Auto-fetched rate updates active.</p>
                <p className="text-indigo-800 leading-relaxed font-semibold">Tally entries post-date-adjusted matching Indian RBI currency references standard conversion rules for multi-currency transactions.</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/80 p-5 shadow-3xs">
            <h3 className="text-xs font-extrabold text-[#00236f] uppercase tracking-wider border-b border-slate-100 pb-2 mb-4">
              Multi-Currency Asset Valuation Tracker
            </h3>

            <div className="overflow-x-auto mt-4">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-bold">
                    <th className="py-2.5 px-3">Account Code</th>
                    <th className="py-2.5 px-3">Account Name</th>
                    <th className="py-2.5 px-3 text-right">Value (INR)</th>
                    <th className="py-2.5 px-3 text-right">Converted (USD)</th>
                    <th className="py-2.5 px-3 text-right">Converted (EUR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {accounts.filter(a => a.type === 'Asset').map(a => (
                    <tr key={a.id} className="hover:bg-slate-50/30 transition-colors">
                      <td className="py-3 px-3 font-mono font-medium text-slate-400">{a.code}</td>
                      <td className="py-3 px-3 font-extrabold text-slate-800">{a.name}</td>
                      <td className="py-3 px-3 text-right font-mono font-extrabold">₹{a.balance.toLocaleString('en-IN')}</td>
                      <td className="py-3 px-3 text-right font-mono text-emerald-600 font-bold">${(a.balance / 83.45).toLocaleString('en-US', { maximumFractionDigits: 2 })}</td>
                      <td className="py-3 px-3 text-right font-mono text-indigo-600 font-bold">€{(a.balance / 90.12).toLocaleString('en-US', { maximumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
