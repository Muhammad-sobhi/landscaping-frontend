import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { 
  X, Mail, Shield, Calendar, Briefcase, 
  TrendingUp, Clock, Phone, ArrowRight, 
  UserPlus, Search, Trash2, Loader2, CheckCircle2 
} from 'lucide-react';

export default function UsersPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    
    const [formData, setFormData] = useState({
        name: '', email: '', password: '', role: 'employee'
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await api.get('/users');
            setUsers(res.data);
        } catch (err) {
            console.error("Error fetching users", err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.post('/users', formData);
            setShowAddModal(false);
            setFormData({ name: '', email: '', password: '', role: 'employee' });
            fetchUsers();
        } catch (err) {
            alert(err.response?.data?.message || "Failed to create user");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure? This user will lose all system access.")) return;
        try {
            await api.delete(`/users/${id}`);
            setUsers(users.filter(u => u.id !== id));
            setSelectedUser(null);
        } catch (err) {
            alert(err.response?.data?.message || "Delete failed");
        }
    };

    const viewUserDetail = async (user) => {
        try {
            const res = await api.get(`/analytics/employee/${user.id}`);
            setSelectedUser({ ...user, stats: res.data });
        } catch (err) {
            setSelectedUser(user);
        }
    };

    const filteredUsers = users.filter(u => 
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-8 relative">
            
            {/* --- HEADER SECTION --- */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Team Management</h1>
                    <p className="text-gray-500 font-bold text-xs uppercase tracking-[0.2em] mt-1">Control access & monitor performance</p>
                </div>
                <button 
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center justify-center gap-2 bg-green-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-green-700 transition-all shadow-lg shadow-green-100 active:scale-95"
                >
                    <UserPlus size={18} /> Add Member
                </button>
            </div>

            {/* --- SEARCH & FILTERS --- */}
            <div className="relative max-w-md group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-600 transition-colors" size={20} />
                <input 
                    type="text"
                    placeholder="Search by name or email..."
                    className="w-full pl-12 pr-6 py-4 bg-white rounded-2xl border-none shadow-sm focus:ring-2 focus:ring-green-500 font-bold text-sm transition-all"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* --- USERS GRID --- */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                    <Loader2 className="animate-spin text-green-600" size={40} />
                    <p className="font-black text-gray-400 text-xs uppercase tracking-widest">Syncing Team Data...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredUsers.map(u => (
                        <div 
                            key={u.id} 
                            onClick={() => viewUserDetail(u)}
                            className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all group relative overflow-hidden"
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-16 h-16 rounded-[1.4rem] flex items-center justify-center font-black text-xl shadow-inner ${
                                    u.role === 'super_admin' ? 'bg-indigo-50 text-indigo-600' : 'bg-green-50 text-green-600'
                                }`}>
                                    {u.name.charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-black text-gray-900 uppercase tracking-tight truncate">{u.name}</h3>
                                    <p className="text-[10px] font-bold text-gray-400 flex items-center gap-1 mt-0.5">
                                        <Mail size={10} /> {u.email}
                                    </p>
                                </div>
                            </div>
                            
                            <div className="mt-6 flex items-center justify-between">
                                <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                                    u.role === 'super_admin' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-500'
                                }`}>
                                    {u.role === 'super_admin' ? 'Admin' : 'Technician'}
                                </span>
                                <div className="flex items-center gap-1 text-[10px] font-black text-green-600 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                                    Details <ArrowRight size={12} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* --- ADD USER MODAL --- */}
            {showAddModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm animate-fade-in" onClick={() => setShowAddModal(false)} />
                    <div className="relative bg-white w-full max-w-md rounded-[3rem] p-10 shadow-2xl animate-slide-in">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-xl font-black uppercase tracking-tight text-gray-900">New Team Member</h2>
                            <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={20}/></button>
                        </div>
                        <form onSubmit={handleCreate} className="space-y-5">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                                <input required className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-green-500 font-bold" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                                <input required type="email" className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-green-500 font-bold" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">System Password</label>
                                <input required type="password" className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-green-500 font-bold" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Role Type</label>
                                <select className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-green-500 font-black text-xs uppercase" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                                    <option value="employee">Technician / Employee</option>
                                    <option value="super_admin">System Administrator</option>
                                </select>
                            </div>
                            <button disabled={submitting} className="w-full py-5 bg-green-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest transition-all hover:bg-green-700 active:scale-95 disabled:opacity-50 mt-4">
                                {submitting ? <Loader2 className="animate-spin mx-auto" /> : "Authorize User"}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* --- USER PROFILE DRAWER --- */}
            {selectedUser && (
                <>
                    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[110] animate-fade-in" onClick={() => setSelectedUser(null)} />
                    <div className="fixed top-0 right-0 h-full w-full max-w-md bg-white z-[120] shadow-2xl p-10 overflow-y-auto animate-slide-in flex flex-col no-scrollbar">
                        <div className="flex justify-between items-center mb-10">
                            <button onClick={() => setSelectedUser(null)} className="p-3 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors"><X size={20} /></button>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Profile Details</span>
                        </div>

                        <div className="text-center space-y-4 mb-10">
                            <div className="w-24 h-24 bg-green-600 text-white rounded-[2.5rem] mx-auto flex items-center justify-center text-3xl font-black shadow-xl shadow-green-100">
                                {selectedUser.name.charAt(0)}
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase">{selectedUser.name}</h2>
                                <p className="text-sm font-bold text-gray-400">{selectedUser.email}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-10">
                            <div className="bg-gray-50 p-5 rounded-[2rem] border border-gray-100 text-center">
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Status</p>
                                <div className="flex items-center justify-center gap-1">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                    <span className="text-xs font-black text-gray-900 uppercase">Active</span>
                                </div>
                            </div>
                            <div className="bg-gray-50 p-5 rounded-[2rem] border border-gray-100 text-center">
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Joined</p>
                                <p className="text-xs font-black text-gray-900 uppercase">{selectedUser.stats?.joined_date || new Date(selectedUser.created_at).toLocaleDateString()}</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 border-b border-gray-50 pb-4">Job Metrics</h3>
                            <div className="flex items-center justify-between p-6 bg-gray-50 rounded-[2rem] border border-gray-100">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-white text-green-600 rounded-2xl shadow-sm"><Briefcase size={20} /></div>
                                    <span className="text-xs font-bold text-gray-500 uppercase">Assigned Jobs</span>
                                </div>
                                <span className="text-2xl font-black text-gray-900">{selectedUser.stats?.completed_jobs_count || 0}</span>
                            </div>
                            <div className="flex items-center justify-between p-6 bg-gray-50 rounded-[2rem] border border-gray-100">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-white text-indigo-600 rounded-2xl shadow-sm"><TrendingUp size={20} /></div>
                                    <span className="text-xs font-bold text-gray-500 uppercase">Total Revenue</span>
                                </div>
                                <span className="text-2xl font-black text-gray-900">${selectedUser.stats?.total_revenue || '0.00'}</span>
                            </div>
                        </div>

                        {/* Recent Activity Section */}
                        <div className="mt-10 space-y-4">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 border-b border-gray-50 pb-4">Activity Log</h3>
                            {selectedUser.stats?.recent_activity?.length > 0 ? (
                                selectedUser.stats.recent_activity.map(job => (
                                    <div key={job.id} className="p-4 bg-white border border-gray-100 rounded-2xl flex justify-between items-center group/item hover:border-green-200 transition-colors">
                                        <div>
                                            <p className="text-[10px] font-black text-gray-900 uppercase leading-none">{job.title || `Job #${job.job_number || job.id}`}</p>
                                            <p className="text-[8px] font-bold text-gray-400 mt-1 uppercase">
                                                {job.client?.name ? `Client: ${job.client.name}` : `Assigned ${new Date(job.created_at).toLocaleDateString()}`}
                                            </p>
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            <span className={`text-[8px] font-black px-2 py-1 rounded uppercase ${job.status === 'completed' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>
                                                {job.status}
                                            </span>
                                            <span className="text-[9px] font-black text-gray-900">${job.price || job.price || '0.00'}</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-6 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100">
                                    <p className="text-[10px] font-black text-gray-400 uppercase">No Activity Recorded</p>
                                </div>
                            )}
                        </div>

                        <div className="mt-auto pt-10">
                            <button 
                                onClick={() => handleDelete(selectedUser.id)}
                                className="w-full py-4 bg-red-50 text-red-500 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-red-500 hover:text-white transition-all active:scale-95"
                            >
                                Terminate System Access
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}