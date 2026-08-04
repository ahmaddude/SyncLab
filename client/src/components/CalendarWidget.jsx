import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const WEEKDAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAY_LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

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
  const [selectedKey, setSelectedKey] = useState(todayKey);

  const days = buildCalendar(year, month);

  const dueMap = useMemo(() => {
    const m = {};
    tasks.forEach((t) => {
      if (!t.dueDate) return;
      const key = dateKey(new Date(t.dueDate));
      if (!m[key]) m[key] = [];
      m[key].push(t);
    });
    return m;
  }, [tasks]);

  const prev = () => { if (month === 0) { setYear((y) => y - 1); setMonth(11); } else setMonth((m) => m - 1); };
  const next = () => { if (month === 11) { setYear((y) => y + 1); setMonth(0); } else setMonth((m) => m + 1); };

  const selectedDate = new Date(`${selectedKey}T00:00:00`);
  const selectedTasks = dueMap[selectedKey] || [];

  return (
    <div className="bg-ink-850 border border-line rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white">Integrated Calendar</h3>
        <div className="flex items-center gap-1">
          <button onClick={prev} className="w-6 h-6 rounded-md border border-line text-gray-400 hover:text-white hover:bg-ink-800 flex items-center justify-center transition-colors">
            <i className="fa-solid fa-chevron-left text-[10px]"></i>
          </button>
          <button onClick={next} className="w-6 h-6 rounded-md border border-line text-gray-400 hover:text-white hover:bg-ink-800 flex items-center justify-center transition-colors">
            <i className="fa-solid fa-chevron-right text-[10px]"></i>
          </button>
        </div>
      </div>

      <div className="text-center mb-4">
        <p className="text-sm font-medium text-white">{MONTH_NAMES[month]} {year}</p>
        <p className="text-xs text-gray-500">
          {WEEKDAY_NAMES[selectedDate.getDay()]}, {selectedDate.getDate()} {MONTH_NAMES[selectedDate.getMonth()].slice(0, 3)}
        </p>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {DAY_LETTERS.map((d, i) => (
          <span key={i} className="text-[10px] text-gray-500">{d}</span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs">
        {days.map((day, i) => {
          if (day === null) return <span key={`e${i}`} className="py-1.5" />;
          const key = `${year}-${pad(month + 1)}-${pad(day)}`;
          const isToday = key === todayKey;
          const isSelected = key === selectedKey;
          const hasEvents = !!dueMap[key]?.length;
          const base = isSelected ? 'cal-day active py-1.5 rounded-md text-white font-medium relative' : `cal-day ${hasEvents ? 'has-event ' : ''}py-1.5 ${hasEvents ? 'text-gray-400' : 'text-gray-400'} relative`;
          return (
            <button
              key={key}
              onClick={() => setSelectedKey(isSelected ? todayKey : key)}
              className={`${base} ${hasEvents && !isSelected ? 'text-white' : ''} hover:bg-ink-800/60 rounded-md transition-colors cursor-pointer`}
            >
              {day}
            </button>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-line/60 space-y-2">
        {selectedTasks.length > 0 ? (
          selectedTasks.map((task) => (
            <Link
              key={task._id}
              to={`/projects/${task.project?._id || ''}`}
              className="flex items-center gap-2.5 text-xs text-gray-300 hover:text-gold transition-colors"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-gold"></span>
              {task.title}
            </Link>
          ))
        ) : (
          <div className="flex items-center gap-2.5 text-xs text-gray-500">
            <span className="w-1.5 h-1.5 rounded-full bg-gold/40"></span>
            No events scheduled
          </div>
        )}
      </div>
    </div>
  );
}
