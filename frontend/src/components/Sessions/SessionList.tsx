import { SessionCard } from './SessionCard';
import { Session } from '../types';

interface SessionListProps {
  sessions: Session[];
  loading: boolean;
  onSelectSession: (id: number) => void;
}

export function SessionList({ sessions, loading, onSelectSession }: SessionListProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="text-center py-12 text-slate-400">
        <p>No sessions found</p>
      </div>
    );
  }

  return (
    <div className="grid gap-3">
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