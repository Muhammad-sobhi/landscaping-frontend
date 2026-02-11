import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Save, Plus, Trash2, Trees, Image as ImageIcon, CheckCircle2, Upload, Edit3, FileText,Globe, Share2 } from 'lucide-react';
import AddServiceModal from '../components/AddServiceModal';
import PortfolioModal from '../components/PortfolioModal';

export default function ContentManager() {
    // Live Backend URL
    const BASE_URL = import.meta.env.VITE_API_BASE_URL.replace('/api', '');

    const [services, setServices] = useState([]);
    const [portfolio, setPortfolio] = useState([]);
    const [partners, setPartners] = useState([]);
    const [settings, setSettings] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    // Modals State
    const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
    const [isPortfolioModalOpen, setIsPortfolioModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    const loadPageData = async () => {
        try {
            const [servRes, portRes, settRes] = await Promise.all([
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

    const handleAboutImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const previewUrl = URL.createObjectURL(file);
        setSettings({ 
            ...settings, 
            about_image_preview: previewUrl, 
            about_image_file: file 
        });
    };

    // NEW: Handle Extra Image Upload
    const handleExtraImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const previewUrl = URL.createObjectURL(file);
        setSettings({ 
            ...settings, 
            about_extra_preview: previewUrl, 
            about_extra_file: file 
        });
    };

    const handleSaveSettings = async () => {
        setSaving(true);
        try {
            const formData = new FormData();
            
            // Handle Main Image
            if (settings.about_image_file) {
                formData.append('about_image', settings.about_image_file);
            }

            // NEW: Handle Extra Image
            if (settings.about_extra_file) {
                formData.append('about_extra_image', settings.about_extra_file);
            }

            const cleanedSettings = { ...settings };
            
            // Clean up all local preview/file state and protected paths before sending JSON
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

            // Clean up blob URLs to prevent memory leaks
            if (settings.about_image_preview) URL.revokeObjectURL(settings.about_image_preview);
            if (settings.about_extra_preview) URL.revokeObjectURL(settings.about_extra_preview);

            alert("Website content updated successfully!");
            await loadPageData(); 
        } catch (err) {
            console.error("Save Error:", err.response?.data || err.message);
            alert("Failed to save settings.");
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteService = async (id) => {
        if (!window.confirm("Are you sure you want to delete this service?")) return;
        try {
            await api.delete(`/services/${id}`);
            setServices(services.filter(s => s.id !== id));
        } catch (err) {
            alert("Error deleting service.");
        }
    };

    const handleDeletePortfolio = async (id) => {
        if (!window.confirm("Remove this item from your portfolio?")) return;
        try {
            await api.delete(`/portfolio/${id}`);
            setPortfolio(portfolio.filter(p => p.id !== id));
        } catch (err) {
            alert("Error deleting portfolio item.");
        }
    };

    const openEditPortfolio = (item) => {
        setEditingItem(item);
        setIsPortfolioModalOpen(true);
    };

    const openAddPortfolio = () => {
        setEditingItem(null);
        setIsPortfolioModalOpen(true);
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="animate-pulse font-black text-gray-300 text-2xl uppercase tracking-tighter">
                Loading Content...
            </div>
        </div>
    );

    return (
        <div className="p-4 md:p-8 pt-20 lg:pt-8 space-y-10 max-w-7xl mx-auto">
            
            <AddServiceModal 
                isOpen={isServiceModalOpen} 
                onClose={() => setIsServiceModalOpen(false)} 
                onRefresh={loadPageData} 
            />

            <PortfolioModal 
                isOpen={isPortfolioModalOpen} 
                onClose={() => {
                    setIsPortfolioModalOpen(false);
                    setEditingItem(null);
                }} 
                onRefresh={loadPageData}
                editItem={editingItem}
            />

            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-gray-900 uppercase tracking-tighter">Landing Page Editor</h1>
                    <p className="text-sm text-gray-500 mt-1">Directly control the public-facing website content</p>
                </div>
            </header>
           {/* SOCIAL MEDIA SECTION */}
<section className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
    <div className="flex items-center gap-3 mb-8">
        <div className="bg-blue-100 p-2 rounded-xl text-blue-600">
            <Share2 size={20}/> 
        </div>
        <h2 className="text-sm font-black uppercase tracking-widest text-gray-400">Social Media Links</h2>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
            <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 px-1 tracking-widest">Instagram URL</label>
            <input 
                className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-500 font-bold text-gray-800"
                value={settings.social_instagram || ''} 
                onChange={e => setSettings({...settings, social_instagram: e.target.value})}
            />
        </div>
        <div>
            <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 px-1 tracking-widest">Facebook URL</label>
            <input 
                className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-500 font-bold text-gray-800"
                value={settings.social_facebook || ''} 
                onChange={e => setSettings({...settings, social_facebook: e.target.value})}
            />
        </div>
        <div>
            <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 px-1 tracking-widest">LinkedIn URL</label>
            <input 
                className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-500 font-bold text-gray-800"
                value={settings.social_linkedin || ''} 
                onChange={e => setSettings({...settings, social_linkedin: e.target.value})}
            />
        </div>
    </div>
</section>
            {/* --- NEW SECTION: PARTNER LOGOS --- */}
            <section className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-3">
                        <div className="bg-purple-100 p-2 rounded-xl text-purple-600"><Globe size={20}/></div>
                        <h2 className="text-sm font-black uppercase tracking-widest text-gray-400">Trusted Partner Logos</h2>
                    </div>
                    <button className="bg-black text-white px-4 py-2 rounded-xl font-black text-[10px] uppercase flex items-center gap-2">
                        <Plus size={14}/> Add Logo
                    </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {partners.map(partner => (
                        <div key={partner.id} className="group relative p-4 border border-gray-100 rounded-2xl flex items-center justify-center bg-gray-50">
                            <img src={`${BASE_URL}/storage/${partner.image_path}`} alt={partner.name} className="h-8 object-contain" />
                            <button className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-all">
                                <Trash2 size={12}/>
                            </button>
                        </div>
                    ))}
                </div>
            </section>    


            {/* 1. SERVICES MANAGER */}
            <section className="space-y-6">
                <div className="flex justify-between items-center px-2">
                    <h2 className="text-sm font-black uppercase tracking-widest text-gray-400">Services Manager</h2>
                    <button 
                        onClick={() => setIsServiceModalOpen(true)}
                        className="bg-green-600 text-white px-4 py-2 rounded-xl font-black text-[10px] uppercase flex items-center gap-2 shadow-lg hover:bg-green-700 transition-all"
                    >
                        <Plus size={14}/> Add New Service
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {services.length > 0 ? services.map(service => (
                        <div key={service.id} className="bg-white p-6 rounded-[2rem] border border-gray-100 flex items-center justify-between group hover:border-green-200 transition-all shadow-sm">
                            <div className="flex items-center gap-6">
                                <div className="bg-green-50 p-4 rounded-2xl text-green-600">
                                    <Trees size={24}/>
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-gray-900">{service.title}</h3>
                                    <p className="text-sm text-gray-500 mb-2">{service.description}</p>
                                    <div className="flex flex-wrap gap-2">
                                        {(Array.isArray(service.tags) ? service.tags : JSON.parse(service.tags || "[]")).map((tag, i) => (
                                            <span key={i} className="text-[9px] font-black uppercase bg-gray-100 text-gray-600 px-2.5 py-1 rounded-md">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => handleDeleteService(service.id)} className="p-2 text-gray-300 hover:text-red-500 transition-colors">
                                <Trash2 size={20}/>
                            </button>
                        </div>
                    )) : (
                        <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-[2rem] p-12 text-center text-gray-400 font-bold uppercase text-xs">
                            No services found. Click "Add New Service" to begin.
                        </div>
                    )}
                </div>
            </section>

            {/* 2. ABOUT US & STATS */}
            <section className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm relative overflow-hidden">
                <div className="flex items-center gap-3 mb-8">
                    <div className="bg-green-100 p-2 rounded-xl text-green-600"><CheckCircle2 size={20}/></div>
                    <h2 className="text-sm font-black uppercase tracking-widest text-gray-400">About Us & Stats</h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 relative z-10">
                    <div className="space-y-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 px-1 tracking-widest">Main Headline</label>
                                <input 
                                    className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-green-500 font-bold text-gray-800"
                                    value={settings.about_title || ''} 
                                    onChange={e => setSettings({...settings, about_title: e.target.value})}
                                />
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                {['years', 'projects', 'team'].map(s => (
                                    <div key={s}>
                                        <label className="block text-[9px] font-black uppercase text-gray-400 mb-1 px-1">{s}</label>
                                        <input 
                                            className="w-full p-3 bg-gray-50 rounded-xl border-none font-black text-green-600 text-center"
                                            value={settings[`stat_${s}`] || ''}
                                            onChange={e => setSettings({...settings, [`stat_${s}`]: e.target.value})}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="block text-[10px] font-black uppercase text-gray-400 px-1 tracking-widest">Core Values & Descriptions</label>
                            {['Excellence', 'Community', 'Sustainability', 'Trust'].map(value => (
                                <div key={value} className="bg-gray-50 p-4 rounded-2xl">
                                    <p className="text-[10px] font-black text-green-600 uppercase mb-1">{value}</p>
                                    <input 
                                        className="w-full bg-transparent border-none p-0 text-sm text-gray-600 focus:ring-0"
                                        placeholder={`Enter description for ${value}...`}
                                        value={settings[`value_${value.toLowerCase()}`] || ''}
                                        onChange={e => setSettings({...settings, [`value_${value.toLowerCase()}`]: e.target.value})}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col space-y-6">
                        <div>
                            <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 px-1 tracking-widest">About Us Main Image</label>
                            <div className="relative group aspect-video rounded-3xl overflow-hidden border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center">
                                {settings.about_image_preview || settings.about_image_path ? (
                                   <img 
                                   src={settings.about_image_preview || `${BASE_URL}/storage/${settings.about_image_path}?t=${new Date().getTime()}`} 
                                   className="w-full h-full object-cover" 
                                   alt="About Us"
                               />
                                ) : (
                                    <ImageIcon className="text-gray-300" size={48} />
                                )}
                                <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center cursor-pointer">
                                    <div className="bg-white px-4 py-2 rounded-xl flex items-center gap-2 text-xs font-black uppercase">
                                        <Upload size={14} /> Change Image
                                    </div>
                                    <input type="file" className="hidden" onChange={handleAboutImageUpload} accept="image/*" />
                                </label>
                            </div>
                        </div>

                        {/* NEW EXTRA SECTION UI */}
                        <div className="p-6 bg-green-50/50 rounded-[2rem] border border-green-100/50 space-y-4">
                            <h3 className="text-[10px] font-black uppercase text-green-700 tracking-widest flex items-center gap-2">
                                <FileText size={14}/> Extra About Info
                            </h3>
                            <div className="grid grid-cols-1 gap-4">
                                <div className="relative group aspect-video rounded-2xl overflow-hidden border-2 border-dashed border-green-200 bg-white flex items-center justify-center">
                                    {settings.about_extra_preview || settings.about_extra_image_path ? (
                                        <img 
                                            src={settings.about_extra_preview || `${BASE_URL}/storage/${settings.about_extra_image_path}?t=${new Date().getTime()}`} 
                                            className="w-full h-full object-cover" 
                                            alt="Extra section image"
                                        />
                                    ) : (
                                        <Upload size={24} className="text-green-300" />
                                    )}
                                    <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center cursor-pointer">
                                        <span className="text-white text-[10px] font-black uppercase">Upload Image</span>
                                        <input type="file" className="hidden" onChange={handleExtraImageUpload} accept="image/*" />
                                    </label>
                                </div>
                                <textarea 
                                    placeholder="Add extra text details here (will appear below the extra image)..."
                                    className="w-full p-4 bg-white rounded-2xl border-none focus:ring-1 focus:ring-green-300 text-sm text-gray-600 resize-none min-h-[100px]"
                                    value={settings.about_extra_text || ''}
                                    onChange={e => setSettings({...settings, about_extra_text: e.target.value})}
                                />
                            </div>
                        </div>

                        <div className="flex-1 flex flex-col">
                            <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 px-1 tracking-widest">Main Company Bio</label>
                            <textarea 
                                className="w-full flex-1 p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-green-500 text-sm leading-relaxed text-gray-600 resize-none min-h-[200px]"
                                value={settings.about_description || ''} 
                                onChange={e => setSettings({...settings, about_description: e.target.value})}
                            />
                        </div>
                    </div>
                </div>

                <div className="mt-10 flex justify-end">
                    <button 
                        onClick={handleSaveSettings}
                        disabled={saving}
                        className="bg-gray-900 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-green-600 transition-all shadow-xl flex items-center gap-2"
                    >
                        <Save size={16}/> {saving ? 'Saving...' : 'Update All About Data'}
                    </button>
                </div>
            </section>

            {/* 3. PORTFOLIO GALLERY */}
            <section className="space-y-6 pb-20">
                 <div className="flex justify-between items-center px-2">
                    <h2 className="text-sm font-black uppercase tracking-widest text-gray-400">Portfolio Gallery</h2>
                    <button 
                        onClick={openAddPortfolio}
                        className="bg-green-600 text-white p-3 rounded-xl hover:shadow-lg transition-all hover:scale-110 active:scale-95"
                    >
                        <Plus size={20}/>
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {portfolio.map(item => (
                        <div key={item.id} className="bg-white p-4 rounded-[2rem] border border-gray-100 relative group overflow-hidden shadow-sm hover:shadow-md transition-all">
                            <div className="aspect-video w-full overflow-hidden rounded-2xl mb-4 bg-gray-100">
                                <img 
                                    src={`${BASE_URL}/storage/${item.image_path}`} 
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                                    alt={item.title} 
                                    onError={(e) => { e.target.src = 'https://via.placeholder.com/600x400?text=Work+Image'; }}
                                />
                            </div>
                            <div className="px-2 flex justify-between items-start">
                                <div>
                                    <h3 className="font-bold text-gray-900">{item.title}</h3>
                                    <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mt-1">{item.category}</p>
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                    <button 
                                        onClick={() => openEditPortfolio(item)}
                                        className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-green-600 hover:text-white transition-colors"
                                    >
                                        <Edit3 size={16}/>
                                    </button>
                                    <button 
                                        onClick={() => handleDeletePortfolio(item.id)}
                                        className="p-2 bg-gray-100 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-colors"
                                    >
                                        <Trash2 size={16}/>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}