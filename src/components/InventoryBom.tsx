import React, { useState, useMemo } from 'react';
import { 
  Package, 
  Warehouse, 
  Clock, 
  Settings, 
  Tag, 
  Activity, 
  Wrench, 
  Plus, 
  Check, 
  Info,
  AlertCircle
} from 'lucide-react';
import { StockItem, BillOfMaterial } from '../types-extra';

interface InventoryBomProps {
  stockItems: StockItem[];
  boms: BillOfMaterial[];
  onAddStockItem: (item: StockItem) => void;
  onAddBom: (bom: BillOfMaterial) => void;
}

export default function InventoryBom({
  stockItems,
  boms,
  onAddStockItem,
  onAddBom
}: InventoryBomProps) {
  const [subTab, setSubTab] = useState<'items' | 'godowns' | 'batches' | 'valuation' | 'bom'>('items');

  // Input states for new Stock Item
  const [itemName, setItemName] = useState('');
  const [itemGroup, setItemGroup] = useState('Semiconductors');
  const [itemCategory, setItemCategory] = useState('Hardware');
  const [itemWarehouse, setItemWarehouse] = useState('Godown A - South Bengaluru Warehouse');
  const [itemBatch, setItemBatch] = useState('B-NEW-2023');
  const [itemQty, setItemQty] = useState('');
  const [itemRate, setItemRate] = useState('');
  const [itemUnit, setItemUnit] = useState('Pcs');
  const [itemReorder, setItemReorder] = useState('200');
  const [itemRetail, setItemRetail] = useState('');
  const [itemWholesale, setItemWholesale] = useState('');

  // BOM construction state
  const [bomGoodName, setBomGoodName] = useState('');
  const [bomNo, setBomNo] = useState('');
  
  // Stock Valuation method toggle
  const [costModel, setCostModel] = useState<'FIFO' | 'AverageCost' | 'LIFO'>('FIFO');

  const handleCreateStockItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName || !itemQty || !itemRate) {
      return alert('Specify name, opening quantity and base rate purchase values.');
    }

    onAddStockItem({
      id: 'stock-' + itemName.toLowerCase().replace(/\s+/g, '-'),
      name: itemName,
      groupName: itemGroup,
      category: itemCategory,
      godown: itemWarehouse,
      batchNo: itemBatch,
      quantity: parseFloat(itemQty) || 0,
      rate: parseFloat(itemRate) || 0,
      unit: itemUnit,
      reorderLevel: parseFloat(itemReorder) || 100,
      priceLevelRetail: parseFloat(itemRetail) || (parseFloat(itemRate) * 1.25),
      priceLevelWholesale: parseFloat(itemWholesale) || (parseFloat(itemRate) * 1.1)
    });

    setItemName('');
    setItemQty('');
    setItemRate('');
    setItemRetail('');
    setItemWholesale('');
    alert('Stock Item configured and recorded.');
  };

  const handleCreateBomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bomGoodName || !bomNo) return alert('Input finished product category and BOM serial codes.');

    // Pre-populate with typical assemblies for testing
    onAddBom({
      id: 'bom-' + bomGoodName.toLowerCase().replace(/\s+/g, '-'),
      finishedGoodName: bomGoodName,
      bomNo: bomNo,
      components: [
        { itemId: 'stock-processor', itemName: 'Octa-Core Advanced Processor SoC', quantityRequired: 1, unit: 'Pcs' },
        { itemId: 'stock-ram', itemName: 'DDR5 High-Density SDRAM 16GB', quantityRequired: 2, unit: 'Pcs' }
      ]
    });

    setBomGoodName('');
    setBomNo('');
    alert('Bill of Materials formula structured.');
  };

  // Dynamic stock values calculation
  const totalStockWorth = useMemo(() => {
    return stockItems.reduce((acc, item) => acc + (item.quantity * item.rate), 0);
  }, [stockItems]);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#faf8ff] p-6 overflow-y-auto">
      
      {/* Title */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-extrabold text-[#00236f] tracking-tight">Inventory & Bill of Materials (BOM)</h2>
          <p className="text-slate-500 text-xs mt-0.5">Control multiple Godowns, track batch dates, configure wholesale price levels, utilize FIFO modeling, and formulate BOMs.</p>
        </div>

        {/* Subnav items */}
        <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200/55 shadow-3xs">
          {[
            { id: 'items', label: 'Stock Summary', icon: Package },
            { id: 'godowns', label: 'Godown mapping', icon: Warehouse },
            { id: 'batches', label: 'Batches expiry', icon: Clock },
            { id: 'valuation', label: 'Valuation & Pricing', icon: Tag },
            { id: 'bom', label: 'Bill of Materials (BOM)', icon: Wrench }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setSubTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-extrabold transition-all cursor-pointer ${
                  subTab === tab.id 
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

      {subTab === 'items' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Create stock entry forms */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-3xs">
            <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2 mb-4 flex items-center gap-1.5">
              <Plus className="h-4 w-4 text-[#00236f]" />
              New Stock Item Entry
            </h3>

            <form onSubmit={handleCreateStockItem} className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Item Title Name</label>
                <input 
                  type="text" 
                  value={itemName}
                  onChange={e => setItemName(e.target.value)}
                  placeholder="e.g. SSD SATA Crucial 500GB"
                  className="w-full text-xs px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Stock Group</label>
                  <select 
                    value={itemGroup}
                    onChange={e => setItemGroup(e.target.value)}
                    className="w-full text-xs px-2 py-1.5 border border-slate-200 rounded-lg bg-white"
                  >
                    <option value="Semiconductors">Semiconductors</option>
                    <option value="Circuit Assemblies">Assemblies</option>
                    <option value="Memory Matrices">Memories</option>
                    <option value="Thermal Solutions">Thermal Cooler</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Category</label>
                  <input 
                    type="text" 
                    value={itemCategory}
                    onChange={e => setItemCategory(e.target.value)}
                    placeholder="e.g. Hardware"
                    className="w-full text-xs px-2 py-1.5 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Target Storage Warehouse (Godown)</label>
                <select 
                  value={itemWarehouse}
                  onChange={e => setItemWarehouse(e.target.value)}
                  className="w-full text-xs px-3 py-1.5 border border-slate-200 rounded-lg bg-white"
                >
                  <option value="Godown A - South Bengaluru Warehouse">Godown A - South Bengaluru</option>
                  <option value="Godown B - Mumbai Port Godown">Godown B - Mumbai Port</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Batch Code</label>
                  <input 
                    type="text" 
                    value={itemBatch}
                    onChange={e => setItemBatch(e.target.value)}
                    className="w-full text-xs px-2 py-1.5 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Measure Unit</label>
                  <input 
                    type="text" 
                    value={itemUnit}
                    onChange={e => setItemUnit(e.target.value)}
                    className="w-full text-xs px-2 py-1.5 border border-slate-200 rounded-lg text-center"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Qty (Opening)</label>
                  <input 
                    type="number" 
                    value={itemQty}
                    onChange={e => setItemQty(e.target.value)}
                    placeholder="e.g. 50"
                    className="w-full text-xs px-2 py-1.5 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Cost Rate (₹)</label>
                  <input 
                    type="number" 
                    value={itemRate}
                    onChange={e => setItemRate(e.target.value)}
                    placeholder="e.g. 1500"
                    className="w-full text-xs px-2 py-1.5 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Reorder Limit Warning</label>
                  <input 
                    type="number" 
                    value={itemReorder}
                    onChange={e => setItemReorder(e.target.value)}
                    className="w-full text-xs px-2 py-1.5 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Retail Price Level (Optional)</label>
                  <input 
                    type="number" 
                    value={itemRetail}
                    onChange={e => setItemRetail(e.target.value)}
                    className="w-full text-xs px-2 py-1.5 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full py-2 bg-[#00236f] hover:bg-brand-primary text-white font-extrabold text-[11px] uppercase tracking-wider rounded-lg transition-all"
              >
                Log Inventory Component
              </button>
            </form>
          </div>

          {/* Summarized Stock Cards */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Net Stats Header Card */}
            <div className="bg-[#00236f] text-white p-5 rounded-2xl flex justify-between items-center shadow-lg relative overflow-hidden">
              <div className="space-y-1 relative z-10">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#9ab4ea]">Consolidated Assets Value</p>
                <h3 className="text-2xl font-extrabold tracking-tight">₹{totalStockWorth.toLocaleString('en-IN')}.00</h3>
                <p className="text-[10px] text-slate-100/70 font-semibold">Tally-adjusted materials value based on historic ledger parameters.</p>
              </div>

              <div className="p-3 bg-white/10 rounded-xl relative z-10 select-none text-right">
                <span className="text-[10px] font-bold uppercase block text-[#9ab4ea] mb-0.5">Physical Types count</span>
                <span className="text-xl font-extrabold">{stockItems.length} categories</span>
              </div>
            </div>

            {/* Grid display main rows */}
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-3xs overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wide">Stock Categories and Safe Ranges</span>
                <span className="text-[10px] bg-[#faf8ff] px-2 py-1 text-[#00236f] border border-blue-500/10 rounded font-bold">Auto-audit indicators</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 select-none">
                      <th className="py-2.5 px-4">Material Descriptor</th>
                      <th className="py-2.5 px-4">Parent Group</th>
                      <th className="py-2.5 px-4 text-center">Batch Index</th>
                      <th className="py-2.5 px-4 text-center">Quantity on hand</th>
                      <th className="py-2.5 px-4 text-right">Unit Rate</th>
                      <th className="py-2.5 px-4 text-right">Value Asset (₹)</th>
                      <th className="py-2.5 px-3 text-center">Audit Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {stockItems.map(item => {
                      const warning = item.quantity <= item.reorderLevel;

                      return (
                        <tr key={item.id} className="hover:bg-slate-50/50 transition-all">
                          <td className="py-3 px-4 font-extrabold text-slate-900">
                            <div>
                              <span>{item.name}</span>
                              <p className="text-[9px] text-slate-400 font-medium mt-0.5">{item.godown}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-slate-500 font-semibold">{item.groupName}</td>
                          <td className="py-3 px-4 font-mono text-center text-slate-400 font-bold">{item.batchNo}</td>
                          <td className="py-3 px-4 text-center">
                            <span className={`px-2 py-0.5 rounded font-mono font-extrabold text-xs ${
                              warning ? 'bg-orange-50 text-orange-700' : 'bg-slate-50 text-slate-700'
                            }`}>
                              {item.quantity} {item.unit}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-slate-600">₹{item.rate}</td>
                          <td className="py-3 px-4 text-right font-mono font-extrabold text-slate-950">₹{(item.quantity * item.rate).toLocaleString('en-IN')}</td>
                          <td className="py-3 px-3 text-center">
                            {warning ? (
                              <span className="inline-flex items-center gap-1 text-[9px] bg-rose-50 text-rose-600 border border-rose-100 px-1.5 py-0.5 rounded-full font-bold animate-pulse">
                                <AlertCircle className="h-3 w-3 shrink-0" /> REORDER LIMIT RE-HIT
                              </span>
                            ) : (
                              <span className="text-[10px] text-emerald-600 font-bold">✓ Safe bounds</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* GODOWNS MAPPING VIEW */}
      {subTab === 'godowns' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-3xs">
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-2 mb-4 flex items-center gap-1.5">
              <Warehouse className="h-4 w-4 text-[#00236f]" />
              Godown A - South Bengaluru Storehouse
            </h3>
            <p className="text-[11px] text-slate-400 mb-4 leading-relaxed font-semibold">Location code: IND-KA-BLR-01. Secure components inventory warehouse specializing in high-speed processors and circuit PCB blocks assembly registers.</p>

            <div className="space-y-3.5 pt-2">
              {stockItems.filter(i => i.godown.includes('Bengaluru')).map(item => (
                <div key={item.id} className="p-3.5 bg-[#faf8ff] rounded-xl border border-slate-100 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-extrabold text-slate-900">{item.name}</span>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Group: {item.groupName} | Batch: {item.batchNo}</p>
                  </div>
                  <span className="font-mono font-extrabold bg-blue-50 text-[#00236f] px-2.5 py-1 rounded text-xs">
                    {item.quantity} {item.unit}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-3xs">
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-2 mb-4 flex items-center gap-1.5">
              <Warehouse className="h-4 w-4 text-emerald-600" />
              Godown B - Mumbai Custom Port Storage
            </h3>
            <p className="text-[11px] text-slate-400 mb-4 leading-relaxed font-semibold">Location code: IND-MH-BOM-02. Maritime entry checkpoint storing bulk high-volume commodities such as memories DRAM blocks, wires and thermal cooler solutions.</p>

            <div className="space-y-3.5 pt-2">
              {stockItems.filter(i => i.godown.includes('Mumbai')).map(item => (
                <div key={item.id} className="p-3.5 bg-emerald-50/20 rounded-xl border border-slate-100 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-extrabold text-slate-900">{item.name}</span>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Group: {item.groupName} | Batch: {item.batchNo}</p>
                  </div>
                  <span className="font-mono font-extrabold bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded text-xs">
                    {item.quantity} {item.unit}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* BATCH CODES EXPIRY */}
      {subTab === 'batches' && (
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-3xs">
          <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2 mb-4 flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-indigo-500" />
            Batch-Wise Component Expiry & Manufacturing Quality Records
          </h3>

          <div className="overflow-x-auto mt-4">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 select-none">
                  <th className="py-2.5 px-4">Batch Reference ID</th>
                  <th className="py-2.5 px-4">Material Name</th>
                  <th className="py-2.5 px-4 text-center">Allocated Warehouse</th>
                  <th className="py-2.5 px-4 text-center">Physical quantity</th>
                  <th className="py-2.5 px-4 text-center">Expiry/Retest Standard</th>
                  <th className="py-2.5 px-4 text-center">Status Index</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stockItems.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/20 transition-all">
                    <td className="py-3 px-4 font-mono font-bold text-[#00236f]">{item.batchNo}</td>
                    <td className="py-3 px-4 font-extrabold text-slate-800">{item.name}</td>
                    <td className="py-3 px-4 text-center text-slate-500 font-semibold">{item.godown.split(' - ')[0]}</td>
                    <td className="py-3 px-4 text-center font-mono font-extrabold text-slate-700">{item.quantity} units</td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-slate-600">{item.expiryDate || 'Retest Exempt (Solder base)'}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800">
                        Operational Clear Space
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VALUATION MODEL & MULTIPLE PRICE LEVELS */}
      {subTab === 'valuation' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-3xs flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-2 mb-4">
                Active Valuation Rules
              </h3>

              <div className="space-y-4 pt-1">
                <p className="text-xs text-slate-500 leading-relaxed font-semibold">Tally enforces discrete stock accounting values during fiscal reporting calculations based on selected cost methods.</p>
                
                <div className="space-y-2.5">
                  {[
                    { id: 'FIFO', label: 'First-In, First-Out (FIFO)', desc: 'Sells oldest batches first to cushion reporting against inflationary rate changes.' },
                    { id: 'AverageCost', label: 'Weighted Average Costing', desc: 'Smoothes net valuation outlays based on math averages.' }
                  ].map(rule => (
                    <label 
                      key={rule.id}
                      onClick={() => setCostModel(rule.id as any)}
                      className={`block p-3 rounded-lg border cursor-pointer select-none transition-all ${
                        costModel === rule.id 
                          ? 'bg-[#1e3a8a]/5 border-[#00236f] text-slate-900 shadow-3xs' 
                          : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input 
                          type="radio" 
                          name="costmodel" 
                          checked={costModel === rule.id}
                          onChange={() => {}} // Hook Handled by parent click label 
                          className="text-[#00236f] focus:ring-[#00236f]"
                        />
                        <span className="text-xs font-extrabold">{rule.label}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1 pl-5 leading-normal">{rule.desc}</p>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] text-[#00236f]">
              <span className="font-extrabold uppercase tracking-wide flex items-center gap-1 mb-1">
                <Activity className="h-3.5 w-3.5 text-indigo-500" /> Computed material valuation
              </span>
              <p className="leading-normal font-semibold">Under {costModel === 'FIFO' ? 'FIFO standard index' : 'Weighted average'}, current inventory value maps exactly to <span className="font-extrabold">₹{totalStockWorth.toLocaleString('en-IN')}</span>.</p>
            </div>
          </div>

          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/80 p-5 shadow-3xs">
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2 mb-4">
              Discrete Price Levels Matrix (Invoicing Defaults)
            </h3>

            <div className="overflow-x-auto mt-4">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 select-none">
                    <th className="py-2.5 px-3">Item Name</th>
                    <th className="py-2.5 px-3 text-right">Base Purchase Cost (₹)</th>
                    <th className="py-2.5 px-3 text-right text-indigo-700">Retail price Level (Dr / Cr)</th>
                    <th className="py-2.5 px-3 text-right text-emerald-700">Wholesale Level (Partner)</th>
                    <th className="py-2.5 px-3 text-center">Dealer profit margin %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stockItems.map(item => {
                    const wholesaleMargin = Math.round(((item.priceLevelWholesale - item.rate) / item.rate) * 100);

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/20 transition-all">
                        <td className="py-3 px-3 font-extrabold text-slate-800">{item.name}</td>
                        <td className="py-3 px-3 text-right font-mono font-semibold text-slate-500">₹{item.rate}</td>
                        <td className="py-3 px-3 text-right font-mono font-extrabold text-indigo-700">₹{item.priceLevelRetail}</td>
                        <td className="py-3 px-3 text-right font-mono font-extrabold text-emerald-700">₹{item.priceLevelWholesale}</td>
                        <td className="py-3 px-3 text-center font-bold text-slate-600">+{wholesaleMargin}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* BILL OF MATERIALS & MANUFACTURING RIG */}
      {subTab === 'bom' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-3xs">
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-2 mb-4">
              Create Manufacturing Formula (BOM)
            </h3>

            <form onSubmit={handleCreateBomSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Finished assemble Good Descriptor</label>
                <input 
                  type="text" 
                  value={bomGoodName}
                  onChange={e => setBomGoodName(e.target.value)}
                  placeholder="e.g. Sirach Standard Core Server v3"
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">BOM Template Serial No.</label>
                <input 
                  type="text" 
                  value={bomNo}
                  onChange={e => setBomNo(e.target.value)}
                  placeholder="e.g. BOM-SRCH-A03"
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none"
                />
              </div>

              <div className="p-3 bg-[#faf8ff] rounded-lg border border-slate-100 text-[11px] text-[#00236f] space-y-2">
                <span className="font-extrabold block">Default Components to bind:</span>
                <p className="leading-normal font-semibold">For ease of testing, creating BOM adds 1x processor and 2x RAM items on hand to simulate active assembly sheets.</p>
              </div>

              <button 
                type="submit"
                className="w-full py-2.5 bg-[#00236f] hover:bg-brand-primary text-white font-extrabold text-[11px] uppercase tracking-wider rounded-lg transition-all"
              >
                Assemble Formula Pattern
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/80 p-5 shadow-3xs">
            <h3 className="text-xs font-extrabold text-[#00236f] uppercase tracking-wider border-b border-slate-100 pb-2 mb-4">
              Configured Bills of Materials (Active Formulas)
            </h3>

            <div className="space-y-5 mt-4">
              {boms.map(bom => {
                // Calculate finished cost rate
                const cost = bom.components.reduce((sum, item) => {
                  const matchingCost = stockItems.find(si => si.id === item.itemId)?.rate ?? 100;
                  return sum + (matchingCost * item.quantityRequired);
                }, 0);

                return (
                  <div key={bom.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex justify-between items-start mb-3 border-b border-slate-200/60 pb-2.5">
                      <div>
                        <h4 className="text-xs font-extrabold text-slate-900">{bom.finishedGoodName}</h4>
                        <span className="text-[10px] bg-[#1e3a8a]/10 text-[#00236f] px-2 py-0.5 rounded font-extrabold uppercase mt-1 inline-block">{bom.bomNo}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-semibold text-slate-400">Total Assembly Cost:</p>
                        <p className="text-sm font-mono font-extrabold text-emerald-700">₹{cost.toLocaleString('en-IN')}</p>
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Required Raw Components List:</p>
                      <div className="grid grid-cols-2 gap-2">
                        {bom.components.map((comp, idx) => {
                          const itemCost = stockItems.find(si => si.id === comp.itemId)?.rate ?? 0;
                          return (
                            <div key={idx} className="bg-white p-2.5 rounded border border-slate-150 flex justify-between items-center text-[11px]">
                              <div>
                                <span className="font-extrabold text-slate-800">{comp.itemName.split(' ')[0]} ...</span>
                                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{comp.quantityRequired} {comp.unit} required</p>
                              </div>
                              <span className="font-mono text-slate-500 font-bold">₹{itemCost * comp.quantityRequired}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
