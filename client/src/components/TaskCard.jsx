const PRIORITIES = {
  low: { bg: 'bg-neutral-800', text: 'text-neutral-400', dot: 'bg-neutral-500' },
  medium: { bg: 'bg-blue-950/40', text: 'text-blue-400', dot: 'bg-blue-500' },
  high: { bg: 'bg-amber-950/40', text: 'text-amber-400', dot: 'bg-amber-500' },
  urgent: { bg: 'bg-red-950/40', text: 'text-red-400', dot: 'bg-red-500' },
};

export default function TaskCard({ task, onClick }) {
  const p = PRIORITIES[task.priority] || PRIORITIES.medium;

  return (
    <div onClick={() => onClick(task)}
      className="bg-neutral-850 p-3.5 rounded-xl border border-neutral-800 hover:border-neutral-700 hover:bg-neutral-800 cursor-pointer transition-all duration-200 group"
      style={{ backgroundColor: '#1a1a1a' }}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="text-[13px] font-medium text-neutral-200 leading-snug group-hover:text-neutral-100">
          {task.title}
        </h4>
        <span className={`${p.bg} ${p.text} px-1.5 py-0.5 rounded-md text-[10px] font-semibold shrink-0 flex items-center gap-1`}>
          <span className={`w-1.5 h-1.5 rounded-full ${p.dot}`} />
          {task.priority}
        </span>
      </div>

      {task.description && (
        <p className="text-xs text-neutral-500 line-clamp-2 mb-2.5 leading-relaxed">{task.description}</p>
      )}

      <div className="flex items-center justify-between mt-1">
        {task.assignee ? (
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-[9px] font-semibold text-neutral-300">
              {task.assignee.name?.[0]?.toUpperCase()}
            </div>
            <span className="text-[11px] text-neutral-500 font-medium">{task.assignee.name}</span>
          </div>
        ) : (
          <span className="text-[11px] text-neutral-600 italic">Unassigned</span>
        )}

        {task.comments?.length > 0 && (
          <div className="flex items-center gap-1 text-neutral-500">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span className="text-[11px]">{task.comments.length}</span>
          </div>
        )}
      </div>

      {task.dueDate && (
        <div className="mt-2 pt-2 border-t border-neutral-800">
          <span className="text-[10px] text-neutral-500 font-medium">
            Due {new Date(task.dueDate).toLocaleDateString()}
          </span>
        </div>
      )}
    </div>
  );
}
