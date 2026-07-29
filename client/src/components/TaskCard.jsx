const PRIORITIES = {
  low: { bg: 'bg-brand-100', text: 'text-brand-600', dot: 'bg-brand-400' },
  medium: { bg: 'bg-blue-50', text: 'text-blue-600', dot: 'bg-blue-500' },
  high: { bg: 'bg-amber-50', text: 'text-amber-600', dot: 'bg-amber-500' },
  urgent: { bg: 'bg-red-50', text: 'text-red-600', dot: 'bg-red-500' },
};

export default function TaskCard({ task, onClick }) {
  const p = PRIORITIES[task.priority] || PRIORITIES.medium;

  return (
    <div onClick={() => onClick(task)}
      className="bg-white p-3.5 border border-brand-300 hover:border-brand-800 hover:shadow-[0_2px_8px_rgba(20,27,45,0.06)] cursor-pointer transition-all duration-200 group">
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="text-[13px] font-medium text-brand-900 leading-snug group-hover:text-brand-800">
          {task.title}
        </h4>
        <span className={`${p.bg} ${p.text} px-1.5 py-0.5 rounded-md text-[10px] font-semibold shrink-0 flex items-center gap-1`}>
          <span className={`w-1.5 h-1.5 rounded-full ${p.dot}`} />
          {task.priority}
        </span>
      </div>

      {task.description && (
        <p className="text-xs text-brand-500 line-clamp-2 mb-2.5 leading-relaxed">{task.description}</p>
      )}

      <div className="flex items-center justify-between mt-1">
        {task.assignee ? (
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 bg-brand-100 border border-brand-300 flex items-center justify-center text-[9px] font-semibold text-brand-600">
              {task.assignee.name?.[0]?.toUpperCase()}
            </div>
            <span className="text-[11px] text-brand-500 font-medium">{task.assignee.name}</span>
          </div>
        ) : (
          <span className="text-[11px] text-brand-500 italic">Unassigned</span>
        )}

        {task.comments?.length > 0 && (
          <div className="flex items-center gap-1 text-brand-400">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span className="text-[11px]">{task.comments.length}</span>
          </div>
        )}
      </div>

      {task.dueDate && (
        <div className="mt-2 pt-2 border-t border-brand-200">
          <span className="text-[10px] text-brand-500 font-medium">
            Due {new Date(task.dueDate).toLocaleDateString()}
          </span>
        </div>
      )}
    </div>
  );
}
