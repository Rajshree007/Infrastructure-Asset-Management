import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import {
  Building2, AlertTriangle, DollarSign, FolderKanban, ClipboardCheck,
  TrendingDown, Target, ArrowRight, ChevronRight, Wrench, Activity,
  ThumbsDown, MapPin, BarChart3
} from 'lucide-react';
import api from '../lib/api';
import { MOCK_KPIS, MOCK_CHARTS, MOCK_ASSETS } from '../data/mockData';
import { formatCurrency, conditionBadgeClass, priorityBadgeClass } from '../lib/utils';
import type { DashboardKPIs, SystemInsight, Asset } from '../types';

// ── KPI Card ───────────────────────────────────────────────────────────────────
function KPICard({ label, value, sub, icon: Icon, color, link, alert }: {
  label: string; value: string; sub?: string; icon: React.ComponentType<any>;
  color: string; link?: string; alert?: boolean;
}) {
  const inner = (
    <div className={`kpi-card ${alert ? 'border-red-200' : ''}`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
          <Icon size={20} className="text-slate-900" />
        </div>
        {alert && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />}
      </div>
      <div className={`text-3xl font-bold tracking-tight mb-1 ${alert ? 'text-red-700' : 'text-slate-900'}`} style={{ textShadow: alert ? '0 0 15px rgba(248,113,113,0.3)' : '0 0 15px rgba(255,255,255,0.1)' }}>{value}</div>
      <div className="text-sm text-slate-500">{label}</div>
      {sub && <div className="text-xs text-slate-500 mt-0.5">{sub}</div>}
    </div>
  );
  return link ? <Link to={link} className="block hover:no-underline">{inner}</Link> : inner;
}

// ── Condition distribution donut ──────────────────────────────────────────────
const CONDITION_COLORS = ['#10b981', '#22c55e', '#f59e0b', '#f97316', '#ef4444'];
const CONDITION_LABELS = ['Excellent', 'Good', 'Fair', 'Poor', 'Critical'];

// ── Monthly budget vs expenditure ─────────────────────────────────────────────
const CHART_COLORS = { budget: '#94a3b8', spent: '#1B4F8A', line: '#2563EB' };

export default function DashboardPage() {
  const [kpis, setKpis] = useState<DashboardKPIs>(MOCK_KPIS);
  const [charts, setCharts] = useState<any>(MOCK_CHARTS);
  const [insights, setInsights] = useState<SystemInsight[]>([]);
  const [topAssets, setTopAssets] = useState<Asset[]>(MOCK_ASSETS.slice(0, 5).sort((a, b) => (b.priorityScore || 0) - (a.priorityScore || 0)));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [kpiRes, chartRes, insightRes, priorityRes] = await Promise.all([
          api.get('/dashboard/kpis'),
          api.get('/dashboard/charts'),
          api.get('/dashboard/insights'),
          api.get('/priority/dashboard'),
        ]);
        if (kpiRes.data.success) setKpis(kpiRes.data.data);
        if (chartRes.data.success) setCharts(chartRes.data.data);
        if (insightRes.data.success) setInsights(insightRes.data.data);
        if (priorityRes.data.success) setTopAssets(priorityRes.data.data);
      } catch {
        // Use mock data on error
        setInsights([
          { id: '1', type: 'critical', title: 'Critical Infrastructure Alert', message: '127 critical and high-priority assets require immediate attention.', action: 'View Priority Center', actionLink: '/operations/priority' },
          { id: '2', type: 'warning', title: 'Budget Utilization Alert', message: 'Division Central has utilized 86% of its annual maintenance allocation.', action: 'View Budget', actionLink: '/finance' },
          { id: '3', type: 'warning', title: 'Project Schedule Risk', message: 'PRJ-2025-048 (Surat Coastal Highway) is 23 days behind planned milestone.', action: 'View Project', actionLink: '/projects/PRJ-2025-048' },
        ]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const conditionData = charts ? [
    { name: 'Excellent', value: charts.conditionDist?.Excellent || 42 },
    { name: 'Good', value: charts.conditionDist?.Good || 68 },
    { name: 'Fair', value: charts.conditionDist?.Fair || 55 },
    { name: 'Poor', value: charts.conditionDist?.Poor || 22 },
    { name: 'Critical', value: charts.conditionDist?.Critical || 8 },
  ] : [];

  const monthlyData = (charts?.monthlyExpenditure || MOCK_CHARTS.monthlyExpenditure).filter((m: any) => m.spent > 0);

  const assetsByDistrict = charts?.assetsByDistrict || MOCK_CHARTS.assetsByDistrict;
  const budgetData = charts?.budgetData || MOCK_CHARTS.budgetData;
  const utilizationPct = kpis.annualBudget > 0 ? Math.round((kpis.budgetSpent / kpis.annualBudget) * 100) : 68.4;

  return (
    <div className="p-6 space-y-6">
      {/* ── Page Header ────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Infrastructure Command Center</h1>
          <p className="text-xs font-semibold text-blue-600 mt-1 uppercase tracking-widest">
            State Roads & Buildings Department — FY 2026-27 Overview
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-xs text-slate-500">Last updated: {new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</div>
          <Link to="/operations/priority" className="btn-primary btn btn-sm">
            <Target size={14} />
            Priority Center
          </Link>
        </div>
      </div>

      {/* ── System Insights Banner ─────────────────────────────── */}
      {insights.length > 0 && (
        <div className="space-y-2">
          {insights.slice(0, 3).map(insight => (
            <div
              key={insight.id}
 className={`flex items-center gap-4 px-4 py-3 rounded-lg border text-sm
                ${insight.type === 'critical' ? 'bg-red-50 border-red-200 text-red-800' : ''}
                ${insight.type === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-800' : ''}
                ${insight.type === 'info' ? 'bg-blue-50 border-blue-200 text-blue-800' : ''}
              `}
            >
              <span className="text-lg">{insight.type === 'critical' ? '🔴' : insight.type === 'warning' ? '⚠️' : 'ℹ️'}</span>
              <div className="flex-1 min-w-0">
                <span className="font-semibold">{insight.title}:</span>{' '}
                <span>{insight.message}</span>
              </div>
              {insight.actionLink && (
                <Link to={insight.actionLink} className="flex-shrink-0 text-xs font-semibold underline hover:no-underline">
                  {insight.action} →
                </Link>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── KPI Row 1 ──────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-4 gap-4">
        <KPICard label="Total Assets" value={kpis.totalAssets.toLocaleString()} sub="Roads, Buildings, Bridges" icon={Building2} color="bg-gov-blue" link="/assets" />
        <KPICard label="Critical Assets" value={kpis.criticalAssets.toLocaleString()} sub="Priority score ≥ 80" icon={ThumbsDown} color="bg-red-600" link="/operations/priority" alert={kpis.criticalAssets > 50} />
        <KPICard label="Active Projects" value={kpis.activeProjects.toLocaleString()} sub="Under construction" icon={FolderKanban} color="bg-amber-600" link="/projects" />
        <KPICard label="Open Work Orders" value={kpis.openWorkOrders.toLocaleString()} sub="Pending action" icon={Wrench} color="bg-orange-600" link="/operations/work-orders" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard label="Annual Budget" value={formatCurrency(kpis.annualBudget)} sub={`FY 2026-27 • ${utilizationPct}% utilized`} icon={DollarSign} color="bg-emerald-700" link="/finance" />
        <KPICard label="Budget Spent" value={formatCurrency(kpis.budgetSpent)} sub="Expenditure to date" icon={BarChart3} color="bg-emerald-600" link="/finance" />
        <KPICard label="Open Defects" value={kpis.openDefects.toLocaleString()} sub="Unresolved defects" icon={AlertTriangle} color="bg-red-500" link="/operations/defects" alert={kpis.openDefects > 100} />
        <KPICard label="Overdue Inspections" value={kpis.overdueInspections.toLocaleString()} sub="Past due date" icon={ClipboardCheck} color="bg-purple-600" link="/operations/inspections" />
      </div>

      {/* ── Charts Row ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Monthly Expenditure */}
        <div className="lg:col-span-2 gov-card">
          <div className="gov-card-header">
            <div>
              <h2 className="text-sm font-bold text-slate-900 tracking-wide uppercase">Monthly Budget vs Expenditure</h2>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">FY 2026-27 — Approved vs Actual spend (₹ Crores)</p>
            </div>
            <Link to="/finance" className="text-xs text-blue-600 hover:text-blue-800 font-medium">View Details →</Link>
          </div>
          <div className="p-4">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthlyData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip formatter={(v: any) => [`₹${v} Cr`, '']} contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', color: '#0f172a', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                <Legend wrapperStyle={{ fontSize: 12, color: '#475569' }} />
                <Bar dataKey="budget" name="Budget" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
                <Bar dataKey="spent" name="Spent" fill="#64FFDA" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Asset Condition Distribution */}
        <div className="gov-card">
          <div className="gov-card-header">
            <div>
              <h2 className="text-sm font-bold text-slate-900 tracking-wide uppercase">Asset Condition</h2>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Distribution by condition grade</p>
            </div>
          </div>
          <div className="p-4 flex flex-col items-center">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={conditionData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={2}>
                  {conditionData.map((_, index) => (
                    <Cell key={index} fill={CONDITION_COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: any, name: any) => [`${v} assets`, name]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="w-full space-y-1.5 mt-2">
              {conditionData.map((d, i) => (
                <div key={d.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: CONDITION_COLORS[i] }} />
                    <span className="text-slate-600">{d.name}</span>
                  </div>
                  <span className="font-semibold text-slate-900">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Second Row ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Assets by District */}
        <div className="gov-card">
          <div className="gov-card-header">
            <div>
              <h2 className="text-sm font-bold text-slate-900 tracking-wide uppercase">Assets by District</h2>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Total vs Critical assets per district</p>
            </div>
          </div>
          <div className="p-4">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={assetsByDistrict} margin={{ top: 5, right: 10, left: -20, bottom: 5 }} barCategoryGap="25%">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="district" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', color: '#0f172a', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                <Legend wrapperStyle={{ fontSize: 12, color: '#475569' }} />
                <Bar dataKey="count" name="Total" fill="#bae6fd" radius={[4, 4, 0, 0]} />
                <Bar dataKey="critical" name="Critical" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Budget Breakdown */}
        <div className="gov-card">
          <div className="gov-card-header">
            <div>
              <h2 className="text-sm font-bold text-slate-900 tracking-wide uppercase">Annual Budget Overview</h2>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">FY 2026-27 — ₹ Crores</p>
            </div>
            <Link to="/finance" className="text-xs text-blue-600 hover:text-blue-800 font-medium">Finance →</Link>
          </div>
          <div className="p-6 space-y-4">
            {[
              { label: 'Total Allocated', value: budgetData.allocated, pct: 100, color: 'bg-slate-600' },
              { label: 'Committed', value: budgetData.committed, pct: Math.round((budgetData.committed / budgetData.allocated) * 100), color: 'bg-blue-500 ' },
              { label: 'Spent (Actual)', value: budgetData.spent, pct: Math.round((budgetData.spent / budgetData.allocated) * 100), color: 'bg-cyan-400 ' },
              { label: 'Remaining', value: budgetData.remaining, pct: Math.round((budgetData.remaining / budgetData.allocated) * 100), color: 'bg-emerald-500 ' },
            ].map(row => (
              <div key={row.label}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-slate-600 font-medium">{row.label}</span>
                  <span className="font-bold text-slate-900">₹{row.value} Cr ({row.pct}%)</span>
                </div>
                <div className="progress-bar-container">
                  <div className={`progress-bar ${row.color}`} style={{ width: `${row.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Priority Assets Table ───────────────────────────────── */}
      <div className="gov-card">
        <div className="gov-card-header">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500  animate-pulse" />
              Top Priority Assets — Requiring Immediate Attention
            </h2>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Assets ranked by Infrastructure Priority Engine score</p>
          </div>
          <Link to="/operations/priority" className="btn-primary btn btn-sm">
            <Target size={14} />
            View All
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="gov-table">
            <thead>
              <tr>
                <th>Asset ID</th>
                <th>Asset Name</th>
                <th>Type</th>
                <th>District</th>
                <th>Condition</th>
                <th>Priority Score</th>
                <th>Priority</th>
                <th>Recommended Action</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {topAssets.map(asset => (
                <tr key={asset.id}>
                  <td className="id-col">
                    <Link to={`/assets/${asset.id}`}>{asset.id}</Link>
                  </td>
                  <td className="font-medium text-slate-900 max-w-xs truncate">{asset.name}</td>
                  <td><span className="badge badge-info">{asset.type}</span></td>
                  <td className="text-slate-600">{asset.district}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
 className={`h-1.5 rounded-full ${
                            (asset.condition || 0) >= 65 ? 'bg-green-500' :
                            (asset.condition || 0) >= 50 ? 'bg-yellow-500' :
                            (asset.condition || 0) >= 35 ? 'bg-orange-500' : 'bg-red-600'
                          }`}
                          style={{ width: `${asset.condition || 0}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium">{asset.condition}</span>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <span className={`text-lg font-bold ${
                        (asset.priorityScore || 0) >= 80 ? 'text-red-700' :
                        (asset.priorityScore || 0) >= 60 ? 'text-orange-600' :
                        (asset.priorityScore || 0) >= 40 ? 'text-yellow-600' : 'text-green-600'
                      }`}>{asset.priorityScore || 0}</span>
                      <span className="text-xs text-slate-500">/100</span>
                    </div>
                  </td>
                  <td><span className={priorityBadgeClass(asset.priorityLabel)}>{asset.priorityLabel || '—'}</span></td>
                  <td className="text-xs text-slate-600">
                    {(asset.priorityScore || 0) >= 80 ? 'Immediate Corrective Maintenance' :
                     (asset.priorityScore || 0) >= 60 ? 'Schedule Urgent Maintenance' :
                     'Plan Preventive Maintenance'}
                  </td>
                  <td>
                    <Link to={`/assets/${asset.id}`} className="text-blue-600 hover:text-blue-800">
                      <ChevronRight size={16} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
