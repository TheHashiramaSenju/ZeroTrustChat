import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Mail, Lock } from 'lucide-react';
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

      if (result.success) {
        toast.success('Login successful!');
        navigate('/chat');
      }
    } catch (error) {
      const errorData = error.response?.data;
      
      if (errorData?.error?.code === 'EMAIL_NOT_VERIFIED') {
        toast.error('Email not verified! Redirecting...');
        setTimeout(() => {
          navigate('/verify-email', { 
            state: { email: errorData.error.email || email } 
          });
        }, 1500);
      } else {
        const errorMessage = errorData?.error?.message || errorData?.error || 'Login failed';
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = 'https://zerotrust-backend.onrender.com/api/v1/auth/google';
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Inter:wght@400;600;700&display=swap');
        .mono { font-family: 'JetBrains Mono', monospace; }
        .glow-input:focus { box-shadow: 0 0 20px rgba(34, 197, 94, 0.2); }
      `}</style>

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 border-2 border-green-500/30 bg-green-500/5 mb-4">
            <Shield size={32} className="text-green-500" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Access Control</h1>
          <p className="text-slate-400 text-sm mono">ZEROTRUST AUTHENTICATION</p>
        </div>

        <div className="border border-slate-800 bg-slate-900/50 p-8 backdrop-blur">
          <div className="flex items-center gap-2 text-green-500 mb-6 text-xs mono">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            IDENTITY VERIFICATION
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
              className="w-full bg-green-600 hover:bg-green-500 text-white py-3 font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mono text-sm tracking-wider"
            >
              {loading ? 'AUTHENTICATING...' : 'AUTHENTICATE'}
            </button>
          </form>

          {/* DIVIDER */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-slate-900 px-3 text-slate-500 mono">OR</span>
            </div>
          </div>

          {/* GOOGLE LOGIN BUTTON */}
          <button
            onClick={handleGoogleLogin}
            type="button"
            className="w-full flex items-center justify-center gap-3 py-3 border border-slate-700 hover:border-slate-600 hover:bg-slate-800/50 text-white transition-all duration-300 mono text-sm"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            CONTINUE WITH GOOGLE
          </button>

          <div className="mt-6 text-center">
            <Link to="/register" className="text-sm text-slate-400 hover:text-green-500 transition-colors mono">
              Need access? → Register
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
