import { Router } from 'express';
import { db } from '../database/store';
import { auth } from '../middleware/auth';

const router = Router();

router.get('/', auth, (req: any, res) => {
  let docs = Array.from(db.documents.values());
  const { entityType, entityId } = req.query as any;
  if (entityType) docs = docs.filter((d: any) => d.entityType === entityType);
  if (entityId) docs = docs.filter((d: any) => d.entityId === entityId);
  res.json({ success: true, data: docs, message: 'Documents retrieved' });
});

router.post('/', auth, (req: any, res) => {
  const id = `DOC-${String(db.documents.size + 1).padStart(3, '0')}`;
  const doc = { id, ...req.body, uploadedBy: req.user.id, uploadedDate: new Date().toISOString().split('T')[0], version: '1.0' };
  db.documents.set(id, doc);
  res.status(201).json({ success: true, data: doc, message: 'Document created' });
});

router.get('/:id', auth, (req, res) => {
  const doc = db.documents.get(req.params.id);
  if (!doc) return res.status(404).json({ success: false, message: 'Not found' });
  res.json({ success: true, data: doc, message: 'Document retrieved' });
});

export default router;
