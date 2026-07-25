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

  useEffect(() => {
    fetchHistory();
  }, [workspaceId]);

  useEffect(() => {
    if (!socket || !workspaceId) return;

    socket.emit('chat:join', workspaceId);

    const handleMessage = (data) => {
      if (data.workspaceId === workspaceId) {
        setMessages((prev) => [...prev, data.message]);
      }
    };

    socket.on('chat:message', handleMessage);

    return () => {
      socket.emit('chat:leave', workspaceId);
      socket.off('chat:message', handleMessage);
    };
  }, [socket, workspaceId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchHistory = async () => {
    try {
      const data = await api.get(`/chat?workspace=${workspaceId}`);
      setMessages(data);
    } catch (err) {
      console.error(err);
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

  const formatTime = (date) => {
    const d = new Date(date);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

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
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[500px] bg-white rounded-xl border border-gray-200">
      <div className="px-4 py-3 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900">Team Chat</h3>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm">
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
                  <div className="text-center py-2">
                    <span className="text-[11px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                      {formatDate(msg.createdAt)}
                    </span>
                  </div>
                )}

                <div className={`flex gap-2 ${grouped ? 'mt-0' : 'mt-3'} ${isOwn ? 'flex-row-reverse' : ''}`}>
                  {!grouped && (
                    <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-medium shrink-0">
                      {msg.author?.name?.[0]?.toUpperCase() || '?'}
                    </div>
                  )}

                  <div className={`max-w-[70%] ${grouped ? (isOwn ? 'mr-10' : 'ml-10') : ''}`}>
                    {!grouped && (
                      <div className={`flex items-center gap-2 mb-0.5 ${isOwn ? 'justify-end' : ''}`}>
                        <span className="text-xs font-medium text-gray-900">
                          {isOwn ? 'You' : msg.author?.name || 'Unknown'}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {formatTime(msg.createdAt)}
                        </span>
                      </div>
                    )}

                    <div
                      className={`px-3 py-2 rounded-2xl text-sm ${
                        isOwn
                          ? 'bg-primary-600 text-white rounded-br-md'
                          : 'bg-gray-100 text-gray-900 rounded-bl-md'
                      }`}
                    >
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

      <form onSubmit={handleSend} className="px-4 py-3 border-t border-gray-200">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <button
            type="submit"
            disabled={!text.trim()}
            className="px-4 py-2 bg-primary-600 text-white rounded-full text-sm font-medium hover:bg-primary-700 disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
