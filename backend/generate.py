import os

base_dir = '/Users/devdatt/Desktop/Infrastructure_mngt/backend'

files = {
    'package.json': '''{
  "name": "rb-infragov-backend",
  "version": "1.0.0",
  "scripts": {
    "dev": "ts-node-dev --respawn src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "seed": "ts-node src/database/seed.ts"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "jsonwebtoken": "^9.0.2",
    "bcryptjs": "^2.4.3",
    "uuid": "^9.0.1",
    "dotenv": "^16.4.5",
    "express-rate-limit": "^7.1.5"
  },
  "devDependencies": {
    "typescript": "^5.3.3",
    "@types/express": "^4.17.21",
    "@types/cors": "^2.8.17",
    "@types/jsonwebtoken": "^9.0.5",
    "@types/bcryptjs": "^2.4.6",
    "@types/node": "^20.11.16",
    "@types/uuid": "^9.0.8",
    "ts-node-dev": "^2.0.0"
  }
}''',

    'tsconfig.json': '''{
  "compilerOptions": {
    "target": "es2022",
    "module": "commonjs",
    "rootDir": "./src",
    "outDir": "./dist",
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "skipLibCheck": true
  }
}''',

    '.env': '''PORT=3001
JWT_SECRET=rb_infragov_secret_key_2026
NODE_ENV=development
''',
    '.env.example': '''PORT=3001
JWT_SECRET=rb_infragov_secret_key_2026
NODE_ENV=development
''',

    'src/index.ts': '''import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

dotenv.config();

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use('/api/', limiter);

import authRoutes from './routes/auth.routes';
import assetsRoutes from './routes/assets.routes';
import gisRoutes from './routes/gis.routes';
import priorityRoutes from './routes/priority.routes';
import projectsRoutes from './routes/projects.routes';
import inspectionsRoutes from './routes/inspections.routes';
import defectsRoutes from './routes/defects.routes';
import workordersRoutes from './routes/workorders.routes';
import financeRoutes from './routes/finance.routes';
import dashboardRoutes from './routes/dashboard.routes';
import employeesRoutes from './routes/employees.routes';
import contractorsRoutes from './routes/contractors.routes';
import documentsRoutes from './routes/documents.routes';
import auditRoutes from './routes/audit.routes';
import maintenanceRoutes from './routes/maintenance.routes';

import seedDb from './database/seed';
// Run seed on startup
seedDb();

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/assets', assetsRoutes);
app.use('/api/v1/gis', gisRoutes);
app.use('/api/v1/priority', priorityRoutes);
app.use('/api/v1/projects', projectsRoutes);
app.use('/api/v1/inspections', inspectionsRoutes);
app.use('/api/v1/defects', defectsRoutes);
app.use('/api/v1/work-orders', workordersRoutes);
app.use('/api/v1/finance', financeRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/employees', employeesRoutes);
app.use('/api/v1/contractors', contractorsRoutes);
app.use('/api/v1/documents', documentsRoutes);
app.use('/api/v1/audit', auditRoutes);
app.use('/api/v1/maintenance', maintenanceRoutes);

app.get('/health', (req, res) => {
  res.json({ success: true, message: 'Server is healthy' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
''',

    'src/database/store.ts': '''export const db = {
  users: new Map<string, any>(),
  roles: new Map<string, any>(),
  assets: new Map<string, any>(),
  projects: new Map<string, any>(),
  inspections: new Map<string, any>(),
  defects: new Map<string, any>(),
  workOrders: new Map<string, any>(),
  employees: new Map<string, any>(),
  contractors: new Map<string, any>(),
  budgets: new Map<string, any>(),
  expenditures: new Map<string, any>(),
  documents: new Map<string, any>(),
  auditLogs: new Map<string, any>(),
  notifications: new Map<string, any>(),
  assignments: new Map<string, any>(),
  contracts: new Map<string, any>(),
  maintenanceRecords: new Map<string, any>(),
  approvals: new Map<string, any>(),
};

export const auditLog = (
  userId: string,
  userRole: string,
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'APPROVE' | 'COMPLETE',
  entity: string,
  entityId: string,
  oldValue: any,
  newValue: any,
  ipAddress: string = '127.0.0.1'
) => {
  const id = Math.random().toString(36).substring(7);
  db.auditLogs.set(id, {
    id,
    timestamp: new Date(),
    userId,
    userRole,
    action,
    entity,
    entityId,
    oldValue,
    newValue,
    ipAddress
  });
};
''',

    'src/database/seed.ts': '''import bcrypt from 'bcryptjs';
import { db } from './store';
import { calculatePriority } from '../services/priority.service';

export default async function seedDb() {
  const passwordHash = bcrypt.hashSync('Demo@1234', 10);
  
  const users = [
    { id: 'u1', email: 'admin@rbinfragov.demo', password: passwordHash, role: 'Admin', orgScope: 'ALL' },
    { id: 'u2', email: 'chief@rbinfragov.demo', password: passwordHash, role: 'Chief Engineer', orgScope: 'ALL' },
    { id: 'u3', email: 'executive@rbinfragov.demo', password: passwordHash, role: 'Executive Engineer', orgScope: 'DISTRICT' },
    { id: 'u4', email: 'engineer@rbinfragov.demo', password: passwordHash, role: 'Assistant Engineer', orgScope: 'DIVISION' },
    { id: 'u5', email: 'finance@rbinfragov.demo', password: passwordHash, role: 'Finance Officer', orgScope: 'ALL' },
    { id: 'u6', email: 'auditor@rbinfragov.demo', password: passwordHash, role: 'Auditor', orgScope: 'ALL' },
    { id: 'u7', email: 'contractor@rbinfragov.demo', password: passwordHash, role: 'Contractor', orgScope: 'SELF' }
  ];
  users.forEach(u => db.users.set(u.id, u));

  // Employees
  const emps = [
    { id: 'EMP-001', name: 'Rajesh Patel', designation: 'Chief Engineer', email: 'chief@rbinfragov.demo' },
    { id: 'EMP-002', name: 'Amit Shah', designation: 'Executive Engineer', email: 'executive@rbinfragov.demo' },
    { id: 'EMP-003', name: 'Priya Mehta', designation: 'Assistant Engineer', email: 'engineer@rbinfragov.demo' },
    { id: 'EMP-004', name: 'Kiran Desai', designation: 'Junior Engineer', email: 'junior@rbinfragov.demo' },
  ];
  emps.forEach(e => db.employees.set(e.id, e));

  // Contractors
  const contractors = [
    { id: 'CONT-001', name: 'ABC Infrastructure Pvt Ltd', regNo: 'GJCONT-2019-0421', activeContracts: 3, totalContractValue: 854000000, projectsCompleted: 12, delayedProjects: 1, defectsRecorded: 5, inspectionPassRate: 94 },
    { id: 'CONT-002', name: 'Bharat Road Construction Ltd', regNo: 'GJCONT-2020-0111', activeContracts: 2, totalContractValue: 400000000, projectsCompleted: 8, delayedProjects: 0, defectsRecorded: 2, inspectionPassRate: 96 }
  ];
  contractors.forEach(c => db.contractors.set(c.id, c));

  // Assets
  const assets = [
    {
      id: 'RD-GJ-1024', name: 'Ahmedabad Ring Road Section 4', type: 'Road', district: 'Ahmedabad', division: 'Central',
      condition: 38, conditionLabel: 'Poor', criticality: 3, lifecycleStatus: 'Operational',
      lat: 23.0225, lng: 72.5714, length: 12.4, width: 7.3, lanes: 4, surfaceType: 'Bituminous', trafficCategory: 'High',
      constructionYear: 2018, lastInspection: '2026-09-12'
    },
    {
      id: 'RD-GJ-0912', name: 'Gandhinagar-Ahmedabad Highway Connector', type: 'Road', district: 'Gandhinagar', division: 'North',
      condition: 52, conditionLabel: 'Fair', criticality: 3, lifecycleStatus: 'Operational',
      lat: 23.1111, lng: 72.5800, length: 8.5, lanes: 6, constructionYear: 2020, lastInspection: '2026-08-10'
    },
    {
      id: 'GB-018', name: 'Government District Hospital Ahmedabad', type: 'Building', district: 'Ahmedabad', division: 'Central',
      condition: 45, conditionLabel: 'Poor', criticality: 3, buildingType: 'Hospital', lifecycleStatus: 'Operational',
      lat: 23.0369, lng: 72.5596, floors: 5, builtUpArea: 8500, capacity: 450, occupancy: 'High', constructionYear: 1998
    },
    {
      id: 'GB-024', name: 'Government Primary School Gandhinagar', type: 'Building', district: 'Gandhinagar', condition: 55, conditionLabel: 'Fair', criticality: 2, priorityScore: 86
    },
    {
      id: 'BR-GJ-042', name: 'Sabarmati River Major Bridge Ahmedabad', type: 'Bridge', district: 'Ahmedabad', condition: 35, conditionLabel: 'Poor', criticality: 3, lat: 23.0435, lng: 72.5777, priorityScore: 97, riskScore: 94
    }
  ];

  // More roads
  for(let i = 0; i < 98; i++) {
    assets.push({
      id: `RD-GJ-20${i}`, name: `District Road ${i}`, type: 'Road', district: 'Rajkot', condition: Math.floor(Math.random()*100), criticality: Math.floor(Math.random()*4), lat: 22.3 + Math.random(), lng: 70.8 + Math.random()
    } as any);
  }

  assets.forEach(a => {
    const priority = calculatePriority(a, {
      conditionScore: a.condition,
      defectSeverity: a.condition < 40 ? 4 : 2,
      overdueMaintenanceDays: a.condition < 40 ? 30 : 0,
      publicImpact: 3,
      assetCriticality: a.criticality || 2,
      safetyRisk: a.condition < 40 ? 3 : 1,
      openDefectsCount: a.condition < 40 ? 2 : 0
    });
    a['priorityScore'] = priority.score;
    a['riskScore'] = priority.score - 5;
    db.assets.set(a.id, a);
  });

  // Projects
  const projects = [
    {
      id: 'PRJ-2026-001', name: 'Ahmedabad Ring Road Rehabilitation', assetId: 'RD-GJ-1024', budget: 184000000, spent: 128000000, contractor: 'CONT-001', progress: 72, status: 'UnderConstruction', startDate: '2026-01-12', endDate: '2026-11-30', milestones: { 'Foundation': 100, 'Structural': 78, 'Finishing': 35, 'Road Surface': 20 }
    }
  ];
  projects.forEach(p => db.projects.set(p.id, p));

  // Defects
  const defects = [
    { id: 'DEF-001', assetId: 'RD-GJ-1024', severity: 'Critical', description: 'Severe pavement cracking and pothole formation', status: 'InProgress', reportedBy: 'EMP-003', workOrderId: 'WO-2026-00482' },
    { id: 'DEF-002', assetId: 'RD-GJ-1024', severity: 'High', description: 'Shoulder erosion', status: 'Open' },
    { id: 'DEF-003', assetId: 'GB-018', severity: 'Critical', description: 'Fire safety system failure', status: 'Open' }
  ];
  defects.forEach(d => db.defects.set(d.id, d));

  // Work Orders
  const wos = [
    { id: 'WO-2026-00482', assetId: 'RD-GJ-1024', problem: 'Severe pavement deterioration', priority: 'High', status: 'InProgress', assignedEngineer: 'EMP-003', contractor: 'CONT-001', estimatedCost: 1850000, startDate: '2026-09-14' }
  ];
  wos.forEach(w => db.workOrders.set(w.id, w));

  // Inspections
  const inspections = [
    { id: 'INS-001', assetId: 'RD-GJ-1024', date: '2026-09-12', inspector: 'EMP-003', type: 'Routine', findings: 'Severe pavement deterioration', conditionScoreBefore: 52, conditionScoreAfter: 38, severityRating: 'Critical', defectsFound: ['DEF-001', 'DEF-002'] }
  ];
  inspections.forEach(i => db.inspections.set(i.id, i));

  // Budgets
  db.budgets.set('B-2026', { id: 'B-2026', name: 'Annual Budget 2026-27', allocated: 24500000000, committed: 18200000000, spent: 16750000000, remaining: 6300000000 });

  console.log("Database seeded successfully.");
}
''',

    'src/middleware/auth.ts': '''import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../database/store';

export const auth = (req: Request, res: Response, next: NextFunction) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ success: false, message: 'Access denied' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    (req as any).user = decoded;
    next();
  } catch (error) {
    res.status(400).json({ success: false, message: 'Invalid token' });
  }
};

export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!roles.includes(user.role)) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    next();
  };
};
''',

    'src/services/priority.service.ts': '''export interface PriorityFactors {
  conditionScore: number;
  defectSeverity: number;
  overdueMaintenanceDays: number;
  publicImpact: number;
  assetCriticality: number;
  safetyRisk: number;
  openDefectsCount: number;
}

export interface PriorityResult {
  score: number;
  label: 'Critical' | 'High' | 'Medium' | 'Low';
  explanation: any[];
  recommendedAction: string;
  reasons: string[];
}

export function calculatePriority(asset: any, factors: PriorityFactors): PriorityResult {
  const conditionWeight = (100 - factors.conditionScore) * 0.30;
  const defectWeight = factors.defectSeverity * 12;
  const overdueWeight = Math.min(factors.overdueMaintenanceDays / 3, 15);
  const impactWeight = factors.publicImpact * 5;
  const criticalityWeight = factors.assetCriticality * 4;
  const safetyWeight = factors.safetyRisk * 3;

  let score = conditionWeight + defectWeight + overdueWeight + impactWeight + criticalityWeight + safetyWeight;
  score = Math.min(100, Math.max(0, Math.round(score)));

  let label: 'Critical' | 'High' | 'Medium' | 'Low' = 'Low';
  if (score >= 80) label = 'Critical';
  else if (score >= 60) label = 'High';
  else if (score >= 40) label = 'Medium';

  return {
    score,
    label,
    explanation: [
      { factor: 'Condition', weight: conditionWeight },
      { factor: 'Defects', weight: defectWeight }
    ],
    recommendedAction: score >= 80 ? 'Immediate Action Required' : 'Schedule Maintenance',
    reasons: ['Calculated from multiple risk factors']
  };
}
''',

    'src/routes/auth.routes.ts': '''import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../database/store';
import { auth } from '../middleware/auth';

const router = Router();

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = Array.from(db.users.values()).find(u => u.email === email);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
  const token = jwt.sign({ id: user.id, role: user.role, orgScope: user.orgScope }, process.env.JWT_SECRET || 'secret');
  res.json({ success: true, data: { token, user: { id: user.id, email: user.email, role: user.role } }, message: 'Logged in' });
});

router.get('/me', auth, (req, res) => {
  const user = db.users.get((req as any).user.id);
  res.json({ success: true, data: user, message: 'Current user' });
});

router.post('/logout', (req, res) => {
  res.json({ success: true, message: 'Logged out' });
});

export default router;
''',

    'src/routes/assets.routes.ts': '''import { Router } from 'express';
import { db } from '../database/store';
import { auth } from '../middleware/auth';

const router = Router();

router.get('/', auth, (req, res) => {
  let assets = Array.from(db.assets.values());
  res.json({ success: true, data: assets, message: 'Assets listed' });
});

router.get('/:id', auth, (req, res) => {
  const asset = db.assets.get(req.params.id);
  if (!asset) return res.status(404).json({ success: false, message: 'Not found' });
  
  const inspections = Array.from(db.inspections.values()).filter(i => i.assetId === asset.id);
  const defects = Array.from(db.defects.values()).filter(d => d.assetId === asset.id);
  const wos = Array.from(db.workOrders.values()).filter(w => w.assetId === asset.id);
  const projects = Array.from(db.projects.values()).filter(p => p.assetId === asset.id);
  
  res.json({ success: true, data: { ...asset, inspections, defects, workOrders: wos, projects }, message: 'Asset details' });
});

router.post('/', auth, (req, res) => {
  const newAsset = { id: `AST-${Date.now()}`, ...req.body };
  db.assets.set(newAsset.id, newAsset);
  res.json({ success: true, data: newAsset, message: 'Asset created' });
});

export default router;
''',

    'src/routes/gis.routes.ts': '''import { Router } from 'express';
import { db } from '../database/store';
import { auth } from '../middleware/auth';

const router = Router();

router.get('/assets', auth, (req, res) => {
  const assets = Array.from(db.assets.values()).map(a => ({ id: a.id, lat: a.lat, lng: a.lng, condition: a.condition, priorityScore: a.priorityScore }));
  res.json({ success: true, data: assets, message: 'GIS assets' });
});

export default router;
''',

    'src/routes/priority.routes.ts': '''import { Router } from 'express';
import { db } from '../database/store';
import { auth } from '../middleware/auth';

const router = Router();

router.get('/assets', auth, (req, res) => {
  const assets = Array.from(db.assets.values()).sort((a, b) => (b.priorityScore || 0) - (a.priorityScore || 0));
  res.json({ success: true, data: assets, message: 'Priority assets' });
});

router.get('/dashboard', auth, (req, res) => {
  const assets = Array.from(db.assets.values()).sort((a, b) => (b.priorityScore || 0) - (a.priorityScore || 0)).slice(0, 10);
  res.json({ success: true, data: assets, message: 'Dashboard top 10' });
});

export default router;
''',

    'src/routes/projects.routes.ts': '''import { Router } from 'express';
import { db } from '../database/store';
import { auth } from '../middleware/auth';

const router = Router();

router.get('/', auth, (req, res) => {
  const projects = Array.from(db.projects.values());
  res.json({ success: true, data: projects, message: 'Projects listed' });
});

export default router;
''',

    'src/routes/inspections.routes.ts': '''import { Router } from 'express';
import { db, auditLog } from '../database/store';
import { auth } from '../middleware/auth';

const router = Router();

router.get('/', auth, (req, res) => {
  const items = Array.from(db.inspections.values());
  res.json({ success: true, data: items, message: 'Inspections listed' });
});

router.post('/', auth, (req, res) => {
  const item = { id: `INS-${Date.now()}`, ...req.body };
  db.inspections.set(item.id, item);
  
  if (item.assetId && item.conditionScoreAfter) {
    const asset = db.assets.get(item.assetId);
    if(asset) {
        asset.condition = item.conditionScoreAfter;
        db.assets.set(asset.id, asset);
    }
  }

  auditLog((req as any).user.id, (req as any).user.role, 'CREATE', 'INSPECTION', item.id, null, item);
  res.json({ success: true, data: item, message: 'Created' });
});

export default router;
''',

    'src/routes/defects.routes.ts': '''import { Router } from 'express';
import { db } from '../database/store';
import { auth } from '../middleware/auth';

const router = Router();

router.get('/', auth, (req, res) => {
  const items = Array.from(db.defects.values());
  res.json({ success: true, data: items, message: 'Defects listed' });
});

export default router;
''',

    'src/routes/workorders.routes.ts': '''import { Router } from 'express';
import { db } from '../database/store';
import { auth } from '../middleware/auth';

const router = Router();

router.get('/', auth, (req, res) => {
  const items = Array.from(db.workOrders.values());
  res.json({ success: true, data: items, message: 'Work orders listed' });
});

export default router;
''',

    'src/routes/finance.routes.ts': '''import { Router } from 'express';
import { db } from '../database/store';
import { auth } from '../middleware/auth';

const router = Router();

router.get('/summary', auth, (req, res) => {
  const b = db.budgets.get('B-2026');
  res.json({ success: true, data: b, message: 'Finance summary' });
});

export default router;
''',

    'src/routes/dashboard.routes.ts': '''import { Router } from 'express';
import { db } from '../database/store';
import { auth } from '../middleware/auth';

const router = Router();

router.get('/kpis', auth, (req, res) => {
  const assetsCount = db.assets.size;
  const criticalCount = Array.from(db.assets.values()).filter(a => (a.priorityScore || 0) >= 80).length;
  const activeProjects = db.projects.size;
  const budget = db.budgets.get('B-2026');
  
  res.json({ success: true, data: { assetsCount, criticalCount, activeProjects, budgetRemaining: budget?.remaining }, message: 'KPIs' });
});

export default router;
''',

    'src/routes/employees.routes.ts': '''import { Router } from 'express';
import { db } from '../database/store';
import { auth } from '../middleware/auth';

const router = Router();

router.get('/', auth, (req, res) => {
  res.json({ success: true, data: Array.from(db.employees.values()), message: 'Employees' });
});

export default router;
''',

    'src/routes/contractors.routes.ts': '''import { Router } from 'express';
import { db } from '../database/store';
import { auth } from '../middleware/auth';

const router = Router();

router.get('/', auth, (req, res) => {
  res.json({ success: true, data: Array.from(db.contractors.values()), message: 'Contractors' });
});

export default router;
''',

    'src/routes/documents.routes.ts': '''import { Router } from 'express';
const router = Router();
export default router;
''',

    'src/routes/audit.routes.ts': '''import { Router } from 'express';
import { db } from '../database/store';
const router = Router();
router.get('/', (req, res) => {
  res.json({ success: true, data: Array.from(db.auditLogs.values()), message: 'Audit logs' });
});
export default router;
''',

    'src/routes/maintenance.routes.ts': '''import { Router } from 'express';
const router = Router();
export default router;
'''
}

for path, content in files.items():
    full_path = os.path.join(base_dir, path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, 'w') as f:
        f.write(content)

print(f"Successfully generated {len(files)} files in {base_dir}")
