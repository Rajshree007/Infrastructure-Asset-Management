import { Router } from 'express';
import { db } from '../database/store';
import { auth } from '../middleware/auth';
import { logAudit } from '../services/audit.service';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

function paginate(arr: any[], page: number, limit: number) {
  const start = (page - 1) * limit;
  return { data: arr.slice(start, start + limit), total: arr.length, page, limit, totalPages: Math.ceil(arr.length / limit) };
}

// GET /api/v1/inspections
router.get('/', auth, (req: any, res) => {
  let inspections = Array.from(db.inspections.values());
  const { assetId, type, severity, status, district, page = '1', limit = '20', search } = req.query as any;

  if (assetId) inspections = inspections.filter((i: any) => i.assetId === assetId);
  if (type && type !== 'All') inspections = inspections.filter((i: any) => i.type === type);
  if (severity && severity !== 'All') inspections = inspections.filter((i: any) => i.severityRating === severity);
  if (status && status !== 'All') inspections = inspections.filter((i: any) => i.status === status);
  if (search) {
    const q = search.toLowerCase();
    inspections = inspections.filter((i: any) => i.assetId?.toLowerCase().includes(q) || i.id?.toLowerCase().includes(q) || i.inspector?.toLowerCase().includes(q));
  }

  if (req.user.orgScope === 'DIVISION') {
    inspections = inspections.filter((i: any) => {
      const asset = db.assets.get(i.assetId);
      return asset?.division === req.user.division;
    });
  }

  inspections.sort((a: any, b: any) => b.date.localeCompare(a.date));

  const enriched = inspections.map((i: any) => {
    const asset = db.assets.get(i.assetId);
    return { ...i, assetName: asset?.name, assetType: asset?.type, district: asset?.district };
  });

  res.json({ success: true, data: paginate(enriched, parseInt(page), parseInt(limit)), message: 'Inspections retrieved' });
});

// GET /api/v1/inspections/templates
router.get('/templates', auth, (req: any, res) => {
  const type = req.query.type as string || 'Road';
  const templates: Record<string, any[]> = {
    Road: [
      { id: 'surface', category: 'Surface Condition', description: 'Overall pavement surface condition including cracking, deformation', ratingScale: '1-5 (1=Critical, 5=Excellent)' },
      { id: 'potholes', category: 'Potholes', description: 'Number and severity of potholes', ratingScale: '1-5' },
      { id: 'cracks', category: 'Cracks', description: 'Longitudinal, transverse, and alligator cracking', ratingScale: '1-5' },
      { id: 'drainage', category: 'Drainage', description: 'Roadside drainage functionality', ratingScale: '1-5' },
      { id: 'shoulder', category: 'Shoulder', description: 'Shoulder condition and edge deterioration', ratingScale: '1-5' },
      { id: 'signage', category: 'Signage', description: 'Road signs visibility and completeness', ratingScale: '1-5' },
      { id: 'lighting', category: 'Lighting', description: 'Street lighting functionality', ratingScale: '1-5' },
      { id: 'barriers', category: 'Safety Barriers', description: 'Crash barriers and road safety equipment', ratingScale: '1-5' },
    ],
    Building: [
      { id: 'structural', category: 'Structural Condition', description: 'Structural integrity of building', ratingScale: '1-5' },
      { id: 'electrical', category: 'Electrical Systems', description: 'Electrical wiring, panels, and fixtures', ratingScale: '1-5' },
      { id: 'plumbing', category: 'Plumbing', description: 'Water supply and sanitation systems', ratingScale: '1-5' },
      { id: 'fire_safety', category: 'Fire Safety', description: 'Fire suppression, extinguishers, emergency exits', ratingScale: '1-5' },
      { id: 'hvac', category: 'HVAC', description: 'Heating, ventilation, and air conditioning', ratingScale: '1-5' },
      { id: 'roof', category: 'Roof Condition', description: 'Roof waterproofing and structural condition', ratingScale: '1-5' },
      { id: 'elevator', category: 'Elevator', description: 'Elevator operation and safety', ratingScale: '1-5' },
      { id: 'accessibility', category: 'Accessibility', description: 'Ramps, handrails, and accessibility features', ratingScale: '1-5' },
    ],
    Bridge: [
      { id: 'deck', category: 'Deck Condition', description: 'Bridge deck surface and structural condition', ratingScale: '1-5' },
      { id: 'piers', category: 'Piers & Abutments', description: 'Structural condition of piers and abutments', ratingScale: '1-5' },
      { id: 'bearings', category: 'Bearings', description: 'Bearing pads condition', ratingScale: '1-5' },
      { id: 'rebar', category: 'Rebar Condition', description: 'Steel reinforcement corrosion and exposure', ratingScale: '1-5' },
      { id: 'scour', category: 'Foundation Scouring', description: 'River scour at pier foundations', ratingScale: '1-5' },
      { id: 'joints', category: 'Expansion Joints', description: 'Expansion joint sealing and condition', ratingScale: '1-5' },
      { id: 'railing', category: 'Railing & Barriers', description: 'Bridge railing and crash barrier condition', ratingScale: '1-5' },
      { id: 'drainage', category: 'Deck Drainage', description: 'Bridge deck drainage functionality', ratingScale: '1-5' },
    ],
  };

  res.json({ success: true, data: templates[type] || templates.Road, message: 'Template retrieved' });
});

