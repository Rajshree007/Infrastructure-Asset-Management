import { Router } from 'express';
import { db } from '../database/store';
import { auth } from '../middleware/auth';

const router = Router();

router.get('/', auth, (req: any, res) => {
  const notifs = Array.from(db.notifications.values()).sort((a: any, b: any) => b.createdAt.localeCompare(a.createdAt));
  res.json({ success: true, data: notifs, message: 'Notifications retrieved' });
});

router.patch('/:id/read', auth, (req: any, res) => {
  const notif = db.notifications.get(req.params.id);
  if (!notif) return res.status(404).json({ success: false, message: 'Not found' });
  const updated = { ...notif, read: true };
  db.notifications.set(notif.id, updated);
  res.json({ success: true, data: updated, message: 'Marked as read' });
});

router.patch('/read-all', auth, (_req, res) => {
  db.notifications.forEach((notif: any, id: string) => {
    db.notifications.set(id, { ...notif, read: true });
  });
  res.json({ success: true, message: 'All notifications marked as read' });
});

export default router;
