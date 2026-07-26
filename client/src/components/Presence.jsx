import { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';

export default function Presence({ orgId }) {
  const { socket } = useSocket();
  const [onlineMembers, setOnlineMembers] = useState([]);

  useEffect(() => {
    if (!socket || !orgId) return;
    const handlePresence = (members) => setOnlineMembers(members);
    socket.on(`presence:${orgId}`, handlePresence);
    return () => socket.off(`presence:${orgId}`, handlePresence);
  }, [socket, orgId]);

  if (onlineMembers.length === 0) return null;

  return (
    <div className="flex items-center gap-3 py-3 px-4 bg-neutral-900 border border-neutral-800 rounded-xl">
      <div className="flex -space-x-2">
        {onlineMembers.slice(0, 6).map((m) => (
          <div key={m.userId} className="relative" title={m.name}>
            <div className="w-8 h-8 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-[11px] font-semibold text-neutral-300">
              {m.name?.[0]?.toUpperCase() || '?'}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-neutral-900" />
          </div>
        ))}
      </div>
      {onlineMembers.length > 6 && (
        <span className="text-xs text-neutral-500 font-medium">+{onlineMembers.length - 6} more</span>
      )}
      <div className="flex items-center gap-1.5 ml-1">
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-xs text-emerald-400 font-semibold">
          {onlineMembers.length} online
        </span>
      </div>
    </div>
  );
}
