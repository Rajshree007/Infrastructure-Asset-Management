import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Download, Plus, AlertTriangle } from 'lucide-react';
import api from '../lib/api';
import { MOCK_DEFECTS } from '../data/mockData';
import { formatDate, severityBadgeClass, statusBadgeClass } from '../lib/utils';
import type { Defect } from '../types';

export default function DefectsPage() {
  const [defects, setDefects] = useState<Defect[]>(MOCK_DEFECTS);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const fetchDefects = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/operations/defects');
      if (data.success) setDefects(data.data.data);
    } catch {
      let filtered = MOCK_DEFECTS;
      if (search) filtered = filtered.filter(d => d.assetId.toLowerCase().includes(search.toLowerCase()) || d.description.toLowerCase().includes(search.toLowerCase()));
      setDefects(filtered);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { const t = setTimeout(fetchDefects, 400); return () => clearTimeout(t); }, [search]);

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Defects Register</h1>
          <p className="text-sm text-slate-500 mt-0.5">Track reported infrastructure defects and SLA</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary btn btn-sm"><Download size={14} /> Export</button>
        </div>
      </div>

      <div className="filter-bar">
        <div className="flex-1 min-w-48 relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input type="text" placeholder="Search by Asset ID or Description..." value={search} onChange={e => setSearch(e.target.value)} className="form-input pl-9 text-sm" />
        </div>
      </div>

      <div className="gov-card overflow-hidden">
        <table className="gov-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Asset ID</th>
              <th>Reported Date</th>
              <th>Description</th>
              <th>Severity</th>
              <th>Status</th>
              <th>SLA</th>
              <th>Work Order</th>
            </tr>
          </thead>
          <tbody>
            {defects.map(def => (
              <tr key={def.id}>
                <td className="id-col">{def.id}</td>
                <td><Link to={`/assets/${def.assetId}`} className="font-mono text-xs text-blue-600 hover:underline">{def.assetId}</Link></td>
                <td>{formatDate(def.createdDate)}</td>
                <td className="max-w-xs truncate">{def.description}</td>
                <td><span className={severityBadgeClass(def.severity)}>{def.severity}</span></td>
                <td><span className={statusBadgeClass(def.status)}>{def.status}</span></td>
                <td>
                  {def.slaDaysRemaining !== undefined ? (
                    <span className={`text-xs font-semibold ${def.slaDaysRemaining < 0 ? 'text-red-700' : def.slaDaysRemaining < 3 ? 'text-orange-600' : 'text-green-600'}`}>
                      {def.slaDaysRemaining < 0 ? `${Math.abs(def.slaDaysRemaining)}d overdue` : `${def.slaDaysRemaining}d left`}
                    </span>
                  ) : '—'}
                </td>
                <td>
                  {def.workOrderId ? <Link to={`/operations/work-orders/${def.workOrderId}`} className="text-xs text-blue-600 hover:underline">{def.workOrderId}</Link> : <span className="text-xs text-slate-500">Not Raised</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
