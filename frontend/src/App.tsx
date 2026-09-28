import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

// Layouts
import MainLayout from './layouts/MainLayout';

// Pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import AssetRegistryPage from './pages/AssetRegistryPage';
import AssetFormPage from './pages/AssetFormPage';
import Asset360Page from './pages/Asset360Page';
import GISPage from './pages/GISPage';
import PriorityCenterPage from './pages/PriorityCenterPage';
import ProjectsPage from './pages/ProjectsPage';
import InspectionsPage from './pages/InspectionsPage';
import DefectsPage from './pages/DefectsPage';
import WorkOrdersPage from './pages/WorkOrdersPage';
import FinancePage from './pages/FinancePage';

// Auth Guard
function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<RequireAuth><MainLayout /></RequireAuth>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="assets" element={<AssetRegistryPage />} />
        <Route path="assets/new" element={<AssetFormPage />} />
        <Route path="assets/:id" element={<Asset360Page />} />
        <Route path="gis" element={<GISPage />} />
        <Route path="operations/priority" element={<PriorityCenterPage />} />
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="operations/inspections" element={<InspectionsPage />} />
        <Route path="operations/defects" element={<DefectsPage />} />
        <Route path="operations/work-orders" element={<WorkOrdersPage />} />
        <Route path="finance" element={<FinancePage />} />
        
        {/* Placeholder routes for others */}
        <Route path="*" element={<div className="p-12 text-center text-slate-500">Page under construction</div>} />
      </Route>
    </Routes>
  );
}
