import { Router } from 'express';
import { db } from '../database/store';
import { auth } from '../middleware/auth';
import { logAudit } from '../services/audit.service';

const router = Router();

router.get('/', auth, (req: any, res) => {
  let maintenance = Array.from(db.maintenance.values());
  const { assetId, type, status, page = '1', limit = '20' } = req.query as any;
  if (assetId) maintenance = maintenance.filter((m: any) => m.assetId === assetId);
  if (type && type !== 'All') maintenance = maintenance.filter((m: any) => m.type === type);
  if (status && status !== 'All') maintenance = maintenance.filter((m: any) => m.status === status);

  const enriched = maintenance.map((m: any) => {
    const asset = db.assets.get(m.assetId);
    return { ...m, assetName: asset?.name, assetType: asset?.type, district: asset?.district };
  });

  const total = enriched.length;
  const start = (parseInt(page) - 1) * parseInt(limit);
  res.json({ success: true, data: { data: enriched.slice(start, start + parseInt(limit)), total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / parseInt(limit)) }, message: 'Maintenance retrieved' });
});

router.get('/overdue', auth, (_req, res) => {
  const overdue = Array.from(db.maintenance.values())
    .filter((m: any) => m.status === 'Overdue')
    .map((m: any) => {
      const asset = db.assets.get(m.assetId);
      return { ...m, assetName: asset?.name, assetType: asset?.type, district: asset?.district };
    });
  res.json({ success: true, data: overdue, message: 'Overdue maintenance retrieved' });
});

router.get('/schedule', auth, (_req, res) => {
  const scheduled = Array.from(db.maintenance.values())
    .filter((m: any) => m.status === 'Scheduled')
    .map((m: any) => {
      const asset = db.assets.get(m.assetId);
      return { ...m, assetName: asset?.name, assetType: asset?.type, district: asset?.district };
    });
  res.json({ success: true, data: scheduled, message: 'Scheduled maintenance retrieved' });
});

router.get('/:id', auth, (req, res) => {
  const m = db.maintenance.get(req.params.id);
  if (!m) return res.status(404).json({ success: false, message: 'Not found' });
  const asset = db.assets.get(m.assetId);
  res.json({ success: true, data: { ...m, asset }, message: 'Retrieved' });
});

router.post('/', auth, (req: any, res) => {
  const id = `MNT-${String(db.maintenance.size + 1).padStart(3, '0')}`;
  const record = { id, ...req.body, status: 'Scheduled', createdBy: req.user.id };
  db.maintenance.set(id, record);
  logAudit({ userId: req.user.id, userName: req.user.name, userRole: req.user.role, action: 'CREATE', entity: 'Maintenance', entityId: id, description: `Maintenance ${id} scheduled`, oldValue: null, newValue: record, reason: 'New maintenance scheduled', ipAddress: req.ip });
  res.status(201).json({ success: true, data: record, message: 'Maintenance scheduled' });
});

router.patch('/:id', auth, (req: any, res) => {
  const m = db.maintenance.get(req.params.id);
  if (!m) return res.status(404).json({ success: false, message: 'Not found' });
  const updated = { ...m, ...req.body };
  db.maintenance.set(m.id, updated);
  res.json({ success: true, data: updated, message: 'Updated' });
});

export default router;
