import { Router } from 'express';
import { db } from '../database/store';
import { auth } from '../middleware/auth';

const router = Router();

// GET /api/v1/dashboard/kpis
router.get('/kpis', auth, (_req, res) => {
  const assets = Array.from(db.assets.values());
  const projects = Array.from(db.projects.values());
  const defects = Array.from(db.defects.values());
  const workOrders = Array.from(db.workOrders.values());
  const inspections = Array.from(db.inspections.values());
  const budget = db.budgets.get('B-2026') as any;

  const criticalAssets = assets.filter((a: any) => (a.priorityScore || 0) >= 80).length;
  const activeProjects = projects.filter((p: any) => ['UnderConstruction', 'Delayed', 'Tendering'].includes(p.status)).length;
  const openDefects = defects.filter((d: any) => !['Closed', 'Verified'].includes(d.status)).length;
  const openWorkOrders = workOrders.filter((w: any) => !['Completed', 'Verified', 'Closed'].includes(w.status)).length;
  const overdueInspections = inspections.filter((i: any) => i.status === 'Overdue').length;
  const poorCondition = assets.filter((a: any) => (a.condition || 50) < 40).length;

  res.json({
    success: true,
    data: {
      totalAssets: assets.length,
      activeProjects,
      annualBudget: budget?.allocated || 24500000000,
      budgetUtilization: budget ? Math.round((budget.spent / budget.allocated) * 100 * 10) / 10 : 68.4,
      criticalAssets,
      openDefects,
      openWorkOrders,
      overdueInspections,
      poorConditionAssets: poorCondition,
      budgetSpent: budget?.spent || 16750000000,
      budgetRemaining: budget?.remaining || 6300000000,
    },
    message: 'Dashboard KPIs retrieved',
  });
});

// GET /api/v1/dashboard/charts
router.get('/charts', auth, (_req, res) => {
  const assets = Array.from(db.assets.values());
  const projects = Array.from(db.projects.values());
  const workOrders = Array.from(db.workOrders.values());

  // Condition distribution
  const conditionDist = {
    Excellent: assets.filter((a: any) => (a.condition || 0) >= 80).length,
    Good: assets.filter((a: any) => (a.condition || 0) >= 65 && (a.condition || 0) < 80).length,
    Fair: assets.filter((a: any) => (a.condition || 0) >= 50 && (a.condition || 0) < 65).length,
    Poor: assets.filter((a: any) => (a.condition || 0) >= 35 && (a.condition || 0) < 50).length,
    Critical: assets.filter((a: any) => (a.condition || 0) < 35).length,
  };

  // Project status
  const projectStatus = {
    OnTrack: projects.filter((p: any) => ['UnderConstruction', 'Approved'].includes(p.status) && p.status !== 'Delayed').length,
    Delayed: projects.filter((p: any) => p.status === 'Delayed').length,
    Completed: projects.filter((p: any) => p.status === 'Completed').length,
    AtRisk: projects.filter((p: any) => p.status === 'AtRisk').length,
    Proposed: projects.filter((p: any) => p.status === 'Proposed').length,
  };

  // Budget breakdown (in Crores)
  const budget = db.budgets.get('B-2026') as any;
  const cr = 10000000;
  const budgetData = {
    allocated: budget ? Math.round(budget.allocated / cr) : 2450,
    committed: budget ? Math.round(budget.committed / cr) : 1820,
    spent: budget ? Math.round(budget.spent / cr) : 1675,
    remaining: budget ? Math.round(budget.remaining / cr) : 630,
  };

  // Maintenance breakdown
  const maintenanceTypes = {
    Preventive: workOrders.filter((w: any) => w.type === 'Preventive').length,
    Corrective: workOrders.filter((w: any) => w.type === 'Corrective').length,
    Emergency: workOrders.filter((w: any) => w.type === 'Emergency').length,
  };

  // Assets by district
  const districtNames = ['Ahmedabad', 'Gandhinagar', 'Vadodara', 'Surat', 'Rajkot'];
  const assetsByDistrict = districtNames.map(d => ({
    district: d,
    count: assets.filter((a: any) => a.district === d).length,
    critical: assets.filter((a: any) => a.district === d && (a.priorityScore || 0) >= 80).length,
  }));

  res.json({
    success: true,
    data: { conditionDist, projectStatus, budgetData, maintenanceTypes, assetsByDistrict, monthlyExpenditure: db.monthlyExpenditure },
    message: 'Chart data retrieved',
  });
});

