import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/axios';

export default function SetupPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const passwordStrength = password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password);

  const handleSetup = async (e) => {
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
      const token = localStorage.getItem('token');
      await api.patch('/auth/setup-password', { password }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Password setup complete! Welcome to ZeroTrust.');
      navigate('/chat');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Setup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Lock size={48} className="text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2 text-white">Setup Password</h1>
          <p className="text-slate-400">Complete your ZeroTrust account setup</p>
        </div>

        <div className="border border-slate-800 bg-slate-900/50 p-8">
          <form onSubmit={handleSetup} className="space-y-5">
            <div>
              <label className="block text-xs text-slate-400 mb-2">CREATE PASSWORD</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-700 text-white focus:border-green-500 focus:outline-none"
                placeholder="••••••••"
                required
              />
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
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-700 text-white focus:border-green-500 focus:outline-none"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-green-600 hover:bg-green-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold"
            >
              {loading ? 'SETTING UP...' : 'COMPLETE SETUP'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
