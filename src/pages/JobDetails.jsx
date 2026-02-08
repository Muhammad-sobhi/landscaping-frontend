import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { 
    ArrowLeft, Calendar, MapPin, Phone, User, 
    Clock, CheckCircle, Camera, DollarSign, 
    FileText, Trash2, Download, Plus, Users, Settings2, X, Receipt,
    TrendingUp, ShieldCheck, CreditCard
} from 'lucide-react';

export default function JobDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth(); 
    const [job, setJob] = useState(null);
    const [taxRate, setTaxRate] = useState(0); 
    const [allUsers, setAllUsers] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [isEditingCrew, setIsEditingCrew] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchData();
        if (user?.role === 'super_admin') {
            fetchTechnicians();
        }
    }, [id]);

    const fetchData = async () => {
        try {
            const [jobRes, settingsRes] = await Promise.all([
                api.get(`/jobs/${id}`),
                api.get('/settings')
            ]);
            setJob(jobRes.data);
            setTaxRate((settingsRes.data.tax_rate || 0) / 100);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching data", err);
            setLoading(false);
        }
    };

    const fetchTechnicians = async () => {
        try {
            const res = await api.get('/users'); 
            setAllUsers(res.data.filter(u => u.role !== 'super_admin'));
        } catch (err) {
            console.error("Error fetching users");
        }
    };

    const updateStatus = async (newStatus) => {
        try {
            const res = await api.put(`/jobs/${id}`, { status: newStatus });
            setJob(res.data.job || res.data);
            return res.data;
        } catch (err) {
            alert("Failed to update status");
        }
    };

    const handleAssignCrew = async (userId) => {
        try {
            await api.post(`/jobs/${id}/assign`, { user_id: userId });
            const res = await api.get(`/jobs/${id}`);
            setJob(res.data);
        } catch (err) {
            alert("Failed to update crew assignment.");
        }
    };

    const handlePhotoUpload = async (e, type) => {
        const file = e.target.files[0];
        if (!file) return;
        const formData = new FormData();
        formData.append(type, file);
        setUploading(true);
        try {
            await api.post(`/jobs/${id}/photos`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const res = await api.get(`/jobs/${id}`);
            setJob(res.data);
        } catch (err) {
            alert("Upload failed");
        } finally {
            setUploading(false);
        }
    };

    const handleDownloadInvoice = async () => {
        try {
            const invoiceId = job.invoice?.id || job.invoice_id;
            if (!invoiceId) return alert("No invoice found for this job.");
            const response = await api.get(`/invoices/${invoiceId}/download`, {
                responseType: 'blob', 
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Invoice_${job.id}.pdf`);
            document.body.appendChild(link);
            link.click();
        } catch (err) {
            alert("Could not download invoice.");
        }
    };

    // --- INTEGRATED EARNINGS LOGIC ---
    const handlePayment = async (invoiceId) => {
        if (!window.confirm("Confirm payment collection? This will also generate technician earnings.")) return;
        
        try {
            // 1. Mark Invoice as Paid
            await api.post(`/invoices/${invoiceId}/pay`);
            
            // 2. Calculate Commission (using 40% of base price as example)
            const serviceBasePrice = parseFloat(job.price || 0);
            const commissionPerTech = serviceBasePrice * 0.40;

            // 3. Loop through assigned crew and create Earning records
            if (job.employees && job.employees.length > 0) {
                const earningsPromises = job.employees.map(emp => 
                    api.post('/earnings', {
                        user_id: emp.id,
                        job_id: job.id,
                        type: 'Job Commission',
                        amount: commissionPerTech,
                        earned_at: new Date().toISOString()
                    })
                );
                await Promise.all(earningsPromises);
            }

            // 4. Update UI
            alert("Payment recorded and crew commissions generated!");
            updateStatus('paid');
        } catch (err) {
            console.error(err);
            alert("Error recording payment or earnings.");
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Delete this project?")) return;
        try {
            await api.delete(`/jobs/${id}`);
            navigate('/jobs');
        } catch (err) {
            alert("Delete failed.");
        }
    };

    if (loading) return <div className="p-10 text-center font-black text-gray-400 uppercase tracking-widest text-xs animate-pulse">Loading Project...</div>;
    if (!job) return <div className="p-10 text-center font-black text-red-400">Project Not Found</div>;

    const serviceBasePrice = parseFloat(job.price || 0);
    const billableExpenses = job.expenses?.filter(exp => ['materials', 'rental'].includes(exp.category?.toLowerCase())) || [];
    const internalExpenses = job.expenses?.filter(exp => !['materials', 'rental'].includes(exp.category?.toLowerCase())) || [];
    const totalBillable = billableExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
    const totalInternal = internalExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
    
    const subtotal = serviceBasePrice + totalBillable;
    const taxAmount = subtotal * taxRate;
    const grandTotalInvoice = subtotal + taxAmount;
    const netProfit = (grandTotalInvoice - taxAmount) - (totalBillable + totalInternal);

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-20 px-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <button onClick={() => navigate('/jobs')} className="flex items-center gap-2 text-gray-400 hover:text-gray-900 transition-colors font-black text-[10px] uppercase tracking-widest">
                    <ArrowLeft size={16} /> Back to Schedule
                </button>
                
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    {job.status === 'pending' && (
                        <button onClick={() => updateStatus('completed')} className="flex-1 sm:flex-none bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg hover:bg-indigo-700 transition-all">
                            <CheckCircle size={16} /> Mark as Completed
                        </button>
                    )}
                    {job.status === 'completed' && (
                        <button onClick={() => job.invoice ? handlePayment(job.invoice.id) : updateStatus('paid')} className="flex-1 sm:flex-none bg-green-600 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg hover:bg-green-700 transition-all">
                            <CreditCard size={16} /> Mark as Paid
                        </button>
                    )}
                    {job.status === 'paid' && (
                        <div className="bg-green-50 text-green-600 px-6 py-3 rounded-2xl font-black text-[10px] uppercase border border-green-100 flex items-center gap-2">
                            <ShieldCheck size={16} /> Fully Paid
                        </div>
                    )}
                    {user?.role === 'super_admin' && (
                        <button onClick={handleDelete} className="p-3 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-sm">
                            <Trash2 size={20} />
                        </button>
                    )}
                </div>
            </div>

            {user?.role === 'super_admin' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col justify-center">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Gross Client Total</p>
                        <p className="text-2xl font-black text-gray-900">${grandTotalInvoice.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
                    </div>
                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col justify-center">
                        <p className="text-[9px] font-black text-red-400 uppercase tracking-widest mb-1">Actual Job Costs</p>
                        <p className="text-2xl font-black text-red-600">-${(totalBillable + totalInternal).toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
                    </div>
                    <div className="bg-green-600 p-8 rounded-[2.5rem] shadow-xl shadow-green-100 text-white flex flex-col justify-center relative overflow-hidden">
                        <TrendingUp className="absolute right-[-10px] top-[-10px] w-24 h-24 text-white/10 rotate-12" />
                        <p className="text-[9px] font-black text-white/60 uppercase tracking-widest mb-1 relative z-10">Net Profit</p>
                        <p className="text-2xl font-black relative z-10">${netProfit.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
                        <div className="flex justify-between items-start mb-10">
                            <div>
                                <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-3">{job.lead?.full_name}</h1>
                                <div className="flex items-center gap-2 text-gray-500 font-bold text-xs uppercase tracking-wide">
                                    <MapPin size={14} className="text-green-600" />
                                    {job.lead?.address}
                                </div>
                            </div>
                            <a href={`tel:${job.lead?.phone}`} className="p-5 bg-green-600 text-white rounded-[1.5rem] shadow-xl shadow-green-100 hover:scale-105 transition-all">
                                <Phone size={24} fill="currentColor" />
                            </a>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            <div className="bg-gray-50 p-5 rounded-3xl border border-gray-100">
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Current Status</p>
                                <div className="text-xs font-black text-gray-900 uppercase flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${job.status === 'paid' ? 'bg-green-500' : 'bg-orange-500'}`}></div>
                                    {job.status}
                                </div>
                            </div>
                            <div className="bg-gray-50 p-5 rounded-3xl border border-gray-100">
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Service Date</p>
                                <p className="text-xs font-black text-gray-900 uppercase">{job.scheduled_date}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
                        <h3 className="text-sm font-black mb-8 uppercase tracking-widest text-gray-400">Project Photos</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                            <PhotoUploadBox 
                                title="Arrival State" 
                                url={job.before_photo_url} 
                                onUpload={(e) => handlePhotoUpload(e, 'before_photo')} 
                            />
                            <PhotoUploadBox 
                                title="Completion State" 
                                url={job.after_photo_url} 
                                onUpload={(e) => handlePhotoUpload(e, 'after_photo')} 
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="bg-indigo-950 text-white rounded-[3rem] p-8 shadow-2xl relative overflow-hidden">
                        <div className="relative z-10 space-y-8">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-indigo-900/50 rounded-2xl"><DollarSign size={20} className="text-indigo-400" /></div>
                                <h3 className="text-xs font-black uppercase tracking-widest">Client Billing</h3>
                            </div>
                            <div>
                                <p className="text-indigo-400 text-[10px] font-black uppercase tracking-widest mb-2">Invoice Amount</p>
                                <p className="text-5xl font-black tracking-tighter">${grandTotalInvoice.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
                                <p className="text-[10px] text-indigo-300/60 font-bold uppercase mt-2 italic">
                                    Incl. ${taxAmount.toFixed(2)} Tax ({ (taxRate * 100).toFixed(1) }%)
                                </p>
                            </div>
                            
                            <div className="space-y-3 pt-5 border-t border-white/10">
                                <button onClick={handleDownloadInvoice} className="w-full py-4 bg-indigo-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-indigo-400 transition-all">
                                    <Download size={16} /> Get Invoice PDF
                                </button>
                                <button onClick={() => navigate(`/jobs/${id}/expenses`)} className="w-full py-4 bg-white text-indigo-950 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-green-400 hover:text-white transition-all">
                                    <Receipt size={16} /> Manage Costs
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Crew</h3>
                            {user?.role === 'super_admin' && (
                                <button onClick={() => setIsEditingCrew(!isEditingCrew)} className="p-2 bg-gray-50 rounded-xl text-gray-400 hover:text-green-600 transition-all">
                                    {isEditingCrew ? <X size={18} /> : <Settings2 size={18} />}
                                </button>
                            )}
                        </div>
                        
                        {isEditingCrew ? (
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                                {allUsers.map(u => {
                                    const isAssigned = job.employees?.some(e => e.id === u.id);
                                    return (
                                        <button key={u.id} onClick={() => handleAssignCrew(u.id)} className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all border-2 ${isAssigned ? 'bg-green-50 border-green-200 text-green-800' : 'bg-gray-50 border-transparent text-gray-400'}`}>
                                            <span className="text-[11px] font-black uppercase tracking-tight">{u.name}</span>
                                            {isAssigned && <CheckCircle size={16} />}
                                        </button>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {job.employees?.map(emp => (
                                    <div key={emp.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                        <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-green-600 font-black text-sm">{emp.name.charAt(0)}</div>
                                        <div>
                                            <p className="text-xs font-black text-gray-900 uppercase tracking-tight">{emp.name}</p>
                                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{emp.role}</p>
                                        </div>
                                    </div>
                                ))}
                                {(!job.employees || job.employees.length === 0) && (
                                    <p className="text-[10px] text-center text-gray-300 font-bold uppercase py-4">No crew assigned</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function PhotoUploadBox({ title, url, onUpload }) {
    return (
        <div className="space-y-4">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">{title}</p>
            <div className="relative group aspect-square rounded-[2.5rem] bg-gray-50 overflow-hidden border-2 border-dashed border-gray-200 flex items-center justify-center">
                {url ? (
                    <img src={url} className="w-full h-full object-cover" alt={title} />
                ) : (
                    <label className="cursor-pointer flex flex-col items-center gap-3 text-gray-300 hover:text-green-500 transition-colors">
                        <Camera size={40} />
                        <span className="text-[10px] font-black uppercase tracking-widest text-center px-4">Upload {title}</span>
                        <input type="file" className="hidden" onChange={onUpload} />
                    </label>
                )}
            </div>
        </div>
    );
}