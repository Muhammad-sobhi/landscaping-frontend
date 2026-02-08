import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { 
  Search, Plus, UserPlus, Phone, Mail, 
  MapPin, X, Building2, ExternalLink 
} from 'lucide-react';

export default function Leads() {
    const [leads, setLeads] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);
    
    const [newLead, setNewLead] = useState({ 
        full_name: '', 
        email: '', 
        phone: '', 
        city: '', 
        address: '', 
        service_type: '', 
        description: '' 
    });

    useEffect(() => {
        fetchLeads();
    }, []);

    const fetchLeads = async () => {
        try {
            const res = await api.get('/leads');
            setLeads(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateLead = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/leads', newLead);
            setLeads([res.data, ...leads]);
            setShowForm(false);
            setNewLead({ full_name: '', email: '', phone: '', city: '', address: '', service_type: '', description: '' });
            alert("Lead created successfully!");
        } catch (err) {
            alert(err.response?.data?.message || "Error creating lead.");
        }
    };

    const filteredLeads = leads.filter(lead => 
        lead.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.phone?.includes(searchTerm)
    );

    return (
        <div className="p-4 md:p-8 pt-20 lg:pt-8 space-y-6 max-w-7xl mx-auto">
            
            {/* HEADER SECTION */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">Leads & Customers</h2>
                    <p className="text-gray-500 text-sm">Capture new inquiries and manage contacts.</p>
                </div>
                <button 
                    onClick={() => setShowForm(!showForm)}
                    className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold transition-all active:scale-95 ${
                        showForm ? 'bg-gray-100 text-gray-600' : 'bg-green-600 text-white shadow-lg'
                    }`}
                >
                    {showForm ? <X size={20}/> : <UserPlus size={20}/>}
                    {showForm ? 'Cancel' : 'Add New Lead'}
                </button>
            </div>

            {/* RESPONSIVE FORM */}
            {showForm && (
                <form onSubmit={handleCreateLead} className="bg-white p-5 md:p-8 rounded-2xl md:rounded-3xl border border-blue-50 shadow-xl animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-gray-400">Full Name *</label>
                            <input required value={newLead.full_name} onChange={e => setNewLead({...newLead, full_name: e.target.value})} className="w-full p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-green-500 font-semibold" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-gray-400">Phone *</label>
                            <input required value={newLead.phone} onChange={e => setNewLead({...newLead, phone: e.target.value})} className="w-full p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-green-500 font-semibold" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-gray-400">City *</label>
                            <input required value={newLead.city} onChange={e => setNewLead({...newLead, city: e.target.value})} className="w-full p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-green-500 font-semibold" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-gray-400">Service Type *</label>
                            <input required value={newLead.service_type} onChange={e => setNewLead({...newLead, service_type: e.target.value})} className="w-full p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-green-500 font-semibold" />
                        </div>
                        <div className="md:col-span-2 space-y-1">
                            <label className="text-[10px] font-black uppercase text-gray-400">Email</label>
                            <input type="email" value={newLead.email} onChange={e => setNewLead({...newLead, email: e.target.value})} className="w-full p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-green-500 font-semibold" />
                        </div>
                        <div className="md:col-span-3 space-y-1">
                            <label className="text-[10px] font-black uppercase text-gray-400">Address / Description</label>
                            <textarea rows="2" value={newLead.description} onChange={e => setNewLead({...newLead, description: e.target.value})} className="w-full p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-green-500 font-semibold" />
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end">
                        <button type="submit" className="w-full sm:w-auto bg-gray-900 text-white px-10 py-3 rounded-xl font-bold active:scale-95 transition-all">
                            Create Lead
                        </button>
                    </div>
                </form>
            )}

            {/* SEARCH BAR */}
            <div className="relative w-full max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                    type="text" placeholder="Search by name or phone..." 
                    className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-100 rounded-2xl shadow-sm outline-none focus:ring-2 focus:ring-green-500 transition-all font-medium"
                    value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* DATA DISPLAY */}
            <div className="w-full">
                {/* 1. TABLE VIEW (Desktop) */}
                <div className="hidden md:block bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400">Customer & City</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400">Service</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400">Contact</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr><td colSpan="4" className="p-10 text-center text-gray-400 font-bold uppercase text-[10px] animate-pulse tracking-widest">Loading...</td></tr>
                            ) : filteredLeads.map(lead => (
                                <tr key={lead.id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-gray-900">{lead.full_name}</div>
                                        <div className="text-xs text-gray-400 flex items-center gap-1 font-medium italic"><Building2 size={10}/> {lead.city}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-[11px] font-black uppercase">
                                            {lead.service_type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col text-xs font-bold text-gray-600">
                                            <span>{lead.phone}</span>
                                            <span className="text-gray-400 font-normal">{lead.email || 'No email'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Link 
                                            to={`/leads/${lead.id}`}
                                            className="bg-gray-50 group-hover:bg-gray-900 group-hover:text-white px-4 py-2 rounded-lg transition-all text-gray-400 font-bold text-xs uppercase inline-block"
                                        >
                                            View
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* 2. CARD VIEW (Mobile) */}
                <div className="grid grid-cols-1 gap-4 md:hidden">
                    {loading ? (
                        <div className="p-10 text-center text-gray-400 uppercase text-[10px] font-black animate-pulse tracking-widest">Loading...</div>
                    ) : filteredLeads.map(lead => (
                        <div key={lead.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm active:bg-gray-50 transition-colors">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h3 className="font-black text-gray-900 text-lg tracking-tight">{lead.full_name}</h3>
                                    <div className="flex items-center gap-1 text-gray-500 text-xs font-bold uppercase">
                                        <MapPin size={12}/> {lead.city}
                                    </div>
                                </div>
                                <span className="px-2 py-1 bg-green-50 text-green-700 rounded-md text-[9px] font-black uppercase tracking-wider">
                                    {lead.service_type}
                                </span>
                            </div>
                            
                            <div className="space-y-2 mb-4">
                                <div className="flex items-center gap-3 text-gray-600 text-sm font-bold">
                                    <Phone size={14} className="text-gray-300" />
                                    {lead.phone}
                                </div>
                                <div className="flex items-center gap-3 text-gray-600 text-sm font-medium">
                                    <Mail size={14} className="text-gray-300" />
                                    <span className="truncate">{lead.email || 'No Email'}</span>
                                </div>
                            </div>

                            <Link 
                                to={`/leads/${lead.id}`}
                                className="w-full flex items-center justify-center gap-2 py-3 bg-gray-900 text-white rounded-xl font-bold text-xs uppercase tracking-widest active:scale-95 transition-all"
                            >
                                View Details <ExternalLink size={14}/>
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
            {filteredLeads.length === 0 && !loading && (
                <div className="text-center py-20 text-gray-300 font-bold uppercase text-[10px] tracking-widest">No Leads Found</div>
            )}
        </div>
    );
}