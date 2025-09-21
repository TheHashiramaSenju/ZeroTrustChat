import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Shield, LogOut, Settings, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../lib/axios';
import socketService from '../services/socketService';
import toast from 'react-hot-toast';

export default function ChatPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    loadMessages();
    
    socketService.on('receive_message', (message) => {
      setMessages((prev) => [...prev, message]);
      scrollToBottom();
    });

    socketService.on('user_typing', () => {
      setIsTyping(true);
      setTimeout(() => setIsTyping(false), 2000);
    });

    return () => {
      socketService.off('receive_message');
      socketService.off('user_typing');
    };
  }, [user, navigate]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessages = async () => {
    try {
      const { data } = await api.get('/messages');
      setMessages(data.messages || []);
      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error('Failed to load messages');
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      await api.post('/messages/send', { content: newMessage });
      setNewMessage('');
      loadMessages();
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div className="h-screen flex flex-col bg-slate-950 text-gray-100" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Inter:wght@400;600;700&display=swap');
        .mono { font-family: 'JetBrains Mono', monospace; }
        .message-glow:hover { box-shadow: 0 0 15px rgba(34, 197, 94, 0.2); }
      `}</style>

      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900/80 backdrop-blur px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Shield size={20} className="text-green-500" />
              <span className="font-bold mono">ZEROTRUST//CHAT</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400 mono">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
              {user.username || user.email}
              {user.mfaEnabled && <span className="text-green-500">| 2FA ACTIVE</span>}
            </div>
          </div>
          <div className="flex gap-2">
            {!user.mfaEnabled && (
              <button
                onClick={() => navigate('/mfa-setup')}
                className="px-4 py-2 border border-yellow-600/50 text-yellow-500 hover:border-yellow-500 transition-all duration-300 text-sm mono flex items-center gap-2"
              >
                <AlertTriangle size={16} />
                ENABLE 2FA
              </button>
            )}
            <button
              onClick={() => navigate('/security')}
              className="px-4 py-2 border border-slate-700 hover:border-green-500 transition-all duration-300 text-sm mono"
            >
              <Settings size={16} />
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600/20 border border-red-600/50 text-red-400 hover:bg-red-600/30 transition-all duration-300 text-sm mono flex items-center gap-2"
            >
              <LogOut size={16} />
              EXIT
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-3">
        {messages.length === 0 && (
          <div className="text-center text-slate-500 mt-20 mono text-sm">
            <Shield size={48} className="mx-auto mb-4 opacity-20" />
            NO MESSAGES | SECURE CHANNEL ACTIVE
          </div>
        )}
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.senderId === user.id ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-md px-4 py-3 border message-glow transition-all duration-300 ${
                msg.senderId === user.id
                  ? 'bg-green-600/10 border-green-600/30 text-green-100'
                  : 'bg-slate-900/50 border-slate-800'
              }`}
            >
              <div className="text-xs text-slate-500 mb-1 mono">
                {msg.sender?.username || msg.sender?.email || 'Unknown'}
              </div>
              <p className="text-sm">{msg.content}</p>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="text-slate-500 text-sm mono italic">
            ⚡ User typing...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-slate-800 bg-slate-900/80 backdrop-blur px-6 py-4">
        <div className="flex gap-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type secure message..."
            className="flex-1 px-4 py-3 bg-slate-950 border border-slate-700 text-white focus:border-green-500 focus:outline-none transition-all duration-300 mono text-sm"
          />
          <button
            onClick={sendMessage}
            className="px-6 py-3 bg-green-600 hover:bg-green-500 transition-all duration-300 font-semibold mono text-sm hover:shadow-lg hover:shadow-green-500/20 flex items-center gap-2"
          >
            <Send size={18} />
            SEND
          </button>
        </div>
      </div>
    </div>
  );
}
