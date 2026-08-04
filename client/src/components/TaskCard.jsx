const PRIORITIES = {
  low: { bg: 'bg-ink-800 text-gray-400 border border-line', text: 'text-gray-400', dot: 'bg-gray-500' },
  medium: { bg: 'bg-gold/10 text-gold', text: 'text-gold', dot: 'bg-gold' },
  high: { bg: 'bg-coral/10 text-coral', text: 'text-coral', dot: 'bg-coral' },
  urgent: { bg: 'bg-coral/10 text-coral font-bold', text: 'text-coral', dot: 'bg-coral' },
};

export default function TaskCard({ task, onClick }) {
  const p = PRIORITIES[task.priority] || PRIORITIES.medium;

  return (
    <div onClick={() => onClick(task)}
      className="bg-ink-900 p-3.5 border border-line hover:border-gold/30 hover:shadow-[0_2px_8px_rgba(212,175,55,0.08)] cursor-pointer transition-all duration-200 group rounded-xl">
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="text-[13px] font-medium text-white leading-snug group-hover:text-gray-100">
          {task.title}
        </h4>
        <span className={`${p.bg} ${p.text} px-1.5 py-0.5 rounded-md text-[10px] font-semibold shrink-0 flex items-center gap-1`}>
          <span className={`w-1.5 h-1.5 rounded-full ${p.dot}`} />
          {task.priority}
        </span>
      </div>

      {task.description && (
        <p className="text-xs text-gray-400 line-clamp-2 mb-2.5 leading-relaxed">{task.description}</p>
      )}

      <div className="flex items-center justify-between mt-1">
        {task.assignee ? (
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 bg-ink-800 border border-line flex items-center justify-center text-[9px] font-semibold text-gold rounded-full">
              {task.assignee.name?.[0]?.toUpperCase()}
            </div>
            <span className="text-[11px] text-gray-400 font-medium">{task.assignee.name}</span>
          </div>
        ) : (
          <span className="text-[11px] text-gray-500 italic">Unassigned</span>
        )}

        {task.comments?.length > 0 && (
          <div className="flex items-center gap-1 text-gray-400">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span className="text-[11px]">{task.comments.length}</span>
          </div>
        )}
      </div>

      {task.dueDate && (
        <div className="mt-2 pt-2 border-t border-line">
          <span className="text-[10px] text-gray-500 font-medium">
            Due {new Date(task.dueDate).toLocaleDateString()}
          </span>
        </div>
      )}
    </div>
  );
}
