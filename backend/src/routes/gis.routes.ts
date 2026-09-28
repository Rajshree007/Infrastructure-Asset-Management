import { Router } from 'express';
import { db } from '../database/store';
import { auth } from '../middleware/auth';

const router = Router();
function paginate(arr: any[], page: number, limit: number) {
  const start = (page - 1) * limit;
  return { data: arr.slice(start, start + limit), total: arr.length, page, limit, totalPages: Math.ceil(arr.length / limit) };
}

// GET /api/v1/gis/assets - All assets with lat/lng for map
router.get('/assets', auth, (req: any, res) => {
  let assets = Array.from(db.assets.values()).filter((a: any) => a.lat && a.lng);
  const { type, district, condition, priority } = req.query as any;

  if (type && type !== 'All') assets = assets.filter((a: any) => a.type === type);
  if (district && district !== 'All') assets = assets.filter((a: any) => a.district === district);
  if (condition && condition !== 'All') assets = assets.filter((a: any) => a.conditionLabel === condition);
  if (priority === 'Critical') assets = assets.filter((a: any) => (a.priorityScore || 0) >= 80);

  const mapped = assets.map((a: any) => ({
    id: a.id, name: a.name, type: a.type, subtype: a.subtype,
    district: a.district, division: a.division,
    lat: a.lat, lng: a.lng,
    condition: a.condition, conditionLabel: a.conditionLabel,
    priorityScore: a.priorityScore, priorityLabel: a.priorityLabel,
    riskScore: a.riskScore, criticalityLabel: a.criticalityLabel,
    lifecycleStatus: a.lifecycleStatus,
    lastInspection: a.lastInspection,
    assignedEngineer: a.assignedEngineer,
  }));

  res.json({ success: true, data: mapped, message: 'GIS assets retrieved', total: mapped.length });
});

// GET /api/v1/gis/layers
router.get('/layers', auth, (_req, res) => {
  const layers = [
    { id: 'roads', name: 'Road Network', enabled: true, count: Array.from(db.assets.values()).filter((a: any) => a.type === 'Road').length },
    { id: 'buildings', name: 'Buildings', enabled: true, count: Array.from(db.assets.values()).filter((a: any) => a.type === 'Building').length },
    { id: 'bridges', name: 'Bridges', enabled: true, count: Array.from(db.assets.values()).filter((a: any) => a.type === 'Bridge').length },
    { id: 'projects', name: 'Active Projects', enabled: false, count: Array.from(db.projects.values()).filter((p: any) => p.status === 'UnderConstruction').length },
    { id: 'maintenance', name: 'Maintenance Locations', enabled: false, count: Array.from(db.workOrders.values()).filter((w: any) => w.status === 'InProgress').length },
    { id: 'priority', name: 'Priority Layer', enabled: false, count: Array.from(db.assets.values()).filter((a: any) => (a.priorityScore || 0) >= 80).length },
  ];
  res.json({ success: true, data: layers, message: 'Layers retrieved' });
});

// GET /api/v1/gis/projects - Active projects with location
router.get('/projects', auth, (_req, res) => {
  const projects = Array.from(db.projects.values())
    .filter((p: any) => ['UnderConstruction', 'Delayed'].includes(p.status))
    .map((p: any) => {
      const asset = db.assets.get(p.assetId);
      return {
        id: p.id, name: p.name, status: p.status, progress: p.progress,
        district: p.district, lat: asset?.lat, lng: asset?.lng,
      };
    })
    .filter((p: any) => p.lat && p.lng);
  res.json({ success: true, data: projects, message: 'Project locations retrieved' });
});

export default router;
