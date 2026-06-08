import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Plus, 
  CalendarCheck, 
  CreditCard, 
  CheckCircle2, 
  Coins, 
  Printer, 
  Briefcase,
  History,
  TrendingUp,
  X 
} from 'lucide-react';
import { Employee } from '../types-extra';

interface PayrollSectionProps {
  employees: Employee[];
  onAddEmployee: (emp: Employee) => void;
  onUpdateAttendance: (id: string, days: number) => void;
}

export default function PayrollSection({
  employees,
  onAddEmployee,
  onUpdateAttendance
}: PayrollSectionProps) {
  const [payrollTab, setPayrollTab] = useState<'employees' | 'attendance' | 'processor' | 'payslips'>('employees');

  // Input states
  const [empName, setEmpName] = useState('');
  const [empDept, setEmpDept] = useState('Product Tech');
  const [empDesg, setEmpDesg] = useState('Engineer');
  const [empBase, setEmpBase] = useState('');
  const [empBank, setEmpBank] = useState('');

  // Selected Employee for payslip showcase
  const [selectedEmpId, setSelectedEmpId] = useState<string>(employees[0]?.id || '');

  const handleCreateEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!empName || !empBase || !empBank) return alert("Submit complete profile fields.");

    onAddEmployee({
      id: 'emp-00' + (employees.length + 1),
      name: empName,
      department: empDept,
      designation: empDesg,
      baseSalary: parseFloat(empBase) || 40000,
      pfDeduction: 1200, // Statutory flat PF contribution limit
      esiDeduction: 450, // Standard health component contribution limit
      profTax: 200,      // Municipal professional tax
      attendanceDays: 30, // Default active perfect month record
      bankAccNo: empBank
    });

    setEmpName('');
    setEmpBase('');
    setEmpBank('');
    alert('Employee profile created and structured.');
  };

  const selectedEmployeeObj = useMemo(() => {
    return employees.find(e => e.id === selectedEmpId) || employees[0];
  }, [employees, selectedEmpId]);

  // Aggregate Payroll worths
  const grossMonthlyPayrolls = useMemo(() => {
    return employees.reduce((sum, item) => sum + item.baseSalary, 0);
  }, [employees]);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#faf8ff] p-6 overflow-y-auto">
      
      {/* Title */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-extrabold text-[#00236f] tracking-tight">Enterprise Payroll & Wage Desk</h2>
          <p className="text-slate-500 text-xs mt-0.5">Control employee master registers, wage deduction scales (PF, ESI, PT), attendance records, and direct payslip PDF compilers.</p>
        </div>

        {/* Navigation Tab Group */}
        <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200/50 shadow-3xs">
          {[
            { id: 'employees', label: 'Employee Registry', icon: Users },
            { id: 'attendance', label: 'Attendance logs', icon: CalendarCheck },
            { id: 'processor', label: 'Wage Processor', icon: CreditCard },
            { id: 'payslips', label: 'Payslips Center', icon: Printer }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setPayrollTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-extrabold transition-all cursor-pointer ${
                  payrollTab === tab.id 
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

      {payrollTab === 'employees' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-3xs">
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2 mb-4 flex items-center gap-1.5">
              <Plus className="h-4 w-4 text-emerald-600" />
              Onboard Employee Master
            </h3>

            <form onSubmit={handleCreateEmployee} className="space-y-3.5">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Full Employee Label Name</label>
                <input 
                  type="text" 
                  value={empName}
                  onChange={e => setEmpName(e.target.value)}
                  placeholder="e.g. Ramesh Chandra"
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#00236f]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Operational Dept</label>
                  <select 
                    value={empDept} 
                    onChange={e => setEmpDept(e.target.value)}
                    className="w-full text-xs px-2 py-2 border border-slate-200 rounded-lg bg-white"
                  >
                    <option value="Product Tech">Product Tech</option>
                    <option value="Corporate Auditing">Auditing</option>
                    <option value="Sales & Growth">Sales Division</option>
                    <option value="HQ HR Operations">Administration</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Rank Title</label>
                  <input 
                    type="text" 
                    value={empDesg}
                    onChange={e => setEmpDesg(e.target.value)}
                    placeholder="e.g. Analyst"
                    className="w-full text-xs px-2 py-2 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Monthly Base Pay (₹)</label>
                  <input 
                    type="number" 
                    value={empBase} 
                    onChange={e => setEmpBase(e.target.value)}
                    placeholder="e.g. 60000"
                    className="w-full text-xs px-2 py-2 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Bank Account Routing</label>
                  <input 
                    type="text" 
                    value={empBank}
                    onChange={e => setEmpBank(e.target.value)}
                    placeholder="HDFCXXXXXXXXXX"
                    className="w-full text-xs px-2 py-2 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div className="p-3 bg-[#faf8ff] rounded-lg border border-slate-100 text-[10px] text-slate-400 leading-relaxed font-semibold">
                * Statutory deductions auto-applied matches: Provident Fund (₹1,200), Emp State Insurance (₹450), Professional Tax (₹200).
              </div>

              <button 
                type="submit"
                className="w-full py-2 bg-[#00236f] hover:bg-brand-primary text-white font-extrabold text-[11px] uppercase tracking-wider rounded-lg transition-all"
              >
                Log Employee Master
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/80 shadow-3xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 select-none">
                    <th className="py-2.5 px-4">Emp ID</th>
                    <th className="py-2.5 px-4">Associate Name</th>
                    <th className="py-2.5 px-4">Roster Department</th>
                    <th className="py-2.5 px-4">Designation</th>
                    <th className="py-2.5 px-4 text-right">Fixed Gross Pay</th>
                    <th className="py-2.5 px-3">Bank Account</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {employees.map(emp => (
                    <tr key={emp.id} className="hover:bg-slate-50/20 transition-all">
                      <td className="py-3 px-4 font-mono font-bold text-slate-400">{emp.id}</td>
                      <td className="py-3 px-4 font-extrabold text-slate-950">{emp.name}</td>
                      <td className="py-3 px-4 font-semibold text-slate-500">{emp.department}</td>
                      <td className="py-3 px-4 text-slate-400">{emp.designation}</td>
                      <td className="py-3 px-4 text-right font-mono font-extrabold text-slate-800">₹{emp.baseSalary.toLocaleString('en-IN')}</td>
                      <td className="py-3 px-3 font-mono text-slate-400">{emp.bankAccNo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SEC 2: ATTENDANCE TRACKER */}
      {payrollTab === 'attendance' && (
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-3xs">
          <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2 mb-4 flex items-center gap-1.5">
            <CalendarCheck className="h-4.5 w-4.5 text-indigo-500" />
            Monthly Attendance Registers log (Days Present of 30)
          </h3>

          <div className="space-y-4 mt-4">
            {employees.map(emp => (
              <div key={emp.id} className="p-4 bg-slate-50/50 rounded-xl border border-slate-100 flex justify-between items-center text-xs">
                <div>
                  <span className="font-extrabold text-slate-900">{emp.name}</span>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{emp.designation} | {emp.department}</p>
                </div>

                <div className="flex items-center gap-4">
                  <span className="font-mono text-slate-500 font-bold">Days worked:</span>
                  <div className="flex items-center gap-2 bg-white rounded-lg border border-slate-200 px-2 py-1 shadow-3xs">
                    <button 
                      type="button"
                      onClick={() => onUpdateAttendance(emp.id, Math.max(0, emp.attendanceDays - 1))}
                      className="px-1.5 py-0.5 hover:bg-slate-50 hover:text-slate-800 text-slate-400 font-bold font-mono text-xs rounded cursor-pointer select-none"
                    >
                      -
                    </button>
                    <span className="font-mono font-extrabold text-slate-800">{emp.attendanceDays} days</span>
                    <button 
                      type="button"
                      onClick={() => onUpdateAttendance(emp.id, Math.min(30, emp.attendanceDays + 1))}
                      className="px-1.5 py-0.5 hover:bg-slate-50 hover:text-slate-800 text-slate-400 font-bold font-mono text-xs rounded cursor-pointer select-none"
                    >
                      +
                    </button>
                  </div>
                  
                  {emp.attendanceDays === 30 ? (
                    <span className="bg-emerald-50 text-emerald-800 text-[10px] uppercase font-bold border border-emerald-100 px-1.5 py-0.5 rounded">
                      Perfect attendance
                    </span>
                  ) : emp.attendanceDays < 25 ? (
                    <span className="bg-rose-50 text-rose-800 text-[10px] uppercase font-bold border border-rose-100 px-1.5 py-0.5 rounded-full animate-pulse">
                      Leave notice
                    </span>
                  ) : <span className="text-slate-400 text-[10px] font-bold">Standard month</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SEC 3: WAGE PROCESSOR */}
      {payrollTab === 'processor' && (
        <div className="bg-white rounded-[#12px] border border-slate-200/80 p-5 shadow-3xs">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3.5 mb-4">
            <div>
              <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-widest">
                Monthly Net Disbursal Projections
              </h3>
              <p className="text-[11px] text-slate-400">Calculates real wages matching attendance parameters (Prorated base pay - statutory contributions).</p>
            </div>

            <button 
              type="button"
              onClick={() => alert('Wages disbursed successfully. Bank advice generated and ledger logged to administrative salary balance.')}
              className="px-3.5 py-2 bg-[#00236f] hover:bg-brand-primary text-white text-[11px] font-extrabold uppercase rounded-lg transition-all"
            >
              Batch Disburse Payroll
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 select-none">
                  <th className="py-2 px-3">Associate</th>
                  <th className="py-2 px-3 text-right">Base Salary (₹)</th>
                  <th className="py-2 px-3 text-center">Worked days</th>
                  <th className="py-2 px-3 text-right text-rose-700">PF deductions</th>
                  <th className="py-2 px-3 text-right text-rose-700">ESI Component</th>
                  <th className="py-2 px-3 text-right text-rose-700">PT Deducts</th>
                  <th className="py-2 px-3 text-right text-emerald-700 font-extrabold">Net Disbursed Payable</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {employees.map(emp => {
                  const proratedBase = (emp.baseSalary * (emp.attendanceDays / 30));
                  const netDisbursable = proratedBase - (emp.pfDeduction + emp.esiDeduction + emp.profTax);

                  return (
                    <tr key={emp.id} className="hover:bg-slate-50/20">
                      <td className="py-3 px-3 font-extrabold text-slate-950">{emp.name}</td>
                      <td className="py-3 px-3 text-right font-mono text-slate-500">₹{emp.baseSalary.toLocaleString('en-IN')}</td>
                      <td className="py-3 px-3 text-center font-bold text-slate-600">{emp.attendanceDays}/30</td>
                      <td className="py-3 px-3 text-right font-mono text-slate-500">₹{emp.pfDeduction}</td>
                      <td className="py-3 px-3 text-right font-mono text-slate-500">₹{emp.esiDeduction}</td>
                      <td className="py-3 px-3 text-right font-mono text-slate-500">₹{emp.profTax}</td>
                      <td className="py-3 px-3 text-right font-mono font-extrabold text-emerald-700">₹{Math.max(0, Math.round(netDisbursable)).toLocaleString('en-IN')}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SEC 4: PAYSLIP PREPRINT DRAWERS */}
      {payrollTab === 'payslips' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-3xs">
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-2 mb-4">
              Select Payslip Recipient
            </h3>
            
            <p className="text-xs text-slate-500 mb-4 font-semibold">Generate a structured corporate payslip suitable for tax filings from the onboarded associate index.</p>

            <div className="space-y-2">
              {employees.map(emp => (
                <button
                  type="button"
                  key={emp.id}
                  onClick={() => setSelectedEmpId(emp.id)}
                  className={`w-full p-3 rounded-lg border text-left text-xs transition-colors cursor-pointer block ${
                    selectedEmpId === emp.id 
                      ? 'bg-[#1e3a8a]/5 border-[#00236f] text-slate-900 font-extrabold' 
                      : 'bg-white border-slate-150 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <span className="block font-extrabold">{emp.name}</span>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{emp.designation} | {emp.department}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/80 p-6 shadow-3xs">
            {selectedEmployeeObj ? (
              <div className="p-6 bg-slate-50/50 rounded-xl border border-slate-200/60 max-w-xl mx-auto space-y-5">
                
                {/* Header branding */}
                <div className="flex justify-between items-start border-b border-slate-200/80 pb-4">
                  <div>
                    <h3 className="text-sm font-extrabold text-[#00236f] tracking-tight">SIRACH TECHNOLOGY INDIA LTD</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Corporate Headquarters - Bangalore</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] bg-[#1e3a8a]/10 text-[#00236f] px-2 py-0.5 rounded font-extrabold uppercase">PAYSLIP INDEX CERTIFICATE</span>
                    <p className="text-[10px] text-slate-400 mt-1 font-mono font-semibold">Disbursal Period: Oct 2023</p>
                  </div>
                </div>

                {/* Profiles details */}
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <p className="text-slate-400 font-bold uppercase text-[9px]">Associate Profile</p>
                    <p className="font-extrabold text-slate-900">{selectedEmployeeObj.name}</p>
                    <p className="text-slate-500">{selectedEmployeeObj.designation} | {selectedEmployeeObj.department}</p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-slate-400 font-bold uppercase text-[9px]">Disbursal Details</p>
                    <p className="font-mono font-bold text-slate-800">Bank Ref: {selectedEmployeeObj.bankAccNo}</p>
                    <p className="text-slate-500 font-semibold">Worked: {selectedEmployeeObj.attendanceDays} of 30 days</p>
                  </div>
                </div>

                {/* Calculations Columns */}
                <div className="grid grid-cols-2 gap-4 border-t border-b border-slate-200/80 py-4 text-xs font-semibold">
                  <div className="space-y-2">
                    <p className="text-slate-400 text-[10px] font-bold uppercase">Basic Gross Earnings</p>
                    <div className="flex justify-between">
                      <span>Standard Base Pay:</span>
                      <span className="font-mono">₹{selectedEmployeeObj.baseSalary.toLocaleString('en-IN')}</span>
                    </div>
                    {selectedEmployeeObj.attendanceDays < 30 && (
                      <div className="flex justify-between text-rose-600 font-bold">
                        <span>LWP Lop Prorated:</span>
                        <span className="font-mono">- ₹{Math.round(selectedEmployeeObj.baseSalary * (1 - selectedEmployeeObj.attendanceDays / 30)).toLocaleString('en-IN')}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 border-l border-slate-200/50 pl-4 text-right">
                    <p className="text-slate-400 text-[10px] font-bold uppercase block text-right">Statutory Deductions</p>
                    <div className="flex justify-between">
                      <span>Provident Fund (PF):</span>
                      <span className="font-mono text-rose-700">₹{selectedEmployeeObj.pfDeduction}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>ESI Health Component:</span>
                      <span className="font-mono text-rose-700">₹{selectedEmployeeObj.esiDeduction}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Professional Tax (PT):</span>
                      <span className="font-mono text-rose-700">₹{selectedEmployeeObj.profTax}</span>
                    </div>
                  </div>
                </div>

                {/* Net footer totals */}
                <div className="flex justify-between items-center pt-2 text-xs font-extrabold text-[#00236f]">
                  <span>Net wages cash disbursed:</span>
                  <span className="text-sm font-mono font-extrabold bg-emerald-50 text-emerald-800 px-3 py-1 rounded">
                    ₹{Math.round(
                      (selectedEmployeeObj.baseSalary * (selectedEmployeeObj.attendanceDays / 30)) - 
                      (selectedEmployeeObj.pfDeduction + selectedEmployeeObj.esiDeduction + selectedEmployeeObj.profTax)
                    ).toLocaleString('en-IN')}.00
                  </span>
                </div>

                <button 
                  onClick={() => alert('Sending job payload directly to fiscal printer...')}
                  className="w-full py-2 bg-slate-900 hover:bg-slate-950 text-white font-extrabold text-[11px] uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-1.5"
                >
                  <Printer className="h-4 w-4 shrink-0" /> Print Formal Payslip
                </button>

              </div>
            ) : (
              <p className="text-center text-slate-400 text-xs py-10 font-bold">Please select an employee profile card above.</p>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
