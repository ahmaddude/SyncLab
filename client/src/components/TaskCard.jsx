import { useState } from 'react';

const PRIORITIES = {
  low: 'bg-gray-100 text-gray-600',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-orange-100 text-orange-700',
  urgent: 'bg-red-100 text-red-700',
};

export default function TaskCard({ task, onClick }) {
  return (
    <div
      onClick={() => onClick(task)}
      className="bg-white p-3 rounded-lg border border-gray-200 hover:border-primary-300 hover:shadow-sm cursor-pointer transition-all group"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="text-sm font-medium text-gray-900 leading-snug">{task.title}</h4>
        <span className={`px-1.5 py-0.5 text-[10px] rounded font-medium shrink-0 ${PRIORITIES[task.priority]}`}>
          {task.priority}
        </span>
      </div>

      {task.description && (
        <p className="text-xs text-gray-500 line-clamp-2 mb-2">{task.description}</p>
      )}

      <div className="flex items-center justify-between mt-2">
        {task.assignee ? (
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-[10px] font-medium">
              {task.assignee.name?.[0]?.toUpperCase()}
            </div>
            <span className="text-[11px] text-gray-500">{task.assignee.name}</span>
          </div>
        ) : (
          <span className="text-[11px] text-gray-400">Unassigned</span>
        )}

        {task.comments?.length > 0 && (
          <span className="text-[11px] text-gray-400">
            💬 {task.comments.length}
          </span>
        )}
      </div>

      {task.dueDate && (
        <div className="mt-2">
          <span className="text-[10px] text-gray-400">
            Due {new Date(task.dueDate).toLocaleDateString()}
          </span>
        </div>
      )}
    </div>
  );
}
