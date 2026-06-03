import React, { useState, useMemo } from 'react';
import { 
  Coins, 
  Building2, 
  ArrowDownLeft, 
  ArrowUpRight, 
  ArrowDownRight,
  PlusCircle, 
  UserPlus, 
  Eye, 
  ExternalLink, 
  ShoppingCart, 
  FileText, 
  Building, 
  CreditCard, 
  User, 
  Search, 
  Bell, 
  History, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Plus,
  Compass,
  ArrowRight
} from 'lucide-react';
import { LedgerAccount, Voucher } from '../types';

interface DashboardProps {
  accounts: LedgerAccount[];
  vouchers: Voucher[];
  onNavigate: (tab: string) => void;
  onSelectLedger: (ledgerId: string) => void;
  onOpenQuickVoucher: () => void;
  onAddLedger: () => void;
}

export default function Dashboard({
  accounts,
  vouchers,
  onNavigate,
  onSelectLedger,
  onOpenQuickVoucher,
  onAddLedger,
}: DashboardProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [timeframe, setTimeframe] = useState<'Last 6 Months' | 'Year to Date'>('Last 6 Months');
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; month: string; income: number; expense: number } | null>(null);

  // Quick Account lookups
  const cashInHand = useMemo(() => accounts.find(a => a.id === 'cash-in-hand')?.balance ?? 142550.00, [accounts]);
  const bankBalance = useMemo(() => accounts.find(a => a.id === 'bank-balance')?.balance ?? 3892110.45, [accounts]);
  const accReceivable = useMemo(() => accounts.find(a => a.id === 'acc-receivable')?.balance ?? 45200.00, [accounts]);
  const accPayable = useMemo(() => accounts.find(a => a.id === 'acc-payable')?.balance ?? 12840.10, [accounts]);

  // Aggregate recent list from vouchers
  const recentTransactions = useMemo(() => {
    // Show top 5 vouchers sorted or as is
    return vouchers
      .filter(v => v.vchNo.startsWith('VCH-2023-00') || v.id.includes('dash'))
      .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [vouchers]);

  const filteredTransactions = useMemo(() => {
    if (!searchTerm.trim()) return recentTransactions;
    return vouchers.filter(v => 
      v.particulars?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.vchNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.narration.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 5);
  }, [vouchers, searchTerm, recentTransactions]);

  // Dynamic Chart points representing "last 6 months" (Jan to Jun)
  const chartData = useMemo(() => {
    if (timeframe === 'Last 6 Months') {
      return [
        { month: 'Jan', income: 140000, expense: 95000, x: 50, yInc: 170, yExp: 210 },
        { month: 'Feb', income: 152000, expense: 110000, x: 190, yInc: 145, yExp: 185 },
        { month: 'Mar', income: 198000, expense: 140000, x: 330, yInc: 115, yExp: 145 },
        { month: 'Apr', income: 240000, expense: 165000, x: 470, yInc: 75, yExp: 115 },
        { month: 'May', income: 220000, expense: 180000, x: 610, yInc: 90, yExp: 100 },
        { month: 'Jun', income: 285000, expense: 150000, x: 750, yInc: 50, yExp: 125 },
      ];
    } else {
      // YTD Faux points
      return [
        { month: 'Jan', income: 120000, expense: 80000, x: 50, yInc: 180, yExp: 220 },
        { month: 'Feb', income: 142000, expense: 105000, x: 190, yInc: 160, yExp: 195 },
        { month: 'Mar', income: 180000, expense: 120000, x: 330, yInc: 130, yExp: 160 },
        { month: 'Apr', income: 210000, expense: 152000, x: 470, yInc: 105, yExp: 130 },
        { month: 'May', income: 190000, expense: 160000, x: 610, yInc: 120, yExp: 110 },
        { month: 'Jun', income: 260000, expense: 145000, x: 750, yInc: 65, yExp: 135 },
      ];
    }
  }, [timeframe]);

  const getParticularIcon = (particulars?: string) => {
    const name = particulars?.toLowerCase() ?? '';
    if (name.includes('logistics')) return <ShoppingCart className="h-4.5 w-4.5 text-brand-primary" />;
    if (name.includes('azure') || name.includes('cloud')) return <FileText className="h-4.5 w-4.5 text-brand-primary" />;
    if (name.includes('rent') || name.includes('office')) return <Building className="h-4.5 w-4.5 text-brand-primary" />;
    if (name.includes('interest')) return <CreditCard className="h-4.5 w-4.5 text-brand-primary" />;
    return <User className="h-4.5 w-4.5 text-brand-primary" />;
  };

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
      
      {/* Summary Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Cash-in-Hand */}
        <div 
          onClick={() => onSelectLedger('cash-in-hand')}
          className="bg-white p-5 border border-slate-200 hover:border-brand-primary rounded-xl flex flex-col justify-between shadow-xs transition-all cursor-pointer group"
          id="stat-cash-in-hand"
        >
          <div className="flex justify-between items-start">
            <div className="p-2.5 bg-brand-primary/10 text-brand-primary rounded-lg group-hover:bg-brand-primary/20 transition-all">
              <Coins className="h-5 w-5" />
            </div>
            <span className="text-emerald-700 text-xs font-semibold flex items-center gap-0.5 bg-emerald-100/65 py-0.5 px-2 rounded-full">
              +2.4% <ArrowUpRight className="h-3 w-3" />
            </span>
          </div>
          <div className="mt-4">
            <p className="text-slate-500 text-[13px] font-medium uppercase tracking-wider">Total Cash-in-Hand</p>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 mt-1 tabular-numbers">${cashInHand.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
          </div>
        </div>

        {/* Bank Balance */}
        <div 
          onClick={() => onSelectLedger('hdfc-bank')}
          className="bg-white p-5 border border-slate-200 hover:border-brand-primary rounded-xl flex flex-col justify-between shadow-xs transition-all cursor-pointer group"
          id="stat-bank-balance"
        >
          <div className="flex justify-between items-start">
            <div className="p-2.5 bg-sky-100 text-sky-800 rounded-lg group-hover:bg-sky-200 transition-all">
              <Building2 className="h-5 w-5" />
            </div>
            <span className="text-slate-500 text-xs font-medium flex items-center gap-0.5 bg-slate-100 py-0.5 px-2 rounded-full">
              Stable <Minus className="h-3 w-3" />
            </span>
          </div>
          <div className="mt-4">
            <p className="text-slate-500 text-[13px] font-medium uppercase tracking-wider">Bank Balance</p>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 mt-1 tabular-numbers">${bankBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
          </div>
        </div>

        {/* Accounts Receivable */}
        <div 
          onClick={() => onSelectLedger('acc-receivable')}
          className="bg-white p-5 border border-slate-200 hover:border-brand-primary rounded-xl flex flex-col justify-between shadow-xs transition-all cursor-pointer group"
          id="stat-receivable"
        >
          <div className="flex justify-between items-start">
            <div className="p-2.5 bg-emerald-50 text-emerald-800 rounded-lg group-hover:bg-emerald-100 transition-all">
              <ArrowDownLeft className="h-5 w-5" />
            </div>
            <span className="text-rose-700 text-xs font-semibold flex items-center gap-0.5 bg-rose-100/65 py-0.5 px-2 rounded-full">
              -1.2% <ArrowDownRight className="h-3 w-3" />
            </span>
          </div>
          <div className="mt-4">
            <p className="text-slate-500 text-[13px] font-medium uppercase tracking-wider">Accounts Receivable</p>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 mt-1 tabular-numbers">${accReceivable.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
          </div>
        </div>

        {/* Accounts Payable */}
        <div 
          onClick={() => onSelectLedger('acc-payable')}
          className="bg-white p-5 border border-slate-200 hover:border-brand-primary rounded-xl flex flex-col justify-between shadow-xs transition-all cursor-pointer group"
          id="stat-payable"
        >
          <div className="flex justify-between items-start">
            <div className="p-2.5 bg-rose-100 text-rose-800 rounded-lg group-hover:bg-rose-200 transition-all">
              <ArrowUpRight className="h-5 w-5" />
            </div>
            <span className="text-amber-800 text-xs font-semibold flex items-center gap-0.5 bg-amber-100 py-0.5 px-2 rounded-full">
              Due in 5d
            </span>
          </div>
          <div className="mt-4">
            <p className="text-slate-500 text-[13px] font-medium uppercase tracking-wider">Accounts Payable</p>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 mt-1 tabular-numbers">${accPayable.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
          </div>
        </div>

      </div>

      {/* Dashboard Center Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Cash Flow Analysis Chart Section */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-5 shadow-xs relative">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Cash Flow Analysis</h3>
              <p className="text-slate-500 text-xs mt-0.5">Monthly income vs. expense performance</p>
            </div>
            
            <div className="flex items-center gap-4 self-stretch sm:self-auto justify-between">
              <div className="flex items-center gap-3 text-xs font-medium">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#1e3a8a]"></span>
                  <span className="text-slate-600">Income</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full border border-dashed border-[#10b981] bg-teal-50"></span>
                  <span className="text-slate-600">Expense</span>
                </div>
              </div>
              
              <select 
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value as any)}
                className="bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 rounded-lg py-1 pl-2.5 pr-8 focus:outline-hidden focus:ring-2 focus:ring-brand-primary"
              >
                <option value="Last 6 Months">Last 6 Months</option>
                <option value="Year to Date">Year to Date</option>
              </select>
            </div>
          </div>

          {/* SVG Responsive Chart */}
          <div className="h-68 w-full relative">
            <svg 
              className="w-full h-full" 
              viewBox="0 0 800 240" 
              preserveAspectRatio="none"
              onMouseLeave={() => setHoveredPoint(null)}
            >
              <defs>
                <linearGradient id="incomeGradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#1e3a8a" stopOpacity="0.12"></stop>
                  <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0"></stop>
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line stroke="#f1f5f9" strokeWidth="1.5" x1="0" x2="800" y1="40" y2="40"></line>
              <line stroke="#f1f5f9" strokeWidth="1.5" x1="0" x2="800" y1="110" y2="110"></line>
              <line stroke="#f1f5f9" strokeWidth="1.5" x1="0" x2="800" y1="180" y2="180"></line>

              {/* Area under Income curve */}
              <path 
                fill="url(#incomeGradient)" 
                d={`M 50,240 
                    L 50,${chartData[0].yInc} 
                    C 120,${chartData[0].yInc - 10} 120,${chartData[1].yInc + 15} 190,${chartData[1].yInc}
                    C 260,${chartData[1].yInc - 15} 260,${chartData[2].yInc + 15} 330,${chartData[2].yInc}
                    C 400,${chartData[2].yInc - 20} 400,${chartData[3].yInc + 15} 470,${chartData[3].yInc}
                    C 540,${chartData[3].yInc - 15} 540,${chartData[4].yInc + 15} 610,${chartData[4].yInc}
                    C 680,${chartData[4].yInc - 25} 680,${chartData[5].yInc + 15} 750,${chartData[5].yInc}
                    L 750,240 Z`}
              />

              {/* Income Line - Smooth Cubic Spline */}
              <path 
                fill="none" 
                stroke="#1e3a8a" 
                strokeWidth="3.5" 
                strokeLinecap="round"
                d={`M 50,${chartData[0].yInc} 
                    C 120,${chartData[0].yInc - 10} 120,${chartData[1].yInc + 15} 190,${chartData[1].yInc}
                    C 260,${chartData[1].yInc - 15} 260,${chartData[2].yInc + 15} 330,${chartData[2].yInc}
                    C 400,${chartData[2].yInc - 20} 400,${chartData[3].yInc + 15} 470,${chartData[3].yInc}
                    C 540,${chartData[3].yInc - 15} 540,${chartData[4].yInc + 15} 610,${chartData[4].yInc}
                    C 680,${chartData[4].yInc - 25} 680,${chartData[5].yInc + 15} 750,${chartData[5].yInc}`}
              />

              {/* Expense Line - Dashed Spline */}
              <path 
                fill="none" 
                stroke="#10b981" 
                strokeWidth="3" 
                strokeDasharray="6 4"
                strokeLinecap="round"
                d={`M 50,${chartData[0].yExp} 
                    C 120,${chartData[0].yExp - 10} 120,${chartData[1].yExp + 10} 190,${chartData[1].yExp}
                    C 260,${chartData[1].yExp - 15} 260,${chartData[2].yExp + 15} 330,${chartData[2].yExp}
                    C 400,${chartData[2].yExp - 10} 400,${chartData[3].yExp + 10} 470,${chartData[3].yExp}
                    C 540,${chartData[3].yExp - 20} 540,${chartData[4].yExp + 15} 610,${chartData[4].yExp}
                    C 680,${chartData[4].yExp - 15} 680,${chartData[5].yExp + 10} 750,${chartData[5].yExp}`}
              />

              {/* Interactivity Dots & Invisible hover triggers */}
              {chartData.map((pt, idx) => (
                <g key={pt.month}>
                  {/* Circle indicating income */}
                  <circle 
                    cx={pt.x} 
                    cy={pt.yInc} 
                    r="4.5" 
                    fill="#1e3a8a" 
                    stroke="#ffffff" 
                    strokeWidth="2"
                  />
                  <circle 
                    cx={pt.x} 
                    cy={pt.yExp} 
                    r="4.5" 
                    fill="#10b981" 
                    stroke="#ffffff" 
                    strokeWidth="2"
                  />
                  
                  {/* Invisible broad bars for triggering tooltips easily */}
                  <rect
                    x={pt.x - 30}
                    y={0}
                    width={60}
                    height={240}
                    fill="transparent"
                    className="cursor-crosshair"
                    onMouseEnter={(e) => {
                      setHoveredPoint({
                        x: pt.x,
                        y: pt.yInc,
                        month: pt.month,
                        income: pt.income,
                        expense: pt.expense
                      });
                    }}
                  />
                </g>
              ))}
            </svg>

            {/* X-Axis Labels */}
            <div className="flex justify-between mt-2 px-6">
              {chartData.map(pt => (
                <span key={pt.month} className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{pt.month}</span>
              ))}
            </div>

            {/* Live custom floating Tooltip overlay */}
            {hoveredPoint && (
              <div 
                className="absolute bg-slate-900 text-white text-xs font-medium rounded-lg p-3 shadow-xl border border-slate-800 z-50 pointer-events-none transition-all duration-100"
                style={{ 
                  left: `${(hoveredPoint.x / 800) * 90}%`,
                  top: `${hoveredPoint.y - 12 > 0 ? hoveredPoint.y - 12 : 10}px`,
                }}
              >
                <p className="font-bold border-b border-slate-800 pb-1 text-slate-300">{hoveredPoint.month} Summary</p>
                <p className="mt-1 text-sky-400">Income: <span className="font-bold text-white">${hoveredPoint.income.toLocaleString()}</span></p>
                <p className="text-emerald-400">Expense: <span className="font-bold text-white">${hoveredPoint.expense.toLocaleString()}</span></p>
              </div>
            )}
          </div>
        </div>

        {/* Shortcuts & Banner Widget */}
        <div className="lg:col-span-4 flex flex-col gap-5">
          
          {/* Shortcuts Widget */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <h3 className="text-base font-bold text-slate-950 mb-3.5">Shortcuts</h3>
            <div className="space-y-2.5">
              
              <button 
                onClick={onOpenQuickVoucher}
                className="w-full flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-100 hover:border-slate-300 rounded-lg transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <PlusCircle className="h-5 w-5 text-[#00236f]" />
                  <span className="text-xs font-bold text-slate-700">Quick Voucher Entry</span>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-brand-primary transform group-hover:translate-x-0.5 transition-all" />
              </button>

              <button 
                onClick={onAddLedger}
                className="w-full flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-100 hover:border-slate-300 rounded-lg transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <UserPlus className="h-5 w-5 text-[#00236f]" />
                  <span className="text-xs font-bold text-slate-700">Add Ledger Accounts</span>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-brand-primary transform group-hover:translate-x-0.5 transition-all" />
              </button>

              <button 
                onClick={() => onNavigate('reports')}
                className="w-full flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-100 hover:border-slate-300 rounded-lg transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Eye className="h-5 w-5 text-[#00236f]" />
                  <span className="text-xs font-bold text-slate-700">View Financial Reports</span>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-brand-primary transform group-hover:translate-x-0.5 transition-all" />
              </button>

            </div>
          </div>

          {/* Compliance Callout Banner */}
          <div className="relative bg-[#00236f] bg-radial-at-tl from-slate-900 to-indigo-950 overflow-hidden rounded-xl p-5 shadow-xs flex-1 flex flex-col justify-between">
            <div className="relative z-10">
              <span className="bg-sky-400/15 text-sky-300 border border-sky-400/25 px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider">Automated Audit Ready</span>
              <p className="text-[13px] font-medium text-slate-200 mt-2.5 leading-relaxed">
                Your accounts are currently <span className="text-emerald-400 font-bold">98% compliant</span> with local tax regulations.
              </p>
            </div>
            
            <div className="relative z-10 mt-5">
              <button 
                onClick={() => onNavigate('reports')}
                className="px-4 py-2 bg-white text-brand-primary text-xs font-bold rounded-lg hover:bg-slate-100 active:scale-97 transition-all cursor-pointer shadow-xs"
              >
                Review Compliance Now
              </button>
            </div>

            <div className="absolute -bottom-6 -right-6 opacity-10 text-white">
              <Compass className="h-40 w-40" />
            </div>
          </div>

        </div>

      </div>

      {/* Recent Transactions Table Section */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        
        {/* Table Header */}
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Recent Transactions</h3>
            <p className="text-slate-400 text-xs mt-0.5">Clearing logs of double-entry journals</p>
          </div>
          
          <div className="flex items-center gap-2 self-stretch sm:self-auto">
            {/* Interactive Search Bar */}
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input 
                type="text"
                placeholder="Search transaction..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-hidden"
              />
            </div>
            
            <button 
              onClick={() => onNavigate('ledger')}
              className="px-3.5 py-1.5 bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-lg text-xs font-bold text-brand-primary flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
            >
              View Ledger <ExternalLink className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* Dense Table wrapper */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="bg-slate-50/75 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-100">
                <th className="px-5 py-3 font-semibold text-slate-500">Date</th>
                <th className="px-5 py-3 font-semibold text-slate-500">Particulars (Counterparty)</th>
                <th className="px-5 py-3 font-semibold text-slate-500">Type</th>
                <th className="px-5 py-3 font-semibold text-slate-500 text-right">Amount</th>
                <th className="px-5 py-3 font-semibold text-slate-500 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-slate-400 italic">No transactions found</td>
                </tr>
              ) : (
                filteredTransactions.map((tx, idx) => (
                  <tr 
                    key={tx.id} 
                    className="hover:bg-slate-50/70 transition-colors group cursor-pointer"
                    onClick={() => {
                      if (tx.particulars?.includes('HDFC') || tx.id.includes('hdfc')) {
                        onSelectLedger('hdfc-bank');
                      } else {
                        onSelectLedger('cash-in-hand');
                      }
                    }}
                  >
                    <td className="px-5 py-3.5 tabular-numbers font-mono text-slate-500">{new Date(tx.date).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded bg-slate-100 flex items-center justify-center border border-slate-200/55 group-hover:scale-103 transition-transform">
                          {getParticularIcon(tx.particulars)}
                        </div>
                        <span className="font-bold text-slate-800">{tx.particulars ?? 'General Entry'}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-400">{tx.vchType}</td>
                    <td className={`px-5 py-3.5 text-right font-mono font-semibold text-sm tracking-tight border-none tabular-numbers ${
                      tx.vchType === 'Payment' || tx.narration.toLowerCase().includes('withdraw') || tx.items[0].credit !== null
                        ? 'text-rose-600' 
                        : 'text-emerald-700'
                    }`}>
                      {tx.vchType === 'Payment' || tx.narration.toLowerCase().includes('withdraw') || tx.items[0].credit !== null ? '-' : '+'}
                      ${(tx.amountValue ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider select-none ${
                        tx.status === 'Cleared' 
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/50' 
                          : tx.status === 'Pending' 
                          ? 'bg-amber-50 text-amber-800 border border-amber-200/50' 
                          : tx.status === 'Draft' 
                          ? 'bg-slate-100 text-slate-600 border border-slate-200/50' 
                          : 'bg-rose-50 text-rose-800 border border-rose-200/50'
                      }`}>
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* Primary Floating Action Button */}
      <button 
        onClick={onOpenQuickVoucher}
        title="Quick Voucher Entry"
        className="fixed bottom-6 right-6 w-13 h-13 bg-[#0a2f85] text-white rounded-full shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 flex items-center justify-center transition-all z-10 cursor-pointer"
      >
        <Plus className="h-6 w-6 stroke-[2.5]" />
      </button>

    </div>
  );
}
