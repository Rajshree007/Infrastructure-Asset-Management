import { Router } from 'express';
import { db } from '../database/store';
import { auth } from '../middleware/auth';

const router = Router();

router.get('/', auth, (req: any, res) => {
  let contractors = Array.from(db.contractors.values());
  const { status, search } = req.query as any;
  if (status && status !== 'All') contractors = contractors.filter((c: any) => c.status === status);
  if (search) {
    const q = search.toLowerCase();
    contractors = contractors.filter((c: any) => c.name?.toLowerCase().includes(q) || c.id?.toLowerCase().includes(q) || c.regNo?.toLowerCase().includes(q));
  }
  res.json({ success: true, data: contractors, message: 'Contractors retrieved' });
});

router.get('/:id', auth, (req, res) => {
  const contractor = db.contractors.get(req.params.id);
  if (!contractor) return res.status(404).json({ success: false, message: 'Not found' });
  const projects = Array.from(db.projects.values()).filter((p: any) => p.contractor === req.params.id);
  const workOrders = Array.from(db.workOrders.values()).filter((w: any) => w.contractor === req.params.id);
  res.json({ success: true, data: { ...contractor, projects, workOrders }, message: 'Contractor retrieved' });
});

router.get('/:id/performance', auth, (req, res) => {
  const contractor = db.contractors.get(req.params.id);
  if (!contractor) return res.status(404).json({ success: false, message: 'Not found' });
  res.json({
    success: true,
    data: {
      projectsCompleted: contractor.projectsCompleted,
      delayedProjects: contractor.delayedProjects,
      defectsRecorded: contractor.defectsRecorded,
      inspectionPassRate: contractor.inspectionPassRate,
      totalContractValue: contractor.totalContractValue,
      activeContracts: contractor.activeContracts,
      paymentStatus: contractor.paymentStatus,
    },
    message: 'Performance data retrieved',
  });
});

export default router;
