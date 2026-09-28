import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

dotenv.config();

const app = express();

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json({ limit: '10mb' }));

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 1000 });
app.use('/api/', limiter);

// Import routes
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
import notificationsRoutes from './routes/notifications.routes';

// Seed DB
import seedDb from './database/seed';
seedDb().catch(console.error);

// Mount routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/assets', assetsRoutes);
app.use('/api/v1/gis', gisRoutes);
app.use('/api/v1/priority', priorityRoutes);
app.use('/api/v1/projects', projectsRoutes);
app.use('/api/v1/inspections', inspectionsRoutes);
app.use('/api/v1/defects', defectsRoutes);
app.use('/api/v1/work-orders', workordersRoutes);
app.use('/api/v1/finance', financeRoutes);
app.use('/api/v1/budgets', financeRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/employees', employeesRoutes);
app.use('/api/v1/contractors', contractorsRoutes);
app.use('/api/v1/documents', documentsRoutes);
app.use('/api/v1/audit', auditRoutes);
app.use('/api/v1/maintenance', maintenanceRoutes);
app.use('/api/v1/notifications', notificationsRoutes);

// Health check
app.get('/health', (_req, res) => {
  res.json({ success: true, message: 'R&B InfraGov API Server is running', version: '1.0.0', timestamp: new Date().toISOString() });
});

// API docs hint
app.get('/api/v1', (_req, res) => {
  res.json({
    success: true,
    message: 'R&B InfraGov REST API v1',
    endpoints: [
      '/api/v1/auth', '/api/v1/dashboard', '/api/v1/assets', '/api/v1/gis',
      '/api/v1/priority', '/api/v1/projects', '/api/v1/inspections',
      '/api/v1/defects', '/api/v1/work-orders', '/api/v1/maintenance',
      '/api/v1/finance', '/api/v1/employees', '/api/v1/contractors',
      '/api/v1/documents', '/api/v1/audit', '/api/v1/notifications',
    ],
  });
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Endpoint not found', code: 'NOT_FOUND' });
});

// Error handler
app.use((err: any, _req: any, res: any, _next: any) => {
  console.error(err);
  res.status(500).json({ success: false, message: 'Internal server error', code: 'SERVER_ERROR' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 R&B InfraGov API Server running on http://localhost:${PORT}`);
  console.log(`📊 Health: http://localhost:${PORT}/health`);
  console.log(`📋 API: http://localhost:${PORT}/api/v1`);
});

export default app;
