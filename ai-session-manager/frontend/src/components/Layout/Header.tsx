import { Code2, Database, Sparkles } from 'lucide-react';
import type { DataSource } from '../../types';

interface HeaderProps {
  dataSource: DataSource;
  onDataSourceChange: (source: DataSource) => void;
}

export function Header({ dataSource, onDataSourceChange }: HeaderProps) {
  return (
    <header className="glass h-16 flex items-center justify-between px-6 border-b border-indigo-500/10">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold gradient-text">AI Session Manager</h1>
          <p className="text-xs text-slate-500">Kilo Code & OpenCode 会话管理</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="source-toggle">
          <button
            className={`source-btn ${dataSource === 'kilo' ? 'source-btn-active' : ''}`}
            onClick={() => onDataSourceChange('kilo')}
          >
            <span className="flex items-center gap-1.5">
              <Code2 className="w-3.5 h-3.5" />
              Kilo Code
            </span>
          </button>
          <button
            className={`source-btn ${dataSource === 'opencode' ? 'source-btn-active' : ''}`}
            onClick={() => onDataSourceChange('opencode')}
          >
            <span className="flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5" />
              OpenCode
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
