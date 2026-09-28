import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Download, RefreshCw, Plus, ChevronRight, SlidersHorizontal } from 'lucide-react';
import api from '../lib/api';
import { MOCK_ASSETS } from '../data/mockData';
import { conditionBadgeClass, priorityBadgeClass, statusBadgeClass, formatDate } from '../lib/utils';
import type { Asset, PaginatedResponse } from '../types';
import { useAuth } from '../contexts/AuthContext';

const DISTRICTS = ['All', 'Ahmedabad', 'Gandhinagar', 'Vadodara', 'Surat', 'Rajkot'];
const TYPES = ['All', 'Road', 'Building', 'Bridge', 'Component'];
const CONDITIONS = ['All', 'Excellent', 'Good', 'Fair', 'Poor', 'Critical'];
const STATUSES = ['All', 'Operational', 'Under Maintenance', 'Decommissioned', 'Under Construction'];

export default function AssetRegistryPage() {
  const { user } = useAuth();
  const [assets, setAssets] = useState<Asset[]>(MOCK_ASSETS);
  const [total, setTotal] = useState(MOCK_ASSETS.length);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  
  // Enforce district filter if role is Municipal Commissioner
  const defaultDistrict = user?.role === 'Municipal Commissioner' ? user.district : 'All';
  const [filterType, setFilterType] = useState('All');
  const [filterDistrict, setFilterDistrict] = useState(defaultDistrict);
  const [filterCondition, setFilterCondition] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const enforcedDistrict = (user?.role === 'Municipal Commissioner' ? user.district : filterDistrict) || 'All';
      const params = new URLSearchParams({ page: String(page), limit: '20', search });
      if (filterType !== 'All') params.set('type', filterType);
      if (enforcedDistrict !== 'All') params.set('district', enforcedDistrict);
      if (filterCondition !== 'All') params.set('condition', filterCondition);
      if (filterStatus !== 'All') params.set('status', filterStatus);
      const { data } = await api.get(`/assets?${params}`);
      if (data.success) {
        setAssets(data.data.data);
        setTotal(data.data.total);
        setTotalPages(data.data.totalPages);
      }
    } catch {
      // Filter mock data
      let filtered = MOCK_ASSETS;
      const enforcedDistrict = (user?.role === 'Municipal Commissioner' ? user.district : filterDistrict) || 'All';
      if (search) filtered = filtered.filter(a => a.name.toLowerCase().includes(search.toLowerCase()) || a.id.toLowerCase().includes(search.toLowerCase()));
      if (filterType !== 'All') filtered = filtered.filter(a => a.type === filterType);
      if (enforcedDistrict !== 'All') filtered = filtered.filter(a => a.district === enforcedDistrict);
      if (filterCondition !== 'All') filtered = filtered.filter(a => a.conditionLabel === filterCondition);
      setAssets(filtered);
      setTotal(filtered.length);
      setTotalPages(Math.ceil(filtered.length / 20));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAssets(); }, [page, filterType, filterDistrict, filterCondition, filterStatus]);
  useEffect(() => { const t = setTimeout(fetchAssets, 400); return () => clearTimeout(t); }, [search]);

  const resetFilters = () => {
    setSearch(''); setFilterType('All'); 
    setFilterDistrict(user?.role === 'Municipal Commissioner' ? user.district : 'All'); 
    setFilterCondition('All'); setFilterStatus('All'); setPage(1);
  };

  return (
    <div className="p-6 space-y-4">
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Asset Registry</h1>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
            {total.toLocaleString()} assets across Roads, Buildings, and Bridges
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchAssets} className="btn-icon btn" title="Refresh">
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
          <button className="btn-secondary btn btn-sm">
            <Download size={14} />
            Export
          </button>
          {user?.role !== 'Reviewer' && (
            <Link to="/assets/new" className="btn-primary btn btn-sm">
              <Plus size={14} />
              Register Asset
            </Link>
          )}
        </div>
      </div>

      {/* ── Filters ────────────────────────────────────────────── */}
      <div className="filter-bar">
        {/* Search */}
        <div className="flex-1 min-w-48 relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search by Asset ID, name, district..."
            value={search}
            onChange={e => setSearch(e.target.value)}
 className="form-input pl-9 text-sm"
          />
        </div>

        {/* Type filter */}
        <select value={filterType} onChange={e => { setFilterType(e.target.value); setPage(1); }} className="form-select text-sm w-36">
          {TYPES.map(t => <option key={t}>{t}</option>)}
        </select>

        {/* District filter */}
        <select 
          value={user?.role === 'Municipal Commissioner' ? user.district : filterDistrict} 
          onChange={e => { setFilterDistrict(e.target.value); setPage(1); }} 
          className="form-select text-sm w-40"
          disabled={user?.role === 'Municipal Commissioner'}
        >
          {DISTRICTS.map(d => <option key={d}>{d}</option>)}
        </select>

        {/* Condition filter */}
        <select value={filterCondition} onChange={e => { setFilterCondition(e.target.value); setPage(1); }} className="form-select text-sm w-36">
          {CONDITIONS.map(c => <option key={c}>{c}</option>)}
        </select>

        {/* Status */}
        <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }} className="form-select text-sm w-44">
          {STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>

        {/* Reset */}
        {(search || filterType !== 'All' || filterDistrict !== 'All' || filterCondition !== 'All' || filterStatus !== 'All') && (
          <button onClick={resetFilters} className="btn-secondary btn btn-sm text-xs">
            Clear Filters
          </button>
        )}
      </div>

      {/* ── Table ──────────────────────────────────────────────── */}
      <div className="gov-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="gov-table">
            <thead>
              <tr>
                <th>Asset ID</th>
                <th>Name</th>
                <th>Type</th>
                <th>District / Division</th>
                <th>Condition</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Assigned Engineer</th>
                <th>Last Inspection</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={10} className="text-center py-12 text-slate-500">Loading assets...</td></tr>
              ) : assets.length === 0 ? (
                <tr><td colSpan={10} className="text-center py-12 text-slate-500">No assets found matching filters.</td></tr>
              ) : assets.map(asset => (
                <tr key={asset.id}>
                  <td>
                    <Link to={`/assets/${asset.id}`} className="font-mono font-medium text-blue-700 hover:text-blue-900 text-xs transition-colors">
                      {asset.id}
                    </Link>
                  </td>
                  <td>
                    <div className="max-w-xs">
                      <div className="font-medium text-slate-900 text-sm leading-tight truncate" title={asset.name}>{asset.name}</div>
                      {asset.subtype && <div className="text-xs text-slate-500 mt-0.5">{asset.subtype}</div>}
                    </div>
                  </td>
                  <td>
                    <div className="flex flex-col gap-0.5">
                      <span className="badge badge-info">{asset.type}</span>
                      {asset.criticalityLabel && <span className={`badge ${asset.criticalityLabel === 'Critical' ? 'badge-critical' : asset.criticalityLabel === 'High' ? 'badge-high' : 'badge-neutral'} mt-0.5`}>{asset.criticalityLabel}</span>}
                    </div>
                  </td>
                  <td>
                    <div className="text-sm text-slate-900">{asset.district}</div>
                    {asset.division && <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mt-0.5">{asset.division}</div>}
                  </td>
                  <td>
                    <div className="space-y-1">
                      <span className={conditionBadgeClass(asset.conditionLabel)}>{asset.conditionLabel}</span>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="w-16 h-1.5 bg-slate-800 border border-slate-200 rounded-full overflow-hidden">
                          <div
 className={`h-1.5 rounded-full ${
                              (asset.condition || 0) >= 65 ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' :
                              (asset.condition || 0) >= 50 ? 'bg-yellow-400 shadow-[0_0_8px_#facc15]' :
                              (asset.condition || 0) >= 35 ? 'bg-orange-400 shadow-[0_0_8px_#fb923c]' : 'bg-red-500 shadow-[0_0_8px_#ef4444]'
                            }`}
                            style={{ width: `${asset.condition || 0}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-slate-900">{asset.condition}/100</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={statusBadgeClass(asset.lifecycleStatus)}>{asset.lifecycleStatus || 'Operational'}</span>
                  </td>
                  <td>
                    {asset.priorityScore !== undefined ? (
                      <div className="flex items-center gap-1.5">
                        <span className={`font-bold text-sm ${
                          asset.priorityScore >= 80 ? 'text-red-700' :
                          asset.priorityScore >= 60 ? 'text-orange-600' :
                          asset.priorityScore >= 40 ? 'text-yellow-600' : 'text-green-600'
                        }`}>{asset.priorityScore}</span>
                        <span className={priorityBadgeClass(asset.priorityLabel)}>{asset.priorityLabel}</span>
                      </div>
                    ) : <span className="text-slate-500">—</span>}
                  </td>
                  <td className="text-xs text-slate-600">{asset.assignedEngineerName || '—'}</td>
                  <td className="text-xs text-slate-500">{formatDate(asset.lastInspection)}</td>
                  <td>
                    <Link to={`/assets/${asset.id}`} className="btn-icon p-1">
                      <ChevronRight size={16} className="text-slate-500" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between bg-white">
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
              Showing page {page} of {totalPages} ({total.toLocaleString()} total)
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary btn btn-sm disabled:opacity-30">← Prev</button>
              <span className="text-xs font-bold text-slate-900">{page} / {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn-secondary btn btn-sm disabled:opacity-30">Next →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
