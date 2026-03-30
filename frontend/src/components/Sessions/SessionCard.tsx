import { format } from 'date-fns';
import { MessageSquare, ChevronRight } from 'lucide-react';
import { Session } from '../../types';

interface SessionCardProps {
  session: Session;
  onClick: () => void;
}

export function SessionCard({ session, onClick }: SessionCardProps) {
  const date = new Date(session.time_created);
  
  return (
    <button
      onClick={onClick}
      className="w-full text-left p-4 bg-slate-800 rounded-lg border border-slate-700 hover:border-indigo-500/50 transition-all group"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-slate-100 font-medium truncate group-hover:text-indigo-400 transition-colors">
            {session.title || 'Untitled Session'}
          </h3>
          <p className="text-sm text-slate-400 mt-1 truncate" title={session.directory}>
            {session.directory}
          </p>
          <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
            {session.project_name && (
              <span className="text-indigo-400">{session.project_name}</span>
            )}
            <span>{format(date, 'MMM d, yyyy HH:mm')}</span>
            {session.message_count !== undefined && (
              <span className="flex items-center gap-1">
                <MessageSquare className="w-3 h-3" />
                {session.message_count}
              </span>
            )}
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-indigo-400 transition-colors flex-shrink-0" />
      </div>
    </button>
  );
}