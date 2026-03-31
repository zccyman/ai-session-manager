import { useState } from 'react';
import { Folder, MessageSquare, BarChart3, Search, Home, Zap } from 'lucide-react';
import type { Project } from '../../types';

interface SidebarProps {
  projects: Project[];
  selectedProject: string | null;
  onSelectProject: (id: string | null) => void;
  currentPage: string;
  onNavigate: (page: string) => void;
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'sessions', label: 'Sessions', icon: MessageSquare },
  { id: 'search', label: 'Search', icon: Search },
  { id: 'stats', label: 'Analytics', icon: BarChart3 },
];

export function Sidebar({ projects, selectedProject, onSelectProject, currentPage, onNavigate }: SidebarProps) {
  const [projectsOpen, setProjectsOpen] = useState(true);

  return (
    <aside className="w-64 glass border-r border-indigo-500/10 flex flex-col h-full">
      {/* Navigation */}
      <nav className="p-4 space-y-1">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
              currentPage === item.id
                ? 'bg-indigo-500/20 text-indigo-300 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </button>
        ))}
      </nav>

      {/* Projects */}
      <div className="flex-1 overflow-auto px-4 pb-4">
        <button
          onClick={() => setProjectsOpen(!projectsOpen)}
          className="flex items-center justify-between w-full py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider"
        >
          <span>Projects</span>
          <span className="text-slate-600">{projects.length}</span>
        </button>

        {projectsOpen && (
          <div className="space-y-0.5">
            <button
              onClick={() => onSelectProject(null)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                selectedProject === null
                  ? 'bg-indigo-500/20 text-indigo-300'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              All Projects
            </button>
            {projects.filter(p => p.name && p.name !== 'Unknown').map(project => (
              <button
                key={project.id}
                onClick={() => onSelectProject(project.id)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                  selectedProject === project.id
                    ? 'bg-indigo-500/20 text-indigo-300'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                <Folder className="w-3.5 h-3.5 text-indigo-400" />
                <span className="truncate">{project.name}</span>
                <span className="ml-auto text-xs text-slate-600">{project.session_count || 0}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
