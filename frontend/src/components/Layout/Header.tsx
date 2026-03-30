import { Code2, AppWindow } from 'lucide-react';
import { DataSource } from '../../types';

interface HeaderProps {
  dataSource: DataSource;
  onDataSourceChange: (source: DataSource) => void;
}

export function Header({ dataSource, onDataSourceChange }: HeaderProps) {
  return (
    <header className="h-14 bg-[#1e293b] border-b border-slate-700 flex items-center justify-between px-4">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center">
          <Code2 className="w-5 h-5 text-white" />
        </div>
        <h1 className="text-lg font-semibold text-slate-50">Session Manager</h1>
      </div>
      
      <div className="flex items-center gap-1 bg-slate-800 rounded-lg p-1">
        <button
          onClick={() => onDataSourceChange('kilo')}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            dataSource === 'kilo' 
              ? 'bg-indigo-500 text-white' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <Code2 className="w-4 h-4" />
            Kilo Code
          </span>
        </button>
        <button
          onClick={() => onDataSourceChange('opencode')}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            dataSource === 'opencode' 
              ? 'bg-violet-500 text-white' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <AppWindow className="w-4 h-4" />
            OpenCode
          </span>
        </button>
      </div>
    </header>
  );
}