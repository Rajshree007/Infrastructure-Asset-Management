import { useEffect, useState, useRef } from 'react';
import { MapPin, Layers, Building2, AlertTriangle, RefreshCw, ZoomIn, ZoomOut } from 'lucide-react';
import api from '../lib/api';
import { MOCK_ASSETS } from '../data/mockData';
import { conditionBadgeClass, priorityBadgeClass, statusBadgeClass, formatDate } from '../lib/utils';
import { Link } from 'react-router-dom';
import type { Asset } from '../types';

// Dynamic import Leaflet to avoid SSR issues
let L: any = null;

const CONDITION_COLORS: Record<string, string> = {
  Excellent: '#10b981',
  Good: '#22c55e',
  Fair: '#f59e0b',
  Poor: '#f97316',
  Critical: '#ef4444',
};

const PRIORITY_COLORS: Record<string, string> = {
  Critical: '#dc2626',
  High: '#ea580c',
  Medium: '#d97706',
  Low: '#16a34a',
};

const TYPE_ICONS: Record<string, string> = {
  Road: '🛣️',
  Building: '🏢',
  Bridge: '🌉',
};

export default function GISPage() {
  const mapRef = useRef<any>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [selected, setSelected] = useState<Asset | null>(null);
  const [filterType, setFilterType] = useState('All');
  const [filterCondition, setFilterCondition] = useState('All');
  const [colorBy, setColorBy] = useState<'condition' | 'priority' | 'type'>('priority');
  const [loading, setLoading] = useState(true);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    // Initialize Leaflet
    import('leaflet').then(leafletModule => {
      L = leafletModule.default;
      // Fix Leaflet icon issue
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      if (mapRef.current && !mapInstanceRef.current) {
        mapInstanceRef.current = L.map(mapRef.current, {
          center: [22.8, 71.8],
          zoom: 7,
          zoomControl: false,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors © CARTO',
          maxZoom: 19,
        }).addTo(mapInstanceRef.current);

        L.control.zoom({ position: 'bottomright' }).addTo(mapInstanceRef.current);
        setMapReady(true);
      }
    });
  }, []);

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/gis/assets');
      if (data.success) setAssets(data.data);
    } catch {
      setAssets(MOCK_ASSETS.filter(a => a.lat && a.lng));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAssets(); }, []);

  // Add markers whenever assets, colorBy, or filters change
  useEffect(() => {
    if (!mapReady || !L || !mapInstanceRef.current || assets.length === 0) return;

    // Clear existing markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    const map = mapInstanceRef.current;

    let filtered = assets;
    if (filterType !== 'All') filtered = filtered.filter(a => a.type === filterType);
    if (filterCondition !== 'All') filtered = filtered.filter(a => a.conditionLabel === filterCondition);

    filtered.forEach(asset => {
      if (!asset.lat || !asset.lng) return;

      const color = colorBy === 'condition'
        ? CONDITION_COLORS[asset.conditionLabel || 'Fair']
        : colorBy === 'priority'
        ? PRIORITY_COLORS[asset.priorityLabel || 'Low']
        : '#3b82f6';

      const icon = L.divIcon({
        className: '',
        html: `<div style="
          width: 28px; height: 28px; border-radius: 50%;
          background: ${color}; border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; cursor: pointer;
          ${(asset.priorityScore || 0) >= 80 ? 'animation: pulse-dot 2s infinite;' : ''}
        ">${TYPE_ICONS[asset.type] || '📍'}</div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const marker = L.marker([asset.lat, asset.lng], { icon });
      marker.on('click', () => setSelected(asset));

      const condColor = CONDITION_COLORS[asset.conditionLabel || 'Fair'];
      marker.bindTooltip(`
        <div style="min-width: 200px; font-family: Inter, sans-serif; background: rgba(3,7,18,0.9); border: 1px solid rgba(255,255,255,0.1); padding: 12px; border-radius: 8px; color: white; backdrop-filter: blur(8px);">
          <div style="font-weight: bold; font-size: 13px; margin-bottom: 4px; color: white;">${asset.name}</div>
          <div style="font-size: 11px; color: #94a3b8;">${asset.id} • ${asset.type} • ${asset.district}</div>
          <div style="margin-top: 6px; display: flex; gap: 6px; align-items: center;">
            <div style="background: ${condColor}20; color: ${condColor}; border: 1px solid ${condColor}50; padding: 2px 8px; border-radius: 10px; font-size: 11px; font-weight: 600;">
              ${asset.conditionLabel} (${asset.condition})
            </div>
            <div style="background: ${color}20; color: ${color}; border: 1px solid ${color}50; padding: 2px 8px; border-radius: 10px; font-size: 11px; font-weight: 600;">
              Priority: ${asset.priorityScore}
            </div>
          </div>
        </div>
      `, { permanent: false, sticky: true, opacity: 1, className: 'leaflet-gov-tooltip' });

      marker.addTo(map);
      markersRef.current.push(marker);
    });
  }, [assets, colorBy, filterType, filterCondition, mapReady]);

  const flyToAsset = (asset: Asset) => {
    if (asset.lat && asset.lng && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([asset.lat, asset.lng], 13, { animate: true, duration: 1 });
    }
    setSelected(asset);
  };

  const filteredAssets = assets
    .filter(a => filterType === 'All' || a.type === filterType)
    .filter(a => filterCondition === 'All' || a.conditionLabel === filterCondition);

  return (
    <div className="flex h-full" style={{ height: 'calc(100vh - 56px)' }}>
      {/* ── Left Panel ─────────────────────────────────────────── */}
      <div className="w-72 flex-shrink-0 bg-slate-50 border-r border-slate-200 flex flex-col overflow-hidden ">
        {/* Header */}
        <div className="px-4 py-4 border-b border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
              <MapPin size={16} className="text-blue-700" />
              GIS Asset Map
            </h2>
            <button onClick={fetchAssets} className="btn-icon p-1 hover:bg-slate-100 text-slate-500 hover:text-slate-900 rounded transition-colors">
              <RefreshCw size={14} className={loading ? 'animate-spin text-blue-700' : ''} />
            </button>
          </div>
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">{filteredAssets.length} assets shown on map</div>

          {/* Color By */}
          <div className="mb-3">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Color by:</div>
            <div className="flex gap-1">
              {(['priority', 'condition', 'type'] as const).map(opt => (
                <button
                  key={opt}
                  onClick={() => setColorBy(opt)}
 className={`flex-1 py-1 text-[10px] font-bold rounded uppercase tracking-wider ${colorBy === opt ? 'bg-cyan-500/20 text-blue-700 border border-blue-300' : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-transparent'}`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Filters */}
          <div className="space-y-2">
            <select value={filterType} onChange={e => setFilterType(e.target.value)} className="form-select text-xs w-full">
              {['All', 'Road', 'Building', 'Bridge'].map(t => <option key={t}>{t}</option>)}
            </select>
            <select value={filterCondition} onChange={e => setFilterCondition(e.target.value)} className="form-select text-xs w-full">
              {['All', 'Excellent', 'Good', 'Fair', 'Poor', 'Critical'].map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {/* Legend */}
        <div className="px-4 py-3 border-b border-slate-200 bg-white">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">LEGEND — {colorBy === 'condition' ? 'Condition' : colorBy === 'priority' ? 'Priority' : 'Type'}</div>
          <div className="grid grid-cols-2 gap-2">
            {colorBy === 'priority' ? Object.entries(PRIORITY_COLORS).map(([label, color]) => (
              <div key={label} className="flex items-center gap-1.5 text-xs">
                <div className="w-2.5 h-2.5 rounded-full shadow-[0_0_8px_currentColor]" style={{ background: color, color }} />
                <span className="text-slate-700 text-[10px] font-bold uppercase tracking-wider">{label}</span>
              </div>
            )) : colorBy === 'condition' ? Object.entries(CONDITION_COLORS).map(([label, color]) => (
              <div key={label} className="flex items-center gap-1.5 text-xs">
                <div className="w-2.5 h-2.5 rounded-full shadow-[0_0_8px_currentColor]" style={{ background: color, color }} />
                <span className="text-slate-700 text-[10px] font-bold uppercase tracking-wider">{label}</span>
              </div>
            )) : Object.entries(TYPE_ICONS).map(([type, icon]) => (
              <div key={type} className="flex items-center gap-1.5 text-xs">
                <span>{icon}</span>
                <span className="text-slate-700 text-[10px] font-bold uppercase tracking-wider">{type}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Asset list */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {filteredAssets.map(asset => (
            <button
              key={asset.id}
              onClick={() => flyToAsset(asset)}
 className={`w-full text-left px-4 py-3 border-b border-slate-200 hover:bg-slate-50 transition-colors ${selected?.id === asset.id ? 'bg-blue-50 border-l-2 border-l-cyan-400' : 'border-l-2 border-l-transparent'}`}
            >
              <div className="flex items-start gap-2">
                <span className="text-base">{TYPE_ICONS[asset.type]}</span>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-slate-900 truncate">{asset.name}</div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">{asset.id} • {asset.district}</div>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: CONDITION_COLORS[asset.conditionLabel || 'Fair'], boxShadow: `0 0 5px ${CONDITION_COLORS[asset.conditionLabel || 'Fair']}` }} />
                    <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">{asset.conditionLabel} ({asset.condition})</span>
                    {(asset.priorityScore || 0) >= 80 && <span className="text-[10px] text-red-700 font-bold ml-auto drop-shadow-[0_0_5px_rgba(248,113,113,0.8)]">🔴 {asset.priorityScore}</span>}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── Map ─────────────────────────────────────────────────── */}
      <div className="flex-1 relative">
        <div ref={mapRef} className="w-full h-full" />

        {/* Selected Asset Panel */}
        {selected && (
          <div className="absolute bottom-6 left-4 right-4 md:right-auto md:w-96 bg-white  rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-[1000]">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-slate-50">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] font-bold text-blue-700">{selected.id}</span>
                  <span className="badge badge-info text-[10px]">{selected.type}</span>
                  <span className={conditionBadgeClass(selected.conditionLabel)}>{selected.conditionLabel}</span>
                </div>
                <div className="text-sm font-bold text-slate-900 mt-0.5">{selected.name}</div>
              </div>
              <button onClick={() => setSelected(null)} className="text-slate-500 hover:text-slate-900 transition-colors text-lg">&times;</button>
            </div>
            <div className="p-4 space-y-2 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Condition</div>
                  <div className="font-bold text-slate-900 mt-0.5">{selected.condition}/100 — <span className="text-slate-700">{selected.conditionLabel}</span></div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Priority Score</div>
                  <div className={`font-bold mt-0.5 ${(selected.priorityScore || 0) >= 80 ? 'text-red-700' : (selected.priorityScore || 0) >= 60 ? 'text-orange-600' : 'text-slate-900'}`}>
                    {selected.priorityScore}/100 — <span className={priorityBadgeClass(selected.priorityLabel)}>{selected.priorityLabel}</span>
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">District / Division</div>
                  <div className="font-bold text-slate-700 mt-0.5">{selected.district}{selected.division ? ` / ${selected.division}` : ''}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Last Inspection</div>
                  <div className="font-bold text-slate-700 mt-0.5">{formatDate(selected.lastInspection)}</div>
                </div>
              </div>
            </div>
            <div className="px-4 pb-4">
              <Link to={`/assets/${selected.id}`} className="w-full btn-primary btn text-center justify-center block text-sm font-bold tracking-widest uppercase py-3">
                Initialize Asset 360° Scan
              </Link>
            </div>
          </div>
        )}

        {/* Map loading overlay */}
        {loading && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white border border-slate-200  shadow-lg rounded-full px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-blue-700 flex items-center gap-3 z-[1000]">
            <RefreshCw size={14} className="animate-spin text-blue-700" />
            Initializing Map Data...
          </div>
        )}

        {/* Stats overlay */}
        <div className="absolute top-4 right-4 bg-white  rounded-xl shadow-lg border border-slate-200 px-5 py-4 z-[1000] min-w-48">
          <div className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-3">Telemetry Summary</div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between gap-6">
              <span className="text-slate-700 font-medium">Roads</span>
              <span className="font-bold text-slate-900">{assets.filter(a => a.type === 'Road').length}</span>
            </div>
            <div className="flex justify-between gap-6">
              <span className="text-slate-700 font-medium">Buildings</span>
              <span className="font-bold text-slate-900">{assets.filter(a => a.type === 'Building').length}</span>
            </div>
            <div className="flex justify-between gap-6">
              <span className="text-slate-700 font-medium">Bridges</span>
              <span className="font-bold text-slate-900">{assets.filter(a => a.type === 'Bridge').length}</span>
            </div>
            <div className="border-t border-slate-200 pt-2 mt-2 flex justify-between gap-6">
              <span className="text-red-700 font-bold uppercase tracking-widest text-[10px] mt-0.5">Critical</span>
              <span className="font-bold text-red-700 text-sm drop-shadow-[0_0_8px_rgba(248,113,113,0.5)]">{assets.filter(a => (a.priorityScore || 0) >= 80).length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
