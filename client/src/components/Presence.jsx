import { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';

export default function Presence({ orgId }) {
  const { socket } = useSocket();
  const [onlineMembers, setOnlineMembers] = useState([]);

  useEffect(() => {
    if (!socket || !orgId) return;

    const handlePresence = (members) => {
      setOnlineMembers(members);
    };

    socket.on(`presence:${orgId}`, handlePresence);

    return () => {
      socket.off(`presence:${orgId}`, handlePresence);
    };
  }, [socket, orgId]);

  if (onlineMembers.length === 0) return null;

  return (
    <div className="flex items-center gap-2">
      <div className="flex -space-x-2">
        {onlineMembers.slice(0, 5).map((m) => (
          <div
            key={m.userId}
            className="relative"
            title={m.name}
          >
            <div className="w-7 h-7 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-[10px] font-medium border-2 border-white">
              {m.name?.[0]?.toUpperCase() || '?'}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white" />
          </div>
        ))}
      </div>
      {onlineMembers.length > 5 && (
        <span className="text-xs text-gray-500">+{onlineMembers.length - 5} more</span>
      )}
      <span className="text-xs text-green-600 font-medium">
        {onlineMembers.length} online
      </span>
    </div>
  );
}
