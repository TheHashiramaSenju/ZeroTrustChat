import api from '../lib/axios';

export const messageService = {
  getConversations: async () => {
    const { data } = await api.get('/messages/conversations');
    return data;
  },

  getMessages: async (conversationId) => {
    const { data } = await api.get(`/messages/\${conversationId}`);
    return data;
  },

  sendMessage: async (recipientId, content) => {
    const { data } = await api.post('/messages/send', { recipientId, content });
    return data;
  },
};
