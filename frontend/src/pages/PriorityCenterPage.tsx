import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Target, AlertTriangle, Info, Download, RefreshCw, ChevronRight, BarChart3 } from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ScatterChart, Scatter, ZAxis
} from 'recharts';
import api from '../lib/api';
import { MOCK_ASSETS } from '../data/mockData';
import { conditionBadgeClass, priorityBadgeClass, formatCurrency } from '../lib/utils';
import type { Asset } from '../types';
import { useAuth } from '../contexts/AuthContext';

const PRIORITY_COLORS: Record<string, string> = { Critical: '#dc2626', High: '#ea580c', Medium: '#d97706', Low: '#16a34a' };
const PRIORITY_LABELS = ['Critical', 'High', 'Medium', 'Low'];

function PriorityBadge({ label }: { label: string }) {
  return <span className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-bold border
    ${label === 'Critical' ? 'bg-red-100 text-red-800 border-red-300' :
      label === 'High' ? 'bg-orange-100 text-orange-800 border-orange-300' :
      label === 'Medium' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' : 'bg-green-100 text-green-800 border-green-300'}`}>
    {label}
  </span>;
}

function ScoreBar({ score }: { score: number }) {
  const color = score >= 80 ? '#dc2626' : score >= 60 ? '#ea580c' : score >= 40 ? '#d97706' : '#16a34a';
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-1.5 bg-slate-800 rounded-full overflow-hidden border border-slate-200">
        <div className="h-1.5 rounded-full" style={{ width: `${score}%`, background: color, boxShadow: `0 0 10px ${color}` }} />
      </div>
      <span className="text-sm font-bold" style={{ color, textShadow: `0 0 10px ${color}80` }}>{score}</span>
    </div>
  );
}

