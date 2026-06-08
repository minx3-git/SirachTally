import React, { useState, useMemo, useEffect } from 'react';
import { 
  Building2, 
  RefreshCw, 
  CheckCircle2, 
  HelpCircle, 
  Plus, 
  Printer, 
  FileCheck, 
  X, 
  Info,
  Calendar,
  DollarSign,
  Settings,
  Check
} from 'lucide-react';
import { LedgerAccount } from '../types';
import { BankCheck, BankStatementItem } from '../types-extra';

interface BankingHubProps {
  accounts: LedgerAccount[];
  checks: BankCheck[];
  bankStatements: BankStatementItem[];
  onAddCheck: (chk: BankCheck) => void;
  onClearStatementItem: (id: string, matchedVchNo: string) => void;
  onUpdateAccount: (acc: LedgerAccount) => void;
}

export default function BankingHub({
  accounts = [],
  checks,
  bankStatements,
  onAddCheck,
  onClearStatementItem,
  onUpdateAccount
}: BankingHubProps) {
  const [bankingTab, setBankingTab] = useState<'reconciliation' | 'cheques' | 'advices'>('reconciliation');

  // Dynamically find or fallback the primary operating bank account
  const bankAccount = useMemo(() => {
    const safeAccounts = Array.isArray(accounts) ? accounts : [];
    return safeAccounts.find(a => a && a.id === 'hdfc-bank') || {
      id: 'hdfc-bank',
      name: 'HDFC Bank - Current A/c',
      code: '1201',
      type: 'Asset' as const,
      balance: 1245680.00,
      balanceType: 'Dr' as const,
      accNo: 'XXXX XXXX 4092',
      details: 'Primary Operating Account'
    };
  }, [accounts]);

  // Form states for tailoring/re-defining the primary bank account
  const [isEditingBank, setIsEditingBank] = useState(false);
  const [bankName, setBankName] = useState('');
  const [bankAccNo, setBankAccNo] = useState('');
  const [bankCode, setBankCode] = useState('');
  const [bankBalance, setBankBalance] = useState('');
  const [bankDetails, setBankDetails] = useState('');

  // Sync edits when bankAccount changes
  useEffect(() => {
    if (bankAccount) {
      setBankName(bankAccount.name);
      setBankAccNo(bankAccount.accNo || 'XXXX XXXX 4092');
      setBankCode(bankAccount.code);
      setBankBalance(bankAccount.balance.toString());
      setBankDetails(bankAccount.details || 'Primary Operating Account');
    }
  }, [bankAccount]);

  const handleUpdateBankDetails = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankName.trim() || !bankCode.trim()) {
      alert('Please specify the Bank Name and Ledger Code.');
      return;
    }

    onUpdateAccount({
      ...bankAccount,
      name: bankName,
      accNo: bankAccNo,
      code: bankCode,
      balance: parseFloat(bankBalance) || 0,
      details: bankDetails
    });

    setIsEditingBank(false);
    alert('Primary corporate bank profile updated and saved to catalogs successfully!');
  };

  // Input states for writing a cheque
  const [checkPayee, setCheckPayee] = useState('');
  const [checkAmount, setCheckAmount] = useState('');
  const [checkDate, setCheckDate] = useState(new Date().toISOString().split('T')[0]);

  // Selected check for preview mock
  const [selectedCheckId, setSelectedCheckId] = useState<string>(checks[0]?.id || '');

  // Advice template inputs
  const [adviceParty, setAdviceParty] = useState('');
  const [adviceBank, setAdviceBank] = useState('');
  const [adviceAmt, setAdviceAmt] = useState('');

  const handlePrintCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkPayee || !checkAmount) return alert('Specify payee name and cheque values.');
    const fakeNo = 'CHEQ-00' + Math.floor(1000 + Math.random() * 9000);
    
    onAddCheck({
      id: fakeNo,
      checkNo: fakeNo,
      date: checkDate,
      payee: checkPayee,
      amount: parseFloat(checkAmount) || 0,
      status: 'Printed'
    });

    setCheckPayee('');
    setCheckAmount('');
    alert(`Cheque ${fakeNo} printed and registered.`);
  };

  const selectedChequeObj = useMemo(() => {
    return checks.find(c => c.id === selectedCheckId) || checks[0];
  }, [checks, selectedCheckId]);

  // Automated auto-matching triggers (Reconciles statement in sandbox)
  const handleAutoMatchStatement = (item: BankStatementItem) => {
    const candidateVoucherCodes: { [key: number]: string } = {
      110000: 'PY/0458', // Rent payment voucher matching bank Rent statement
      32170: 'PY/0488'   // Utility payment matcher
    };
    
    const matchedVch = candidateVoucherCodes[item.amount];
    if (matchedVch) {
      onClearStatementItem(item.id, matchedVch);
      alert(`Automated match approved! Statement code reconciled against Ledger Voucher: ${matchedVch}`);
    } else {
      alert('No matching transaction amount in ledger books found. Please reconcile manually.');
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#faf8ff] p-6 overflow-y-auto">
      
      {/* Title */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-extrabold text-[#00236f] tracking-tight font-sans">Banking Operations, Reconciliation & Cheques</h2>
          <p className="text-slate-500 text-xs mt-0.5">Automata-match bank statements with ledger accounts, coordinate cheque registers, and compile payment instruction sheets.</p>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200/50 shadow-3xs">
          {[
            { id: 'reconciliation', label: 'Bank Statement Auto-Match', icon: RefreshCw },
            { id: 'cheques', label: 'Cheque Writing Drawer', icon: Printer },
            { id: 'advices', label: 'Payment Advices Dispatch', icon: FileCheck }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setBankingTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-extrabold transition-all cursor-pointer ${
                  bankingTab === tab.id 
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

      {bankingTab === 'reconciliation' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-3xs flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Building2 className="h-4.5 w-4.5 text-[#00236f]" />
                  Corporate Bank Setup
                </h3>
                <button
                  type="button"
                  onClick={() => setIsEditingBank(!isEditingBank)}
                  className="flex items-center gap-1 text-[10px] bg-slate-100 hover:bg-[#00236f] hover:text-white text-slate-600 px-2.5 py-1 rounded font-bold transition-all"
                >
                  <Settings className="h-3 w-3" />
                  <span>{isEditingBank ? "Back" : "Configure Bank"}</span>
                </button>
              </div>

              {!isEditingBank ? (
                <>
                  <div className="bg-[#faf8ff] p-4 rounded-xl border border-slate-100/80 text-center mt-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Bank Ledger Balance</span>
                    <span className="text-xl font-extrabold text-[#00236f] block mt-1">
                      ₹{bankAccount.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-[10.5px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-extrabold inline-block mt-2 font-mono">
                      {bankAccount.name}
                    </span>
                    <p className="text-[10px] text-slate-400 mt-1 font-mono font-medium">
                      A/C: {bankAccount.accNo || 'XXXX XXXX 4092'}
                    </p>
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                    Reconciliation cross-checks statements transmitted directly from bank APIs against your ledger. Tap &quot;Auto Match&quot; below; our ledger scans transaction sums and pairs certificates instantly.
                  </p>
                </>
              ) : (
                <form onSubmit={handleUpdateBankDetails} className="space-y-3 pt-1">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Corporate Bank Name</label>
                    <input 
                      type="text"
                      className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded focus:outline-none focus:border-[#00236f] font-bold"
                      value={bankName}
                      onChange={e => setBankName(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Bank Account Number</label>
                    <input 
                      type="text"
                      className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded focus:outline-none focus:border-[#00236f] font-mono"
                      value={bankAccNo}
                      onChange={e => setBankAccNo(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Tally Code</label>
                      <input 
                        type="text"
                        className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded focus:outline-none focus:border-[#00236f] font-mono"
                        value={bankCode}
                        onChange={e => setBankCode(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Current Balance (₹)</label>
                      <input 
                        type="number"
                        className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded focus:outline-none focus:border-[#00236f] font-mono"
                        value={bankBalance}
                        onChange={e => setBankBalance(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Account Specifications</label>
                    <input 
                      type="text"
                      className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded focus:outline-none focus:border-[#00236f]"
                      value={bankDetails}
                      onChange={e => setBankDetails(e.target.value)}
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-extrabold uppercase tracking-wider rounded-lg transition-all shadow-3xs flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Check className="h-3.5 w-3.5" />
                    Save Bank Configuration
                  </button>
                </form>
              )}
            </div>

            <div className="p-3 bg-amber-50 rounded-lg text-[11px] text-amber-800 font-bold border border-amber-100 mt-4">
              ✓ 2 statement entries reconciled. 2 unmatched withdrawals require review.
            </div>
          </div>

          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/80 p-5 shadow-3xs">
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2 mb-4">
              Daily Statement Feed & Reconciliation Worksheet
            </h3>

            <div className="space-y-3.5 mt-4">
              {bankStatements.map(st => (
                <div key={st.id} className="p-4 bg-slate-50/50 rounded-xl border border-slate-100 flex justify-between items-center text-xs">
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 font-mono font-bold block">{st.date}</span>
                    <span className="font-extrabold text-indigo-950 font-sans block">{st.description}</span>
                    {st.isMatched && (
                      <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 mt-1">
                        <CheckCircle2 className="h-3 w-3 shrink-0" /> Verified Match against Ledger No: {st.matchedVoucherNo}
                      </p>
                    )}
                  </div>

                  <div className="text-right flex items-center gap-4">
                    <div>
                      <p className={`font-mono font-extrabold text-sm ${st.type === 'Deposit' ? 'text-emerald-700' : 'text-slate-900'}`}>
                        {st.type === 'Deposit' ? '+' : '-'} ₹{st.amount.toLocaleString('en-IN')}
                      </p>
                      <span className="text-[9px] text-slate-400 font-bold uppercase">{st.type}</span>
                    </div>

                    {!st.isMatched && (
                      <button 
                        type="button" 
                        onClick={() => handleAutoMatchStatement(st)}
                        className="px-2.5 py-1.5 bg-[#00236f]/10 text-[#00236f] hover:bg-[#00236f] hover:text-white rounded text-[10px] uppercase font-bold tracking-wider cursor-pointer"
                      >
                        Auto Match
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* SEC 2: CHEQUES WRITER */}
      {bankingTab === 'cheques' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-3xs">
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-2 mb-4">
              Log Printed Cheque
            </h3>

            <form onSubmit={handlePrintCheck} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Trade Payee Name</label>
                <input 
                  type="text" 
                  value={checkPayee} 
                  onChange={e => setCheckPayee(e.target.value)}
                  placeholder="e.g. Corporate Office Landlord Ltd"
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Amount Value (₹)</label>
                  <input 
                    type="number" 
                    value={checkAmount}
                    onChange={e => setCheckAmount(e.target.value)}
                    placeholder="e.g. 110000"
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Cheque Date</label>
                  <input 
                    type="date" 
                    value={checkDate}
                    onChange={e => setCheckDate(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white"
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full py-2 bg-[#00236f] hover:bg-brand-primary text-white text-[11px] font-extrabold uppercase tracking-widest rounded-lg transition-all"
              >
                Compile Cheque Outflow
              </button>
            </form>

            <div className="mt-5 space-y-2">
              <span className="text-[10px] block font-bold text-slate-400 uppercase tracking-wider">Printed Registers list:</span>
              {checks.map(c => (
                <button
                  type="button"
                  key={c.id}
                  onClick={() => setSelectedCheckId(c.id)}
                  className={`w-full p-2.5 rounded border text-left text-xs transition-colors block ${
                    selectedCheckId === c.id 
                      ? 'bg-[#1e3a8a]/5 border-[#00236f] text-slate-900 font-bold' 
                      : 'bg-white border-slate-150 text-slate-500'
                  }`}
                >
                  <div className="flex justify-between font-bold">
                    <span>{c.checkNo}</span>
                    <span>₹{c.amount.toLocaleString('en-IN')}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">Payee: {c.payee}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/80 p-6 shadow-3xs flex flex-col justify-center">
            {selectedChequeObj ? (
              <div className="p-6 bg-amber-50/25 rounded-2xl border border-amber-200/80 max-w-xl mx-auto space-y-6 text-[#453011] relative shadow-xs overflow-hidden select-none w-full">
                
                {/* Check alignment guidelines */}
                <div className="flex justify-between items-center border-b border-amber-200 pb-3">
                  <span className="text-xs font-serif italic text-amber-800 font-bold uppercase tracking-wider">
                    {bankAccount.name}
                  </span>
                  <div className="text-right text-[11px] font-mono flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" /> Date: <span className="font-extrabold border-b border-amber-800 pb-0.5 px-2">{selectedChequeObj.date}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-end border-b border-amber-200/80 pb-1.5 text-xs text-amber-900/80">
                    <span className="font-bold whitespace-nowrap mr-2 font-serif text-[11px]">PAY TO THE ORDER OF:</span>
                    <span className="font-extrabold text-[#00236f] flex-1 text-sm">{selectedChequeObj.payee}</span>
                  </div>

                  <div className="flex justify-between items-center bg-white border border-amber-200 p-3 rounded-lg flex-row">
                    <div className="text-xs font-serif text-amber-900/85 font-semibold">
                      <span>RUPEES AMOUNT COMPOSITE:</span>
                      <p className="font-serif italic font-extrabold text-slate-900 capitalize mt-1">Amount registered trade value ***</p>
                    </div>

                    <div className="px-3 py-1.5 bg-amber-100 border border-amber-300 font-mono text-sm font-extrabold text-amber-900 rounded">
                      ₹**{selectedChequeObj.amount.toLocaleString('en-IN')}**
                    </div>
                  </div>
                </div>

                {/* Bottom MICR strip mock */}
                <div className="h-px bg-amber-200 my-4"></div>
                
                <div className="flex justify-between items-center text-[10px] font-mono leading-none">
                  <span className="text-amber-850 font-bold">CHEQ NO: {selectedChequeObj.checkNo.split('-')[1]}</span>
                  <span className="text-slate-400 font-semibold italic">A/C PAYEE ONLY - CERTIFIED PRINT</span>
                  <span className="text-amber-850 font-bold flex flex-col items-center">
                    <span className="font-handwriting italic text-indigo-805 text-sm mb-1">A. Thompson</span>
                    <span className="border-t border-amber-400 pt-0.5 font-sans font-bold">Authorized Signatory</span>
                  </span>
                </div>

              </div>
            ) : (
              <p className="text-center text-slate-400 text-xs py-10 font-bold">Select or log a checklist cheque to view draft.</p>
            )}
          </div>
        </div>
      )}

      {/* ADVICES */}
      {bankingTab === 'advices' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-3xs">
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-2 mb-4">
              Write Payment Advice Instructions (RTGS/NEFT Request)
            </h3>

            <form onSubmit={(e) => { e.preventDefault(); alert('Advice instruction queued successfully and PDF dispatch logged.'); }} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Trade Supplier Party</label>
                <input 
                  type="text" 
                  value={adviceParty}
                  onChange={e => setAdviceParty(e.target.value)}
                  placeholder="e.g. SolderCorp Foundry Pvt Ltd"
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Beneficiary Bank</label>
                  <input 
                    type="text" 
                    value={adviceBank}
                    onChange={e => setAdviceBank(e.target.value)}
                    placeholder="e.g. ICICI Bank"
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Advice Gross Payable (₹)</label>
                  <input 
                    type="number" 
                    value={adviceAmt}
                    onChange={e => setAdviceAmt(e.target.value)}
                    placeholder="e.g. 12840"
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none"
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full py-2 bg-[#00236f] hover:bg-brand-primary text-white text-[11px] font-extrabold uppercase tracking-wider rounded transition-all cursor-pointer"
              >
                Log Advice Letter
              </button>
            </form>
          </div>

          <div className="bg-[#faf8ff] p-5 rounded-2xl border border-dashed border-slate-200 flex flex-col justify-center text-xs space-y-3">
            <span className="font-extrabold text-[#00236f] uppercase block tracking-wider">Default Payment Advice Template Specifications</span>
            <p className="text-slate-500 leading-relaxed font-semibold">Payment advices serves to communicate scheduled bank transfers (via RTGS or NEFT paths) directly to vendors, helping them reconcile outstanding receivables ledger boards upon incoming credit clearings.</p>
            <div className="bg-white p-3.5 rounded-lg border border-slate-200/60 font-mono text-[10px] text-slate-500">
              <span className="font-bold text-slate-800 block mb-1">AUTOMATED FOOTER EMBED:</span>
              &quot;This letter constitutes notice of fund dispatch from {bankAccount.name} A/C {bankAccount.accNo || 'XXXX XXXX 4092'}. Please credit trade receivable registers accordingly.&quot;
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
