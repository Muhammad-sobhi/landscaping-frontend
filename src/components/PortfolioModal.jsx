import React, { useState, useEffect } from 'react';
import { X, Upload, Star } from 'lucide-react';
import api from '../api/axios';

export default function PortfolioModal({ isOpen, onClose, onRefresh, editItem }) {
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('Residential');
    const [isFeatured, setIsFeatured] = useState(false);
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (editItem) {
            setTitle(editItem.title || '');
            setCategory(editItem.category || 'Residential');
            setIsFeatured(editItem.is_featured == 1 || editItem.is_featured === true);
        } else {
            setTitle('');
            setCategory('Residential');
            setIsFeatured(false);
        }
        setImage(null);
    }, [editItem, isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData();
        formData.append('title', title);
        formData.append('category', category);
        formData.append('is_featured', isFeatured ? 1 : 0);
        
        if (image) {
            formData.append('image', image);
        }

        try {
            if (editItem) {
                // Laravel requirement: Use POST with _method=PUT for file uploads
                formData.append('_method', 'PUT');
                await api.post(`/portfolio/${editItem.id}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                await api.post('/portfolio', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }
            
            onRefresh();
            onClose();
        } catch (err) {
            console.error("Portfolio Error Details:", err.response?.data);
            const errorMsg = err.response?.data?.message || "Internal Server Error";
            alert(`Failed to save: ${errorMsg}`);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl relative animate-in fade-in zoom-in duration-200">
                <button onClick={onClose} className="absolute top-6 right-6 text-gray-400 hover:text-gray-900 transition-colors">
                    <X size={24} />
                </button>

                <h2 className="text-xl font-black uppercase tracking-tighter mb-6">
                    {editItem ? 'Edit Portfolio Item' : 'Add New Work'}
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 px-1">Project Title</label>
                        <input 
                            className="w-full p-4 bg-gray-50 rounded-2xl border-none font-bold focus:ring-2 focus:ring-green-500"
                            placeholder="e.g. Modern Garden Design"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </div>
                    
                    <div>
                        <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 px-1">Category</label>
                        <select 
                            className="w-full p-4 bg-gray-50 rounded-2xl border-none font-bold text-gray-700 focus:ring-2 focus:ring-green-500"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                        >
                            <option value="Residential">Residential</option>
                            <option value="Commercial">Commercial</option>
                            <option value="Industrial">Industrial</option>
                            <option value="Maintenance">Maintenance</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 px-1">Project Image</label>
                        <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center relative hover:bg-green-50 hover:border-green-200 transition-all cursor-pointer">
                            <Upload className="mx-auto mb-2 text-gray-400" size={20} />
                            <span className="text-[10px] font-black uppercase text-gray-400 block truncate px-4">
                                {image ? image.name : editItem ? "Keep current or select new" : "Select JPG or PNG"}
                            </span>
                            <input 
                                type="file" 
                                className="absolute inset-0 opacity-0 cursor-pointer" 
                                onChange={(e) => setImage(e.target.files[0])}
                                required={!editItem}
                            />
                        </div>
                    </div>

                    <button 
                        type="button"
                        onClick={() => setIsFeatured(!isFeatured)}
                        className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${
                            isFeatured ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-gray-50 border-transparent text-gray-400'
                        }`}
                    >
                        <div className="flex items-center gap-2">
                            <Star size={16} fill={isFeatured ? "currentColor" : "none"} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Featured Project</span>
                        </div>
                        <div className={`w-10 h-5 rounded-full relative transition-colors ${isFeatured ? 'bg-amber-400' : 'bg-gray-200'}`}>
                            <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${isFeatured ? 'left-6' : 'left-1'}`} />
                        </div>
                    </button>

                    <button 
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gray-900 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg hover:bg-green-600 transition-all disabled:opacity-50"
                    >
                        {loading ? 'Processing...' : editItem ? 'Update Project' : 'Save to Portfolio'}
                    </button>
                </form>
            </div>
        </div>
    );
}