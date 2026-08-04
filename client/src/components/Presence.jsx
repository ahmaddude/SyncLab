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
    <div className="flex items-center gap-3 py-3 px-4 bg-ink-850 border border-line rounded-xl">
      <div className="flex -space-x-2">
        {onlineMembers.slice(0, 6).map((m) => (
          <div key={m.userId} className="relative" title={m.name}>
            <div className="w-8 h-8 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center text-[11px] font-semibold text-gold">
              {m.name?.[0]?.toUpperCase() || '?'}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald rounded-full border-2 border-ink-900" />
          </div>
        ))}
      </div>
      {onlineMembers.length > 6 && (
        <span className="text-xs text-gray-500 font-medium">+{onlineMembers.length - 6} more</span>
      )}
      <div className="flex items-center gap-1.5 ml-1">
        <div className="w-2 h-2 rounded-full bg-emerald animate-pulse" />
        <span className="text-xs text-emerald font-semibold">
          {onlineMembers.length} online
        </span>
      </div>
    </div>
  );
}
