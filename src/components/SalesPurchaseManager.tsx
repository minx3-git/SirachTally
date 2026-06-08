import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  ShoppingCart, 
  Plus, 
  Calendar, 
  User, 
  CheckCircle2, 
  X, 
  Clock, 
  ChevronRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { SalesPurchaseOrder } from '../types-extra';

interface SalesPurchaseManagerProps {
  orders: SalesPurchaseOrder[];
  onAddOrder: (order: SalesPurchaseOrder) => void;
}

export default function SalesPurchaseManager({
  orders,
  onAddOrder
}: SalesPurchaseManagerProps) {
  const [activeSection, setActiveSection] = useState<'orders' | 'notes' | 'outstandings'>('orders');

  // Input states
  const [newOrderType, setNewOrderType] = useState<'SalesOrder' | 'PurchaseOrder' | 'Quotation' | 'CreditNote' | 'DebitNote'>('SalesOrder');
  const [partyName, setPartyName] = useState('');
  const [itemsSummary, setItemsSummary] = useState('');
  const [totalVal, setTotalVal] = useState('');

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!partyName || !itemsSummary || !totalVal) {
      return alert('Provide customer/vendor details, items summary and contract value amounts.');
    }

    const typePrefixes = {
      SalesOrder: 'SO',
      PurchaseOrder: 'PO',
      Quotation: 'QT',
      CreditNote: 'CN',
      DebitNote: 'DN'
    };

    const count = orders.filter(o => o.orderType === newOrderType).length + 1;
    const orderNum = `${typePrefixes[newOrderType]}-2023-${9000 + count}`;

    onAddOrder({
      id: 'ord-' + Math.random().toString(36).substring(2, 9),
      orderNo: orderNum,
      orderType: newOrderType,
      date: new Date().toISOString().split('T')[0],
      partyName: partyName,
      itemsSummary: itemsSummary,
      totalAmount: parseFloat(totalVal) || 0,
      status: 'Open'
    });

    setPartyName('');
    setItemsSummary('');
    setTotalVal('');
    alert(`${newOrderType} record generated successfully under ID: ${orderNum}`);
  };

  // Outstanding accounts trackers
  const outstandingReceivables = [
    { client: 'AlphaTech Corporate HQ', balance: 45200, dueOn: '2023-11-15', durationDays: 45, status: 'Overdue' },
    { client: 'Future Infrastructure Partners', balance: 112000, dueOn: '2023-12-01', durationDays: 12, status: 'Open' },
    { client: 'Apex Global Logistics Pvt Ltd', balance: 12400, dueOn: '2023-10-10', durationDays: 52, status: 'Urgent' }
  ];

  const outstandingPayables = [
    { vendor: 'SolderCorp Foundry India', balance: 12840.10, dueOn: '2023-11-20', durationDays: 15, status: 'Open' },
    { vendor: 'HDFC Corporate Tax Div Office', balance: 15400.00, dueOn: '2023-11-10', durationDays: 25, status: 'Grace Period' }
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-[#faf8ff] p-6 overflow-y-auto">
      
      {/* Block Title Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-extrabold text-[#00236f] tracking-tight">Sales & Purchases Order Register</h2>
          <p className="text-slate-500 text-xs mt-0.5">Approve incoming purchase requests, track quotations pipelines, log credit/debit notes, and scan outstanding debtor lists.</p>
        </div>

        {/* Section selectors */}
        <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200/50">
          {[
            { id: 'orders', label: 'Orders & Quotes', icon: ShoppingCart },
            { id: 'notes', label: 'Credit/Debit Notes', icon: FileText },
            { id: 'outstandings', label: 'Outstanding Aging', icon: TrendingUp }
          ].map(sect => {
            const Icon = sect.icon;
            return (
              <button
                key={sect.id}
                onClick={() => setActiveSection(sect.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-extrabold transition-all cursor-pointer ${
                  activeSection === sect.id 
                    ? 'bg-white text-[#00236f] shadow-2xs' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{sect.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {activeSection === 'orders' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Quick Create Forms */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-3xs">
            <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2 mb-4 flex items-center gap-1.5">
              <Plus className="h-4 w-4 text-[#00236f]" />
              Form Order & Quotation
            </h3>

            <form onSubmit={handleCreateOrder} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Contract/Voucher Class</label>
                <select 
                  value={newOrderType}
                  onChange={e => setNewOrderType(e.target.value as any)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white"
                >
                  <option value="SalesOrder">Sales Order (SO)</option>
                  <option value="PurchaseOrder">Purchase Order (PO)</option>
                  <option value="Quotation">Quotation Estimate (QT)</option>
                  <option value="CreditNote">Credit Note (CN)</option>
                  <option value="DebitNote">Debit Note (DN)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Corporate Party / Stakeholder Dealer</label>
                <input 
                  type="text" 
                  value={partyName} 
                  onChange={e => setPartyName(e.target.value)}
                  placeholder="e.g. Reliance JIO Infocomm Ltd"
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Items & Quantities summary</label>
                <textarea 
                  value={itemsSummary}
                  onChange={e => setItemsSummary(e.target.value)}
                  placeholder="e.g. 5x Server frames, 25x Motherboard assemblies..."
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg h-20 resize-none font-sans"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Total Value Amount (₹)</label>
                <input 
                  type="number" 
                  value={totalVal}
                  onChange={e => setTotalVal(e.target.value)}
                  placeholder="e.g. 112000"
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>

              <button 
                type="submit"
                className="w-full py-2 bg-[#00236f] hover:bg-brand-primary text-white font-extrabold text-[11px] uppercase tracking-wider rounded-lg transition-all"
              >
                Log Contract Sheet
              </button>
            </form>
          </div>

          {/* Active Orders List */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/80 shadow-3xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 select-none">
                    <th className="py-2.5 px-4">Serial Number</th>
                    <th className="py-2.5 px-4">Document Type</th>
                    <th className="py-2.5 px-4">Trade Partner Party</th>
                    <th className="py-2.5 px-4">Assigned Items</th>
                    <th className="py-2.5 px-4 text-right">Net Value</th>
                    <th className="py-2.5 px-3 text-center">Status Index</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.map(order => (
                    <tr key={order.id} className="hover:bg-slate-50/20 transition-all">
                      <td className="py-3 px-4 font-mono font-bold text-[#00236f]">{order.orderNo}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          order.orderType === 'SalesOrder' ? 'bg-indigo-50 text-indigo-700' :
                          order.orderType === 'PurchaseOrder' ? 'bg-rose-50 text-rose-700' :
                          'bg-amber-50 text-amber-700'
                        }`}>
                          {order.orderType}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-extrabold text-slate-900">{order.partyName}</td>
                      <td className="py-3 px-4 text-slate-500 font-semibold truncate max-w-[200px]" title={order.itemsSummary}>{order.itemsSummary}</td>
                      <td className="py-3 px-4 text-right font-mono font-extrabold text-slate-800">₹{order.totalAmount.toLocaleString('en-IN')}</td>
                      <td className="py-3 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          order.status === 'Open' ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* NOTES TAB */}
      {activeSection === 'notes' && (
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-3xs">
          <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2 mb-4">
            Credit and Debit Adjustments Register
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 select-none">
                  <th className="py-2.5 px-4">Adjustment Certificate</th>
                  <th className="py-2.5 px-4">Party Beneficiary</th>
                  <th className="py-2.5 px-4 text-center">Trigger Date</th>
                  <th className="py-2.5 px-4">Notes Correction Summary</th>
                  <th className="py-2.5 px-4 text-right">Adjusted Amount</th>
                  <th className="py-2.5 px-4 text-center">Audit Code Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.filter(o => o.orderType === 'CreditNote' || o.orderType === 'DebitNote').map(note => (
                  <tr key={note.id} className="hover:bg-slate-50/20 transition-all">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{note.orderNo}</td>
                    <td className="py-3.5 px-4 font-extrabold text-indigo-950">{note.partyName}</td>
                    <td className="py-3.5 px-4 text-center font-semibold text-slate-400">{note.date}</td>
                    <td className="py-3.5 px-4 text-slate-500">{note.itemsSummary}</td>
                    <td className="py-3.5 px-4 text-right font-mono font-extrabold text-slate-800 font-bold">₹{note.totalAmount.toLocaleString('en-IN')}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-100/60">
                        Adjusted Pending Clearing
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* OUTSTANDINGS AGING OUTLINE */}
      {activeSection === 'outstandings' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-3xs">
            <h3 className="text-xs font-extrabold text-rose-700 uppercase tracking-widest border-b border-slate-100 pb-2 mb-4 flex items-center gap-1.5">
              <AlertCircle className="h-4 w-4" />
              Outstanding Receivables Aging (Debtors)
            </h3>

            <div className="space-y-3">
              {outstandingReceivables.map((item, idx) => (
                <div key={idx} className="p-3 bg-red-50/35 rounded-xl border border-red-100/60 text-xs flex justify-between items-center">
                  <div>
                    <h4 className="font-extrabold text-[#00236f]">{item.client}</h4>
                    <span className="text-[10px] text-rose-600 font-bold mt-0.5 inline-block">Due for {item.durationDays} days | Due Date: {item.dueOn}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-extrabold text-slate-950 text-sm">₹{item.balance.toLocaleString('en-IN')}</p>
                    <span className="inline-block text-[10px] uppercase font-bold text-rose-500 bg-rose-50 px-1 py-0.5 rounded mt-1">{item.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-3xs">
            <h3 className="text-xs font-extrabold text-[#00236f] uppercase tracking-widest border-b border-slate-100 pb-2 mb-4 flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              Outstanding Payables Aging (Creditors)
            </h3>

            <div className="space-y-3">
              {outstandingPayables.map((item, idx) => (
                <div key={idx} className="p-3 bg-slate-50/70 rounded-xl border border-slate-150 text-xs flex justify-between items-center">
                  <div>
                    <h4 className="font-extrabold text-slate-900">{item.vendor}</h4>
                    <span className="text-[10px] text-slate-500 font-semibold mt-0.5 inline-block">Expires in {item.durationDays} days | Due Date: {item.dueOn}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-extrabold text-slate-900 text-sm">₹{item.balance.toLocaleString('en-IN')}</p>
                    <span className="inline-block text-[10px] uppercase font-bold text-blue-500 bg-blue-50 px-1 py-0.5 rounded mt-1">{item.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
