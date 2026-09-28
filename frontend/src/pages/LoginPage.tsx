import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Zap, Lock, Eye, EyeOff, Activity, Cpu, Database } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email: 'admin@rbinfragov.demo', password: 'Demo@1234' });
      if (data.success) {
        login(data.data.user, data.data.token);
        toast.success(`SYSTEM ACCESS GRANTED: ${data.data.user.name}`);
        navigate('/dashboard');
      }
    } catch (err: any) {
      // Fallback offline login for demo
      if (err.code === 'ERR_NETWORK' || err.code === 'ECONNREFUSED') {
        const fakeUser = { id: 'demo-u1', email: 'admin@rbinfragov.demo', name: 'System Admin', role: 'Super Admin', orgScope: 'ALL', district: 'ALL', division: 'ALL' };
        login(fakeUser, 'demo-offline-token');
        toast.success(`OFFLINE OVERRIDE GRANTED: ${fakeUser.name}`);
        navigate('/dashboard');
      } else {
        toast.error(err.response?.data?.message || 'Authorization Failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-50">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-blue-50 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-blue-900/20 blur-[100px] pointer-events-none" />
      
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 40px, #64FFDA 40px, #64FFDA 41px),
          repeating-linear-gradient(90deg, transparent, transparent 40px, #64FFDA 40px, #64FFDA 41px)`,
      }} />

      <div className="w-full max-w-5xl z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 lg:p-0">
        
        {/* Left Side: Branding & Info */}
        <div className="flex flex-col justify-center p-8 lg:p-12">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center shadow-[0_0_30px_rgba(34,211,238,0.2)]">
              <Zap size={28} className="text-blue-700" />
            </div>
            <div>
              <div className="text-slate-900 font-bold text-3xl tracking-tight">R&B InfraGov</div>
              <div className="text-blue-700 text-sm font-semibold tracking-[0.2em] uppercase mt-1">Command Center</div>
            </div>
          </div>
          
          <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 leading-tight mb-6 tracking-tight">
            Advanced<br />Infrastructure<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Intelligence</span>
          </h1>
          <p className="text-slate-500 text-lg leading-relaxed max-w-md mb-10">
            Secure access portal for state infrastructure governance, lifecycle monitoring, and priority engine analytics.
          </p>

          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4 px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 ">
              <Activity className="text-green-600" size={20} />
              <span className="text-slate-700 text-sm font-medium">System Status: <span className="text-green-600">Optimal</span></span>
            </div>
            <div className="flex items-center gap-4 px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 ">
              <Database className="text-blue-400" size={20} />
              <span className="text-slate-700 text-sm font-medium">Nodes Connected: <span className="text-slate-900 font-bold">14,204</span></span>
            </div>
          </div>
        </div>

        {/* Right Side: Single Admin Login */}
        <div className="flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-md gov-card p-10 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 to-blue-500" />
            
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-900 border border-slate-700 shadow-[0_0_20px_rgba(0,0,0,0.5)] mb-6">
                <Shield size={28} className="text-blue-700" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Admin Access</h2>
              <p className="text-slate-500 text-sm">Secure biometric / token validation required</p>
            </div>

            <form onSubmit={handleAdminLogin} className="space-y-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-slate-500 text-sm font-medium">Identity</span>
                  <span className="text-slate-900 text-sm font-mono tracking-wider">admin@rbinfragov.demo</span>
                </div>
                <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-slate-500 text-sm font-medium">Access Level</span>
                  <span className="text-blue-700 text-sm font-bold uppercase tracking-widest">Level 5 (Super Admin)</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
 className="w-full py-4 bg-cyan-500/20 text-blue-700 font-bold tracking-widest uppercase rounded-lg border border-blue-300 hover:bg-cyan-500/30 transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500 flex items-center justify-center gap-3 relative overflow-hidden group"
              >
                <Lock size={18} className="group-hover:hidden" />
                <Zap size={18} className="hidden group-hover:block" />
                {loading ? 'Authenticating...' : 'Initialize Session'}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-slate-600 text-[10px] uppercase tracking-widest">
                Unauthorized access is strictly prohibited<br/>and monitored by State Cyber Command
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
