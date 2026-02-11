import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Save, Plus, Trash2, Trees, Image as ImageIcon, CheckCircle2, Upload, Edit3, Handshake, Globe, Type } from 'lucide-react'; 
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
                api.get('/settings')
            ]);

            setServices(servRes.data);
            setPortfolio(portRes.data);

            let flattened = {};
            if (Array.isArray(settRes.data)) {
                settRes.data.forEach(item => { flattened[item.key] = item.value; });
            } else {
                flattened = settRes.data;
            }
            
            setSettings(flattened);

            // Extract Partners from settings JSON string
            if (flattened.partner_logos) {
                try {
                    setPartners(JSON.parse(flattened.partner_logos));
                } catch (e) {
                    console.error("Error parsing partner logos", e);
                    setPartners([]);
                }
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

    // Partner Actions (Using Settings Controller)
    const handleAddPartner = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('partner_logo', file); 
        formData.append('name', 'Partner Logo');

        try {
            setSaving(true);
            await api.post('/settings', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            await loadPageData();
        } catch (err) {
            alert("Failed to upload partner logo.");
        } finally {
            setSaving(false);
        }
    };

    const handleDeletePartner = async (id) => {
        // 1. Remove the logo from our local list
        const updatedPartners = partners.filter(p => p.id !== id);
        
        try {
            // 2. Prepare the data exactly how your backend "Update" route likes it
            const payload = {
                partner_logos: JSON.stringify(updatedPartners)
            };
    
            // 3. Use your standard update route (which you said exists)
            await api.post('/landing-page/settings', payload); 
            
            // 4. Update the screen so the logo disappears immediately
            setPartners(updatedPartners);
            alert("Partner removed and settings updated!");
        } catch (err) {
            console.error("Save error:", err);
            alert("Failed to update partners.");
        }
    };

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
            about_extra_image_preview: previewUrl,
            about_extra_image_file: file
        });
    };

    const handleSaveSettings = async () => {
        setSaving(true);
        try {
            const formData = new FormData();
            
            // Handle main image file
            if (settings.about_image_file) {
                formData.append('about_image', settings.about_image_file);
            }

            // Handle extra image file
            if (settings.about_extra_image_file) {
                formData.append('about_extra_image', settings.about_extra_image_file);
            }

            // Cleanup protected/temp keys
            const cleanedSettings = { ...settings };
            const toDelete = [
                'about_image_preview', 'about_image_file', 'about_image_path',
                'about_extra_image_preview', 'about_extra_image_file', 'about_extra_image_path',
                'logo_path', 'partner_logos'
            ];
            toDelete.forEach(key => delete cleanedSettings[key]);

            formData.append('settings', JSON.stringify(cleanedSettings));
            
            await api.post('/settings', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
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
                            No services found.
                        </div>
                    )}
                </div>
            </section>

            {/* 2. ABOUT US, STATS & SOCIAL */}
            <section className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm relative overflow-hidden">
                <div className="flex items-center gap-3 mb-8">
                    <div className="bg-green-100 p-2 rounded-xl text-green-600"><CheckCircle2 size={20}/></div>
                    <h2 className="text-sm font-black uppercase tracking-widest text-gray-400">About Us, Stats & Social</h2>
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

                        {/* SOCIAL MEDIA SECTION */}
                        <div className="space-y-3 pt-4 border-t border-gray-50">
                            <label className="block text-[10px] font-black uppercase text-gray-400 px-1 tracking-widest flex items-center gap-2">
                                <Globe size={12}/> Social Media Links
                            </label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {['Facebook', 'Instagram', 'Twitter', 'LinkedIn'].map(platform => (
                                    <div key={platform} className="bg-gray-50 p-3 rounded-xl flex items-center gap-3">
                                        <p className="text-[9px] font-black text-green-600 uppercase w-16">{platform}</p>
                                        <input
                                            className="w-full bg-transparent border-none p-0 text-xs text-gray-600 focus:ring-0"
                                            placeholder="URL..."
                                            value={settings[`social_${platform.toLowerCase()}`] || ''}
                                            onChange={e => setSettings({...settings, [`social_${platform.toLowerCase()}`]: e.target.value})}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="block text-[10px] font-black uppercase text-gray-400 px-1 tracking-widest">Core Values</label>
                            {['Excellence', 'Community', 'Sustainability', 'Trust'].map(value => (
                                <div key={value} className="bg-gray-50 p-4 rounded-2xl">
                                    <p className="text-[10px] font-black text-green-600 uppercase mb-1">{value}</p>
                                    <input
                                        className="w-full bg-transparent border-none p-0 text-sm text-gray-600 focus:ring-0"
                                        placeholder={`Enter description...`}
                                        value={settings[`value_${value.toLowerCase()}`] || ''}
                                        onChange={e => setSettings({...settings, [`value_${value.toLowerCase()}`]: e.target.value})}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col space-y-6">
                        {/* MAIN IMAGE SECTION */}
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

                        {/* MAIN BIO SECTION */}
                        <div className="flex-1 flex flex-col">
                            <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 px-1 tracking-widest">Main Company Bio</label>
                            <textarea
                                className="w-full flex-1 p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-green-500 text-sm leading-relaxed text-gray-600 resize-none min-h-[120px]"
                                value={settings.about_description || ''}
                                onChange={e => setSettings({...settings, about_description: e.target.value})}
                            />
                        </div>

                        {/* EXTRA SECTION (RESTORED) */}
                        <div className="pt-6 border-t border-gray-100 space-y-6">
                            <div>
                                <label className="block text-[10px] font-black uppercase text-green-600 mb-2 px-1 tracking-widest">Extra Section Image</label>
                                <div className="relative group aspect-[21/9] rounded-2xl overflow-hidden border-2 border-dashed border-green-100 bg-green-50/30 flex items-center justify-center">
                                    {settings.about_extra_image_preview || settings.about_extra_image_path ? (
                                        <img
                                            src={settings.about_extra_image_preview || `${BASE_URL}/storage/${settings.about_extra_image_path}?t=${new Date().getTime()}`}
                                            className="w-full h-full object-cover"
                                            alt="Extra section"
                                        />
                                    ) : (
                                        <ImageIcon className="text-green-200" size={32} />
                                    )}
                                    <label className="absolute inset-0 bg-green-900/20 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center cursor-pointer">
                                        <div className="bg-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase flex items-center gap-2 shadow-md">
                                            <Upload size={12}/> Upload Extra Image
                                        </div>
                                        <input type="file" className="hidden" onChange={handleExtraImageUpload} accept="image/*" />
                                    </label>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase text-green-600 mb-2 px-1 tracking-widest">Extra Section Text (Italicized)</label>
                                <div className="relative">
                                    <Type className="absolute top-4 left-4 text-green-200" size={16}/>
                                    <textarea
                                        className="w-full p-4 pl-12 bg-green-50/30 rounded-2xl border-none focus:ring-2 focus:ring-green-500 text-sm italic text-gray-600 resize-none h-24"
                                        placeholder="Enter extra closing remarks..."
                                        value={settings.about_extra_text || ''}
                                        onChange={e => setSettings({...settings, about_extra_text: e.target.value})}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-10 flex justify-end">
                    <button
                        onClick={handleSaveSettings}
                        disabled={saving}
                        className="bg-gray-900 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-green-600 transition-all shadow-xl flex items-center gap-2"
                    >
                        <Save size={16}/> {saving ? 'Saving...' : 'Update Settings'}
                    </button>
                </div>
            </section>

            {/* 3. PARTNERS SECTION */}
            <section className="bg-gray-50 rounded-[2.5rem] p-8 border border-gray-200">
                <div className="flex justify-between items-center mb-6 px-2">
                    <div className="flex items-center gap-3">
                        <div className="bg-white p-2 rounded-xl text-gray-900 shadow-sm"><Handshake size={20}/></div>
                        <h2 className="text-sm font-black uppercase tracking-widest text-gray-400">Our Partners</h2>
                    </div>
                    <label className="bg-white text-gray-900 px-4 py-2 rounded-xl font-black text-[10px] uppercase flex items-center gap-2 shadow-sm hover:bg-gray-100 transition-all cursor-pointer">
                        <Plus size={14}/> Add Partner Logo
                        <input type="file" className="hidden" onChange={handleAddPartner} accept="image/*" />
                    </label>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {partners.map(partner => (
                        <div key={partner.id} className="bg-white p-4 rounded-2xl border border-gray-100 relative group aspect-square flex items-center justify-center">
                            <img 
                                src={`${BASE_URL}/storage/${partner.path}`} 
                                className="max-h-full max-w-full object-contain grayscale group-hover:grayscale-0 transition-all"
                                alt="Partner"
                            />
                            <button 
                                onClick={() => handleDeletePartner(partner.id)}
                                className="absolute top-2 right-2 p-1.5 bg-red-50 text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white"
                            >
                                <Trash2 size={14}/>
                            </button>
                        </div>
                    ))}
                    {partners.length === 0 && (
                        <div className="col-span-full py-10 text-center text-gray-400 font-bold uppercase text-[10px] tracking-widest">
                            No partner logos uploaded yet
                        </div>
                    )}
                </div>
            </section>

            {/* 4. PORTFOLIO GALLERY */}
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