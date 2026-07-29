import { useState, useEffect, useRef } from 'react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

export default function Chat({ workspaceId }) {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { fetchHistory(); }, [workspaceId]);

  useEffect(() => {
    if (!socket || !workspaceId) return;
    socket.emit('chat:join', workspaceId);
    const handleMessage = (data) => {
      if (data.workspaceId === workspaceId) setMessages((prev) => [...prev, data.message]);
    };
    socket.on('chat:message', handleMessage);
    return () => {
      socket.emit('chat:leave', workspaceId);
      socket.off('chat:message', handleMessage);
    };
  }, [socket, workspaceId]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const fetchHistory = async () => {
    try {
      const data = await api.get(`/chat?workspace=${workspaceId}`);
      setMessages(data);
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!text.trim() || !socket) return;
    socket.emit('chat:message', { workspaceId, text: text.trim() });
    setText('');
    inputRef.current?.focus();
  };

  const formatTime = (date) => new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const formatDate = (date) => {
    const d = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === today.toDateString()) return 'Today';
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString();
  };

  const shouldShowDate = (msg, prevMsg) => {
    if (!prevMsg) return true;
    return new Date(msg.createdAt).toDateString() !== new Date(prevMsg.createdAt).toDateString();
  };

  const shouldGroup = (msg, prevMsg) => {
    if (!prevMsg) return false;
    if (msg.author._id !== prevMsg.author._id) return false;
    return new Date(msg.createdAt) - new Date(prevMsg.createdAt) < 60000;
  };

  if (loading) {
    return (
      <div className="bg-white border border-brand-300 p-8 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-brand-300 border-t-brand-800 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-white border border-brand-300 overflow-hidden">
      <div className="px-5 py-4 border-b border-brand-200 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-emerald-500" />
        <h3 className="font-semibold text-brand-900 font-heading">Team Chat</h3>
      </div>

      <div className="h-[400px] overflow-y-auto px-5 py-4 space-y-1 bg-brand-50/50">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-brand-500 text-sm">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((msg, i) => {
            const prevMsg = i > 0 ? messages[i - 1] : null;
            const isOwn = msg.author._id === user?.id;
            const grouped = shouldGroup(msg, prevMsg);
            const showDate = shouldShowDate(msg, prevMsg);

            return (
              <div key={msg._id}>
                {showDate && (
                  <div className="text-center py-3">
                    <span className="text-[11px] text-brand-500 bg-white border border-brand-300 px-3 py-1 rounded-full font-medium">
                      {formatDate(msg.createdAt)}
                    </span>
                  </div>
                )}

                <div className={`flex gap-2.5 ${grouped ? 'mt-0.5' : 'mt-3'} ${isOwn ? 'flex-row-reverse' : ''}`}>
                  {!grouped && (
                    <div className="w-8 h-8 bg-brand-100 border border-brand-300 flex items-center justify-center text-[11px] font-semibold text-brand-600 shrink-0">
                      {msg.author?.name?.[0]?.toUpperCase() || '?'}
                    </div>
                  )}

                  <div className={`max-w-[75%] ${grouped ? (isOwn ? 'mr-10' : 'ml-10') : ''}`}>
                    {!grouped && (
                      <div className={`flex items-center gap-2 mb-1 ${isOwn ? 'justify-end' : ''}`}>
                        <span className="text-xs font-semibold text-brand-500">
                          {isOwn ? 'You' : msg.author?.name || 'Unknown'}
                        </span>
                        <span className="text-[10px] text-brand-500">
                          {formatTime(msg.createdAt)}
                        </span>
                      </div>
                    )}

                    <div className={`px-3.5 py-2 rounded-2xl text-[13px] leading-relaxed ${
                      isOwn
                        ? 'bg-brand-800 text-gold-400 rounded-br-md'
                        : 'bg-white border border-brand-200 text-brand-900 rounded-bl-md'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="px-5 py-4 border-t border-brand-200">
        <div className="flex gap-2">
          <input ref={inputRef} type="text" value={text} onChange={(e) => setText(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 input-field text-sm" />
          <button type="submit" disabled={!text.trim()}
            className="px-5 py-2 bg-brand-800 text-white rounded text-sm font-medium hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
