export default function ConfirmDialog({ open, title, message, confirmLabel = 'Delete', onConfirm, onCancel }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60]" onClick={onCancel}>
      <div className="bg-neutral-950 border border-neutral-800 rounded-2xl shadow-2xl w-full max-w-sm mx-4 animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <div className="w-10 h-10 rounded-xl bg-red-950/40 border border-red-900/60 flex items-center justify-center mb-4">
            <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-neutral-100 font-['Space_Grotesk',sans-serif] mb-1">{title}</h3>
          <p className="text-sm text-neutral-400 leading-relaxed">{message}</p>
        </div>
        <div className="px-6 pb-6 flex items-center justify-end gap-3">
          <button onClick={onCancel}
            className="px-4 py-2 rounded-xl text-sm font-medium text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm}
            className="px-5 py-2 rounded-xl text-sm font-medium text-white bg-red-600 hover:bg-red-500 transition-colors">
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
