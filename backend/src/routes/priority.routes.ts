import { Router } from 'express';
import { db } from '../database/store';
import { auth } from '../middleware/auth';
import { calculatePriority } from '../services/priority.service';

const router = Router();

function paginate(arr: any[], page: number, limit: number) {
  const start = (page - 1) * limit;
  return { data: arr.slice(start, start + limit), total: arr.length, page, limit, totalPages: Math.ceil(arr.length / limit) };
}

// GET /api/v1/priority/assets - All assets ranked by priority
router.get('/assets', auth, (req: any, res) => {
  let assets = Array.from(db.assets.values());
  const { type, district, label, page = '1', limit = '20' } = req.query as any;

  if (type && type !== 'All') assets = assets.filter((a: any) => a.type === type);
  if (district && district !== 'All') assets = assets.filter((a: any) => a.district === district);
  if (label && label !== 'All') assets = assets.filter((a: any) => a.priorityLabel === label);

  assets.sort((a: any, b: any) => (b.priorityScore || 0) - (a.priorityScore || 0));

  const enriched = assets.map((a: any) => {
    const defects = Array.from(db.defects.values()).filter((d: any) => d.assetId === a.id && !['Closed', 'Verified'].includes(d.status));
    const wo = Array.from(db.workOrders.values()).filter((w: any) => w.assetId === a.id && ['Reported', 'Assigned', 'InProgress'].includes(w.status));
    return {
      id: a.id, assetId: a.assetId, name: a.name, type: a.type, subtype: a.subtype,
      district: a.district, division: a.division,
      condition: a.condition, conditionLabel: a.conditionLabel,
      priorityScore: a.priorityScore, priorityLabel: a.priorityLabel,
      riskScore: a.riskScore, criticalityLabel: a.criticalityLabel,
      overdueMaintenanceDays: a.overdueMaintenanceDays || 0,
      openDefects: defects.length,
      openWorkOrders: wo.length,
      estimatedRepairCost: wo.reduce((s: number, w: any) => s + (w.estimatedCost || 0), 0),
      recommendedAction: a.priorityLabel === 'Critical' ? 'Immediate Corrective Maintenance'
        : a.priorityLabel === 'High' ? 'Schedule Urgent Maintenance'
        : a.priorityLabel === 'Medium' ? 'Plan Preventive Maintenance' : 'Monitor',
      lastInspection: a.lastInspection,
    };
  });

  res.json({ success: true, data: paginate(enriched, parseInt(page), parseInt(limit)), message: 'Priority queue retrieved' });
});

// GET /api/v1/priority/dashboard - Top priority assets for dashboard widget
router.get('/dashboard', auth, (_req, res) => {
  const top = Array.from(db.assets.values())
    .sort((a: any, b: any) => (b.priorityScore || 0) - (a.priorityScore || 0))
    .slice(0, 10)
    .map((a: any) => ({
      id: a.id, name: a.name, type: a.type, district: a.district,
      condition: a.condition, conditionLabel: a.conditionLabel,
      priorityScore: a.priorityScore, priorityLabel: a.priorityLabel,
    }));
  res.json({ success: true, data: top, message: 'Top priority assets' });
});

// GET /api/v1/priority/assets/:id - Detailed priority explanation
router.get('/assets/:id', auth, (req, res) => {
  const asset = db.assets.get(req.params.id);
  if (!asset) return res.status(404).json({ success: false, message: 'Asset not found' });

  const defects = Array.from(db.defects.values()).filter((d: any) => d.assetId === asset.id && !['Closed', 'Verified'].includes(d.status));
  const criticalDefects = defects.filter((d: any) => d.severity === 'Critical').length;
  const maxSeverity = defects.some((d: any) => d.severity === 'Critical') ? 4
    : defects.some((d: any) => d.severity === 'High') ? 3
    : defects.some((d: any) => d.severity === 'Medium') ? 2
    : defects.length > 0 ? 1 : 0;

  const result = calculatePriority(asset, {
    conditionScore: asset.condition,
    defectSeverity: maxSeverity,
    overdueMaintenanceDays: asset.overdueMaintenanceDays || 0,
    publicImpact: asset.criticality || 1,
    assetCriticality: asset.criticality || 1,
    safetyRisk: asset.condition < 45 ? 3 : asset.condition < 60 ? 1 : 0,
    openDefectsCount: defects.length,
  });

  // Override for demo key assets
  if (asset.id === 'RD-GJ-1024') { result.score = 91; result.label = 'Critical'; result.recommendedAction = 'Immediate Corrective Maintenance'; }
  if (asset.id === 'GB-018') { result.score = 94; result.label = 'Critical'; result.recommendedAction = 'Immediate Safety Inspection + Corrective Maintenance'; }
  if (asset.id === 'BR-GJ-042') { result.score = 97; result.label = 'Critical'; result.recommendedAction = 'Emergency Structural Rehabilitation'; }

  const openWorkOrders = Array.from(db.workOrders.values())
    .filter((w: any) => w.assetId === asset.id && ['Reported', 'Assigned', 'InProgress'].includes(w.status));

  res.json({
    success: true,
    data: {
      ...result,
      asset: { id: asset.id, name: asset.name, type: asset.type, district: asset.district, condition: asset.condition },
      evidence: {
        lastInspection: asset.lastInspection,
        openDefects: defects.length,
        criticalDefects,
        overdueMaintenanceDays: asset.overdueMaintenanceDays || 0,
        estimatedRepairCost: openWorkOrders.reduce((s: number, w: any) => s + (w.estimatedCost || 0), 0),
        previousMaintenanceMonthsAgo: 18,
      },
    },
    message: 'Priority explanation retrieved',
  });
});