// GET /api/v1/dashboard/attention
router.get('/attention', auth, (_req, res) => {
  const assets = Array.from(db.assets.values());
  const projects = Array.from(db.projects.values());
  const workOrders = Array.from(db.workOrders.values());

  const criticalAssets = assets
    .filter((a: any) => (a.priorityScore || 0) >= 80)
    .sort((a: any, b: any) => (b.priorityScore || 0) - (a.priorityScore || 0))
    .slice(0, 10)
    .map((a: any) => ({
      id: a.id, name: a.name, type: a.type, district: a.district,
      condition: a.condition, conditionLabel: a.conditionLabel,
      priorityScore: a.priorityScore, criticality: a.criticalityLabel,
      issue: a.condition < 40 ? 'Critical condition deterioration' : 'High priority maintenance required',
    }));

  const delayedProjects = projects
    .filter((p: any) => p.status === 'Delayed')
    .map((p: any) => ({
      id: p.id, name: p.name, district: p.district,
      progress: p.progress, daysDelayed: rnd(5, 45),
      issue: 'Project behind schedule',
    }));

  const overdueWorkOrders = workOrders
    .filter((w: any) => w.status === 'Reported' && w.priority === 'Critical')
    .slice(0, 5)
    .map((w: any) => ({
      id: w.id, assetId: w.assetId, problem: w.problem,
      priority: w.priority, estimatedCost: w.estimatedCost,
      issue: 'Critical work order pending approval',
    }));

  res.json({
    success: true,
    data: { criticalAssets, delayedProjects, overdueWorkOrders },
    message: 'Attention items retrieved',
  });
});

function rnd(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// GET /api/v1/dashboard/insights
router.get('/insights', auth, (_req, res) => {
  const assets = Array.from(db.assets.values());
  const budget = db.budgets.get('B-2026') as any;
  const projects = Array.from(db.projects.values());

  const insights = [
    {
      id: 'INS-SYST-001',
      type: 'critical',
      title: 'Critical Infrastructure Alert',
      message: `${assets.filter((a: any) => (a.priorityScore || 0) >= 80).length} critical and high-priority assets require inspection within 7 days.`,
      action: 'View Priority Center',
      actionLink: '/operations/priority',
    },
    {
      id: 'INS-SYST-002',
      type: 'warning',
      title: 'Budget Utilization Alert',
      message: `Division Central has utilized 86% of its annual maintenance allocation. Review expenditure before year end.`,
      action: 'View Budget',
      actionLink: '/finance',
    },
    {
      id: 'INS-SYST-003',
      type: 'warning',
      title: 'Project Schedule Risk',
      message: `Project PRJ-2025-048 (Surat Coastal Highway) is 23 days behind planned milestone. Escalation recommended.`,
      action: 'View Project',
      actionLink: '/projects/PRJ-2025-048',
    },
    {
      id: 'INS-SYST-004',
      type: 'info',
      title: 'Condition Trend Alert',
      message: `Road RD-GJ-1024 condition has declined from 68 to 38 over the last two inspections. Immediate corrective maintenance is recommended.`,
      action: 'View Asset',
      actionLink: '/assets/RD-GJ-1024',
    },
    {
      id: 'INS-SYST-005',
      type: 'info',
      title: 'Maintenance Recommendation',
      message: `Preventive maintenance is recommended for 12 buildings approaching their scheduled maintenance date in the next 30 days.`,
      action: 'View Maintenance',
      actionLink: '/operations/maintenance',
    },
  ];

  res.json({ success: true, data: insights, message: 'Insights retrieved' });
});

export default router;
