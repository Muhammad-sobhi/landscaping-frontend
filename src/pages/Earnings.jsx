import React, { useState, useEffect } from 'react';
import { 
    DollarSign, Calendar, Briefcase, TrendingUp, 
    Users, Search, ChevronLeft, ChevronRight, AlertCircle 
} from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Earnings() {
    const { user } = useAuth();
    const [earnings, setEarnings] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [stats, setStats] = useState({ total: 0, count: 0 });
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [page, setPage] = useState(1);

    const isAdmin = user?.role === 'super_admin';

    useEffect(() => {
        fetchEarnings();
    }, [page, isAdmin]);

    const fetchEarnings = async () => {
        setLoading(true);
        try {
            const endpoint = isAdmin ? `/earnings?page=${page}` : `/me/earnings?page=${page}`;
            const res = await api.get(endpoint);
            
            // DEBUG: Open your browser console (F12) to see this output
            console.log("API Response:", res.data);

            // Handle Laravel Pagination: data is inside res.data.data
            const dataArray = res.data.data || [];
            
            setEarnings(dataArray);
            setPagination(res.data);
            
            // Calculate total from the current page or from a custom total_amount field if you add it to Laravel
            const total = dataArray.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
            setStats({ 
                total: res.data.total_sum || total, 
                count: res.data.total || 0 
            });
            
            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch earnings", err);
            setLoading(false);
        }
    };

    // Simple client-side search
    const filteredEarnings = earnings.filter(item => 
        item.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.type?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading && page === 1) {
        return (
            <div className="flex flex-col items-center justify-center p-20 space-y-4">
                <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="font-black text-gray-400 uppercase tracking-widest text-xs">Loading Financial Records...</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto pb-20 px-4">
            <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 pt-6">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                        {isAdmin ? "Financial Overview" : "My Earnings"}
                    </h1>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        {isAdmin ? "System-wide payout tracking" : "Your performance commissions"}
                    </p>
                </div>

                {isAdmin && (
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input 
                            type="text"
                            placeholder="Filter by tech or type..."
                            className="pl-12 pr-6 py-3 bg-white border border-gray-100 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-green-500 outline-none w-full md:w-64 shadow-sm"
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                )}
            </header>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="md:col-span-2 bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <TrendingUp size={120} />
                    </div>
                    <div className="relative z-10">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Amount</p>
                        <h2 className="text-5xl font-black">${parseFloat(stats.total).toFixed(2)}</h2>
                    </div>
                </div>
                
                <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm flex flex-col justify-center">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Transactions</p>
                    <h2 className="text-4xl font-black text-gray-900">{stats.count}</h2>
                </div>
            </div>

            {/* Transaction List */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-4">
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Ledger Entries</h3>
                </div>

                {filteredEarnings.length === 0 ? (
                    <div className="bg-white p-20 rounded-[3rem] text-center border border-dashed border-gray-200 flex flex-col items-center">
                        <AlertCircle className="text-gray-200 mb-4" size={48} />
                        <p className="text-xs font-black text-gray-300 uppercase tracking-widest">No data available in this view</p>
                    </div>
                ) : (
                    <div className="grid gap-3">
                        {filteredEarnings.map((entry) => (
                            <div key={entry.id} className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm flex flex-wrap items-center justify-between hover:border-green-400 transition-all group">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isAdmin ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'}`}>
                                        {isAdmin ? <Users size={20} /> : <DollarSign size={20} />}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-black text-gray-900 uppercase text-[11px] tracking-tight">
                                                {entry.type}
                                            </h4>
                                            {isAdmin && (
                                                <span className="bg-blue-100 text-blue-700 text-[8px] px-2 py-0.5 rounded-md font-black uppercase">
                                                    {entry.user?.name || 'Unknown User'}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3 mt-0.5">
                                            <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
                                                <Calendar size={12} /> {new Date(entry.earned_at || entry.created_at).toLocaleDateString()}
                                            </span>
                                            {entry.job_id && (
                                                <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                                                    <Briefcase size={12} /> Job #{entry.job_id}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-black text-gray-900">+${parseFloat(entry.amount).toFixed(2)}</p>
                                    <p className="text-[8px] font-black text-green-500 uppercase tracking-widest">Verified</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {pagination?.last_page > 1 && (
                    <div className="flex items-center justify-center gap-4 mt-8">
                        <button 
                            disabled={page === 1}
                            onClick={() => setPage(p => p - 1)}
                            className="p-3 rounded-2xl bg-white border border-gray-100 disabled:opacity-20 hover:bg-gray-50 transition-colors"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <span className="text-[10px] font-black uppercase tracking-tighter">
                            Page {page} / {pagination.last_page}
                        </span>
                        <button 
                            disabled={page === pagination.last_page}
                            onClick={() => setPage(p => p + 1)}
                            className="p-3 rounded-2xl bg-white border border-gray-100 disabled:opacity-20 hover:bg-gray-50 transition-colors"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}