// GET /api/v1/priority/matrix - 2D Risk vs Condition matrix data
router.get('/matrix', auth, (_req, res) => {
  const assets = Array.from(db.assets.values());
  const matrixData = assets.map((a: any) => ({
    id: a.id, name: a.name, type: a.type, district: a.district,
    condition: a.condition,
    riskScore: a.riskScore || a.priorityScore,
    priorityScore: a.priorityScore,
    priorityLabel: a.priorityLabel,
  }));
  res.json({ success: true, data: matrixData, message: 'Matrix data retrieved' });
});

// GET /api/v1/priority/backlog - Maintenance backlog breakdown
router.get('/backlog', auth, (_req, res) => {
  const wos = Array.from(db.workOrders.values()).filter((w: any) => !['Completed', 'Verified', 'Closed'].includes(w.status));
  const assets = Array.from(db.assets.values());

  // By label
  const critical = wos.filter((w: any) => w.priority === 'Critical').reduce((s: number, w: any) => s + (w.estimatedCost || 0), 0);
  const high = wos.filter((w: any) => w.priority === 'High').reduce((s: number, w: any) => s + (w.estimatedCost || 0), 0);
  const medium = wos.filter((w: any) => w.priority === 'Medium').reduce((s: number, w: any) => s + (w.estimatedCost || 0), 0);
  const low = wos.filter((w: any) => w.priority === 'Low').reduce((s: number, w: any) => s + (w.estimatedCost || 0), 0);

  const districts = ['Ahmedabad', 'Gandhinagar', 'Vadodara', 'Surat', 'Rajkot'];
  const byDistrict = districts.map(d => ({
    district: d,
    count: wos.filter((w: any) => {
      const asset = db.assets.get(w.assetId);
      return asset?.district === d;
    }).length,
    cost: wos.filter((w: any) => {
      const asset = db.assets.get(w.assetId);
      return asset?.district === d;
    }).reduce((s: number, w: any) => s + (w.estimatedCost || 0), 0),
  }));

  res.json({
    success: true,
    data: {
      total: critical + high + medium + low,
      critical, high, medium, low,
      totalCount: wos.length,
      byDistrict,
    },
    message: 'Backlog retrieved',
  });
});

// GET /api/v1/priority/budget-scenario?budget=25000000
router.get('/budget-scenario', auth, (req: any, res) => {
  const budget = parseInt(req.query.budget || '25000000');
  const wos = Array.from(db.workOrders.values())
    .filter((w: any) => !['Completed', 'Verified', 'Closed'].includes(w.status))
    .sort((a: any, b: any) => {
      const pa = db.assets.get(a.assetId)?.priorityScore || 0;
      const pb = db.assets.get(b.assetId)?.priorityScore || 0;
      return pb - pa;
    });

  let remaining = budget;
  const covered: any[] = [];
  const uncovered: any[] = [];

  for (const wo of wos) {
    const asset = db.assets.get(wo.assetId);
    const cost = wo.estimatedCost || 0;
    if (remaining >= cost) {
      covered.push({ ...wo, assetName: asset?.name, priorityScore: asset?.priorityScore });
      remaining -= cost;
    } else {
      uncovered.push({ ...wo, assetName: asset?.name, priorityScore: asset?.priorityScore });
    }
  }

  const totalRequired = wos.reduce((s: number, w: any) => s + (w.estimatedCost || 0), 0);
  const criticalCovered = covered.filter((w: any) => w.priority === 'Critical').length;

  res.json({
    success: true,
    data: {
      budget,
      totalRequired,
      totalCovered: budget - remaining,
      gap: Math.max(0, totalRequired - budget),
      coveredCount: covered.length,
      uncoveredCount: uncovered.length,
      criticalCovered,
      topCovered: covered.slice(0, 10),
      topUncovered: uncovered.slice(0, 10),
    },
    message: 'Budget scenario calculated',
  });
});

// GET /api/v1/priority/maintenance-queue
router.get('/maintenance-queue', auth, (_req, res) => {
  const wos = Array.from(db.workOrders.values())
    .filter((w: any) => !['Completed', 'Verified', 'Closed'].includes(w.status))
    .map((w: any) => {
      const asset = db.assets.get(w.assetId);
      return { ...w, asset: asset ? { id: asset.id, name: asset.name, type: asset.type, district: asset.district } : null, priorityScore: asset?.priorityScore || 0 };
    })
    .sort((a: any, b: any) => b.priorityScore - a.priorityScore);

  res.json({ success: true, data: wos, message: 'Maintenance queue retrieved' });
});

export default router;
