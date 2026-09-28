import { Router } from 'express';
import { db } from '../database/store';
import { auth } from '../middleware/auth';
import { logAudit } from '../services/audit.service';

const router = Router();
function paginate(arr: any[], page: number, limit: number) {
  const start = (page - 1) * limit;
  return { data: arr.slice(start, start + limit), total: arr.length, page, limit, totalPages: Math.ceil(arr.length / limit) };
}

// GET /api/v1/work-orders
router.get('/', auth, (req: any, res) => {
  let wos = Array.from(db.workOrders.values());
  const { assetId, status, priority, type, page = '1', limit = '20', search } = req.query as any;

  if (assetId) wos = wos.filter((w: any) => w.assetId === assetId);
  if (status && status !== 'All') wos = wos.filter((w: any) => w.status === status);
  if (priority && priority !== 'All') wos = wos.filter((w: any) => w.priority === priority);
  if (type && type !== 'All') wos = wos.filter((w: any) => w.type === type);
  if (search) {
    const q = search.toLowerCase();
    wos = wos.filter((w: any) => w.id?.toLowerCase().includes(q) || w.assetId?.toLowerCase().includes(q) || w.problem?.toLowerCase().includes(q));
  }

  const priorityOrder = { Critical: 4, High: 3, Medium: 2, Low: 1 };
  wos.sort((a: any, b: any) => (priorityOrder[b.priority as keyof typeof priorityOrder] || 0) - (priorityOrder[a.priority as keyof typeof priorityOrder] || 0));

  const enriched = wos.map((w: any) => {
    const asset = db.assets.get(w.assetId);
    return { ...w, asset: asset ? { id: asset.id, name: asset.name, type: asset.type, district: asset.district } : null };
  });

  res.json({ success: true, data: paginate(enriched, parseInt(page), parseInt(limit)), message: 'Work orders retrieved' });
});

// GET /api/v1/work-orders/:id
router.get('/:id', auth, (req, res) => {
  const wo = db.workOrders.get(req.params.id);
  if (!wo) return res.status(404).json({ success: false, message: 'Work order not found' });
  const asset = db.assets.get(wo.assetId);
  const contractor = wo.contractor ? db.contractors.get(wo.contractor) : null;
  const engineer = wo.assignedEngineer ? db.employees.get(wo.assignedEngineer) : null;
  const defects = (wo.defectIds || []).map((id: string) => db.defects.get(id)).filter(Boolean);
  const project = wo.projectId ? db.projects.get(wo.projectId) : null;
  const docs = Array.from(db.documents.values()).filter((d: any) => d.entityId === wo.id);
  const audit = Array.from(db.auditLogs.values()).filter((a: any) => a.entityId === wo.id)
    .sort((a: any, b: any) => b.timestamp.localeCompare(a.timestamp));
  res.json({ success: true, data: { ...wo, asset, contractor, engineer, defects, project, documents: docs, audit }, message: 'Work order retrieved' });
});

// POST /api/v1/work-orders
router.post('/', auth, (req: any, res) => {
  const id = `WO-${new Date().getFullYear()}-${String(db.workOrders.size + 500).padStart(5, '0')}`;
  const wo = { id, ...req.body, status: 'Reported', createdDate: new Date().toISOString().split('T')[0], createdBy: req.user.id, approvalStatus: 'Pending', approvalChain: [] };
  db.workOrders.set(id, wo);
  logAudit({ userId: req.user.id, userName: req.user.name, userRole: req.user.role, action: 'CREATE', entity: 'WorkOrder', entityId: id, description: `Work order ${id} created for ${req.body.assetId}`, oldValue: null, newValue: wo, reason: 'Work order created', ipAddress: req.ip });
  res.status(201).json({ success: true, data: wo, message: 'Work order created' });
});

