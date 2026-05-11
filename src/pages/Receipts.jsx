import { useState } from 'react';
import { FileText, Download, X, CheckCircle, Printer, Building2 } from 'lucide-react';

export default function Receipts({ payments, societyInfo, selectedMonth }) {
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  const paidPayments = payments.filter(p => p.month === selectedMonth && p.status === 'Paid' && p.date);

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
            <FileText className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800">Payment Receipts</h3>
            <p className="text-sm text-slate-500">{paidPayments.length} receipts generated</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 rounded-lg px-3 py-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span className="text-sm font-medium text-emerald-700">All receipts available</span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800">All Paid Receipts</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Receipt No</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Flat</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Month</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Mode</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {paidPayments.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-3.5">
                    <span className="text-xs font-mono font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                      {p.receiptNo}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-sm font-semibold text-slate-800">Flat {p.flat}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center">
                        <span className="text-white text-xs font-bold">{p.name.charAt(0)}</span>
                      </div>
                      <span className="text-sm text-slate-700">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 hidden sm:table-cell text-sm text-slate-500">{p.month}</td>
                  <td className="px-5 py-3.5">
                    <span className="text-sm font-bold text-emerald-700">₹{p.amount.toLocaleString('en-IN')}</span>
                  </td>
                  <td className="px-5 py-3.5 hidden md:table-cell text-sm text-slate-500">{p.mode}</td>
                  <td className="px-5 py-3.5">
                    <button
                      onClick={() => setSelectedReceipt(p)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      <Download className="w-3 h-3" />
                      Receipt
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Receipt Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm animate-fade-in">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h3 className="font-semibold text-slate-800">Payment Receipt</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                  title="Print"
                >
                  <Printer className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setSelectedReceipt(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Receipt Body */}
            <div className="p-6">
              {/* Society Header */}
              <div className="text-center mb-6">
                <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Building2 className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-lg font-black text-slate-800">{societyInfo.name}</h2>
                <p className="text-xs text-slate-500">{societyInfo.address}</p>
              </div>

              {/* Divider */}
              <div className="border-t-2 border-dashed border-slate-200 mb-4" />

              {/* PAID stamp */}
              <div className="flex justify-center mb-4">
                <div className="border-4 border-emerald-500 rounded-xl px-6 py-2 rotate-[-6deg]">
                  <p className="text-2xl font-black text-emerald-600 tracking-widest">PAID</p>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-2.5 bg-slate-50 rounded-xl p-4">
                <DetailRow label="Receipt No." value={selectedReceipt.receiptNo} mono />
                <DetailRow label="Flat Number" value={`Flat ${selectedReceipt.flat}`} />
                <DetailRow label="Owner Name"  value={selectedReceipt.name} />
                <DetailRow label="Month"       value={selectedReceipt.month} />
                <DetailRow label="Amount"      value={`₹${selectedReceipt.amount.toLocaleString('en-IN')}`} bold green />
                <DetailRow label="Payment Mode" value={selectedReceipt.mode} />
                <DetailRow label="Date"        value={selectedReceipt.date} />
              </div>

              {/* Footer */}
              <div className="border-t-2 border-dashed border-slate-200 mt-4 pt-4 text-center">
                <p className="text-xs text-slate-500">Thank you for your timely payment!</p>
                <p className="text-xs text-slate-400 mt-1">UPI: {societyInfo.upiId}</p>
              </div>
            </div>

            <div className="px-6 pb-5">
              <button
                onClick={() => setSelectedReceipt(null)}
                className="w-full py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailRow({ label, value, mono, bold, green }) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-slate-500">{label}</span>
      <span className={`${mono ? 'font-mono text-xs' : ''} ${bold ? 'font-bold text-base' : 'font-medium'} ${green ? 'text-emerald-700' : 'text-slate-800'}`}>
        {value}
      </span>
    </div>
  );
}
