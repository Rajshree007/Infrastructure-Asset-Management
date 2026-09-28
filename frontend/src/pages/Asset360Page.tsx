import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, MapPin, Calendar, User, DollarSign, AlertTriangle, Wrench,
  ClipboardCheck, FolderKanban, Activity, FileText, BookOpen, ChevronRight,
  ExternalLink, Building2, Target, Info, CheckCircle2, XCircle, Clock
} from 'lucide-react';
import api from '../lib/api';
import { MOCK_ASSETS, MOCK_INSPECTIONS, MOCK_DEFECTS, MOCK_WORK_ORDERS } from '../data/mockData';
import {
  conditionBadgeClass, priorityBadgeClass, statusBadgeClass,
  severityBadgeClass, formatDate, formatCurrency
} from '../lib/utils';
import type { Asset, PriorityResult } from '../types';
import { useAuth } from '../contexts/AuthContext';

// ── Priority Score Ring ────────────────────────────────────────────────────────
function PriorityRing({ score, label }: { score: number; label: string }) {
  const r = 38;
  const circumference = 2 * Math.PI * r;
  const filled = circumference * (score / 100);
  const color = score >= 80 ? '#dc2626' : score >= 60 ? '#ea580c' : score >= 40 ? '#d97706' : '#16a34a';

  return (
    <div className="flex flex-col items-center">
      <svg width="100" height="100" className="rotate-[-90deg]">
        <circle cx="50" cy="50" r={r} fill="none" stroke="#e2e8f0" strokeWidth="8" />
        <circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={`${filled} ${circumference - filled}`}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.8s ease-out' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center" style={{ marginTop: '-72px' }}>
        <div className="text-2xl font-bold" style={{ color }}>{score}</div>
        <div className="text-xs text-slate-500">/100</div>
      </div>
      <div className="mt-2 text-sm font-semibold" style={{ color }}>{label}</div>
    </div>
  );
}

