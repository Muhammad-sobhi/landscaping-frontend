import React, { useState } from 'react';
import { X } from 'lucide-react';
import api from '../api/axios'; // Import our stable axios instance

export default function AddJobModal({ isOpen, onClose, onJobAdded }) {
  // 1. Create state for the form fields
  const [formData, setFormData] = useState({
    name: '',
    service_type: 'Lawn Mowing',
    scheduled_at: ''
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  // 2. Handle the POST request
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Send data to your Laravel 'leads' or 'jobs' endpoint
      const response = await api.post('/leads', {
        name: formData.name,
        service: formData.service_type,
        scheduled_at: formData.scheduled_at,
        status: 'new'
      });

      alert('Job Created Successfully!');
      onJobAdded(); // Refresh the dashboard list
      onClose();    // Close the sidebar
    } catch (error) {
      console.error("Error creating job:", error);
      alert("Failed to save job. Check your Laravel server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="fixed inset-y-0 right-0 pl-10 max-w-full flex">
        <div className="w-screen max-w-md">
          <form onSubmit={handleSubmit} className="h-full flex flex-col bg-white shadow-2xl rounded-l-3xl">
            
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-xl font-bold">Add New Job</h2>
              <button type="button" onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full"><X size={20}/></button>
            </div>

            <div className="p-6 space-y-6 flex-1">
              <div>
                <label className="block text-sm font-semibold mb-2">Customer Name</label>
                <input 
                  required
                  type="text" 
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-green-500" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Service Type</label>
                <select 
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none bg-white"
                  value={formData.service_type}
                  onChange={(e) => setFormData({...formData, service_type: e.target.value})}
                >
                  <option>Lawn Mowing</option>
                  <option>Garden Cleanup</option>
                  <option>Mulching</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Scheduled Date</label>
                <input 
                  type="date" 
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none" 
                  value={formData.scheduled_at}
                  onChange={(e) => setFormData({...formData, scheduled_at: e.target.value})}
                />
              </div>
            </div>

            <div className="p-6 border-t bg-gray-50 rounded-bl-3xl">
              <button 
                disabled={loading}
                type="submit" 
                className="w-full bg-green-600 text-white font-bold py-4 rounded-2xl hover:bg-green-700 disabled:opacity-50 transition-all shadow-lg shadow-green-200"
              >
                {loading ? 'Saving...' : 'Create Job'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}