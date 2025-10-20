import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Smartphone, AlertTriangle, Trash2, ArrowLeft, RefreshCw, Activity, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../lib/axios';
import toast from 'react-hot-toast';

export default function SecurityPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadSessions();
  }, [user, navigate]);

  const loadSessions = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/security/sessions');
      setSessions(data.sessions || []);
    } catch (error) {
      toast.error('Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  const revokeSession = async (sessionId) => {
    if (!confirm('Revoke this session? The device will be logged out immediately.')) {
      return;
    }

    try {
      await api.delete(`/security/sessions/${sessionId}`);
      toast.success('✅ Session revoked successfully!');
      loadSessions();
    } catch (error) {
      toast.error('❌ Failed to revoke session');
    }
  };

  const getTrustLevel = (score) => {
    if (score >= 80) return { 
      level: 'HIGH TRUST', 
      color: 'text-green-400', 
      bg: 'bg-green-500/10', 
      border: 'border-green-500/50',
      icon: '🟢'
    };
    if (score >= 60) return { 
      level: 'MEDIUM TRUST', 
      color: 'text-yellow-400', 
      bg: 'bg-yellow-500/10', 
      border: 'border-yellow-500/50',
      icon: '🟡'
    };
    return { 
      level: 'LOW TRUST', 
      color: 'text-red-400', 
      bg: 'bg-red-500/10', 
      border: 'border-red-500/50',
      icon: '🔴'
    };
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-gray-100 p-6" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Inter:wght@400;600;700&display=swap');
        .mono { font-family: 'JetBrains Mono', monospace; }
        .pulse-glow { animation: pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(34, 197, 94, 0.3); }
          50% { box-shadow: 0 0 40px rgba(34, 197, 94, 0.6); }
        }
      `}</style>

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/chat')}
            className="p-3 border border-slate-800 hover:border-green-500 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/20"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-3 flex-1">
            <Shield size={32} className="text-green-500" />
            <div>
              <h1 className="text-3xl font-bold mono">SECURITY DASHBOARD</h1>
              <p className="text-sm text-slate-500 mono flex items-center gap-2 mt-1">
                <Activity size={14} className="text-green-500" />
                Zero Trust Architecture • Continuous Verification
              </p>
            </div>
          </div>
          <button
            onClick={loadSessions}
            disabled={loading}
            className="p-3 border border-slate-800 hover:border-green-500 transition-all duration-300 disabled:opacity-50 hover:shadow-lg hover:shadow-green-500/20"
            title="Refresh"
          >
            <RefreshCw size={20} className={loading ? 'animate-spin text-green-500' : ''} />
          </button>
        </div>

        {/* ZTA Info Banner */}
        <div className="border-2 border-green-500/30 bg-green-500/5 p-6 mb-8 pulse-glow">
          <div className="flex items-start gap-4">
            <Lock size={24} className="text-green-500 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="font-bold text-green-400 mono text-lg mb-2">🔒 ZERO TRUST ARCHITECTURE ACTIVE</h3>
              <p className="text-sm text-slate-300 leading-relaxed mb-3">
                Every session is continuously evaluated based on device patterns, login behavior, geographic consistency, 
                time-based analysis, and security events. Trust scores update dynamically.
              </p>
              <div className="grid grid-cols-3 gap-4 mt-4">
                <div className="border border-green-500/20 bg-slate-900/50 p-3">
                  <div className="text-xs text-slate-500 mono mb-1">DEVICE TRACKING</div>
                  <div className="text-green-400 font-bold mono">✓ ACTIVE</div>
                </div>
                <div className="border border-green-500/20 bg-slate-900/50 p-3">
                  <div className="text-xs text-slate-500 mono mb-1">BEHAVIOR ANALYSIS</div>
                  <div className="text-green-400 font-bold mono">✓ ACTIVE</div>
                </div>
                <div className="border border-green-500/20 bg-slate-900/50 p-3">
                  <div className="text-xs text-slate-500 mono mb-1">GEO VERIFICATION</div>
                  <div className="text-green-400 font-bold mono">✓ ACTIVE</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Active Sessions */}
        <div className="border border-slate-800 bg-slate-900/50 p-6">
          <h2 className="text-xl font-bold mb-6 mono flex items-center gap-3">
            <Smartphone size={24} className="text-green-500" />
            ACTIVE SESSIONS
            <span className="text-sm text-slate-500 font-normal">({sessions.length} device{sessions.length !== 1 ? 's' : ''})</span>
          </h2>

          {loading ? (
            <div className="text-center py-12 text-slate-500 mono text-sm">
              <RefreshCw size={32} className="animate-spin mx-auto mb-4 text-green-500" />
              SCANNING SESSIONS...
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-12 text-slate-500 mono text-sm border border-slate-800 bg-slate-950">
              <Shield size={48} className="mx-auto mb-4 opacity-20" />
              NO ACTIVE SESSIONS
            </div>
          ) : (
            <div className="space-y-4">
              {sessions.map((session) => {
                const trust = getTrustLevel(session.trustScore);
                return (
                  <div
                    key={session.id}
                    className={`border-2 ${trust.border} ${trust.bg} p-6 transition-all hover:shadow-xl`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        {/* Device Info */}
                        <div className="flex items-center gap-3 mb-4">
                          <Smartphone size={20} className="text-slate-400" />
                          <span className="text-sm mono text-slate-300 font-semibold">
                            {session.deviceFingerprint?.substring(0, 50)}...
                          </span>
                          {session.isActive && (
                            <span className="px-2 py-1 bg-green-500/20 border border-green-500/30 text-green-400 text-xs mono">
                              ONLINE
                            </span>
                          )}
                        </div>
                        
                        {/* Session Details */}
                        <div className="grid grid-cols-2 gap-4 text-xs text-slate-400 mono mb-4">
                          <div>
                            <span className="text-slate-600">IP ADDRESS:</span> {session.ipAddress}
                          </div>
                          <div>
                            <span className="text-slate-600">LAST ACTIVE:</span>{' '}
                            {new Date(session.lastActiveAt).toLocaleString()}
                          </div>
                        </div>

                        {/* Trust Score Display */}
                        <div className="flex items-center gap-4">
                          <span className="text-xs text-slate-600 mono">TRUST SCORE:</span>
                          <div className={`${trust.bg} border-2 ${trust.border} px-4 py-2 inline-flex items-center gap-2`}>
                            <span className="text-2xl">{trust.icon}</span>
                            <div>
                              <div className={`text-2xl font-bold mono ${trust.color}`}>
                                {session.trustScore}/100
                              </div>
                              <div className={`text-xs mono ${trust.color}`}>
                                {trust.level}
                              </div>
                            </div>
                          </div>

                          {/* Trust Score Bar */}
                          <div className="flex-1">
                            <div className="h-2 bg-slate-800 overflow-hidden">
                              <div 
                                className={`h-full ${session.trustScore >= 80 ? 'bg-green-500' : session.trustScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'} transition-all duration-500`}
                                style={{ width: `${session.trustScore}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Revoke Button */}
                      <button
                        onClick={() => revokeSession(session.id)}
                        className="p-3 border-2 border-red-800/50 text-red-400 hover:bg-red-500/20 hover:border-red-500 transition-all duration-300 flex items-center gap-2 mono text-sm font-bold"
                        title="Revoke Session"
                      >
                        <Trash2 size={18} />
                        REVOKE
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Security Warning */}
        <div className="border-2 border-yellow-800/50 bg-yellow-500/5 p-6 mt-8">
          <div className="flex items-start gap-4">
            <AlertTriangle size={24} className="text-yellow-500 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-yellow-400 mono text-sm mb-2">⚠️ SECURITY NOTICE</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Trust scores below 60 may trigger additional verification. Sessions with low trust scores 
                should be reviewed and revoked if unrecognized. All revocations are logged for audit purposes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
