import React, { useEffect, useState } from 'react';
import { 
  CheckCircle, Clock, MapPin, Camera, 
  Phone, LogOut, Briefcase, Zap, 
  DollarSign, FileText 
} from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function EmployeeDashboard() {
  const [myJobs, setMyJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { logout, user } = useAuth();

  useEffect(() => {
    fetchMyJobs();
  }, []);

  const fetchMyJobs = async () => {
    try {
      // Fetches all jobs assigned to the user
      const res = await api.get('/jobs');
      setMyJobs(res.data); 
      setLoading(false);
    } catch (err) {
      console.error("Error fetching jobs");
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (jobId, newStatus) => {
    try {
      await api.put(`/jobs/${jobId}`, { status: newStatus });
      fetchMyJobs();
    } catch (err) {
      alert("Failed to update status.");
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Loading Schedule</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24">
      {/* Header Section */}
      <div className="bg-white px-6 pt-8 pb-6 rounded-b-[2.5rem] shadow-sm border-b border-gray-100 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight leading-none uppercase">My Tasks</h1>
            <div className="flex items-center gap-2 mt-2">
              <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                {myJobs.filter(j => j.status !== 'completed').length} Active Missions
              </p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="p-3 bg-gray-50 text-gray-400 rounded-2xl hover:text-red-500 transition-all active:scale-90"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-5xl mx-auto p-5 space-y-6">
        {myJobs.length === 0 ? (
          <div className="bg-white p-12 rounded-[2.5rem] text-center space-y-4 border border-dashed border-gray-200 shadow-sm">
             <div className="w-16 h-16 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto text-gray-300">
                <Briefcase size={32} />
             </div>
             <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Schedule is Clear</p>
          </div>
        ) : (
          myJobs.map(job => (
            <div key={job.id} className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden transition-all hover:shadow-md">
              <div className="p-6 md:p-8">
                
                {/* Top Row: Info & Phone */}
                <div className="flex justify-between items-start mb-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                        {/* Job Status */}
                        <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                          job.status === 'completed' ? 'bg-green-100 text-green-600' : 
                          job.status === 'active' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'
                        }`}>
                          {job.status}
                        </span>
                        
                        {/* Payment Context for Field Crew */}
                        <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest bg-gray-100 text-gray-600 flex items-center gap-1`}>
                          <DollarSign size={10} />
                          {job.invoice?.status === 'paid' ? 'Paid' : 'Collect Payment'}
                        </span>
                    </div>

                    <h2 className="text-2xl font-black text-gray-900 leading-tight capitalize">{job.lead?.full_name}</h2>
                    
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-gray-500">
                            <MapPin size={14} className="text-green-500" />
                            <span className="text-xs font-bold">{job.lead?.address || 'No address provided'}</span>
                        </div>
                        {job.offer_id && (
                            <div className="flex items-center gap-2 text-gray-400">
                                <FileText size={12} />
                                <span className="text-[10px] font-black uppercase tracking-tight">Ref: Offer #{job.offer_id}</span>
                            </div>
                        )}
                    </div>
                  </div>
                  
                  <a href={`tel:${job.lead?.phone}`} className="w-12 h-12 bg-green-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-green-100 hover:bg-green-600 active:scale-90 transition-all">
                    <Phone size={20} />
                  </a>
                </div>

                {/* Middle Row: Notes (The specific "Message from us" or field instructions) */}
                {job.notes && (
                  <div className="mb-8 p-4 bg-gray-50 rounded-2xl border-l-4 border-green-500">
                    <div className="flex gap-3">
                      <Zap size={16} className="text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Work Instructions</p>
                        <p className="text-xs font-medium text-gray-600 leading-relaxed italic">
                          "{job.notes}"
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Bottom Row: Actions */}
                <div className="flex flex-col md:flex-row md:justify-end items-center gap-3 border-t border-gray-50 pt-6">
                  {/* Link to Job Details to Upload Photos / See Full Scope */}
                  <button 
                    onClick={() => window.location.href = `/jobs/${job.id}`}
                    className="w-full md:w-auto md:min-w-[140px] flex items-center justify-center gap-2 bg-gray-900 text-white py-3 px-6 rounded-xl font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all"
                  >
                    <Camera size={14} /> Job Photos & Details
                  </button>
                  
                  {job.status === 'pending' ? (
                    <button 
                      onClick={() => handleStatusUpdate(job.id, 'active')}
                      className="w-full md:w-auto md:min-w-[160px] flex items-center justify-center gap-2 bg-blue-600 text-white py-3 px-8 rounded-xl font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all shadow-lg shadow-blue-100"
                    >
                      <Clock size={14} /> Start Mission
                    </button>
                  ) : job.status === 'active' ? (
                    <button 
                      onClick={() => handleStatusUpdate(job.id, 'completed')}
                      className="w-full md:w-auto md:min-w-[160px] flex items-center justify-center gap-2 bg-green-500 text-white py-3 px-8 rounded-xl font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all shadow-lg shadow-green-100"
                    >
                      <CheckCircle size={14} /> Finish Work
                    </button>
                  ) : (
                    <div className="w-full md:w-auto text-center py-3 px-8 bg-gray-100 text-gray-400 rounded-xl font-black text-[10px] uppercase tracking-widest border border-gray-200">
                      Work Completed
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}