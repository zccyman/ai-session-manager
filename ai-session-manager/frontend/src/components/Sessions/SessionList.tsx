import { SessionCard } from './SessionCard';
import type { Session } from '../../types';

interface SessionListProps {
  sessions: Session[];
  loading: boolean;
  onSelectSession: (id: string) => void;
}

export function SessionList({ sessions, loading, onSelectSession }: SessionListProps) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <div className="w-10 h-10 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm text-slate-500">Loading sessions...</span>
      </div>
    );
  }

  if (!sessions || sessions.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-4xl mb-3">📭</div>
        <p className="text-slate-500">No sessions found</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {sessions.map(session => (
        <SessionCard
          key={session.id}
          session={session}
          onClick={() => onSelectSession(session.id)}
        />
      ))}
    </div>
  );
}
