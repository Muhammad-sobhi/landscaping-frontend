import React, { useState } from 'react';
import { X, Upload, Plus, Trash2, TreeDeciduous, Flower2, Scissors, Shovel, Sun, Droplets, ChevronDown } from 'lucide-react';
import api from '../api/axios';

// This MUST match the iconMap in your Services.js
const AVAILABLE_ICONS = [
    { name: 'TreeDeciduous', icon: TreeDeciduous },
    { name: 'Flower2', icon: Flower2 },
    { name: 'Scissors', icon: Scissors },
    { name: 'Shovel', icon: Shovel },
    { name: 'Sun', icon: Sun },
    { name: 'Droplets', icon: Droplets },
];

export default function AddServiceModal({ isOpen, onClose, onRefresh }) {
    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [iconName, setIconName] = useState('TreeDeciduous'); // Default icon
    const [image, setImage] = useState(null);
    const [tags, setTags] = useState([]);
    const [currentTag, setCurrentTag] = useState('');

    const addTag = () => {
        if (currentTag && !tags.includes(currentTag)) {
            setTags([...tags, currentTag]);
            setCurrentTag('');
        }
    };

    const removeTag = (index) => {
        setTags(tags.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('icon', iconName); // Matches your 'icon' column in DB
        if (image) formData.append('image', image);
        formData.append('tags', JSON.stringify(tags));

        try {
            await api.post('/services', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            onRefresh();
            onClose();
            // Reset form
            setTitle(''); setDescription(''); setTags([]); setImage(null); setIconName('TreeDeciduous');
        } catch (err) {
            console.error(err);
            alert("Failed to add service");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl relative animate-in fade-in zoom-in duration-200 overflow-y-auto max-h-[90vh]">
                <button onClick={onClose} className="absolute top-6 right-6 text-gray-400 hover:text-gray-900 transition-colors">
                    <X size={24} />
                </button>

                <h2 className="text-2xl font-black uppercase tracking-tighter mb-6">Add New Service</h2>

                <form onSubmit={handleSubmit} className="space-y-5">
                    
                    {/* Icon Selection Dropdown */}
                    <div>
                        <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 px-1">Display Icon</label>
                        <div className="relative">
                            <select 
                                value={iconName}
                                onChange={(e) => setIconName(e.target.value)}
                                className="w-full p-4 bg-gray-50 rounded-2xl border-none font-bold focus:ring-2 focus:ring-green-500 appearance-none cursor-pointer"
                            >
                                {AVAILABLE_ICONS.map((item) => (
                                    <option key={item.name} value={item.name}>
                                        {item.name.replace(/([A-Z])/g, ' $1').trim()}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none flex items-center gap-2">
                                {/* Preview of the selected icon */}
                                {React.createElement(AVAILABLE_ICONS.find(i => i.name === iconName)?.icon || TreeDeciduous, { size: 20, className: "text-green-600" })}
                                <ChevronDown size={16} className="text-gray-400" />
                            </div>
                        </div>
                    </div>

                    {/* Title */}
                    <div>
                        <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 px-1">Service Title</label>
                        <input 
                            required
                            className="w-full p-4 bg-gray-50 rounded-2xl border-none font-bold focus:ring-2 focus:ring-green-500"
                            placeholder="e.g. Tree Trimming"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 px-1">Description</label>
                        <textarea 
                            required
                            rows="3"
                            className="w-full p-4 bg-gray-50 rounded-2xl border-none text-sm focus:ring-2 focus:ring-green-500"
                            placeholder="Briefly describe the service..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    {/* Tags */}
                    <div>
                        <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 px-1">Features / Tags</label>
                        <div className="flex gap-2 mb-3">
                            <input 
                                className="flex-1 p-3 bg-gray-50 rounded-xl border-none text-sm font-bold"
                                placeholder="Add feature..."
                                value={currentTag}
                                onChange={(e) => setCurrentTag(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                            />
                            <button type="button" onClick={addTag} className="bg-gray-100 p-3 rounded-xl hover:bg-green-100 hover:text-green-600 transition-colors">
                                <Plus size={20}/>
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {tags.map((tag, i) => (
                                <span key={i} className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase">
                                    {tag}
                                    <button onClick={() => removeTag(i)}><Trash2 size={12}/></button>
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Image Upload */}
                    <div>
                        <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 px-1">Service Photo</label>
                        <div className="relative group cursor-pointer">
                            <input 
                                type="file" 
                                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                onChange={(e) => setImage(e.target.files[0])}
                            />
                            <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-6 flex flex-col items-center justify-center text-gray-400 group-hover:border-green-300 group-hover:bg-green-50 transition-all">
                                <Upload size={24} className="mb-2" />
                                <span className="text-[10px] font-black uppercase text-center px-4">
                                    {image ? image.name : 'Upload Service Image'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-gray-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-green-600 transition-all shadow-xl disabled:opacity-50 mt-4"
                    >
                        {loading ? 'Creating Service...' : 'Confirm & Add Service'}
                    </button>
                </form>
            </div>
        </div>
    );
}