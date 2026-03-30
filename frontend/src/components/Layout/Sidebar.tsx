import { useState } from 'react';
import { Folder, FileText, BarChart3, Search, Home, ChevronRight } from 'lucide-react';
import { Project } from '../../types';

interface SidebarProps {
  projects: Project[];
  selectedProject: number | null;
  onSelectProject: (id: number | null) => void;
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function Sidebar({ projects, selectedProject, onSelectProject, currentPage, onNavigate }: SidebarProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>(['projects']);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'sessions', label: 'Sessions', icon: FileText },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'stats', label: 'Statistics', icon: BarChart3 },
  ];

  return (
    <aside className="w-60 bg-[#1e293b] border-r border-slate-700 flex flex-col">
      <nav className="p-3">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              currentPage === item.id 
                ? 'bg-indigo-500/20 text-indigo-400' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
            }`}
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="border-t border-slate-700 mt-2 pt-2">
        <button
          onClick={() => toggleSection('projects')}
          className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-slate-400 hover:text-slate-200"
        >
          <span className="flex items-center gap-2">
            <Folder className="w-4 h-4" />
            Projects
          </span>
          <ChevronRight className={`w-4 h-4 transition-transform ${expandedSections.includes('projects') ? 'rotate-90' : ''}`} />
        </button>
        
        {expandedSections.includes('projects') && (
          <div className="px-2 pb-2">
            <button
              onClick={() => onSelectProject(null)}
              className={`w-full text-left px-3 py-1.5 rounded text-sm transition-colors ${
                selectedProject === null 
                  ? 'bg-indigo-500/20 text-indigo-400' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
              }`}
            >
              All Projects
            </button>
            {projects.map(project => (
              <button
                key={project.id}
                onClick={() => onSelectProject(project.id)}
                className={`w-full text-left px-3 py-1.5 rounded text-sm truncate transition-colors ${
                  selectedProject === project.id 
                    ? 'bg-indigo-500/20 text-indigo-400' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                }`}
                title={project.directory}
              >
                {project.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}