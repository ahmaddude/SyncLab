import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
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
  const { user } = useAuth();
  const { socket } = useSocket();
  const [doc, setDoc] = useState(null);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const editorRef = useRef(null);
  const saveTimeoutRef = useRef(null);
  const remoteUpdate = useRef(false);

  useEffect(() => {
    fetchDoc();
  }, [id]);

  useEffect(() => {
    if (!socket || !id) return;

    socket.emit('doc:join', id);

    function handleRemoteUpdate(data) {
      if (data.docId !== id || !editorRef.current) return;

      remoteUpdate.current = true;

      if (data.content !== undefined) {
        editorRef.current.innerHTML = data.content;
      }
      if (data.title !== undefined) {
        setTitle(data.title);
      }

      setTimeout(() => { remoteUpdate.current = false; }, 0);
    }

    socket.on('doc:update', handleRemoteUpdate);

    return () => {
      socket.emit('doc:leave', id);
      socket.off('doc:update', handleRemoteUpdate);
    };
  }, [socket, id]);

  const fetchDoc = async () => {
    try {
      const data = await api.get(`/documents/${id}`);
      setDoc(data);
      setTitle(data.title);
      if (editorRef.current) {
        editorRef.current.innerHTML = data.content || '';
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  function emitUpdate(content, docTitle) {
    if (remoteUpdate.current || !socket) return;

    const payload = { docId: id };
    if (content !== undefined) payload.content = content;
    if (docTitle !== undefined) payload.title = docTitle;
    socket.emit('doc:update', payload);
  }

  function scheduleSave(content, docTitle) {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      setSaving(true);
      const body = {};
      if (content !== undefined) body.content = content;
      if (docTitle !== undefined) body.title = docTitle;
      api.put(`/documents/${id}`, body)
        .then(() => setSaving(false))
        .catch(() => setSaving(false));
    }, 1000);
  }

  function handleInput() {
    if (remoteUpdate.current || !editorRef.current) return;
    const content = editorRef.current.innerHTML;
    emitUpdate(content);
    scheduleSave(content);
  }

  function handleTitleChange(e) {
    const val = e.target.value;
    setTitle(val);
    emitUpdate(undefined, val);
    scheduleSave(undefined, val);
  }

  function execCommand(cmd, value) {
    if (cmd === 'createLink') {
      const url = prompt('Enter URL:');
      if (url) document.execCommand(cmd, false, url);
    } else {
      document.execCommand(cmd, false, value || null);
    }
    editorRef.current?.focus();
    handleInput();
  }

  function handleKeyDown(e) {
    if (e.key === 'Tab') {
      e.preventDefault();
      document.execCommand('insertText', false, '    ');
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-57px)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (!doc) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <p className="text-gray-500">Document not found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="mb-2 text-sm text-gray-500">
        <Link to="/dashboard" className="hover:text-primary-600">Dashboard</Link>
        <span className="mx-2">/</span>
        <Link to={`/workspaces/${doc.workspace?._id || doc.workspace}`} className="hover:text-primary-600">
          Workspace
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">{doc.title}</span>
      </div>

      <div className="flex items-center justify-between mb-4">
        <input
          type="text"
          value={title}
          onChange={handleTitleChange}
          className="text-2xl font-bold text-gray-900 bg-transparent border-none focus:outline-none focus:ring-0 w-full"
          placeholder="Untitled"
        />
        <span className={`text-xs shrink-0 ml-4 ${saving ? 'text-orange-500' : 'text-gray-400'}`}>
          {saving ? 'Saving...' : 'Saved'}
        </span>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-1 px-3 py-2 border-b border-gray-200 flex-wrap">
          {TOOLBAR_BUTTONS.map((btn, i) =>
            btn.type === 'sep' ? (
              <div key={i} className="w-px h-5 bg-gray-200 mx-1" />
            ) : (
              <button
                key={i}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => execCommand(btn.cmd, btn.value)}
                className={`px-2 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded ${btn.style || ''}`}
                title={btn.cmd}
              >
                {btn.label}
              </button>
            )
          )}
        </div>

        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          className="p-6 min-h-[400px] focus:outline-none text-gray-800 leading-relaxed"
          style={{ lineHeight: '1.7' }}
        />
      </div>

      <style>{`
        [contenteditable] h2 { font-size: 1.5rem; font-weight: 700; margin: 1.5rem 0 0.5rem; }
        [contenteditable] h3 { font-size: 1.25rem; font-weight: 600; margin: 1.25rem 0 0.5rem; }
        [contenteditable] p { margin: 0.5rem 0; }
        [contenteditable] ul { list-style: disc; padding-left: 1.5rem; margin: 0.5rem 0; }
        [contenteditable] ol { list-style: decimal; padding-left: 1.5rem; margin: 0.5rem 0; }
        [contenteditable] li { margin: 0.25rem 0; }
        [contenteditable] a { color: #4f46e5; text-decoration: underline; }
      `}</style>
    </div>
  );
}
