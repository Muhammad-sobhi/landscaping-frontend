import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Link } from 'react-router-dom';
import { 
    Search, Plus, X, ChevronRight, User, DollarSign, Trash2, Printer, Mail 
} from 'lucide-react';

export default function Offers() {
    const [offers, setOffers] = useState([]);
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Form State
    const [leadId, setLeadId] = useState('');
    const [items, setItems] = useState([
        { name: '', category: 'material', quantity: 1, unit_price: 0, total_price: 0 }
    ]);
    const [discount, setDiscount] = useState(0);
    const [internalNotes, setInternalNotes] = useState('');
    const [messageToCustomer, setMessageToCustomer] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [offersRes, leadsRes] = await Promise.all([
                api.get('/offers'), 
                api.get('/leads')
            ]);
            setOffers(offersRes.data);
            setLeads(leadsRes.data);
        } catch (err) {
            console.error("Error fetching data", err);
        } finally {
            setLoading(false);
        }
    };

    const updateItem = (index, field, value) => {
        const newItems = [...items];
        let val = value;
        if (field === 'quantity' || field === 'unit_price') val = parseFloat(value) || 0;
        
        newItems[index][field] = val;
        if (field === 'quantity' || field === 'unit_price') {
            newItems[index].total_price = newItems[index].quantity * newItems[index].unit_price;
        }
        setItems(newItems);
    };

    const subtotal = items.reduce((sum, item) => sum + parseFloat(item.total_price || 0), 0);
    const total = subtotal - discount;

    const handleCreateOffer = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                lead_id: leadId,
                subtotal: subtotal,
                discount: discount,
                total: total,
                internal_notes: internalNotes,
                message_to_customer: messageToCustomer,
                items: items, // Contains name, category, quantity, unit_price, total_price
                status: 'pending'
            };

            await api.post('/offers', payload);
            
            // Re-fetch data to update the table and include lead relationships automatically
            await fetchData(); 
            
            setShowForm(false);
            resetForm();
            alert("Quote Created Successfully!");
        } catch (err) {
            console.error(err);
            alert("Error: " + (err.response?.data?.message || "Check server logs"));
        }
    };

    const resetForm = () => {
        setLeadId('');
        setItems([{ name: '', category: 'material', quantity: 1, unit_price: 0, total_price: 0 }]);
        setDiscount(0);
        setInternalNotes('');
        setMessageToCustomer('');
    };

    const filteredOffers = offers.filter(offer => 
        offer.lead?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="p-10 text-center font-black uppercase text-xs text-gray-400">Loading...</div>;

    return (
        <div className="space-y-6 w-full max-w-full pb-20 px-4">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-black text-gray-900 tracking-tighter uppercase">Quotation Center</h2>
                    <p className="text-gray-500 text-xs font-bold">Total Quotes: {offers.length}</p>
                </div>
                <button 
                    onClick={() => setShowForm(!showForm)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                        showForm ? 'bg-gray-200 text-gray-700' : 'bg-green-600 text-white shadow-lg'
                    }`}
                >
                    {showForm ? <X size={16}/> : <Plus size={16}/>}
                    {showForm ? 'Cancel' : 'New Quote'}
                </button>
            </div>

            {showForm ? (
                <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-2xl">
                    <form onSubmit={handleCreateOffer} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Customer</label>
                                <select 
                                    required
                                    className="w-full mt-1 px-4 py-3 bg-gray-50 rounded-xl font-bold text-sm outline-none"
                                    value={leadId}
                                    onChange={(e) => setLeadId(e.target.value)}
                                >
                                    <option value="">Select Lead...</option>
                                    {leads.map(lead => (
                                        <option key={lead.id} value={lead.id}>{lead.full_name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex gap-2 items-end">
                                <button type="button" onClick={() => window.print()} className="p-3 bg-gray-100 rounded-xl"><Printer size={18}/></button>
                            </div>
                        </div>

                        {/* Line Items */}
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Services & Materials</label>
                            {items.map((item, index) => (
                                <div key={index} className="flex flex-wrap md:flex-nowrap gap-3 items-center bg-gray-50 p-3 rounded-2xl">
                                    <input 
                                        className="flex-[3] bg-white border border-gray-100 px-4 py-2 rounded-xl text-sm font-bold"
                                        placeholder="Description"
                                        value={item.name}
                                        onChange={(e) => updateItem(index, 'name', e.target.value)}
                                        required
                                    />
                                    <select 
                                        className="w-32 bg-white border border-gray-100 px-2 py-2 rounded-xl text-[10px] font-black uppercase"
                                        value={item.category}
                                        onChange={(e) => updateItem(index, 'category', e.target.value)}
                                    >
                                        <option value="material">Material</option>
                                        <option value="service">Service</option>
                                        <option value="equipment">Rental</option>
                                    </select>
                                    <input 
                                        type="number" className="w-20 bg-white border border-gray-100 px-2 py-2 rounded-xl text-sm text-center font-bold"
                                        value={item.quantity}
                                        onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                                    />
                                    <input 
                                        type="number" className="w-32 bg-white border border-gray-100 px-2 py-2 rounded-xl text-sm text-right font-bold"
                                        value={item.unit_price}
                                        onChange={(e) => updateItem(index, 'unit_price', e.target.value)}
                                    />
                                    <div className="w-24 text-right font-black">${item.total_price.toFixed(2)}</div>
                                    <button type="button" onClick={() => setItems(items.filter((_, i) => i !== index))} className="text-gray-300 hover:text-red-500"><Trash2 size={16}/></button>
                                </div>
                            ))}
                            <button type="button" onClick={() => setItems([...items, { name: '', category: 'material', quantity: 1, unit_price: 0, total_price: 0 }])} className="text-[10px] font-black text-green-600 uppercase">+ Add Item</button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <textarea 
                                placeholder="Message to Customer (Scope of work)"
                                className="w-full p-4 bg-gray-50 rounded-2xl text-sm min-h-[100px] outline-none"
                                value={messageToCustomer}
                                onChange={(e) => setMessageToCustomer(e.target.value)}
                            />
                            <textarea 
                                placeholder="Internal Notes (Hidden from customer)"
                                className="w-full p-4 bg-gray-50 rounded-2xl text-sm min-h-[100px] outline-none"
                                value={internalNotes}
                                onChange={(e) => setInternalNotes(e.target.value)}
                            />
                        </div>

                        <div className="flex flex-col items-end border-t pt-6">
                            <div className="flex justify-between w-64 text-sm font-bold text-gray-400"><span>SUBTOTAL</span><span>${subtotal.toFixed(2)}</span></div>
                            <div className="flex justify-between w-64 text-sm font-bold text-red-400 items-center">
                                <span>DISCOUNT</span>
                                <input type="number" className="w-24 text-right bg-transparent font-black" value={discount} onChange={(e) => setDiscount(parseFloat(e.target.value || 0))} />
                            </div>
                            <div className="flex justify-between w-64 pt-4 mt-2 border-t">
                                <span className="font-black">TOTAL</span>
                                <span className="text-3xl font-black text-green-600">${total.toFixed(2)}</span>
                            </div>
                        </div>

                        <button type="submit" className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl">
                            Create & Save Quote
                        </button>
                    </form>
                </div>
            ) : (
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-4 border-b border-gray-50">
                        <div className="relative max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input 
                                type="text" placeholder="Search previous quotes..." 
                                className="w-full pl-10 pr-4 py-2 bg-gray-50 rounded-xl text-sm outline-none"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <table className="w-full text-left">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400">Customer</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 text-center">Status</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 text-right">Total</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 text-right">View</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredOffers.map(offer => (
                                <tr key={offer.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <p className="font-black text-gray-900 text-sm">{offer.lead?.full_name || 'N/A'}</p>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase">#QT-{offer.id}</p>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${
                                            offer.status === 'accepted' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                        }`}>
                                            {offer.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right font-black text-gray-900">${offer.total}</td>
                                    <td className="px-6 py-4 text-right">
                                        <Link to={`/offers/${offer.id}`} className="text-gray-300 hover:text-indigo-600">
                                            <ChevronRight size={20}/>
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}