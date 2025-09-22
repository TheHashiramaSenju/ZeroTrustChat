import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Shield, Mail, RotateCcw } from 'lucide-react';
import api from '../lib/axios';
import toast from 'react-hot-toast';

export default function EmailVerifyPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timer, setTimer] = useState(60);

  const email = location.state?.email;

  useEffect(() => {
    if (!email) {
      navigate('/register');
      return;
    }

    const countdown = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(countdown);
  }, [email, navigate]);

  if (!email) return null;

  const verifyOTP = async () => {
    if (otp.length !== 6) {
      toast.error('Enter 6-digit code');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/verify-email', { email, otp });
      toast.success('Email verified! You can now login.');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Invalid code');
      setOtp('');
    } finally {
      setLoading(false);
    }
  };

  const resendOTP = async () => {
    setResending(true);
    try {
      await api.post('/auth/resend-otp', { email });
      toast.success('New code sent to your email!');
      setTimer(60);
    } catch (error) {
      toast.error('Failed to resend code');
    } finally {
      setResending(false);
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
            <Mail size={32} className="text-green-500" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Email Verification</h1>
          <p className="text-slate-400 text-sm mono">CHECK YOUR INBOX</p>
        </div>

        <div className="border border-slate-800 bg-slate-900/50 p-8 backdrop-blur">
          <div className="flex items-center gap-2 text-green-500 mb-6 text-xs mono">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            OTP VERIFICATION
          </div>

          <p className="text-sm text-slate-400 mb-6">
            We sent a 6-digit code to <br />
            <span className="text-green-500 mono">{email}</span>
          </p>

          <div className="mb-6">
            <label className="block text-xs text-slate-400 mb-2 mono">VERIFICATION CODE</label>
            <input
              type="text"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              onKeyPress={(e) => e.key === 'Enter' && verifyOTP()}
              placeholder="000000"
              autoFocus
              className="w-full px-6 py-4 bg-slate-950 border border-slate-700 text-center text-4xl tracking-widest font-mono text-white focus:border-green-500 focus:outline-none glow-input"
            />
          </div>

          <button
            onClick={verifyOTP}
            disabled={loading || otp.length !== 6}
            className="w-full px-6 py-4 bg-green-600 hover:bg-green-500 disabled:bg-slate-700 disabled:cursor-not-allowed transition-all duration-300 font-semibold mono text-sm hover:shadow-lg hover:shadow-green-500/20"
          >
            {loading ? 'VERIFYING...' : 'VERIFY EMAIL →'}
          </button>

          <div className="mt-6 pt-6 border-t border-slate-800 flex justify-between items-center">
            <div className="text-xs text-slate-500 mono">
              {timer > 0 ? (
                <span>Resend in {timer}s</span>
              ) : (
                <span className="text-green-500">Code expired</span>
              )}
            </div>
            <button
              onClick={resendOTP}
              disabled={resending || timer > 0}
              className="text-sm text-green-500 hover:text-green-400 disabled:text-slate-600 disabled:cursor-not-allowed transition-colors mono flex items-center gap-2"
            >
              <RotateCcw size={14} />
              RESEND CODE
            </button>
          </div>

          <button
            onClick={() => navigate('/register')}
            className="w-full mt-6 pt-6 border-t border-slate-800 text-slate-500 hover:text-slate-300 transition-colors text-sm"
          >
            ← Back to Register
          </button>
        </div>
      </div>
    </div>
  );
}