// PATCH /api/v1/work-orders/:id
router.patch('/:id', auth, (req: any, res) => {
  const wo = db.workOrders.get(req.params.id);
  if (!wo) return res.status(404).json({ success: false, message: 'Not found' });
  const oldValue = { status: wo.status, assignedEngineer: wo.assignedEngineer };
  const updated = { ...wo, ...req.body };
  db.workOrders.set(wo.id, updated);
  logAudit({ userId: req.user.id, userName: req.user.name, userRole: req.user.role, action: 'UPDATE', entity: 'WorkOrder', entityId: wo.id, description: `Work order ${wo.id} updated`, oldValue, newValue: { status: updated.status }, reason: req.body.reason || 'Update', ipAddress: req.ip });
  res.json({ success: true, data: updated, message: 'Work order updated' });
});

// POST /api/v1/work-orders/:id/complete
router.post('/:id/complete', auth, (req: any, res) => {
  const wo = db.workOrders.get(req.params.id);
  if (!wo) return res.status(404).json({ success: false, message: 'Not found' });

  const updated = { ...wo, status: 'Completed', completedDate: new Date().toISOString().split('T')[0], completionRemarks: req.body.remarks };
  db.workOrders.set(wo.id, updated);

  // Update asset condition if provided
  if (req.body.newConditionScore && wo.assetId) {
    const asset = db.assets.get(wo.assetId);
    if (asset) {
      const condLabel = req.body.newConditionScore >= 80 ? 'Excellent'
        : req.body.newConditionScore >= 65 ? 'Good'
        : req.body.newConditionScore >= 50 ? 'Fair'
        : req.body.newConditionScore >= 35 ? 'Poor' : 'Critical';
      db.assets.set(asset.id, { ...asset, condition: req.body.newConditionScore, conditionLabel: condLabel });
      logAudit({ userId: req.user.id, userName: req.user.name, userRole: req.user.role, action: 'UPDATE', entity: 'Asset', entityId: asset.id, description: `Condition updated after work order completion`, oldValue: { condition: asset.condition }, newValue: { condition: req.body.newConditionScore }, reason: `Work order ${wo.id} completed`, ipAddress: req.ip });
    }
  }

  logAudit({ userId: req.user.id, userName: req.user.name, userRole: req.user.role, action: 'COMPLETE', entity: 'WorkOrder', entityId: wo.id, description: `Work order ${wo.id} completed`, oldValue: { status: 'InProgress' }, newValue: { status: 'Completed' }, reason: req.body.remarks || 'Work completed', ipAddress: req.ip });

  res.json({ success: true, data: updated, message: 'Work order completed' });
});

// POST /api/v1/work-orders/:id/assign
router.post('/:id/assign', auth, (req: any, res) => {
  const wo = db.workOrders.get(req.params.id);
  if (!wo) return res.status(404).json({ success: false, message: 'Not found' });
  const updated = { ...wo, ...req.body, status: 'Assigned' };
  db.workOrders.set(wo.id, updated);
  logAudit({ userId: req.user.id, userName: req.user.name, userRole: req.user.role, action: 'ASSIGN', entity: 'WorkOrder', entityId: wo.id, description: `Work order assigned to ${req.body.assignedEngineerName}`, oldValue: {}, newValue: req.body, reason: 'Resource assignment', ipAddress: req.ip });
  res.json({ success: true, data: updated, message: 'Work order assigned' });
});

// POST /api/v1/work-orders/:id/approve
router.post('/:id/approve', auth, (req: any, res) => {
  const wo = db.workOrders.get(req.params.id);
  if (!wo) return res.status(404).json({ success: false, message: 'Not found' });
  const chain = wo.approvalChain || [];
  chain.push({ role: req.user.role, user: req.user.name, status: 'Approved', date: new Date().toISOString().split('T')[0], remarks: req.body.remarks });
  const updated = { ...wo, approvalChain: chain, approvalStatus: 'Approved', approvedCost: wo.estimatedCost };
  db.workOrders.set(wo.id, updated);
  logAudit({ userId: req.user.id, userName: req.user.name, userRole: req.user.role, action: 'APPROVE', entity: 'WorkOrder', entityId: wo.id, description: `Work order approved by ${req.user.role}`, oldValue: { approvalStatus: wo.approvalStatus }, newValue: { approvalStatus: 'Approved' }, reason: req.body.remarks || 'Approved', ipAddress: req.ip });
  res.json({ success: true, data: updated, message: 'Work order approved' });
});

export default router;
