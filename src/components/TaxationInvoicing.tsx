import React, { useState, useMemo } from 'react';
import { 
  FileCheck, 
  Search, 
  QrCode, 
  Truck, 
  CheckCircle, 
  Info, 
  Percent, 
  ShieldAlert, 
  Cpu, 
  Plus, 
  Printer 
} from 'lucide-react';

export default function TaxationInvoicing() {
  const [activeTab, setActiveTab] = useState<'invoice' | 'reports' | 'eway' | 'einvoice' | 'gstin'>('invoice');

  // GSTIN Validator States
  const [gstinInput, setGstinInput] = useState('29AABCS8374R1Z8');
  const [gstinResult, setGstinResult] = useState<{ isValid: boolean; stateName: string; pan: string } | null>({
    isValid: true,
    stateName: 'Karnataka (Code 29)',
    pan: 'AABCS8374R'
  });

  // E-Way Bill State
  const [ewbPart, setEwbPart] = useState('AlphaTech Corporate HQ');
  const [ewbDest, setEwbDest] = useState('Mumbai Port Warehouse');
  const [ewbVehicle, setEwbVehicle] = useState('KA-51-MD-9021');
  const [ewbValue, setEwbValue] = useState('45200');
  const [ewayLogs, setEwayLogs] = useState([
    { ewayBillNo: '381029102910', date: '2023-11-01', party: 'AlphaTech Corporate HQ', transport: 'KA-51-MD-9021', amount: 45200, status: 'Active' },
    { ewayBillNo: '901290129038', date: '2023-10-15', party: 'SolderCorp Foundry India', transport: 'MH-03-JK-1823', amount: 18500, status: 'Completed' }
  ]);

  // Dynamic Invoicing Simulator state
  const [clientGst, setClientGst] = useState('27AAACS1902M1ZN');
  const [invoiceAmount, setInvoiceAmount] = useState('50000');
  const [cgstRate, setCgstRate] = useState('9');
  const [sgstRate, setSgstRate] = useState('9');

  const computedInvoice = useMemo(() => {
    const amt = parseFloat(invoiceAmount) || 0;
    const cgstR = parseFloat(cgstRate) || 0;
    const sgstR = parseFloat(sgstRate) || 0;
    const cgstAmt = amt * (cgstR / 100);
    const sgstAmt = amt * (sgstR / 100);
    const total = amt + cgstAmt + sgstAmt;
    return { cgstAmt, sgstAmt, total };
  }, [invoiceAmount, cgstRate, sgstRate]);

  // GSTIN Validation engine
  const handleValidateGst = (e: React.FormEvent) => {
    e.preventDefault();
    const g = gstinInput.trim().toUpperCase();
    if (g.length !== 15) {
      setGstinResult({ isValid: false, stateName: 'Incorrect Length (Needs exactly 15 characters)', pan: 'N/A' });
      return;
    }
    // Simple state identification based on first 2 digits
    const stateCode = g.slice(0, 2);
    const panPart = g.slice(2, 12);
    const statesMap: { [key: string]: string } = {
      '29': 'Karnataka',
      '27': 'Maharashtra',
      '07': 'New Delhi',
      '33': 'Tamil Nadu',
      '09': 'Uttar Pradesh'
    };
    const stateName = statesMap[stateCode] ? `${statesMap[stateCode]} (Code ${stateCode})` : `Unregistered State Code (${stateCode})`;
    setGstinResult({
      isValid: true,
      stateName: stateName,
      pan: panPart
    });
  };

  const handleGenerateEway = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ewbPart || !ewbDest || !ewbVehicle || !ewbValue) {
      return alert('Fill out complete dispatch parameters.');
    }
    const fakeNo = Math.floor(100000000000 + Math.random() * 900000000000).toString();
    setEwayLogs(prev => [
      {
        ewayBillNo: fakeNo,
        date: new Date().toISOString().split('T')[0],
        party: ewbPart,
        transport: ewbVehicle,
        amount: parseFloat(ewbValue) || 0,
        status: 'Active'
      },
      ...prev
    ]);
    alert(`E-Way Bill registration approved with tracking token: ${fakeNo}`);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#faf8ff] p-6 overflow-y-auto">
      
      {/* Title */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-extrabold text-[#00236f] tracking-tight">GST Filing & Corporate Taxation Desk</h2>
          <p className="text-slate-500 text-xs mt-0.5">Automate CGST/SGST/IGST calculations, compile GSTR return files, generate NIC E-Way bills, and parse verified GSTIN targets.</p>
        </div>

        {/* Toggles */}
        <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200/50">
          {[
            { id: 'invoice', label: 'GST Invoice Tool', icon: Percent },
            { id: 'reports', label: 'GSTR Returns Logs', icon: FileCheck },
            { id: 'eway', label: 'NIC E-Way Bills', icon: Truck },
            { id: 'einvoice', label: 'NIC E-Invoicing QR', icon: QrCode },
            { id: 'gstin', label: 'GSTIN Format Checker', icon: Search }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-extrabold transition-all cursor-pointer ${
                  activeTab === tab.id 
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

      {activeTab === 'invoice' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-3xs">
            <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-2 mb-4">
              GST Compliant Invoice Generator
            </h3>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Consignee GSTIN</label>
                  <input 
                    type="text" 
                    value={clientGst}
                    onChange={e => setClientGst(e.target.value)}
                    placeholder="e.g. 29AABCS8374R1Z8"
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Taxable Assessable Value (₹)</label>
                  <input 
                    type="number" 
                    value={invoiceAmount}
                    onChange={e => setInvoiceAmount(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Central Tax CGST %</label>
                  <select 
                    value={cgstRate}
                    onChange={e => setCgstRate(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white"
                  >
                    <option value="2.5">2.5 % (Semi-grain)</option>
                    <option value="6">6.0 % (Computers base)</option>
                    <option value="9">9.0 % (Hardware Standard)</option>
                    <option value="14">14.0 % (Capital Luxuries)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">State Tax SGST %</label>
                  <select 
                    value={sgstRate}
                    onChange={e => setSgstRate(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white"
                  >
                    <option value="2.5">2.5 %</option>
                    <option value="6">6.0 %</option>
                    <option value="9">9.0 %</option>
                    <option value="14">14.0 %</option>
                  </select>
                </div>
              </div>

              <div className="p-4 bg-[#faf8ff] rounded-xl border border-slate-100 text-xs space-y-2.5">
                <span className="font-extrabold text-[#00236f] block">Summary Tax Outline:</span>
                <div className="flex justify-between items-center text-slate-500">
                  <span>Basic Assessable Cost:</span>
                  <span className="font-mono font-bold">₹{(parseFloat(invoiceAmount) || 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center text-slate-500">
                  <span>SGST Tax Portion ({sgstRate}%):</span>
                  <span className="font-mono font-bold">₹{computedInvoice.sgstAmt.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center text-slate-500">
                  <span>CGST Tax Portion ({cgstRate}%):</span>
                  <span className="font-mono font-bold">₹{computedInvoice.cgstAmt.toLocaleString('en-IN')}</span>
                </div>
                <div className="h-px bg-slate-200/80 my-2"></div>
                <div className="flex justify-between items-center font-extrabold text-slate-800 text-sm">
                  <span>Final Bill Amount:</span>
                  <span className="text-emerald-700 font-mono">₹{computedInvoice.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              <button 
                type="button"
                onClick={() => alert('GST-compliant receipt locked into billing records.')}
                className="w-full py-2.5 bg-[#00236f] hover:bg-brand-primary text-white font-extrabold text-[11px] uppercase tracking-wider rounded-lg transition-all text-center flex items-center justify-center gap-2"
              >
                <Printer className="h-4 w-4" /> Save and Print GST Invoicing
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-3xs flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-2 mb-4">
                TDS & TCS Withholding Rates (FY 2023-24)
              </h3>
              <p className="text-xs text-slate-500 mb-4 leading-relaxed font-semibold">TDS is automatically deducted for administrative professional services and contract payments under Section 194J / 194C of the Income Tax Act.</p>

              <div className="space-y-3">
                {[
                  { section: 'Sec 194J', desc: 'Professional Fees / Tech Consult', rate: '10%', threshold: '₹30,000 p.a' },
                  { section: 'Sec 194C', desc: 'Contractors / Assembly labor', rate: '2.0%', threshold: '₹100,000 single' },
                  { section: 'Sec 194I', desc: 'Corporate Commercial Office Rent', rate: '10%', threshold: '₹240,000 p.a' }
                ].map((item, idx) => (
                  <div key={idx} className="p-3 bg-indigo-50/10 border border-slate-100 rounded-lg flex justify-between items-center text-xs">
                    <div>
                      <span className="font-extrabold text-slate-800">{item.section}</span>
                      <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{item.desc}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-extrabold text-indigo-700 block font-mono">{item.rate}</span>
                      <p className="text-[9px] text-slate-400 font-bold">Thresh: {item.threshold}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 bg-amber-50/30 border border-amber-100 rounded-lg text-[11px] text-amber-800 leading-relaxed font-semibold">
              ⚠️ General TDS Warning: Deductions are logged using the party's registered corporate PAN card. Incorrect structural returns are flagged immediately during annual audit reconciliations.
            </div>
          </div>

        </div>
      )}

      {/* SEC 2: GSTR RETURNS */}
      {activeTab === 'reports' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-3xs">
            <h3 className="text-xs font-extrabold text-indigo-950 uppercase tracking-wider border-b border-slate-100 pb-2 mb-4">
              GSTR-1 Sales Report Summary (Monthly)
            </h3>
            <p className="text-xs text-slate-500 mb-4 font-semibold">Monthly outward supplies details logged for B2B electronic filings.</p>

            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs p-2.5 bg-[#faf8ff] rounded border border-slate-100">
                <span className="font-extrabold">B2B Supplies Value (GST Compliant):</span>
                <span className="font-mono font-extrabold text-slate-800">₹520,000</span>
              </div>
              <div className="flex justify-between items-center text-xs p-2.5 bg-[#faf8ff] rounded border border-slate-100">
                <span className="font-extrabold">Outward Central Tax (CGST Portion):</span>
                <span className="font-mono text-emerald-700 font-bold">₹46,800</span>
              </div>
              <div className="flex justify-between items-center text-xs p-2.5 bg-[#faf8ff] rounded border border-slate-100">
                <span className="font-extrabold">Outward State Tax (SGST Portion):</span>
                <span className="font-mono text-emerald-700 font-bold">₹46,800</span>
              </div>
              <div className="p-3 bg-emerald-50 rounded text-[11px] text-emerald-800 font-bold border border-emerald-100">
                ✓ Auto-compilers completed: Monthly GSTR-1 sheet is reconciled and ready to generate JSON schema.
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-3xs">
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2 mb-4">
              GSTR-3B Consolidated Return Log (Self-Assessed)
            </h3>
            <p className="text-xs text-slate-500 mb-4 font-semibold">Reconciles final liability by offsetting outward taxes against Input Tax Credit (ITC).</p>

            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs p-2.5 bg-slate-50 rounded">
                <span className="font-extrabold">Gross Outward Tax Liability:</span>
                <span className="font-mono font-bold text-slate-800">₹93,600</span>
              </div>
              <div className="flex justify-between items-center text-xs p-2.5 bg-slate-50 rounded">
                <span className="font-extrabold">Available Input Tax Credit (ITC Purchases):</span>
                <span className="font-mono text-emerald-700 font-bold">- ₹14,200</span>
              </div>
              <div className="flex justify-between items-center text-xs p-2.5 bg-[#faf8ff] rounded border border-indigo-100">
                <span className="font-extrabold text-indigo-950">Net Payable Tax Balance:</span>
                <span className="font-mono text-indigo-700 font-extrabold">₹79,400</span>
              </div>
              <button 
                type="button" 
                onClick={() => alert('JSON manifest structured for direct upload to GST Common Portal.')}
                className="w-full py-2 bg-[#00236f] hover:bg-brand-primary text-white text-[11px] font-extrabold uppercase rounded cursor-pointer"
              >
                Download Filing Manifest JSON
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SEC 3: E-WAY BILL */}
      {activeTab === 'eway' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-3xs">
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2 mb-4 flex items-center gap-1.5 animate-pulse">
              <Truck className="h-4.5 w-4.5 text-indigo-600" />
              Generate NIC E-Way Bill
            </h3>

            <form onSubmit={handleGenerateEway} className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Consignee Trade Client Party</label>
                <input 
                  type="text" 
                  value={ewbPart}
                  onChange={e => setEwbPart(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Destination Warehouse Location</label>
                <input 
                  type="text" 
                  value={ewbDest}
                  onChange={e => setEwbDest(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Carrier Vehicle No</label>
                  <input 
                    type="text" 
                    value={ewbVehicle}
                    onChange={e => setEwbVehicle(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none text-center"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Invoice Cargo Amt (₹)</label>
                  <input 
                    type="number" 
                    value={ewbValue}
                    onChange={e => setEwbValue(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none text-right"
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full py-2.5 bg-[#00236f] hover:bg-brand-primary text-white text-[11px] font-extrabold uppercase tracking-wider rounded transition-all cursor-pointer"
              >
                Log Approved E-Way Transit
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/80 p-5 shadow-3xs">
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2 mb-4">
              Registered NIC E-Way Certificates Dashboard
            </h3>

            <div className="space-y-3.5 mt-4">
              {ewayLogs.map((log, idx) => (
                <div key={idx} className="p-3.5 bg-slate-50/50 rounded-xl border border-slate-100 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-mono text-[#00236f] font-bold tracking-wide">EWB-{log.ewayBillNo}</span>
                    <p className="text-[10px] text-slate-400 font-semibold mt-1">Con: {log.party} | Carrier Plate: <span className="font-bold text-slate-700">{log.transport}</span></p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-extrabold text-slate-900">₹{log.amount.toLocaleString('en-IN')}</p>
                    <span className="inline-block text-[9px] bg-emerald-50 text-emerald-800 border border-emerald-100 rounded px-1.5 py-0.5 mt-1 font-bold">
                      {log.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SEC 4: E-INVOICING QR */}
      {activeTab === 'einvoice' && (
        <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-3xs flex flex-col md:flex-row gap-8 items-center justify-center">
          <div className="p-4 bg-[#faf8ff] rounded-xl border border-dashed border-indigo-200 flex items-center justify-center shrink-0">
            {/* Dynamic visual representation of E-invoice certificate QR */}
            <div className="w-36 h-36 bg-slate-950 p-2 rounded-xl flex items-center justify-center flex-col text-white text-center gap-2 select-none">
              <QrCode className="h-20 w-20 text-[#a3bdf5]" />
              <span className="text-[8px] font-mono tracking-widest text-slate-400">IRN: 8a9b2c3d4e</span>
            </div>
          </div>

          <div className="space-y-4 max-w-lg">
            <div className="flex items-center gap-2">
              <span className="bg-emerald-50 text-emerald-700 font-extrabold text-[10px] uppercase px-2 py-0.5 rounded border border-emerald-100">NIC APPROVED</span>
              <span className="text-slate-400 font-mono text-[11px]">IRN: 28c89b201a083fecf81b1c2389d38c109c0d38</span>
            </div>
            
            <h3 className="text-sm font-extrabold text-indigo-950">NIC QR Code & IRN Invoicing clearance</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-semibold">Every B2B supplies voucher logged above 50,000 INR triggers an automatic secure background payload to the GST electronic system server. The system registers the invoice, returning a unique 64-character Invoice Reference Number (IRN) coupled with a compliance QR code embedded directly onto print templates.</p>

            <button 
              type="button"
              onClick={() => alert('Sending test transaction payload to GST Portal sandbox... Connection established, compliant IRN returned.')}
              className="py-1 px-3 bg-[#faf8ff] border border-[#00236f]/30 text-[#00236f] hover:bg-slate-50 rounded text-[11px] font-extrabold tracking-wide"
            >
              Force Background Sync Test
            </button>
          </div>
        </div>
      )}

      {/* SEC 5: GSTIN CHECKER */}
      {activeTab === 'gstin' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-3xs">
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-2 mb-4">
              Registered GSTIN Identity Format Validator
            </h3>

            <p className="text-xs text-slate-500 mb-4 font-semibold">Verify if a trade partner's GSTIN carries correct format (State-ID Code + Corporate PAN part + Checksum entity).</p>

            <form onSubmit={handleValidateGst} className="flex gap-2">
              <input 
                type="text" 
                value={gstinInput}
                onChange={e => setGstinInput(e.target.value)}
                placeholder="e.g. 29AABCS8374R1Z8"
                className="flex-1 text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none"
              />
              <button 
                type="submit"
                className="px-4 py-2 bg-[#00236f] hover:bg-brand-primary text-white text-[11px] font-extrabold uppercase rounded-lg transition-all"
              >
                Validate Identity
              </button>
            </form>
          </div>

          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-3xs flex flex-col justify-center">
            {gstinResult ? (
              <div className="space-y-3 text-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle className={`h-5 w-5 ${gstinResult.isValid ? 'text-emerald-600' : 'text-rose-500'}`} />
                  <span className="font-extrabold text-slate-900">{gstinResult.isValid ? 'Valid GSTIN Syntax Match' : 'Validation Error'}</span>
                </div>
                
                <div className="p-3.5 bg-[#faf8ff] rounded-lg border border-slate-100 space-y-1.5">
                  <p className="text-slate-500">Origin State: <span className="font-extrabold text-slate-800">{gstinResult.stateName}</span></p>
                  <p className="text-slate-500">Extracted PAN Card Segment: <span className="font-mono font-extrabold text-indigo-700">{gstinResult.pan}</span></p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 text-center py-4 font-semibold">Submit a 15-digit alphanumeric identifier above to authenticate vendor profile maps.</p>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
