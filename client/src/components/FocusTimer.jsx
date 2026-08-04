import { useState, useEffect, useRef } from 'react';

function formatTime(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (n) => n.toString().padStart(2, '0');
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

export default function FocusTimer() {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    return () => clearInterval(intervalRef.current);
  }, []);

  const start = () => {
    setRunning(true);
    intervalRef.current = setInterval(() => setElapsed((e) => e + 1000), 1000);
  };

  const pause = () => {
    setRunning(false);
    clearInterval(intervalRef.current);
  };

  const reset = () => {
    setRunning(false);
    clearInterval(intervalRef.current);
    setElapsed(0);
  };

  return (
    <div className="bg-ink-850 border border-line rounded-lg p-5 relative overflow-hidden glow-gold">
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gold" />
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white font-heading flex items-center gap-2">
          <svg className="w-4 h-4 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Focus Timer
        </h3>
        <span className="relative flex h-2 w-2">
          <span className={`absolute inline-flex h-full w-full rounded-full bg-gold opacity-75 ${running ? 'animate-ping' : ''}`} />
          <span className={`relative inline-flex rounded-full h-2 w-2 ${running ? 'bg-gold' : 'bg-gray-500'}`} />
        </span>
      </div>

      <p className="text-[34px] leading-none font-heading tracking-tight text-gold tabular-nums text-center py-4">
        {formatTime(elapsed)}
      </p>

      <div className="flex gap-2 mt-2">
        {running ? (
          <button
            onClick={pause}
            className="flex-1 px-4 py-2.5 text-sm font-semibold text-ink-950 bg-gold hover:bg-gold-hover rounded-lg transition-colors"
          >
            Pause
          </button>
        ) : (
          <button
            onClick={start}
            className="flex-1 px-4 py-2.5 text-sm font-semibold text-ink-950 bg-gold hover:bg-gold-hover rounded-lg transition-colors"
          >
            Start
          </button>
        )}
        <button
          onClick={reset}
          className="px-4 py-2.5 text-sm font-medium text-gray-300 bg-ink-900 border border-line hover:border-gold/30 hover:text-white rounded-lg transition-colors"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
