import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Download, Plus, Wrench } from 'lucide-react';
import api from '../lib/api';
import { MOCK_WORK_ORDERS } from '../data/mockData';
import { formatDate, statusBadgeClass, formatCurrency } from '../lib/utils';
import type { WorkOrder } from '../types';

export default function WorkOrdersPage() {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(MOCK_WORK_ORDERS);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const fetchWO = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/operations/work-orders');
      if (data.success) setWorkOrders(data.data.data);
    } catch {
      let filtered = MOCK_WORK_ORDERS;
      if (search) filtered = filtered.filter(w => w.assetId.toLowerCase().includes(search.toLowerCase()) || w.problem.toLowerCase().includes(search.toLowerCase()));
      setWorkOrders(filtered);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { const t = setTimeout(fetchWO, 400); return () => clearTimeout(t); }, [search]);

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Work Orders</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage maintenance tasks and repairs</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary btn btn-sm"><Download size={14} /> Export</button>
          <Link to="/operations/work-orders/new" className="btn-primary btn btn-sm"><Plus size={14} /> Raise Work Order</Link>
        </div>
      </div>

      <div className="filter-bar">
        <div className="flex-1 min-w-48 relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input type="text" placeholder="Search by Asset ID or Problem..." value={search} onChange={e => setSearch(e.target.value)} className="form-input pl-9 text-sm" />
        </div>
      </div>

      <div className="gov-card overflow-hidden">
        <table className="gov-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Asset ID</th>
              <th>Type</th>
              <th>Problem</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Est. Cost</th>
              <th>Assigned To</th>
              <th>Due Date</th>
            </tr>
          </thead>
          <tbody>
            {workOrders.map(wo => (
              <tr key={wo.id}>
                <td className="id-col">{wo.id}</td>
                <td><Link to={`/assets/${wo.assetId}`} className="font-mono text-xs text-blue-600 hover:underline">{wo.assetId}</Link></td>
                <td><span className="badge badge-info">{wo.type}</span></td>
                <td className="max-w-xs truncate">{wo.problem}</td>
                <td><span className={`badge ${wo.priority === 'Critical' ? 'badge-critical' : wo.priority === 'High' ? 'badge-high' : 'badge-medium'}`}>{wo.priority}</span></td>
                <td><span className={statusBadgeClass(wo.status)}>{wo.status}</span></td>
                <td><span className="font-medium text-slate-900">{formatCurrency(wo.estimatedCost || 0)}</span></td>
                <td className="text-xs">{wo.assignedEngineerName || 'Unassigned'}</td>
                <td>{formatDate(wo.expectedCompletion)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
