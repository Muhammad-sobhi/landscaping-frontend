import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { 
    CheckCircle, Printer, Calendar, User, DollarSign, 
    ArrowLeft, Tag, Mail, Download, FileText, Briefcase, Loader2
} from 'lucide-react';

export default function OfferDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [offer, setOffer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);

    useEffect(() => {
        fetchOffer();
    }, [id]);

    const fetchOffer = async () => {
        try {
            const res = await api.get(`/offers/${id}`);
            setOffer(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
        }
    };

    // New Server-Side PDF Download
    const handleDownloadPDF = async () => {
        setIsDownloading(true);
        try {
            const response = await api.get(`/offers/${id}/download-pdf`, {
                responseType: 'blob', // Critical for binary data
            });

            // Create a link to trigger the file download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Quote_${offer.id}_${offer.lead.full_name}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            alert("Failed to generate PDF. Ensure DomPDF is installed on the backend.");
        } finally {
            setIsDownloading(false);
        }
    };

    const handleSendEmail = async () => {
        setIsSending(true);
        try {
            await api.post(`/offers/${id}/send-email`);
            alert("Professional Quote emailed successfully!");
        } catch (err) {
            alert("Failed to send email. Check SMTP settings.");
        } finally {
            setIsSending(false);
        }
    };

    const handleConvertToJob = async () => {
        try {
            await api.post(`/offers/${offer.id}/convert`);
            alert('Success! Offer converted to Job.');
            navigate('/jobs');
        } catch (err) {
            alert('Error: ' + (err.response?.data?.message || 'Check console'));
        }
    };

    if (loading) return <div className="p-20 text-center font-bold text-gray-400 flex justify-center items-center gap-2">
        <Loader2 className="animate-spin" /> Loading Quote...
    </div>;

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-20 px-4 mt-8">
            {/* Header Actions */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <button onClick={() => navigate('/offers')} className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-indigo-600 transition-colors">
                    <ArrowLeft size={16} /> Back to Quotation Center
                </button>
                
                <div className="flex flex-wrap gap-2 w-full md:w-auto">
                    {/* Replaced window.print with handleDownloadPDF */}
                    <button 
                        onClick={handleDownloadPDF}
                        disabled={isDownloading}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 p-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all shadow-sm text-xs font-bold"
                    >
                        {isDownloading ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} className="text-gray-600" />} 
                        {isDownloading ? 'Generating...' : 'Download Quote PDF'}
                    </button>
                    
                    <button 
                        onClick={handleSendEmail}
                        disabled={isSending}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 p-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all shadow-sm text-xs font-bold text-indigo-600"
                    >
                        {isSending ? <Loader2 size={18} className="animate-spin" /> : <Mail size={18} />} 
                        {isSending ? 'Sending...' : 'Email to Client'}
                    </button>

                    {offer.status !== 'accepted' && (
                        <button 
                            onClick={handleConvertToJob}
                            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-green-100 hover:scale-[1.02] active:scale-95 transition-all text-xs"
                        >
                            <CheckCircle size={18} /> Approve & Create Job
                        </button>
                    )}
                </div>
            </div>

            {/* Main Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
                    <div className="flex items-center gap-3 text-gray-400 font-black uppercase text-[10px]">
                        <User size={16} /> Customer
                    </div>
                    <div>
                        <p className="text-xl font-black text-gray-900">{offer?.lead?.full_name}</p>
                        <p className="text-sm font-medium text-gray-500">{offer?.lead?.phone}</p>
                        <p className="text-xs text-gray-400">{offer?.lead?.email}</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
                    <div className="flex items-center gap-3 text-gray-400 font-black uppercase text-[10px]">
                        <DollarSign size={16} /> Financial Summary
                    </div>
                    <div className="space-y-1">
                        <div className="flex justify-between text-sm font-medium">
                            <span className="text-gray-400">Subtotal</span>
                            <span className="text-gray-900 font-bold">${offer?.subtotal}</span>
                        </div>
                        {/* If you have tax in your settings, you can display it here too */}
                        <div className="flex justify-between text-sm font-medium text-red-500">
                            <span>Discount</span>
                            <span>-${offer?.discount}</span>
                        </div>
                        <div className="pt-2 border-t flex justify-between items-end">
                            <span className="text-xs font-black text-gray-400 uppercase">Grand Total</span>
                            <span className="text-2xl font-black text-green-600">${offer?.total}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
                    <div className="flex items-center gap-3 text-gray-400 font-black uppercase text-[10px]">
                        <Tag size={16} /> Status & Date
                    </div>
                    <div>
                        <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase inline-block
                            ${offer.status === 'accepted' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {offer.status}
                        </span>
                        <p className="text-[10px] text-gray-400 mt-2 font-bold uppercase tracking-widest">
                            ID: QT-{offer.id} | {new Date(offer.created_at).toLocaleDateString()}
                        </p>
                    </div>
                </div>
            </div>

            {/* Line Items Table */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-50 flex items-center gap-2">
                    <FileText size={18} className="text-gray-400" />
                    <h3 className="text-xs font-black uppercase text-gray-900">Project Scope & Items</h3>
                </div>
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50">
                            <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400">Description</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 text-center">Category</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 text-center">Qty</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 text-right">Total</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {offer.items?.map((item, idx) => (
                            <tr key={idx} className="text-sm">
                                <td className="px-6 py-4 font-bold text-gray-800">{item.name}</td>
                                <td className="px-6 py-4 text-center">
                                    <span className="text-[9px] font-black uppercase px-2 py-1 bg-gray-100 rounded-md text-gray-500">
                                        {item.category}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-center font-medium">{item.quantity}</td>
                                <td className="px-6 py-4 text-right font-black text-gray-900">${item.total_price}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Notes Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                    <h3 className="text-[10px] font-black uppercase text-gray-400 mb-4">Message to Customer</h3>
                    <p className="text-gray-700 leading-relaxed font-medium italic">
                        "{offer.message_to_customer || "No public message provided."}"
                    </p>
                </div>
                <div className="bg-gray-50 p-8 rounded-3xl border border-dashed border-gray-200">
                    <h3 className="text-[10px] font-black uppercase text-gray-400 mb-4">Internal Staff Notes</h3>
                    <p className="text-gray-500 text-sm font-medium">
                        {offer.internal_notes || "No internal notes for this quote."}
                    </p>
                </div>
            </div>
        </div>
    );
}