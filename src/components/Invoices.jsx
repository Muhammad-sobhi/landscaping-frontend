import React, { useEffect, useState } from 'react';
import { 
  FileText, DollarSign, CheckCircle2, 
  Clock, ArrowUpRight, Search, Filter, Download, ExternalLink 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const res = await api.get('/invoices');
      setInvoices(res.data);
    } catch (err) {
      console.error("Failed to fetch invoices");
    } finally {
      setLoading(false);
    }
  };

  // Reusing the exact logic from your JobDetails.jsx
  const handleDownloadInvoice = async (inv) => {
    try {
      const invoiceId = inv.id;
      if (!invoiceId) return alert("No invoice ID found.");
      
      const response = await api.get(`/invoices/${invoiceId}/download`, {
        responseType: 'blob', 
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Invoice_${inv.invoice_number || inv.id}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link); // Clean up
    } catch (err) {
      console.error(err);
      alert("Could not download invoice.");
    }
  };

  const handleMarkAsPaid = async (id) => {
    if (!window.confirm("Confirm payment received for this invoice?")) return;
    try {
      await api.post(`/invoices/${id}/pay`, { payment_method: 'cash' });
      fetchInvoices(); 
    } catch (err) {
      alert("Error recording payment");
    }
  };

  const filteredInvoices = invoices.filter(inv => 
    inv.lead?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="p-20 text-center font-bold uppercase text-[10px] tracking-widest text-gray-300 animate-pulse">
      Loading Ledger...
    </div>
  );

  return (
    <div className="space-y-6 w-full max-w-full overflow-x-hidden pb-20 px-1">
      
      {/* HEADER */}
      <div className="flex flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-xl font-black text-gray-900 tracking-tight uppercase">Billing Center</h2>
          <p className="text-gray-500 text-xs">Manage invoices and revenue.</p>
        </div>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-[9px] font-black text-gray-400 uppercase tracking-tight">Receivables</p>
          <p className="text-lg font-black text-gray-900 mt-1">
            ${invoices.reduce((acc, inv) => acc + (inv.status === 'pending' || inv.status === 'unpaid' ? parseFloat(inv.total) : 0), 0).toFixed(2)}
          </p>
        </div>
        <div className="bg-green-600 p-4 rounded-2xl shadow-lg shadow-green-100 text-white">
          <p className="text-[9px] font-black text-green-100 uppercase tracking-tight text-opacity-80">Collected</p>
          <p className="text-lg font-black mt-1">
            ${invoices.reduce((acc, inv) => acc + (inv.status === 'paid' ? parseFloat(inv.total) : 0), 0).toFixed(2)}
          </p>
        </div>
      </div>

      {/* SEARCH BAR */}
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        <input 
          type="text" 
          placeholder="Invoice # or client..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl outline-none shadow-sm focus:ring-2 focus:ring-green-500 text-sm"
        />
      </div>

      {/* INVOICES TABLE */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-4 py-3 text-[9px] font-black uppercase text-gray-400">Invoice</th>
                <th className="px-4 py-3 text-[9px] font-black uppercase text-gray-400">Amount</th>
                <th className="px-4 py-3 text-[9px] font-black uppercase text-gray-400 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredInvoices.map((inv) => (
                <tr key={inv.id} className="active:bg-gray-50 transition-colors">
                  <td className="px-4 py-4">
                    <p className="font-bold text-gray-900 text-xs leading-tight">
                      {inv.lead?.full_name || 'Walk-in'}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[9px] font-mono font-bold text-gray-400">#{inv.invoice_number}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${
                        inv.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {inv.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <p className="font-black text-indigo-600 text-xs">${inv.total}</p>
                    <p className="text-[8px] text-gray-400">{new Date(inv.issued_at).toLocaleDateString()}</p>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      {/* DOWNLOAD BUTTON - Reusing backend logic */}
                      <button 
                        onClick={() => handleDownloadInvoice(inv)}
                        className="text-gray-400 hover:text-indigo-600 p-2 rounded-lg hover:bg-gray-50 transition-all active:scale-90"
                        title="Download PDF"
                      >
                        <Download size={16} />
                      </button>

                      {/* REDIRECT TO JOB BUTTON */}
                      {inv.job_id && (
                        <button 
                          onClick={() => navigate(`/jobs/${inv.job_id}`)}
                          className="text-gray-400 hover:text-green-600 p-2 rounded-lg hover:bg-gray-50 transition-all active:scale-90"
                          title="View Project Photos"
                        >
                          <ExternalLink size={16} />
                        </button>
                      )}

                      {/* MARK AS PAID BUTTON */}
                      {inv.status !== 'paid' ? (
                        <button 
                          onClick={() => handleMarkAsPaid(inv.id)}
                          className="bg-gray-900 text-white p-2 rounded-lg hover:bg-green-600 transition-all inline-flex items-center justify-center active:scale-90 shadow-sm"
                        >
                          <DollarSign size={14} />
                        </button>
                      ) : (
                        <div className="text-green-500 p-2">
                          <CheckCircle2 size={16} />
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredInvoices.length === 0 && (
          <div className="p-10 text-center text-gray-400 text-[10px] font-bold uppercase tracking-widest">
            No Records Found
          </div>
        )}
      </div>
    </div>
  );
}