import { Router } from 'express';
import { db } from '../database/store';
import { auth } from '../middleware/auth';
import { logAudit } from '../services/audit.service';

const router = Router();
function paginate(arr: any[], page: number, limit: number) {
  const start = (page - 1) * limit;
  return { data: arr.slice(start, start + limit), total: arr.length, page, limit, totalPages: Math.ceil(arr.length / limit) };
}

// GET /api/v1/defects
router.get('/', auth, (req: any, res) => {
  let defects = Array.from(db.defects.values());
  const { assetId, severity, status, district, page = '1', limit = '20', search } = req.query as any;

  if (assetId) defects = defects.filter((d: any) => d.assetId === assetId);
  if (severity && severity !== 'All') defects = defects.filter((d: any) => d.severity === severity);
  if (status && status !== 'All') defects = defects.filter((d: any) => d.status === status);
  if (search) {
    const q = search.toLowerCase();
    defects = defects.filter((d: any) => d.id?.toLowerCase().includes(q) || d.assetId?.toLowerCase().includes(q) || d.description?.toLowerCase().includes(q));
  }

  defects.sort((a: any, b: any) => {
    const sOrder = { Critical: 4, High: 3, Medium: 2, Low: 1 };
    return (sOrder[b.severity as keyof typeof sOrder] || 0) - (sOrder[a.severity as keyof typeof sOrder] || 0);
  });

  const enriched = defects.map((d: any) => {
    const asset = db.assets.get(d.assetId);
    return { ...d, assetName: asset?.name, assetType: asset?.type, district: asset?.district || d.district };
  });

  res.json({ success: true, data: paginate(enriched, parseInt(page), parseInt(limit)), message: 'Defects retrieved' });
});

// GET /api/v1/defects/:id
router.get('/:id', auth, (req, res) => {
  const defect = db.defects.get(req.params.id);
  if (!defect) return res.status(404).json({ success: false, message: 'Defect not found' });
  const asset = db.assets.get(defect.assetId);
  const workOrder = defect.workOrderId ? db.workOrders.get(defect.workOrderId) : null;
  const inspection = defect.inspectionId ? db.inspections.get(defect.inspectionId) : null;
  res.json({ success: true, data: { ...defect, asset, workOrder, inspection }, message: 'Defect retrieved' });
});

// POST /api/v1/defects
router.post('/', auth, (req: any, res) => {
  const id = `DEF-${String(db.defects.size + 1).padStart(3, '0')}`;
  const defect = { id, ...req.body, status: 'Reported', createdDate: new Date().toISOString().split('T')[0], reportedBy: req.user.id, reportedByName: req.user.name };
  db.defects.set(id, defect);
  logAudit({ userId: req.user.id, userName: req.user.name, userRole: req.user.role, action: 'CREATE', entity: 'Defect', entityId: id, description: `Defect ${id} reported for ${req.body.assetId}`, oldValue: null, newValue: defect, reason: 'Defect identified', ipAddress: req.ip });
  res.status(201).json({ success: true, data: defect, message: 'Defect created' });
});

// PATCH /api/v1/defects/:id/status
router.patch('/:id/status', auth, (req: any, res) => {
  const defect = db.defects.get(req.params.id);
  if (!defect) return res.status(404).json({ success: false, message: 'Not found' });
  const oldStatus = defect.status;
  const updated = { ...defect, status: req.body.status, ...(req.body.assignedTo && { assignedTo: req.body.assignedTo, assignedToName: req.body.assignedToName }) };
  db.defects.set(defect.id, updated);
  logAudit({ userId: req.user.id, userName: req.user.name, userRole: req.user.role, action: 'UPDATE', entity: 'Defect', entityId: defect.id, description: `Defect status changed`, oldValue: { status: oldStatus }, newValue: { status: req.body.status }, reason: req.body.reason || 'Status update', ipAddress: req.ip });
  res.json({ success: true, data: updated, message: 'Status updated' });
});

// POST /api/v1/defects/:id/workorder - Create work order from defect
router.post('/:id/workorder', auth, (req: any, res) => {
  const defect = db.defects.get(req.params.id);
  if (!defect) return res.status(404).json({ success: false, message: 'Defect not found' });

  const woId = `WO-${new Date().getFullYear()}-${String(db.workOrders.size + 500).padStart(5, '0')}`;
  const workOrder = {
    id: woId, assetId: defect.assetId, defectIds: [defect.id],
    problem: `Defect Resolution: ${defect.description.substring(0, 100)}`,
    priority: defect.severity === 'Critical' ? 'Critical' : defect.severity === 'High' ? 'High' : 'Medium',
    status: 'Reported', type: 'Corrective',
    estimatedCost: req.body.estimatedCost || 500000,
    createdDate: new Date().toISOString().split('T')[0],
    createdBy: req.user.id, approvalStatus: 'Pending', approvalChain: [],
    ...req.body,
  };
  db.workOrders.set(woId, workOrder);

  // Link defect to work order
  db.defects.set(defect.id, { ...defect, workOrderId: woId, status: 'Assigned' });

  logAudit({ userId: req.user.id, userName: req.user.name, userRole: req.user.role, action: 'CREATE', entity: 'WorkOrder', entityId: woId, description: `Work order created from defect ${defect.id}`, oldValue: null, newValue: workOrder, reason: 'Defect resolution', ipAddress: req.ip });

  res.status(201).json({ success: true, data: workOrder, message: 'Work order created from defect' });
});

export default router;
