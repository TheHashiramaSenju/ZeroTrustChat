import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Shield, Key } from 'lucide-react';
import api from '../lib/axios';
import socketService from '../services/socketService';
import toast from 'react-hot-toast';

export default function MFAVerifyPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [code, setCode] = useState('');
  const [backupCode, setBackupCode] = useState('');
  const [useBackup, setUseBackup] = useState(false);
  const [loading, setLoading] = useState(false);

  const mfaToken = location.state?.mfaToken;
  const email = location.state?.email;

  if (!mfaToken) {
    navigate('/login');
    return null;
  }

  const verifyMFA = async () => {
    if (code.length !== 6) {
      toast.error('Enter 6-digit code');
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post('/security/mfa/verify', {
        mfaToken,
        token: code,
      });

      if (data.accessToken) {
        localStorage.setItem('accessToken', data.accessToken);
        socketService.connect(data.accessToken);
        toast.success('Login successful!');
        
        // Force reload to update auth context
        window.location.href = '/chat';
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Invalid code');
      setCode('');
    } finally {
      setLoading(false);
    }
  };

  const verifyBackupCode = async () => {
    if (backupCode.length < 6) {
      toast.error('Enter backup code');
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post('/security/mfa/verify-backup', {
        mfaToken,
        backupCode: backupCode.toUpperCase(),
      });

      if (data.accessToken) {
        localStorage.setItem('accessToken', data.accessToken);
        socketService.connect(data.accessToken);
        toast.success('Login successful! Remaining backup codes: ' + data.remainingBackupCodes);
        
        // Force reload to update auth context
        window.location.href = '/chat';
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Invalid backup code');
      setBackupCode('');
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
          <h1 className="text-3xl font-bold mb-2">Two-Factor Authentication</h1>
          <p className="text-slate-400 text-sm mono">{email}</p>
        </div>

        <div className="border border-slate-800 bg-slate-900/50 p-8 backdrop-blur">
          {!useBackup ? (
            <>
              <div className="flex items-center gap-2 text-green-500 mb-6 text-xs mono">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                AUTHENTICATOR CODE
              </div>

              <div className="mb-6">
                <label className="block text-xs text-slate-400 mb-2 mono">6-DIGIT CODE</label>
                <input
                  type="text"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  onKeyPress={(e) => e.key === 'Enter' && verifyMFA()}
                  placeholder="000000"
                  autoFocus
                  className="w-full px-6 py-4 bg-slate-950 border border-slate-700 text-center text-4xl tracking-widest font-mono text-white focus:border-green-500 focus:outline-none glow-input"
                />
              </div>

              <button
                onClick={verifyMFA}
                disabled={loading || code.length !== 6}
                className="w-full px-6 py-4 bg-green-600 hover:bg-green-500 disabled:bg-slate-700 disabled:cursor-not-allowed transition-all duration-300 font-semibold mono text-sm hover:shadow-lg hover:shadow-green-500/20"
              >
                {loading ? 'VERIFYING...' : 'VERIFY & LOGIN →'}
              </button>

              <button
                onClick={() => setUseBackup(true)}
                className="w-full mt-4 px-6 py-3 border border-slate-700 hover:border-green-500 transition-all duration-300 text-slate-400 hover:text-green-500 mono text-sm flex items-center justify-center gap-2"
              >
                <Key size={16} />
                USE BACKUP CODE
              </button>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 text-yellow-500 mb-6 text-xs mono">
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                BACKUP CODE
              </div>

              <div className="mb-6">
                <label className="block text-xs text-slate-400 mb-2 mono">BACKUP CODE</label>
                <input
                  type="text"
                  value={backupCode}
                  onChange={(e) => setBackupCode(e.target.value.toUpperCase())}
                  onKeyPress={(e) => e.key === 'Enter' && verifyBackupCode()}
                  placeholder="XXXXXXXX"
                  autoFocus
                  className="w-full px-6 py-4 bg-slate-950 border border-slate-700 text-center text-2xl tracking-wider font-mono text-white focus:border-yellow-500 focus:outline-none glow-input"
                />
              </div>

              <button
                onClick={verifyBackupCode}
                disabled={loading || backupCode.length < 6}
                className="w-full px-6 py-4 bg-yellow-600 hover:bg-yellow-500 disabled:bg-slate-700 disabled:cursor-not-allowed transition-all duration-300 font-semibold mono text-sm"
              >
                {loading ? 'VERIFYING...' : 'VERIFY BACKUP CODE →'}
              </button>

              <button
                onClick={() => setUseBackup(false)}
                className="w-full mt-4 px-6 py-3 text-slate-400 hover:text-green-500 transition-colors mono text-sm"
              >
                ← BACK TO AUTHENTICATOR
              </button>
            </>
          )}

          <button
            onClick={() => navigate('/login')}
            className="w-full mt-6 pt-6 border-t border-slate-800 text-slate-500 hover:text-slate-300 transition-colors text-sm"
          >
            ← Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}
