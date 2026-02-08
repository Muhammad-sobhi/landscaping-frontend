import React from 'react';
import { useDashboard } from '../hooks/useDashboard';
import { Calendar, Clock, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { operations, loading } = useDashboard();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    /* Responsive Fixes: 
       1. Added 'pt-20 lg:pt-8' to prevent the Mobile Menu button from overlapping the title.
       2. Changed 'p-6' to 'p-4 md:p-8' for better mobile edges.
    */
    <div className="p-4 md:p-8 pt-20 lg:pt-8 space-y-6 md:space-y-8 max-w-7xl mx-auto">
      
      {/* Header Area */}
      <header>
        <h1 className="text-2xl md:text-3xl font-black text-gray-900">
          Operations
        </h1>
        <p className="text-sm text-gray-500 mt-1">Manage your daily workflow</p>
      </header>

      {/* Grid Fix: 
          'grid-cols-1' is default (Mobile).
          'lg:grid-cols-2' triggers for Desktop.
      */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        
        {/* Column 1: Today's Schedule */}
        <div className="bg-white rounded-2xl md:rounded-3xl p-5 md:p-6 border border-gray-100 shadow-sm flex flex-col">
          <h2 className="text-base md:text-lg font-bold flex items-center gap-2 mb-4 md:mb-6">
            <Calendar className="text-green-600 w-5 h-5" /> 
            Today's Schedule
          </h2>
          
          <div className="space-y-3">
            {operations.todays_schedule?.length > 0 ? (
              operations.todays_schedule.map(job => (
                <div 
                  key={job.id} 
                  onClick={() => navigate(`/jobs/${job.id}`)} 
                  className="flex justify-between items-center p-4 bg-gray-50 rounded-xl md:rounded-2xl hover:bg-green-50 active:scale-[0.98] cursor-pointer transition-all border border-transparent hover:border-green-100"
                >
                  <div className="pr-2 truncate">
                    <p className="font-bold text-sm md:text-base text-gray-800 truncate">
                      {job.lead?.full_name}
                    </p>
                    <p className="text-xs text-gray-500 truncate mt-0.5">
                      {job.lead?.address}
                    </p>
                  </div>
                  <div className="flex-shrink-0 bg-white p-1.5 rounded-full shadow-sm">
                    <ArrowRight size={14} className="text-green-600" />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-400 text-center py-4 italic">No jobs scheduled for today.</p>
            )}
          </div>
        </div>

        {/* Column 2: Recent Jobs / Activity */}
        <div className="bg-gray-900 text-white rounded-2xl md:rounded-3xl p-5 md:p-6 shadow-xl">
          <h2 className="text-base md:text-lg font-bold flex items-center gap-2 mb-4 md:mb-6">
            <Clock className="text-green-400 w-5 h-5" /> 
            Recent Activity
          </h2>
          
          <div className="divide-y divide-gray-800">
            {operations.recent_jobs?.length > 0 ? (
              operations.recent_jobs.map(job => (
                <div 
                  key={job.id} 
                  className="py-3 md:py-4 flex justify-between items-center group cursor-default"
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-medium group-hover:text-green-400 transition-colors">
                      {job.lead?.full_name}
                    </span>
                    <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">
                      Completed
                    </span>
                  </div>
                  <span className="text-sm font-mono font-bold text-green-400 bg-green-400/10 px-3 py-1 rounded-lg">
                    ${job.price}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-4 italic">No recent activity.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}