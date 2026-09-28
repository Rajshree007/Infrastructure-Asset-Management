import { Router } from 'express';
import { db } from '../database/store';
import { auth } from '../middleware/auth';

const router = Router();
function paginate(arr: any[], page: number, limit: number) {
  const start = (page - 1) * limit;
  return { data: arr.slice(start, start + limit), total: arr.length, page, limit, totalPages: Math.ceil(arr.length / limit) };
}

router.get('/', auth, (req: any, res) => {
  let audit = Array.from(db.auditLogs.values());
  const { entity, action, userId, entityId, page = '1', limit = '20', search } = req.query as any;

  if (entity && entity !== 'All') audit = audit.filter((a: any) => a.entity === entity);
  if (action && action !== 'All') audit = audit.filter((a: any) => a.action === action);
  if (userId) audit = audit.filter((a: any) => a.userId === userId);
  if (entityId) audit = audit.filter((a: any) => a.entityId === entityId);
  if (search) {
    const q = search.toLowerCase();
    audit = audit.filter((a: any) => a.userName?.toLowerCase().includes(q) || a.entityId?.toLowerCase().includes(q) || a.description?.toLowerCase().includes(q));
  }

  audit.sort((a: any, b: any) => b.timestamp.localeCompare(a.timestamp));
  res.json({ success: true, data: paginate(audit, parseInt(page), parseInt(limit)), message: 'Audit log retrieved' });
});

router.get('/:entityId', auth, (req, res) => {
  const audit = Array.from(db.auditLogs.values())
    .filter((a: any) => a.entityId === req.params.entityId)
    .sort((a: any, b: any) => b.timestamp.localeCompare(a.timestamp));
  res.json({ success: true, data: audit, message: 'Entity audit log retrieved' });
});

export default router;
