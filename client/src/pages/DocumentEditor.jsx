import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import api from '../utils/api';
import AIChatPanel from '../components/AIChatPanel';

const TOOLBAR_BUTTONS = [
  { cmd: 'bold', label: 'B', style: 'font-bold' },
  { cmd: 'italic', label: 'I', style: 'italic' },
  { cmd: 'underline', label: 'U', style: 'underline' },
  { cmd: 'strikeThrough', label: 'S', style: 'line-through' },
  { type: 'sep' },
  { cmd: 'insertUnorderedList', label: '• List' },
  { cmd: 'insertOrderedList', label: '1. List' },
  { type: 'sep' },
  { cmd: 'formatBlock', value: 'h2', label: 'H2' },
  { cmd: 'formatBlock', value: 'h3', label: 'H3' },
  { cmd: 'formatBlock', value: 'p', label: '¶' },
  { type: 'sep' },
  { cmd: 'createLink', label: 'Link' },
  { cmd: 'removeFormat', label: 'Clear' },
];

export default function DocumentEditor() {
  const { id } = useParams();
  const { socket } = useSocket();
  const [doc, setDoc] = useState(null);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const editorRef = useRef(null);
  const saveTimeoutRef = useRef(null);
  const remoteUpdate = useRef(false);
  const socketRef = useRef(socket);
  const docIdRef = useRef(id);

  socketRef.current = socket;
  docIdRef.current = id;

  useEffect(() => {
    api.get(`/documents/${id}`).then((data) => {
      setDoc(data);
      setTitle(data.title);
      if (editorRef.current) editorRef.current.innerHTML = data.content || '';
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    const s = socketRef.current;
    if (!s || !id) return;
    s.emit('doc:join', id);

    function handleRemoteUpdate(data) {
      if (data.docId !== docIdRef.current || !editorRef.current) return;
      remoteUpdate.current = true;
      if (data.content !== undefined) editorRef.current.innerHTML = data.content;
      if (data.title !== undefined) setTitle(data.title);
      setTimeout(() => { remoteUpdate.current = false; }, 50);
    }

    s.on('doc:update', handleRemoteUpdate);
    return () => {
      s.emit('doc:leave', id);
      s.off('doc:update', handleRemoteUpdate);
    };
  }, [socket, id]);

  function handleInput() {
    if (remoteUpdate.current || !editorRef.current) return;
    const content = editorRef.current.innerHTML;
    const s = socketRef.current;
    if (s && s.connected) s.emit('doc:update', { docId: docIdRef.current, content });
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      setSaving(true);
      api.put(`/documents/${docIdRef.current}`, { content })
        .then(() => setSaving(false))
        .catch(() => setSaving(false));
    }, 1000);
  }

  function handleTitleChange(e) {
    const val = e.target.value;
    setTitle(val);
    const s = socketRef.current;
    if (s && s.connected) s.emit('doc:update', { docId: docIdRef.current, title: val });
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      api.put(`/documents/${docIdRef.current}`, { title: val });
    }, 1000);
  }

  function execCommand(cmd, value) {
    if (cmd === 'createLink') {
      const url = prompt('Enter URL:');
      if (url) document.execCommand(cmd, false, url);
    } else {
      document.execCommand(cmd, false, value || null);
    }
    editorRef.current?.focus();
  }

  function saveNow() {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    const content = editorRef.current?.innerHTML || '';
    setSaving(true);
    api.put(`/documents/${docIdRef.current}`, { content, title })
      .then(() => setSaving(false))
      .catch(() => setSaving(false));
  }

  function downloadDoc() {
    const content = editorRef.current?.innerHTML || '';
    const docTitle = title || 'Untitled';
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>${docTitle}</title><style>body{font-family:system-ui,sans-serif;max-width:800px;margin:40px auto;padding:0 20px;line-height:1.7;color:#1f2937}h1{font-size:2rem;margin-bottom:1rem}h2{font-size:1.5rem;margin:1.5rem 0 0.5rem}h3{font-size:1.25rem;margin:1.25rem 0 0.5rem}ul,ol{padding-left:1.5rem;margin:0.5rem 0}a{color:#1B2A4A}</style></head><body><h1>${docTitle}</h1>${content}</body></html>`);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 500);
  }

  function handleKeyDown(e) {
    if (e.key === 'Tab') {
      e.preventDefault();
      document.execCommand('insertText', false, '    ');
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px)]">
        <div className="w-7 h-7 border-2 border-brand-300 border-t-brand-800 rounded-full animate-spin" />
      </div>
    );
  }

  if (!doc) {
    return (
      <div className="min-h-screen">
        <div className="max-w-4xl mx-auto px-4 py-8"><p className="text-brand-500">Document not found.</p></div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-64px)]">
      <div className="flex-1 min-w-0 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
          <div className="mb-2 text-sm text-brand-500">
            <Link to="/dashboard" className="hover:text-brand-800 transition-colors">Dashboard</Link>
            <span className="mx-2 text-brand-300">/</span>
            <Link to={`/workspaces/${doc.workspace?._id || doc.workspace}`} className="hover:text-brand-800 transition-colors">
              Workspace
            </Link>
            <span className="mx-2 text-brand-300">/</span>
            <span className="text-brand-900 font-medium">{doc.title}</span>
          </div>

          <div className="flex items-center justify-between mb-4">
            <input type="text" value={title} onChange={handleTitleChange}
              className="text-[34px] leading-none text-brand-900 bg-transparent border-none focus:outline-none focus:ring-0 w-full font-heading tracking-tight"
              placeholder="Untitled" />
            <div className="flex items-center gap-2 shrink-0 ml-4">
              <button onClick={() => setShowAI(!showAI)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all ${showAI ? 'text-brand-800 bg-brand-800/10 border border-brand-800/30' : 'text-brand-500 bg-white border border-brand-300 hover:border-brand-800 hover:text-brand-900'}`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                AI Assistant
              </button>
              <button onClick={saveNow} disabled={saving}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-brand-800 hover:bg-brand-700 disabled:opacity-50 transition-all">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button onClick={downloadDoc}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-brand-500 bg-white border border-brand-300 hover:border-brand-800 hover:text-brand-900 transition-all">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                Download PDF
              </button>
            </div>
          </div>

          <div className="bg-white border border-brand-300 overflow-hidden">
            <div className="flex items-center gap-0.5 px-3 py-2 border-b border-brand-200 flex-wrap">
              {TOOLBAR_BUTTONS.map((btn, i) =>
                btn.type === 'sep' ? (
                  <div key={i} className="w-px h-5 bg-brand-300 mx-1.5" />
                ) : (
                  <button key={i} onMouseDown={(e) => e.preventDefault()} onClick={() => execCommand(btn.cmd, btn.value)}
                    className={`px-2.5 py-1.5 text-sm text-brand-500 hover:bg-brand-100 hover:text-brand-900 rounded transition-all ${btn.style || ''}`}
                    title={btn.cmd}>
                    {btn.label}
                  </button>
                )
              )}
            </div>

            <div ref={editorRef} contentEditable suppressContentEditableWarning
              onInput={handleInput} onKeyDown={handleKeyDown}
              className="p-8 min-h-[500px] focus:outline-none text-brand-900 leading-relaxed"
              style={{ lineHeight: '1.8' }} />
          </div>

          <style>{`
            [contenteditable] h2 { font-size: 1.5rem; font-weight: 700; margin: 1.5rem 0 0.5rem; color: #141B2D; font-family: 'Source Serif 4', Georgia, serif; }
            [contenteditable] h3 { font-size: 1.25rem; font-weight: 600; margin: 1.25rem 0 0.5rem; color: #141B2D; font-family: 'Source Serif 4', Georgia, serif; }
            [contenteditable] p { margin: 0.5rem 0; }
            [contenteditable] ul { list-style: disc; padding-left: 1.5rem; margin: 0.5rem 0; }
            [contenteditable] ol { list-style: decimal; padding-left: 1.5rem; margin: 0.5rem 0; }
            [contenteditable] li { margin: 0.25rem 0; }
            [contenteditable] a { color: #1B2A4A; text-decoration: underline; }
          `}</style>
        </div>
      </div>

      {showAI && (
        <AIChatPanel />
      )}
    </div>
  );
}
