import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { 
    ArrowLeft, Plus, Trash2, Receipt, 
    X, AlertCircle, Filter, Search, Download, Check
} from 'lucide-react';

export default function Expenses() {
    const { id } = useParams(); // ID is present when coming from a Job, undefined from Sidebar
    const navigate = useNavigate();
    const isGlobal = !id;

    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    
    const [newExpense, setNewExpense] = useState({
        amount: '',
        category: 'Materials',
        description: '',
    });

    const categories = [
        { name: 'Materials', icon: '🌲' },
        { name: 'Rental', icon: '🛠️' },
        { name: 'Fuel', icon: '⛽' },
        { name: 'Labor', icon: '👷' },
        { name: 'Dump Fee', icon: '🗑️' },
    ];

    useEffect(() => {
        fetchExpenses();
    }, [id]);

    const fetchExpenses = async () => {
        setLoading(true);
        try {
            const endpoint = isGlobal ? '/expenses' : `/jobs/${id}/expenses`;
            const res = await api.get(endpoint);
            const data = res.data.expenses || (Array.isArray(res.data) ? res.data : []);
            setExpenses(data);
        } catch (err) {
            console.error("Error fetching expenses:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddExpense = async (e) => {
        e.preventDefault();
        const dataToSend = {
            job_id: parseInt(id),
            category: newExpense.category,
            amount: parseFloat(newExpense.amount),
            description: newExpense.description || '',
            spent_at: new Date().toISOString().split('T')[0] 
        };

        try {
            const res = await api.post(`/jobs/${id}/expenses`, dataToSend);
            const savedExpense = res.data.expense || res.data;
            setExpenses(prev => [savedExpense, ...prev]);
            setNewExpense({ amount: '', category: 'Materials', description: '' });
            setShowForm(false);
        } catch (err) {
            alert(`Error: ${err.response?.data?.message || "Failed to save"}`);
        }
    };

    const filteredExpenses = expenses.filter(exp => 
        exp.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exp.category?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) return <div className="p-10 text-center font-black text-gray-400 uppercase tracking-widest text-xs">Loading Ledger...</div>;

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-20 px-4">
            
            {/* Navigation Header */}
            {!isGlobal && (
                <button 
                    onClick={() => navigate(`/jobs/${id}`)} 
                    className="flex items-center gap-2 text-gray-400 hover:text-gray-900 transition-colors font-black text-[10px] uppercase tracking-widest mb-2"
                >
                    <ArrowLeft size={14} /> Back to Project Details
                </button>
            )}

            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 py-4">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                        {isGlobal ? "Company Expenses" : "Job Expenses"}
                    </h1>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                        {isGlobal ? "Master Transaction Ledger" : `Project ID: #${id}`}
                    </p>
                </div>

                <div className="flex gap-3 w-full md:w-auto">
                    {!isGlobal && (
                        <button 
                            onClick={() => setShowForm(!showForm)}
                            className={`flex-1 md:flex-none px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 ${
                                showForm ? "bg-red-50 text-red-500 border border-red-100" : "bg-green-600 text-white shadow-lg shadow-green-100"
                            }`}
                        >
                            {showForm ? "Cancel" : "Add Expense"}
                        </button>
                    )}
                    {isGlobal && (
                        <div className="relative flex-1 md:w-64">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input 
                                type="text"
                                placeholder="SEARCH LEDGER..."
                                className="w-full bg-white border border-gray-100 rounded-2xl py-3 pl-12 pr-4 text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 ring-green-500/20"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Form (Only visible within a Job) */}
            {showForm && !isGlobal && (
                <form onSubmit={handleAddExpense} className="bg-white border border-gray-100 rounded-[2.5rem] p-10 shadow-2xl animate-in fade-in slide-in-from-top-4">
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
                         {categories.map((cat) => (
                            <button
                                key={cat.name}
                                type="button"
                                onClick={() => setNewExpense({ ...newExpense, category: cat.name })}
                                className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${
                                    newExpense.category === cat.name 
                                    ? 'bg-green-600 border-green-600 text-white' 
                                    : 'bg-gray-50 border-transparent text-gray-400'
                                }`}
                            >
                                <span className="text-xl">{cat.icon}</span>
                                <span className="text-[8px] font-black uppercase">{cat.name}</span>
                            </button>
                        ))}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <input 
                            type="number" placeholder="Amount" required
                            className="bg-gray-50 p-4 rounded-xl font-black"
                            value={newExpense.amount}
                            onChange={e => setNewExpense({...newExpense, amount: e.target.value})}
                        />
                        <input 
                            type="text" placeholder="Description"
                            className="bg-gray-50 p-4 rounded-xl font-bold"
                            value={newExpense.description}
                            onChange={e => setNewExpense({...newExpense, description: e.target.value})}
                        />
                    </div>
                    <button type="submit" className="w-full bg-gray-900 text-white py-4 rounded-xl font-black uppercase text-[10px] tracking-widest">Save Transaction</button>
                </form>
            )}

            {/* Ledger Table */}
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-gray-50">
                            <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Details</th>
                            {isGlobal && <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Project</th>}
                            <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</th>
                            <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Amount</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {filteredExpenses.map(exp => (
                            <tr key={exp.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="p-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-lg">
                                            {categories.find(c => c.name === exp.category)?.icon || '💰'}
                                        </div>
                                        <div>
                                            <p className="text-[11px] font-black text-gray-900 uppercase tracking-tight">{exp.category}</p>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase">{exp.description || 'No Description'}</p>
                                        </div>
                                    </div>
                                </td>
                                {isGlobal && (
                                    <td className="p-6">
                                        <button 
                                            onClick={() => navigate(`/jobs/${exp.job_id}`)}
                                            className="text-[10px] font-black text-blue-500 uppercase hover:underline"
                                        >
                                            View Job #{exp.job_id}
                                        </button>
                                    </td>
                                )}
                                <td className="p-6 text-[10px] font-black text-gray-500 uppercase">{exp.spent_at}</td>
                                <td className="p-6 text-right font-black text-red-600">-${parseFloat(exp.amount).toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredExpenses.length === 0 && (
                    <div className="p-20 text-center text-[10px] font-black text-gray-300 uppercase tracking-widest italic">
                        No transactions found.
                    </div>
                )}
            </div>

            {/* "Finish" Action Button for Job-specific view */}
            {!isGlobal && (
                <div className="flex justify-center pt-4">
                    <button 
                        onClick={() => navigate(`/jobs/${id}`)}
                        className="flex items-center gap-2 bg-gray-900 text-white px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-gray-800 transition-all"
                    >
                        <Check size={16} /> Finish and Return to Job
                    </button>
                </div>
            )}
        </div>
    );
}