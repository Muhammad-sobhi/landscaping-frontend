import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Calendar, User, DollarSign, ChevronRight, UserCheck, 
    Phone, MapPin, MessageSquare 
} from 'lucide-react';

export default function JobsTable({ jobs, onRequestStory }) {
    const navigate = useNavigate();

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-700';
            case 'pending': return 'bg-blue-100 text-blue-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="w-full bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            {/* 1. DESKTOP VIEW */}
            <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-gray-50 bg-gray-50/50">
                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Customer</th>
                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</th>
                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Price</th>
                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Assigned Tech</th>
                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right px-10">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {jobs.map((job) => (
                            <tr key={job.id} className="hover:bg-gray-50/50 transition-colors group">
                                <td className="px-6 py-4 cursor-pointer" onClick={() => navigate(`/jobs/${job.id}`)}>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                                            <User size={18} />
                                        </div>
                                        <div>
                                            <div className="font-bold text-gray-900">{job.lead?.full_name || 'Manual Entry'}</div>
                                            <div className="text-xs text-gray-500">{job.lead?.phone || 'No phone'}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-600">
                                        <Calendar size={14} className="text-gray-400" />
                                        {job.scheduled_date ? new Date(job.scheduled_date).toLocaleDateString() : 'TBD'}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-1 text-sm font-bold text-gray-900">
                                        <DollarSign size={14} className="text-gray-400" />
                                        {Number(job.price).toLocaleString()}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    {job.employees?.[0] ? (
                                        <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full w-fit">
                                            <UserCheck size={14} />
                                            <span className="text-xs font-bold uppercase tracking-tight">{job.employees[0].name}</span>
                                        </div>
                                    ) : (
                                        <span className="text-xs font-bold text-gray-300 uppercase italic">Unassigned</span>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${getStatusColor(job.status)}`}>
                                        {job.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-3 px-4">
                                        {job.status === 'completed' && (
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); onRequestStory(job.lead_id); }}
                                                className="p-2 bg-green-50 text-green-600 rounded-xl hover:bg-green-600 hover:text-white transition-all shadow-sm"
                                                title="Send Testimonial Request"
                                            >
                                                <MessageSquare size={16} />
                                            </button>
                                        )}
                                        <button onClick={() => navigate(`/jobs/${job.id}`)} className="text-gray-300 group-hover:text-green-500">
                                            <ChevronRight size={20} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* 2. MOBILE CARD VIEW */}
            <div className="md:hidden divide-y divide-gray-100">
                {jobs.map((job) => (
                    <div key={job.id} className="p-5 flex flex-col gap-4 w-full box-border">
                        <div className="flex justify-between items-start">
                            <div onClick={() => navigate(`/jobs/${job.id}`)} className="flex items-center gap-3 flex-1 min-w-0">
                                <div className="w-12 h-12 rounded-2xl bg-gray-900 text-white flex items-center justify-center shrink-0 shadow-lg shadow-gray-200">
                                    <User size={20} />
                                </div>
                                <div className="min-w-0">
                                    <h4 className="font-black text-gray-900 truncate">{job.lead?.full_name || 'Manual Entry'}</h4>
                                    <div className="flex flex-col gap-0.5">
                                        <p className="text-xs text-gray-500 flex items-center gap-1"><Phone size={12} /> {job.lead?.phone || 'No Phone'}</p>
                                    </div>
                                </div>
                            </div>
                            
                            {/* MOBILE REQUEST BUTTON */}
                            {job.status === 'completed' && (
                                <button 
                                    onClick={(e) => { e.stopPropagation(); onRequestStory(job.lead_id); }}
                                    className="p-3 bg-green-600 text-white rounded-2xl shadow-lg shadow-green-100 active:scale-95"
                                >
                                    <MessageSquare size={18} />
                                </button>
                            )}
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                            <div className="flex items-center gap-4">
                                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${getStatusColor(job.status)}`}>
                                    {job.status}
                                </span>
                                <div className="flex items-center font-black text-gray-900 text-sm">
                                    <DollarSign size={14} className="text-gray-400" />
                                    {Number(job.price).toLocaleString()}
                                </div>
                            </div>
                            <button onClick={() => navigate(`/jobs/${job.id}`)} className="text-gray-300">
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {jobs.length === 0 && (
                <div className="px-6 py-20 text-center">
                    <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">No projects found.</p>
                </div>
            )}
        </div>
    );
}