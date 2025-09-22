import { useNavigate } from 'react-router-dom';
import { Shield, Activity, Lock, Eye, Server, CheckCircle2 } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 text-gray-100" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Inter:wght@400;600;700&display=swap');
        .hover-glow:hover { box-shadow: 0 0 20px rgba(34, 197, 94, 0.3); }
        .mono { font-family: 'JetBrains Mono', monospace; }
        .grid-bg { background-image: linear-gradient(rgba(148, 163, 184, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(148, 163, 184, 0.05) 1px, transparent 1px); background-size: 50px 50px; }
      `}</style>

      {/* Nav */}
      <nav className="border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-500/10 border border-green-500/30 flex items-center justify-center">
              <Shield size={18} className="text-green-500" />
            </div>
            <span className="text-sm font-bold tracking-widest mono">ZEROTRUST</span>
          </div>
          <div className="flex gap-3 text-sm">
            <button
              onClick={() => navigate('/login')}
              className="px-5 py-2 border border-slate-700 hover:border-green-500 transition-all duration-300 mono"
            >
              ACCESS
            </button>
            <button
              onClick={() => navigate('/register')}
              className="px-5 py-2 bg-green-600 hover:bg-green-500 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/20 mono"
            >
              REGISTER
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="max-w-7xl mx-auto px-6 py-20 grid-bg">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <div className="flex items-center gap-2 text-green-500 mb-6 text-xs mono">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              SYSTEM STATUS: OPERATIONAL
            </div>
            <h1 className="text-5xl font-bold mb-6 tracking-tight leading-tight">
              Zero Trust<br />Communication<br />Infrastructure
            </h1>
            <p className="text-slate-400 mb-8 text-lg leading-relaxed">
              Continuous verification. Multi-factor authentication. Real-time threat monitoring.
            </p>
            <button
              onClick={() => navigate('/register')}
              className="px-8 py-4 bg-slate-900 border-2 border-slate-700 hover:border-green-500 transition-all duration-300 mono hover-glow group"
            >
              <span className="group-hover:text-green-500 transition-colors">DEPLOY INSTANCE</span> →
            </button>
          </div>

          {/* Live Metrics */}
          <div className="space-y-4">
            <div className="border border-slate-800 bg-slate-900/50 p-6 hover-glow transition-all duration-300 cursor-default">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="text-xs text-slate-500 mb-2 mono">AUTHENTICATION SUCCESS</div>
                  <div className="text-3xl font-bold text-green-500 mono">99.94%</div>
                </div>
                <Activity size={20} className="text-green-500/30" />
              </div>
              <div className="h-16 flex items-end gap-1">
                {[98, 96, 99, 97, 100, 99, 98, 100, 99, 97, 100, 99, 100, 98, 99, 100].map((val, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-green-500/20 hover:bg-green-500 transition-all duration-300 cursor-pointer"
                    style={{ height: `${val}%` }}
                  />
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="border border-slate-800 bg-slate-900/50 p-4 hover-glow transition-all duration-300 cursor-default">
                <div className="text-xs text-slate-500 mb-1 mono">LATENCY</div>
                <div className="text-xl font-bold mono">47ms</div>
              </div>
              <div className="border border-slate-800 bg-slate-900/50 p-4 hover-glow transition-all duration-300 cursor-default">
                <div className="text-xs text-slate-500 mb-1 mono">UPTIME</div>
                <div className="text-xl font-bold mono">99.8%</div>
              </div>
              <div className="border border-slate-800 bg-slate-900/50 p-4 hover-glow transition-all duration-300 cursor-default">
                <div className="text-xs text-slate-500 mb-1 mono">THREATS</div>
                <div className="text-xl font-bold text-red-500 mono">0</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-xs text-slate-500 mb-6 mono">IMPLEMENTED FEATURES</div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: Lock, title: 'JWT + 2FA Auth', desc: 'RS256 tokens, TOTP multi-factor' },
            { icon: Eye, title: 'Audit Logging', desc: 'Full session tracking, IP monitoring' },
            { icon: Server, title: 'Real-time Messaging', desc: 'Socket.IO, broadcast chat' },
            { icon: Shield, title: 'Zero Trust Core', desc: 'Continuous verification engine' },
            { icon: Activity, title: 'Session Management', desc: 'Device fingerprinting, trust scores' },
            { icon: CheckCircle2, title: 'Security Dashboard', desc: 'Live threat monitoring' },
          ].map((feat) => (
            <div
              key={feat.title}
              className="border border-slate-800 bg-slate-900/30 p-6 hover-glow transition-all duration-300 cursor-pointer group"
            >
              <feat.icon size={24} className="text-green-500 mb-3 group-hover:scale-110 transition-transform" />
              <div className="text-sm font-semibold mb-2">{feat.title}</div>
              <div className="text-xs text-slate-400">{feat.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tech Stack */}
      <div className="max-w-7xl mx-auto px-6 py-16 border-y border-slate-800">
        <div className="text-xs text-slate-500 mb-6 mono">SYSTEM ARCHITECTURE</div>
        <div className="grid md:grid-cols-4 gap-8 text-sm">
          <div>
            <div className="text-slate-300 mb-3 font-semibold">FRONTEND</div>
            <div className="space-y-2 text-xs text-slate-500 mono">
              <div className="hover:text-green-500 transition-colors cursor-default">React 18.3</div>
              <div className="hover:text-green-500 transition-colors cursor-default">Vite 7.1</div>
              <div className="hover:text-green-500 transition-colors cursor-default">Socket.IO Client</div>
              <div className="hover:text-green-500 transition-colors cursor-default">TailwindCSS</div>
            </div>
          </div>
          <div>
            <div className="text-slate-300 mb-3 font-semibold">BACKEND</div>
            <div className="space-y-2 text-xs text-slate-500 mono">
              <div className="hover:text-green-500 transition-colors cursor-default">Node.js 20</div>
              <div className="hover:text-green-500 transition-colors cursor-default">Express 4.21</div>
              <div className="hover:text-green-500 transition-colors cursor-default">Socket.IO</div>
              <div className="hover:text-green-500 transition-colors cursor-default">Sequelize ORM</div>
            </div>
          </div>
          <div>
            <div className="text-slate-300 mb-3 font-semibold">SECURITY</div>
            <div className="space-y-2 text-xs text-slate-500 mono">
              <div className="hover:text-green-500 transition-colors cursor-default">JWT RS256</div>
              <div className="hover:text-green-500 transition-colors cursor-default">TOTP 2FA</div>
              <div className="hover:text-green-500 transition-colors cursor-default">bcrypt</div>
              <div className="hover:text-green-500 transition-colors cursor-default">PostgreSQL 16</div>
            </div>
          </div>
          <div>
            <div className="text-slate-300 mb-3 font-semibold">MONITORING</div>
            <div className="space-y-2 text-xs text-slate-500 mono">
              <div className="hover:text-green-500 transition-colors cursor-default">Winston Logger</div>
              <div className="hover:text-green-500 transition-colors cursor-default">Risk Engine</div>
              <div className="hover:text-green-500 transition-colors cursor-default">Device Trust</div>
              <div className="hover:text-green-500 transition-colors cursor-default">Audit System</div>
            </div>
          </div>
        </div>
      </div>

      {/* Enterprise Deployment */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="border-2 border-green-500/20 bg-slate-900/50 p-12 hover-glow transition-all duration-300">
          <div className="text-xs text-green-500 mb-4 mono">PROFESSIONAL DEPLOYMENT</div>
          <h2 className="text-3xl font-bold mb-6">Enterprise Features Available</h2>
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <div className="text-slate-300 mb-4 font-semibold">CURRENTLY IMPLEMENTED</div>
              <ul className="space-y-2 text-sm text-slate-400">
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                  JWT-based authentication with RS256 signing
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                  TOTP two-factor authentication (Google Authenticator)
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                  Real-time messaging via Socket.IO
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                  Comprehensive audit logging system
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                  Session management with device fingerprinting
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                  Trust score calculation engine
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                  Security dashboard with live metrics
                </li>
              </ul>
            </div>
            <div>
              <div className="text-slate-300 mb-4 font-semibold">ENTERPRISE EXTENSIONS</div>
              <ul className="space-y-2 text-sm text-slate-400">
                <li className="flex items-start gap-2">
                  <div className="w-4 h-4 border border-slate-600 mt-0.5 flex-shrink-0"></div>
                  End-to-end message encryption (AES-256)
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-4 h-4 border border-slate-600 mt-0.5 flex-shrink-0"></div>
                  Private messaging between users
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-4 h-4 border border-slate-600 mt-0.5 flex-shrink-0"></div>
                  Hardware token support (YubiKey)
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-4 h-4 border border-slate-600 mt-0.5 flex-shrink-0"></div>
                  Geolocation-based access control
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-4 h-4 border border-slate-600 mt-0.5 flex-shrink-0"></div>
                  Advanced behavioral analytics
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-4 h-4 border border-slate-600 mt-0.5 flex-shrink-0"></div>
                  Multi-tenant organization support
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-4 h-4 border border-slate-600 mt-0.5 flex-shrink-0"></div>
                  SSO integration (OAuth, SAML)
                </li>
              </ul>
              <div className="mt-6 text-xs text-slate-500 mono">
                Contact for enterprise licensing and deployment support
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="text-xs text-slate-600 mono mb-2">
            ZEROTRUST//CHAT v1.0.0 | PRODUCTION-GRADE ARCHITECTURE
          </div>
          <div className="text-xs text-slate-700">
            Unauthorized access prohibited. All sessions monitored and logged.
          </div>
        </div>
      </footer>
    </div>
  );
}
