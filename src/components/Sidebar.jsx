    import React, { useState, useEffect } from 'react';
    import { Link, useLocation } from 'react-router-dom';
    import { 
        LayoutDashboard, Briefcase, Receipt, LogOut, Sprout,
        Users, FileText, BarChart3, FileCheck, Settings, Menu, X, Users2, DollarSign,
        MessageSquare 
    } from 'lucide-react';
    import api from '../api/axios';
    import { useAuth } from '../context/AuthContext';

    export default function Sidebar() {
        const { logout, user } = useAuth();
        const location = useLocation();
        const [isOpen, setIsOpen] = useState(false);
        const [branding, setBranding] = useState({ name: 'GreenPro', logo: null });
    
        useEffect(() => {
            api.get('/settings').then(res => {
                // Updated to use the live domain instead of localhost
                const baseUrl = 'https://thattreeguy.infinityfreeapp.com';
                
                setBranding({
                    name: res.data.project_name || 'GreenPro',
                    // We point the logo path to your live storage folder
                    logo: res.data.logo_path ? `${baseUrl}/storage/${res.data.logo_path}` : null
                });
            }).catch(err => console.error("Sidebar settings error", err));
        }, []);

        const isActive = (path) => {
            if (path === '/') return location.pathname === '/';
            return location.pathname.startsWith(path);
        };

        const allItems = [
            { path: '/', label: 'Dashboard', icon: <LayoutDashboard size={20} />, roles: ['super_admin'] },
            { path: '/', label: 'My Tasks', icon: <LayoutDashboard size={20} />, roles: ['employee', 'technician'] },
            { path: '/analytics', label: 'Analytics', icon: <BarChart3 size={20} />, roles: ['super_admin'] },
            { path: '/jobs', label: 'Projects', icon: <Briefcase size={20} />, roles: ['super_admin', 'employee', 'technician'] },
            { path: '/earnings', label: 'Earnings', icon: <DollarSign size={20} />, roles: ['super_admin', 'employee', 'technician'] },
            { path: '/leads', label: 'Leads', icon: <Users size={20} />, roles: ['super_admin'] },
            { path: '/offers', label: 'Offers', icon: <FileText size={20} />, roles: ['super_admin'] },
            { path: '/users', label: 'Team', icon: <Users2 size={20} />, roles: ['super_admin'] },
            { path: '/invoices', label: 'Invoices', icon: <FileCheck size={20} />, roles: ['super_admin'] },
            { path: '/expenses', label: 'Expenses', icon: <Receipt size={20} />, roles: ['super_admin'] },
            { path: '/settings', label: 'Settings', icon: <Settings size={20} />, roles: ['super_admin'] },
            { path: '/testimonials', label: 'Testimonials', icon: <MessageSquare size={20} />, roles: ['super_admin'] },
            // Inside your allItems array in Sidebar.jsx
            { path: '/content-manager', label: 'Landing Page', icon: <Sprout size={20} />, roles: ['super_admin'] },
        ];

        const menuItems = allItems.filter(item => item.roles.includes(user?.role));

        return (
            <>
                {/* Mobile Header */}
                <div className="lg:hidden fixed top-0 left-0 w-full h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 z-40">
                    <div className="flex items-center gap-2">
                        <Sprout className="text-green-600" size={24} />
                        <span className="font-bold tracking-tight text-gray-900">{branding.name}</span>
                    </div>
                    <button 
                        onClick={() => setIsOpen(!isOpen)}
                        className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                    >
                        {isOpen ? <X /> : <Menu />}
                    </button>
                </div>

                {/* Mobile Overlay */}
                {isOpen && (
                    <div 
                        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
                        onClick={() => setIsOpen(false)}
                    />
                )}

                {/* Sidebar Container */}
                <aside className={`fixed left-0 top-0 h-screen bg-white border-r border-gray-100 w-64 z-50 transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
                    
                    {/* 1. Brand Section (Static) */}
                    <div className="p-8 font-black text-xl flex items-center gap-3 text-gray-900 tracking-tighter flex-shrink-0">
                        <div className="bg-green-100 p-2 rounded-xl text-green-600">
                            {branding.logo ? (
                                <img src={branding.logo} alt="logo" className="w-6 h-6 object-contain" />
                            ) : (
                                <Sprout size={24} /> 
                            )}
                        </div>
                        {branding.name}
                    </div>
                    
                    {/* 2. Navigation Section (Scrollable) */}
                    <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto overflow-x-hidden custom-scrollbar">
                        {menuItems.map((item) => {
                            const active = isActive(item.path);
                            return (
                                <Link
                                    key={item.label}
                                    to={item.path}
                                    onClick={() => setIsOpen(false)}
                                    className={`flex items-center gap-3 px-5 py-3.5 rounded-[1.2rem] transition-all group ${
                                        active 
                                        ? 'bg-green-600 text-white shadow-lg shadow-green-100' 
                                        : 'text-gray-400 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                                >
                                    <span className={`${active ? 'text-white' : 'text-gray-400 group-hover:text-green-600'}`}>
                                        {item.icon}
                                    </span>
                                    <span className="text-xs font-black uppercase tracking-widest">{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* 3. User & Logout Section (Pinned to Bottom) */}
                    <div className="p-6 border-t border-gray-50 flex-shrink-0">
                        <div className="mb-4 px-5">
                            <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-1">Logged in as</p>
                            <p className="text-[10px] font-black text-gray-900 uppercase truncate">{user?.name}</p>
                        </div>
                        <button 
                            onClick={logout} 
                            className="flex items-center gap-3 text-red-400 hover:text-red-600 w-full px-5 py-3.5 font-black text-xs uppercase tracking-[0.2em] transition-colors rounded-2xl hover:bg-red-50"
                        >
                            <LogOut size={18} /> Logout
                        </button>
                    </div>
                </aside>
            </>
        );
    }