import { useEffect, useState } from 'react';
import { Download, Search, TrendingUp, DollarSign, PieChart as PieChartIcon } from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { formatCurrency } from '../lib/utils';
import api from '../lib/api';

const MOCK_BUDGET = {
  allocated: 3500000000,
  committed: 1850000000,
  spent: 1200000000,
  monthly: [
    { month: 'Apr', budget: 2500, spent: 2100 },
    { month: 'May', budget: 2800, spent: 2400 },
    { month: 'Jun', budget: 3000, spent: 2900 },
    { month: 'Jul', budget: 3200, spent: 3400 }, // Overspend
    { month: 'Aug', budget: 2900, spent: 2600 },
    { month: 'Sep', budget: 3100, spent: 2800 },
  ],
  byDistrict: [
    { name: 'Ahmedabad', value: 850000000 },
    { name: 'Surat', value: 720000000 },
    { name: 'Vadodara', value: 540000000 },
    { name: 'Rajkot', value: 480000000 },
    { name: 'Gandhinagar', value: 310000000 },
    { name: 'Others', value: 600000000 },
  ]
};

const COLORS = ['#64FFDA', '#3b82f6', '#34d399', '#facc15', '#a78bfa', '#94a3b8'];

export default function FinancePage() {
  const [loading, setLoading] = useState(false);
  const data = MOCK_BUDGET;

  const remaining = data.allocated - data.committed - data.spent;
  const utilizedPct = Math.round((data.spent / data.allocated) * 100);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Budget & Finance</h1>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Financial overview for FY 2026-27</p>
        </div>
        <button className="btn-secondary btn btn-sm"><Download size={14} /> Download Report</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="gov-card p-4">
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Total Allocated</div>
          <div className="text-2xl font-bold text-slate-900">{formatCurrency(data.allocated)}</div>
        </div>
        <div className="gov-card p-4 border-l-4 border-cyan-400 bg-cyan-900/10">
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Total Spent</div>
          <div className="text-2xl font-bold text-blue-700 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]">{formatCurrency(data.spent)}</div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-blue-600 mt-1">{utilizedPct}% Utilized</div>
        </div>
        <div className="gov-card p-4 border-l-4 border-amber-400 bg-amber-900/10">
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Committed (In Progress)</div>
          <div className="text-2xl font-bold text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]">{formatCurrency(data.committed)}</div>
        </div>
        <div className="gov-card p-4 border-l-4 border-emerald-400 bg-emerald-900/10">
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Remaining</div>
          <div className="text-2xl font-bold text-green-600">{formatCurrency(remaining)}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="gov-card p-6">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-4">Monthly Expenditure Trend (₹ Lakhs)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.monthly}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
              <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', color: '#0f172a' }} />
              <Legend wrapperStyle={{ color: '#475569' }} />
              <Line type="monotone" dataKey="budget" stroke="rgba(255,255,255,0.3)" strokeWidth={2} name="Budget" />
              <Line type="monotone" dataKey="spent" stroke="#64FFDA" strokeWidth={3} name="Actual Spent" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="gov-card p-6">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-4">Allocation by District</h3>
          <div className="flex items-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={data.byDistrict} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="value">
                  {data.byDistrict.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v: any) => formatCurrency(v)} contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', color: '#0f172a' }} />
                <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ color: '#475569' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
