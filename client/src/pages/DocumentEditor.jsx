import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import api from '../utils/api';

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
    printWindow.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>${docTitle}</title><style>body{font-family:system-ui,sans-serif;max-width:800px;margin:40px auto;padding:0 20px;line-height:1.7;color:#1f2937}h1{font-size:2rem;margin-bottom:1rem}h2{font-size:1.5rem;margin:1.5rem 0 0.5rem}h3{font-size:1.25rem;margin:1.25rem 0 0.5rem}ul,ol{padding-left:1.5rem;margin:0.5rem 0}a{color:#14b8a6}</style></head><body><h1>${docTitle}</h1>${content}</body></html>`);
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
        <div className="w-8 h-8 border-2 border-neutral-700 border-t-teal-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!doc) {
    return (
      <div className="min-h-screen bg-neutral-950">
        <div className="max-w-4xl mx-auto px-4 py-8"><p className="text-neutral-500">Document not found.</p></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 font-['Public_Sans',sans-serif]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        <div className="mb-2 text-sm text-neutral-500">
          <Link to="/dashboard" className="hover:text-teal-400 transition-colors">Dashboard</Link>
          <span className="mx-2">/</span>
          <Link to={`/workspaces/${doc.workspace?._id || doc.workspace}`} className="hover:text-teal-400 transition-colors">
            Workspace
          </Link>
          <span className="mx-2">/</span>
          <span className="text-neutral-200 font-medium">{doc.title}</span>
        </div>

        <div className="flex items-center justify-between mb-4">
          <input type="text" value={title} onChange={handleTitleChange}
            className="text-3xl font-bold text-neutral-50 bg-transparent border-none focus:outline-none focus:ring-0 w-full font-['Space_Grotesk',sans-serif] tracking-tight"
            placeholder="Untitled" />
          <div className="flex items-center gap-2 shrink-0 ml-4">
            <button onClick={saveNow} disabled={saving}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-neutral-950 bg-teal-500 hover:bg-teal-400 disabled:opacity-50 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button onClick={downloadDoc}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-neutral-200 bg-neutral-900 border border-neutral-800 hover:border-neutral-700 hover:bg-neutral-800 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              Download PDF
            </button>
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
          <div className="flex items-center gap-1 px-4 py-2.5 border-b border-neutral-800 flex-wrap">
            {TOOLBAR_BUTTONS.map((btn, i) =>
              btn.type === 'sep' ? (
                <div key={i} className="w-px h-5 bg-neutral-800 mx-1" />
              ) : (
                <button key={i} onMouseDown={(e) => e.preventDefault()} onClick={() => execCommand(btn.cmd, btn.value)}
                  className={`px-2.5 py-1 text-sm text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200 rounded-lg transition-colors ${btn.style || ''}`}
                  title={btn.cmd}>
                  {btn.label}
                </button>
              )
            )}
          </div>

          <div ref={editorRef} contentEditable suppressContentEditableWarning
            onInput={handleInput} onKeyDown={handleKeyDown}
            className="p-8 min-h-[500px] focus:outline-none text-neutral-200 leading-relaxed"
            style={{ lineHeight: '1.8' }} />
        </div>

        <style>{`
          [contenteditable] h2 { font-size: 1.5rem; font-weight: 700; margin: 1.5rem 0 0.5rem; color: #e5e5e5; }
          [contenteditable] h3 { font-size: 1.25rem; font-weight: 600; margin: 1.25rem 0 0.5rem; color: #e5e5e5; }
          [contenteditable] p { margin: 0.5rem 0; }
          [contenteditable] ul { list-style: disc; padding-left: 1.5rem; margin: 0.5rem 0; }
          [contenteditable] ol { list-style: decimal; padding-left: 1.5rem; margin: 0.5rem 0; }
          [contenteditable] li { margin: 0.25rem 0; }
          [contenteditable] a { color: #14b8a6; text-decoration: underline; }
        `}</style>
      </div>
    </div>
  );
}