// GET /api/v1/inspections/:id
router.get('/:id', auth, (req, res) => {
  const inspection = db.inspections.get(req.params.id);
  if (!inspection) return res.status(404).json({ success: false, message: 'Inspection not found' });
  const asset = db.assets.get(inspection.assetId);
  res.json({ success: true, data: { ...inspection, asset }, message: 'Inspection retrieved' });
});

// POST /api/v1/inspections - Create new inspection
router.post('/', auth, (req: any, res) => {
  const id = `INS-${String(db.inspections.size + 1).padStart(3, '0')}`;
  const inspection = { id, ...req.body, createdBy: req.user.id, status: 'Completed' };
  db.inspections.set(id, inspection);

  // Update asset condition
  if (req.body.assetId && req.body.conditionScoreAfter) {
    const asset = db.assets.get(req.body.assetId);
    if (asset) {
      const oldCondition = asset.condition;
      const condLabel = req.body.conditionScoreAfter >= 80 ? 'Excellent'
        : req.body.conditionScoreAfter >= 65 ? 'Good'
        : req.body.conditionScoreAfter >= 50 ? 'Fair'
        : req.body.conditionScoreAfter >= 35 ? 'Poor' : 'Critical';
      db.assets.set(asset.id, { ...asset, condition: req.body.conditionScoreAfter, conditionLabel: condLabel, lastInspection: req.body.date });

      logAudit({
        userId: req.user.id, userName: req.user.name, userRole: req.user.role,
        action: 'UPDATE', entity: 'Asset', entityId: asset.id,
        description: `Condition updated after inspection ${id}`,
        oldValue: { condition: oldCondition }, newValue: { condition: req.body.conditionScoreAfter },
        reason: `Inspection ${id} findings`, ipAddress: req.ip,
      });
    }
  }

  logAudit({
    userId: req.user.id, userName: req.user.name, userRole: req.user.role,
    action: 'CREATE', entity: 'Inspection', entityId: id,
    description: `Inspection ${id} created for asset ${req.body.assetId}`,
    oldValue: null, newValue: inspection, reason: 'New inspection submitted', ipAddress: req.ip,
  });

  res.status(201).json({ success: true, data: inspection, message: 'Inspection created' });
});

// PATCH /api/v1/inspections/:id
router.patch('/:id', auth, (req: any, res) => {
  const inspection = db.inspections.get(req.params.id);
  if (!inspection) return res.status(404).json({ success: false, message: 'Not found' });
  const updated = { ...inspection, ...req.body };
  db.inspections.set(inspection.id, updated);
  res.json({ success: true, data: updated, message: 'Inspection updated' });
});

export default router;
