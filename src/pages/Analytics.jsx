import React from 'react';
import { useDashboard } from '../hooks/useDashboard';
import { DollarSign, TrendingUp, Briefcase, Percent } from 'lucide-react';

export default function Analytics() {
  const { stats } = useDashboard();

  const metrics = [
    { label: 'Revenue', value: stats.total_revenue, icon: <DollarSign />, color: 'bg-blue-500' },
    { label: 'Net Profit', value: stats.net_profit, icon: <TrendingUp />, color: 'bg-green-500' },
    { label: 'Expenses', value: stats.material_expenses, icon: <Briefcase />, color: 'bg-red-500' },
    { label: 'Margin', value: stats.profit_margin, icon: <Percent />, color: 'bg-purple-500' },
  ];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-black mb-8">Financial Health</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((m, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <div className={`${m.color} w-10 h-10 rounded-xl flex items-center justify-center text-white mb-4`}>
              {m.icon}
            </div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">{m.label}</p>
            <h2 className="text-2xl font-black text-gray-900 mt-1">
              {m.label === 'Margin' ? m.value : `$${m.value}`}
            </h2>
          </div>
        ))}
      </div>
    </div>
  );
}