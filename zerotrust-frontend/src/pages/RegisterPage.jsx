import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Mail, Lock, User, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/axios';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [loading, setLoading] = useState(false);

  const passwordStrength = password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password);

  const checkUsername = async (value) => {
    if (value.length < 3) {
      setUsernameAvailable(null);
      return;
    }

    try {
      const { data } = await api.post('/auth/check-username', { username: value });
      setUsernameAvailable(data.available);
    } catch (error) {
      console.error('Username check failed');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (!passwordStrength) {
      toast.error('Password must be 8+ characters with uppercase and number');
      return;
    }

    if (!usernameAvailable) {
      toast.error('Please choose an available username');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/register', { email, password, username });
      toast.success('Check your email for verification code!');
      navigate('/verify-email', { state: { email } });
    } catch (error) {
      toast.error(error.response?.data?.error || 'Registration failed');
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
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 border-2 border-green-500/30 bg-green-500/5 mb-4">
            <Shield size={32} className="text-green-500" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Create Access</h1>
          <p className="text-slate-400 text-sm mono">ZEROTRUST REGISTRATION</p>
        </div>

        <div className="border border-slate-800 bg-slate-900/50 p-8 backdrop-blur">
          <div className="flex items-center gap-2 text-green-500 mb-6 text-xs mono">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            ACCOUNT PROVISIONING
          </div>

          <form onSubmit={handleRegister} className="space-y-5">
            <div>
              <label className="block text-xs text-slate-400 mb-2 mono">USERNAME</label>
              <div className="relative">
                <User size={18} className="absolute left-3 top-3 text-slate-500" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    checkUsername(e.target.value);
                  }}
                  className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-700 text-white focus:border-green-500 focus:outline-none transition-all duration-300 glow-input mono text-sm"
                  placeholder="john_doe"
                  required
                />
                {usernameAvailable !== null && (
                  <div className={`absolute right-3 top-3 ${usernameAvailable ? 'text-green-500' : 'text-red-500'}`}>
                    {usernameAvailable ? '✓' : '✗'}
                  </div>
                )}
              </div>
              {username.length >= 3 && (
                <p className={`text-xs mt-1 ${usernameAvailable ? 'text-green-500' : 'text-red-500'}`}>
                  {usernameAvailable ? 'Username available' : 'Username taken'}
                </p>
              )}
            </div>

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
              <div className="mt-2 space-y-1">
                <div className={`text-xs flex items-center gap-2 ${password.length >= 8 ? 'text-green-500' : 'text-slate-600'}`}>
                  <CheckCircle2 size={12} />
                  <span>8+ characters</span>
                </div>
                <div className={`text-xs flex items-center gap-2 ${/[A-Z]/.test(password) ? 'text-green-500' : 'text-slate-600'}`}>
                  <CheckCircle2 size={12} />
                  <span>Uppercase letter</span>
                </div>
                <div className={`text-xs flex items-center gap-2 ${/[0-9]/.test(password) ? 'text-green-500' : 'text-slate-600'}`}>
                  <CheckCircle2 size={12} />
                  <span>Number</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-2 mono">CONFIRM PASSWORD</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-3 text-slate-500" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-700 text-white focus:border-green-500 focus:outline-none transition-all duration-300 glow-input mono text-sm"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !usernameAvailable}
              className="w-full py-3 bg-green-600 hover:bg-green-500 disabled:bg-slate-700 disabled:cursor-not-allowed transition-all duration-300 font-semibold mono text-sm hover:shadow-lg hover:shadow-green-500/20"
            >
              {loading ? 'PROVISIONING...' : 'CREATE ACCESS →'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-800 text-center">
            <p className="text-slate-400 text-sm">
              Already have access?{' '}
              <Link to="/login" className="text-green-500 hover:text-green-400 transition-colors mono">
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
