import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { 
    ArrowLeft, Phone, Mail, MapPin, 
    Calendar, Briefcase, FileText, User, 
    ChevronRight, ClipboardList
} from 'lucide-react';

export default function LeadDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [lead, setLead] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLead = async () => {
            try {
                const res = await api.get(`/leads/${id}`);
                setLead(res.data);
            } catch (err) {
                console.error("Error fetching lead:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchLead();
    }, [id]);

    if (loading) return <div className="p-20 text-center font-bold uppercase text-[10px] tracking-widest text-gray-300 animate-pulse">Loading Profile...</div>;
    if (!lead) return <div className="p-20 text-center font-black text-red-500">LEAD NOT FOUND</div>;

    return (
        <div className="space-y-6 w-full max-w-full overflow-x-hidden pb-20 px-1">
            
            {/* COMPACT BACK NAVIGATION */}
            <button 
                onClick={() => navigate('/leads')} 
                className="flex items-center gap-2 text-[10px] font-black uppercase text-gray-400 hover:text-gray-900 transition-colors"
            >
                <ArrowLeft size={14} /> Back to Leads
            </button>

            {/* HEADER SECTION */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">{lead.full_name}</h2>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-[9px] font-black uppercase">
                            {lead.service_type}
                        </span>
                        <span className="text-gray-400 text-xs font-medium italic">#{lead.id}</span>
                    </div>
                </div>

                <Link 
                    to={`/offers?newLeadId=${lead.id}`}
                    className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all"
                >
                    <ClipboardList size={16} /> Create Quote
                </Link>
            </div>

            {/* INFO GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Contact Card */}
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                    <div className="text-[10px] font-black uppercase text-gray-400 flex items-center gap-2">
                        <User size={14} /> Contact Information
                    </div>
                    
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gray-50 rounded-lg text-gray-400"><Phone size={16}/></div>
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase">Phone</p>
                                <p className="text-sm font-bold text-gray-900">{lead.phone}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gray-50 rounded-lg text-gray-400"><Mail size={16}/></div>
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase">Email</p>
                                <p className="text-sm font-bold text-gray-900">{lead.email || 'Not provided'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Location Card */}
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                    <div className="text-[10px] font-black uppercase text-gray-400 flex items-center gap-2">
                        <MapPin size={14} /> Service Location
                    </div>
                    <div className="space-y-3">
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase">City</p>
                            <p className="text-sm font-bold text-gray-900">{lead.city}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase">Full Address</p>
                            <p className="text-sm font-medium text-gray-600 leading-tight">
                                {lead.address || 'No address details provided.'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* DESCRIPTION SECTION */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                <div className="text-[10px] font-black uppercase text-gray-400 flex items-center gap-2">
                    <FileText size={14} /> Project Description
                </div>
                <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-sm text-gray-700 leading-relaxed font-medium">
                        {lead.description || "No specific details provided for this lead."}
                    </p>
                </div>
                <div className="flex items-center gap-2 text-[9px] font-bold text-gray-400">
                    <Calendar size={12}/> Lead Captured: {new Date(lead.created_at).toLocaleDateString()}
                </div>
            </div>
        </div>
    );
}