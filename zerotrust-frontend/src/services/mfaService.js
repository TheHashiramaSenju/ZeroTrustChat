import api from '../lib/axios';

export const mfaService = {
  setupMFA: async () => {
    const { data } = await api.post('/security/mfa/setup');
    return data;
  },

  enableMFA: async (secret, token) => {
    const { data } = await api.post('/security/mfa/enable', { secret, token });
    return data;
  },

  disableMFA: async () => {
    const { data } = await api.delete('/security/mfa/disable');
    return data;
  },
};
