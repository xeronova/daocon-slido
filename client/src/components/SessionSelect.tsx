import type { Session } from '../types';

interface SessionSelectProps {
  sessions: Session[];
  activeSessionId: string | null;
  selectedSessionId: string;
  onSelect: (sessionId: string) => void;
}

export function SessionSelect({
  sessions,
  activeSessionId,
  selectedSessionId,
  onSelect,
}: SessionSelectProps) {
  return (
    <div className="w-full">
      <label className="block text-gray-400 text-sm mb-2">세션 선택</label>
      <select
        value={selectedSessionId}
        onChange={(e) => onSelect(e.target.value)}
        className="bg-navy-800 text-white border border-gray-700 rounded-lg px-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-gold-400"
      >
        {sessions.map((session) => (
          <option key={session.id} value={session.id}>
            {session.title}
            {session.id === activeSessionId ? ' (현재)' : ''}
          </option>
        ))}
      </select>
    </div>
  );
}
