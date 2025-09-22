import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Mail, Lock, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await login(email, password);

      if (result.mfaRequired) {
        navigate('/mfa-verify', { state: { mfaToken: result.mfaToken, email } });
      } else if (result.success) {
        toast.success('Access granted');
        navigate('/chat');
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Inter:wght@400;600;700&display=swap');
        .mono { font-family: 'JetBrains Mono', monospace; }
        .glow-input:focus { box-shadow: 0 0 20px rgba(34, 197, 94, 0.2); }
      `}</style>

      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 border-2 border-green-500/30 bg-green-500/5 mb-4">
            <Shield size={32} className="text-green-500" />
          </div>
          <h1 className="text-3xl font-bold mb-2">System Access</h1>
          <p className="text-slate-400 text-sm mono">ZEROTRUST AUTHENTICATION PORTAL</p>
        </div>

        {/* Form */}
        <div className="border border-slate-800 bg-slate-900/50 p-8 backdrop-blur">
          <div className="flex items-center gap-2 text-green-500 mb-6 text-xs mono">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            SESSION INITIALIZATION
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs text-slate-400 mb-2 mono">EMAIL ADDRESS</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-3 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-700 text-white focus:border-green-500 focus:outline-none transition-all duration-300 glow-input mono text-sm"
                  placeholder="user@domain.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-2 mono">PASSWORD</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-3 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-700 text-white focus:border-green-500 focus:outline-none transition-all duration-300 glow-input mono text-sm"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-green-600 hover:bg-green-500 disabled:bg-slate-700 disabled:cursor-not-allowed transition-all duration-300 font-semibold mono text-sm hover:shadow-lg hover:shadow-green-500/20"
            >
              {loading ? 'AUTHENTICATING...' : 'AUTHENTICATE →'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-800 text-center">
            <p className="text-slate-400 text-sm">
              No credentials?{' '}
              <Link to="/register" className="text-green-500 hover:text-green-400 transition-colors mono">
                Register access
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-slate-600 mono">
          All access attempts are logged and monitored
        </div>
      </div>
    </div>
  );
}
