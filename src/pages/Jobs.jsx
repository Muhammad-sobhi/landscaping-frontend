import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import JobsTable from '../components/JobsTable';
import { useAuth } from '../context/AuthContext';
import { 
    Search, Briefcase, Clock, CheckCircle, Plus, X, 
    DollarSign, Calendar, User, UserCheck 
} from 'lucide-react';

export default function Jobs() {
    const [jobs, setJobs] = useState([]);
    const [filteredJobs, setFilteredJobs] = useState([]);
    const [leads, setLeads] = useState([]);
    const [employees, setEmployees] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    
    const { user } = useAuth();

    const [newJob, setNewJob] = useState({ 
        lead_id: '', 
        price: '', 
        scheduled_date: '', 
        notes: '',
        employee_id: '' 
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const requests = [api.get('/jobs')];
                if (user?.role === 'super_admin') {
                    requests.push(api.get('/leads'));
                    requests.push(api.get('/users'));
                }
                const responses = await Promise.all(requests);
                setJobs(responses[0].data);
                setFilteredJobs(responses[0].data);
                if (user?.role === 'super_admin') {
                    setLeads(responses[1].data);
                    const techList = responses[2].data.filter(u => u.role === 'employee' || u.role === 'technician');
                    setEmployees(techList);
                }
                setLoading(false);
            } catch (err) {
                console.error("Error loading Jobs:", err);
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);

    const handleCreateJob = async (e) => {
        e.preventDefault();
        setIsCreating(true);
        try {
            const res = await api.post('/jobs', newJob);
            setJobs(prev => [res.data, ...prev]);
            setShowForm(false);
            setNewJob({ lead_id: '', price: '', scheduled_date: '', notes: '', employee_id: '' });
        } catch (err) {
            alert(err.response?.data?.message || "Failed to create job.");
        } finally {
            setIsCreating(false);
        }
    };

    // NEW: Handle Testimonial Request
    const handleRequestStory = async (leadId) => {
        if (!window.confirm("Send a testimonial request email to this customer?")) return;
        try {
            await api.post(`/leads/${leadId}/request-story`);
            alert("Invitation Sent Successfully!");
        } catch (err) {
            console.error("Request Error:", err);
            alert("Failed to send request. Ensure the lead has a valid email.");
        }
    };

    useEffect(() => {
        let result = jobs;
        if (activeFilter !== 'all') {
            result = result.filter(job => job.status === activeFilter);
        }
        if (searchTerm) {
            result = result.filter(job => 
                job.lead?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        setFilteredJobs(result);
    }, [activeFilter, searchTerm, jobs]);

    const filterOptions = [
        { id: 'all', label: 'All', icon: <Briefcase size={14}/> },
        { id: 'pending', label: 'In Progress', icon: <Clock size={14}/> },
        { id: 'active', label: 'Active', icon: <Clock size={14}/> },
        { id: 'completed', label: 'Finished', icon: <CheckCircle size={14}/> },
    ];

    return (
        <div className="space-y-6 w-full max-w-full overflow-x-hidden pb-20 px-1">
            <div className="flex flex-row justify-between items-center gap-4">
                <div>
                    <h2 className="text-xl font-black text-gray-900 tracking-tight">Project Center</h2>
                    <p className="text-gray-500 text-xs">Manage and track jobs.</p>
                </div>
                {user?.role === 'super_admin' && (
                    <button 
                        onClick={() => setShowForm(!showForm)}
                        className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-md ${
                            showForm ? 'bg-gray-200 text-gray-700' : 'bg-green-600 text-white active:scale-95'
                        }`}
                    >
                        {showForm ? <X size={16}/> : <Plus size={16}/>}
                        {showForm ? 'Cancel' : 'New Project'}
                    </button>
                )}
            </div>

            <div className="relative w-full max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input 
                    type="text" 
                    placeholder="Search customer..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl outline-none shadow-sm focus:ring-2 focus:ring-green-500 text-sm"
                />
            </div>

            {showForm && user?.role === 'super_admin' && (
                <form onSubmit={handleCreateJob} className="bg-white border border-gray-100 rounded-2xl p-4 space-y-4 shadow-lg max-w-full sm:max-w-2xl overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1 w-full">
                            <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Customer</label>
                            <div className="relative w-full">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" size={14} />
                                <select 
                                    required
                                    className="w-full pl-9 pr-8 py-2.5 bg-gray-50 rounded-lg border-none outline-none font-bold text-gray-700 text-sm appearance-none cursor-pointer"
                                    value={newJob.lead_id}
                                    onChange={(e) => setNewJob({...newJob, lead_id: e.target.value})}
                                >
                                    <option value="">Select Lead...</option>
                                    {leads.map(lead => (
                                        <option key={lead.id} value={lead.id}>{lead.full_name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-1 w-full">
                            <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Assign Tech</label>
                            <div className="relative w-full">
                                <UserCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" size={14} />
                                <select 
                                    className="w-full pl-9 pr-8 py-2.5 bg-gray-50 rounded-lg border-none outline-none font-bold text-gray-700 text-sm appearance-none cursor-pointer"
                                    value={newJob.employee_id}
                                    onChange={(e) => setNewJob({...newJob, employee_id: e.target.value})}
                                >
                                    <option value="">Unassigned</option>
                                    {employees.map(emp => (
                                        <option key={emp.id} value={emp.id}>{emp.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Price</label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                                <input 
                                    type="number" required placeholder="0.00"
                                    className="w-full pl-9 pr-4 py-2.5 bg-gray-50 rounded-lg border-none outline-none font-bold text-sm text-gray-900"
                                    value={newJob.price}
                                    onChange={(e) => setNewJob({...newJob, price: e.target.value})}
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Date</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                                <input 
                                    type="date" required
                                    className="w-full pl-9 pr-4 py-2.5 bg-gray-50 rounded-lg border-none outline-none font-bold text-xs text-gray-900"
                                    value={newJob.scheduled_date}
                                    onChange={(e) => setNewJob({...newJob, scheduled_date: e.target.value})}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Notes</label>
                        <textarea 
                            placeholder="Details..."
                            className="w-full px-3 py-2.5 bg-gray-50 rounded-lg border-none outline-none font-medium text-sm min-h-[60px] text-gray-900"
                            value={newJob.notes}
                            onChange={(e) => setNewJob({...newJob, notes: e.target.value})}
                        />
                    </div>

                    <button 
                        disabled={isCreating}
                        type="submit"
                        className="w-full py-3 bg-green-600 text-white rounded-xl font-bold uppercase text-xs tracking-widest shadow-md active:scale-95 transition-all disabled:opacity-50"
                    >
                        {isCreating ? 'Creating...' : 'Create Project'}
                    </button>
                </form>
            )}

            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                {filterOptions.map(option => (
                    <button
                        key={option.id}
                        onClick={() => setActiveFilter(option.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                            activeFilter === option.id 
                            ? 'bg-gray-900 text-white shadow-md' 
                            : 'bg-white text-gray-400 border border-gray-100'
                        }`}
                    >
                        {option.icon} {option.label}
                    </button>
                ))}
            </div>

            <div className="w-full">
                {loading ? (
                    <div className="text-center p-10 font-bold uppercase text-[10px] tracking-widest text-gray-300">Loading...</div>
                ) : (
                    <JobsTable jobs={filteredJobs} onRequestStory={handleRequestStory} />
                )}
            </div>
        </div>
    );
}