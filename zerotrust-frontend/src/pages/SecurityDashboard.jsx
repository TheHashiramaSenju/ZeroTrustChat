import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import api from '../lib/axios';
import toast from 'react-hot-toast';

export default function SecurityDashboard() {
  const [sessions, setSessions] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [riskScore, setRiskScore] = useState(85);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSecurityData();
  }, []);

  const loadSecurityData = async () => {
    try {
      const [sessionsRes, logsRes, scoreRes] = await Promise.allSettled([
        api.get('/security/sessions'),
        api.get('/security/audit-logs'),
        api.get('/security/risk-score'),
      ]);

      if (sessionsRes.status === 'fulfilled') {
        setSessions(sessionsRes.value.data.sessions || []);
      }

      if (logsRes.status === 'fulfilled') {
        setAuditLogs(logsRes.value.data.logs || []);
      }

      if (scoreRes.status === 'fulfilled') {
        setRiskScore(scoreRes.value.data.riskScore || 85);
      }
    } catch (error) {
      console.error('Failed to load security data:', error);
    } finally {
      setLoading(false);
    }
  };

  const revokeSession = async (sessionId) => {
    try {
      await api.delete('/security/sessions/' + sessionId);
      toast.success('Session revoked');
      loadSecurityData();
    } catch (error) {
      toast.error('Failed to revoke session');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      return format(date, 'MMM dd, yyyy HH:mm');
    } catch (error) {
      return 'Invalid Date';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading security data...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Security Dashboard</h1>

      {/* Trust Score */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Trust Score</h2>
        <div className="flex items-center">
          <div className="text-4xl font-bold">{riskScore}/100</div>
          <div className="ml-4 flex-1">
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className={'h-4 rounded-full ' + (riskScore >= 70 ? 'bg-green-500' : riskScore >= 40 ? 'bg-yellow-500' : 'bg-red-500')}
                style={{ width: riskScore + '%' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Active Sessions */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Active Sessions</h2>
        {sessions.length === 0 ? (
          <p className="text-gray-500">No active sessions</p>
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => (
              <div key={session.id} className="border rounded p-4 flex justify-between items-center">
                <div>
                  <p className="font-medium">{session.deviceFingerprint || 'Unknown Device'}</p>
                  <p className="text-sm text-gray-600">IP: {session.ipAddress}</p>
                  <p className="text-sm text-gray-600">Last active: {formatDate(session.lastActiveAt)}</p>
                </div>
                <button
                  onClick={() => revokeSession(session.id)}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Revoke
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Audit Logs */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        {auditLogs.length === 0 ? (
          <p className="text-gray-500">No recent activity</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Action</th>
                  <th className="text-left p-2">IP Address</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">Time</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map((log) => (
                  <tr key={log.id} className="border-b">
                    <td className="p-2">{log.action}</td>
                    <td className="p-2">{log.ipAddress}</td>
                    <td className="p-2">
                      <span className={'px-2 py-1 rounded text-xs ' + (log.severity === 'info' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800')}>
                        {log.severity}
                      </span>
                    </td>
                    <td className="p-2">{formatDate(log.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
