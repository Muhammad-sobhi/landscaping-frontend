import React, { useEffect, useState } from 'react';
import api from '../api/axios'; 
import { Check, Trash2, Star, MessageSquare, User, Clock } from 'lucide-react';

const Testimonials = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchStories = async () => {
        try {
            const res = await api.get('/testimonials');
            setData(res.data);
        } catch (err) {
            console.error("Error fetching", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchStories(); }, []);

    const approve = async (id) => {
        try {
            await api.put(`/testimonials/${id}/approve`);
            
            // Success: Update the local state to reflect the change
            setData(prevData => 
                prevData.map(t => t.id === id ? { ...t, status: 'approved' } : t)
            );
        } catch (err) {
            console.error("Approval Error:", err);
            // Show the specific error message from Laravel if available
            alert(err.response?.data?.message || "Failed to approve the story.");
        }
    };

    const remove = async (id) => {
        if (!window.confirm("Delete permanently?")) return;
        await api.delete(`/testimonials/${id}`);
        setData(data.filter(t => t.id !== id));
    };

    if (loading) return <div className="p-10 font-black uppercase tracking-widest text-gray-400">Loading Hub...</div>;

    return (
        <div className="max-w-6xl mx-auto">
            <header className="mb-10">
                <h1 className="text-4xl font-black uppercase tracking-tighter text-gray-900">Feedback Hub</h1>
                <p className="text-green-600 font-black uppercase text-[10px] tracking-[0.3em]">Review & Social Proof</p>
            </header>
            
            <div className="grid gap-4">
                {data.map((t) => (
                    <div key={t.id} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 flex items-center justify-between shadow-sm">
                        <div className="flex-1">
                            <div className="flex items-center gap-4 mb-2">
                                <span className="font-black uppercase text-sm">{t.lead?.full_name}</span>
                                <div className="flex text-yellow-400">
                                    {[...Array(t.rating)].map((_, i) => <Star key={i} size={12} fill="currentColor" />)}
                                </div>
                                <span className={`text-[9px] font-black uppercase px-3 py-1 rounded-full ${t.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                    {t.status}
                                </span>
                            </div>
                            <p className="text-gray-500 italic text-sm">
                                {t.content || <span className="text-gray-300 font-black not-italic tracking-tighter uppercase text-[10px]">Awaiting customer response...</span>}
                            </p>
                        </div>
                        <div className="flex gap-2 ml-8">
                            {t.status === 'pending' && t.content && (
                                <button onClick={() => approve(t.id)} className="p-5 bg-green-600 text-white rounded-2xl hover:bg-green-700 transition-all shadow-lg shadow-green-100">
                                    <Check size={20} />
                                </button>
                            )}
                            <button onClick={() => remove(t.id)} className="p-5 bg-gray-50 text-red-400 rounded-2xl hover:bg-red-50 transition-all">
                                <Trash2 size={20} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Testimonials;