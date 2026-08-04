import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../utils/api';

export default function Sidebar({ open = true }) {
  const location = useLocation();
  const [orgs, setOrgs] = useState([]);
  const [projects, setProjects] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    Promise.all([api.get('/orgs'), api.get('/projects/mine'), api.get('/documents/mine')])
      .then(([orgData, projectData, documentData]) => {
        if (mounted) {
          setOrgs(orgData);
          setProjects(projectData);
          setDocuments(documentData);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [location.pathname]);

  const isWorkspaceActive = location.pathname === '/dashboard';
  const isOrgActive = (id) => location.pathname.startsWith(`/organizations/${id}`);
  const isProjectActive = (id) => location.pathname.startsWith(`/projects/${id}`);
  const isDocumentActive = (id) => location.pathname.startsWith(`/documents/${id}`);

  const linkBase = 'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors';
  const linkActive = 'bg-gold/10 border-l-2 border-gold text-white font-medium';
  const linkNormal = 'text-gray-400 hover:text-white hover:bg-ink-850';

  return (
    <aside
      className={`bg-ink-900 border-r flex flex-col shrink-0 relative overflow-hidden transition-all duration-300 ${
        open ? 'w-[280px] border-line' : 'w-0 border-transparent'
      }`}
    >
      <div className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-gold/40 via-gold/10 to-transparent" />

      <div className="w-[280px] flex flex-col h-full">
        <Link to="/dashboard" className="px-7 pt-8 pb-6 block">
          <h1 className="text-lg font-semibold tracking-tight text-white">SyncLab</h1>
          <p className="text-[11px] text-gray-500 tracking-wide uppercase">Project Workspace</p>
        </Link>

        <nav className="flex-1 px-4 space-y-7 overflow-y-auto no-scrollbar">
          <div>
            <p className="px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-500 mb-2">Core</p>
            <ul className="space-y-0.5">
              <li>
                <Link
                  to="/dashboard"
                  className={`${linkBase} ${isWorkspaceActive ? linkActive : linkNormal}`}
                >
                  <i className={`fa-solid fa-border-all w-4 text-center ${isWorkspaceActive ? 'text-gold' : ''}`}></i>
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-500 mb-2">
              Projects
            </p>
            {loading ? (
              <p className="px-3 py-1 text-xs text-gray-500">Loading…</p>
            ) : projects.length === 0 ? (
              <Link to="/dashboard" className="px-3 py-1 text-xs text-gray-500 hover:text-white block transition-colors">
                Create your first project
              </Link>
            ) : (
              <ul className="space-y-0.5">
                {projects.map((project) => (
                  <li key={project._id}>
                    <Link
                      to={`/projects/${project._id}`}
                      className={`${linkBase} ${isProjectActive(project._id) ? linkActive : linkNormal}`}
                    >
                      <i className={`fa-solid fa-code w-4 text-center ${isProjectActive(project._id) ? 'text-gold' : ''}`}></i>
                      <span className="truncate">{project.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <p className="px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-500 mb-2">
              Documents
            </p>
            {loading ? (
              <p className="px-3 py-1 text-xs text-gray-500">Loading…</p>
            ) : documents.length === 0 ? (
              <Link to="/dashboard" className="px-3 py-1 text-xs text-gray-500 hover:text-white block transition-colors">
                Create your first document
              </Link>
            ) : (
              <ul className="space-y-0.5">
                {documents.map((document) => (
                  <li key={document._id}>
                    <Link
                      to={`/documents/${document._id}`}
                      className={`${linkBase} ${isDocumentActive(document._id) ? linkActive : linkNormal}`}
                    >
                      <i className={`fa-solid fa-file-lines w-4 text-center ${isDocumentActive(document._id) ? 'text-gold' : ''}`}></i>
                      <span className="truncate">{document.title}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <p className="px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-500 mb-2">
              Organizations
            </p>
            {loading ? (
              <p className="px-3 py-1 text-xs text-gray-500">Loading…</p>
            ) : orgs.length === 0 ? (
              <Link to="/dashboard" className="px-3 py-1 text-xs text-gray-500 hover:text-white block transition-colors">
                Create your first organization
              </Link>
            ) : (
              <ul className="space-y-0.5">
                {orgs.map((org) => (
                  <li key={org._id}>
                    <Link
                      to={`/organizations/${org._id}`}
                      className={`${linkBase} ${isOrgActive(org._id) ? linkActive : linkNormal}`}
                    >
                      <i className={`fa-solid fa-building w-4 text-center ${isOrgActive(org._id) ? 'text-gold' : ''}`}></i>
                      <span className="truncate">{org.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </nav>
      </div>
    </aside>
  );
}
