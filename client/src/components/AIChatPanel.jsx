import { useState, useRef, useEffect } from 'react';
import api from '../utils/api';

const SUGGESTIONS = [
  'Summarize this document',
  'Fix grammar and spelling',
  'Rewrite this more professionally',
  'Expand on the key points',
  'Write an introduction paragraph',
];

export default function AIChatPanel() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copiedIdx, setCopiedIdx] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  async function handleSend(msg) {
    const text = (msg || input).trim();
    if (!text || loading) return;
    setInput('');

    const userMsg = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);
    setError('');

    try {
      const data = await api.post('/ai/transform', {
        text,
        action: 'generate',
        prompt: text,
      });
      setMessages((prev) => [...prev, { role: 'assistant', content: data.result }]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleCopy(text, idx) {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  }

  return (
    <div className="w-96 h-full bg-neutral-950 border-l border-neutral-800 flex flex-col shrink-0 animate-slide-up">
      <div className="p-4 border-b border-neutral-800 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center relative">
          <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-teal-400 rounded-full animate-pulse" />
          <svg className="w-4 h-4 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-neutral-100 font-['Space_Grotesk',sans-serif]">AI Assistant</h3>
          <p className="text-[11px] text-neutral-500">Powered by Llama 3.3 via Groq</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && !loading && (
          <div className="text-center py-8">
            <div className="w-14 h-14 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-teal-500/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h4 className="text-sm font-medium text-neutral-300 mb-1 font-['Space_Grotesk',sans-serif]">What can I help with?</h4>
            <p className="text-xs text-neutral-500 mb-5">Ask me to write, rewrite, summarize, or brainstorm.</p>
            <div className="space-y-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => handleSend(s)}
                  className="w-full px-3 py-2 rounded-lg text-xs text-neutral-400 bg-neutral-900 border border-neutral-800 hover:border-teal-500/30 hover:text-teal-400 transition-colors text-left"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            {msg.role === 'user' && (
              <div className="text-[10px] text-neutral-600 mb-1 mr-1 font-medium uppercase tracking-wider">You</div>
            )}
            <div className={`max-w-full rounded-2xl px-4 py-3 text-sm leading-relaxed ${
              msg.role === 'user'
                ? 'bg-teal-500/15 border border-teal-500/20 text-neutral-200 rounded-br-md'
                : 'bg-neutral-900 border border-neutral-800 text-neutral-300 rounded-bl-md'
            }`}>
              <p className="whitespace-pre-wrap break-words">{msg.content}</p>
            </div>
            {msg.role === 'assistant' && (
              <button
                onClick={() => handleCopy(msg.content, i)}
                className="flex items-center gap-1 px-2 py-1 mt-1 ml-1 rounded-md text-[11px] font-medium text-neutral-500 hover:text-teal-400 hover:bg-neutral-800/50 transition-all"
              >
                {copiedIdx === i ? (
                  <>
                    <svg className="w-3 h-3 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    <span className="text-teal-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    Copy
                  </>
                )}
              </button>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-start">
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-2.5">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="px-4 py-3 rounded-xl bg-red-950/40 border border-red-900/60 text-red-400 text-sm">{error}</div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-neutral-800">
        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask AI anything..."
            disabled={loading}
            className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:border-teal-500 disabled:opacity-50 transition-colors"
          />
          <button type="submit" disabled={!input.trim() || loading}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-neutral-950 bg-teal-500 hover:bg-teal-400 disabled:opacity-30 transition-all shrink-0">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
          </button>
        </form>
        <p className="text-[10px] text-neutral-600 mt-2 text-center">AI can make mistakes. Verify important content.</p>
      </div>
    </div>
  );
}
