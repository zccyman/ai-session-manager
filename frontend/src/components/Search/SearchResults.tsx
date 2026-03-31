import { FileText } from 'lucide-react';
import type { Session } from '../../types';

interface SearchResultsProps {
  results: Session[];
  query: string;
  loading: boolean;
  onSelectSession: (id: string) => void;
}

export function SearchResults({ results, query, loading, onSelectSession }: SearchResultsProps) {
  if (!query) return null;
  if (loading) return <div className="text-center py-8 text-[#8F959E] text-sm">搜索中...</div>;
  if (results.length === 0) return <div className="text-center py-8 text-[#8F959E] text-sm">没有找到匹配的会话</div>;

  return (
    <div className="space-y-1">
      <p className="text-xs text-[#8F959E] mb-3">找到 {results.length} 个会话</p>
      {results.map(session => (
        <button
          key={session.id}
          onClick={() => onSelectSession(session.id)}
          className="w-full text-left p-3 rounded-lg hover:bg-[#F0F1F2] transition-colors flex items-start gap-3"
        >
          <FileText className="w-4 h-4 text-[#3370FF] mt-0.5 flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-medium text-[#1F2329] truncate">{session.title || '无标题'}</p>
            <p className="text-xs text-[#8F959E] mt-0.5">{session.project_name || ''}</p>
          </div>
        </button>
      ))}
    </div>
  );
}
