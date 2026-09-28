import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, RefreshCw, Plus, ChevronRight, FolderKanban, Calendar, TrendingDown } from 'lucide-react';
import api from '../lib/api';
import { MOCK_PROJECTS } from '../data/mockData';
import { formatCurrency, formatDate, statusBadgeClass } from '../lib/utils';
import type { Project } from '../types';
import { useAuth } from '../contexts/AuthContext';

export default function ProjectsPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS);
  const [total, setTotal] = useState(MOCK_PROJECTS.length);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterDistrict, setFilterDistrict] = useState(user?.role === 'Municipal Commissioner' ? user.district : 'All');

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: '50', search });
      const enforcedDistrict = (user?.role === 'Municipal Commissioner' ? user.district : filterDistrict) || 'All';
      if (filterStatus !== 'All') params.set('status', filterStatus);
      if (enforcedDistrict !== 'All') params.set('district', enforcedDistrict);
      const { data } = await api.get(`/projects?${params}`);
      if (data.success) { setProjects(data.data.data); setTotal(data.data.total); }
    } catch {
      let f = MOCK_PROJECTS;
      const enforcedDistrict = (user?.role === 'Municipal Commissioner' ? user.district : filterDistrict) || 'All';
      if (search) f = f.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.id.toLowerCase().includes(search.toLowerCase()));
      if (filterStatus !== 'All') f = f.filter(p => p.status === filterStatus);
      if (enforcedDistrict !== 'All') f = f.filter(p => p.district === enforcedDistrict);
      setProjects(f); setTotal(f.length);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchProjects(); }, [filterStatus, filterDistrict]);
  useEffect(() => { const t = setTimeout(fetchProjects, 400); return () => clearTimeout(t); }, [search]);

  const statusCounts = {
    UnderConstruction: projects.filter(p => p.status === 'UnderConstruction').length,
    Delayed: projects.filter(p => p.status === 'Delayed').length,
    Completed: projects.filter(p => p.status === 'Completed').length,
    Proposed: projects.filter(p => p.status === 'Proposed').length,
  };

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Projects</h1>
          <p className="text-sm text-slate-500 mt-0.5">{total} projects across all districts</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchProjects} className="btn-icon btn"><RefreshCw size={15} className={loading ? 'animate-spin' : ''} /></button>
          <Link to="/projects/new" className="btn-primary btn btn-sm"><Plus size={14} />New Project</Link>
        </div>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Under Construction', count: statusCounts.UnderConstruction, color: 'bg-blue-600', text: 'text-blue-700' },
          { label: 'Delayed', count: statusCounts.Delayed, color: 'bg-red-600', text: 'text-red-700' },
          { label: 'Completed', count: statusCounts.Completed, color: 'bg-green-600', text: 'text-green-700' },
          { label: 'Proposed', count: statusCounts.Proposed, color: 'bg-slate-500', text: 'text-slate-700' },
        ].map(s => (
          <div key={s.label} className="kpi-card cursor-pointer" onClick={() => setFilterStatus(s.label === 'Under Construction' ? 'UnderConstruction' : s.label)}>
            <div className={`text-3xl font-bold ${s.text} mb-1`}>{s.count}</div>
            <div className="text-xs text-slate-500">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <div className="flex-1 min-w-48 relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input type="text" placeholder="Search projects..." value={search} onChange={e => setSearch(e.target.value)} className="form-input pl-9 text-sm" />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="form-select text-sm w-44">
          {['All', 'Proposed', 'Approved', 'Tendering', 'UnderConstruction', 'Delayed', 'Completed', 'Closed'].map(s => <option key={s}>{s}</option>)}
        </select>
        <select 
          value={user?.role === 'Municipal Commissioner' ? user.district : filterDistrict} 
          onChange={e => setFilterDistrict(e.target.value)} 
          className="form-select text-sm w-40"
          disabled={user?.role === 'Municipal Commissioner'}
        >
          {['All', 'Ahmedabad', 'Gandhinagar', 'Vadodara', 'Surat', 'Rajkot'].map(d => <option key={d}>{d}</option>)}
        </select>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {projects.map(proj => (
          <Link key={proj.id} to={`/projects/${proj.id}`} className="gov-card p-5 hover:shadow-md transition-shadow block hover:no-underline">
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs font-semibold text-blue-700">{proj.id}</span>
                  <span className={statusBadgeClass(proj.status)}>{proj.status}</span>
                  {proj.status === 'Delayed' && <TrendingDown size={14} className="text-red-600" />}
                </div>
                <h3 className="font-semibold text-slate-900 text-sm leading-snug">{proj.name}</h3>
                <div className="text-xs text-slate-500 mt-1">{proj.district} • {proj.contractorName || proj.contractor}</div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mb-3">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-500">Progress</span>
                <span className="font-bold text-slate-900">{proj.progress}%</span>
              </div>
              <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
 className={`h-2 rounded-full ${proj.status === 'Delayed' ? 'bg-red-500' : proj.progress >= 90 ? 'bg-green-500' : 'bg-gov-blue'}`}
                  style={{ width: `${proj.progress}%` }}
                />
              </div>
            </div>

            {/* Budget */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-50 rounded p-2">
                <div className="text-slate-500">Budget</div>
                <div className="font-bold text-slate-900">{formatCurrency(proj.budget)}</div>
              </div>
              <div className="bg-slate-50 rounded p-2">
                <div className="text-slate-500">Spent</div>
                <div className={`font-bold ${proj.spent > proj.budget ? 'text-red-700' : 'text-slate-900'}`}>
                  {formatCurrency(proj.spent)} ({proj.budget > 0 ? Math.round((proj.spent / proj.budget) * 100) : 0}%)
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mt-3 text-xs text-slate-500">
              <span className="flex items-center gap-1"><Calendar size={11} />{formatDate(proj.startDate)} — {formatDate(proj.endDate)}</span>
              <ChevronRight size={14} className="text-slate-500" />
            </div>
          </Link>
        ))}
        {projects.length === 0 && (
          <div className="col-span-3 text-center py-12 text-slate-500">No projects found matching filters.</div>
        )}
      </div>
    </div>
  );
}
