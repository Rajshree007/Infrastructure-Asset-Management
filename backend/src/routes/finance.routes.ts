import { Router } from 'express';
import { db } from '../database/store';
import { auth } from '../middleware/auth';

const router = Router();
function paginate(arr: any[], page: number, limit: number) {
  const start = (page - 1) * limit;
  return { data: arr.slice(start, start + limit), total: arr.length, page, limit, totalPages: Math.ceil(arr.length / limit) };
}

// GET /api/v1/finance/summary
router.get('/summary', auth, (_req, res) => {
  const budget = db.budgets.get('B-2026') as any;
  const cr = 10000000;
  res.json({
    success: true,
    data: {
      financialYear: '2026-27',
      allocated: budget.allocated, allocatedCr: Math.round(budget.allocated / cr),
      committed: budget.committed, committedCr: Math.round(budget.committed / cr),
      spent: budget.spent, spentCr: Math.round(budget.spent / cr),
      remaining: budget.remaining, remainingCr: Math.round(budget.remaining / cr),
      utilization: Math.round((budget.spent / budget.allocated) * 100 * 10) / 10,
      heads: budget.heads || [],
    },
    message: 'Financial summary retrieved',
  });
});

// GET /api/v1/budgets
router.get('/', auth, (_req, res) => {
  const budgets = Array.from(db.budgets.values());
  res.json({ success: true, data: budgets, message: 'Budgets retrieved' });
});

// GET /api/v1/budgets/:id
router.get('/:id', auth, (req, res) => {
  const budget = db.budgets.get(req.params.id);
  if (!budget) return res.status(404).json({ success: false, message: 'Budget not found' });
  res.json({ success: true, data: budget, message: 'Budget retrieved' });
});

// GET /api/v1/finance/by-district
router.get('/by-district', auth, (_req, res) => {
  const districts = ['Ahmedabad', 'Gandhinagar', 'Vadodara', 'Surat', 'Rajkot'];
  const projects = Array.from(db.projects.values());
  const data = districts.map(d => {
    const dProjects = projects.filter((p: any) => p.district === d);
    return {
      district: d,
      allocated: dProjects.reduce((s: number, p: any) => s + (p.budget || 0), 0),
      spent: dProjects.reduce((s: number, p: any) => s + (p.spent || 0), 0),
      projects: dProjects.length,
    };
  });
  res.json({ success: true, data, message: 'By district retrieved' });
});

// GET /api/v1/finance/monthly
router.get('/monthly', auth, (_req, res) => {
  res.json({ success: true, data: db.monthlyExpenditure, message: 'Monthly expenditure retrieved' });
});

export default router;
