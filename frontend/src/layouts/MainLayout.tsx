import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Map as MapIcon, Database, HardHat, FileText, 
  Settings, LogOut, Bell, Search, AlertTriangle, Activity, Briefcase
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function MainLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Command Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'GIS Map', icon: MapIcon, path: '/gis' },
  ];
  
  const assetItems = [
    { label: 'Asset Registry', icon: Database, path: '/assets' },
    { label: 'Priority Engine', icon: Activity, path: '/operations/priority' },
  ];

  const opsItems = [
    { label: 'Projects', icon: Briefcase, path: '/projects' },
    { label: 'Inspections', icon: FileText, path: '/operations/inspections' },
    { label: 'Defects', icon: AlertTriangle, path: '/operations/defects' },
    { label: 'Work Orders', icon: HardHat, path: '/operations/work-orders' },
  ];

  const renderNav = (items: typeof navItems) => items.map(item => {
    const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
    return (
      <Link key={item.path} to={item.path} className={`nav-item ${isActive ? 'active' : ''}`}>
        <item.icon size={18} className={isActive ? 'text-blue-700' : 'text-slate-500'} />
        {item.label}
      </Link>
    );
  });

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 text-slate-700">
      
      {/* ── Sidebar ────────────────────────────────────────────── */}
      <aside className="w-64 flex flex-col bg-slate-50 border-r border-slate-200  relative z-20">
        
        {/* Brand */}
        <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-200">
          <div className="w-8 h-8 rounded bg-blue-50 border border-blue-200 flex items-center justify-center">
            <Activity size={18} className="text-blue-700" />
          </div>
          <span className="font-bold text-slate-900 tracking-wide">R&B InfraGov</span>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {renderNav(navItems)}
          
          <div className="nav-section">Infrastructure Data</div>
          {renderNav(assetItems)}
          
          <div className="nav-section">Operations</div>
          {renderNav(opsItems)}

          <div className="nav-section">Finance & Admin</div>
          <Link to="/finance" className={`nav-item ${location.pathname.startsWith('/finance') ? 'active' : ''}`}>
            <FileText size={18} className="text-slate-500" />
            Budget & Finance
          </Link>
        </div>

        {/* User Profile Bottom */}
        <div className="p-4 border-t border-slate-200 bg-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center text-slate-900 font-bold">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-slate-900 truncate">{user?.name}</div>
              <div className="text-[10px] text-blue-700 font-mono tracking-widest uppercase truncate">{user?.role}</div>
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-slate-500 hover:text-red-700 transition-colors w-full px-2 py-1.5 rounded hover:bg-slate-50">
            <LogOut size={16} /> Logout Session
          </button>
        </div>
      </aside>

      {/* ── Main Content Area ──────────────────────────────────── */}
      <main className="flex-1 flex flex-col min-w-0 relative">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-6 bg-white border-b border-slate-200  relative z-10">
          
          <div className="flex-1 flex items-center">
            <div className="relative w-96 hidden md:block">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input type="text" placeholder="Global Search (Asset ID, Work Order...)" className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-900 focus:outline-none focus:border-blue-300 transition-colors placeholder-slate-600" />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 text-slate-500 hover:text-slate-900 transition-colors rounded-full hover:bg-slate-50">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-cyan-500 rounded-full shadow-[0_0_8px_#06b6d4]"></span>
            </button>
            <button className="p-2 text-slate-500 hover:text-slate-900 transition-colors rounded-full hover:bg-slate-50">
              <Settings size={20} />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto page-enter relative z-0">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
