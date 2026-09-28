import { Router } from 'express';
import { db } from '../database/store';
import { auth } from '../middleware/auth';
import { logAudit } from '../services/audit.service';

const router = Router();
function paginate(arr: any[], page: number, limit: number) {
  const start = (page - 1) * limit;
  return { data: arr.slice(start, start + limit), total: arr.length, page, limit, totalPages: Math.ceil(arr.length / limit) };
}

// GET /api/v1/projects
router.get('/', auth, (req: any, res) => {
  let projects = Array.from(db.projects.values());
  const { status, district, contractor, page = '1', limit = '20', search } = req.query as any;

  if (status && status !== 'All') projects = projects.filter((p: any) => p.status === status);
  if (district && district !== 'All') projects = projects.filter((p: any) => p.district === district);
  if (contractor) projects = projects.filter((p: any) => p.contractor === contractor);
  if (search) {
    const q = search.toLowerCase();
    projects = projects.filter((p: any) => p.id?.toLowerCase().includes(q) || p.name?.toLowerCase().includes(q) || p.district?.toLowerCase().includes(q));
  }

  const enriched = projects.map((p: any) => {
    const contractorData = db.contractors.get(p.contractor);
    return { ...p, contractorName: contractorData?.name || p.contractorName, budgetUtilization: p.budget > 0 ? Math.round((p.spent / p.budget) * 100) : 0 };
  });

  res.json({ success: true, data: paginate(enriched, parseInt(page), parseInt(limit)), message: 'Projects retrieved' });
});

// GET /api/v1/projects/:id
router.get('/:id', auth, (req, res) => {
  const project = db.projects.get(req.params.id);
  if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
  const contractor = db.contractors.get(project.contractor);
  const asset = db.assets.get(project.assetId);
  const workOrders = Array.from(db.workOrders.values()).filter((w: any) => w.projectId === project.id);
  const inspections = Array.from(db.inspections.values()).filter((i: any) => i.assetId === project.assetId);
  const docs = Array.from(db.documents.values()).filter((d: any) => d.entityId === project.id);
  res.json({ success: true, data: { ...project, contractor, asset, workOrders, inspections, documents: docs }, message: 'Project retrieved' });
});

// POST /api/v1/projects
router.post('/', auth, (req: any, res) => {
  const id = `PRJ-${new Date().getFullYear()}-${String(db.projects.size + 1).padStart(3, '0')}`;
  const project = { id, ...req.body, status: 'Proposed', progress: 0, spent: 0 };
  db.projects.set(id, project);
  logAudit({ userId: req.user.id, userName: req.user.name, userRole: req.user.role, action: 'CREATE', entity: 'Project', entityId: id, description: `Project ${id} created`, oldValue: null, newValue: project, reason: 'New project', ipAddress: req.ip });
  res.status(201).json({ success: true, data: project, message: 'Project created' });
});

// PATCH /api/v1/projects/:id
router.patch('/:id', auth, (req: any, res) => {
  const project = db.projects.get(req.params.id);
  if (!project) return res.status(404).json({ success: false, message: 'Not found' });
  const updated = { ...project, ...req.body };
  db.projects.set(project.id, updated);
  logAudit({ userId: req.user.id, userName: req.user.name, userRole: req.user.role, action: 'UPDATE', entity: 'Project', entityId: project.id, description: `Project ${project.id} updated`, oldValue: {}, newValue: req.body, reason: 'Update', ipAddress: req.ip });
  res.json({ success: true, data: updated, message: 'Project updated' });
});

// GET /api/v1/projects/:id/milestones
router.get('/:id/milestones', auth, (req, res) => {
  const project = db.projects.get(req.params.id);
  if (!project) return res.status(404).json({ success: false, message: 'Not found' });
  res.json({ success: true, data: project.milestones || [], message: 'Milestones retrieved' });
});

export default router;