export default function PriorityCenterPage() {
  const { user } = useAuth();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [backlog, setBacklog] = useState<any>(null);
  const [filterLabel, setFilterLabel] = useState('All');
  const [filterType, setFilterType] = useState('All');
  const [filterDistrict, setFilterDistrict] = useState(user?.role === 'Municipal Commissioner' ? user.district : 'All');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'queue' | 'matrix' | 'backlog'>('queue');
  const [budgetInput, setBudgetInput] = useState('25000000');
  const [scenario, setScenario] = useState<any>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [queueRes, backlogRes] = await Promise.all([
          api.get('/priority/assets?limit=100'),
          api.get('/priority/backlog'),
        ]);
        if (queueRes.data.success) setAssets(queueRes.data.data.data);
        if (backlogRes.data.success) setBacklog(backlogRes.data.data);
      } catch {
        let sorted = [...MOCK_ASSETS].sort((a, b) => (b.priorityScore || 0) - (a.priorityScore || 0));
        if (user?.role === 'Municipal Commissioner') {
          sorted = sorted.filter(a => a.district === user.district);
          setBacklog({ critical: Math.floor(8400000/5), high: Math.floor(12800000/5), medium: Math.floor(6200000/5), low: Math.floor(2100000/5), totalCount: Math.floor(89/5) });
        } else {
          setBacklog({ critical: 8400000, high: 12800000, medium: 6200000, low: 2100000, totalCount: 89 });
        }
        setAssets(sorted as any);
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const runScenario = async () => {
    try {
      const { data } = await api.get(`/priority/budget-scenario?budget=${budgetInput}`);
      if (data.success) setScenario(data.data);
    } catch {
      setScenario({
        budget: parseInt(budgetInput), totalRequired: 32800000,
        totalCovered: Math.min(parseInt(budgetInput), 32800000),
        gap: Math.max(0, 32800000 - parseInt(budgetInput)),
        coveredCount: Math.floor(parseInt(budgetInput) / 400000),
        uncoveredCount: 89 - Math.floor(parseInt(budgetInput) / 400000),
        criticalCovered: parseInt(budgetInput) > 8400000 ? 8 : Math.floor(parseInt(budgetInput) / 1050000),
      });
    }
  };

  const filtered = assets
    .filter(a => filterLabel === 'All' || (a as any).priorityLabel === filterLabel)
    .filter(a => filterType === 'All' || a.type === filterType)
    .filter(a => filterDistrict === 'All' || a.district === filterDistrict);

  const critCount = assets.filter(a => (a.priorityScore || 0) >= 80).length;
  const highCount = assets.filter(a => (a.priorityScore || 0) >= 60 && (a.priorityScore || 0) < 80).length;
  const medCount = assets.filter(a => (a.priorityScore || 0) >= 40 && (a.priorityScore || 0) < 60).length;
  const lowCount = assets.filter(a => (a.priorityScore || 0) < 40).length;

  const barData = [
    { label: 'Critical', count: critCount, color: '#dc2626' },
    { label: 'High', count: highCount, color: '#ea580c' },
    { label: 'Medium', count: medCount, color: '#d97706' },
    { label: 'Low', count: lowCount, color: '#16a34a' },
  ];

  const scatterData = assets.slice(0, 50).map(a => ({
    x: a.condition || 50, y: a.priorityScore || 50, name: a.name,
    z: (a as any).estimatedRepairCost || 1000000,
    label: (a as any).priorityLabel || 'Low',
  }));

  return (
    <div className="p-6 space-y-6">
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Target size={22} className="text-red-500" />
            Infrastructure Priority Center
          </h1>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
            Explainable, transparent maintenance prioritization — {assets.length} assets ranked by Priority Engine
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-secondary btn btn-sm"><Download size={14} />Export Priority Report</button>
        </div>
      </div>

      {/* ── KPI Summary Row ────────────────────────────────────── */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Critical Priority', count: critCount, pct: assets.length ? Math.round(critCount / assets.length * 100) : 0, color: 'bg-red-500', textColor: 'text-red-700 font-bold drop-' },
          { label: 'High Priority', count: highCount, pct: assets.length ? Math.round(highCount / assets.length * 100) : 0, color: 'bg-orange-400', textColor: 'text-orange-600 font-bold drop-' },
          { label: 'Medium Priority', count: medCount, pct: assets.length ? Math.round(medCount / assets.length * 100) : 0, color: 'bg-yellow-400', textColor: 'text-yellow-600 font-bold drop-' },
          { label: 'Low Priority', count: lowCount, pct: assets.length ? Math.round(lowCount / assets.length * 100) : 0, color: 'bg-emerald-400', textColor: 'text-green-600 font-bold drop-' },
        ].map(({ label, count, pct, color, textColor }) => (
          <div key={label} className="gov-card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className={`w-3 h-3 rounded-full ${color}`} />
              <span className="text-xs text-slate-500 font-bold">{pct}%</span>
            </div>
            <div className={`text-4xl ${textColor}`}>{count}</div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">{label}</div>
            <div className="progress-bar-container mt-3">
              <div className={`progress-bar ${color}`} style={{ width: `${pct}%`, boxShadow: '0 0 10px currentColor' }} />
            </div>
          </div>
        ))}
      </div>

      {/* ── Tabs ───────────────────────────────────────────────── */}
      <div className="gov-card overflow-hidden">
        <div className="tab-bar px-4">
          <button onClick={() => setActiveTab('queue')} className={`tab-item ${activeTab === 'queue' ? 'active' : ''}`}>
            Priority Queue ({filtered.length})
          </button>
          <button onClick={() => setActiveTab('matrix')} className={`tab-item ${activeTab === 'matrix' ? 'active' : ''}`}>
            Risk vs Condition Matrix
          </button>
          <button onClick={() => setActiveTab('backlog')} className={`tab-item ${activeTab === 'backlog' ? 'active' : ''}`}>
            Maintenance Backlog & Budget
          </button>
        </div>

        {/* ── Priority Queue ──────────────────────────────────── */}
        {activeTab === 'queue' && (
          <div>
            {/* Filter bar */}
            <div className="px-4 py-3 border-b border-slate-100 flex flex-wrap gap-3">
              {PRIORITY_LABELS.map(l => (
                <button
                  key={l}
                  onClick={() => setFilterLabel(filterLabel === l ? 'All' : l)}
 className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${filterLabel === l ? 'bg-gov-navy text-slate-900 border-gov-navy' : 'border-slate-300 text-slate-600 hover:border-slate-400'}`}
                  style={filterLabel === l ? {} : { borderColor: PRIORITY_COLORS[l], color: PRIORITY_COLORS[l] }}
                >
                  {l}
                </button>
              ))}
              <select value={filterType} onChange={e => setFilterType(e.target.value)} className="form-select text-xs w-28 ml-auto">
                {['All', 'Road', 'Building', 'Bridge'].map(t => <option key={t}>{t}</option>)}
              </select>
              <select 
                value={user?.role === 'Municipal Commissioner' ? user.district : filterDistrict} 
                onChange={e => setFilterDistrict(e.target.value)} 
                className="form-select text-xs w-36"
                disabled={user?.role === 'Municipal Commissioner'}
              >
                {['All', 'Ahmedabad', 'Gandhinagar', 'Vadodara', 'Surat', 'Rajkot'].map(d => <option key={d}>{d}</option>)}
              </select>
            </div>

            <div className="overflow-x-auto">
              <table className="gov-table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Asset ID & Name</th>
                    <th>Type</th>
                    <th>District</th>
                    <th>Condition</th>
                    <th>Priority Score</th>
                    <th>Priority</th>
                    <th>Overdue (days)</th>
                    <th>Recommended Action</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={10} className="text-center py-12 text-slate-500">Loading priority data...</td></tr>
                  ) : filtered.length === 0 ? (
                    <tr><td colSpan={10} className="text-center py-8 text-slate-500">No assets match filter</td></tr>
                  ) : filtered.map((asset, i) => (
                    <tr key={asset.id} className={(asset.priorityScore || 0) >= 80 ? 'bg-red-50/40' : ''}>
                      <td>
                        <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-slate-900
                          ${(asset.priorityScore || 0) >= 80 ? 'bg-red-600' :
                            (asset.priorityScore || 0) >= 60 ? 'bg-orange-500' :
                            (asset.priorityScore || 0) >= 40 ? 'bg-yellow-500' : 'bg-green-500'}`}>
                          {i + 1}
                        </span>
                      </td>
                      <td>
                        <Link to={`/assets/${asset.id}`} className="block hover:no-underline">
                          <div className="font-mono text-xs font-semibold text-blue-700">{asset.id}</div>
                          <div className="text-xs font-medium text-slate-900 mt-0.5 max-w-xs truncate">{asset.name}</div>
                        </Link>
                      </td>
                      <td><span className="badge badge-info">{asset.type}</span></td>
                      <td className="text-xs text-slate-600">{asset.district}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-slate-800 border border-slate-200 rounded-full overflow-hidden">
                            <div className={`h-1.5 rounded-full ${(asset.condition || 0) >= 65 ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : (asset.condition || 0) >= 50 ? 'bg-yellow-400 shadow-[0_0_8px_#facc15]' : (asset.condition || 0) >= 35 ? 'bg-orange-400 shadow-[0_0_8px_#fb923c]' : 'bg-red-500 shadow-[0_0_8px_#ef4444]'}`}
                              style={{ width: `${asset.condition || 0}%` }} />
                          </div>
                          <span className="text-xs font-bold text-slate-900">{asset.condition}</span>
                          <span className={conditionBadgeClass(asset.conditionLabel)}>{asset.conditionLabel}</span>
                        </div>
                      </td>
                      <td>
                        <ScoreBar score={asset.priorityScore || 0} />
                      </td>
                      <td>
                        <PriorityBadge label={(asset as any).priorityLabel || 'Low'} />
                      </td>
                      <td>
                        {(asset.overdueMaintenanceDays || 0) > 0 ? (
                          <span className="text-xs font-bold text-red-700">{asset.overdueMaintenanceDays}d overdue</span>
                        ) : <span className="text-xs text-green-600">Current</span>}
                      </td>
                      <td className="text-xs text-slate-600 max-w-xs">
                        {(asset.priorityScore || 0) >= 80 ? 'Immediate Corrective Maintenance' :
                         (asset.priorityScore || 0) >= 60 ? 'Schedule Urgent Maintenance' :
                         (asset.priorityScore || 0) >= 40 ? 'Plan Preventive Maintenance' : 'Monitor — No Action Required'}
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
        )}

        {/* ── Risk Matrix ──────────────────────────────────────── */}
        {activeTab === 'matrix' && (
          <div className="p-6">
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-slate-900">Risk vs Condition Scatter Matrix</h3>
              <p className="text-xs text-slate-500 mt-0.5">X-axis = Asset Condition (higher is better) | Y-axis = Priority Score (higher = more urgent) | Circle size = Estimated repair cost</p>
            </div>
            <ResponsiveContainer width="100%" height={400}>
              <ScatterChart margin={{ top: 20, right: 30, bottom: 40, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" dataKey="x" name="Condition Score" domain={[0, 100]} label={{ value: 'Condition Score (higher = better)', position: 'bottom', offset: -10, fontSize: 12, fill: '#64748b' }} tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis type="number" dataKey="y" name="Priority Score" domain={[0, 100]} label={{ value: 'Priority Score (higher = urgent)', angle: -90, position: 'insideLeft', offset: 10, fontSize: 12, fill: '#64748b' }} tick={{ fontSize: 11, fill: '#64748b' }} />
                <ZAxis type="number" dataKey="z" range={[30, 200]} />
                <Tooltip content={({ payload }: any) => {
                  if (!payload?.length) return null;
                  const d = payload[0]?.payload;
                  return (
                    <div className="bg-[#0A192F] border border-slate-200 rounded-lg p-3 shadow-lg text-xs text-slate-700">
                      <div className="font-semibold text-slate-900 mb-1">{d?.name}</div>
                      <div>Condition: <strong className="text-slate-900">{d?.x}/100</strong></div>
                      <div>Priority: <strong className="text-slate-900">{d?.y}/100</strong></div>
                      <div>Label: <strong className="text-blue-700">{d?.label}</strong></div>
                    </div>
                  );
                }} />
                {PRIORITY_LABELS.map(label => (
                  <Scatter
                    key={label}
                    name={label}
                    data={scatterData.filter(d => d.label === label)}
                    fill={PRIORITY_COLORS[label]}
                    opacity={0.8}
                  />
                ))}
              </ScatterChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-2">
              {PRIORITY_LABELS.map(l => (
                <div key={l} className="flex items-center gap-1.5 text-xs">
                  <div className="w-3 h-3 rounded-full" style={{ background: PRIORITY_COLORS[l] }} />
                  <span className="text-slate-600">{l}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-4 gap-3 text-center text-xs">
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="font-bold text-red-700 text-lg drop-shadow-[0_0_8px_rgba(248,113,113,0.5)]">{critCount}</div>
                <div className="text-red-300 font-bold uppercase tracking-widest text-[10px]">Critical Priority</div>
                <div className="text-red-500/60 text-[9px]">(Score ≥ 80)</div>
              </div>
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="font-bold text-orange-600 text-lg drop-shadow-[0_0_8px_rgba(251,146,60,0.5)]">{highCount}</div>
                <div className="text-orange-300 font-bold uppercase tracking-widest text-[10px]">High Priority</div>
                <div className="text-orange-500/60 text-[9px]">(Score 60-79)</div>
              </div>
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="font-bold text-yellow-600 text-lg drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]">{medCount}</div>
                <div className="text-yellow-300 font-bold uppercase tracking-widest text-[10px]">Medium Priority</div>
                <div className="text-yellow-500/60 text-[9px]">(Score 40-59)</div>
              </div>
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="font-bold text-green-600 text-lg drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]">{lowCount}</div>
                <div className="text-emerald-300 font-bold uppercase tracking-widest text-[10px]">Low Priority</div>
                <div className="text-emerald-500/60 text-[9px]">(Score &lt; 40)</div>
              </div>
            </div>
          </div>
        )}

        {/* ── Backlog & Budget ─────────────────────────────────── */}
        {activeTab === 'backlog' && (
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Backlog chart */}
              <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-4">Maintenance Backlog by Priority (₹)</h3>
                {backlog && (
                  <div className="space-y-3">
                    {[
                      { label: 'Critical', value: backlog.critical, color: '#dc2626' },
                      { label: 'High', value: backlog.high, color: '#ea580c' },
                      { label: 'Medium', value: backlog.medium, color: '#d97706' },
                      { label: 'Low', value: backlog.low, color: '#16a34a' },
                    ].map(({ label, value, color }) => {
                      const total = (backlog.critical || 0) + (backlog.high || 0) + (backlog.medium || 0) + (backlog.low || 0);
                      const pct = total > 0 ? Math.round((value / total) * 100) : 0;
                      return (
                        <div key={label}>
                          <div className="flex justify-between text-sm mb-1.5">
                            <span className="font-medium" style={{ color }}>{label}</span>
                            <span className="font-bold text-slate-900">{formatCurrency(value)} ({pct}%)</span>
                          </div>
                          <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-3 rounded-full" style={{ width: `${pct}%`, background: color }} />
                          </div>
                        </div>
                      );
                    })}
                    <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-bold">
                      <span>Total Maintenance Backlog</span>
                      <span className="text-red-700">{formatCurrency((backlog.critical || 0) + (backlog.high || 0) + (backlog.medium || 0) + (backlog.low || 0))}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Budget Scenario */}
              <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-4">Budget Scenario Analysis</h3>
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-1">
                    <label className="form-label">Available Budget (₹)</label>
                    <input type="number" value={budgetInput} onChange={e => setBudgetInput(e.target.value)} className="form-input" placeholder="Enter available budget" />
                  </div>
                  <div className="mt-6">
                    <button onClick={runScenario} className="btn-primary btn">Analyze →</button>
                  </div>
                </div>

                {scenario && (
                  <div className="space-y-3">
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="text-xs font-semibold text-blue-700 mb-2">With {formatCurrency(scenario.budget)} budget:</div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <div className="text-slate-500 text-xs">Work Orders Covered</div>
                          <div className="font-bold text-green-700">{scenario.coveredCount}</div>
                        </div>
                        <div>
                          <div className="text-slate-500 text-xs">Uncovered</div>
                          <div className="font-bold text-red-700">{scenario.uncoveredCount}</div>
                        </div>
                        <div>
                          <div className="text-slate-500 text-xs">Critical Covered</div>
                          <div className="font-bold text-green-700">{scenario.criticalCovered}</div>
                        </div>
                        <div>
                          <div className="text-slate-500 text-xs">Budget Gap</div>
                          <div className="font-bold text-red-700">{formatCurrency(scenario.gap)}</div>
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-blue-600 bg-blue-50 p-3 rounded-lg flex items-start gap-2">
                      <Info size={14} className="flex-shrink-0 mt-0.5" />
                      Budget is allocated by descending Priority Score — highest-priority assets are funded first.
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
