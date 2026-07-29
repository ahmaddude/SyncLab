import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function pad(n) { return String(n).padStart(2, '0'); }
function dateKey(d) { return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; }

function buildCalendar(year, month) {
  const first = new Date(year, month, 1).getDay();
  const total = new Date(year, month + 1, 0).getDate();
  const days = [];
  for (let i = 0; i < first; i++) days.push(null);
  for (let d = 1; d <= total; d++) days.push(d);
  return days;
}

export default function CalendarWidget({ tasks = [] }) {
  const today = new Date();
  const todayKey = dateKey(today);
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedKey, setSelectedKey] = useState(null);

  const days = buildCalendar(year, month);

  const dueMap = useMemo(() => {
    const m = {};
    tasks.forEach(t => {
      if (!t.dueDate) return;
      const key = dateKey(new Date(t.dueDate));
      if (!m[key]) m[key] = [];
      m[key].push(t);
    });
    return m;
  }, [tasks]);

  const prev = () => { if (month === 0) { setYear(y => y - 1); setMonth(11); } else setMonth(m => m - 1); };
  const next = () => { if (month === 11) { setYear(y => y + 1); setMonth(0); } else setMonth(m => m + 1); };

  const selectedTasks = selectedKey ? dueMap[selectedKey] || [] : [];

  return (
    <div className="bg-brand-800 border border-brand-700">
      <div className="flex items-center justify-between px-4 py-3 border-b border-brand-700">
        <button onClick={prev} className="p-1 text-brand-400 hover:text-gold-400 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <span className="text-sm font-semibold text-gold-400 font-heading">{MONTH_NAMES[month]} {year}</span>
        <button onClick={next} className="p-1 text-brand-400 hover:text-gold-400 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>

      <div className="grid grid-cols-7 text-center text-[11px] font-semibold text-brand-400 uppercase tracking-wider py-2.5 border-b border-brand-700">
        {DAY_NAMES.map(d => <div key={d}>{d}</div>)}
      </div>

      <div className="grid grid-cols-7 text-center pb-1">
        {days.map((day, i) => {
          if (day === null) return <div key={`e${i}`} />;
          const key = `${year}-${pad(month + 1)}-${pad(day)}`;
          const isToday = key === todayKey;
          const hasTasks = !!dueMap[key]?.length;
          const isSelected = key === selectedKey;
          return (
            <button
              key={key}
              onClick={() => setSelectedKey(isSelected ? null : key)}
              className={`relative py-2.5 text-sm transition-colors ${
                isSelected ? 'bg-gold-400 text-brand-950 font-semibold' :
                isToday ? 'text-gold-400 font-semibold' :
                hasTasks ? 'text-white font-medium' : 'text-brand-300 hover:text-gold-400 hover:bg-brand-700'
              } ${hasTasks && !isSelected ? 'bg-brand-700/60' : ''}`}
            >
              {day}
              {hasTasks && !isSelected && (
                <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center w-4 h-4 text-[9px] font-bold text-brand-950 bg-gold-400 rounded-full">
                  {dueMap[`${year}-${pad(month + 1)}-${pad(day)}`].length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {selectedKey && (
        <div className="border-t border-brand-700">
          {selectedTasks.length > 0 ? (
            <div className="px-3 py-2 max-h-32 overflow-y-auto space-y-1">
              {selectedTasks.map(task => (
                <Link
                  key={task._id}
                  to={`/projects/${task.project?._id || ''}`}
                  className="flex items-center gap-1.5 text-xs text-brand-300 hover:text-gold-400 truncate transition-colors"
                >
                  <span className={`inline-block w-1.5 h-1.5 rounded-full shrink-0 ${
                    task.priority === 'urgent' ? 'bg-red-400' :
                    task.priority === 'high' ? 'bg-amber-400' :
                    task.priority === 'medium' ? 'bg-blue-400' : 'bg-brand-400'
                  }`} />
                  <span className="truncate">{task.title}</span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="px-3 py-2 text-xs text-brand-500 text-center">
              No tasks due on this date
            </div>
          )}
        </div>
      )}
    </div>
  );
}
