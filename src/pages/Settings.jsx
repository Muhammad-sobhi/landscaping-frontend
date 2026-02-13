import React, { useState, useEffect } from 'react';
import { Building2, Percent, Save, CheckCircle, Upload, Image as ImageIcon, DollarSign } from 'lucide-react';
import api from '../api/axios';

export default function Settings() {
  // Live Backend URL
  const BASE_URL = import.meta.env.VITE_API_BASE_URL.replace('/api', '');

  const [settings, setSettings] = useState({
    project_name: '',
    tax_rate: 0,
    currency: 'USD'
  });
  const [logoFile, setLogoFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.get('/settings').then(res => {
      setSettings({
        project_name: res.data.project_name || '',
        tax_rate: res.data.tax_rate || 0,
        currency: res.data.currency || 'USD'
      });
      
      if (res.data.logo_path) {
        // UPDATED: Pointing to the live storage folder instead of localhost
        setPreviewUrl(`${BASE_URL}/storage/${res.data.logo_path}`);
      }
      setLoading(false);
    });
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLogoFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const formData = new FormData();
  
    // Send as individual settings[key] format. 
    // Laravel automatically parses this into an array in $request->input('settings')
    formData.append('settings[project_name]', settings.project_name);
    formData.append('settings[tax_rate]', settings.tax_rate);
    formData.append('settings[currency]', settings.currency);
  
    if (logoFile) formData.append('logo', logoFile);
  
    try {
      await api.post('/settings', formData);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      alert("Save failed");
    }
};

  if (loading) return <div className="p-20 text-center animate-pulse font-black text-gray-400 uppercase text-xs tracking-widest">Loading Settings...</div>;

  return (
    <div className="max-w-4xl mx-auto pb-20 px-4">
      <header className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">System Settings</h1>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Configure your business defaults</p>
      </header>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Business Profile */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-green-100 text-green-600 rounded-2xl"><Building2 size={20}/></div>
            <h3 className="text-sm font-black uppercase tracking-widest">Business Profile</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Company Name</label>
                <input 
                    type="text" 
                    className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50 font-bold focus:ring-2 ring-green-500/20 outline-none transition-all" 
                    value={settings.project_name} 
                    onChange={(e) => setSettings({...settings, project_name: e.target.value})} 
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Company Logo</label>
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-200 rounded-[2rem] cursor-pointer hover:bg-gray-50 transition-all group">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="text-gray-300 group-hover:text-green-500 mb-2 transition-colors" size={24} />
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Upload PNG or JPG</p>
                    </div>
                    <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                </label>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center bg-gray-50 rounded-[2rem] border border-gray-100 p-6">
                <p className="text-[10px] font-black text-gray-400 uppercase mb-4 tracking-widest">Logo Preview</p>
                {previewUrl ? (
                  <img src={previewUrl} className="max-h-32 object-contain" alt="Logo Preview" />
                ) : (
                  <ImageIcon size={48} className="text-gray-200" />
                )}
            </div>
          </div>
        </div>

        {/* Financial Configuration */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-indigo-100 text-indigo-600 rounded-2xl"><DollarSign size={20}/></div>
            <h3 className="text-sm font-black uppercase tracking-widest">Financial Defaults</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Default Tax Rate (%)</label>
              <div className="relative">
                <Percent className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input 
                  type="number" 
                  step="0.01"
                  className="w-full pl-12 pr-5 py-4 rounded-2xl border border-gray-100 bg-gray-50 font-black focus:ring-2 ring-indigo-500/20 outline-none" 
                  value={settings.tax_rate} 
                  onChange={(e) => setSettings({...settings, tax_rate: parseFloat(e.target.value) || 0})} 
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Currency Code</label>
              <input 
                type="text" 
                className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50 font-black focus:ring-2 ring-indigo-500/20 outline-none uppercase" 
                value={settings.currency} 
                onChange={(e) => setSettings({...settings, currency: e.target.value})} 
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end items-center gap-4">
          {saved && (
            <div className="flex items-center gap-2 text-green-600 font-black text-[10px] uppercase tracking-widest animate-in fade-in slide-in-from-right-4">
              <CheckCircle size={16} /> Settings Saved
            </div>
          )}
          <button type="submit" className="bg-gray-900 text-white px-10 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-gray-800 transition-all shadow-xl active:scale-95">
            <Save size={18} /> Save All Changes
          </button>
        </div>
      </form>
    </div>
  );
}