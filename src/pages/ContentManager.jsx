import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Save, Plus, Trash2, Trees, Image as ImageIcon, CheckCircle2, Upload, Edit3, FileText, Globe, Share2 } from 'lucide-react';
import AddServiceModal from '../components/AddServiceModal';
import PortfolioModal from '../components/PortfolioModal';

export default function ContentManager() {
    const BASE_URL = import.meta.env.VITE_API_BASE_URL.replace('/api', '');

    const [services, setServices] = useState([]);
    const [portfolio, setPortfolio] = useState([]);
    const [partners, setPartners] = useState([]);
    const [settings, setSettings] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
    const [isPortfolioModalOpen, setIsPortfolioModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    const loadPageData = async () => {
        try {
            // FIXED: Added partRes to the destructuring and added partners to Promise.all
            const [servRes, portRes, settRes, partRes] = await Promise.all([
                api.get('/services'),
                api.get('/portfolio'),
                api.get('/settings'),
                api.get('/partners')
            ]);

            setServices(servRes.data);
            setPortfolio(portRes.data);
            setPartners(partRes.data);

            if (Array.isArray(settRes.data)) {
                const flattened = {};
                settRes.data.forEach(item => {
                    flattened[item.key] = item.value;
                });
                setSettings(flattened);
            } else {
                setSettings(settRes.data);
            }
        } catch (err) {
            console.error("Failed to load landing page content", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPageData();
    }, []);

    // --- LOGO HANDLERS ---
    const handleAddPartnerLogo = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);
        formData.append('name', file.name);

        try {
            setSaving(true);
            await api.post('/partners', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            await loadPageData();
        } catch (err) {
            alert("Failed to upload logo.");
        } finally {
            setSaving(false);
        }
    };

    const handleDeletePartner = async (id) => {
        if (!window.confirm("Remove this partner logo?")) return;
        try {
            await api.delete(`/partners/${id}`);
            setPartners(partners.filter(p => p.id !== id));
        } catch (err) {
            alert("Error deleting logo.");
        }
    };

    // --- IMAGE PREVIEW HANDLERS ---
    const handleAboutImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setSettings({ 
            ...settings, 
            about_image_preview: URL.createObjectURL(file), 
            about_image_file: file 
        });
    };

    const handleExtraImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setSettings({ 
            ...settings, 
            about_extra_preview: URL.createObjectURL(file), 
            about_extra_file: file 
        });
    };

    // --- SETTINGS SAVE HANDLER ---
    const handleSaveSettings = async () => {
        setSaving(true);
        try {
            const formData = new FormData();
            
            if (settings.about_image_file) formData.append('about_image', settings.about_image_file);
            if (settings.about_extra_file) formData.append('about_extra_image', settings.about_extra_file);

            const cleanedSettings = { ...settings };
            const toDelete = [
                'about_image_preview', 'about_image_file', 'about_image_path',
                'about_extra_preview', 'about_extra_file', 'about_extra_image_path',
                'logo_path'
            ];
            toDelete.forEach(key => delete cleanedSettings[key]);

            formData.append('settings', JSON.stringify(cleanedSettings));

            await api.post('/settings', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            alert("Website content updated successfully!");
            await loadPageData(); 
        } catch (err) {
            alert("Failed to save settings.");
        } finally {
            setSaving(false);
        }
    };

    // --- SERVICE/PORTFOLIO HANDLERS ---
    const handleDeleteService = async (id) => {
        if (!window.confirm("Delete service?")) return;
        try {
            await api.delete(`/services/${id}`);
            setServices(services.filter(s => s.id !== id));
        } catch (err) {
            alert("Error deleting service.");
        }
    };

    const handleDeletePortfolio = async (id) => {
        if (!window.confirm("Remove from portfolio?")) return;
        try {
            await api.delete(`/portfolio/${id}`);
            setPortfolio(portfolio.filter(p => p.id !== id));
        } catch (err) {
            alert("Error deleting portfolio item.");
        }
    };

    if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;

    return (
        <div className="p-4 md:p-8 pt-20 lg:pt-8 space-y-10 max-w-7xl mx-auto">
            
            <AddServiceModal isOpen={isServiceModalOpen} onClose={() => setIsServiceModalOpen(false)} onRefresh={loadPageData} />
            <PortfolioModal isOpen={isPortfolioModalOpen} onClose={() => { setIsPortfolioModalOpen(false); setEditingItem(null); }} onRefresh={loadPageData} editItem={editingItem} />

            <header>
                <h1 className="text-2xl md:text-3xl font-black text-gray-900 uppercase tracking-tighter">Landing Page Editor</h1>
            </header>

            {/* SOCIAL MEDIA */}
            <section className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3 mb-8">
                    <Share2 className="text-blue-600" size={20}/> 
                    <h2 className="text-sm font-black uppercase tracking-widest text-gray-400">Social Media Links</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {['instagram', 'facebook', 'linkedin'].map(platform => (
                        <div key={platform}>
                            <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 px-1 tracking-widest">{platform} URL</label>
                            <input 
                                className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-500 font-bold"
                                value={settings[`social_${platform}`] || ''} 
                                onChange={e => setSettings({...settings, [`social_${platform}`]: e.target.value})}
                            />
                        </div>
                    ))}
                </div>
            </section>

            {/* PARTNER LOGOS */}
            <section className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-3">
                        <Globe className="text-purple-600" size={20}/>
                        <h2 className="text-sm font-black uppercase tracking-widest text-gray-400">Partner Logos</h2>
                    </div>
                    <label className="bg-black text-white px-4 py-2 rounded-xl font-black text-[10px] uppercase flex items-center gap-2 cursor-pointer hover:bg-gray-800">
                        <Plus size={14}/> Add Logo
                        <input type="file" className="hidden" onChange={handleAddPartnerLogo} accept="image/*" />
                    </label>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {partners.map(partner => (
                        <div key={partner.id} className="group relative p-4 border border-gray-100 rounded-2xl flex items-center justify-center bg-gray-50 h-24">
                            <img src={`${BASE_URL}/storage/${partner.image_path}`} alt={partner.name} className="h-full object-contain" />
                            <button onClick={() => handleDeletePartner(partner.id)} className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-all">
                                <Trash2 size={12}/>
                            </button>
                        </div>
                    ))}
                </div>
            </section>

            {/* SERVICES */}
            <section className="space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-sm font-black uppercase tracking-widest text-gray-400">Services</h2>
                    <button onClick={() => setIsServiceModalOpen(true)} className="bg-green-600 text-white px-4 py-2 rounded-xl font-black text-[10px] uppercase flex items-center gap-2">
                        <Plus size={14}/> Add Service
                    </button>
                </div>
                <div className="grid grid-cols-1 gap-4">
                    {services.map(service => (
                        <div key={service.id} className="bg-white p-6 rounded-[2rem] border border-gray-100 flex items-center justify-between shadow-sm">
                            <div className="flex items-center gap-6">
                                <Trees className="text-green-600" size={24}/>
                                <div>
                                    <h3 className="font-bold text-lg">{service.title}</h3>
                                    <p className="text-sm text-gray-500">{service.description}</p>
                                </div>
                            </div>
                            <button onClick={() => handleDeleteService(service.id)} className="p-2 text-gray-300 hover:text-red-500">
                                <Trash2 size={20}/>
                            </button>
                        </div>
                    ))}
                </div>
            </section>

            {/* ABOUT US */}
            <section className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3 mb-8">
                    <CheckCircle2 className="text-green-600" size={20}/>
                    <h2 className="text-sm font-black uppercase tracking-widest text-gray-400">About Us & Stats</h2>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    <div className="space-y-6">
                        <input className="w-full p-4 bg-gray-50 rounded-2xl font-bold" placeholder="About Title" value={settings.about_title || ''} onChange={e => setSettings({...settings, about_title: e.target.value})} />
                        <textarea className="w-full p-4 bg-gray-50 rounded-2xl min-h-[150px]" placeholder="Main Description" value={settings.about_description || ''} onChange={e => setSettings({...settings, about_description: e.target.value})} />
                        <div className="grid grid-cols-3 gap-4">
                            {['years', 'projects', 'team'].map(s => (
                                <input key={s} className="p-3 bg-gray-50 rounded-xl font-black text-green-600 text-center" placeholder={s} value={settings[`stat_${s}`] || ''} onChange={e => setSettings({...settings, [`stat_${s}`]: e.target.value})} />
                            ))}
                        </div>
                    </div>
                    
                    <div className="space-y-6">
                        <div className="aspect-video relative rounded-3xl overflow-hidden bg-gray-50 border-2 border-dashed border-gray-200">
                            {(settings.about_image_preview || settings.about_image_path) && (
                                <img src={settings.about_image_preview || `${BASE_URL}/storage/${settings.about_image_path}`} className="w-full h-full object-cover" />
                            )}
                            <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 cursor-pointer transition-all">
                                <span className="text-white font-black uppercase text-xs">Change Main Image</span>
                                <input type="file" className="hidden" onChange={handleAboutImageUpload} />
                            </label>
                        </div>
                        
                        <div className="p-4 bg-green-50 rounded-2xl space-y-4">
                            <label className="block text-[10px] font-black uppercase text-green-700 tracking-widest">Extra Details Section</label>
                            <textarea className="w-full p-3 bg-white rounded-xl text-sm" placeholder="Extra info text..." value={settings.about_extra_text || ''} onChange={e => setSettings({...settings, about_extra_text: e.target.value})} />
                            <div className="aspect-video relative rounded-xl overflow-hidden bg-white border border-green-100">
                                {(settings.about_extra_preview || settings.about_extra_image_path) && (
                                    <img src={settings.about_extra_preview || `${BASE_URL}/storage/${settings.about_extra_image_path}`} className="w-full h-full object-cover" />
                                )}
                                <label className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 cursor-pointer">
                                    <Upload className="text-white" />
                                    <input type="file" className="hidden" onChange={handleExtraImageUpload} />
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="mt-8 flex justify-end">
                    <button onClick={handleSaveSettings} disabled={saving} className="bg-black text-white px-8 py-3 rounded-xl font-black uppercase text-xs hover:bg-green-600 transition-all">
                        {saving ? 'Saving...' : 'Save All Settings'}
                    </button>
                </div>
            </section>
        </div>
    );
}