// ── Tab Button ────────────────────────────────────────────────────────────────
function Tab({ active, onClick, children, count }: { active: boolean; onClick: () => void; children: React.ReactNode; count?: number }) {
  return (
    <button onClick={onClick} className={`tab-item ${active ? 'active' : ''}`}>
      {children}
      {count !== undefined && (
        <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${active ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-600'}`}>
          {count}
        </span>
      )}
    </button>
  );
}

// ── Lifecycle Timeline ─────────────────────────────────────────────────────────
function LifecycleTimeline({ events }: { events: any[] }) {
  if (!events?.length) return <div className="text-sm text-slate-500 text-center py-6">No lifecycle events recorded yet.</div>;
  const typeColors: Record<string, string> = {
    Creation: 'bg-blue-500', Design: 'bg-purple-500', Construction: 'bg-amber-500',
    Inspection: 'bg-teal-500', Defect: 'bg-orange-500', Maintenance: 'bg-indigo-500',
    WorkOrder: 'bg-cyan-500', Handover: 'bg-emerald-500', StatusChange: 'bg-slate-500',
  };
  return (
    <div className="space-y-0">
      {events.map((e, i) => (
        <div key={e.id} className="timeline-item">
          <div className={`timeline-dot ${typeColors[e.type] || 'bg-slate-400'}`}>
            <span className="sr-only">{e.event}</span>
          </div>
          <div className="bg-white shadow-sm border border-slate-200 rounded-md px-3 py-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="text-sm font-semibold text-slate-900">{e.event}</div>
                <div className="text-xs text-slate-500 mt-0.5">{e.description}</div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-xs text-slate-500">{formatDate(e.date)}</div>
                {e.role && <div className="text-xs text-blue-700">{e.role}</div>}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Asset360Page() {
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [asset, setAsset] = useState<Asset | null>(null);
  const [priority, setPriority] = useState<PriorityResult | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  
  // Update Modal State
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateForm, setUpdateForm] = useState({ condition: 100, status: 'Operational', reason: '' });
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [assetRes, priorityRes] = await Promise.all([
          api.get(`/assets/${id}`),
          api.get(`/priority/assets/${id}`),
        ]);
        if (assetRes.data.success) setAsset(assetRes.data.data);
        if (priorityRes.data.success) setPriority(priorityRes.data.data);
      } catch {
        // Fallback to mock
        const found = MOCK_ASSETS.find(a => a.id === id);
        if (found) {
          setAsset({
            ...found,
            inspections: MOCK_INSPECTIONS.filter(i => i.assetId === id),
            defects: MOCK_DEFECTS.filter(d => d.assetId === id),
            workOrders: MOCK_WORK_ORDERS.filter(w => w.assetId === id),
            lifecycle: [
              { id: '1', assetId: id!, date: `${found.constructionYear || 2018}-01-15`, event: 'Project Initiated', type: 'Creation', description: `Asset construction project initiated for ${found.name}` },
              { id: '2', assetId: id!, date: `${found.constructionYear || 2018}-12-30`, event: 'Commissioned', type: 'Handover', description: 'Asset commissioned and handed over to Operations' },
              { id: '3', assetId: id!, date: found.lastInspection || '2026-09-12', event: 'Inspection Completed', type: 'Inspection', description: `Routine inspection completed. Condition: ${found.conditionLabel}`, role: 'Assistant Engineer' },
            ],
          });
          setPriority({
            score: found.priorityScore || 50,
            label: (found.priorityScore || 0) >= 80 ? 'Critical' : (found.priorityScore || 0) >= 60 ? 'High' : 'Medium',
            explanation: [
              { factor: 'Condition Score', value: `${found.condition}/100 (${found.conditionLabel})`, contribution: Math.round((100 - found.condition) * 0.3), status: found.condition < 50 ? 'critical' : 'warning' },
              { factor: 'Asset Criticality', value: found.criticalityLabel || 'High', contribution: 12, status: 'warning' },
              { factor: 'Maintenance Overdue', value: `${found.overdueMaintenanceDays || 0} days`, contribution: Math.min((found.overdueMaintenanceDays || 0) / 3, 15), status: (found.overdueMaintenanceDays || 0) > 30 ? 'critical' : 'warning' },
            ],
            recommendedAction: (found.priorityScore || 0) >= 80 ? 'Immediate Corrective Maintenance' : 'Schedule Urgent Maintenance',
            reasons: [`Condition score ${found.condition}/100 — requires immediate intervention`],
          });
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  useEffect(() => {
    if (asset) {
      setUpdateForm({ condition: asset.condition, status: asset.lifecycleStatus || 'Operational', reason: '' });
    }
  }, [asset]);

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const conditionLabel = updateForm.condition >= 85 ? 'Excellent' : updateForm.condition >= 70 ? 'Good' : updateForm.condition >= 50 ? 'Fair' : 'Poor';
      const payload = {
        condition: updateForm.condition,
        conditionLabel,
        lifecycleStatus: updateForm.status,
        reason: updateForm.reason
      };
      
      const res = await api.patch(`/assets/${id}`, payload);
      if (res.data.success) {
        setAsset({ ...asset, ...payload } as any);
        setShowUpdateModal(false);
      }
    } catch (err) {
      console.warn('Backend update failed, falling back to local state update for demo purposes', err);
      // Fallback for hackathon demo if backend is not reachable
      setAsset({ ...asset, ...payload } as any);
      setShowUpdateModal(false);
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-slate-500 text-sm">Loading asset data...</div>
    </div>
  );

  if (!asset) return (
    <div className="p-6 text-center">
      <div className="text-slate-500">Asset not found</div>
      <Link to="/assets" className="text-blue-700 text-sm mt-2 inline-block">← Back to Asset Registry</Link>
    </div>
  );

  // RBAC Access Guard for Municipal Commissioner
  if (user?.role === 'Municipal Commissioner' && asset.district !== user.district) {
    return (
      <div className="p-12 text-center max-w-lg mx-auto">
        <div className="inline-flex w-16 h-16 rounded-full bg-red-50 text-red-600 items-center justify-center mb-4">
          <XCircle size={32} />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h2>
        <p className="text-slate-500 mb-6">
          Your authorization level (Municipal Commissioner) only permits access to assets within <b>{user.district}</b> district. 
          This asset is located in <b>{asset.district}</b>.
        </p>
        <Link to="/assets" className="btn btn-primary">Return to Registry</Link>
      </div>
    );
  }

  const defects = asset.defects || [];
  const inspections = asset.inspections || [];
  const workOrders = asset.workOrders || [];
  const lifecycle = asset.lifecycle || [];
  const openDefects = defects.filter(d => !['Closed', 'Verified'].includes(d.status));

  return (
    <div className="min-h-full">
      {/* ── Sticky Header ─────────────────────────────────────── */}
      <div className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-20">
        <div className="px-6 py-4 flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <button onClick={() => navigate('/assets')} className="mt-1 text-slate-500 hover:text-slate-700">
              <ArrowLeft size={20} />
            </button>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">{asset.id}</span>
                <span className="badge badge-info">{asset.type}</span>
                <span className={conditionBadgeClass(asset.conditionLabel)}>{asset.conditionLabel}</span>
                <span className={statusBadgeClass(asset.lifecycleStatus)}>{asset.lifecycleStatus || 'Operational'}</span>
                {asset.criticalityLabel && <span className={`badge ${asset.criticalityLabel === 'Critical' || asset.criticalityLabel === 'High' ? 'badge-high' : 'badge-neutral'}`}>{asset.criticalityLabel} Criticality</span>}
              </div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{asset.name}</h1>
              <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                <span className="flex items-center gap-1"><MapPin size={12} />{asset.district}{asset.division ? ` • ${asset.division}` : ''}</span>
                {asset.assignedEngineerName && <span className="flex items-center gap-1"><User size={12} />{asset.assignedEngineerName}</span>}
                {asset.lastInspection && <span className="flex items-center gap-1"><Calendar size={12} />Inspected: {formatDate(asset.lastInspection)}</span>}
              </div>
            </div>
          </div>
          {user?.role !== 'Reviewer' && (
            <div className="flex items-center gap-2 flex-shrink-0">
              <button onClick={() => setShowUpdateModal(true)} className="btn-secondary btn btn-sm">
                <Activity size={14} />
                Update Status
              </button>
              <Link to={`/operations/inspections/new?assetId=${id}`} className="btn-secondary btn btn-sm">
                <ClipboardCheck size={14} />
                New Inspection
              </Link>
              <Link to={`/operations/work-orders/new?assetId=${id}`} className="btn-primary btn btn-sm">
                <Wrench size={14} />
                Raise Work Order
              </Link>
            </div>
          )}
        </div>

        {/* ── Tab Bar ─────────────────────────────────────────── */}
        <div className="tab-bar px-6">
          {[
            { key: 'overview', label: 'Overview & Details' },
            { key: 'priority', label: 'Priority Analysis' },
            { key: 'inspections', label: 'Inspections', count: inspections.length },
            { key: 'defects', label: 'Defects', count: defects.length },
            { key: 'workorders', label: 'Work Orders', count: workOrders.length },
            { key: 'lifecycle', label: 'Lifecycle Timeline' },
            { key: 'documents', label: 'Documents' },
          ].map(t => (
            <Tab key={t.key} active={activeTab === t.key} onClick={() => setActiveTab(t.key)} count={t.count}>
              {t.label}
            </Tab>
          ))}
        </div>
      </div>

      {/* ── Tab Content ───────────────────────────────────────── */}
      <div className="p-6">
        {/* ── Overview ─────────────────────────────────────────── */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Condition & Quick Stats */}
            <div className="space-y-4">
              {/* Condition Card */}
              <div className="gov-card p-5">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-4">Asset Condition</h3>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-4xl font-bold text-slate-900">{asset.condition}</div>
                    <div className="text-sm text-slate-500">/ 100</div>
                    <div className="mt-1">
                      <span className={conditionBadgeClass(asset.conditionLabel)}>{asset.conditionLabel}</span>
                    </div>
                  </div>
                  <div className="w-24">
                    <svg viewBox="0 0 36 36" className="w-24 h-24 -rotate-90">
                      <circle cx="18" cy="18" r="15" fill="none" stroke="#e2e8f0" strokeWidth="3" />
                      <circle cx="18" cy="18" r="15" fill="none"
                        stroke={asset.condition >= 65 ? '#22c55e' : asset.condition >= 50 ? '#f59e0b' : asset.condition >= 35 ? '#f97316' : '#ef4444'}
                        strokeWidth="3"
                        strokeDasharray={`${asset.condition * 0.942} ${94.2 - asset.condition * 0.942}`}
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Last Inspected</span>
                    <span className="font-medium">{formatDate(asset.lastInspection)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Next Due</span>
                    <span className="font-medium">{formatDate(asset.nextInspection) || 'Overdue'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Open Defects</span>
                    <span className={`font-bold ${openDefects.length > 0 ? 'text-red-700' : 'text-green-600'}`}>{openDefects.length}</span>
                  </div>
                  {asset.overdueMaintenanceDays && asset.overdueMaintenanceDays > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Maintenance Overdue</span>
                      <span className="font-bold text-red-700">{asset.overdueMaintenanceDays} days</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Priority Score */}
              {priority && (
                <div className={`gov-card p-5 border ${priority.label === 'Critical' ? 'border-red-200 bg-red-50' : priority.label === 'High' ? 'border-orange-200 bg-orange-50' : ''}`}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Priority Score</h3>
                    <button onClick={() => setActiveTab('priority')} className="text-xs text-blue-700 hover:underline">Details →</button>
                  </div>
                  <div className="text-center relative" style={{ height: '130px' }}>
                    <PriorityRing score={priority.score} label={priority.label} />
                  </div>
                  <div className="mt-2 p-2 bg-white shadow-sm rounded border border-slate-200">
                    <div className="text-xs font-semibold text-slate-700">Recommended Action:</div>
                    <div className="text-xs text-slate-600 mt-0.5">{priority.recommendedAction}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Center: Technical Details */}
            <div className="space-y-4">
              <div className="gov-card">
                <div className="gov-card-header">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Technical Details</h3>
                </div>
                <div className="p-4 space-y-2 text-sm">
                  {/* Common */}
                  {asset.constructionYear && <div className="flex justify-between"><span className="text-slate-500">Commissioned</span><span className="font-medium">{asset.constructionYear}</span></div>}
                  {asset.currentValue && <div className="flex justify-between"><span className="text-slate-500">Current Value</span><span className="font-medium">{formatCurrency(asset.currentValue)}</span></div>}
                  {asset.owner && <div className="flex justify-between"><span className="text-slate-500">Ownership</span><span className="font-medium">{asset.owner}</span></div>}
                  <div className="border-t border-slate-200 pt-2 mt-2" />

                  {/* Road-specific */}
                  {asset.type === 'Road' && <>
                    {asset.length && <div className="flex justify-between"><span className="text-slate-500">Length</span><span className="font-medium">{asset.length} km</span></div>}
                    {asset.width && <div className="flex justify-between"><span className="text-slate-500">Width</span><span className="font-medium">{asset.width} m</span></div>}
                    {asset.lanes && <div className="flex justify-between"><span className="text-slate-500">Lanes</span><span className="font-medium">{asset.lanes}</span></div>}
                    {asset.surfaceType && <div className="flex justify-between"><span className="text-slate-500">Surface Type</span><span className="font-medium">{asset.surfaceType}</span></div>}
                    {asset.trafficCategory && <div className="flex justify-between"><span className="text-slate-500">Traffic Category</span><span className="font-medium">{asset.trafficCategory}</span></div>}
                    {asset.roadNumber && <div className="flex justify-between"><span className="text-slate-500">Road Number</span><span className="font-mono font-medium">{asset.roadNumber}</span></div>}
                  </>}

                  {/* Building-specific */}
                  {asset.type === 'Building' && <>
                    {asset.buildingType && <div className="flex justify-between"><span className="text-slate-500">Building Type</span><span className="font-medium">{asset.buildingType}</span></div>}
                    {asset.floors && <div className="flex justify-between"><span className="text-slate-500">Floors</span><span className="font-medium">{asset.floors}</span></div>}
                    {asset.builtUpArea && <div className="flex justify-between"><span className="text-slate-500">Built-up Area</span><span className="font-medium">{asset.builtUpArea?.toLocaleString()} sq.m</span></div>}
                    {asset.capacity && <div className="flex justify-between"><span className="text-slate-500">Capacity</span><span className="font-medium">{asset.capacity} persons</span></div>}
                    {asset.occupancy && <div className="flex justify-between"><span className="text-slate-500">Occupancy</span><span className="font-medium">{asset.occupancy}</span></div>}
                  </>}

                  {/* Bridge-specific */}
                  {asset.type === 'Bridge' && <>
                    {asset.bridgeType && <div className="flex justify-between"><span className="text-slate-500">Bridge Type</span><span className="font-medium">{asset.bridgeType}</span></div>}
                    {asset.length && <div className="flex justify-between"><span className="text-slate-500">Length</span><span className="font-medium">{asset.length} m</span></div>}
                    {asset.width && <div className="flex justify-between"><span className="text-slate-500">Width</span><span className="font-medium">{asset.width} m</span></div>}
                    {asset.lanes && <div className="flex justify-between"><span className="text-slate-500">Lanes</span><span className="font-medium">{asset.lanes}</span></div>}
                  </>}

                  {/* Coordinates */}
                  {asset.lat && asset.lng && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Coordinates</span>
                      <span className="font-mono text-xs">{asset.lat.toFixed(4)}, {asset.lng.toFixed(4)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Recent Activity */}
            <div className="space-y-4">
              {/* Recent Inspections */}
              <div className="gov-card">
                <div className="gov-card-header">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Recent Inspections</h3>
                  <button onClick={() => setActiveTab('inspections')} className="text-xs text-blue-700">View all →</button>
                </div>
                <div className="divide-y divide-slate-100">
                  {inspections.slice(0, 3).map(ins => (
                    <div key={ins.id} className="px-4 py-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-xs font-semibold text-blue-700">{ins.id}</span>
                        <span className={`badge text-xs ${ins.severityRating === 'Critical' ? 'badge-critical' : ins.severityRating === 'High' ? 'badge-high' : 'badge-neutral'}`}>{ins.severityRating}</span>
                      </div>
                      <div className="text-xs text-slate-600">{ins.type} Inspection</div>
                      <div className="text-xs text-slate-500">{formatDate(ins.date)} • {ins.inspector}</div>
                    </div>
                  ))}
                  {inspections.length === 0 && <div className="px-4 py-4 text-xs text-slate-500">No inspections recorded</div>}
                </div>
              </div>

              {/* Open Defects */}
              <div className="gov-card">
                <div className="gov-card-header">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                    Open Defects
                    {openDefects.length > 0 && <span className="w-5 h-5 rounded-full bg-red-500 text-slate-900 text-xs flex items-center justify-center font-bold">{openDefects.length}</span>}
                  </h3>
                  <button onClick={() => setActiveTab('defects')} className="text-xs text-blue-700">View all →</button>
                </div>
                <div className="divide-y divide-slate-100">
                  {openDefects.slice(0, 3).map(defect => (
                    <div key={defect.id} className="px-4 py-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-xs font-semibold text-orange-700">{defect.id}</span>
                        <span className={severityBadgeClass(defect.severity)}>{defect.severity}</span>
                      </div>
                      <div className="text-xs text-slate-700 leading-snug">{defect.description.substring(0, 80)}...</div>
                      {defect.slaDaysRemaining !== undefined && defect.slaDaysRemaining < 0 && (
                        <div className="text-xs text-red-600 font-semibold mt-1">SLA Breached by {Math.abs(defect.slaDaysRemaining)} days</div>
                      )}
                    </div>
                  ))}
                  {openDefects.length === 0 && <div className="px-4 py-4 text-xs text-green-600 flex items-center gap-1.5"><CheckCircle2 size={14} />No open defects</div>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Priority Analysis Tab ─────────────────────────────── */}
        {activeTab === 'priority' && priority && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Score card */}
            <div className="gov-card p-6">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-6">Infrastructure Priority Engine</h2>
              <div className="flex items-start gap-8 mb-6">
                <div className="relative" style={{ height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <PriorityRing score={priority.score} label={priority.label} />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-slate-900 mb-2">Recommended Action</div>
                  <div className={`p-3 rounded-lg border text-sm font-semibold
                    ${priority.label === 'Critical' ? 'bg-red-50 border-red-200 text-red-700' :
                      priority.label === 'High' ? 'bg-orange-50 border-orange-200 text-orange-600' :
                      'bg-yellow-50 border-yellow-200 text-yellow-600'}`}>
                    {priority.recommendedAction}
                  </div>
                  {priority.reasons && priority.reasons.length > 0 && (
                    <div className="mt-3 space-y-1">
                      <div className="text-xs font-semibold text-slate-600">Key Reasons:</div>
                      {priority.reasons.map((r, i) => (
                        <div key={i} className="text-xs text-slate-600 flex items-start gap-1.5">
                          <AlertTriangle size={12} className="text-orange-500 flex-shrink-0 mt-0.5" />
                          {r}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Score breakdown */}
              <div className="space-y-2">
                <div className="text-sm font-semibold text-slate-900 mb-3">Score Breakdown</div>
                {priority.explanation?.map(item => (
                  <div key={item.factor} className="flex items-center gap-3">
                    <div className="w-36 text-xs text-slate-600 flex-shrink-0">{item.factor}</div>
                    <div className="flex-1 bg-slate-100 rounded-full h-2">
                      <div
 className={`h-2 rounded-full ${item.status === 'critical' ? 'bg-red-500' : item.status === 'warning' ? 'bg-orange-400' : item.status === 'good' ? 'bg-green-500' : 'bg-slate-400'}`}
                        style={{ width: `${(item.contribution / 50) * 100}%` }}
                      />
                    </div>
                    <div className="w-6 text-xs font-bold text-right">{item.contribution}</div>
                    <div className="w-24 text-xs text-slate-500 truncate">{item.value}</div>
                    <div className={`w-16 text-xs font-semibold text-right ${item.status === 'critical' ? 'text-red-600' : item.status === 'warning' ? 'text-orange-600' : item.status === 'good' ? 'text-green-600' : 'text-slate-500'}`}>
                      {item.status === 'critical' ? '⛔ Critical' : item.status === 'warning' ? '⚠️ Warning' : item.status === 'good' ? '✅ Good' : '—'}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Evidence panel */}
            {(priority as any).evidence && (
              <div className="gov-card p-6">
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-4">Evidence & Supporting Data</h2>
                <div className="space-y-3 text-sm">
                  {[
                    { label: 'Last Inspection', value: formatDate((priority as any).evidence.lastInspection) },
                    { label: 'Open Defects', value: `${(priority as any).evidence.openDefects} defects`, alert: (priority as any).evidence.openDefects > 0 },
                    { label: 'Critical Defects', value: `${(priority as any).evidence.criticalDefects} critical`, alert: (priority as any).evidence.criticalDefects > 0 },
                    { label: 'Maintenance Overdue', value: `${(priority as any).evidence.overdueMaintenanceDays || 0} days`, alert: (priority as any).evidence.overdueMaintenanceDays > 0 },
                    { label: 'Estimated Repair Cost', value: formatCurrency((priority as any).evidence.estimatedRepairCost) },
                  ].map(item => (
                    <div key={item.label} className={`flex justify-between p-3 rounded-lg ${item.alert ? 'bg-red-50 border border-red-200' : 'bg-slate-50'}`}>
                      <span className="text-slate-600">{item.label}</span>
                      <span className={`font-semibold ${item.alert ? 'text-red-700' : 'text-slate-900'}`}>{item.value}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="text-xs font-semibold text-blue-900 flex items-center gap-1.5 mb-1">
                    <Info size={12} />
                    About This Score
                  </div>
                  <div className="text-xs text-blue-700">
                    This score is calculated by the R&B InfraGov Priority Engine using weighted factors:
                    Condition (30%), Defect Severity (up to 44 pts), Overdue Maintenance (15%), Public Impact (12%),
                    Asset Criticality (12%), Safety Risk (9%), and Open Defects Count (8 pts).
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Inspections Tab ───────────────────────────────────── */}
        {activeTab === 'inspections' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">{inspections.length} Inspections</h2>
              <Link to={`/operations/inspections/new?assetId=${id}`} className="btn-primary btn btn-sm">
                <ClipboardCheck size={14} /> New Inspection
              </Link>
            </div>
            {inspections.length === 0 ? (
              <div className="text-center py-12 text-slate-500">No inspections recorded for this asset.</div>
            ) : (
              <div className="space-y-3">
                {inspections.map(ins => (
                  <div key={ins.id} className="gov-card p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-xs font-semibold text-blue-700">{ins.id}</span>
                          <span className="badge badge-info">{ins.type}</span>
                          <span className={`badge ${ins.severityRating === 'Critical' ? 'badge-critical' : ins.severityRating === 'High' ? 'badge-high' : 'badge-neutral'}`}>{ins.severityRating}</span>
                        </div>
                        <div className="text-sm text-slate-700 mb-2">{ins.findings || 'No findings recorded'}</div>
                        {ins.recommendations && (
                          <div className="text-xs text-blue-700 bg-blue-50 px-2 py-1 rounded">
                            💡 {ins.recommendations}
                          </div>
                        )}
                        <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                          <span>By: {ins.inspector}</span>
                          <span>Date: {formatDate(ins.date)}</span>
                          {ins.conditionScoreAfter !== undefined && (
                            <span>Condition after: <span className="font-semibold">{ins.conditionScoreAfter}/100</span></span>
                          )}
                        </div>
                      </div>
                    </div>
                    {/* Inspection items */}
                    {ins.items && ins.items.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-200">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {ins.items.map(item => (
                            <div key={item.id || item.category} className={`p-2 rounded text-xs ${item.severity === 'Critical' ? 'bg-red-50 border border-red-200' : item.severity === 'High' ? 'bg-orange-50 border border-orange-200' : 'bg-slate-50 border border-slate-200'}`}>
                              <div className="font-semibold text-slate-900">{item.category}</div>
                              <div className="text-slate-500">{item.remarks}</div>
                              <div className={`mt-1 font-bold ${item.severity === 'Critical' ? 'text-red-700' : item.severity === 'High' ? 'text-orange-600' : 'text-slate-600'}`}>
                                Rating: {item.rating}/5 — {item.severity}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Defects Tab ───────────────────────────────────────── */}
        {activeTab === 'defects' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">{defects.length} Defects ({openDefects.length} open)</h2>
            </div>
            {defects.length === 0 ? (
              <div className="text-center py-12 text-green-600 flex flex-col items-center gap-2">
                <CheckCircle2 size={32} />
                No defects recorded for this asset.
              </div>
            ) : (
              <div className="gov-card overflow-hidden">
                <table className="gov-table">
                  <thead>
                    <tr>
                      <th>Defect ID</th>
                      <th>Description</th>
                      <th>Severity</th>
                      <th>Status</th>
                      <th>SLA</th>
                      <th>Work Order</th>
                      <th>Reported</th>
                    </tr>
                  </thead>
                  <tbody>
                    {defects.map(d => (
                      <tr key={d.id}>
                        <td className="id-col font-mono">{d.id}</td>
                        <td className="max-w-xs">
                          <div className="text-sm text-slate-700 leading-snug">{d.description}</div>
                        </td>
                        <td><span className={severityBadgeClass(d.severity)}>{d.severity}</span></td>
                        <td><span className={statusBadgeClass(d.status)}>{d.status}</span></td>
                        <td>
                          {d.slaDaysRemaining !== undefined ? (
                            <span className={`text-xs font-semibold ${d.slaDaysRemaining < 0 ? 'text-red-700' : d.slaDaysRemaining < 3 ? 'text-orange-600' : 'text-green-600'}`}>
                              {d.slaDaysRemaining < 0 ? `${Math.abs(d.slaDaysRemaining)}d overdue` : `${d.slaDaysRemaining}d left`}
                            </span>
                          ) : '—'}
                        </td>
                        <td>
                          {d.workOrderId ? (
                            <Link to={`/operations/work-orders/${d.workOrderId}`} className="font-mono text-xs text-blue-700 hover:text-blue-800">{d.workOrderId}</Link>
                          ) : <span className="text-slate-500 text-xs">Not raised</span>}
                        </td>
                        <td className="text-xs text-slate-500">{formatDate(d.createdDate)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── Work Orders Tab ───────────────────────────────────── */}
        {activeTab === 'workorders' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">{workOrders.length} Work Orders</h2>
              <Link to={`/operations/work-orders/new?assetId=${id}`} className="btn-primary btn btn-sm">
                <Wrench size={14} /> Raise Work Order
              </Link>
            </div>
            {workOrders.length === 0 ? (
              <div className="text-center py-12 text-slate-500">No work orders for this asset.</div>
            ) : (
              <div className="space-y-3">
                {workOrders.map(wo => (
                  <div key={wo.id} className="gov-card p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Link to={`/operations/work-orders/${wo.id}`} className="font-mono text-xs font-semibold text-blue-700 hover:text-blue-900">{wo.id}</Link>
                          <span className={`badge ${wo.priority === 'Critical' ? 'badge-critical' : wo.priority === 'High' ? 'badge-high' : 'badge-medium'}`}>{wo.priority}</span>
                          <span className={statusBadgeClass(wo.status)}>{wo.status}</span>
                          {wo.type && <span className="badge badge-neutral">{wo.type}</span>}
                        </div>
                        <div className="text-sm font-medium text-slate-900">{wo.problem}</div>
                        <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                          {wo.assignedEngineerName && <span>Assigned: {wo.assignedEngineerName}</span>}
                          {wo.estimatedCost && <span>Estimate: {formatCurrency(wo.estimatedCost)}</span>}
                          {wo.expectedCompletion && <span>Due: {formatDate(wo.expectedCompletion)}</span>}
                        </div>
                        {/* Approval chain */}
                        {wo.approvalChain && wo.approvalChain.length > 0 && (
                          <div className="flex items-center gap-2 mt-2">
                            {wo.approvalChain.map((step, i) => (
                              <div key={i} className="flex items-center gap-1 text-xs">
                                {step.status === 'Approved' ? <CheckCircle2 size={12} className="text-green-600" /> : <Clock size={12} className="text-slate-500" />}
                                <span className={step.status === 'Approved' ? 'text-green-600' : 'text-slate-500'}>{step.role}</span>
                                {i < wo.approvalChain!.length - 1 && <ChevronRight size={10} className="text-slate-700" />}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Lifecycle Timeline Tab ────────────────────────────── */}
        {activeTab === 'lifecycle' && (
          <div className="max-w-2xl">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-6">Lifecycle Timeline</h2>
            <LifecycleTimeline events={lifecycle} />
          </div>
        )}

        {/* ── Documents Tab ─────────────────────────────────────── */}
        {activeTab === 'documents' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Documents & Records</h2>
              <button className="btn-primary btn btn-sm"><FileText size={14} /> Upload Document</button>
            </div>
            <div className="gov-card p-8 text-center text-slate-500">
              <FileText size={32} className="mx-auto mb-2 opacity-40" />
              <div className="text-sm">No documents uploaded for this asset.</div>
              <div className="text-xs mt-1">Upload drawings, inspection reports, test certificates, and photos.</div>
            </div>
          </div>
        )}
      </div>

      {/* ── Update Status Modal ────────────────────────────────────── */}
      {showUpdateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h2 className="text-lg font-bold text-slate-900">Update Asset Status</h2>
              <button onClick={() => setShowUpdateModal(false)} className="text-slate-400 hover:text-slate-600">
                <XCircle size={20} />
              </button>
            </div>
            
            <form onSubmit={handleUpdateSubmit} className="p-6 space-y-5">
              <div>
                <label className="form-label flex justify-between">
                  <span>Condition Score</span>
                  <span className="font-bold text-blue-700">{updateForm.condition}/100</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={updateForm.condition}
                  onChange={e => setUpdateForm({ ...updateForm, condition: parseInt(e.target.value) })}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>Critical (0)</span>
                  <span>Excellent (100)</span>
                </div>
              </div>
              
              <div>
                <label className="form-label">Lifecycle Status</label>
                <select
                  value={updateForm.status}
                  onChange={e => setUpdateForm({ ...updateForm, status: e.target.value })}
                  className="form-select"
                >
                  <option value="Operational">Operational</option>
                  <option value="Under Maintenance">Under Maintenance</option>
                  <option value="Critical">Critical</option>
                  <option value="Decommissioned">Decommissioned</option>
                </select>
              </div>

              <div>
                <label className="form-label">Update Reason / Notes</label>
                <textarea
                  required
                  rows={3}
                  value={updateForm.reason}
                  onChange={e => setUpdateForm({ ...updateForm, reason: e.target.value })}
                  className="form-input"
                  placeholder="e.g. Recent storm damage observed on north wing."
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button type="button" onClick={() => setShowUpdateModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" disabled={isUpdating} className="btn btn-primary min-w-[120px]">
                  {isUpdating ? 'Saving...' : 'Save Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
