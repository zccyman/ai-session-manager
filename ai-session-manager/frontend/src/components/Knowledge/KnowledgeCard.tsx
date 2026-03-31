import { Lightbulb, Loader2, AlertCircle } from 'lucide-react';
import { KnowledgeItem } from '../../types';

interface KnowledgeCardProps {
  items: KnowledgeItem[];
  loading: boolean;
  error: string | null;
  onExtract: () => void;
}

export function KnowledgeCard({ items, loading, error, onExtract }: KnowledgeCardProps) {
  const categoryIcons: Record<string, string> = {
    'technical_solution': '💻',
    'decision': '🎯',
    'lesson_learned': '💡',
    'key_file': '📄',
    'default': '📝',
  };

  if (error) {
    return (
      <div className="bg-slate-800 rounded-lg border border-red-500/30 p-4">
        <div className="flex items-center gap-2 text-red-400">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-indigo-400" />
          <span className="text-sm font-medium text-slate-200">Knowledge</span>
        </div>
        <button
          onClick={onExtract}
          disabled={loading}
          className="px-3 py-1 text-xs font-medium bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 rounded transition-colors"
        >
          {loading ? (
            <span className="flex items-center gap-1">
              <Loader2 className="w-3 h-3 animate-spin" />
              Extracting...
            </span>
          ) : (
            'Extract'
          )}
        </button>
      </div>
      
      <div className="p-4">
        {items.length === 0 ? (
          <p className="text-sm text-slate-400 text-center">No knowledge extracted yet</p>
        ) : (
          <div className="space-y-3">
            {items.map((item, index) => (
              <div key={item.id || index} className="bg-slate-900/50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-base">{categoryIcons[item.category] || categoryIcons.default}</span>
                  <span className="text-xs font-medium text-indigo-400 capitalize">
                    {item.category.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="text-sm text-slate-300 whitespace-pre-wrap">{item.content}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}