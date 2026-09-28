import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Download, Plus, ClipboardCheck, AlertTriangle } from 'lucide-react';
import api from '../lib/api';
import { MOCK_INSPECTIONS } from '../data/mockData';
import { formatDate } from '../lib/utils';
import type { Inspection } from '../types';

export default function InspectionsPage() {
  const [inspections, setInspections] = useState<Inspection[]>(MOCK_INSPECTIONS);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const fetchInspections = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/operations/inspections');
      if (data.success) setInspections(data.data.data);
    } catch {
      let filtered = MOCK_INSPECTIONS;
      if (search) filtered = filtered.filter(i => i.assetId.toLowerCase().includes(search.toLowerCase()) || i.inspector.toLowerCase().includes(search.toLowerCase()));
      setInspections(filtered);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { const t = setTimeout(fetchInspections, 400); return () => clearTimeout(t); }, [search]);

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Inspections Register</h1>
          <p className="text-sm text-slate-500 mt-0.5">Track routine and specialized infrastructure inspections</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary btn btn-sm"><Download size={14} /> Export</button>
          <Link to="/operations/inspections/new" className="btn-primary btn btn-sm"><Plus size={14} /> Log Inspection</Link>
        </div>
      </div>

      <div className="filter-bar">
        <div className="flex-1 min-w-48 relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input type="text" placeholder="Search by Asset ID or Inspector..." value={search} onChange={e => setSearch(e.target.value)} className="form-input pl-9 text-sm" />
        </div>
      </div>

      <div className="gov-card overflow-hidden">
        <table className="gov-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Asset ID</th>
              <th>Date</th>
              <th>Type</th>
              <th>Inspector</th>
              <th>Severity</th>
              <th>Condition Score</th>
              <th>Findings</th>
            </tr>
          </thead>
          <tbody>
            {inspections.map(ins => (
              <tr key={ins.id}>
                <td className="id-col">{ins.id}</td>
                <td><Link to={`/assets/${ins.assetId}`} className="font-mono text-xs text-blue-600 hover:underline">{ins.assetId}</Link></td>
                <td>{formatDate(ins.date)}</td>
                <td><span className="badge badge-info">{ins.type}</span></td>
                <td>{ins.inspector}</td>
                <td><span className={`badge ${ins.severityRating === 'Critical' ? 'badge-critical' : ins.severityRating === 'High' ? 'badge-high' : 'badge-neutral'}`}>{ins.severityRating}</span></td>
                <td><span className="font-bold">{ins.conditionScoreAfter !== undefined ? `${ins.conditionScoreAfter}/100` : '—'}</span></td>
                <td className="max-w-xs truncate">{ins.findings}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
