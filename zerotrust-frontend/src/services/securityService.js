import api from '../lib/axios';

export const securityService = {
  getSessions: async () => {
    const { data } = await api.get('/security/sessions');
    return data;
  },

  revokeSession: async (sessionId) => {
    const { data } = await api.delete(`/security/sessions/\${sessionId}`);
    return data;
  },

  getAuditLogs: async () => {
    const { data } = await api.get('/security/audit-logs');
    return data;
  },

  getRiskScore: async () => {
    const { data } = await api.get('/security/risk-score');
    return data;
  },
};
