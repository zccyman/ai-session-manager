import { FileText, MessageSquare } from 'lucide-react';
import { SearchResult } from '../../types';

interface SearchResultsProps {
  results: SearchResult[];
  query: string;
  loading: boolean;
  onSelectSession: (sessionId: number) => void;
}

function highlightText(text: string, query: string): string {
  if (!query.trim()) return text;
  
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.replace(regex, '<mark class="bg-indigo-500/40 text-indigo-200 px-0.5 rounded">$1</mark>');
}

export function SearchResults({ results, query, loading, onSelectSession }: SearchResultsProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!query.trim()) {
    return (
      <div className="text-center py-12 text-slate-400">
        <p>Enter a search term to find sessions</p>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-12 text-slate-400">
        <p>No results found for "{query}"</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-400 mb-4">{results.length} results found</p>
      {results.map((result, index) => (
        <button
          key={`${result.session_id}-${result.message_id}-${index}`}
          onClick={() => onSelectSession(result.session_id)}
          className="w-full text-left p-4 bg-slate-800 rounded-lg border border-slate-700 hover:border-indigo-500/50 transition-all"
        >
          <div className="flex items-start gap-3">
            <FileText className="w-5 h-5 text-slate-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <h3 
                className="text-slate-100 font-medium"
                dangerouslySetInnerHTML={{ __html: highlightText(result.session_title, query) }}
              />
              <p 
                className="text-sm text-slate-400 mt-1 line-clamp-2"
                dangerouslySetInnerHTML={{ __html: highlightText(result.snippet, query) }}
              />
              <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                <MessageSquare className="w-3 h-3" />
                Message #{result.message_id}
              </div>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}