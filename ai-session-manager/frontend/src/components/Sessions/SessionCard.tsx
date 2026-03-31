import { format } from 'date-fns';
import { MessageSquare, Clock, Tag } from 'lucide-react';
import type { Session } from '../../types';

interface SessionCardProps {
  session: Session;
  onClick: () => void;
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  if (diff < 60000) return 'just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
  return format(new Date(ts), 'MMM d');
}

export function SessionCard({ session, onClick }: SessionCardProps) {
  const projectName = session.project_name || session.directory?.split('/').pop() || '';

  return (
    <button
      onClick={onClick}
      className="card w-full text-left p-4 flex items-start gap-3"
    >
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/30 to-purple-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
        <MessageSquare className="w-5 h-5 text-indigo-300" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold text-slate-100 truncate">
          {session.title || 'Untitled Session'}
        </h3>
        <div className="flex items-center gap-3 mt-1.5">
          {projectName && (
            <span className="badge badge-purple">
              <Tag className="w-3 h-3 mr-1" />
              {projectName}
            </span>
          )}
          <span className="flex items-center gap-1 text-xs text-slate-500">
            <Clock className="w-3 h-3" />
            {timeAgo(session.time_created)}
          </span>
          <span className="text-xs text-slate-600">
            {session.message_count || 0} msgs
          </span>
        </div>
      </div>
    </button>
  );
}
