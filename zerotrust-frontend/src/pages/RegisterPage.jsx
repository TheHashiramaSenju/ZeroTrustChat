import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Mail, Lock, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/axios';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const passwordStrength = password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password);

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

    setLoading(true);
    try {
      // Username will be auto-generated from email in backend
      const response = await api.post('/auth/register', { email, password });
      toast.success('Registration successful! Check your email for OTP.');
      navigate('/verify-email', { state: { email } });
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Registration failed';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 border-2 border-green-500/30 bg-green-500/5 mb-4">
            <Shield size={32} className="text-green-500" />
          </div>
          <h1 className="text-3xl font-bold mb-2 text-white">Create Access</h1>
          <p className="text-slate-400 text-sm">ZEROTRUST REGISTRATION</p>
        </div>

        <div className="border border-slate-800 bg-slate-900/50 p-8">
          <div className="flex items-center gap-2 text-green-500 mb-6 text-xs">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            ACCOUNT PROVISIONING
          </div>

          <form onSubmit={handleRegister} className="space-y-5">
            <div>
              <label className="block text-xs text-slate-400 mb-2">EMAIL ADDRESS</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-3 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-700 text-white focus:border-green-500 focus:outline-none transition-all duration-300"
                  placeholder="user@domain.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-2">PASSWORD</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-3 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-700 text-white focus:border-green-500 focus:outline-none transition-all duration-300"
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
              <label className="block text-xs text-slate-400 mb-2">CONFIRM PASSWORD</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-3 text-slate-500" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-700 text-white focus:border-green-500 focus:outline-none transition-all duration-300"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-green-600 hover:bg-green-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold transition-all duration-300"
            >
              {loading ? 'PROVISIONING...' : 'CREATE ACCESS →'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/login" className="text-sm text-slate-400 hover:text-green-500">
              Already have access? Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
