import { Router } from 'express';
import { db } from '../database/store';
import { auth } from '../middleware/auth';

const router = Router();
function paginate(arr: any[], page: number, limit: number) {
  const start = (page - 1) * limit;
  return { data: arr.slice(start, start + limit), total: arr.length, page, limit, totalPages: Math.ceil(arr.length / limit) };
}

router.get('/', auth, (req: any, res) => {
  let employees = Array.from(db.employees.values());
  const { designation, district, division, status, page = '1', limit = '20', search } = req.query as any;
  if (designation && designation !== 'All') employees = employees.filter((e: any) => e.designation === designation);
  if (district && district !== 'All') employees = employees.filter((e: any) => e.district === district);
  if (division && division !== 'All') employees = employees.filter((e: any) => e.division === division);
  if (status && status !== 'All') employees = employees.filter((e: any) => e.status === status);
  if (search) {
    const q = search.toLowerCase();
    employees = employees.filter((e: any) => e.name?.toLowerCase().includes(q) || e.id?.toLowerCase().includes(q));
  }
  res.json({ success: true, data: paginate(employees, parseInt(page), parseInt(limit)), message: 'Employees retrieved' });
});

router.get('/workload', auth, (_req, res) => {
  const employees = Array.from(db.employees.values()).filter((e: any) => e.designation !== 'Chief Engineer');
  const overloaded = employees.filter((e: any) => (e.workload || 0) > 80).length;
  const available = employees.filter((e: any) => (e.workload || 0) < 50).length;
  const onLeave = 12;
  res.json({
    success: true,
    data: { total: employees.length, overloaded, available, onLeave, assigned: employees.length - available - onLeave, employees: employees.sort((a: any, b: any) => (b.workload || 0) - (a.workload || 0)).slice(0, 15) },
    message: 'Workload retrieved',
  });
});

router.get('/:id', auth, (req, res) => {
  const emp = db.employees.get(req.params.id);
  if (!emp) return res.status(404).json({ success: false, message: 'Employee not found' });
  const assignments = Array.from(db.workOrders.values()).filter((w: any) => w.assignedEngineer === req.params.id);
  res.json({ success: true, data: { ...emp, assignments }, message: 'Employee retrieved' });
});

export default router;
